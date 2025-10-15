# Dózsa Apartman Szeged - ISPConfig 3.3.0p3 Fájlstruktúra

## 📋 Áttekintés

A projekt **alapértelmezett struktúrája** most már **ISPConfig 3.3.0p3 kompatibilis**.

Nincs több külön fejlesztési (`src/`) és production (`ispconfig-structure/`) struktúra - minden egy helyen van!

## 📁 Projekt Struktúra

```
dozsa-landing/                  # 🏠 Projekt gyökér
│
├── private/                    # ⚠️ NEM PUBLIKUS
│   ├── .env.example            # Környezeti változók sablon
│   └── .env                    # Production/dev config (git ignore!)
│
├── web/                        # ✅ PUBLIKUS DocumentRoot
│   ├── index.html              # Főoldal
│   ├── contact.html            # Kapcsolati oldal
│   ├── .htaccess               # Apache konfiguráció
│   │
│   ├── css/                    # Stíluslapok
│   │   ├── colors.css          # Színséma változók
│   │   ├── style.css           # Fő stílusok
│   │   └── responsive.css      # Reszponzív stílusok
│   │
│   ├── js/                     # JavaScript
│   │   ├── main.js             # Fő funkciók
│   │   ├── slider.js           # Hero slider
│   │   ├── gallery.js          # Galéria
│   │   └── wizard.js           # Ajánlatkérő wizard
│   │
│   ├── images/                 # Képek
│   │   ├── logo/               # Logók
│   │   ├── slides/             # Hero slider képek
│   │   ├── gallery/            # Galéria képek
│   │   │   ├── rooms/          # Szobák
│   │   │   ├── bathrooms/      # Fürdőszobák
│   │   │   ├── interior/       # Belső terek
│   │   │   └── exterior/       # Külső képek
│   │   ├── floorplan/          # Alaprajz
│   │   └── about/              # Rólunk képek
│   │
│   ├── php/                    # Backend
│   │   ├── config.php          # Konfiguráció (auto-detect)
│   │   ├── send-contact.php    # Kapcsolati űrlap
│   │   ├── send-booking.php    # Ajánlatkérés
│   │   └── recaptcha-validator.php  # reCAPTCHA
│   │
│   ├── api/                    # API endpointok
│   │   └── check-availability.php
│   │
│   └── error/                  # Egyedi hibaoldalak
│       ├── 400.html            # Bad Request
│       ├── 401.html            # Unauthorized
│       ├── 403.html            # Forbidden
│       ├── 404.html            # Not Found
│       ├── 500.html            # Internal Server Error
│       ├── 502.html            # Bad Gateway
│       └── 503.html            # Service Unavailable
│
├── _legacy/                    # 📦 Archivált régi struktúrák
│   ├── src/                    # Régi fejlesztési mappa
│   └── ispconfig-structure/    # Régi production példa
│
├── deploy-to-ispconfig.sh      # 🚀 Automatikus deployment
├── .env.example                # Példa környezeti változók
├── .gitignore                  # Git kizárások
└── [dokumentáció]              # *.md fájlok
```

## 🔧 Környezet Automatikus Detektálása

A `web/php/config.php` automatikusan felismeri, hogy hol fut:

### 1️⃣ ISPConfig VPS Production

```
/var/www/clients/client0/web1/
├── private/
│   └── .env                    ← Config erre mutat
└── web/
    └── php/
        └── config.php          ← PHP fájl itt van
```

**Útvonal**: `__DIR__ . '/../../../private/.env'`

### 2️⃣ Helyi Fejlesztési Környezet

```
dozsa-landing/
├── private/
│   └── .env                    ← Config erre mutat
└── web/
    └── php/
        └── config.php          ← PHP fájl itt van
```

**Útvonal**: `__DIR__ . '/../../private/.env'`

## 🚀 Fejlesztési Workflow

### Helyi Fejlesztés

```bash
# 1. Környezeti változók beállítása
cp private/.env.example private/.env
nano private/.env  # Állítsd be a RECAPTCHA_SECRET_KEY-t

# 2. PHP dev szerver indítása
cd web
php -S localhost:8081

# 3. Böngészőben
# http://localhost:8081
```

### ISPConfig VPS Deployment

