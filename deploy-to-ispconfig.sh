#!/bin/bash
###############################################################################
# Dózsa Apartman Szeged - ISPConfig Deployment Script
#
# Ez a script automatizálja a weboldal feltöltését ISPConfig környezetbe
#
# Használat:
#   1. Állítsd be az alábbi változókat a saját szerverednek megfelelően
#   2. Futtasd: chmod +x deploy-to-ispconfig.sh
#   3. Futtasd: ./deploy-to-ispconfig.sh
###############################################################################

# Színek a kimenethez
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguráció - ÁLLÍTSD BE EZEKET!
REMOTE_USER="web1"                                          # ISPConfig web felhasználó
REMOTE_HOST="dozsa-apartman-szeged.hu"                      # Domain vagy IP
REMOTE_PATH="/var/www/clients/client0/web1/web"            # Teljes útvonal a web mappához
REMOTE_PRIVATE="/var/www/clients/client0/web1/private"     # Private mappa útvonala

# Helyi könyvtár (új ISPConfig struktúra)
LOCAL_SRC="./web"
LOCAL_PRIVATE="./private"

# Kizárások
EXCLUDE_LIST=(
    ".git"
    ".gitignore"
    "node_modules"
    ".env"
    ".env.*"
    "*.log"
    ".DS_Store"
    "*.md"
    "*.sh"
    "tmp"
    "debug-*"
    "test-*"
)

###############################################################################
# Funkciók
###############################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Dózsa Apartman Szeged - ISPConfig Deployment${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

check_requirements() {
    print_step "Előfeltételek ellenőrzése..."

    # rsync ellenőrzés
    if ! command -v rsync &> /dev/null; then
        print_error "rsync nincs telepítve. Telepítsd: sudo apt install rsync"
        exit 1
    fi

    # SSH ellenőrzés
    if ! command -v ssh &> /dev/null; then
        print_error "ssh nincs telepítve."
        exit 1
    fi

    # Helyi web mappa ellenőrzés
    if [ ! -d "$LOCAL_SRC" ]; then
        print_error "A web/ mappa nem található!"
        exit 1
    fi

    # Helyi private mappa ellenőrzés
    if [ ! -d "$LOCAL_PRIVATE" ]; then
        print_error "A private/ mappa nem található!"
        exit 1
    fi

    print_success "Előfeltételek OK"
    echo ""
}

confirm_deployment() {
    echo -e "${YELLOW}Deployment információk:${NC}"
    echo "  Helyi:    $LOCAL_SRC"
    echo "  Távoli:   $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
    echo ""
    read -p "Biztosan folytatod? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment megszakítva."
        exit 0
    fi
}

test_ssh_connection() {
    print_step "SSH kapcsolat tesztelése..."

    if ssh -o ConnectTimeout=5 "$REMOTE_USER@$REMOTE_HOST" "echo 'SSH OK'" &> /dev/null; then
        print_success "SSH kapcsolat OK"
    else
        print_error "Nem sikerült csatlakozni SSH-val: $REMOTE_USER@$REMOTE_HOST"
        print_warning "Ellenőrizd:"
        echo "  1. SSH kulcs hozzáadva?"
        echo "  2. ISPConfig SSH Shell hozzáférés engedélyezve?"
        exit 1
    fi
    echo ""
}

create_backup() {
    print_step "Távoli backup létrehozása..."

    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"

    ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_PATH/.. && tar -czf $BACKUP_NAME web/" 2>/dev/null

    if [ $? -eq 0 ]; then
        print_success "Backup létrehozva: $BACKUP_NAME"
    else
        print_warning "Backup létrehozása sikertelen (lehet, hogy első deployment)"
    fi
    echo ""
}

sync_files() {
    print_step "Fájlok szinkronizálása rsync-kel..."

    # Exclude lista építése
    EXCLUDE_ARGS=""
    for item in "${EXCLUDE_LIST[@]}"; do
        EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude='$item'"
    done

    # rsync futtatása
    eval rsync -avz --delete \
        $EXCLUDE_ARGS \
        "$LOCAL_SRC/" \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

    if [ $? -eq 0 ]; then
        print_success "Fájlok szinkronizálva"
    else
        print_error "Fájl szinkronizálás sikertelen"
        exit 1
    fi
    echo ""
}

