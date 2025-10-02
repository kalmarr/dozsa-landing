# Új „Ajánlatkérés” oldal – szöveg és UX specifikáció (React-hoz igazítva, kék NÉLKÜL)

## Alapszínek és hangulat
- **Színvilág:** barna tónusok (fő: mélybarna, kiegészítő: kakaó, bézs, elefántcsont). Kék használata tilos.
- **Háttér:** meleg bézs; kártyák/overlayek: világos elefántcsont; fontos CTÁ-k: mélybarna alapon világos szöveg.
- **Árnyék/maszk:** a naptár mögötti háttér **lágyan homályosított** (00–02a képek hangulata).

---

## 1. LÉPÉS – „Vendégek” (overlay kártya)  
*Vizualitás: a 15/01 képek mintája – középre igazított, lekerekített kártya, halványított háttérrel.*

**Cím:** „Adja meg a vendégek számát a szabad dátumok megjelenítéséhez”  
**Választható mezők:**
- **Felnőtt:** `–  2  +` (min 1, max 4)  
- **Pótágy:** `–  0  +` (max 2)  
- **Gyerek (3–4):** `–  0  +`  
- **Gyerek (2 év alatt):** `–  0  +` + *„A 0–2 évesekre nem számítunk fel férőhelyet és díjakat.”* (apró szürke szöveg)

**Gombok:**  
- **Tovább** (mélybarna, világos betű; csak érvényes értékeknél aktív)  
- **Bezár** (szöveges link a kártya jobb felső sarkában)

**Hibák (ha vannak):**
- „Legalább 1 felnőttet adjon meg.”
- „Maximum 4 felnőtt és 2 pótágy választható.”

---

## 2. LÉPÉS – „Duo naptár” (asztali), mobilon **csak egy hónap**  
*Vizualitás: a 00/01/02/02a képek mintája. A kiválasztott napok erősebb barna jelöléssel, a hónapon kívüli napok fakók.*

**Naptár fejléce:** „2025. szeptember” | „2025. október” (asztali)  
**Mobil:** mindig **egy** hónap látszik; lapozás nyilakkal.

**Interakció:**
- **Bejelentkezés** kiválasztása (első kattintás)  
- **Kijelentkezés** kiválasztása (második kattintás)  
- Csak az **aktuális hónap** napjai aktívak; a másik hónap halványan látszik (képi minta szerint).  
- *Minimum 1 éjszaka.*  
- Foglalt napok kattinthatatlanok.

**Naptár alatti összegző sor (a pirosan jelölt sáv mintájára):**  
- **Vendégek:** `X fő` (felnőtt + pótágy + gyerekek, zárójeles bontás nélkül)  
- **Bejelentkezés:** `YYYY. hónap NN.`  
- **Kijelentkezés:** `YYYY. hónap NN.`  
- **Éjszakák száma:** automatikusan számolva

**Gombok:**  
- **Tovább** (mélybarna) – csak akkor aktív, ha mindkét dátum megvan.  
- **Vissza** (szöveges link) – a vendégválasztóhoz lép vissza.

**Állapot-/segédszövegek:**  
- Ha még nincs kijelentkezés: „Válasszon távozási dátumot.”  
- Ha a kijelentkezés megegyezik a bejelentkezéssel: „A tartózkodás legalább 1 éjszaka.”

---

## 3. LÉPÉS – „Adatlap”  
*Vizualitás: kártya tetején barna keret és egy rövid összefoglaló blokk.*

**Fejléc-összefoglaló (egy dobozban):**  
„Összefoglaló”  
- **Vendégek:** `X fő (Felnőtt: N, Pótágy: M, Gyerek 3–4: A, Gyerek 0–2: B)`  
- **Érkezés:** `YYYY. hónap NN.`  
- **Távozás:** `YYYY. hónap NN.`  
- **Éjszakák száma:** `K éj`

**Űrlapmezők:**
- **Vezetéknév** (kötelező)  
- **Keresztnév** (kötelező)  
- **Telefonszám** (kötelező)  
- **E-mail** (kötelező)  
- **Üzenet** (nem kötelező, több soros)

**Gombok:**  
- **Vissza** (szöveges link) – a naptár lépésre visz vissza, az adatok megmaradnak.  
- **Elküld** (mélybarna, nagy gomb)

