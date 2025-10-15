# ISPConfig 3.3.0p3 Fájlstruktúra Útmutató

## 📁 Két projekt struktúra

### 1. Fejlesztési Struktúra (src/)

```
dozsa-landing/
├── src/                          # Fejlesztési fájlok
│   ├── index.html
│   ├── contact.html
│   ├── .htaccess
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── php/
│   ├── api/
│   └── error/
├── .env.example                  # Példa környezeti változók
└── .env                          # Helyi fejlesztési .env (ne commitold!)
```

**Használat:**
- Helyi fejlesztéshez (PHP built-in server: `php -S localhost:8081`)
- Git verziókezeléshez
- Deployment előkészítéséhez

### 2. ISPConfig Struktúra (ispconfig-structure/)

```
ispconfig-structure/
├── private/                      # ⚠️ NEM publikus (HTTP-n nem elérhető)
│   └── .env.example             # Környezeti változók sablon
└── web/                         # ✅ PUBLIKUS webroot (DocumentRoot)
    ├── index.html
    ├── contact.html
    ├── .htaccess
    ├── css/
    ├── js/
    ├── images/
    ├── php/
    │   └── config.php           # Automatikusan ../../../private/.env-t keres
    ├── api/
    └── error/
```

**Használat:**
- ISPConfig 3.3.0p3 production környezet
- Apache 2.4+ .htaccess támogatással
- PHP 7.4+ environment

---

## 🔄 Fájlok szinkronizálása

### Automatikus (ajánlott)

```bash
# Deploy script használata
./deploy-to-ispconfig.sh
```

Ez automatikusan:
1. Másolja `src/` → ISPConfig `web/`
2. Beállítja a jogosultságokat
3. Ellenőrzi a `.env` fájlt
4. Teszteli a kapcsolatot

### Manuális

```bash
# 1. Web fájlok másolása
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='*.md' \
  src/ \
  web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/web/

# 2. .env fájl (először szerkesztésd!)
cp .env.example .env
nano .env  # Állítsd be a SECRET_KEY-t!
scp .env web1@dozsa-apartman-szeged.hu:/var/www/clients/client0/web1/private/.env

# 3. Jogosultságok
ssh web1@dozsa-apartman-szeged.hu << 'EOF'
  chmod 600 /var/www/clients/client0/web1/private/.env
  chmod 644 /var/www/clients/client0/web1/web/.htaccess
  chmod -R 755 /var/www/clients/client0/web1/web/
EOF
```

---

## ⚙️ PHP config.php működése

A `config.php` automatikusan felismeri a környezetet:

```php
// 1. Először ISPConfig környezeti változókat keres (getenv)
// 2. Ha nincs, akkor .env fájlt keres:

// ISPConfig production:
$envFile = __DIR__ . '/../../../private/.env';

// Ha nem létezik, fejlesztési környezet:
$envFile = __DIR__ . '/../../.env';
```

**Tehát:**
- ✅ `src/php/config.php` → `src/.env` (fejlesztés)
- ✅ `web/php/config.php` → `private/.env` (production)
- ✅ Mindkét struktúra automatikusan működik!

---

## 🚀 Deployment Folyamat

### 1. Helyi fejlesztés

```bash
cd dozsa-landing/src/
php -S localhost:8081

# Tesztelés: http://localhost:8081
```

### 2. ISPConfig előkészítés

```bash
# a) Automatikus (ajánlott)
./deploy-to-ispconfig.sh

# b) Manuális sync
rsync -avz src/ ispconfig-structure/web/
```

### 3. Production deploy

```bash
# SSH-val csatlakozz
ssh web1@dozsa-apartman-szeged.hu

# Navigálj az ISPConfig mappába
cd /var/www/clients/client0/web1/

# Első telepítés: hozd létre a private/.env fájlt
nano private/.env
# Másold be a .env.example tartalmát
# ÚJ RECAPTCHA_SECRET_KEY generálása kötelező!

# Állítsd be a jogosultságokat
chmod 700 private/
chmod 600 private/.env
```

---

## 🔐 Biztonsági Ellenőrzés

### private/ mappa

```bash
# Ellenőrizd, hogy NEM elérhető HTTP-n:
curl https://dozsa-apartman-szeged.hu/../private/.env
# Várható: 403 Forbidden vagy 404 Not Found
```

### .env fájl

