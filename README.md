# Dózsa Apartman Szeged - Landing Oldal

Modern, reszponzív weboldal a Dózsa Apartman Szeged számára, polgári elegancia stílusban.

## 🎨 Technológiai Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla + jQuery)
- **Framework**: Bootstrap 5
- **Animációk**: AOS (Animate On Scroll)
- **Galéria**: GLightbox
- **Backend**: PHP (email küldés)
- **Dizájn**: Mobile-first, responsive

## 📁 Projekt Struktúra

```
dozsa-landing/
├── index.html              # Főoldal
├── contact.html            # Kapcsolati oldal
├── css/
│   ├── colors.css         # Színséma változók
│   ├── style.css          # Fő stílusok
│   └── responsive.css     # Reszponzív stílusok
├── js/
│   ├── main.js            # Fő JavaScript funkciók
│   ├── slider.js          # Hero slider
│   └── gallery.js         # Galéria szűrés és megjelenítés
├── php/
│   ├── config.php         # Konfiguráció
│   └── send-contact.php   # Kapcsolati űrlap kezelő
├── images/
│   ├── logo/              # Logók
│   ├── slides/            # Hero slider képek
│   ├── gallery/           # Galéria képek
│   │   ├── rooms/         # Szobák
│   │   ├── bathrooms/     # Fürdőszobák
│   │   ├── interior/      # Belső terek
│   │   └── exterior/      # Külső képek
│   ├── floorplan/         # Alaprajz
│   └── about/             # Rólunk szekció képek
└── README.md

```

## 🎨 Színpaletta

- **Elsődleges**: Barna árnyalatok (#8B4513, #A0522D, #D2691E)
- **Másodlagos**: Világos barna/bézs (#F5DEB3, #DEB887, #FAEBD7)
- **Akcent**: Arany (#DAA520)
- **Szöveg**: Sötét barna (#5D4037, #3E2723)

## 🚀 Telepítés

1. Másolja a fájlokat a webszerver könyvtárába
2. Állítsa be az email címeket a `php/config.php` fájlban
3. Győződjön meg róla, hogy a PHP mail() funkció működik a szerveren
4. Nyissa meg a böngészőben az `index.html` fájlt

## ⚙️ Konfiguráció

### Email Beállítások

Szerkessze a `php/config.php` fájlt:

```php
define('ADMIN_EMAIL', 'info@dozsa-apartman-szeged.hu');
define('FROM_EMAIL', 'noreply@dozsa-apartman-szeged.hu');
```

### Google Maps

Cserélje le a térképet a `contact.html` fájlban a pontos koordinátákkal.

## 📱 Funkciók

### Főoldal (index.html)
- ✅ Hero slider automatikus lejátszással
- ✅ Rólunk szekció tulajdonos bemutatóval
- ✅ Apartman szekció szobák bemutatásával
- ✅ Szűrhető galéria (Szobák, Fürdőszobák, Belső, Külső)
- ✅ Alaprajz nagyítással
- ✅ Smooth scroll navigáció

### Kapcsolat (contact.html)
- ✅ Kapcsolati űrlap validációval
- ✅ Spam védelem (honeypot + rate limiting)
- ✅ Google Maps integráció
- ✅ Email értesítések

### JavaScript Funkciók
- ✅ Automatikus képváltó slider
- ✅ Galéria szűrés kategóriák szerint
- ✅ Lightbox galéria nagyításhoz
- ✅ Smooth scrolling
- ✅ Sticky navigáció
- ✅ Lazy loading képekhez
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

## 📝 Teendők (További Fejlesztések)

- [ ] Booking.com értékelések integrálása
- [ ] Ajánlatkérő űrlap foglalási naptárral
- [ ] Cookie consent banner (GDPR)
- [ ] Többnyelvűség (angol)
- [ ] SEO optimalizáció
- [ ] Performance optimalizáció
- [ ] Sitemap.xml generálása
- [ ] robots.txt létrehozása

## 👥 Kapcsolat

**Dózsa Apartman Szeged**
- Cím: Szeged 6720, Dózsa utca 5
- Email: info@dozsa-apartman-szeged.hu
- Tulajdonosok: Mónika & Róbert

## 📄 Licenc

© 2025 Dózsa Apartman Szeged. Minden jog fenntartva.
