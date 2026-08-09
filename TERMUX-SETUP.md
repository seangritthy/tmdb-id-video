# VDOmov Termux Installation & Setup Guide

## Quick Start for Termux

### 1. Install Termux Prerequisites
```bash
# Copy and paste this into Termux:
apt update && apt upgrade -y
apt install -y nodejs npm git curl wget
```

### 2. Clone VDOmov Repository
```bash
git clone https://github.com/seangritthy/vdomov.git
cd vdomov
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
```bash
# Copy the template config
cp .env.termux .env

# Edit with your settings (optional)
nano .env
```

### 5. Start the Server
```bash
# Option A: Using the start script
chmod +x termux-start.sh
./termux-start.sh

# Option B: Direct npm command
npm start
```

## What's Running?

- **Backend Server**: Node.js running on port 5050
- **API Endpoint**: http://0.0.0.0:5050
- **Access from other devices**: http://[your-device-ip]:5050

## Accessing from Browser

1. **Same device**: http://localhost:5050
2. **Other devices on same WiFi**: 
   - Find your device IP: `ifconfig` or `hostname -I`
   - Access: `http://[device-ip]:5050`

## Common Termux Issues & Solutions

### Issue: "npm: command not found"
```bash
# Solution: Reinstall nodejs
apt install -y nodejs npm
```

### Issue: "Permission denied" on scripts
```bash
# Solution: Make scripts executable
chmod +x termux-start.sh
chmod +x termux-setup.sh
```

### Issue: Port already in use
```bash
# Solution: Use different port
PORT=5050 npm start
```

### Issue: Storage/Permission errors
```bash
# Solution: Create storage directories
mkdir -p $HOME/vdomov-storage/uploads
mkdir -p $HOME/vdomov-storage/temp
chmod -R 755 $HOME/vdomov-storage
```

## Keep Server Running (Recommended)

### Option 1: Use nohup (Simple)
```bash
nohup PORT=5050 npm start > vdomov.log 2>&1 &
```

### Option 2: Use screen (Better)
```bash
apt install -y screen
screen -S vdomov
npm start
# Press Ctrl+A then D to detach
# screen -r vdomov  # to reattach
```

### Option 3: Use tmux (Best)
```bash
apt install -y tmux
tmux new-session -d -s vdomov npm start
# tmux attach-session -t vdomov  # to view
```

## Useful Commands

```bash
# Check if server is running
curl http://localhost:5050

# View logs
tail -f nohup.log

# Stop server
pkill -f "npm start"

# Install specific Node version
nvm install 18
nvm use 18

# Check storage usage
du -sh $HOME/vdomov-storage
```

## Troubleshooting

- Check Node version: `node --version` (should be 14+)
- Check npm version: `npm --version`
- View error logs: Check console output or log files
- Test connectivity: `curl http://localhost:3000`

## Next Steps

1. Connect via browser to your Termux server
2. Configure database/API settings in .env
3. Set up persistent storage for uploads
4. Consider using a process manager for auto-restart

---

For issues, check logs and ensure all dependencies are installed correctly.
