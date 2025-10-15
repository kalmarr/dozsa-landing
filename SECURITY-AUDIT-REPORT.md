# Biztonsagi Audit Riport - Dozsa Apartman Szeged
**Datum:** 2025-10-15
**Auditor:** Claude Code - Senior Security Engineer
**PHP Verzio:** 8.4.13 (production PHP 7.4 specifikus szempontokkal is ellenorizve)
**Projekt:** Dozsa Apartman Szeged Landing Page

---

## EXECUTIVE SUMMARY

A projekt biztonsagi auditja soran **1 KRITIKUS**, **3 MAGAS**, **4 KOZEPES** es **2 ALACSONY** prioritasu biztonsagi problemat azonositottunk.

### Kritikus Problemak:
- reCAPTCHA secret key hardkodolva a forraskoddban es verziokezelesben

### Sulyossagi Besorolás:
- **CRITICAL**: 1 problema (CVSS 9.0-10.0)
- **HIGH**: 3 problema (CVSS 7.0-8.9)
- **MEDIUM**: 4 problema (CVSS 4.0-6.9)
- **LOW**: 2 problema (CVSS 0.1-3.9)

---

## 1. RECAPTCHA KULCSOK KEZELESE

### 1.1 SECRET KEY KITEVE A VERZIOKEZELESBEN

**Sulyossag:** CRITICAL (CVSS 9.8)
**CWE:** CWE-798 (Use of Hard-coded Credentials)

#### Problema:
A reCAPTCHA secret key hardkodolva van a forraskoddban:

**Erintett fajl:** `/home/kalmarr/projects/dozsa-landing/src/php/recaptcha-validator.php` (14. sor)

```php
function verifyRecaptcha($token, $secretKey = '6LeLt-grAAAAAP2LaXGZmrHMEAqy1dckAmJV2BD5') {
```

**Dokumentacioba is beleirva:** `RECAPTCHA_SETUP.md` (23. sor)

**Git history:** A secret key a `650ab28` commit-ban kerult hozzaadasra (2025-10-15) es azota nyilvanos a repository-ban.

#### Kockazat:
- A secret key nyilvanos, barki hozzaferheto aki latja a forraskodat
- Tamadok bypas-olhatjak a reCAPTCHA veedelmet sajat request-ekkel
- Bot-ok es automatizalt tamadas lehetseges a vedelem megkeruesevel
- A kulcs kompromittalasa eseten az osszes form tamadhatova valik

#### Azonnali Intezkedesek:
1. **AZONNAL** generaljunk uj reCAPTCHA kulcsparat a Google Admin Console-ban
2. Toroeljuk a regi kulcsokat
3. Tavolitsuk el a secret key-t a git history-bol (BFG Repo-Cleaner vagy git filter-branch)

#### Remediation (KRITIKUS - AZONNALI):

**1. lepés: Uj reCAPTCHA kulcspar generalasa**
```
1. Menj a https://www.google.com/recaptcha/admin cimlre
2. Toroeld a regi kulcsparat
3. Generaalj uj v2 Invisible kulcsparat
4. Jegyezd fel: site_key es secret_key
```

**2. lepés: .env fajl letrehozasa**
```bash
# /home/kalmarr/projects/dozsa-landing/.env
RECAPTCHA_SITE_KEY=your_new_site_key_here
RECAPTCHA_SECRET_KEY=your_new_secret_key_here
```

**3. lepés: PHP kod modositasa**

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/recaptcha-validator.php`

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

**4. lepés: JavaScript modositasa**

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/js/wizard.js` (396. sor)

```javascript
// REGI (396. sor):
'sitekey': '6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm',

// UJ - site key environment variable-bol vagy config-bol:
'sitekey': RECAPTCHA_SITE_KEY || '6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm',
```

**FONTOS:** A site key (public key) NEM titkos, de jobb ha kornyezeti valtozobol jon.

**5. lepés: Git history tisztitasa**

```bash
# FIGYELEM: Ez VESZLYES muevelet! Kesziets backup-ot!
# BFG Repo-Cleaner telepitese es hasznalata:

# 1. Backup
cd /home/kalmarr/projects/dozsa-landing
git clone --mirror . ../dozsa-landing-backup.git

# 2. BFG Repo-Cleaner letoltese
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 3. Titkos adatok torlese
java -jar bfg-1.14.0.jar --replace-text <(echo "6LeLt-grAAAAAP2LaXGZmrHMEAqy1dckAmJV2BD5==>***REMOVED***") .

# 4. Git cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (CSAK ha biztos vagy benne!)
git push --force --all
```

**ALTERNATÍV: Ha a repository meg nem lett megosztva:**
```bash
# Soft reset az utolso commit elott:
git reset --soft HEAD~1
# Commitol ujra a javitasokkal
```

**6. lepés: Dokumentacio frissitese**

Toroeld a `RECAPTCHA_SETUP.md` fajlt vagy tavolits el belole minden titkos kulcsot:

```bash
rm /home/kalmarr/projects/dozsa-landing/RECAPTCHA_SETUP.md
# VAGY modositsd, hogy NE tartalmazza a secret key-t
```

**7. lepés: .gitignore ellenorzese**

Ellenorizd, hogy `.env` mar szerepel-e:

```bash
cat /home/kalmarr/projects/dozsa-landing/.gitignore | grep "^\.env$"
```

Mar jol van allitva (29. sor).

---

