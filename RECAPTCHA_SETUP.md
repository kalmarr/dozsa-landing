# Google reCAPTCHA v2 Setup

Ez a dokumentum leírja a Google reCAPTCHA v2 (Invisible) konfigurációját.

## Áttekintés

Az alkalmazás Google reCAPTCHA v2 Invisible-t használ spam és bot védelem céljából. A reCAPTCHA integrálva van az alábbi űrlapokban:

- **Kapcsolat űrlap** (`contact.html`)
- **Ajánlatkérés űrlap** (`index.html#ajanlatkeres`)

## Konfiguráció

### Site Key (Nyilvános kulcs)
```
6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm
```

Ez a kulcs már be van ágyazva a HTML fájlokba és JavaScript kódba.

### Secret Key (Szerver kulcs)

**FONTOS BIZTONSÁGI MEGJEGYZÉS:**
A Secret Key-t SOHA ne tárold verziókezelőben vagy nyilvános fájlokban!

A Secret Key-t a következő helyeken kell beállítani:

#### Opció 1: .env fájl (Fejlesztéshez)
1. Másold a `.env.example` fájlt `.env` néven
2. Állítsd be a `RECAPTCHA_SECRET_KEY` értékét
3. A `.env` fájl automatikusan betöltődik (lásd: `src/php/config.php`)

#### Opció 2: ISPConfig Environment Variables (Production)
1. ISPConfig Admin Panel → Websites → Options
2. Állítsd be a `RECAPTCHA_SECRET_KEY` környezeti változót
3. A rendszer automatikusan olvassa ezt

**Új kulcsok generálása:**
1. Látogasd meg: [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Generálj új kulcspárt (v2 Invisible)
3. Állítsd be a domain-eket
4. Másold ki a Secret Key-t és állítsd be a fenti módok egyikével

## Hogyan működik?

### Frontend (JavaScript)

A reCAPTCHA v2 Invisible automatikusan generál egy tokent, amikor a felhasználó elküldi az űrlapot:

```javascript
grecaptcha.ready(function() {
    grecaptcha.execute('SITE_KEY').then(function(token) {
        // Token hozzáadása az űrlaphoz
        formData.append('g-recaptcha-response', token);
        // Űrlap elküldése
    });
});
```

**Megjegyzés:** A v2-ben nincs `action` paraméter (az csak v3-ban van).

### Backend (PHP)

A szerver ellenőrzi a tokent a Google API-val:

```php
require_once 'php/recaptcha-validator.php';

$token = $_POST['g-recaptcha-response'];
$result = verifyRecaptcha($token);

if ($result['success']) {
    // Token érvényes, folytatás
} else {
    // Token érvénytelen, hiba
}
```

## Fájlok

### Frontend
- `src/contact.html` - Kapcsolat űrlap reCAPTCHA integrációval
- `src/index.html` - Ajánlatkérés űrlap reCAPTCHA integrációval
- `src/js/wizard.js` - Ajánlatkérés wizard reCAPTCHA implementációval

### Backend
- `src/php/recaptcha-validator.php` - reCAPTCHA validációs logika
- `src/php/send-contact.php` - Kapcsolat űrlap backend validációval
- `src/api/quote-request.php` - Ajánlatkérés backend validációval

## Tesztelés

A reCAPTCHA működését a következő módon tesztelheti:

### 1. Debug oldal (AJÁNLOTT)
```
http://localhost:8020/recaptcha-debug.html
```
Ez az oldal:
- Ellenőrzi, hogy a reCAPTCHA script betöltődött-e
- Tesztel token generálást
- Tesztel űrlap beküldést

### 2. CLI teszt
```bash
docker-compose exec web php /var/www/html/test-recaptcha.php
```

### 3. Böngészőben
1. Nyissa meg: http://localhost:8020/contact.html
2. Töltse ki az űrlapot
3. Küldje el
4. Ha sikeres, megjelenik a sikeres üzenet

## Hibaelhárítás

### "reCAPTCHA token hiányzik" hiba

- Ellenőrizze, hogy a JavaScript helyesen töltődik-be
- Ellenőrizze a böngésző konzolt hibákért
- Győződjön meg róla, hogy a `grecaptcha` objektum létezik

### "reCAPTCHA validation failed" hiba

- Ellenőrizze, hogy a Secret Key helyesen van-e beállítva
- Ellenőrizze, hogy a domain engedélyezett-e a reCAPTCHA konzolon
- Ellenőrizze a server logokat részletesebb hibáért

### "Failed to verify reCAPTCHA" hiba

- Ellenőrizze az internetkapcsolatot a szerverről
- Ellenőrizze, hogy a firewall nem blokkolja a `www.google.com` domain-t

### Konzol hibák: "web-client-content-script.js" vagy "content.js"

Ezek a hibák **böngésző extension-ökből** származnak (pl. jelszókezelő, reklámblokkoló) és **NEM befolyásolják** a reCAPTCHA működését. Nyugodtan figyelmen kívül hagyhatók.

### "Invalid site key or not loaded in api.js" hiba

- Ez azt jelenti, hogy a reCAPTCHA script még nem töltődött be
- A `grecaptcha.ready()` megoldja ezt automatikusan
- **v2**: NE használjon `{action: 'name'}` paramétert az execute-ben (az csak v3-ban van)

## reCAPTCHA típusok

Ez az implementáció **v2 Invisible** reCAPTCHA-t használ, ami:
- ✅ Automatikusan fut a háttérben
- ✅ Nem zavarja a felhasználói élményt
- ✅ Csak gyanús esetekben kér challenge-et
- ✅ Egyszerű integráció

## További információk

- [Google reCAPTCHA v2 dokumentáció](https://developers.google.com/recaptcha/docs/display)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)

## Támogatás

Ha kérdése van, forduljon a fejlesztőhöz vagy a rendszergazdához.
