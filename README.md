# Dózsa Apartman Szeged - Landing Oldal

Modern, biztonságos, reszponzív weboldal a Dózsa Apartman Szeged számára, polgári elegancia stílusban.
**ISPConfig 3.3.0p3 kompatibilis | PHP 7.4 | Ubuntu 20.04**

## 🎨 Technológiai Stack

### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla + jQuery)
- **Framework**: Bootstrap 5.3
- **Animációk**: AOS (Animate On Scroll)
- **Galéria**: GLightbox
- **Ikonok**: Font Awesome 6.4
- **Dizájn**: Mobile-first, responsive

### Backend
- **PHP**: 7.4+ (ISPConfig kompatibilis)
- **reCAPTCHA**: Google reCAPTCHA v2 Invisible
- **Email**: Native PHP mail() + Postfix
- **Environment**: .env fájl kezelés

### Server
- **ISPConfig**: 3.3.0p3
- **Apache**: 2.4+ (.htaccess)
- **OS**: Ubuntu 20.04 LTS
- **Database**: MariaDB 10.3 (nincs használva)

## 📁 Projekt Struktúra

**Az alapértelmezett struktúra most már ISPConfig 3.3.0p3 kompatibilis!**

```
dozsa-landing/              # 🏠 Projekt gyökér (ISPConfig-ready)
├── private/                # ⚠️ NEM PUBLIKUS (HTTP-n nem elérhető)
│   ├── .env.example        # Környezeti változók sablon
│   └── .env                # Production/dev környezeti változók (git ignore)
│
├── web/                    # ✅ PUBLIKUS webroot (DocumentRoot)
│   ├── index.html          # Főoldal
│   ├── contact.html        # Kapcsolati oldal
│   ├── .htaccess           # Apache konfiguráció
│   ├── css/                # Stíluslapok
│   │   ├── colors.css
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/                 # JavaScript fájlok
│   │   ├── main.js
│   │   ├── slider.js
│   │   └── gallery.js
│   ├── images/             # Képek
│   │   ├── logo/
│   │   ├── slides/
│   │   ├── gallery/
│   │   ├── floorplan/
│   │   └── about/
│   ├── php/                # Backend fájlok
│   │   ├── config.php      # Auto-detektálja a környezetet
│   │   ├── send-contact.php
│   │   ├── send-booking.php
│   │   └── recaptcha-validator.php
│   ├── api/                # API endpointok
│   └── error/              # Egyedi hibaoldalak (400-503)
│       ├── 400.html
│       ├── 401.html
│       ├── 403.html
│       ├── 404.html
│       ├── 500.html
│       ├── 502.html
│       └── 503.html
│
├── _legacy/                # Archivált régi struktúrák (nem használt)
│   ├── src/
│   └── ispconfig-structure/
│
└── [dokumentáció fájlok]   # .md fájlok
```

### Környezet Automatikus Detektálása

A `web/php/config.php` automatikusan felismeri, hogy hol fut:

1. **ISPConfig VPS Production**:
   - Útvonal: `/var/www/clients/client[X]/web[Y]/web/php/config.php`
   - .env: `/var/www/clients/client[X]/web[Y]/private/.env`

2. **Helyi Fejlesztés**:
   - Útvonal: `dozsa-landing/web/php/config.php`
   - .env: `dozsa-landing/private/.env`

**Részletes struktúra dokumentáció**: [ISPCONFIG_STRUKTURA.md](ISPCONFIG_STRUKTURA.md)

## 🎨 Színpaletta