## 2. ERZEKENY ADATOK A VERZIOKEZELESBEN

### 2.1 HIANYZO CONFIG KONSTANSOK

**Sulyossag:** HIGH (CVSS 7.5)
**CWE:** CWE-798

#### Problema:
A `send-booking.php` fajl hivatkozik `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` es `RATE_LIMIT_SECONDS` konstansokra, de ezek **NINCSENEK** definalva a `config.php` fajlban.

**Erintett fajl:** `/home/kalmarr/projects/dozsa-landing/src/php/send-booking.php`
- 65. sor: `RATE_LIMIT_SECONDS`
- 211. sor: `CONTACT_FROM_EMAIL`
- 216. sor: `CONTACT_TO_EMAIL`
- 265-266. sor: `CONTACT_FROM_EMAIL`

#### Kockazat:
- PHP fatal error lesz futaskor (undefined constant)
- Az email kueldees nem fog mukodni
- Lehetseges information disclosure ha a hiba megjelenik a felhasznalonak

#### Remediation:

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/config.php`

Adj hozza a fajl vegehez (37. sor utan):

```php
// Booking form settings
define('CONTACT_TO_EMAIL', ADMIN_EMAIL); // Vagy kulonbozo email ha kell
define('CONTACT_FROM_EMAIL', FROM_EMAIL);
define('RATE_LIMIT_SECONDS', 60); // 60 masodperc
```

---

### 2.2 DEBUG FAJLOK PRODUCTION KORNYEZETBEN

**Sulyossag:** HIGH (CVSS 7.8)
**CWE:** CWE-489 (Active Debug Code)

#### Problema:
Ket debug fajl is van a projektben, amik **NEM** tartoznak production kornyezetbe:

1. `/home/kalmarr/projects/dozsa-landing/src/php/test-contact.php`
   - `$_SERVER` informaciok kiirasa
   - `$_POST` adatok kiirasa
   - Information disclosure

2. `/home/kalmarr/projects/dozsa-landing/src/debug-recaptcha.html`
   - reCAPTCHA debug tool
   - Site key latszik a forraskoddban

#### Kockazat:
- Information disclosure
- Tamado megtudhatja a szerver belso kornyezeti valtozoit
- Debug informaciok segithetik a tamadast

#### Remediation:

**Opció 1: Torlés (AJANLOTT production-re)**
```bash
rm /home/kalmarr/projects/dozsa-landing/src/php/test-contact.php
rm /home/kalmarr/projects/dozsa-landing/src/debug-recaptcha.html
git add -u
git commit -m "Remove debug files for security"
```

**Opció 2: .htaccess védelem (ha szukseges local debug-hoz)**

Hozz letre: `/home/kalmarr/projects/dozsa-landing/src/.htaccess`

```apache
# Deny access to debug files
<FilesMatch "^(test-|debug-).*\.(php|html)$">
    Require all denied
</FilesMatch>

# Only allow from localhost
<Files "test-contact.php">
    Require ip 127.0.0.1
</Files>

<Files "debug-recaptcha.html">
    Require ip 127.0.0.1
</Files>
```

**Opció 3: Kornyezeti valtozo alapu vedeelem**

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/test-contact.php` elejen:

```php
<?php
// Only allow in development mode
if (getenv('APP_ENV') !== 'development') {
    http_response_code(404);
    exit('Not found');
}

// ... tobbi kod ...
```

---

### 2.3 HIANYZO .env FAJL

**Sulyossag:** MEDIUM (CVSS 5.5)

#### Problema:
A `.env` fajl **NEM** letezik, csak `.env.example` van. Ez azt jelenti:
- Nincsenek erzekeny adatok jol tarolva
- FTP credentials nincs konfiguralva biztonságosan

#### Jelenlegi .env.example tartalom:
```bash
FTP_HOST=ftp.example.com
FTP_USER=your_username
FTP_PASS=your_password
FTP_REMOTE_PATH=/public_html
FTP_SECURE=explicit
FTP_PASSIVE=true
```

#### Remediation:

**1. Hozd letre a .env fajlt:**
```bash
cp /home/kalmarr/projects/dozsa-landing/.env.example /home/kalmarr/projects/dozsa-landing/.env
```

**2. Toeltsd ki valos adatokkal:**
```bash
# .env
FTP_HOST=your-actual-ftp-host.com
FTP_USER=your-actual-username
FTP_PASS=your-strong-password-here
FTP_REMOTE_PATH=/public_html
FTP_SECURE=explicit
FTP_PASSIVE=true

# reCAPTCHA keys (add hozza!)
RECAPTCHA_SITE_KEY=your_new_site_key
RECAPTCHA_SECRET_KEY=your_new_secret_key

# Email settings (opcionalis)
ADMIN_EMAIL=info@dozsaszeged.hu
FROM_EMAIL=info@dozsaszeged.hu
```

**3. Ellenorizd a .gitignore-t:**
```bash
grep "^\.env$" /home/kalmarr/projects/dozsa-landing/.gitignore
# Jo: .env (29. sor)
```

**4. Biztositsd, hogy .env SOHA NE kerueljoen a git-be:**
```bash
git status
# .env NEM lehet a listaban!
```

---

## 3. PHP 7.4 SPECIFIKUS BIZTONSAGI SZEMPONTOK

### 3.1 PHP VERSION KOMPATIBILITAS

**Sulyossag:** MEDIUM (CVSS 5.0)
**CWE:** CWE-1104 (Use of Unmaintained Third Party Components)

