# Sitemap Generálás - Dózsa Apartman Szeged

## Áttekintés

Ez a dokumentáció a Dózsa Apartman Szeged weboldal automatikus sitemap generálását írja le. A sitemap Google által elfogadott formátumban készül, és segít a keresőmotoroknak feltérképezni az oldal struktúráját.

## Fájlok

- **`generate-sitemap.js`** - Fő Node.js script a sitemap generáláshoz
- **`web/sitemap.xml`** - Generált sitemap fájl (Google Search Console számára)
- **`web/robots.txt`** - Robots fájl sitemap referenciával

## Használat

### Sitemap generálás

```bash
npm run sitemap
```

Ez a parancs:
1. Beolvassa a `web/` könyvtárban található HTML fájlokat
2. Létrehozza a `web/sitemap.xml` fájlt
3. Automatikusan beállítja a prioritásokat és módosítási dátumokat

### Watch mód (fejlesztéshez)

```bash
npm run sitemap:watch
```

Ez a parancs automatikusan újragenerálja a sitemapet, amikor HTML vagy JS fájlokat módosítasz a `web/` könyvtárban.

**Megjegyzés:** A watch módhoz telepíteni kell a `nodemon` csomagot:
```bash
npm install --save-dev nodemon
```

## Konfiguráció

A sitemap beállításai a `generate-sitemap.js` fájlban találhatók:

```javascript
const CONFIG = {
  baseUrl: 'https://dozsa-apartman-szeged.hu',
  webDir: path.join(__dirname, 'web'),
  outputPath: path.join(__dirname, 'web', 'sitemap.xml'),

  // Alapértelmezett értékek
  defaults: {
    changefreq: 'weekly',
    priority: '0.5'
  },

  // Oldalak konfigurációja
  pages: [
    {
      loc: '/',
      changefreq: 'weekly',
      priority: '1.0',
      file: 'index.html'
    },
    {
      loc: '/contact.html',
      changefreq: 'monthly',
      priority: '0.8',
      file: 'contact.html'
    }
  ]
}
```

### Új oldal hozzáadása

1. Nyisd meg a `generate-sitemap.js` fájlt
2. Add hozzá az új oldalt a `CONFIG.pages` tömbhöz:

```javascript
{
  loc: '/new-page.html',
  changefreq: 'monthly',  // yearly | monthly | weekly | daily
  priority: '0.7',         // 0.0 - 1.0
  file: 'new-page.html'
}
```

3. Futtasd újra a generálást: `npm run sitemap`

## Prioritások és frissítési gyakoriság

### Priority (Prioritás)
- **1.0** - Főoldal
- **0.8** - Fontos aloldalak (kapcsolat, ajánlatkérés)
- **0.5** - Normál aloldalak
- **0.3** - Kiegészítő oldalak (adatvédelem, ÁSZF)

### Changefreq (Frissítési gyakoriság)
- **daily** - Napi változások (nem használt)
- **weekly** - Heti változások (főoldal)
- **monthly** - Havi változások (kapcsolat, galéria)
- **yearly** - Éves változások (adatvédelem, ÁSZF)

## Google Search Console beállítás

### 1. Sitemap feltöltése
A generált `sitemap.xml` fájl már a `web/` könyvtárban van, így az ISPConfig telepítéssel együtt automatikusan elérhető lesz:
```
https://dozsa-apartman-szeged.hu/sitemap.xml
```

### 2. Beküldés a Google Search Console-ba

