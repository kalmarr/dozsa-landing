# 500 Internal Server Error - Hibaelhárítás

## 🚨 Probléma

A https://dozsa-apartman-szeged.hu/ oldalon **500 Internal Server Error** lép fel.

## ✅ Azonosított OK

A **`.htaccess` fájl PHP direktívákat tartalmazott**, amelyek **NEM kompatibilisek PHP-FPM-mel**.

Az ISPConfig 3.3.0p3 **PHP-FPM-et használ**, nem mod_php-t. A következő direktívák okozták a hibát:

```apache
<IfModule mod_php7.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 30
    # ... stb
</IfModule>
```

## 🔧 Megoldás

### 1️⃣ AZONNALI Javítás (VPS-en)

SSH-zz a szerverre és cseréld ki a `.htaccess` fájlt:

```bash
# 1. SSH kapcsolat
ssh web1@dozsa-apartman-szeged.hu

# 2. Navigálj a web mappába
cd /var/www/clients/client0/web1/web

# 3. Készíts biztonsági másolatot
cp .htaccess .htaccess.backup

# 4. Töröld a problémás PHP direktívákat
# Nyisd meg a fájlt:
nano .htaccess

# 5. TÖRÖLD a következő szakaszt (5-14. sor):
# <IfModule mod_php7.c>
#     php_value upload_max_filesize 10M
#     php_value post_max_size 10M
#     php_value max_execution_time 30
#     php_value max_input_time 30
#     php_value memory_limit 128M
#     php_flag display_errors Off
#     php_flag log_errors On
#     php_value error_log /var/log/php_errors.log
# </IfModule>

# 6. Mentsd el (Ctrl+O, Enter, Ctrl+X)

# 7. Ellenőrizd az oldalt
curl -I https://dozsa-apartman-szeged.hu
```

### 2️⃣ Alternatív Megoldás - Teljes Csere

Ha törölni nehéz, cseréld az egész fájlt a PHP-FPM kompatibilis verzióra:

```bash
# Helyi gépen (dozsa-landing projekt)
scp web/.htaccess web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/web/.htaccess

# VAGY
# Ha már az új .htaccess helyi gépen van
rsync -avz web/.htaccess web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/web/
```

### 3️⃣ Debug Script Feltöltése

Tölts fel egy debug scriptet a probléma részletesebb diagnosztizálásához:

```bash
# Helyi gépen
scp web/debug-server.php web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/web/

# Böngészőben nyisd meg:
# https://dozsa-apartman-szeged.hu/debug-server.php
```

A debug script megmutatja:
- ✅ PHP verzió és SAPI típus
- ✅ .env fájl elérhetőség
- ✅ config.php betöltési állapot
- ✅ Apache modulok
- ✅ Fájlrendszer állapot
- ✅ PHP konfigurációs beállítások

**⚠️ FONTOS: Töröld a debug scriptet használat után!**

## 📋 Ellenőrző Lista

### Azonnal végrehajtandó lépések:

- [ ] 1. SSH kapcsolat a VPS-hez
- [ ] 2. .htaccess biztonsági mentés készítése
- [ ] 3. PHP direktívák törlése vagy teljes .htaccess csere
- [ ] 4. Oldal tesztelése böngészőben
- [ ] 5. debug-server.php feltöltése (opcionális)
- [ ] 6. Apache error log ellenőrzése
- [ ] 7. PHP error log ellenőrzése

### Hosszú távú megoldás:

- [ ] 8. PHP beállítások áthelyezése ISPConfig PHP Settings-be
- [ ] 9. .env fájl ellenőrzése (létezik? olvasható?)
- [ ] 10. Újra deployment az új .htaccess-szel
- [ ] 11. Debug script törlése

## 🔍 További Diagnosztika

### Apache Error Log Ellenőrzése

```bash
# SSH-n
tail -n 50 /var/log/apache2/error.log

# VAGY ISPConfig web specifikus log
tail -n 50 /var/www/clients/client0/web1/log/error.log
```

### PHP Error Log Ellenőrzése

```bash
# ISPConfig PHP error log
tail -n 50 /var/log/php_errors.log

# VAGY web-specifikus
tail -n 50 /var/www/clients/client0/web1/log/php_error.log
```

### .htaccess Szintaxis Teszt

```bash
# Apache config teszt
apachectl configtest

# VAGY ISPConfig restart
systemctl restart apache2
```