#### Problema:
A jelenlegi fejlesztoi kornyezet **PHP 8.4.13**-at hasznal, de production **PHP 7.4** lehet.

**PHP 7.4 EOL (End of Life):** 2022. november 28.

#### Kockazatok:
- PHP 7.4 mar nem kap biztonsagi frissiteseket
- Ismert sebessegek nem javitva
- Regebb kodok deprecated funkcioikat hasznalhat

#### Jelenleg haszalt PHP funkciok ellenorzese:
```php
// OK - Kompatibilis PHP 7.4-gyel:
filter_var()              // PHP 5.2+
htmlspecialchars()        // PHP 4+
json_decode()             // PHP 5.2+
DateTime                  // PHP 5.2+
mail()                    // PHP 4+
session_start()           // PHP 4+
```

#### Remediation:

**1. Frissites PHP 8.1+ verziohra (AJANLOTT):**
- PHP 8.1: Aktiv support 2024. november 25-ig
- PHP 8.2: Aktiv support 2025. december 8-ig
- PHP 8.3: Aktiv support 2026. november 23-ig

**2. Ha PHP 7.4 marad (NEM AJANLOTT):**

Adj hozza minden PHP fajl elejen:
```php
<?php
// Check minimum PHP version
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    http_response_code(500);
    error_log('PHP version too old: ' . PHP_VERSION);
    exit('Server configuration error');
}
```

**3. Biztonsagi hardeningek PHP 7.4-hez:**

Modositsd a `php.ini` fajlt (production):
```ini
; Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source

; Hide PHP version
expose_php = Off

; Session security
session.cookie_httponly = On
session.cookie_secure = On
session.cookie_samesite = Strict
session.use_strict_mode = On

; Error handling
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php/error.log

; File uploads (ha nincs hasznalva)
file_uploads = Off

; Resource limits
max_execution_time = 30
max_input_time = 60
memory_limit = 128M
post_max_size = 8M
upload_max_filesize = 2M
```

---

### 3.2 ERROR REPORTING PRODUCTION-BEN

**Sulyossag:** MEDIUM (CVSS 4.5)
**CWE:** CWE-209 (Information Exposure Through an Error Message)

#### Problema:
A `send-booking.php` fajl fejlesztoi kornyezethez van konfiguraalva:

```php
// Line 8-9
error_reporting(E_ALL);
ini_set('display_errors', 0); // Ez OK, de E_ALL production-ben nem kell
```

#### Kockazat:
- Error uzenetek information disclosure-t okozhatnak
- Fejlesztoi információ leakage
- Stack trace-ek tamadokat segithetik

#### Remediation:

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/send-booking.php` (7-9. sor):

```php
<?php
/**
 * Dozsa Apartman Szeged - Booking Form Handler
 * Processes booking requests and sends email notifications
 */

// Environment-based error reporting
$isProduction = (getenv('APP_ENV') === 'production');

if ($isProduction) {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
```

Es allitsd be kornyezeti valtozoban:
```bash
# .env
APP_ENV=production
```

Vagy `.htaccess`-ben:
```apache
SetEnv APP_ENV production
```

---

## 4. FAJL FELTOLTESI BIZTONSAGI KERDESEK

### 4.1 NINCSENEK FAJL FELTOLTES FUNKCIOK

**Sulyossag:** N/A (Nincs probléma)

#### Allapitas:
Ellenoriztem a teljes projekt kodot, es **NINCSENEK** fajl feltoltes funkciok:
- Nincsen `move_uploaded_file()`
- Nincsen `fopen()` user input-tal
- Nincsen fajl iras user adatokkal

#### Konkluzio:
Nem alkalmazhato file upload sebezhetoseg, mert nincs file upload funkcionalitas.

**Javasolt prevenció a jövőre nézve:**
Ha kesobb fajl feltoltest implementalsz, hasznald ezeket a best practice-eket:

```php
// File upload security template (CSAK REFERENCIA)
function secureFileUpload($file) {
    // 1. Check if file was uploaded
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Upload error'];
    }

    // 2. Whitelist allowed extensions
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }

    // 3. Check MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!in_array($mimeType, $allowedMimeTypes)) {
        return ['success' => false, 'message' => 'Invalid MIME type'];
    }

    // 4. Check file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        return ['success' => false, 'message' => 'File too large'];
    }

    // 5. Generate random filename
    $randomName = bin2hex(random_bytes(16)) . '.' . $extension;

    // 6. Move to secure directory (outside webroot if possible)
    $uploadDir = '/var/uploads/'; // Outside /var/www/html/
    $destination = $uploadDir . $randomName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return ['success' => false, 'message' => 'Failed to save file'];
    }

    // 7. Set restrictive permissions
    chmod($destination, 0644);

    return ['success' => true, 'filename' => $randomName];
}
```

---

## 5. SQL INJECTION LEHETOSEGEK

### 5.1 NINCSENEK ADATBAZIS KAPCSOLATOK

**Sulyossag:** N/A (Nincs probléma)

#### Allapitas:
Ellenoriztem a teljes projekt kodot, es **NINCSENEK** adatbazis kapcsolatok:
- Nincsen `mysql_*()` funkció (deprecated)
- Nincsen `mysqli_*()` funkció
- Nincsen `PDO` osztaly hasznalata
- Nincsen SQL query vegrehajtasa

#### Konkluzio:
Nem alkalmazhato SQL injection sebezhetoseg, mert nincs adatbazis kapcsolat.

Az osszes adat email-ben keruul elkueldése a `mail()` funkcióval.

**Javasolt prevenció a jövőre nézve:**
Ha kesobb adatbazist implementalsz, MINDIG hasznald a prepared statement-eket:

```php
// SQL Injection prevention template (CSAK REFERENCIA)

