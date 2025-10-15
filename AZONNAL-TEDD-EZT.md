# 🚨 AZONNALI TEENDŐK - 500 Error Javítás

## ⚡ GYORS MEGOLDÁS (5 perc)

A https://dozsa-apartman-szeged.hu oldalon **500 Internal Server Error** van.
A probléma: **A .htaccess fájl PHP direktívái nem kompatibilisek PHP-FPM-mel**.

---

## 🎯 LEGEGYSZERŰBB MEGOLDÁS

### 1️⃣ Opció: Automata Script (AJÁNLOTT)

```bash
# 1. Töltsd le a gyors javítási scriptet a VPS-re
scp GYORS-JAVITAS.sh web1@dozsa-apartman-szeged.hu:/tmp/

# 2. SSH kapcsolat
ssh web1@dozsa-apartman-szeged.hu

# 3. Futtasd a scriptet
chmod +x /tmp/GYORS-JAVITAS.sh
/tmp/GYORS-JAVITAS.sh

# 4. Ellenőrzés böngészőben
# https://dozsa-apartman-szeged.hu
```

✅ **Ez automatikusan:**
- Biztonsági mentést készít a régi .htaccess-ről
- Minimális .htaccess-t hoz létre (csak védelem, nincs PHP direktíva)
- Beállítja a jogosultságokat
- Teszteli az oldalt

---

### 2️⃣ Opció: Minimális .htaccess Manuális Feltöltés

```bash
# Helyi gépről (dozsa-landing projekt):
scp web/.htaccess.minimal web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/web/.htaccess

# Teszt böngészőben:
# https://dozsa-apartman-szeged.hu
```

---

### 3️⃣ Opció: SSH-n Manuális Szerkesztés

```bash
# 1. SSH kapcsolat
ssh web1@dozsa-apartman-szeged.hu

# 2. Biztonsági mentés
cd /var/www/clients/client0/web1/web
cp .htaccess .htaccess.backup

# 3. TÖRÖLD az EGÉSZ .htaccess fájlt és írd át ezt:
cat > .htaccess << 'EOF'
# Dózsa Apartman Szeged - Minimális .htaccess
<FilesMatch "^\.env">
    Require all denied
</FilesMatch>
AddDefaultCharset UTF-8
Options -Indexes
EOF

# 4. Jogosultságok
chmod 644 .htaccess

# 5. Teszt
curl -I https://dozsa-apartman-szeged.hu
```

---

## 🔍 ELLENŐRZÉS

### Ha működik (200 OK):

```bash
$ curl -I https://dozsa-apartman-szeged.hu

HTTP/2 200
server: Apache
content-type: text/html; charset=UTF-8
```

✅ **SIKER!** Az oldal működik!

### Ha még mindig 500 hiba:

Ellenőrizd az Apache error log-ot:

```bash
# SSH-n
tail -n 50 /var/www/clients/client0/web1/log/error.log

# Vagy ISPConfig általános log
tail -n 50 /var/log/apache2/error.log
```

Keress olyan sorokat:
- `Invalid command 'php_value'` → PHP direktíva probléma
- `Syntax error` → .htaccess szintaxis hiba
- `Permission denied` → Jogosultsági probléma
- `.htaccess: Options not allowed` → AllowOverride probléma

---

## 🛠️ ALTERNATÍV DIAGNOSZTIKA

### Debug Script Feltöltése

```bash
# 1. Töltsd fel a debug scriptet
scp web/debug-server.php web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/web/

# 2. Böngészőben nyisd meg
# https://dozsa-apartman-szeged.hu/debug-server.php

# 3. Ellenőrizd:
# - PHP verzió (7.4+)
# - PHP SAPI (fpm-fcgi)
# - .env fájl létezik?
# - config.php betölthető?

# 4. TÖRÖLD a debug scriptet!
ssh web1@dozsa-apartman-szeged.hu
rm /var/www/clients/client0/web1/web/debug-server.php
```