```bash
# Automatikus deployment
./deploy-to-ispconfig.sh

# VAGY manuális rsync
rsync -avz web/ user@host:/var/www/clients/client0/web1/web/
scp private/.env user@host:/var/www/clients/client0/web1/private/.env
```

## 🔐 Biztonsági Megjegyzések

### private/ mappa

- ⚠️ **NEM PUBLIKUS**: HTTP-n nem elérhető
- ✅ **Tartalmazza**: `.env` fájl (titkos kulcsok)
- ✅ **Jogosultságok**: `chmod 700 private/` és `chmod 600 private/.env`

### .env fájl

- ⚠️ **SOHA** ne commitold Git-be!
- ✅ Minden titkos kulcs ide kerül
- ✅ Production és development is ezt használja

### web/ mappa

- ✅ **PUBLIKUS**: HTTPS-en keresztül elérhető
- ✅ **DocumentRoot**: Apache ide mutat
- ✅ **Jogosultságok**: `chmod 755` (mappák), `chmod 644` (fájlok)

## 📊 Előnyök

### ✅ Egyszerűség

- Egyetlen struktúra mindkét környezethez
- Nincs több src/ ↔ production szinkronizálás
- Kevesebb konfúzió, egyszerűbb karbantartás

### ✅ ISPConfig Kompatibilitás

- Egy az egyben másolható a VPS-re
- `private/` és `web/` mappák ISPConfig konvenció szerint
- Automatikus környezet detektálás

### ✅ Biztonság

- Titkos kulcsok a `private/` mappában
- .env fájl védve Git-től és HTTP-től
- Egyedi hibaoldalak minden státuszkódhoz

### ✅ Fejlesztői Élmény

- Egyből ISPConfig struktúrában dolgozol
- Nincs külön "deploy előkészítés"
- Minden mappa a helyén van

## 🔄 Migráció Régi Struktúráról

Ha korábban az `src/` mappát használtad:

```bash
# A régi struktúrák archiválva vannak:
_legacy/src/
_legacy/ispconfig-structure/

# Az új struktúra:
web/        ← Ez az új fejlesztési és production mappa
private/    ← Új .env hely
```

## 📝 Tesztelés

### Helyi Tesztelés

```bash
# Főoldal
curl http://localhost:8081/

# Kapcsolat oldal
curl http://localhost:8081/contact.html

# Hibaoldal tesztek
curl http://localhost:8081/error/404.html
curl http://localhost:8081/error/500.html
```

### Production Tesztelés

```bash
# Főoldal
curl https://dozsa-apartman-szeged.hu

# .env védelem
curl https://dozsa-apartman-szeged.hu/../private/.env
# Várható: 403 Forbidden
```

## 🆘 Hibaelhárítás

### "PHP config nem találja a .env-t"

```bash
# Ellenőrizd a fájl létezését
ls -la private/.env

# Helyi fejlesztésnél:
cd dozsa-landing
test -f private/.env && echo "OK" || echo "HIÁNYZIK"

# Production-nél (SSH):
test -f /var/www/clients/client0/web1/private/.env && echo "OK" || echo "HIÁNYZIK"
```

### "Hibaoldalak nem működnek"

- **Helyi fejlesztésnél**: A PHP dev szerver (`php -S`) NEM támogatja a `.htaccess` fájlt
- **Production-nél**: Apache automatikusan átirányít a `web/error/*.html` oldalakra

### "rsync hibák deployment során"

```bash
# Ellenőrizd a web/ és private/ mappák létezését
ls -la web/ private/

# Ellenőrizd a deployment script beállításait
grep LOCAL deploy-to-ispconfig.sh
```

## 📚 További Dokumentáció

- [ISPCONFIG_DEPLOYMENT.md](ISPCONFIG_DEPLOYMENT.md) - Részletes deployment útmutató
- [ISPCONFIG_STRUKTURA.md](ISPCONFIG_STRUKTURA.md) - Régi vs új struktúra összehasonlítás
- [README.md](README.md) - Általános projekt dokumentáció
- [RECAPTCHA_SETUP.md](RECAPTCHA_SETUP.md) - reCAPTCHA beállítások

---

**Verzió**: 2.0
**Utolsó frissítés**: 2025-10-15
**ISPConfig kompatibilitás**: 3.3.0p3 ✅
**Struktúra**: Egységesített (fejlesztés = production) ✅