// BAD - SQL Injection vulnerable:
$query = "SELECT * FROM users WHERE email = '" . $_POST['email'] . "'";
mysqli_query($conn, $query);

// GOOD - Prepared statement (mysqli):
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $_POST['email']);
$stmt->execute();
$result = $stmt->get_result();

// GOOD - Prepared statement (PDO):
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
$stmt->execute(['email' => $_POST['email']]);
$result = $stmt->fetchAll();
```

---

## 6. XSS TAMADASI FELUELETEK

### 6.1 HTMLSPECIALCHARS HASZNALAT - JO

**Sulyossag:** LOW (CVSS 3.0)

#### Allapitas:
A kod **JOEUL** hasznala a `htmlspecialchars()` funkciót a user input tisztitasara:

**send-contact.php (38-42. sor):**
```php
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data); // JO!
    return $data;
}
```

**send-booking.php (42-44. sor):**
```php
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8'); // JO!
}
```

**quote-request.php (53-64. sor):**
```php
$checkIn = htmlspecialchars($data['checkIn']); // JO!
$checkOut = htmlspecialchars($data['checkOut']);
$lastName = htmlspecialchars($data['lastName']);
// ... stb
```

#### Kisfoku problema:
A `send-contact.php` `htmlspecialchars()` funkcioja **NEM** specifikaalja az `ENT_QUOTES` es `UTF-8` parametereket, ami kisfoku biztonsagi resnek szaamit.

#### Remediation:

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/send-contact.php` (38-42. sor):

```php
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    // Add ENT_QUOTES and UTF-8 for better security
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}
```

---

### 6.2 EMAIL HEADER INJECTION VEDELEM - HIBAZIK

**Sulyossag:** HIGH (CVSS 7.2)
**CWE:** CWE-93 (Improper Neutralization of CRLF Sequences)

#### Problema:
A `send-contact.php` es `send-booking.php` fajlok **NEM** vedik meg az email header injection-t a `Reply-To` es `From` header-ekben.

**send-contact.php (164. sor):**
```php
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
```

Ha a `$name` valtozo tartalmaz `\r\n` karaktereket, a tamado hozzaadhati sajaat header-eket:

```
Felhasználó input:
Name: "Attacker\r\nBcc: spam@evil.com"
Email: "attacker@example.com"

Eredmeny header:
Reply-To: Attacker
Bcc: spam@evil.com <attacker@example.com>
```

#### Kockazat:
- Email spam relaying
- Phishing attack
- Arbitrary header injection
- BCC injection spameléshez

#### Remediation:

Adj hozza egy header tisztito funkciót es hasznald minden header-ben:

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/send-contact.php`

Adj hozza a `sanitizeInput()` funckió utan:

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

Es modositsd a header-eket (162-168. sor):

```php
// Email headers
$headers = [];
$headers[] = 'From: ' . sanitizeEmailHeader(FROM_NAME) . ' <' . sanitizeEmailHeader(FROM_EMAIL) . '>';
$headers[] = 'Reply-To: ' . sanitizeEmailHeader($name) . ' <' . sanitizeEmailHeader($email) . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Priority: 1';
$headers[] = 'Message-ID: <' . time() . '-admin-' . md5($email) . '@dozsa-apartman-szeged.hu>';
```

Ugyanezt alkalmazd a `send-booking.php` (209-213. sor) es `quote-request.php` (169-177. sor) fajlokban is.

**send-booking.php modositas:**
```php
// Email headers (209-213. sor)
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . sanitizeEmailHeader(CONTACT_FROM_EMAIL) . "\r\n";
$headers .= "Reply-To: " . sanitizeEmailHeader($email) . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();
```

**quote-request.php modositas:**
```php
// Send email to customer (169-177. sor)
$customerHeaders = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    "From: " . sanitizeEmailHeader($fromName) . " <" . sanitizeEmailHeader($fromEmail) . ">",
    "Reply-To: " . sanitizeEmailHeader($adminEmailAddress),
    'X-Mailer: PHP/' . phpversion(),
    'X-Priority: 3',
    'Message-ID: <' . time() . '-' . md5($email) . '@dozsa-apartman-szeged.hu>'
];
```

---

### 6.3 JAVASCRIPT INNERHTML HASZNALAT

**Sulyossag:** LOW (CVSS 2.5)

#### Problema:
A `wizard.js` fajl extenziv modeon hasznaalja az `innerHTML`-t, ami potencialis XSS vektor lehet, ha user input keruelt bele.

**Peldak:**
- 53. sor: `wizardContainer.innerHTML = ...`
- 149. sor: `wizardContainer.innerHTML = ...`
- 342. sor: `wizardContainer.innerHTML = ...`
- 533. sor: `wizardContainer.innerHTML = ...`

#### Allapitas:
Ellenoriztem az osszes `innerHTML` hasznaalatot, es **NINCSENEK** direkt user input-ok benne:
- Csak `wizardState` objektum mezoi szerepelnek
- A `wizardState` ertekei mar tisztitva vannak inputkor

**Peldaak:**
```javascript
// 346. sor - User input JOL van sanitizalva:
<p><strong>Vendegek:</strong> ${getTotalGuests()} fo ...