1. Látogass el a [Google Search Console](https://search.google.com/search-console)-ra
2. Válaszd ki a tulajdonságodat (dozsa-apartman-szeged.hu)
3. Navigálj a **Sitemaps** menüpontra (bal oldali menü)
4. Írd be: `sitemap.xml`
5. Kattints a **Submit** gombra

### 3. Ellenőrzés

A sitemap állapotát a Google Search Console-ban ellenőrizheted:
- **Success** - A sitemap sikeresen feldolgozva
- **Errors** - Hibák történtek (javítsd a hibákat és küldd be újra)
- **Warnings** - Figyelmeztetések (nem kritikus, de érdemes átnézni)

## Validálás

### Online validálás

1. **XML Sitemaps Validator**
   - URL: https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Másold be a sitemap URL-t: `https://dozsa-apartman-szeged.hu/sitemap.xml`

2. **Google Search Console**
   - Automatikus validálás beküldéskor

### Lokális ellenőrzés

```bash
# Sitemap megjelenítése
cat web/sitemap.xml

# XML szintaxis ellenőrzés
xmllint --noout web/sitemap.xml
```

## robots.txt

A `web/robots.txt` fájl tartalmazza a sitemap referenciát:

```
User-agent: *
Allow: /

# Exclude error pages
Disallow: /error/

# Sitemap location
Sitemap: https://dozsa-apartman-szeged.hu/sitemap.xml
```

A robots.txt tesztelése a Google Search Console-ban:
1. Navigálj a **Settings** > **robots.txt Tester** menüpontra
2. Ellenőrizd a szabályokat

## Automatikus deployálás

A sitemap generálás integrálható a deployment folyamatba:

```bash
# Példa: deploy script
npm run sitemap
rsync -a web/ user@server:/var/www/html/
```

Vagy hozzáadhatod a `package.json`-hoz:

```json
"scripts": {
  "predeploy": "npm run sitemap",
  "deploy": "rsync -a web/ user@server:/var/www/html/"
}
```

## Gyakori hibák és megoldások

### 1. "File not found" hiba
**Probléma:** A konfigurált HTML fájl nem létezik.
**Megoldás:** Kommenteld ki vagy távolítsd el a nem létező fájlt a konfigurációból.

### 2. Hibás lastmod dátum
**Probléma:** A módosítási dátum nem megfelelő formátumban van.
**Megoldás:** A script automatikusan a fájl utolsó módosítási dátumát használja W3C formátumban (YYYY-MM-DD).

### 3. Sitemap nem frissül a Google-ben
**Probléma:** A Google nem láta a frissített sitemapet.
**Megoldás:**
- Ellenőrizd, hogy a sitemap.xml elérhető-e: https://dozsa-apartman-szeged.hu/sitemap.xml
- Küldd be újra a Google Search Console-ban
- Várj néhány napot, amíg a Google újra crawl-olja az oldalt

## Bővítési lehetőségek

### Sitemap Index (több fájl esetén)

Ha az oldal több mint 50,000 URL-t tartalmaz (ami nem valószínű ennél a projektnél), akkor sitemap indexet kell létrehozni:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://dozsa-apartman-szeged.hu/sitemap-pages.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://dozsa-apartman-szeged.hu/sitemap-images.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
</sitemapindex>
```

### Képek sitemap

Kép-specifikus sitemap hozzáadható a képgalériához:

```xml
<url>
  <loc>https://dozsa-apartman-szeged.hu/</loc>
  <image:image>
    <image:loc>https://dozsa-apartman-szeged.hu/images/gallery/rooms/room_01_001.jpg</image:loc>
    <image:caption>Szoba 1 - Modern berendezés</image:caption>
  </image:image>
</url>
```

### Videó sitemap

Ha videókat adsz hozzá az oldalhoz:

```xml
<url>
  <loc>https://dozsa-apartman-szeged.hu/videos</loc>
  <video:video>
    <video:thumbnail_loc>https://dozsa-apartman-szeged.hu/images/video-thumb.jpg</video:thumbnail_loc>
    <video:title>Apartman bemutató</video:title>
    <video:description>Videó bemutató a Dózsa Apartmanról</video:description>
  </video:video>
</url>
```

## További információk

- [Google Sitemap dokumentáció](https://developers.google.com/search/docs/advanced/sitemaps/overview)
- [Sitemaps.org protokoll](https://www.sitemaps.org/protocol.html)
- [Google Search Console súgó](https://support.google.com/webmasters/answer/7451001)

## Támogatás

Ha kérdésed van vagy problémába ütközöl, nézd meg a következőket:
1. Ellenőrizd a generálás kimenetét: `npm run sitemap`
2. Validáld a sitemap.xml-t online validátorral
3. Nézd meg a Google Search Console hibaüzeneteit
