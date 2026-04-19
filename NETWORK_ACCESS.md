# Network Access Guide - Bridge to Brilliance

Your app is now ready to be accessed from other machines on your network! Here's how to set it up:

## Quick Start

### Linux/Mac
Run the startup script:
```bash
./start-network.sh
```

### Windows
Double-click:
```
start-network.bat
```

### Manual Method (Any OS)
```bash
npm start
```

The app will be accessible at:
- **Local Only**: `http://localhost:3000`
- **From Other Machines**: `http://<your-ip>:3000`

## Finding Your IP Address

### Linux/Mac
```bash
hostname -I
```
Then use the first IP shown, e.g., `http://192.168.x.x:3000`

### Windows
```cmd
ipconfig
```
Look for "IPv4 Address" under your network adapter, e.g., `http://192.168.x.x:3000`

## Sharing With Friends

1. Find your local network IP (see above)
2. Make sure your firewall allows port 3000
3. Share the URL: `http://<your-ip>:3000`
4. They can now access it without needing Node.js installed!

## Important Notes

✅ **What They Need:**
- A web browser (Chrome, Firefox, Safari, Edge, etc.)
- To be on the same network (or you forward the port)

❌ **What They DON'T Need:**
- Node.js installed
- Any development tools

## Troubleshooting

### "Connection refused"
- Make sure `npm start` is running
- Check your firewall settings (port 3000 should be open)
- Verify you're using the correct IP address

### "Can't access from other machine"
- Try `npm start` instead of the script if issues persist
- Check if devices are on the same WiFi network
- If on different networks, you'll need to port forward

### Production build didn't update
- The app was already built. Just run `npm start` to use the production version
- For new changes: `npm run build` → `npm start`

## Environment Notes

The app requires:
- `.env.local` file with Supabase credentials (if using backend features)
- See `.env.example` if available, or contact the developer

## Performance

Production builds are:
- ⚡ Faster than development mode
- 🔒 More optimized and secure
- 📦 Smaller file sizes
- 🌐 Network-ready out of the box