// getTotalGuests() csak szaemokat ad vissza, nem user input
function getTotalGuests() {
    return wizardState.adults + wizardState.extraBed + wizardState.child3to4 + wizardState.child0to2;
}
```

#### Maradek kockazat:
- Ha a jovoben direkt user text keruelt a `wizardState`-be, XSS lehetseges
- Best practice szerint `textContent` vagy `createElement` biztonságosabb

#### Remediation (OPCIONALIS - Best practice):

Ha teljesen eliminalnad az XSS kockazatot, cseréld le az `innerHTML`-t `textContent`-re ahol lehet:

**Peldaa - NEM SZUEKSEGES, de jobb:**

```javascript
// REGI (346. sor):
<p><strong>Vendegek:</strong> ${getTotalGuests()} fo ...

// UJ - createElement hasznalata:
const vendegekP = document.createElement('p');
const vendegekStrong = document.createElement('strong');
vendegekStrong.textContent = 'Vendegek: ';
vendegekP.appendChild(vendegekStrong);
vendegekP.appendChild(document.createTextNode(getTotalGuests() + ' fo ...'));
```

De ez **NEM SZUEKSEGES** a jelenlegi koodban, mert user input mar tisztitva van.

---

### 6.4 CONSOLE.LOG SENSITIVE DATA

**Sulyossag:** LOW (CVSS 2.0)

#### Problema:
A `wizard.js` logol informaciookat a console-ba:

```javascript
// 33. sor:
console.log('reCAPTCHA API loaded for wizard');

// 402. sor:
console.log('reCAPTCHA widget rendered for wizard');
```

#### Kockazat:
- Production kornyezetben a console log information disclosure-t okozhat
- Fejlesztoi informaciok kileakelhettek

#### Remediation:

Hasznalj kornyezeti valtozokat vagy taavolits el production-bol:

```javascript
// Add hozza a wizard.js elejere:
const DEBUG = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function debugLog(message) {
    if (DEBUG) {
        console.log(message);
    }
}

// Csereld le:
console.log('reCAPTCHA API loaded for wizard');
// Erre:
debugLog('reCAPTCHA API loaded for wizard');
```

Vagy production build-nel:
```javascript
// Production-ben:
const console = { log: () => {}, error: () => {}, warn: () => {} };
```

---

## 7. HIANYZO BIZTONSAGI HEADEREK

### 7.1 NINCSENEK SECURITY HEADEREK

**Sulyossag:** MEDIUM (CVSS 5.5)
**CWE:** CWE-693 (Protection Mechanism Failure)

#### Problema:
A projekt **NEM** hasznaal `.htaccess` fajlt, es **NINCSENEK** security header-ek konfiguraalva.

Hianyzo header-ek:
- Content-Security-Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (HSTS)

#### Kockazat:
- Clickjacking attack
- XSS attack
- MIME sniffing
- Mixed content
- Iframe embedding

#### Remediation:

**1. Hozz letre .htaccess fajlt:**

Fajl: `/home/kalmarr/projects/dozsa-landing/src/.htaccess`

```apache
# Security Headers
<IfModule mod_headers.c>
    # Content Security Policy
    # Engedlyezi: sajat domain, Google APIs, reCAPTCHA, Analytics
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com; frame-src https://www.google.com; connect-src 'self' https://www.google.com https://www.google-analytics.com; object-src 'none'; base-uri 'self'; form-action 'self'"

    # X-Frame-Options - Prevent clickjacking
    Header always set X-Frame-Options "SAMEORIGIN"

    # X-Content-Type-Options - Prevent MIME sniffing
    Header always set X-Content-Type-Options "nosniff"

    # Referrer-Policy - Control referrer information
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Permissions-Policy - Disable unnecessary features
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

    # X-XSS-Protection - Enable XSS filter (legacy browsers)
    Header always set X-XSS-Protection "1; mode=block"

    # Remove Server header (information disclosure)
    Header unset Server
    Header unset X-Powered-By

    # HSTS - Force HTTPS (CSAK HTTPS site-on!)
    # Kommenteld ki ha meg nincs SSL
    # Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
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

# PHP Security Settings (ha van mod_php)
<IfModule mod_php.c>
    php_flag display_errors Off
    php_value log_errors On
    php_flag expose_php Off
    php_value session.cookie_httponly On
    php_value session.cookie_secure On
    php_value session.use_strict_mode On
</IfModule>

