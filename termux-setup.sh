#!/bin/bash
# VDOmov Termux Setup Script
# This script prepares VDOmov for running as a Node.js backend server in Termux

echo "🚀 VDOmov Termux Setup"
echo "======================="

# Update Termux packages
echo "📦 Updating Termux packages..."
apt update && apt upgrade -y

# Install required packages
echo "📥 Installing required packages..."
apt install -y nodejs npm git curl wget python3

# Install NVM for Node.js version management (optional but recommended)
echo "📝 Node.js and npm installed"
node --version
npm --version

echo ""
echo "✅ Termux setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone the repository:"
echo "   git clone https://github.com/seangritthy/vdomov.git"
echo "2. Navigate to project:"
echo "   cd vdomov"
echo "3. Install dependencies:"
echo "   npm install"
echo "4. Create .env file with your configuration"
echo "5. Start the server:"
echo "   npm start"
echo ""
