#!/bin/bash

# Deploy script for Dózsa Apartman
# Usage: ./deploy.sh
# Requires: lftp (install: sudo apt install lftp)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Dózsa Apartman Deploy ===${NC}\n"

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo -e "${RED}Error: lftp not found!${NC}"
    echo -e "${YELLOW}Install it with: sudo apt install lftp${NC}"
    exit 1
fi

# Check if ftp-config.json exists
if [ ! -f "ftp-config.json" ]; then
    echo -e "${RED}Error: ftp-config.json not found!${NC}"
    echo -e "${YELLOW}Please create ftp-config.json based on ftp-config.example.json${NC}"
    exit 1
fi

# Read FTP config
FTP_HOST=$(jq -r '.host' ftp-config.json)
FTP_USER=$(jq -r '.user' ftp-config.json)
FTP_PASS=$(jq -r '.password' ftp-config.json)
FTP_PATH=$(jq -r '.remotePath' ftp-config.json)
FTP_SECURE=$(jq -r '.secure' ftp-config.json)
FTP_PASSIVE=$(jq -r '.passive' ftp-config.json)

echo -e "${YELLOW}Connecting to: ${FTP_HOST}${NC}"
echo -e "${YELLOW}Remote path: ${FTP_PATH}${NC}"
echo -e "${YELLOW}Security: FTP over TLS (Explicit)${NC}"
echo -e "${YELLOW}Mode: Passive${NC}\n"

# Execute FTP upload with lftp (supports FTPS and passive mode)
echo -e "${GREEN}Uploading files...${NC}\n"

lftp -c "
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set ftp:passive-mode true
open -u ${FTP_USER},${FTP_PASS} ${FTP_HOST}
cd ${FTP_PATH}

# Create api directory structure
mkdir -p api/templates

# Upload API files
put -O api src/api/booking.php
put -O api src/api/config.php
put -O api/templates src/api/templates/customer-email.html
put -O api/templates src/api/templates/admin-email.txt

# Upload booking wizard files
put src/booking-wizard.js
put src/booking-wizard.css
put src/index.html

bye
"

echo -e "\n${GREEN}✓ Deploy complete!${NC}"
echo -e "${YELLOW}Note: Make sure to set the correct email in src/api/config.php${NC}"
