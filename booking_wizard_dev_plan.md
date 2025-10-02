# Fejlesztési Terv - Ajánlatkérés Varázsló Funkció

## 1. Projekt Áttekintés

**Státusz:** Új funkció hozzáadása meglévő landing oldalhoz  
**Típus:** Beágyazott React komponens  
**Cél:** Modern, lépésenkénti ajánlatkérő varázsló a dozsaapartman.hu oldalon

### Kulcs Követelmények
- ✅ Meglévő landing oldal **NEM** módosul (csak bővül)
- ✅ Egy szekció a landing oldalon belül
- ✅ React alapú fejlesztés (modern, karbantartható)
- ✅ Mobilra optimalizált
- ✅ Az oldal színvilágához illeszkedik

---

## 2. Technológiai Stack

### 2.1 Frontend
```
React 18.x          → Modern UI komponensek
TypeScript          → Type safety
React Hook Form     → Form kezelés és validáció
date-fns            → Dátum manipuláció
react-day-picker    → Naptár komponens (AJÁNLOTT!)
Tailwind CSS        → Gyors styling, reszponzív
Framer Motion       → Smooth animációk (opcionális)
```

### 2.2 Backend
```
PHP 8.x             → Email küldés
PHPMailer           → HTML email támogatás
```

### 2.3 Build Tool
```
Vite               → Gyors build, modern bundler
```

---

## 3. Projekt Struktúra

```
/booking-wizard-react/
│
├── src/
│   ├── main.tsx                      # React belépési pont
│   ├── App.tsx                       # Fő komponens
│   │
│   ├── components/
│   │   ├── Wizard/
│   │   │   ├── WizardContainer.tsx   # Varázsló wrapper
│   │   │   ├── StepIndicator.tsx     # Lépés indikátor (1/4, 2/4...)
│   │   │   ├── NavigationButtons.tsx # Vissza/Tovább gombok
│   │   │   └── ProgressBar.tsx       # Progress bar (opcionális)
│   │   │
│   │   ├── Steps/
│   │   │   ├── Step1Guests.tsx       # Vendégszám választó
│   │   │   ├── Step2Calendar.tsx     # Naptár
│   │   │   ├── Step3Form.tsx         # Adatlap
│   │   │   └── Step4Confirmation.tsx # Megerősítés
│   │   │
│   │   ├── Calendar/
│   │   │   ├── DateRangePicker.tsx   # Naptár fő komponens
│   │   │   ├── CalendarDay.tsx       # Egyedi nap render
│   │   │   └── CalendarLegend.tsx    # Jelmagyarázat
│   │   │
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Counter.tsx           # +/- stepper
│   │       └── Card.tsx
│   │
│   ├── hooks/
│   │   ├── useBookingState.ts        # Globális állapot kezelés
│   │   ├── useCalendarAvailability.ts # Foglaltság logika
│   │   └── useFormSubmit.ts          # Email küldés
│   │
│   ├── utils/
│   │   ├── validation.ts             # Form validációk
│   │   ├── dateHelpers.ts            # Dátum műveletek
│   │   └── api.ts                    # API hívások
│   │
│   ├── types/
│   │   └── booking.types.ts          # TypeScript típusok
│   │
│   ├── config/
│   │   └── constants.ts              # Konfigurációs értékek
│   │
│   └── styles/
│       └── index.css                 # Tailwind + custom CSS
│
├── public/
│   └── favicon.ico
│
├── dist/                             # Build output (ezt használja az oldal)
│   ├── booking-wizard.js             # Egyetlen bundle fájl
│   └── booking-wizard.css            # Stílusok
│
├── package.json
├── vite.config.ts                    # Vite konfiguráció
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 4. Integráció a Landing Oldalba

### 4.1 HTML Módosítás (Minimális!)

```html
<!-- MEGLÉVŐ LANDING OLDAL: index.html -->
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dózsa Apartman</title>
    
    <!-- Meglévő CSS-ek -->
    <link rel="stylesheet" href="assets/css/style.css">
    
    <!-- ✅ ÚJ: React Varázsló CSS -->
    <link rel="stylesheet" href="dist/booking-wizard.css">
