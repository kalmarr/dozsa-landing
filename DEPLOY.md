# Deployment Guide - Dózsa Apartman

## FTP feltöltés beállítása

### 1. Készítsd el az FTP config fájlt

Másold le a példa fájlt:
```bash
cp ftp-config.example.json ftp-config.json
```

### 2. Töltsd ki az FTP adatokkal

Nyisd meg a `ftp-config.json` fájlt és írd be az FTP adatokat:

```json
{
  "host": "ftp.dozsaapartman.hu",
  "user": "your_ftp_username",
  "password": "your_ftp_password",
  "port": 21,
  "remotePath": "/public_html",
  "secure": false
}
```

**FONTOS**: Ez a fájl a `.gitignore`-ban van, így **SOHA nem kerül fel a GitHubra**!

### 3. Opcionálisan: használd a .env fájlt

Másold le a példa fájlt:
```bash
cp .env.example .env
```

Töltsd ki:
```bash
FTP_HOST=ftp.dozsaapartman.hu
FTP_USER=your_username
FTP_PASS=your_password
FTP_PORT=21
FTP_REMOTE_PATH=/public_html
```

## Feltöltés módjai

### Módszer 1: Automatikus deploy script (Linux/Mac)

```bash
./deploy.sh
```

### Módszer 2: Manuális FTP feltöltés (FileZilla)

Töltsd fel a következő fájlokat:

```
Szerver root (pl. /public_html vagy /www)
├── index.html (src/index.html)
├── booking-wizard.js (src/booking-wizard.js)
├── booking-wizard.css (src/booking-wizard.css)
└── api/
    ├── booking.php (src/api/booking.php)
    ├── config.php (src/api/config.php)
    └── templates/
        ├── customer-email.html
        └── admin-email.txt
```

### Módszer 3: WinSCP (Windows)

1. Töltsd le a WinSCP-t: https://winscp.net
2. Kapcsolódj az FTP adatokkal
3. Másold fel a fenti fájlokat

## Telepítés után

### 1. Ellenőrizd az API-t

Látogass el: `https://dozsaapartman.hu/api/booking.php`

Ha működik, HTTP 405 hibát kell kapnod (Method not allowed) - ez jó jel!

### 2. Állítsd be az admin email címet

Szerkeszd a szerveren: `api/config.php`
```php
define('ADMIN_EMAIL', 'info@dozsaapartman.hu');
```

### 3. Teszteld a foglalási formot

1. Menj a weboldalra: `https://dozsaapartman.hu`
2. Görgess le az "Ajánlatkérés" szekcióhoz
3. Töltsd ki a formot teszt adatokkal
4. Ellenőrizd, hogy megérkezik-e az email

## Hibaelhárítás

### PHP mail() nem működik

Ha a PHP mail() nem működik a szerveren:

1. **Ellenőrizd a szerver mail beállításait** (cPanel → Email)
2. **Használj SMTP-t PHPMailer-rel**:
   ```bash
   composer require phpmailer/phpmailer
   ```
3. **Fordulj a hosting szolgáltatóhoz** - ők tudják engedélyezni

### FTP kapcsolódási problémák

- Ellenőrizd a portot (21 = FTP, 22 = SFTP)
- Passzív módra váltás (FileZilla: Edit → Settings → Connection → FTP → Passive)
- Tűzfal ellenőrzése

## Biztonság

✅ **Védett fájlok** (nem mennek a GitHubra):
- `.env`
- `ftp-config.json`
- `deploy-config.json`

⚠️ **Sosem commitold ezeket!**

## Frissítés

Ha változtatást végzel:

1. Módosítsd a kódot
2. Build (ha szükséges): `cd booking-wizard-react && npm run build`
3. Commit: `git add . && git commit -m "message"`
4. Push: `git push origin master`
5. Deploy: `./deploy.sh` vagy manuális FTP feltöltés

## Támogatás

Ha bármi probléma van, nézd meg:
- `booking-wizard-react/README.md` - React projekt dokumentáció
- `src/api/booking.php` - API forráskód
- PHP error log a szerveren