### .env Fájl Ellenőrzés

```bash
# SSH-n
ls -la /var/www/clients/client0/web1/private/.env

# Ha nem létezik:
cd /var/www/clients/client0/web1/private
cat > .env << 'EOF'
RECAPTCHA_SITE_KEY=6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm
RECAPTCHA_SECRET_KEY=IDE_ÉRKEZIK_AZ_ÚJ_TITKOS_KULCS
ADMIN_EMAIL=info@dozsaszeged.hu
FROM_EMAIL=info@dozsaszeged.hu
FROM_NAME="Dózsa Apartman Szeged"
SITE_NAME="Dózsa Apartman Szeged"
SITE_URL=https://dozsa-apartman-szeged.hu
EOF

chmod 600 .env
```

---

## 📋 GYAKORI PROBLÉMÁK ÉS MEGOLDÁSOK

### 1. "Permission Denied"

```bash
# Ellenőrizd a tulajdonjogokat
ls -la /var/www/clients/client0/web1/web/.htaccess

# Állítsd be helyesen
chown web1:client0 /var/www/clients/client0/web1/web/.htaccess
chmod 644 /var/www/clients/client0/web1/web/.htaccess
```

### 2. "mod_rewrite not found"

```bash
# Engedélyezd a mod_rewrite modult
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 3. "Options not allowed here"

Ez azt jelenti, hogy az ISPConfig `AllowOverride` beállítása nem engedi a `.htaccess` direktívákat.

**Megoldás:**
1. ISPConfig Admin Panel → Sites → dozsa-apartman-szeged.hu → Options
2. **Apache Directives** mezőbe írd be:
```apache
<Directory /var/www/clients/client0/web1/web>
    AllowOverride All
</Directory>
```
3. Save → Apache restart

### 4. "Invalid command 'Header'"

```bash
# Engedélyezd a mod_headers modult
sudo a2enmod headers
sudo systemctl restart apache2
```

---

## 🚀 SIKERES JAVÍTÁS UTÁN

Ha már működik az oldal (200 OK), fokozatosan hozzáadhatsz további funkciókat:

### 1. Hibaoldalak Hozzáadása

```apache
# Adj hozzá az .htaccess végére:
ErrorDocument 404 /error/404.html
ErrorDocument 500 /error/500.html
```

### 2. URL Rewriting

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{THE_REQUEST} /index\.html [NC]
    RewriteRule ^(.*)index\.html$ /$1 [R=301,L]
</IfModule>
```

### 3. Biztonsági Fejlécek

```apache
<IfModule mod_headers.c>
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
</IfModule>
```

**⚠️ FONTOS:** Minden hozzáadás után ellenőrizd, hogy működik-e az oldal!

---

## 📞 HA MÉG MINDIG NEM MŰKÖDIK

1. **Küldd el az Apache error log utolsó 50 sorát**:
   ```bash
   tail -n 50 /var/www/clients/client0/web1/log/error.log > error.txt
   ```

2. **Küldd el a debug-server.php kimenetét** (screenshot)

3. **Ellenőrizd az ISPConfig beállításokat**:
   - PHP verzió: 7.4
   - PHP Mode: PHP-FPM
   - AllowOverride: All

4. **Ellenőrizd az Apache modulokat**:
   ```bash
   apache2ctl -M | grep -E "rewrite|headers|deflate|expires"
   ```

---

## ✅ ÖSSZEFOGLALÁS

| Lépés | Parancs | Időigény |
|-------|---------|----------|
| 1. Gyors script futtatása | `scp` + `ssh` + script futtatás | 3 perc |
| 2. Manuális .htaccess csere | `scp web/.htaccess.minimal` | 1 perc |
| 3. SSH manuális szerkesztés | `ssh` + `nano .htaccess` | 5 perc |

**Ajánlott:** 1. opció (automata script)

---

**Verzió**: 1.0
**Utolsó frissítés**: 2025-10-15
**Prioritás**: 🔴 KRITIKUS
