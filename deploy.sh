#!/bin/bash

# Deploy script for Dózsa Apartman
# Usage: ./deploy.sh

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Dózsa Apartman Deploy ===${NC}\n"

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
FTP_PORT=$(jq -r '.port' ftp-config.json)
FTP_PATH=$(jq -r '.remotePath' ftp-config.json)

echo -e "${YELLOW}Connecting to: ${FTP_HOST}${NC}"
echo -e "${YELLOW}Remote path: ${FTP_PATH}${NC}\n"

# Create FTP command file
cat > /tmp/ftp_commands.txt << EOF
open ${FTP_HOST} ${FTP_PORT}
user ${FTP_USER} ${FTP_PASS}
binary
cd ${FTP_PATH}

# Create api directory if not exists
mkdir api 2>/dev/null
cd api
mkdir templates 2>/dev/null

# Upload API files
lcd src/api
put booking.php
put config.php
cd templates
lcd templates
put customer-email.html
put admin-email.txt
cd ../..
lcd ../..

# Upload booking wizard files
put src/booking-wizard.js
put src/booking-wizard.css
put src/index.html

bye
EOF

# Execute FTP upload
echo -e "${GREEN}Uploading files...${NC}"
ftp -n < /tmp/ftp_commands.txt

# Cleanup
rm /tmp/ftp_commands.txt

echo -e "\n${GREEN}✓ Deploy complete!${NC}"
echo -e "${YELLOW}Note: Make sure to set the correct email in src/api/config.php${NC}"
