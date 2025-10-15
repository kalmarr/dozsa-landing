# Gyors Javitasi Utmutato - Kritikus Biztonsagi Problemak

**FONTOS:** Ezeket a lepeseket AZONNAL el kell vegezni!

---

## 1. AZONNALI INTEZKEDESEK (MOST!)

### 1.1 reCAPTCHA Kulcsok Csereje

```bash
# 1. Menj a Google reCAPTCHA Admin Console-ra
# https://www.google.com/recaptcha/admin

# 2. TOROELD a regi kulcsparat (6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm)

# 3. Generaalj UJ v2 Invisible kulcsparat

# 4. Jegyezd fel:
# Site Key: _________________________
# Secret Key: _______________________
```

### 1.2 .env Fajl Letrehozasa

```bash
cd /home/kalmarr/projects/dozsa-landing

# Maskold a .env.example fajlt
cp .env.example .env

# Szerkeszd a .env fajlt:
nano .env
```

.env tartalma:
```bash
# FTP Configuration (add meg a valos adatokat!)
FTP_HOST=your-ftp-host.com
FTP_USER=your-ftp-username
FTP_PASS=your-strong-password
FTP_REMOTE_PATH=/public_html
FTP_SECURE=explicit
FTP_PASSIVE=true

# reCAPTCHA Keys (UJ kulcsok!)
RECAPTCHA_SITE_KEY=your_new_site_key_here
RECAPTCHA_SECRET_KEY=your_new_secret_key_here

# Email Configuration
ADMIN_EMAIL=info@dozsaszeged.hu
FROM_EMAIL=info@dozsaszeged.hu

# Environment
APP_ENV=production
```

**ELLENORIZD:** .env SOHA ne kerueljoen a git-be!
```bash
git status
# .env NEM lehet a listaban!
```

---

## 2. PHP FAJLOK JAVITASA

### 2.1 recaptcha-validator.php Javitasa

Fajl: `/home/kalmarr/projects/dozsa-landing/src/php/recaptcha-validator.php`

**TELJES TARTALMAT CSERELD:**

```php
<?php
/**
 * Google reCAPTCHA v2 Validator
 * Dozsa Apartman Szeged
 */

// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env file not found at: ' . $path);
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!array_key_exists($name, $_ENV)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }
}

// Load .env file
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    loadEnv($envPath);
}

/**
 * Verify reCAPTCHA v2 token
 *
 * @param string $token The reCAPTCHA token from the client
 * @param string $secretKey The reCAPTCHA secret key (optional, defaults to env)
 * @return array Result with 'success' and 'message' keys
 */
function verifyRecaptcha($token, $secretKey = null) {
    // Get secret key from environment or parameter
    if ($secretKey === null) {
        $secretKey = getenv('RECAPTCHA_SECRET_KEY');
        if (!$secretKey) {
            error_log('SECURITY ERROR: RECAPTCHA_SECRET_KEY not set in environment');
            return [
                'success' => false,
                'message' => 'reCAPTCHA configuration error'
            ];
        }
    }

    // Check if token is empty
    if (empty($token)) {
        return [
            'success' => false,
            'message' => 'reCAPTCHA token hianzik'
        ];
    }

    // Prepare verification request
    $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $secretKey,
        'response' => $token,
        'remoteip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1'
    ];

    // Make POST request with timeout and SSL verification
    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
            'timeout' => 10,
            'ignore_errors' => true
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ]
    ];

    $context  = stream_context_create($options);
    $result = @file_get_contents($verifyUrl, false, $context);

    // Check if request failed
    if ($result === false) {
        error_log('reCAPTCHA API error: Failed to connect');
        return [
            'success' => false,
            'message' => 'Failed to verify reCAPTCHA'
        ];
    }

    // Parse response
    $response = json_decode($result, true);

    // Check if verification was successful
    if (isset($response['success']) && $response['success'] === true) {
        // Additional security: Check hostname (optional but recommended)
        if (isset($response['hostname'])) {
            $allowedHosts = ['dozsa-apartman-szeged.hu', 'www.dozsa-apartman-szeged.hu', 'localhost'];
            if (!in_array($response['hostname'], $allowedHosts)) {
                error_log('reCAPTCHA hostname mismatch: ' . $response['hostname']);
                return [
                    'success' => false,
                    'message' => 'reCAPTCHA hostname verification failed'
                ];
            }
        }

        return [
            'success' => true,
            'message' => 'reCAPTCHA verification successful'
        ];
    } else {
        $errorCodes = isset($response['error-codes']) ? implode(', ', $response['error-codes']) : 'Unknown error';
        error_log('reCAPTCHA validation failed: ' . $errorCodes);
        return [
            'success' => false,
            'message' => 'reCAPTCHA validation failed'
        ];
    }
}
```

