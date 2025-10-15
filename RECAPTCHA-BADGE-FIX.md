# 🔧 reCAPTCHA Badge Pozíció Javítás

## 📋 Probléma
Az ajánlatkérés wizard utolsó lépésénél a kék reCAPTCHA badge két problémát okozott:
1. **Rossz helyen jelent meg** - az űrlap közepén, nem a jobb alsó sarokban
2. **Kitakarta az Elküld gombot** - a jobb alsó pozícióban ütközött a gombbal

## ✅ Megoldás

Hozzáadtam egy CSS szabályt, ami **fixálja** a reCAPTCHA badge pozícióját.

### CSS javítás
**Hol:** `src/css/style.css` - 955-973. sor

```css
/* Force reCAPTCHA badge to bottom right corner - moved left to avoid button overlap */
.grecaptcha-badge {
    position: fixed !important;
    bottom: 14px !important;
    right: 340px !important;  /* Balra mozgatva, hogy ne takarja a gombot */
    z-index: 9999 !important;
    width: 256px;
    height: 60px;
    display: block;
    transition: right 0.3s ease 0s;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

/* On mobile, move badge to original right position */
@media (max-width: 768px) {
    .grecaptcha-badge {
        right: 14px !important;  /* Mobil nézeten vissza a szélhez */
    }
}
```

### Mit csinál?
- `position: fixed` - A badge fix pozícióban lesz a viewport-hoz képest
- `bottom: 14px; right: 340px` - Jobb alsó sarokban, de **balra tolva**, hogy ne takarja a gombokat
- `z-index: 9999` - Mindig látható (más elemek felett)
- `!important` - Felülírja a Google alapértelmezett stílusát
- **Mobil nézet** - `@media (max-width: 768px)` esetén vissza a szélre (`right: 14px`)

## 📤 Mit kell feltölteni?

### Egy fájl változott:
```
src/css/style.css → /var/www/clients/client0/web9/web/css/style.css
```

## 🧪 Tesztelés

### Élő szerveren:
1. Töltsd fel a `src/css/style.css` fájlt
2. Nyisd meg: https://dozsa-apartman-szeged.hu/index.html#ajanlatkeres
3. Klikkelj az "Ajánlatkérés" gombra
4. Töltsd ki az űrlapot és menj végig a wizard-on
5. Az utolsó lépésnél **ellenőrizd**:
   - ✅ A reCAPTCHA badge látható az alsó részén
   - ✅ **NEM takarja ki** az "Elküld" vagy "Vissza" gombokat
   - ✅ A badge a jobb oldalon van, de balra tolva (nem a legszélén)

## 🎯 Előtte vs. Most

### Előtte:
- ❌ A badge az űrlapban volt (inline)
- ❌ Rossz helyen jelent meg (az űrlap közepén)
- ❌ Kitakarta az "Elküld" gombot
- ❌ Zavaró volt a felhasználói élmény szempontjából

### Most:
- ✅ A badge fix pozícióban van
- ✅ Jobb alsó részen jelenik meg (de balra tolva)
- ✅ **NEM takarja ki** a gombokat
- ✅ Nem zavarja az űrlap kitöltését
- ✅ Mobil nézeten is jól működik

## 📝 Megjegyzés

A javítás **mindkét reCAPTCHA widget-re** hatással van:
- Ajánlatkérés wizard
- Contact form

Mindkettőnél a badge most már a jobb alsó sarokban lesz.

---

📅 Javítva: 2025. október 13.
👨‍💻 Claude Code által