</head>
<body>
    <!-- Hero Section -->
    <section id="hero">
        <h1>Dózsa Apartman</h1>
        <p>Üdvözöljük...</p>
    </section>
    
    <!-- About -->
    <section id="about">
        <!-- Tartalom -->
    </section>
    
    <!-- Gallery -->
    <section id="gallery">
        <!-- Képek -->
    </section>
    
    <!-- ✅ ÚJ: Ajánlatkérő Szekció -->
    <section id="booking" class="booking-section">
        <div class="container">
            <h2>Kérjen Ajánlatot</h2>
            <p>Töltse ki az alábbi varázslót egyszerűen és gyorsan!</p>
            
            <!-- ✅ React mount pont -->
            <div id="booking-wizard-root"></div>
        </div>
    </section>
    
    <!-- Contact -->
    <section id="contact">
        <!-- Kapcsolat -->
    </section>
    
    <!-- Footer -->
    <footer>
        <!-- Footer tartalom -->
    </footer>
    
    <!-- ✅ ÚJ: React Varázsló Script -->
    <script type="module" src="dist/booking-wizard.js"></script>
</body>
</html>
```

---

## 5. Varázsló Működési Flow

### Lépések
```
1. VENDÉGSZÁM VÁLASZTÁS
   ↓
   [Felnőtt: 4, Pótágy: 2, Gyerek(3-14): 0, Gyerek(0-2): 0]
   ↓
2. IDŐPONT VÁLASZTÁS
   ↓
   [Naptár: Bejelentkezés → Kijelentkezés]
   [Múlt: tiltva, áthúzva | Foglalt: piros | Vissza: tiltva első hónapnál]
   ↓
3. ADATLAP
   ↓
   [Vezetéknév, Keresztnév, Tel, Email, Üzenet(opt)]
   [Felül: Összefoglaló a választásokról]
   ↓
4. MEGERŐSÍTÉS
   ↓
   [Automatikus email küldés]
   [Ügyfél: HTML email | Admin: Plain text email]
   [Sikeres küldés üzenet]
```

---

## 6. React Komponensek

### 6.1 Fő App Komponens

```typescript
// src/App.tsx
import { useState } from 'react';
import WizardContainer from './components/Wizard/WizardContainer';
import Step1Guests from './components/Steps/Step1Guests';
import Step2Calendar from './components/Steps/Step2Calendar';
import Step3Form from './components/Steps/Step3Form';
import Step4Confirmation from './components/Steps/Step4Confirmation';
import { BookingData } from './types/booking.types';

function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState<BookingData>({
        guests: {
            adults: 4,
            extraBeds: 2,
            children3to14: 0,
            children0to2: 0
        },
        dates: {
            checkIn: null,
            checkOut: null,
            nights: 0
        },
        customer: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: ''
        }
    });

    const steps = [
        <Step1Guests 
            data={bookingData.guests}
            onUpdate={(guests) => setBookingData({...bookingData, guests})}
        />,
        <Step2Calendar 
            data={bookingData.dates}
            onUpdate={(dates) => setBookingData({...bookingData, dates})}
        />,
        <Step3Form 
            data={bookingData.customer}
            bookingSummary={bookingData}
            onUpdate={(customer) => setBookingData({...bookingData, customer})}
        />,
        <Step4Confirmation 
            bookingData={bookingData}
        />
    ];

    return (
        <WizardContainer
            currentStep={currentStep}
            totalSteps={4}
            onStepChange={setCurrentStep}
        >
            {steps[currentStep - 1]}
        </WizardContainer>
    );
}

export default App;
```

### 6.2 Step 2: Naptár (react-day-picker)

```typescript
// src/components/Steps/Step2Calendar.tsx
import { FC, useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, differenceInDays, startOfToday } from 'date-fns';
import { hu } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

