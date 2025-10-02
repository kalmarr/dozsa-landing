# Dózsa Apartman - React Booking Wizard

Modern React-based foglalási varázsló Tailwind CSS-sel és TypeScript-tel.

## Funkciók

- **4 lépéses foglalási folyamat**:
  1. Vendégszám választó (+/- counter, max 8 fő)
  2. Naptár (react-day-picker, letiltott dátumok, múltbeli dátumok tiltva)
  3. Kapcsolati űrlap (React Hook Form validációval)
  4. Megerősítés és email küldés

- **Technológiák**:
  - React 18
  - TypeScript
  - Tailwind CSS (egyedi Dózsa Apartman színekkel)
  - react-day-picker (naptár)
  - React Hook Form (form validáció)
  - date-fns (dátum formázás)
  - Vite (build tool)

## Fejlesztés

\`\`\`bash
# Függőségek telepítése
npm install

# Dev szerver indítása
npm run dev

# Éles build készítése
npm run build
\`\`\`

## Build kimenet

A build két fájlt generál:
- \`dist/booking-wizard.js\` - React alkalmazás bundle
- \`dist/booking-wizard.css\` - Tailwind CSS stílusok

## Integráció a landing oldalba

A landing oldalban (\`src/index.html\`) 3 sor kell:

\`\`\`html
<!-- HEAD-ben -->
<link rel="stylesheet" href="booking-wizard.css">

<!-- BODY végén az ajánlatkérés szekcióban -->
<div id="booking-wizard-root"></div>

<!-- Scripts között -->
<script type="module" src="booking-wizard.js"></script>
\`\`\`

## Konfiguráció

### Letiltott dátumok

\`src/config/blocked-dates.ts\` fájlban add hozzá a letiltott dátumokat:

\`\`\`typescript
export const blockedDates: Date[] = [
  new Date('2025-12-24'),
  new Date('2025-12-25'),
];
\`\`\`

### Admin email cím

\`../src/api/config.php\` fájlban állítsd be:

\`\`\`php
define('ADMIN_EMAIL', 'info@dozsaapartman.hu');
\`\`\`

## Backend API

PHP backend az email küldéshez: \`src/api/booking.php\`

**Endpoint**: \`POST /api/booking.php\`

**Request body**:
\`\`\`json
{
  "guests": 2,
  "checkIn": "2025-10-10",
  "checkOut": "2025-10-15",
  "name": "Teszt Béla",
  "email": "teszt@example.com",
  "phone": "+36 20 123 4567",
  "message": "Opcionális üzenet"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Booking successful"
}
\`\`\`

## Email Template-ek

- **Ügyfélnek**: HTML email (\`src/api/templates/customer-email.html\`)
- **Adminnak**: Plain text email (\`src/api/templates/admin-email.txt\`)

## Színpaletta

- Primary (barna): \`#8B4513\`
- Secondary (bézs): \`#F5DEB3\`
- Gold: \`#DAA520\`

## Struktúra

\`\`\`
src/
├── components/
│   ├── Wizard/
│   │   └── BookingWizard.tsx
│   ├── Steps/
│   │   ├── GuestSelector.tsx
│   │   ├── DatePicker.tsx
│   │   ├── ContactForm.tsx
│   │   └── Confirmation.tsx
│   └── UI/
│       ├── Button.tsx
│       └── ProgressBar.tsx
├── hooks/
│   └── useBookingWizard.ts
├── types/
│   └── booking.ts
├── config/
│   └── blocked-dates.ts
├── styles/
│   └── index.css
├── App.tsx
└── main.tsx
\`\`\`

## Követelmények

- Node.js 18+
- PHP 8+
- mail() funkció engedélyezve a szerveren