# Disable directory listing
Options -Indexes

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache control for static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
</IfModule>
```

**2. Ellenorizd a header-eket:**

Telepites utan ellenorizd a header-eket:
```bash
curl -I https://dozsa-apartman-szeged.hu
```

Vagy hasznaalj online tool-t:
- https://securityheaders.com/
- https://observatory.mozilla.org/

**3. CSP finomhangolas:**

Ha a CSP blokkolja a funkcionalitast, finomhangold a policy-t:

```apache
# Debug mode - Logold a viola ciokat (production-ben kapcsold ki!)
Header set Content-Security-Policy-Report-Only "default-src 'self'; report-uri /csp-report"
```

---

## 8. RATE LIMITING ES BRUTE FORCE VEDELEM

### 8.1 SESSION-ALAPU RATE LIMITING - KORLATOZOTT

**Sulyossag:** MEDIUM (CVSS 4.5)
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

#### Problema:
A jelenlegi rate limiting implementacio session-alapu:

**send-contact.php (48-76. sor):**
```php
function checkRateLimit() {
    if (!isset($_SESSION['form_submissions'])) {
        $_SESSION['form_submissions'] = [];
    }

    // Remove old submissions
    $_SESSION['form_submissions'] = array_filter(/*...*/);

    // Check if rate limit exceeded
    if (count($_SESSION['form_submissions']) >= MAX_REQUESTS_PER_HOUR) {
        return false;
    }

    // Add current submission
    $_SESSION['form_submissions'][] = $now;
    return true;
}
```

#### Korlatozasok:
- Session-alapu, egyszeruen bypasolható cookie torlessel
- Nem vedene el a toebb session-bol erkezo bot attack-et
- IP-alapu rate limiting nincs implementalva

#### Remediation:

**1. IP-alapu rate limiting hozzaadas:**

Adj hozza a `config.php`-hez:

```php
// Rate limiting storage file
define('RATE_LIMIT_FILE', __DIR__ . '/../../data/rate-limits.json');
define('RATE_LIMIT_CLEANUP_CHANCE', 10); // 10% chance to cleanup old entries
```

Hozd letre az adatkonyvtarat:
```bash
mkdir -p /home/kalmarr/projects/dozsa-landing/data
chmod 755 /home/kalmarr/projects/dozsa-landing/data
touch /home/kalmarr/projects/dozsa-landing/data/rate-limits.json
chmod 644 /home/kalmarr/projects/dozsa-landing/data/rate-limits.json
```

Add hozza a `.gitignore`-hoz:
```
data/rate-limits.json
```

Modositsd a `send-contact.php` rate limiting funkciót (48-76. sor):

```php
/**
 * IP-based rate limiting (persistent across sessions)
 */
function checkRateLimitIP() {
    if (!ENABLE_RATE_LIMIT) {
        return true;
    }

    $ip = $_SERVER['REMOTE_ADDR'];
    $now = time();
    $hour = 3600;
    $rateLimitFile = RATE_LIMIT_FILE;

    // Ensure data directory exists
    $dataDir = dirname($rateLimitFile);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    // Load rate limits
    $rateLimits = [];
    if (file_exists($rateLimitFile)) {
        $content = file_get_contents($rateLimitFile);
        if ($content) {
            $rateLimits = json_decode($content, true) ?: [];
        }
    }

    // Cleanup old entries (10% chance)
    if (rand(1, 100) <= RATE_LIMIT_CLEANUP_CHANCE) {
        $rateLimits = array_filter($rateLimits, function($timestamps) use ($now, $hour) {
            // Remove IPs with no recent requests
            $timestamps = array_filter($timestamps, function($ts) use ($now, $hour) {
                return ($now - $ts) < $hour;
            });
            return !empty($timestamps);
        });
    }

    // Check IP's submission history
    if (!isset($rateLimits[$ip])) {
        $rateLimits[$ip] = [];
    }

    // Remove old submissions for this IP
    $rateLimits[$ip] = array_filter($rateLimits[$ip], function($timestamp) use ($now, $hour) {
        return ($now - $timestamp) < $hour;
    });

    // Check if rate limit exceeded
    if (count($rateLimits[$ip]) >= MAX_REQUESTS_PER_HOUR) {
        // Log suspicious activity
        error_log("Rate limit exceeded for IP: $ip (" . count($rateLimits[$ip]) . " requests in last hour)");
        return false;
    }

    // Add current submission
    $rateLimits[$ip][] = $now;

    // Save rate limits
    file_put_contents($rateLimitFile, json_encode($rateLimits));

    return true;
}

/**
 * Combined rate limiting: Session + IP
 */
function checkRateLimit() {
    // Check both session and IP-based rate limiting
    return checkRateLimitSession() && checkRateLimitIP();
}

/**
 * Session-based rate limiting (existing implementation)
 */
function checkRateLimitSession() {
    if (!ENABLE_RATE_LIMIT) {
        return true;
    }

    $now = time();
    $hour = 3600;

    if (!isset($_SESSION['form_submissions'])) {
        $_SESSION['form_submissions'] = [];
    }

    // Remove old submissions
    $_SESSION['form_submissions'] = array_filter(
        $_SESSION['form_submissions'],
        function($timestamp) use ($now, $hour) {
            return ($now - $timestamp) < $hour;
        }
    );

    // Check if rate limit exceeded
    if (count($_SESSION['form_submissions']) >= MAX_REQUESTS_PER_HOUR) {
        return false;
    }

    // Add current submission
    $_SESSION['form_submissions'][] = $now;
    return true;
}
```

Modositsd a form handler reszt (104. sor):
```php
// Check rate limiting (combined session + IP)
if (!checkRateLimit()) {
    sendResponse(false, MSG_RATE_LIMIT);
}
```

**2. CAPTCHA threshold:**

Adj hozza a `config.php`-hez:
```php
// CAPTCHA threshold
define('CAPTCHA_THRESHOLD', 3); // Show CAPTCHA after 3 submissions in an hour
```

**3. Honeypot megjegyzesek:**

A jelenlegi honeypot implementacio JOL mukodik (81-92. sor):
```php
function checkHoneypot() {
    if (!ENABLE_HONEYPOT) {
        return true;
    }

    // Check for honeypot field (should be empty)
    if (isset($_POST['website']) && !empty($_POST['website'])) {
        return false;
    }

    return true;
}
```

**HTML oldalon is legyen honeypot field:**

Adj hozza a contact form-hoz (contact.html):
```html
<!-- Honeypot field - DO NOT REMOVE -->
<input type="text" name="website" style="position: absolute; left: -9999px; width: 1px; height: 1px;" tabindex="-1" autocomplete="off">
```

---

## 9. SESSION BIZTONSAG

### 9.1 SESSION CONFIGURATION - HIBAZIK

**Sulyossag:** MEDIUM (CVSS 5.0)
**CWE:** CWE-384 (Session Fixation)

#### Problema:
A session konfiguracio **NEM** tartalmaz biztonsagi beallitasokat.

**send-contact.php (14. sor):**
```php
session_start();
```

#### Kockazat:
- Session hijacking
- Session fixation
- Cookie stealing (XSS)
- CSRF attack

#### Remediation:

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/send-contact.php` (14. sor)