### 2.2 config.php Kiegeszitese

Fajl: `/home/kalmarr/projects/dozsa-landing/src/php/config.php`

**ADJ HOZZA A FAJL VEGEHEZ:**

```php
// Booking form settings
define('CONTACT_TO_EMAIL', ADMIN_EMAIL);
define('CONTACT_FROM_EMAIL', FROM_EMAIL);
define('RATE_LIMIT_SECONDS', 60); // 60 masodperc
```

### 2.3 Email Header Injection Vedelem

**ADJ HOZZA MINDEN PHP FAJLHOZ** ahol email header van:

```php
/**
 * Sanitize email header to prevent header injection
 */
function sanitizeEmailHeader($input) {
    // Remove any CR/LF characters
    $input = str_replace(["\r", "\n", "%0a", "%0d"], '', $input);
    // Remove any additional dangerous characters
    $input = preg_replace('/[^\x20-\x7E]/', '', $input);
    return trim($input);
}
```

Es hasznald minden header-ben:

```php
// PELDAK:
$headers[] = 'From: ' . sanitizeEmailHeader(FROM_NAME) . ' <' . sanitizeEmailHeader(FROM_EMAIL) . '>';
$headers[] = 'Reply-To: ' . sanitizeEmailHeader($name) . ' <' . sanitizeEmailHeader($email) . '>';
```

---

## 3. DEBUG FAJLOK TORLESE

```bash
cd /home/kalmarr/projects/dozsa-landing

# Torold a debug fajlokat
rm src/php/test-contact.php
rm src/debug-recaptcha.html

# Commitold a valtozasokat
git add -u
git commit -m "SECURITY: Remove debug files"
```

---

## 4. .htaccess SECURITY HEADERS

Hozd letre: `/home/kalmarr/projects/dozsa-landing/src/.htaccess`

**TELJES TARTALOM:**

```apache
# Security Headers
<IfModule mod_headers.c>
    # Content Security Policy
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com; frame-src https://www.google.com; connect-src 'self' https://www.google.com https://www.google-analytics.com; object-src 'none'; base-uri 'self'; form-action 'self'"

    # X-Frame-Options - Prevent clickjacking
    Header always set X-Frame-Options "SAMEORIGIN"

    # X-Content-Type-Options - Prevent MIME sniffing
    Header always set X-Content-Type-Options "nosniff"

    # Referrer-Policy
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Permissions-Policy
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

    # X-XSS-Protection
    Header always set X-XSS-Protection "1; mode=block"

    # Remove Server header
    Header unset Server
    Header unset X-Powered-By
</IfModule>

# Deny access to sensitive files
<FilesMatch "^\.">
    Require all denied
</FilesMatch>

<FilesMatch "\.(env|git|gitignore|htaccess|md|log|sql|bak|tmp)$">
    Require all denied
</FilesMatch>

# Deny access to debug files
<FilesMatch "^(test-|debug-).*\.(php|html)$">
    Require all denied
</FilesMatch>

# Disable directory listing
Options -Indexes

# PHP Security Settings
<IfModule mod_php.c>
    php_flag display_errors Off
    php_value log_errors On
    php_flag expose_php Off
</IfModule>
```

