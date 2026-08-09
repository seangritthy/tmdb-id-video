#!/bin/bash
# Quick Termux Start - One-liner setup
# Copy entire script and paste into Termux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔══════════════════════════════════════╗"
echo "║   VDOmov Termux Quick Setup         ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Update
echo -e "${YELLOW}[1/5]${NC} Updating packages..."
apt update -qq && apt upgrade -y -qq > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Packages updated"

# Step 2: Install dependencies
echo -e "${YELLOW}[2/5]${NC} Installing Node.js and npm..."
apt install -y -qq nodejs npm git > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Node.js and npm installed"

# Step 3: Clone repo
echo -e "${YELLOW}[3/5]${NC} Cloning VDOmov repository..."
if [ ! -d "vdomov" ]; then
    git clone https://github.com/seangritthy/vdomov.git > /dev/null 2>&1
    cd vdomov
    echo -e "${GREEN}✓${NC} Repository cloned"
else
    cd vdomov
    git pull > /dev/null 2>&1
    echo -e "${GREEN}✓${NC} Repository updated"
fi

# Step 4: Install npm packages
echo -e "${YELLOW}[4/5]${NC} Installing npm dependencies..."
npm install -q
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 5: Create config
echo -e "${YELLOW}[5/5]${NC} Setting up configuration..."
if [ ! -f ".env" ]; then
    cp .env.termux .env
    echo -e "${GREEN}✓${NC} Configuration created (.env)"
else
    echo -e "${GREEN}✓${NC} Configuration already exists"
fi

# Create storage directories
mkdir -p $HOME/vdomov-storage/{uploads,temp}
echo -e "${GREEN}✓${NC} Storage directories created"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗"
echo "║     ✅ Setup Complete!              ║"
echo "╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}To start the server:${NC}"
echo "  cd vdomov"
echo "  npm start"
echo ""
echo -e "${YELLOW}Or use:${NC}"
echo "  ./termux-start.sh"
echo ""
echo -e "${YELLOW}Access from browser:${NC}"
echo "  http://localhost:5050"
echo ""