const Step2Calendar: FC<Props> = ({ data, onUpdate }) => {
    const today = startOfToday();

    // Foglalt dátumok (később API-ból)
    const blockedDates = [
        new Date(2025, 9, 22),
        new Date(2025, 9, 23)
    ];

    const disabledDays = [
        { before: today }, // ❌ Múltbeli napok
        ...blockedDates    // ❌ Foglalt napok
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center mb-8">
                Válasszon időpontot
            </h3>

            <DayPicker
                mode="range"
                selected={range}
                onSelect={handleSelect}
                disabled={disabledDays}
                locale={hu}
                numberOfMonths={window.innerWidth > 768 ? 2 : 1}
                fromMonth={today}
                modifiersClassNames={{
                    selected: 'bg-blue-500 text-white',
                    disabled: 'line-through text-gray-300',
                    today: 'font-bold border-2 border-blue-500'
                }}
            />

            {/* Összefoglaló panel */}
            {range?.from && range?.to && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div>Bejelentkezés: {format(range.from, 'yyyy. MM. dd.')}</div>
                    <div>Kijelentkezés: {format(range.to, 'yyyy. MM. dd.')}</div>
                    <div>Éjszakák: {data.nights}</div>
                </div>
            )}
        </div>
    );
};
```

### 6.3 Counter UI Komponens

```typescript
// src/components/UI/Counter.tsx
const Counter: FC<Props> = ({ label, value, min, max, onChange }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <span className="text-lg font-medium">{label}</span>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => value > min && onChange(value - 1)}
                    disabled={value <= min}
                    className="w-10 h-10 rounded-full border-2 text-xl font-bold"
                >
                    −
                </button>
                <span className="text-xl font-semibold w-8 text-center">{value}</span>
                <button
                    onClick={() => value < max && onChange(value + 1)}
                    disabled={value >= max}
                    className="w-10 h-10 rounded-full border-2 text-xl font-bold"
                >
                    +
                </button>
            </div>
        </div>
    );
};
```

---

## 7. TypeScript Típusok

```typescript
// src/types/booking.types.ts

export interface GuestData {
    adults: number;
    extraBeds: number;
    children3to14: number;
    children0to2: number;
}

export interface DateData {
    checkIn: Date | null;
    checkOut: Date | null;
    nights: number;
}

export interface CustomerData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
}

export interface BookingData {
    guests: GuestData;
    dates: DateData;
    customer: CustomerData;
}
```

---

## 8. API Utility

```typescript
// src/utils/api.ts
export async function sendBookingRequest(data: BookingData): Promise<void> {
    const response = await fetch('/api/send-booking-request.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            booking: data,
            timestamp: new Date().toISOString()
        })
    });

    if (!response.ok) {
        throw new Error('Email küldési hiba');
    }

    return response.json();
}
```

---

## 9. Backend PHP API

```php
<?php
// api/send-booking-request.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['booking'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Hibás adatok']);
    exit;
}

$booking = $data['booking'];

try {
    // ✅ Ügyfélnek HTML email
    $customerEmailSent = sendCustomerEmail($booking);
    
    // ✅ Adminnak Plain text email
    $adminEmailSent = sendAdminEmail($booking);
    
    if ($customerEmailSent && $adminEmailSent) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Email küldési hiba');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function sendCustomerEmail($booking) {
    $to = $booking['customer']['email'];
    $subject = 'Ajánlatkérés - Dózsa Apartman';
    
    // HTML template betöltése
    $html = file_get_contents(__DIR__ . '/templates/customer-email.html');
    
    // Változók behelyettesítése
    $html = str_replace('{{FIRSTNAME}}', $booking['customer']['firstName'], $html);
    $html = str_replace('{{LASTNAME}}', $booking['customer']['lastName'], $html);
    // ... további változók
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=utf-8\r\n";
    $headers .= "From: Dózsa Apartman <noreply@dozsaapartman.hu>\r\n";
    
    return mail($to, $subject, $html, $headers);
}