```php
// Secure session configuration
ini_set('session.cookie_httponly', 1); // Prevent JavaScript access
ini_set('session.cookie_secure', 1);   // HTTPS only (comment out if no HTTPS)
ini_set('session.cookie_samesite', 'Strict'); // CSRF protection
ini_set('session.use_strict_mode', 1); // Prevent session fixation
ini_set('session.use_only_cookies', 1); // Don't accept session ID from URL
ini_set('session.cookie_lifetime', 0); // Session cookie (expires on browser close)
ini_set('session.gc_maxlifetime', 3600); // 1 hour server-side expiration

// Start session
session_start();

// Regenerate session ID periodically (prevent session fixation)
if (!isset($_SESSION['created'])) {
    $_SESSION['created'] = time();
} else if (time() - $_SESSION['created'] > 1800) { // 30 minutes
    session_regenerate_id(true);
    $_SESSION['created'] = time();
}
```

Ugyanezt alkalmazd a `send-booking.php` fajlban is (12. sor).

---

## 10. CSRF VEDELEM

### 10.1 NINCSEN CSRF TOKEN

**Sulyossag:** MEDIUM (CVSS 6.5)
**CWE:** CWE-352 (Cross-Site Request Forgery)

#### Problema:
A formok **NEM** hasznaaalnak CSRF token-t, csak reCAPTCHA-t.

Noha a reCAPTCHA bizonyos vedelmet nyujt, CSRF token-t is kell hasznalni.

#### Kockazat:
- CSRF attack lehetseges
- Automatizalt form submission maaas site-rol
- Request forgery

#### Remediation:

**1. CSRF token generator hozzaadasa:**

Adj hozza a `config.php`-hez:

```php
/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken($token) {
    if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
        return false;
    }

    // Check token age (max 1 hour)
    if (time() - $_SESSION['csrf_token_time'] > 3600) {
        return false;
    }

    // Compare tokens (timing-safe comparison)
    return hash_equals($_SESSION['csrf_token'], $token);
}
```

**2. CSRF token hozzaadasa a form-okhoz:**

Modositsd: `/home/kalmarr/projects/dozsa-landing/src/php/send-contact.php`

Adj hozza a session start utan (14. sor utan):

```php
session_start();

// Regenerate session ID periodically
// ... (lasd fentebb)

// Generate CSRF token
$csrfToken = generateCSRFToken();
```

Es a form validation reszben (98. sor utan):

```php
try {
    // Check request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Invalid request method.');
    }

    // Verify CSRF token
    $submittedToken = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
    if (!verifyCSRFToken($submittedToken)) {
        error_log('CSRF token verification failed');
        sendResponse(false, 'Biztonsagi ellenorzes sikertelen. Kerjuk, toltse ujra az oldalt.');
    }

    // Check rate limiting
    // ... (tobbi kod)
```

**3. CSRF token hozzaadasa a HTML form-hoz:**

A contact form-ban (contact.html) az űrlap belsejeben:

```html
<form id="contactForm">
    <!-- CSRF token -->
    <input type="hidden" name="csrf_token" id="csrf_token" value="">

    <!-- Tobbi mezok... -->
</form>

<script>
// Load CSRF token from API
fetch('/php/get-csrf-token.php')
    .then(res => res.json())
    .then(data => {
        document.getElementById('csrf_token').value = data.token;
    });
</script>
```

**4. CSRF token API endpoint:**

Hozd letre: `/home/kalmarr/projects/dozsa-landing/src/php/get-csrf-token.php`

```php
<?php
/**
 * CSRF Token API
 * Returns a CSRF token for form submission
 */

require_once __DIR__ . '/config.php';

// Secure session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);

session_start();

header('Content-Type: application/json');

// Generate CSRF token
$token = generateCSRFToken();

echo json_encode([
    'success' => true,
    'token' => $token
]);
```

---

## OSSZEGZES ES PRIORITASOK

### AZONNALI INTEZKEDESEK (24 oraan belul):

1. **[CRITICAL]** reCAPTCHA secret key csereje es torle a git history-bol
2. **[HIGH]** Email header injection vedelem hozzaadasa
3. **[HIGH]** Debug fajlok torlese production-bol
4. **[HIGH]** Hianyzo config konstansok hozzaadasa (CONTACT_TO_EMAIL, stb.)

### ROEVID TAVON (1 heten beluel):