sync_env_file() {
    print_step ".env fájl szinkronizálása..."

    # Ellenőrizzük, hogy létezik-e helyi .env fájl
    if [ -f "$LOCAL_PRIVATE/.env" ]; then
        read -p "Feltöltöd a helyi private/.env fájlt a szerverre? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            scp "$LOCAL_PRIVATE/.env" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PRIVATE/.env"
            if [ $? -eq 0 ]; then
                print_success ".env fájl feltöltve"
                # Jogosultságok beállítása
                ssh "$REMOTE_USER@$REMOTE_HOST" "chmod 600 $REMOTE_PRIVATE/.env"
            else
                print_error ".env fájl feltöltése sikertelen"
            fi
        else
            print_warning ".env fájl feltöltés kihagyva"
        fi
    else
        print_warning "Helyi .env fájl nem található: $LOCAL_PRIVATE/.env"
    fi
    echo ""
}

check_env_file() {
    print_step ".env fájl ellenőrzése a szerveren..."

    if ssh "$REMOTE_USER@$REMOTE_HOST" "test -f $REMOTE_PRIVATE/.env"; then
        print_success ".env fájl létezik a private/ mappában"
    else
        print_warning ".env fájl NEM található a szerveren!"
        print_warning "Hozd létre manuálisan vagy használd a sync_env_file() funkciót:"
        echo "  1. ssh $REMOTE_USER@$REMOTE_HOST"
        echo "  2. nano $REMOTE_PRIVATE/.env"
        echo "  3. Másold be a .env.example tartalmát"
        echo "  4. Állítsd be a valós értékeket (különösen RECAPTCHA_SECRET_KEY)"
    fi
    echo ""
}

set_permissions() {
    print_step "Fájl jogosultságok beállítása..."

    ssh "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
        # Navigálás a web mappába
        cd "$REMOTE_PATH"

        # Mappa jogosultságok
        find . -type d -exec chmod 755 {} \;

        # Fájl jogosultságok
        find . -type f -exec chmod 644 {} \;

        # .htaccess
        chmod 644 .htaccess 2>/dev/null

        # PHP fájlok
        chmod 644 php/*.php 2>/dev/null
        chmod 644 api/*.php 2>/dev/null

        echo "Jogosultságok beállítva"
EOF

    print_success "Jogosultságok OK"
    echo ""
}

verify_deployment() {
    print_step "Deployment ellenőrzése..."

    # index.html létezik?
    if ssh "$REMOTE_USER@$REMOTE_HOST" "test -f $REMOTE_PATH/index.html"; then
        print_success "index.html létezik"
    else
        print_error "index.html nem található!"
        exit 1
    fi

    # .htaccess létezik?
    if ssh "$REMOTE_USER@$REMOTE_HOST" "test -f $REMOTE_PATH/.htaccess"; then
        print_success ".htaccess létezik"
    else
        print_warning ".htaccess nem található"
    fi

    echo ""
}

show_next_steps() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ Deployment sikeres!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Következő lépések:${NC}"
    echo ""
    echo "1. Ellenőrizd a .env fájlt:"
    echo "   ssh $REMOTE_USER@$REMOTE_HOST"
    echo "   cat $REMOTE_PRIVATE/.env"
    echo ""
    echo "2. Teszteld az oldalt:"
    echo "   https://$REMOTE_HOST"
    echo ""
    echo "3. Teszteld az űrlapokat:"
    echo "   - Kapcsolat: https://$REMOTE_HOST/contact.html"
    echo "   - Ajánlatkérés: https://$REMOTE_HOST/#ajanlatkeres"
    echo ""
    echo "4. Ellenőrizd a logokat:"
    echo "   ssh $REMOTE_USER@$REMOTE_HOST"
    echo "   tail -f /var/www/clients/client0/web1/log/error.log"
    echo ""
    echo -e "${BLUE}Részletes útmutató: ISPCONFIG_DEPLOYMENT.md${NC}"
    echo ""
}

###############################################################################
# Fő program
###############################################################################

main() {
    print_header
    check_requirements
    confirm_deployment
    test_ssh_connection
    create_backup
    sync_files
    sync_env_file
    check_env_file
    set_permissions
    verify_deployment
    show_next_steps
}

# Script futtatása
main