---

## 5. GIT HISTORY TISZTITAS (VESZLYES!)

**FIGYELEM:** Ez VESZLYES muevelet! Csak akkor csinalad, ha biztos vagy benne!

```bash
cd /home/kalmarr/projects/dozsa-landing

# 1. BACKUP
git clone --mirror . ../dozsa-landing-backup.git

# 2. BFG Repo-Cleaner letoltese
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 3. Titkos kulcs torlese
echo "6LeLt-grAAAAAP2LaXGZmrHMEAqy1dckAmJV2BD5==>***REMOVED***" > replacements.txt
java -jar bfg-1.14.0.jar --replace-text replacements.txt .

# 4. Git cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (CSAK ha biztos vagy benne!)
# git push --force --all
```

**ALTERNATÍV (Egyszeruebb):**
Ha a repository meg nem lett megosztva, csak commit ujra:

```bash
git reset --soft HEAD~1
# Javits mindent
git add .
git commit -m "SECURITY: Fix critical vulnerabilities"
```

---

## 6. DOKUMENTACIO FRISSITES

### Torold vagy javitsd a RECAPTCHA_SETUP.md fajlt

```bash
# OPCIO 1: Torles
rm /home/kalmarr/projects/dozsa-landing/RECAPTCHA_SETUP.md

# OPCIO 2: Csereld a secret key reszt erre:
```

RECAPTCHA_SETUP.md modositas:
```markdown
### Secret Key (Szerver kulcs)

A secret key a `.env` fajlban van tarolva es SOHA ne keruljon a verziokezelobe!

```bash
# .env
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

Ez a kulcs **TITKOS** es **CSAK** a szerveren van tarolva.
```

---

## 7. ELLENORZO LISTA

Vezesd vegig ezt a listat:

### Kritikus (AZONNAL):
- [ ] reCAPTCHA kulcsok kicserelve Google Admin Console-ban
- [ ] Regi kulcsok torolve
- [ ] .env fajl letrehozva es kitoltve UJ kulcsokkal
- [ ] recaptcha-validator.php javitva (environment variable-bol olvas)
- [ ] config.php kiegeszitve (CONTACT_TO_EMAIL, stb.)
- [ ] Email header sanitization hozzaadva
- [ ] Debug fajlok torolve (test-contact.php, debug-recaptcha.html)
- [ ] .htaccess letrehozva security header-ekkel
- [ ] RECAPTCHA_SETUP.md torlesefrissitve
- [ ] Git commit az osszes valtozassal

### Ellenorzes:
- [ ] .env NEM a git-ben (git status)
- [ ] PHP fajlok mukodnek (teszteld local-ban)
- [ ] Email kuldes mukodik
- [ ] reCAPTCHA mukodik az UJ kulcsokkal
- [ ] Security headerek mukodnek (curl -I)

### Opcionalis (git history):
- [ ] Git history tisztitasa (BFG Repo-Cleaner)
- [ ] Force push (ha szukseges)

---

## 8. TESZT PARANCSOK

### Teszteld a PHP fajlokat:

```bash
# Syntax check
php -l /home/kalmarr/projects/dozsa-landing/src/php/recaptcha-validator.php
php -l /home/kalmarr/projects/dozsa-landing/src/php/config.php
php -l /home/kalmarr/projects/dozsa-landing/src/php/send-contact.php

# Environment variables test
php -r "echo getenv('RECAPTCHA_SECRET_KEY');"
```

### Teszteld a security headereket:

```bash
# Local test
curl -I http://localhost:8020

# Production test
curl -I https://dozsa-apartman-szeged.hu
```

Online tool:
- https://securityheaders.com/
- https://observatory.mozilla.org/

---

## 9. DEPLOY

```bash
cd /home/kalmarr/projects/dozsa-landing

# 1. Ellenorizd a valtozasokat
git status
git diff