**Validációs üzenetek:**
- „Kérjük, adja meg a vezetéknevet.”  
- „Kérjük, adja meg a keresztnevet.”  
- „Kérjük, adjon meg érvényes telefonszámot.”  
- „Kérjük, adjon meg érvényes e-mail címet.”

---

## 4. LÉPÉS – „Elküldés / visszaigazolás”  
Siker esetén: **„Köszönjük az érdeklődést! Az ajánlat összefoglalóját elküldtük e-mailben.”**  
- *Másolatot kap:* **info@dozsaaprtman.hu**  
- *A felhasználónak küldött e-mail sablonja* (barna arculat, képi világ az oldaléval egyező):

**Tárgy:** „Ajánlatkérés fogadva – [Apartman neve]”  
**Törzs (példa):**  
```
Kedves [Vezetéknév] [Keresztnév]!

Köszönjük érdeklődését. Az alábbi adatok alapján rögzítettük az ajánlatkérést:

Vendégek: [X fő (Felnőtt N, Pótágy M, Gyerek 3–4 A, Gyerek 0–2 B)]
Érkezés: [YYYY. hónap NN.]
Távozás: [YYYY. hónap NN.]
Éjszakák száma: [K éj]

Elérhetőségek:
Telefon: [Telefonszám]
E-mail: [E-mail]

Üzenet:
[Üzenet vagy „—”]

Hamarosan felvesszük Önnel a kapcsolatot a részletekkel és az árral.

Üdvözlettel,
[Apartman neve]
[Cím | Telefon | Web]
```

Hiba esetén: **„Sajnáljuk, az üzenetet most nem sikerült elküldeni. Kérjük, próbálja meg később, vagy hívjon minket: [telefonszám].”**

---

## Navigációs/állapot szabályok
- A „Tovább” gomb **mindig** csak valid állapotban aktív.  
- A kiválasztott napok a képeken látható módon **kontrasztos barnával** jelöltek.  
- A hónapváltásnál a másik hónap **látszik**, de a nem aktuális napok **inaktívak** (csak vizuális jel).  
- A vendégszám összegző sora **mindig** látszik a naptár alatt (15/02 képek pirossal jelölt sávjának megfelelő elrendezés).

---

## Oldalszintű szövegek (kód nélkül, kész másolható tartalom)

**Főcím (hero fölött):**  
„Természetközeli feltöltődés egy hangulatos faházban”

**Címkék (opcionális):**  
„eseményekhez ideális” • „központhoz közel”

**Foglaló modul megnyitó gomb:**  
„Ajánlatkérés”

**Vendégválasztó cím:**  
„Adja meg a vendégek számát a szabad dátumok megjelenítéséhez”

**Naptár lábléc címkék:**  
„Vendégek” | „Bejelentkezés” | „Kijelentkezés” | „Éjszakák száma”

**Gombok:**  
„Tovább” • „Vissza” • „Elküld”

---

## React-os felépítés (csak struktúra, kód NÉLKÜL)

- **WizardLayout**  
  – lépéskezelés, felső címsor, barna témák  
- **GuestPickerCard** (Lépés 1)  
  – számlálók, validáció, „Tovább”  
- **CalendarStep** (Lépés 2)  
  – Duo naptár (asztali), Single naptár (mobil), összegző sáv, „Tovább/Vissza”  
- **SummaryBar**  
  – Vendégek | Érkezés | Távozás | Éjszakák  
- **FormStep** (Lépés 3)  
  – űrlapmezők, validáció, „Elküld”  
- **ResultStep** (Lépés 4)  
  – siker/hiba üzenet, következő teendők  
- **EmailTemplates**  
  – ügyfél sablon + másolat az **info@dozsaaprtman.hu** címre

---

## Mit kell TÖRÖLNI a régi oldalról?
- A jelenlegi „Ajánlatkérés”/levélküldő űrlap **teljes egészében**.  
- A kék színű gombok és kiemelések.  
- A régi felugró értesítés – helyette a fenti 4. lépés szerinti státusz nézet.

---

## Apró UX-részletek (a képekhez igazítva)
- A kiválasztott napok **„erősebbek”** (vastagabb barna szám + telt háttér).  
- A kijelölt intervallum belseje **halvány barna sáv**, a két széle „pill” jelöléssel.  
- A vendégkártya sorai között **finom hajszálvonal** (nem kék).  
- Mobilon a kártyák **teljes szélességűek**, nagy, érthető gombokkal.
