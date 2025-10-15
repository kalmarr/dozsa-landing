# reCAPTCHA Debug Útmutató

## A probléma
A contact form nem küldi el az emaileket, mert a reCAPTCHA validáció sikertelen.

Backend válasz:
```json
{"success":false,"message":"Biztonsági ellenőrzés sikertelen"}
```

## 🔍 MÓDSZER 1: Debug HTML oldal (AJÁNLOTT)

### 1. Feltöltés
Töltsd fel a `src/debug-recaptcha.html` fájlt az éles szerverre:
```
/var/www/clients/client0/web9/web/debug-recaptcha.html
```

### 2. Megnyitás böngészőben
Nyisd meg:
```
https://dozsa-apartman-szeged.hu/debug-recaptcha.html
```

### 3. Teszt futtatása
Kattints a **"▶️ Diagnosztika futtatása"** gombra

### 4. Eredmény elküldése
Kattints a **"📋 Eredmény másolása"** gombra, majd küldd el nekem a teljes szöveget

---

## 🔍 MÓDSZER 2: Konzol script

### 1. Nyisd meg az éles oldalt
```
https://dozsa-apartman-szeged.hu/contact.html
```

### 2. Nyisd meg a Developer Tools-t
Nyomj **F12**-t vagy jobb klikk → **"Vizsgálat"**

### 3. Console fül
Kattints a **"Console"** fülre

### 4. Script beillesztése
Nyisd meg a `debug-recaptcha.js` fájlt, másold ki a teljes tartalmát és illeszd be a konzolba, majd nyomj **Enter**-t

### 5. Eredmény elküldése
Másold ki az ÖSSZES output-ot és küldd el nekem

---

## 🧪 MÓDSZER 3: Widget teszt (ha a Módszer 1 már fut)

A debug-recaptcha.html oldalon kattints a **"🧪 Contact form widget tesztelése"** gombra

Ez megpróbálja önállóan inicializálni a reCAPTCHA widget-et és token-t generálni.

Ha ez működik → a contact.html kódjában van a hiba
Ha ez NEM működik → a reCAPTCHA API vagy a site key hibás

---

## 📊 Mit keresünk?

### ✅ Sikeres működés esetén látni kell:
- ✅ grecaptcha object: LOADED
- ✅ onRecaptchaLoad function: DEFINED
- ✅ recaptchaWidgetId: 0 vagy más szám (NEM "NOT SET")
- ✅ reCAPTCHA container: EXISTS
- ✅ reCAPTCHA badge: FOUND

### ❌ Hiba esetén valószínűleg látni fogjuk:
- ❌ recaptchaWidgetId: NOT SET
- ❌ grecaptcha object: NOT LOADED
- ❌ reCAPTCHA badge: NOT FOUND

---

## 🔧 Lehetséges hibák és megoldások

### 1. "grecaptcha object: NOT LOADED"
**Probléma:** A reCAPTCHA script nem töltődött be
**Megoldás:** Ellenőrizd a script tag-et contact.html-ben (126. sor)

### 2. "recaptchaWidgetId: NOT SET"
**Probléma:** Az onRecaptchaLoad() függvény nem lett meghívva
**Megoldás:** Script tag onload paraméter rossz vagy a függvény neve eltér

### 3. "Invalid site key"
**Probléma:** Rossz site key
**Megoldás:** Ellenőrizd hogy `6LeLt-grAAAAAC5ac9164bwHkMmOYqw3buk90Xvm` használjuk-e

### 4. Widget működik, de backend visszautasítja
**Probléma:** Rossz secret key a backend-en
**Megoldás:** Ellenőrizd recaptcha-validator.php secret key-t

---

## 📝 Következő lépések

1. Futtasd a debug tool-t (Módszer 1 vagy 2)
2. Küldd el nekem a teljes output-ot
3. Az eredmény alapján pontosan látni fogjuk hol van a hiba
4. Javítjuk a problémát

---

## 🆘 Gyors segítség

Ha nem sikerül a debug tool futtatása, próbáld ezt:

1. Nyisd meg: https://dozsa-apartman-szeged.hu/contact.html
2. Nyomj F12
3. Írd be a console-ba:
```javascript
typeof grecaptcha
typeof recaptchaWidgetId
```

Küldd el az eredményt!
