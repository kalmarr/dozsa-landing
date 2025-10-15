# ISPConfig 3.3.0p3 Deployment Útmutató
## Dózsa Apartman Szeged Website

Ez az útmutató részletezi a Dózsa Apartman Szeged weboldal telepítését ISPConfig 3.3.0p3 környezetbe.

---

## Rendszerkövetelmények

### Szerver környezet
- **OS**: Ubuntu 20.04 LTS
- **Web Server**: Apache 2.4+ (ISPConfig által kezelve)
- **PHP**: 7.4.3-4ubuntu2.29 vagy újabb
- **Database**: MariaDB 10.3.39 (nem használt ebben a projektben)
- **ISPConfig**: 3.3.0p3

### PHP Extensions
- php7.4-common
- php7.4-curl
- php7.4-json
- php7.4-mbstring

---

## 1. ISPConfig Website Beállítás

### 1.1 Website létrehozása ISPConfig-ban

1. Jelentkezz be az **ISPConfig Admin Panel**-be
2. Navigálj: **Sites → Website → Add new website**
3. Töltsd ki az alábbi adatokat:

**Client Tab:**
- Client: Válaszd ki a megfelelő klienst
- Domain: `dozsa-apartman-szeged.hu`
- Auto-Subdomain: `www` (opcionális)

**Domain Tab:**
- IPv4-Address: `*` (vagy specifikus IP)
- IPv6-Address: `*` (vagy specifikus IPv6)

**PHP Tab:**
- PHP: `PHP-FPM`
- PHP Version: `7.4`

**Directives Tab (Options):**
- Add Apache Directives (opcionális):
```apache
# UTF-8 Charset
AddDefaultCharset UTF-8

# Security Headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
```

**Save** → A weboldal létrejön, és megkapod a fájlrendszer útvonalat

---

## 2. Fájlstruktúra ISPConfig-ban

### 2.1 ISPConfig alapstruktúra

Az ISPConfig a következő struktúrát hozza létre:

```
/var/www/clients/client[X]/web[Y]/
├── cgi-bin/
├── log/                    # Apache access és error logok
├── private/                # Privát fájlok (nem publikus)
├── ssl/                    # SSL tanúsítványok
├── tmp/                    # Temp fájlok
└── web/                    # Publikus DocumentRoot ⭐
    ├── index.html
    ├── .htaccess
    └── ... (webes fájlok)
```

**FONTOS**: A `web/` mappa a **DocumentRoot**, ide kerülnek a publikus fájlok!

### 2.2 Projekt fájlstruktúra telepítés után

```
/var/www/clients/client[X]/web[Y]/
├── private/
│   └── .env                          # ⚠️ Környezeti változók (NEM publikus!)
├── log/
│   ├── access.log
│   └── error.log
└── web/                              # 🌐 PUBLIKUS WEBROOT
    ├── index.html                    # Főoldal
    ├── contact.html                  # Kapcsolat oldal
    ├── .htaccess                     # Apache konfiguráció
    ├── css/
    │   ├── colors.css
    │   ├── style.css
    │   ├── quote-wizard.css
    │   └── responsive.css
    ├── js/
    │   ├── main.js
    │   ├── slider.js
    │   ├── gallery.js
    │   └── wizard.js
    ├── images/
    │   ├── logo/
    │   ├── slides/
    │   ├── gallery/
    │   ├── about/
    │   └── floorplan/
    ├── php/                          # Backend PHP
    │   ├── config.php                # ✅ Environment variables olvasás
    │   ├── recaptcha-validator.php
    │   ├── send-contact.php
    │   └── send-booking.php
    ├── api/
    │   └── quote-request.php
    └── error/                        # Hibaoldalak
        ├── 400.html
        ├── 401.html
        ├── 403.html
        ├── 404.html
        ├── 500.html
        ├── 502.html
        └── 503.html
```

---

## 3. Telepítési Lépések

### 3.1 Fájlok feltöltése

**Opció 1: FTP/SFTP**
1. Csatlakozz SFTP-vel az ISPConfig által megadott SSH felhasználóval
2. Navigálj a `web/` mappába
3. Töltsd fel a `src/` mappa teljes tartalmát a `web/` mappába