function sendAdminEmail($booking) {
    $to = 'info@dozsaapartman.hu';
    $subject = 'ÚJ AJÁNLATKÉRÉS - ' . $booking['customer']['lastName'];
    
    // Plain text formázás
    $body = "ÚJ AJÁNLATKÉRÉS\n";
    $body .= "═══════════════════════════════════════\n\n";
    $body .= "ÜGYFÉL: " . $booking['customer']['lastName'] . " " . $booking['customer']['firstName'] . "\n";
    $body .= "EMAIL: " . $booking['customer']['email'] . "\n";
    $body .= "TELEFON: " . $booking['customer']['phone'] . "\n";
    // ... további adatok
    
    $headers = "Content-type: text/plain; charset=utf-8\r\n";
    $headers .= "From: Booking System <noreply@dozsaapartman.hu>\r\n";
    
    return mail($to, $subject, $body, $headers);
}
?>
```

---

## 10. Email Sablonok

### 10.1 Ügyfél Email (HTML)

```html
<!-- api/templates/customer-email.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
        .info-box { background: #f9f9f9; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dózsa Apartman</h1>
        </div>
        
        <div class="content">
            <h2>Tisztelt {{LASTNAME}} {{FIRSTNAME}}!</h2>
            <p>Köszönjük érdeklődését a Dózsa Apartman iránt!</p>
            
            <div class="info-box">
                <h3>📋 Az Ön ajánlatkérésének adatai:</h3>
                <p><strong>👥 Vendégek:</strong> {{ADULTS}} felnőtt, {{EXTRABEDS}} pótágy</p>
                <p><strong>📅 Időpont:</strong> {{CHECKIN}} - {{CHECKOUT}} ({{NIGHTS}} éj)</p>
            </div>
            
            <p>Munkatársunk hamarosan felveszi Önnel a kapcsolatot!</p>
            <p>📧 info@dozsaapartman.hu</p>
        </div>
    </div>
</body>
</html>
```

### 10.2 Admin Email (Plain Text)

```
Tárgy: ÚJ AJÁNLATKÉRÉS - [NÉV]

═══════════════════════════════════════════════
ÚJ AJÁNLATKÉRÉS ÉRKEZETT!
═══════════════════════════════════════════════

ÜGYFÉL ADATAI:
───────────────────────────────────────────────
Név: {{LASTNAME}} {{FIRSTNAME}}
Telefon: {{PHONE}}
Email: {{EMAIL}}

KÉRT IDŐPONT:
───────────────────────────────────────────────
Bejelentkezés: {{CHECKIN}}
Kijelentkezés: {{CHECKOUT}}
Éjszakák: {{NIGHTS}}

VENDÉGEK:
───────────────────────────────────────────────
Felnőtt: {{ADULTS}} fő
Pótágy: {{EXTRABEDS}} fő
Gyerek (3-14): {{CHILDREN_3_14}} fő
Gyerek (0-2): {{CHILDREN_0_2}} fő

ÜZENET:
───────────────────────────────────────────────
{{MESSAGE}}

═══════════════════════════════════════════════
Időbélyeg: {{TIMESTAMP}}
```

---

## 11. Package.json

```json
{
  "name": "booking-wizard-react",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-day-picker": "^8.10.1",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3",
    "vite": "^5.3.1"
  }
}
```

---

## 12. Vite Konfiguráció

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                entryFileNames: 'booking-wizard.js',
                assetFileNames: 'booking-wizard.[ext]'
            }
        }
    }
});
```

---

## 13. Tailwind Konfiguráció

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      }
    },
  },
  plugins: [],
}
```

---

## 14. Build és Telepítés

### 14.1 Fejlesztés

```bash
# Függőségek telepítése
npm install

# Dev szerver indítása
npm run dev
# → http://localhost:5173
```

### 14.2 Production Build

```bash
# Build futtatása
npm run build

# Kimenet: dist/
# - booking-wizard.js   (~150KB gzipped)
# - booking-wizard.css  (~20KB)
```

### 14.3 Telepítés

```bash
# 1. Build fájlok feltöltése
/public_html/dist/
  ├── booking-wizard.js
  └── booking-wizard.css

# 2. API fájlok feltöltése
/public_html/api/
  ├── send-booking-request.php
  └── templates/
      ├── customer-email.html
      └── admin-email.txt

# 3. index.html módosítása (3 sor):
# - CSS link hozzáadása
# - <div id="booking-wizard-root"></div> hozzáadása
# - Script hozzáadása
```

---

## 15. Fájlstruktúra a Weboldalon

```
/public_html/dozsaapartman/
│
├── index.html                     # ✏️ MÓDOSÍTVA (3 sor hozzáadva)
│
├── assets/
│   ├── css/
│   │   └── style.css             # MEGLÉVŐ (változatlan)
│   ├── js/
│   │   └── main.js               # MEGLÉVŐ (változatlan)
│   └── images/                    # MEGLÉVŐ (változatlan)
│
├── dist/                          # ✅ ÚJ MAPPA
│   ├── booking-wizard.js         # ✅ ÚJ (React bundle)
│   └── booking-wizard.css        # ✅ ÚJ (Stílusok)
│
└── api/                           # ✅ ÚJ MAPPA
    ├── send-booking-request.php  # ✅ ÚJ
    └── templates/                # ✅ ÚJ MAPPA
        ├── customer-email.html   # ✅ ÚJ
        └── admin-email.txt       # ✅ ÚJ