- **Elsődleges**: Barna árnyalatok (#8B4513, #A0522D, #D2691E)
- **Másodlagos**: Világos barna/bézs (#F5DEB3, #DEB887, #FAEBD7)
- **Akcent**: Arany (#DAA520)
- **Szöveg**: Sötét barna (#5D4037, #3E2723)

## 🚀 Gyors Telepítés

### Helyi Fejlesztés

```bash
# 1. Klónozd a repository-t
git clone https://github.com/your-repo/dozsa-landing.git
cd dozsa-landing

# 2. Hozd létre a .env fájlt
cp private/.env.example private/.env
nano private/.env  # Állítsd be a RECAPTCHA_SECRET_KEY-t

# 3. Indítsd el a PHP dev szervert
cd web
php -S localhost:8081

# 4. Nyisd meg a böngészőben
# http://localhost:8081
```

### ISPConfig VPS Telepítés

**Automatikus Deploy:**

```bash
# 1. Konfiguráld a deploy scriptet
nano deploy-to-ispconfig.sh
# Állítsd be: REMOTE_USER, REMOTE_HOST, REMOTE_PATH

# 2. Futtasd a deployment scriptet
chmod +x deploy-to-ispconfig.sh
./deploy-to-ispconfig.sh
```

**Manuális Telepítés:**

Részletes útmutató: [ISPCONFIG_DEPLOYMENT.md](ISPCONFIG_DEPLOYMENT.md)

1. **ISPConfig Website létrehozás** (PHP-FPM 7.4)
2. **Fájlok feltöltése**:
   ```bash
   rsync -avz web/ user@host:/var/www/clients/client0/web1/web/
   ```
3. **.env fájl beállítása**:
   ```bash
   scp private/.env user@host:/var/www/clients/client0/web1/private/.env
   ```
4. **reCAPTCHA kulcs**: Generálj újat [itt](https://www.google.com/recaptcha/admin)
5. **Jogosultságok**:
   ```bash
   chmod 700 private/
   chmod 600 private/.env
   ```

## ⚙️ Konfiguráció

### Környezeti Változók (.env)

A `private/.env` fájl tartalmazza a titkos kulcsokat:

```bash
# reCAPTCHA
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Email
ADMIN_EMAIL=info@dozsaszeged.hu
FROM_EMAIL=info@dozsaszeged.hu

# Site
SITE_NAME="Dózsa Apartman Szeged"
SITE_URL=https://dozsa-apartman-szeged.hu
```

**⚠️ FONTOS**: A `.env` fájl NEM kerül Git-be! Használd a `.env.example` példát.

## 📱 Funkciók

### Főoldal (index.html)
- ✅ Hero slider automatikus lejátszással
- ✅ Rólunk szekció tulajdonos bemutatóval
- ✅ Apartman szekció szobák bemutatásával
- ✅ Ajánlatkérő wizard (3 lépéses foglalási folyamat)
- ✅ Szűrhető galéria (Fürdőszobák, Belső, Külső)
- ✅ Alaprajz nagyítással
- ✅ Smooth scroll navigáció

### Kapcsolat (contact.html)
- ✅ Kapcsolati űrlap validációval
- ✅ reCAPTCHA v2 Invisible bot védelem
- ✅ Spam védelem (honeypot + rate limiting)
- ✅ Email header injection védelem
- ✅ Google Maps integráció
- ✅ Email értesítések (admin + visszaigazolás)

### Biztonsági Funkciók
- ✅ Environment variables (.env)
- ✅ reCAPTCHA v2 Invisible
- ✅ Rate limiting (5 kérés/óra)
- ✅ Honeypot spam védelem
- ✅ Email header injection védelem
- ✅ XSS védelem (htmlspecialchars)
- ✅ Security headers (.htaccess)
- ✅ .env fájl védelem
- ✅ Egyedi hibaoldalak (400, 401, 403, 404, 500, 502, 503)

### JavaScript Funkciók
- ✅ Automatikus képváltó slider
- ✅ Galéria szűrés kategóriák szerint
- ✅ Lightbox galéria nagyításhoz
- ✅ Ajánlatkérő wizard (3 lépés: vendégek → dátum → adatok)
- ✅ Smooth scrolling
- ✅ Sticky navigáció
- ✅ AOS animációk

## 🖼️ Képek Követelményei

- **Slider képek**: 1920x1080px, JPG, <300KB
- **Galéria képek**: 1200x800px, JPG, <200KB
- **Logók**: PNG átlátszó háttérrel
- **Alaprajz**: Magas felbontás, zoom-olható

## 🔧 Fejlesztési Jegyzetek

### CSS Változók
Minden szín a `css/colors.css` fájlban definiálva CSS változókként.

### Reszponzivitás
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

### Böngésző Támogatás
- Chrome (utolsó 2 verzió)
- Firefox (utolsó 2 verzió)
- Safari (utolsó 2 verzió)
- Edge (utolsó 2 verzió)

## 🧪 Tesztelés

### Production Tesztek

1. **Főoldal**: https://dozsa-apartman-szeged.hu
2. **Kapcsolat űrlap**: Töltsd ki és küldd el
3. **Ajánlatkérés wizard**: Végezd el a 3 lépést
4. **Hibaoldalak**: /error/404.html, /error/500.html
5. **Biztonság**: `.env` fájl nem elérhető HTTP-n

### Biztonsági Tesztek

```bash
# .env védelem
curl https://dozsa-apartman-szeged.hu/.env
# Várható: 403 Forbidden

# private/.env védelem
curl https://dozsa-apartman-szeged.hu/../private/.env
# Várható: 403 Forbidden
```

## 🔧 Hibaelhárítás

### "reCAPTCHA validation failed"
- Ellenőrizd: `.env` fájl `RECAPTCHA_SECRET_KEY` helyes?
- Domain megfelelő a reCAPTCHA konzolon?

### "Email not sending"
- Ellenőrizd: `tail -f /var/log/mail.log`
- SPF/DKIM beállítva?

### "500 Internal Server Error"
- Nézd meg: Apache error log
- PHP syntax: `php -l web/php/config.php`

**Részletes troubleshooting**: [ISPCONFIG_DEPLOYMENT.md](ISPCONFIG_DEPLOYMENT.md#9-hibaelhárítás)

## 📝 További Fejlesztések

- [ ] Booking.com értékelések integrálása
- [ ] Online foglalási naptár szinkronizáció
- [ ] Cookie consent banner (GDPR)
- [ ] Többnyelvűség (angol)
- [ ] Sitemap.xml generálása
- [ ] robots.txt létrehozása
- [x] ✅ reCAPTCHA v2 integráció
- [x] ✅ Ajánlatkérő wizard (3 lépéses)
- [x] ✅ Hibaoldalak (400-503)
- [x] ✅ ISPConfig deployment

## 👥 Kapcsolat

**Dózsa Apartman Szeged**
- Cím: Szeged 6720, Dózsa utca 5
- Email: info@dozsa-apartman-szeged.hu
- Tulajdonosok: Mónika & Róbert

## 📄 Licenc

© 2025 Dózsa Apartman Szeged. Minden jog fenntartva.