**Opció 2: SSH + rsync (ajánlott)**
```bash
# Helyi gépről (fejlesztői környezetből)
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  src/ \
  web[Y]@dozsa-apartman-szeged.hu:/var/www/clients/client[X]/web[Y]/web/
```

**Opció 3: Git deploy**
```bash
# SSH-val a szerverre
ssh web[Y]@dozsa-apartman-szeged.hu

# Navigálj a web mappába
cd /var/www/clients/client[X]/web[Y]/web/

# Clone vagy pull
git clone https://github.com/your-repo/dozsa-landing.git tmp_deploy
cp -r tmp_deploy/src/* .
rm -rf tmp_deploy
```

### 3.2 .env fájl beállítása

**⚠️ KRITIKUS BIZTONSÁGI LÉPÉS**

1. SSH-val csatlakozz a szerverhez
2. Hozd létre a `.env` fájlt a **private/** mappában:

```bash
cd /var/www/clients/client[X]/web[Y]/private/
nano .env
```

3. Másold be a következő tartalmat **ÉS ÁLLÍTSD BE A VALÓS ÉRTÉKEKET**:

```bash
# Google reCAPTCHA v2 Kulcsok
RECAPTCHA_SITE_KEY=6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm
RECAPTCHA_SECRET_KEY=IDE_GENERÁLJ_ÚJ_SECRET_KEY_T

# Email Beállítások
ADMIN_EMAIL=info@dozsaszeged.hu
FROM_EMAIL=info@dozsaszeged.hu
FROM_NAME="Dózsa Apartman Szeged"

# Oldal Beállítások
SITE_NAME="Dózsa Apartman Szeged"
SITE_URL=https://dozsa-apartman-szeged.hu

# Biztonsági Beállítások
ENABLE_HONEYPOT=true
ENABLE_RATE_LIMIT=true
MAX_REQUESTS_PER_HOUR=5

# Üzenet Korlátok
MAX_MESSAGE_LENGTH=5000
MIN_MESSAGE_LENGTH=10
```

4. Állítsd be a jogosultságokat:

```bash
chmod 600 .env
chown web[Y]:client[X] .env
```

### 3.3 PHP config.php módosítása

A `config.php` már támogatja a `.env` fájl olvasást, de módosítsd az útvonalat:

```bash
nano /var/www/clients/client[X]/web[Y]/web/php/config.php
```

Keresd meg ezt a sort (30. sor körül):
```php
$envFile = __DIR__ . '/../../.env';
```

Módosítsd erre (ISPConfig private mappa):
```php
$envFile = __DIR__ . '/../../../private/.env';
```

**VAGY** használj abszolút útvonalat:
```php
$envFile = '/var/www/clients/client[X]/web[Y]/private/.env';
```

### 3.4 Fájl jogosultságok beállítása

```bash
# Navigálj a web mappába
cd /var/www/clients/client[X]/web[Y]/web/

# Tulajdonos beállítása
chown -R web[Y]:client[X] .

# Mappa jogosultságok
find . -type d -exec chmod 755 {} \;

# Fájl jogosultságok
find . -type f -exec chmod 644 {} \;

# .htaccess védelem
chmod 644 .htaccess

# PHP fájlok
chmod 644 php/*.php
chmod 644 api/*.php

# Private mappa (.env)
cd ../private/
chmod 700 .
chmod 600 .env
```

### 3.5 Apache ErrorDocument beállítás

Ellenőrizd a `.htaccess` fájlt:

```bash
nano /var/www/clients/client[X]/web[Y]/web/.htaccess
```

Győződj meg róla, hogy benne vannak ezek a sorok:

```apache
ErrorDocument 400 /error/400.html
ErrorDocument 401 /error/401.html
ErrorDocument 403 /error/403.html
ErrorDocument 404 /error/404.html
ErrorDocument 500 /error/500.html
ErrorDocument 502 /error/502.html
ErrorDocument 503 /error/503.html
```

---

## 4. reCAPTCHA Konfiguráció

### 4.1 Új kulcspár generálása (KÖTELEZŐ!)

A régi secret key kompromittálódott, ezért **új kulcspárt kell generálni**:

1. Látogass el: [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Kattints: **Create** (+)
3. Töltsd ki:
   - **Label**: Dózsa Apartman Szeged
   - **reCAPTCHA type**: reCAPTCHA v2 → **"I'm not a robot" Checkbox** VAGY **Invisible reCAPTCHA badge**
   - **Domains**:
     - `dozsa-apartman-szeged.hu`
     - `www.dozsa-apartman-szeged.hu`
4. **Submit**
5. Másold ki a **Site Key** és **Secret Key** értékeket
6. Frissítsd a `.env` fájlt a **private/** mappában
7. Frissítsd a **Site Key**-t a HTML fájlokban:
   - `web/index.html` (75. sor)
   - `web/contact.html`
   - `web/js/wizard.js`

### 4.2 Domain ellenőrzés

Győződj meg róla, hogy a reCAPTCHA-ban regisztrált domain megegyezik a weboldal domain-jével!

---

## 5. Email Konfiguráció

### 5.1 PHP mail() funkció

ISPConfig alapértelmezetten beállítja a PHP `mail()` funkciót Postfix-szel. Ellenőrzés:

```bash
# Teszt email küldés
echo "Test email from Dózsa Apartman" | mail -s "Test" info@dozsaszeged.hu
```

### 5.2 SPF és DKIM beállítás (opcionális, de ajánlott)

**ISPConfig Admin Panel:**
1. **Email → Domain → dozsa-apartman-szeged.hu**
2. Enable **DKIM**
3. Add **SPF Record**:
   ```
   v=spf1 mx a ip4:[SERVER_IP] ~all
   ```

---

## 6. SSL Tanúsítvány

### 6.1 Let's Encrypt SSL (AJÁNLOTT)

**ISPConfig Admin Panel:**
1. **Sites → Website → dozsa-apartman-szeged.hu**
2. **SSL Tab**:
   - SSL: ✅ Enabled
   - Let's Encrypt SSL: ✅ Enabled
   - **Save**

ISPConfig automatikusan generálja és megújítja a tanúsítványt.

### 6.2 HTTPS átirányítás

Szerkeszd a `.htaccess` fájlt és kommenteld ki ezt a részt:

```apache
# HTTPS átirányítás
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 7. Tesztelés

### 7.1 Alap funkciók

1. **Főoldal**: https://dozsa-apartman-szeged.hu
2. **Kapcsolat oldal**: https://dozsa-apartman-szeged.hu/contact.html
3. **Ajánlatkérés űrlap**: Töltsd ki és küld el
4. **Kapcsolat űrlap**: Töltsd ki és küld el
5. **Hibaoldalak**:
   - https://dozsa-apartman-szeged.hu/nonexistent (404)
   - https://dozsa-apartman-szeged.hu/error/403.html (403)

### 7.2 Email tesztek

Küldj teszt üzenetet mindkét űrlapon keresztül és ellenőrizd:
- Admin email megérkezik-e (`info@dozsaszeged.hu`)
- Visszaigazoló email megérkezik-e a felhasználónak
- Email header injection védelem működik-e

### 7.3 Biztonsági tesztek

```bash
# .env fájl nem elérhető
curl https://dozsa-apartman-szeged.hu/../private/.env
# Várható: 403 Forbidden

# .htaccess működik
curl https://dozsa-apartman-szeged.hu/.env
# Várható: 403 Forbidden

# PHP config működik
curl https://dozsa-apartman-szeged.hu/php/send-contact.php
# Várható: JSON válasz "Invalid request method"
```

### 7.4 Performance tesztek

```bash
# PageSpeed
https://pagespeed.web.dev/analysis?url=https://dozsa-apartman-szeged.hu

# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=dozsa-apartman-szeged.hu
```

---

## 8. Monitoring és Karbantartás

### 8.1 Log fájlok

```bash
# Access log
tail -f /var/www/clients/client[X]/web[Y]/log/access.log

# Error log
tail -f /var/www/clients/client[X]/web[Y]/log/error.log

# PHP errors
tail -f /var/log/php7.4-fpm.log
```

### 8.2 Backup

**ISPConfig Admin Panel:**
1. **Sites → Website → Backup**
2. Enable **Backup** schedule
3. Or manual backup:

```bash
# Full backup
tar -czf dozsa-backup-$(date +%Y%m%d).tar.gz \
  /var/www/clients/client[X]/web[Y]/web/ \
  /var/www/clients/client[X]/web[Y]/private/.env
```

### 8.3 Updates

```bash
# PHP security updates
sudo apt update && sudo apt upgrade php7.4-*

# ISPConfig updates
sudo /usr/local/ispconfig/server/scripts/ispconfig_update.sh
```

---

## 9. Hibaelhárítás

### 9.1 "reCAPTCHA validation failed"

**Probléma**: reCAPTCHA nem működik

**Megoldás**:
1. Ellenőrizd a `.env` fájlt: `RECAPTCHA_SECRET_KEY` helyes?
2. Ellenőrizd a domain-t a reCAPTCHA konzolon
3. Nézd meg a PHP error logot:
   ```bash
   tail -f /var/www/clients/client[X]/web[Y]/log/error.log
   ```

### 9.2 "Failed to open stream: Permission denied"

**Probléma**: PHP nem tudja olvasni a `.env` fájlt

**Megoldás**:
```bash
# Ellenőrizd a jogosultságokat
ls -la /var/www/clients/client[X]/web[Y]/private/.env

# Javítsd a jogosultságokat
chmod 600 /var/www/clients/client[X]/web[Y]/private/.env
chown web[Y]:client[X] /var/www/clients/client[X]/web[Y]/private/.env
```

### 9.3 "Email not sending"

**Probléma**: Emailek nem érkeznek meg

**Megoldás**:
1. Ellenőrizd a mail log-ot:
   ```bash
   tail -f /var/log/mail.log
   ```
2. Teszteld a Postfix-et:
   ```bash
   echo "Test" | mail -s "Test" info@dozsaszeged.hu
   ```
3. Ellenőrizd az SPF és DKIM beállításokat

### 9.4 "500 Internal Server Error"

**Probléma**: Szerverhiba

**Megoldás**:
1. Nézd meg az Apache error log-ot:
   ```bash
   tail -f /var/www/clients/client[X]/web[Y]/log/error.log
   ```
2. Ellenőrizd a PHP syntax error-okat:
   ```bash
   php -l /var/www/clients/client[X]/web[Y]/web/php/config.php
   ```

---

## 10. Production Checklist

Használatba vétel előtt ellenőrizd:

- [ ] ✅ Új reCAPTCHA kulcspár generálva
- [ ] ✅ `.env` fájl kitöltve valós adatokkal
- [ ] ✅ `.env` fájl jogosultságok: `600`
- [ ] ✅ Email címek helyesek (FROM_EMAIL, ADMIN_EMAIL)
- [ ] ✅ SSL tanúsítvány aktív (HTTPS)
- [ ] ✅ HTTPS átirányítás bekapcsolva
- [ ] ✅ Hibaoldalak működnek (404, 500, stb.)
- [ ] ✅ Kapcsolat űrlap teszt sikeres
- [ ] ✅ Ajánlatkérés űrlap teszt sikeres
- [ ] ✅ reCAPTCHA működik
- [ ] ✅ Email küldés működik (admin + visszaigazolás)
- [ ] ✅ Biztonsági headerek aktívak
- [ ] ✅ `.env` fájl nem elérhető HTTP-n keresztül
- [ ] ✅ Debug fájlok törölve (debug-recaptcha.html, test-contact.php)
- [ ] ✅ Google Analytics működik (G-6FCDV949BE)
- [ ] ✅ Performance teszt lefutott (PageSpeed Insights)
- [ ] ✅ SSL teszt lefutott (SSL Labs)
- [ ] ✅ Backup schedule beállítva

---

## Összefoglalás

Ez a dokumentum részletesen leírja a Dózsa Apartman Szeged weboldal telepítését ISPConfig 3.3.0p3 környezetbe, Ubuntu 20.04-en, PHP 7.4-gyel és MariaDB 10.3-mal.

**Támogatás**: Ha kérdésed van, vedd fel a kapcsolatot a rendszergazdával vagy a fejlesztővel.

**Dokumentum verzió**: 1.0 (2025-01-15)