```

---

## 16. Tesztelési Checklist

### Frontend Tesztek
- [ ] Vendégszám stepper működik (+/− gombok)
- [ ] Naptár: múlt napok szürkén, áthúzva
- [ ] Naptár: vissza navigáció tiltva első hónapnál
- [ ] Naptár: foglalt napok piros, nem választhatók
- [ ] Naptár: duo nézet desktop, single mobil
- [ ] Form validáció: email, telefon formátum
- [ ] Lépések közti navigáció (Vissza/Tovább)
- [ ] Összefoglaló panel adatok helyesek
- [ ] Sikeres küldés üzenet megjelenik

### Backend Tesztek
- [ ] Email ügyfélnek (HTML) megérkezik
- [ ] Email adminnak (Plain) megérkezik
- [ ] Hibakezelés 400, 500 esetén
- [ ] CORS működik

### Responsive Tesztek
- [ ] Desktop 1920x1080
- [ ] Laptop 1366x768
- [ ] Tablet 768x1024
- [ ] Mobile 375x667 (iPhone SE)
- [ ] Mobile 414x896 (iPhone 11)

### Browser Tesztek
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Safari iOS
- [ ] Chrome Android

### Integrációs Tesztek
- [ ] Meglévő oldal változatlan
- [ ] CSS nem ütközik
- [ ] JavaScript nem ütközik
- [ ] React component mountol
- [ ] Scroll smooth működik

---

## 17. Kockázatok és Megoldások

| Kockázat | Megoldás |
|----------|----------|
| CSS ütközés meglévő oldallal | Tailwind prefix vagy scoped styles |
| JavaScript ütközés | React izolált környezet |
| Email spam filter | SPF/DKIM setup, trusted domain |
| Mobil layout probléma | Tailwind responsive utilities |
| Naptár library kompatibilitás | react-day-picker jól támogatott |
| TypeScript build hiba | Strict mode tesztelés |

---

## 18. Időbecslés

| Fázis | Idő | Részletek |
|-------|-----|-----------|
| Setup & Config | 4 óra | React, Vite, Tailwind, TypeScript |
| Step 1: Vendégszám | 4 óra | Counter komponens |
| Step 2: Naptár | 8 óra | react-day-picker, múlt tiltás |
| Step 3: Form | 6 óra | React Hook Form, validáció |
| Step 4: Megerősítés | 3 óra | API call, loading/error |
| UI Komponensek | 6 óra | Button, Input, Counter |
| Backend API | 6 óra | PHP email, templates |
| Email Sablonok | 4 óra | HTML + Plain text |
| Responsive Design | 4 óra | Mobil optimalizálás |
| Integráció | 4 óra | Landing oldalba építés |
| Tesztelés | 8 óra | Funkcionális + cross-browser |
| Dokumentáció | 3 óra | README, deployment |
| **ÖSSZESEN** | **60 óra** | ~2 hét (1 fejlesztő) |

---

## 19. Konfiguráció és Testreszabás

### Színvilág Módosítása

```javascript
// tailwind.config.js
theme: {
    extend: {
        colors: {
            primary: '#YOUR_BRAND_COLOR',
            secondary: '#YOUR_SECONDARY_COLOR',
        }
    }
}
```

### Foglalt Dátumok Frissítése

```typescript
// src/config/constants.ts
export const BLOCKED_DATES = [
    '2025-10-22',
    '2025-10-23',
    '2025-11-01',
    // ... további dátumok
];
```

### Szövegek Módosítása

```typescript
// src/config/texts.ts
export const TEXTS = {
    step1Title: 'Válasszon létszámot',
    step2Title: 'Válasszon időpontot',
    step3Title: 'Adatok megadása',
    // ...
};
```

---

## 20. Karbantartás

### Rutinfeladatok
- ✅ Foglalt dátumok frissítése (heti/havi)
- ✅ Email template frissítése (ritkán)
- ✅ Dependency update (havonta)

### Jövőbeli Fejlesztések
- [ ] Dinamikus foglaltság API
- [ ] Többnyelvűség (EN, DE)
- [ ] Árkalkulátor integráció
- [ ] Google Analytics tracking
- [ ] Admin dashboard foglaltság kezeléshez

---

## 21. Dokumentumok és Supportok

### Kliens Dokumentáció
- 📄 **Telepítési útmutató** (magyar)
- 📄 **Felhasználói kézikönyv** (magyar)
- 📄 **Foglaltság frissítési útmutató**

### Fejlesztői Dokumentáció
- 📄 **README.md** (EN)
- 📄 **API Documentation**
- 📄 **Component Guide**
- 📄 **Deployment Guide**

### Support
- 📧 **Email support**: [fejlesztő email]
- 📞 **Telefon**: [fejlesztő telefon]
- 💬 **Chat**: [chat platform ha van]

---

## 22. Következő Lépések

### Azonnal Szükséges
1. ✅ **Git repository** létrehozása
2. ✅ **Színvilág** átadása (brand colors, logo)
3. ✅ **FTP/SSH hozzáférés** kérése
4. ✅ **Foglalt dátumok** első listája
5. ✅ **Email címek** megerősítése

### Fejlesztés Indítása
6. 🚀 **Kickoff meeting** ütemezése
7. 🚀 **Staging környezet** létrehozása
8. 🚀 **Sprint 1** kickoff (Setup + Step 1)

---

## 23. Kontakt és Megbeszélés

**Projekt Manager:** [Név]  
**Lead Developer:** [Név]  
**Designer:** [Név]  

**Következő Meeting:** [Dátum]  
**Meeting Célja:** Követelmények finomhangolása, színvilág egyeztetés

---

**Dokumentum létrehozva:** 2025. október 2.  
**Verzió:** 1.0  
**Státusz:** Végleges fejlesztési terv  
**Nyelv:** Magyar (HU)

---

## Mellékletek

### A. React Day Picker Példa Konfiguráció

```typescript
<DayPicker
    mode="range"
    locale={hu}
    numberOfMonths={2}
    disabled={[
        { before: new Date() },      // Múlt tiltása
        new Date(2025, 9, 22),       // Foglalt napok
        new Date(2025, 9, 23)
    ]}
    modifiersClassNames={{
        selected: 'bg-blue-500 text-white',
        disabled: 'line-through text-gray-300',
        today: 'font-bold'
    }}