## 🛠️ PHP Beállítások ISPConfig-ban

Mivel a PHP direktívák nem működnek .htaccess-ben PHP-FPM mellett, állítsd be őket az ISPConfig panelen:

1. **ISPConfig Admin Panel**: https://dozsa-apartman-szeged.hu:8080
2. **Sites** → **dozsa-apartman-szeged.hu** → **Options**
3. **PHP Settings** fül
4. Adj hozzá egyedi PHP direktívákat:

```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 30
max_input_time = 30
memory_limit = 128M
display_errors = Off
log_errors = On
error_log = /var/www/clients/client0/web1/log/php_error.log
```

5. **Save** → **Restart PHP-FPM**

## 📊 Várható Eredmények

### Sikeres Javítás Után

```bash
$ curl -I https://dozsa-apartman-szeged.hu

HTTP/2 200
server: Apache
content-type: text/html; charset=UTF-8
```

✅ **200 OK** - Az oldal működik!

### debug-server.php Kimenet

Ha a debug scriptet használod, ezt kell látnod:

```
✅ PHP Verzió: 7.4.x
✅ PHP SAPI: fpm-fcgi (PHP-FPM működik)
✅ .env található: /var/www/clients/client0/web1/private/.env
✅ config.php betöltve sikeresen
✅ RECAPTCHA_SECRET_KEY: Beállítva
✅ ADMIN_EMAIL: info@dozsaszeged.hu
```

## 🚀 Deployment az Új .htaccess-szel

Ha már javítottad a .htaccess fájlt helyileg:

```bash
# Automatikus deployment
./deploy-to-ispconfig.sh

# VAGY manuális
rsync -avz web/ web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/web/ --exclude="debug-server.php"
```

## ⚠️ Gyakori Hibák

### 1. "Permission Denied" a .env fájlnál

```bash
# Ellenőrizd a jogosultságokat
ls -la /var/www/clients/client0/web1/private/.env

# Ha nem megfelelő:
chmod 600 /var/www/clients/client0/web1/private/.env
chown web1:client0 /var/www/clients/client0/web1/private/.env
```

### 2. ".env fájl nem található"

```bash
# Hozd létre
cd /var/www/clients/client0/web1/private
nano .env

# Másold be a tartalmat:
RECAPTCHA_SITE_KEY=6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm
RECAPTCHA_SECRET_KEY=IDE_ÉRKEZIK_AZ_ÚJ_TITKOS_KULCS
ADMIN_EMAIL=info@dozsaszeged.hu
FROM_EMAIL=info@dozsaszeged.hu
FROM_NAME="Dózsa Apartman Szeged"
SITE_NAME="Dózsa Apartman Szeged"
SITE_URL=https://dozsa-apartman-szeged.hu
```

### 3. "mod_rewrite not found"

```bash
# Engedélyezd a mod_rewrite modult
a2enmod rewrite
systemctl restart apache2
```

## 📞 Támogatás

Ha továbbra is 500-as hibát kapsz:

1. Küldd el az Apache error log utolsó 50 sorát
2. Küldd el a debug-server.php kimenetét (screenshot)
3. Ellenőrizd a PHP verzió kompatibilitást (7.4+)

## ✅ Ellenőrzés Sikeres Deployment Után

```bash
# 1. Főoldal
curl -I https://dozsa-apartman-szeged.hu
# Várható: 200 OK

# 2. Kapcsolat oldal
curl -I https://dozsa-apartman-szeged.hu/contact.html
# Várható: 200 OK

# 3. Hibaoldal teszt
curl -I https://dozsa-apartman-szeged.hu/nem-letezik
# Várható: 404 Not Found (egyedi hibaoldallal)

# 4. .env védelem
curl https://dozsa-apartman-szeged.hu/../private/.env
# Várható: 403 Forbidden
```

## 🎯 Összefoglalás

**Probléma**: .htaccess PHP direktívák + PHP-FPM = 500 Error
**Megoldás**: PHP direktívák törlése vagy ISPConfig PHP Settings használata
**Időigény**: 5-10 perc
**Kockázat**: Alacsony (biztonsági mentéssel)

---

**Verzió**: 1.0
**Utolsó frissítés**: 2025-10-15
**Kapcsolódó fájlok**:
- `web/.htaccess` (PHP-FPM kompatibilis)
- `web/.htaccess.mod_php_backup` (eredeti, biztonsági mentés)
- `web/debug-server.php` (diagnosztikai script)