# 2. Add hozza az osszes valtozast
git add src/php/recaptcha-validator.php
git add src/php/config.php
git add src/php/send-contact.php
git add src/php/send-booking.php
git add src/api/quote-request.php
git add src/.htaccess

# 3. Commitold
git commit -m "SECURITY: Fix critical vulnerabilities

- Replace hardcoded reCAPTCHA secret key with environment variable
- Add email header injection protection
- Add missing config constants
- Add security headers (.htaccess)
- Remove debug files
- Update documentation"

# 4. Pushold
git push origin master

# 5. Deploy production-re
./deploy.sh
```

**FONTOS:** NE felejts el feltolteni a `.env` fajlt is a production szerverre FTP-n keresztul!

---

## 10. PRODUCTION SZERVEREN

### FTP-n keresztul toltsd fel:

1. `.env` fajlt a projekt root-ba
2. `.htaccess` fajlt a `src/` konyvtarba

### SSH-n keresztul (ha van):

```bash
# Bejelentkezes
ssh user@your-server.com

# .env fajl jogosultsagok
cd /path/to/project
chmod 600 .env
chown www-data:www-data .env

# .htaccess jogosultsagok
chmod 644 src/.htaccess
```

---

## 11. TESZTELÉS PRODUCTION-BEN

### 1. Contact form teszt:
- [ ] Nyitsd meg: https://dozsa-apartman-szeged.hu/contact.html
- [ ] Toltsd ki az urlapot
- [ ] Kuldd el
- [ ] Ellenorizd, hogy megerkezett-e az email

### 2. Quote wizard teszt:
- [ ] Nyitsd meg: https://dozsa-apartman-szeged.hu/#ajanlatkeres
- [ ] Menj vegig a wizardon
- [ ] Kuldd el
- [ ] Ellenorizd, hogy megerkezett-e az email

### 3. reCAPTCHA teszt:
- [ ] Nyisd meg a browser console-t (F12)
- [ ] Kuldd el egy formt
- [ ] Ne legyen "Invalid site key" hiba
- [ ] Ne legyen "reCAPTCHA validation failed" hiba

### 4. Security headers teszt:
```bash
curl -I https://dozsa-apartman-szeged.hu
```

Ellenorizd, hogy ezek a header-ek benne vannak:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

---

## 12. MONITORING

### Ellenorizd a PHP error logokat:

```bash
# SSH-n keresztul
tail -f /var/log/php/error.log

# VAGY a szerver admin interface-en keresztul
```

Figyelj ezekre:
- reCAPTCHA API errors
- Email sending errors
- Session errors
- Rate limiting events

---

## 13. HA VALAMI ELROMLIK

### Visszaallas backup-bol:

```bash
# 1. Backupbol visszaallas
cd /home/kalmarr/projects
git clone ../dozsa-landing-backup.git dozsa-landing-restore

# 2. Masold vissza a regi kodot
cd dozsa-landing-restore
git log --oneline
git checkout <commit-hash-before-changes>

# 3. Deploy
./deploy.sh
```

### Hibakeresés:

```bash
# PHP error log
tail -f /var/log/php/error.log

# Apache error log
tail -f /var/log/apache2/error.log

# Check PHP syntax
php -l src/php/recaptcha-validator.php
```

---

## 14. HELP & SUPPORT

Ha elakadsz:

1. Ellenorizd a SECURITY-AUDIT-REPORT.md fajlt
2. Ellenorizd a PHP error logokat
3. Teszteld local-ban eloszor (Docker)
4. Kerj segitseget

---

**Sok sikert! A biztonsag fontos!**

**FONTOS EMLEKEZTETOK:**
- .env fajl SOHA ne keruljon a git-be
- reCAPTCHA secret key SOHA ne legyen publikus
- Debug fajlok SOHA ne legyenek production-ben
- Security headerek MINDIG legyenek konfiguraalva
- Rendszeresen ellenorizd a security auditokat

---

**Utolso frissites:** 2025-10-15