```bash
# Ellenőrizd a jogosultságokat:
ls -la /var/www/clients/client0/web1/private/.env
# Várható: -rw------- (600)

# Ellenőrizd, hogy tartalmaz-e SECRET_KEY-t:
grep RECAPTCHA_SECRET_KEY /var/www/clients/client0/web1/private/.env
# NE látszódjon a publikus site key!
```

### PHP tesztek

```bash
# Teszteld, hogy a config.php betölti-e a .env-t:
php -r "
require '/var/www/clients/client0/web1/web/php/config.php';
echo 'RECAPTCHA_SECRET_KEY loaded: ';
echo !empty(RECAPTCHA_SECRET_KEY) ? 'YES' : 'NO';
echo PHP_EOL;
"
# Várható: YES
```

---

## 📊 Mappa Jogosultságok

### ISPConfig standard jogosultságok:

```bash
# private/ mappa
chmod 700 private/                    # Csak a tulajdonos férhet hozzá
chmod 600 private/.env                # Csak tulajdonos olvashatja

# web/ mappa (publikus)
find web/ -type d -exec chmod 755 {} \;    # Mappák: rwxr-xr-x
find web/ -type f -exec chmod 644 {} \;    # Fájlok: rw-r--r--

# .htaccess
chmod 644 web/.htaccess               # rw-r--r--

# PHP fájlok
chmod 644 web/php/*.php               # rw-r--r--
chmod 644 web/api/*.php               # rw-r--r--
```

---

## 🧪 Tesztelés

### 1. Helyi teszt (fejlesztési struktúra)

```bash
cd src/
php -S localhost:8081
```

Látogass el: http://localhost:8081

### 2. ISPConfig teszt

```bash
# Főoldal
curl -I https://dozsa-apartman-szeged.hu

# Kapcsolat űrlap
curl -X POST https://dozsa-apartman-szeged.hu/php/send-contact.php \
  -d "name=Test&email=test@example.com&message=Test"

# .env védelem
curl https://dozsa-apartman-szeged.hu/../private/.env
# Várható: 403 vagy 404
```

---

## 📝 Fejlesztési Workflow

### Új funkció fejlesztése

```bash
# 1. Dolgozz a src/ mappában
cd src/
nano php/new-feature.php

# 2. Teszteld lokálisan
php -S localhost:8081

# 3. Ha kész, deploy
./deploy-to-ispconfig.sh

# 4. Teszteld production-ben
curl https://dozsa-apartman-szeged.hu/php/new-feature.php
```

### Git commit

```bash
# Csak a src/ mappa kerül Git-be
git add src/
git add .env.example
git add deploy-to-ispconfig.sh
git commit -m "Add new feature"
git push

# A következők NEM kerülnek Git-be:
# - .env (helyi környezeti változók)
# - ispconfig-structure/ (csak példa struktúra)
# - private/.env (production titkok)
```

---

## 🔗 További Információk

- **Teljes deployment útmutató**: [ISPCONFIG_DEPLOYMENT.md](ISPCONFIG_DEPLOYMENT.md)
- **Biztonsági beállítások**: [ISPCONFIG_DEPLOYMENT.md](ISPCONFIG_DEPLOYMENT.md#7-tesztelés)
- **Hibaelhárítás**: [ISPCONFIG_DEPLOYMENT.md](ISPCONFIG_DEPLOYMENT.md#9-hibaelhárítás)

---

## ✅ Ellenőrző Lista

Deployment előtt:

- [ ] `.env.example` → `.env` másolva és kitöltve
- [ ] Új reCAPTCHA SECRET_KEY generálva
- [ ] `deploy-to-ispconfig.sh` konfigurálva (USER, HOST, PATH)
- [ ] SSH kulcs hozzáadva a szerverhez
- [ ] ISPConfig website létrehozva (PHP 7.4)

Deployment után:

- [ ] `private/.env` létezik és chmod 600
- [ ] `private/.env` NEM elérhető HTTP-n
- [ ] Főoldal betöltődik (https://dozsa-apartman-szeged.hu)
- [ ] Kapcsolat űrlap működik
- [ ] Ajánlatkérés wizard működik
- [ ] Hibaoldalak működnek (404, 500, stb.)
- [ ] reCAPTCHA működik
- [ ] Email küldés működik

---

**Verzió**: 1.0
**Utolsó frissítés**: 2025-01-15
**ISPConfig kompatibilitás**: 3.3.0p3 ✅