5. **[MEDIUM]** .env fajl letrehozasa es kulcsok atrakasa kornyezeti valtozokkba
6. **[MEDIUM]** Security header-ek hozzaadasa (.htaccess)
7. **[MEDIUM]** IP-alapu rate limiting implementalasa
8. **[MEDIUM]** CSRF token hozzaadasa
9. **[MEDIUM]** Session biztonsag javitasa
10. **[MEDIUM]** Error reporting kornyezet-alapu konfiguracio

### HOSSZU TAVON (1 honapon beluel):

11. **[LOW]** PHP verzio frissitese 8.1+-ra
12. **[LOW]** Console.log produkcios eltavolitasa
13. **[LOW]** htmlspecialchars parameter javitasa
14. **[LOW]** Rendszeres biztonsagi audit (havi)

---

## ELLENORZO LISTA

- [ ] reCAPTCHA secret key kicserelve
- [ ] Git history tisztitva
- [ ] .env fajl letrehozva es kitoltve
- [ ] .env hozzaadva .gitignore-hoz (mar kesz)
- [ ] Debug fajlok torolve vagy vedve
- [ ] Email header injection vedelem implementalva
- [ ] Hianyzo config konstansok hozzaadva
- [ ] Security header-ek konfiguraalva (.htaccess)
- [ ] IP-alapu rate limiting implementalva
- [ ] CSRF token implementalva
- [ ] Session biztonsag javitva
- [ ] Error reporting kornyezet-alapu
- [ ] PHP verzio ellenorizve
- [ ] Security header teszt (securityheaders.com)
- [ ] Manual penetration teszt elvegezve
- [ ] Kod review kesz

---

## KAPCSOLAT ES TAMOGATAS

Ha kerdes van a biztonsagi audit-tal kapcsolatban:
- Ird meg a fejlesztonek
- Kerj tamogatast biztonsagi szakembertol
- Hasznalj automated scanning tool-okat (pl. OWASP ZAP, Burp Suite)

**Javasolt tool-ok:**
- OWASP ZAP: https://www.zaproxy.org/
- Nikto: https://github.com/sullo/nikto
- SQLMap: https://sqlmap.org/
- Burp Suite: https://portswigger.net/burp

---

**Audit elkeszult:** 2025-10-15
**Kovetkezo audit:** 2025-11-15 (havonta)
**Auditor:** Claude Code - Senior Security Engineer

---

## MELLEKLETEK

### A. Erintett Fajlok Listaja

```
KRITIKUS:
/home/kalmarr/projects/dozsa-landing/src/php/recaptcha-validator.php
/home/kalmarr/projects/dozsa-landing/RECAPTCHA_SETUP.md

MAGAS:
/home/kalmarr/projects/dozsa-landing/src/php/send-contact.php
/home/kalmarr/projects/dozsa-landing/src/php/send-booking.php
/home/kalmarr/projects/dozsa-landing/src/api/quote-request.php
/home/kalmarr/projects/dozsa-landing/src/php/test-contact.php (TORLES)
/home/kalmarr/projects/dozsa-landing/src/debug-recaptcha.html (TORLES)

KOZEPES:
/home/kalmarr/projects/dozsa-landing/src/php/config.php
/home/kalmarr/projects/dozsa-landing/.env (LETREHOZAS)
/home/kalmarr/projects/dozsa-landing/src/.htaccess (LETREHOZAS)
/home/kalmarr/projects/dozsa-landing/src/js/wizard.js

ALACSONY:
/home/kalmarr/projects/dozsa-landing/src/js/main.js
```

### B. Vulnerability Scoring (CVSS v3.1)

| Vulnerability | CVSS Score | Severity | Priority |
|--------------|-----------|----------|----------|
| Hardcoded reCAPTCHA secret | 9.8 | CRITICAL | P0 |
| Email header injection | 7.2 | HIGH | P1 |
| Debug files exposed | 7.8 | HIGH | P1 |
| Missing config constants | 7.5 | HIGH | P1 |
| No CSRF protection | 6.5 | MEDIUM | P2 |
| Weak session security | 5.0 | MEDIUM | P2 |
| No security headers | 5.5 | MEDIUM | P2 |
| PHP 7.4 EOL | 5.0 | MEDIUM | P2 |
| Information disclosure | 4.5 | MEDIUM | P3 |
| Console.log in production | 2.0 | LOW | P4 |
| htmlspecialchars missing params | 3.0 | LOW | P4 |

### C. Compliance Checklist

#### OWASP Top 10 2021:
- [x] A01:2021 – Broken Access Control
- [x] A02:2021 – Cryptographic Failures
- [x] A03:2021 – Injection (N/A - no DB)
- [x] A04:2021 – Insecure Design
- [x] A05:2021 – Security Misconfiguration
- [x] A06:2021 – Vulnerable Components
- [x] A07:2021 – Identification and Authentication Failures
- [x] A08:2021 – Software and Data Integrity Failures
- [x] A09:2021 – Security Logging Failures
- [x] A10:2021 – Server-Side Request Forgery (N/A)

#### GDPR:
- [x] Personal data processing lawfulness
- [x] Data minimization (only email, name, phone collected)
- [x] Security of processing (needs improvement)
- [x] Data breach notification (implement monitoring)

#### PCI DSS (ha kesobb payment lesz):
- [ ] Firewall configuration
- [ ] Password security
- [ ] Cardholder data protection (N/A - no payment yet)
- [ ] Encryption in transit
- [ ] Access control

---

**END OF REPORT**