/>
```

### B. Email Template Változók

| Változó | Leírás | Példa |
|---------|--------|-------|
| `{{FIRSTNAME}}` | Keresztnév | János |
| `{{LASTNAME}}` | Vezetéknév | Kovács |
| `{{EMAIL}}` | Email cím | kovacs.janos@email.com |
| `{{PHONE}}` | Telefonszám | +36 30 123 4567 |
| `{{ADULTS}}` | Felnőttek száma | 4 |
| `{{EXTRABEDS}}` | Pótágyak száma | 2 |
| `{{CHILDREN_3_14}}` | Gyerekek (3-14) | 1 |
| `{{CHILDREN_0_2}}` | Gyerekek (0-2) | 0 |
| `{{CHECKIN}}` | Bejelentkezés | 2025. 10. 15. |
| `{{CHECKOUT}}` | Kijelentkezés | 2025. 10. 18. |
| `{{NIGHTS}}` | Éjszakák száma | 3 |
| `{{MESSAGE}}` | Ügyfél üzenete | Csendes szobát kérek |
| `{{TIMESTAMP}}` | Időbélyeg | 2025-10-02 14:30:45 |

### C. Hasznos Linkek

- **React Day Picker Docs:** https://react-day-picker.js.org/
- **React Hook Form:** https://react-hook-form.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Vite:** https://vitejs.dev/
- **date-fns:** https://date-fns.org/

---

**Köszönjük a figyelmet!**  
**Kezdjük el a fejlesztést! 🚀**