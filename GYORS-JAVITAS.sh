#!/bin/bash
###############################################################################
# GYORS JAVÍTÁS - 500 Internal Server Error
# Futtasd ezt a scriptet SSH-n keresztül a VPS-en!
###############################################################################

echo "🔧 Dózsa Apartman - 500 Error Gyors Javítás"
echo "=========================================="
echo ""

# Változók
WEB_DIR="/var/www/clients/client0/web1/web"
BACKUP_DIR="/var/www/clients/client0/web1/backup"

# Ellenőrzés: Van-e jogosultságod?
if [ ! -w "$WEB_DIR" ]; then
    echo "❌ HIBA: Nincs írási jogosultságod a $WEB_DIR mappához!"
    echo "Futtasd újra a megfelelő felhasználóval (web1)."
    exit 1
fi

echo "✅ Jogosultságok rendben"
echo ""

# Biztonsági mentés
echo "📦 Biztonsági mentés készítése..."
mkdir -p "$BACKUP_DIR"
cp "$WEB_DIR/.htaccess" "$BACKUP_DIR/.htaccess.$(date +%Y%m%d_%H%M%S)" 2>/dev/null
echo "✅ Backup: $BACKUP_DIR/.htaccess.$(date +%Y%m%d_%H%M%S)"
echo ""

# Minimális .htaccess létrehozása
echo "🛠️  Minimális .htaccess létrehozása..."
cat > "$WEB_DIR/.htaccess" << 'EOF'
# Dózsa Apartman Szeged - Minimális .htaccess
# ISPConfig 3.3.0p3 - PHP-FPM kompatibilis

# .env fájl védelem
<FilesMatch "^\.env">
    Require all denied
</FilesMatch>

# UTF-8 charset
AddDefaultCharset UTF-8

# Directory browsing tiltása
Options -Indexes
EOF

echo "✅ Minimális .htaccess létrehozva"
echo ""

# Jogosultságok
echo "🔐 Jogosultságok beállítása..."
chmod 644 "$WEB_DIR/.htaccess"
echo "✅ Jogosultságok rendben"
echo ""

# Teszt
echo "🧪 Teszt..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dozsa-apartman-szeged.hu)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SIKER! Az oldal működik!"
    echo "   HTTP kód: $HTTP_CODE"
else
    echo "⚠️  Figyelem! HTTP kód: $HTTP_CODE"
    echo "   További diagnosztika szükséges."
fi

echo ""
echo "=========================================="
echo "🎉 Gyors javítás kész!"
echo ""
echo "📋 Következő lépések:"
echo "1. Ellenőrizd a böngészőben: https://dozsa-apartman-szeged.hu"
echo "2. Ha működik, fokozatosan hozzáadhatsz további .htaccess direktívákat"
echo "3. Apache error log: tail -f /var/www/clients/client0/web1/log/error.log"
echo ""
echo "📞 Ha még mindig hibát kapsz, ellenőrizd:"
echo "   - Apache error log-ot"
echo "   - PHP error log-ot"
echo "   - .env fájl létezését: ls -la /var/www/clients/client0/web1/private/.env"
echo ""
