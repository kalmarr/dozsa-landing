# Dózsa Apartman Szeged - Weboldal Áttervezési Specifikáció

## Projekt Áttekintés
A Mokka Apartman Szeged sablon átdolgozása Dózsa Apartman Szeged landing oldalra, megtartva az eredeti technológiai stacket, de teljes vizuális és tartalmi átdolgozással.

---

## 1. Technológiai Stack
- **Frontend**: Vanilla JavaScript, jQuery, Bootstrap 5, HTML5, CSS3
- **Backend**: PHP (email küldéshez)
- **Architektúra**: Single-page application responsive dizájnnal
- **Kompatibilitás**: Cross-browser support, mobile-first approach

---

## 2. Design Koncepció

### 2.1 Vizuális Stílus
- **Téma**: Polgári elegancia, klasszikus komfort
- **Hangulat**: Meleg, otthonos, vendégszerető

### 2.2 Színpaletta
- **Elsődleges szín**: Barna árnyalatok (#8B4513, #A0522D, #D2691E)
- **Másodlagos szín**: Világos barna/bézs (#F5DEB3, #DEB887, #FAEBD7)
- **Kiegészítő színek**: 
  - Fehér/off-white (#FFFAF0, #FAF0E6)
  - Arany akcent (#DAA520)
  - Sötét barna szöveghez (#5D4037, #3E2723)

### 2.3 Tipográfia
**Polgári stílusú betűtípusok (javasolt kombinációk):**
- **Címsorok**: Playfair Display, Merriweather, Crimson Text
- **Szövegtörzs**: Lora, Georgia, Source Serif Pro
- **Navigáció/gombok**: Montserrat (lighter weight), Open Sans

**Font hierarchy:**
- H1: 42-48px
- H2: 32-36px
- H3: 24-28px
- Body: 16-18px
- Small: 14px

---

## 3. Logo Implementáció
- **Nagy logo**: `DozsaApartmanSzegedLogo.png`
  - Használat: Header, Hero section
  - Méret: max-width 280px desktop, 180px mobile
  
- **Kis logo**: `DozsaApartmanSzegedKislogo.png`
  - Használat: Sticky navbar, footer, favicon
  - Méret: max-width 120px desktop, 80px mobile

---

## 4. Navigációs Struktúra

### 4.1 Főmenü (Fixed/Sticky Header)
```
LOGO | Home | Rólunk | Apartman | Kapcsolat | Ajánlatkérés (CTA gomb)
```

**Menüpontok funkciói:**
- **Home**: Smooth scroll a Hero sectionhöz
- **Rólunk**: Anchor link (#rolunk)
- **Apartman**: Anchor link (#apartman) - szobák és galéria
- **Kapcsolat**: Külön oldal (contact.html vagy contact.php)
- **Ajánlatkérés**: Modal popup vagy külön section (#ajanlatkeres)

**Mobile menu**: Hamburger menü, off-canvas slide-in

---

## 5. Oldal Szekciók

### 5.1 Hero Section (Slider)
**Funkció**: Teljes képernyős slideshow
**Képek helye**: `/images/slides/`
- slide-01.jpg
- slide-02.jpg
- slide-03.jpg
- slide-04.jpg
- slide-05.jpg

**Elemek a slideren:**
- Overlay: rgba barna gradient (opacity 0.3-0.5)
- Központi szöveg:
  ```
  H1: "Dózsa Apartman Szeged"
  Tagline: "Polgári elegancia a belváros szívében"
  CTA gomb: "Foglalás" → ajánlatkérés section
  ```

**Slider beállítások:**
- Autoplay: 5 másodperc
- Átmenet: Fade effect
- Navigation: Dots + arrows (barna szín)
- Ken Burns effect (enyhe zoom)

---

### 5.2 Rólunk Section (#rolunk)

**Layout**: 2 hasábos (desktop), 1 hasábos (mobile)
- **Bal oldal**: Szöveges tartalom
- **Jobb oldal**: Tulajdonosok fotója (Mónika & Róbert) vagy apartman exterior kép

**Tartalom:**
```html
<h2>Rólunk</h2>
<p>A Dózsa Apartman Szeged saját vállalkozás keretében működik, 
tulajdonosai Mónika és Róbert. Ingatlanunk 2019 végén teljes 
felújításon esett át azzal a céllal, hogy egy kényelmes, a mai 
kor elvárásainak megfelelő, modern apartmant hozzunk létre.</p>

<p>A vállalkozói életben eltöltött több mint 20 év során mindig 
is szolgáltatást nyújtottunk, amely közben mi magunk is 
megtapasztaltuk, hogy mennyire sokfélék az emberek és igényeik. 
Ezért hisszük azt, hogy egy nyaralás, kirándulás vagy akár üzleti 
utazás során mindenki számára fontos, hogy hol foglal szállást, 
és milyen körülmények között tölti az erre szánt időt.</p>

<p>Vendégszerető és barátságos szálláshelyet álmodtunk meg, 
amelyet a Dózsa Apartmanban valósítottunk meg. Vendégeinket 
személyesen fogadjuk, érkezésüket követően bemutatjuk az apartmant, 
a foglalt szobájukat, átadunk néhány hasznos információt, majd 
hagyjuk, hogy zavartalanul élvezzék tartózkodásukat.</p>

<p class="signature">Várjuk Önöket szeretettel Szegeden!<br>
<strong>Mónika & Róbert</strong></p>
```

**Design elemek:**
- Idézőjel ikon nagyított első bekezdéshez
- Aláírás kézírásos betűtípussal (opcionális)
- Háttér: világos bézs panel

---

### 5.3 Apartman Section (#apartman)

**Alcím**: "Az Apartman"

#### 5.3.1 Szobák bemutatása
**Layout**: Card-based, 2 column grid

**Szoba #1 - "Szoba 1" vagy névvel**
- Galéria: `room_01_*.jpg` képek
- Rövid leírás
- Felszereltség ikonokkal
- "Részletek" gomb → modal vagy expand

**Szoba #2 - "Szoba 2" vagy névvel**
- Galéria: `room_02_*.jpg` képek
- Rövid leírás
- Felszereltség ikonokkal
- "Részletek" gomb

#### 5.3.2 Fürdőszobák
**Layout**: 2 column grid vagy inline carousel

**Fürdőszoba #1**
- Képek: `furdo_01_*.jpg`

**Fürdőszoba #2**
- Képek: `furdo_02_*.jpg`

#### 5.3.3 Szűrt galéria
**Funkció**: Filterable image gallery (Isotope.js vagy egyedi jQuery)

**Kategóriák (filter gombok):**
- Összes
- Szobák
- Fürdőszobák
- Belső terek
- Külső

**Képek mappája:**
```
/images/gallery/
  rooms/
    room_01_001.jpg
    room_01_002.jpg
    room_02_001.jpg
    room_02_002.jpg
  bathrooms/
    furdo_01_001.jpg
    furdo_01_002.jpg
    furdo_02_001.jpg
    furdo_02_002.jpg
  interior/
    belso_001.jpg
    belso_002.jpg
  exterior/
    kulso_001.jpg
    kulso_002.jpg
```

**Lightbox**: Galéria nagyításhoz (pl. Fancybox, GLightbox)

#### 5.3.4 Alaprajz
**Külön subsection**: "Apartman alaprajz"
- Kép: `Dozsa-alaprajz.jpg`
- Zoom funkció
- Letöltés gomb (opcionális)

---

### 5.4 Értékelések Section (#ertekelesek)

**Cím**: "Vendégeink mondták" vagy "Értékelések"

**Forrás**: Booking.com értékelések
- URL: https://www.booking.com/hotel/hu/dozsa-apartman-szeged.hu.html
- CSS selector: `#basiclayout > div.hotelchars > div:nth-child(8) > div > div > div:nth-child(2) > div > div:nth-child(5) > div > div`

**Megjelenítés:**
- Carousel/slider formátum
- 3 értékelés látható egyszerre (desktop)
- 1 értékelés (mobile)

**Card struktúra:**
```html
<div class="review-card">
  <div class="stars">★★★★★</div>
  <blockquote>"[Értékelés szövege]"</blockquote>
  <cite>- [Vendég neve], [Dátum]</cite>
  <div class="booking-logo">Booking.com</div>
</div>
```

**Adatok gyűjtése:**
- Értékelő neve
- Értékelés szövege
- Csillagos értékelés
- Dátum
- Minimum 6-8 értékelés

---

### 5.5 Hasznos Információk Section (#info)

**Cím**: "Tudnivalók" vagy "Hasznos információk"

**Forrás**: Booking.com oldal további információi

**Layout**: Icon boxes vagy accordion

**Kategóriák:**
1. **Elhelyezkedés**
   - Cím: Szeged 6720, Dózsa utca 5
   - Térkép embed (Google Maps)
   - Távolságok (centrum, főbb látnivalók)

2. **Check-in / Check-out**
   - Bejelentkezés ideje
   - Kijelentkezés ideje
   - Szabályok

3. **Szolgáltatások**
   - WiFi
   - Parkolás
   - Konyha felszereltsége
   - Légkondicionálás
   - Egyéb felszereltség

4. **Házirend**
   - Dohányzás
   - Háziállatok
   - Zajszint
   - Egyéb szabályok

5. **Fizetés**
   - Elfogadott módok
   - Előleg
   - Lemondási feltételek

**Design**: 
- Ikonok minden kategóriához (Font Awesome)
- Barna/arany színű ikonok
- Accordion vagy tab-os megjelenítés

---

### 5.6 Ajánlatkérés Section (#ajanlatkeres)

**Cím**: "Ajánlatkérés" vagy "Foglaljon most!"

**Layout**: 2 column
- **Bal oldal**: Foglalási űrlap
- **Jobb oldal**: Foglalási naptár + összegző panel

#### 5.6.1 Foglalási naptár
**Funkció**: Date range picker
**Könyvtár javaslat**: 
- Flatpickr
- Litepicker
- AirBnb style date picker

**Funkciók:**
- Dátum tartomány kiválasztás
- Foglalt dátumok kikapcsolása (szürke)
- Minimum éjszaka szám (pl. 2 éj)
- Ár kalkuláció (opcionális)

**Integráció**: 
- Backend PHP-val vagy
- Booking.com widget beágyazás (alternatíva)

#### 5.6.2 Ajánlatkérő űrlap
```html
<form id="booking-form" method="POST" action="send-booking.php">
  
  <div class="form-group">
    <label>Név *</label>
    <input type="text" name="name" required>
  </div>
  
  <div class="form-group">
    <label>Email *</label>
    <input type="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label>Telefonszám *</label>
    <input type="tel" name="phone" required>
  </div>
  
  <div class="form-row">
    <div class="form-group col-md-6">
      <label>Érkezés *</label>
      <input type="text" id="checkin" name="checkin" required>
    </div>
    <div class="form-group col-md-6">
      <label>Távozás *</label>
      <input type="text" id="checkout" name="checkout" required>
    </div>
  </div>
  
  <div class="form-group">
    <label>Vendégek száma *</label>
    <select name="guests" required>
      <option value="">Válasszon...</option>
      <option value="1">1 fő</option>
      <option value="2">2 fő</option>
      <option value="3">3 fő</option>
      <option value="4">4 fő</option>
      <option value="5">5+ fő</option>
    </select>
  </div>
  
  <div class="form-group">
    <label>Üzenet</label>
    <textarea name="message" rows="4"></textarea>
  </div>
  
  <div class="form-group form-check">
    <input type="checkbox" id="privacy" required>
    <label for="privacy">
      Elfogadom az adatvédelmi szabályzatot *
    </label>
  </div>
  
  <button type="submit" class="btn btn-primary btn-lg">
    Ajánlatot kérek
  </button>
  
</form>
```

**PHP backend (send-booking.php):**
- Form validáció
- Email küldés tulajdonosnak és vendégnek
- SPAM védelem (honeypot, reCAPTCHA)
- Success/error üzenetek AJAX-szal

---

### 5.7 Kapcsolat Section/Oldal

**URL**: `contact.html` vagy `kapcsolat.html` (külön oldal)

**Layout**: Full-width vagy container

**Elemek:**

#### Kapcsolati információk
```
Dózsa Apartman Szeged
Szeged 6720, Dózsa utca 5

Mobil: [telefonszám]
Email: [email cím]

Tulajdonosok: Mónika & Róbert
```

#### Térkép
- Google Maps embed
- Marker az apartman pontos helyén
- Útvonaltervező link

#### Gyors kapcsolatfelvétel
- Egyszerűsített űrlap (név, email, üzenet)
- "Küldés" gomb

#### Social media linkek (ha vannak)
- Facebook
- Instagram
- Booking.com profil link

---

## 6. Footer

**Layout**: 3 column (desktop), stacked (mobile)

### 6.1 Bal hasáb - Logo & Rövid leírás
```
[Kis logo]
Dózsa Apartman Szeged
Polgári elegancia a belváros szívében
```

### 6.2 Középső hasáb - Gyors linkek
```
Rólunk
Apartman
Kapcsolat
Ajánlatkérés
Adatvédelem
ÁSZF
```

### 6.3 Jobb hasáb - Kapcsolat
```
📍 Szeged 6720, Dózsa utca 5
📧 [email]
📱 [telefon]

[Social ikonok]
```

### 6.4 Copyright sor
```
© 2025 Dózsa Apartman Szeged. Minden jog fenntartva.
Weboldal: [készítő neve]
```

---

## 7. Képek Struktúra

### 7.1 Mappa felépítés
```
/images/
  /logo/
    - DozsaApartmanSzegedLogo.png
    - DozsaApartmanSzegedKislogo.png
    - favicon.ico
  
  /slides/
    - slide-01.jpg
    - slide-02.jpg
    - slide-03.jpg
    - slide-04.jpg
    - slide-05.jpg
  
  /gallery/
    /rooms/
      - room_01_001.jpg
      - room_01_002.jpg
      - room_01_003.jpg
      - room_02_001.jpg
      - room_02_002.jpg
      - room_02_003.jpg
    
    /bathrooms/
      - furdo_01_001.jpg
      - furdo_01_002.jpg
      - furdo_02_001.jpg
      - furdo_02_002.jpg
    
    /interior/
      - belso_001.jpg (közös terek)
      - belso_002.jpg
      - belso_003.jpg
    
    /exterior/
      - kulso_001.jpg (épület külső)
      - kulso_002.jpg
      - kulso_003.jpg
  
  /floorplan/
    - Dozsa-alaprajz.jpg
  
  /about/
    - monika-robert.jpg (tulajdonosok)
```

### 7.2 Kép optimalizáció követelmények
- **Slider képek**: 1920x1080px, JPG, 85% quality, <300KB
- **Galéria képek**: 1200x800px, JPG, 85% quality, <200KB
- **Thumbnails**: 400x300px, progressive JPG
- **Logók**: PNG transparens háttérrel
- **Alaprajz**: High-res, zoom-olható

### 7.3 Lazy loading
- Minden galéria képre
- Native lazy loading: `loading="lazy"`
- Fallback: Intersection Observer API

---

## 8. Interaktivitás & Animációk

### 8.1 Scroll animációk
**Könyvtár**: AOS (Animate On Scroll)

**Alkalmazás:**
- Section fade-in
- Card slide-in
- Number counter (ha vannak statisztikák)

### 8.2 Hover effektek
- Menü elemek: underline animation
- Gombok: background transition, enyhe lift
- Képek: zoom overlay effect
- Cards: shadow növekedés

### 8.3 Loading states
- Űrlap submit: spinner
- Képek: skeleton loader vagy blur-up
- Page load: egyszerű loader (opcionális)

---

## 9. Responsivitás

### 9.1 Breakpointok
```css
/* Mobile first approach */
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+
```

### 9.2 Mobilra optimalizálás
- Touch-friendly gombok (min 44x44px)
- Hamburger menü
- Stacked layout
- Swipeable galéria
- Click-to-call telefonszámok
- Nagyobb szöveges tartalom

---

## 10. SEO & Meta információk

### 10.1 Meta tags
```html
<title>Dózsa Apartman Szeged - Polgári elegancia a belvárosban</title>
<meta name="description" content="Modern, felújított apartman 
Szeged belvárosában. Két szoba, két fürdőszoba, teljesen felszerelt. 
Ideális pároknak, családoknak, üzleti utazóknak.">
<meta name="keywords" content="apartman szeged, szállás szeged, 
dózsa apartman, szeged szálláshely, apartman bérbeadás szeged">

<!-- Open Graph -->
<meta property="og:title" content="Dózsa Apartman Szeged">
<meta property="og:description" content="[rövid leírás]">
<meta property="og:image" content="[slide kép URL]">
<meta property="og:url" content="https://dozsa-apartman-szeged.hu">

<!-- Structured Data - JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Accommodation",
  "name": "Dózsa Apartman Szeged",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Dózsa utca 5",
    "addressLocality": "Szeged",
    "postalCode": "6720",
    "addressCountry": "HU"
  },
  "telephone": "[telefonszám]",
  "image": "[képek]",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "[Booking.com-ről]",
    "reviewCount": "[darabszám]"
  }
}
</script>
```

### 10.2 Technikai SEO
- Semantic HTML5
- Alt text minden képen
- Proper heading hierarchy (H1→H2→H3)
- Clean URL structure
- Sitemap.xml
- Robots.txt
- Page speed optimization
- Mobile-friendly test pass

---

## 11. Teljesítmény Optimalizáció

### 11.1 Kritikus metrikák
- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1
- **PageSpeed Score**: >90

### 11.2 Optimalizálási technikák
- CSS/JS minification
- Képek compression & WebP format
- Lazy loading
- Critical CSS inline
- Defer non-critical JavaScript
- Browser caching
- CDN használat (Font Awesome, jQuery, stb.)

---

## 12. Böngésző Kompatibilitás

### 12.1 Támogatott böngészők
- Chrome (utolsó 2 verzió)
- Firefox (utolsó 2 verzió)
- Safari (utolsó 2 verzió)
- Edge (utolsó 2 verzió)
- Mobile Safari
- Chrome Mobile

### 12.2 Graceful degradation
- CSS Grid fallback → Flexbox
- Új CSS tulajdonságokhoz vendor prefixek
- JS feature detection

---

## 13. Kiegészítő Funkciók (Opcionális)

### 13.1 Nyelvválasztás
- Magyar (alapértelmezett)
- Angol (opcionális második nyelv)
- Language switcher a headerben

### 13.2 Cookie consent
- GDPR compliant banner
- Süti beállítások

### 13.3 Chat widget
- Facebook Messenger
- Tawk.to
- WhatsApp button (fix position, jobb alsó sarok)

### 13.4 Booking.com widget
- Beágyazott foglalási motor
- Vagy direkt link kiemelve

---

## 14. Tartalmi Jegyzetek Booking.com-ről

### 14.1 Gyűjtendő információk
A https://www.booking.com/hotel/hu/dozsa-apartman-szeged.hu.html oldalról:

**1. Értékelések (#basiclayout > div.hotelchars...)**
- Összes értékelés
- Átlagos pontszám
- Kategóriák szerinti bontás
- Vendég kommentek (legalább 6-8 db)

**2. Szolgáltatások lista**
- Szoba felszereltség
- Apartman szolgáltatások
- Közös területek
- Internet/WiFi

**3. Házirend részletek**
- Check-in/out idők
- Lemondási feltételek
- Előleg információ
- Különleges kérések kezelése

**4. Helyszín információk**
- Látványosságok távolsága
- Tömegközlekedés
- Repülőtér távolsága
- Parkolási infók

**5. Szoba típusok részletei**
- Szoba méretek
- Ágyak típusa
- Max. vendégszám
- Különleges tulajdonságok

**6. Fotók metaadatai**
- Kép címkék
- Szoba típus jelölések
- Területek besorolása

---

## 15. Projekt Átadási Csomag

### 15.1 Forrásfájlok
```
/dozsa-apartman-szeged/
  /css/
    - style.css (main stylesheet)
    - responsive.css
    - colors.css (color variables)
  
  /js/
    - main.js
    - slider.js
    - gallery.js
    - booking-calendar.js
    - form-validation.js
  
  /images/ (structure as above)
  
  /php/
    - send-booking.php
    - send-contact.php
    - config.php
  
  /fonts/ (if custom fonts)
  
  - index.html
  - contact.html
  - privacy.html (adatvédelem)
  - terms.html (ÁSZF)
  - sitemap.xml
  - robots.txt
  - .htaccess
  - README.md (dokumentáció)
```

### 15.2 Dokumentáció tartalom
- Telepítési útmutató
- Konfigurációs beállítások (email címek, API kulcsok)
- Képfeltöltési útmutató
- Szövegszerkesztési helyek
- Színkód referencia
- Gyakori hibaelhárítás

### 15.3 Tesztelési checklist
- [ ] Minden menüpont működik
- [ ] Űrlapok validációja működik
- [ ] Email küldés tesztelve
- [ ] Naptár foglalások mentése
- [ ] Galéria lightbox működik
- [ ] Responsive minden eszközön
- [ ] SEO meta tagek helyesek
- [ ] Betöltési sebesség optimális
- [ ] Cross-browser tesztelve
- [ ] Booking.com adatok aktuálisak

---

## 16. Ütemterv & Prioritások

### Fázis 1 - Alap struktúra (Prioritás: MAGAS)
- HTML váz létrehozása
- Navigáció implementálása
- Footer felépítése
- Színséma alkalmazása

### Fázis 2 - Tartalmi szekciók (Prioritás: MAGAS)
- Hero slider
- Rólunk section
- Apartman bemutató
- Alaprajz integráció

### Fázis 3 - Galéria & Interakció (Prioritás: KÖZEPES)
- Szűrt galéria rendszer
- Lightbox funkció
- Scroll animációk
- Hover effektek

### Fázis 4 - Foglalási rendszer (Prioritás: MAGAS)
- Naptár implementáció
- Ajánlatkérő űrlap
- PHP backend email funkció
- Validáció

### Fázis 5 - Tartalom feltöltés (Prioritás: KÖZEPES)
- Booking.com értékelések gyűjtése
- Hasznos infók átemelése
- Képek optimalizálása és feltöltése
- Szövegek véglegesítése

### Fázis 6 - Finomhangolás (Prioritás: ALACSONY)
- SEO optimalizáció
- Teljesítmény tesztelés
- Böngésző tesztelés
- Mobilra optimalizálás ellenőrzés

### Fázis 7 - Átadás (Prioritás: MAGAS)
- Dokumentáció elkészítése
- Képzés a tulajdonosoknak
- Domain & hosting setup
- Éles indítás

---

## 17. Kontakt & Kapcsolódó Linkek

### Referencia oldalak
- **Eredeti sablon**: https://github.com/kalmarr/mokka-landing/tree/master/src
- **Eredeti weboldal**: https://mokka-apartman-szeged.hu/
- **Booking.com profil**: https://www.booking.com/hotel/hu/dozsa-apartman-szeged.hu.html

### Design inspirációk keresése
- Polgári stílusú szálláshelyek
- Boutique apartmanok
- Meleg színű landing page-ek
- Klasszikus elegáns weboldalak

---

## 18. Egyéb Megjegyzések

### Szöveges tartalom hangneme
- Professzionális, de barátságos
- Személyes (Mónika & Róbert említése)
- Vendégcentrikus
- Hívogató, nem agresszív értékesítés

### Márka személyiség
- Megbízható
- Otthonos
- Klasszikus értékeket képviselő
- Figyelmesen vendégszerető
- Helyi kötődésű (Szeged)

### Call-to-Action stratégia
- Elsődleges CTA: "Ajánlatot kérek" / "Foglalás"
- Másodlagos CTA: "Bővebb információ"
- Puha CTA: "Írjon nekünks"

---

**Ez a specifikáció tartalmazza az összes szükséges információt a Dózsa Apartman Szeged weboldal kifejlesztéséhez. A dokumentum referencia anyagként szolgál a fejlesztő számára, és biztosítja, hogy minden követelmény egyértelmű és megvalósítható legyen.**