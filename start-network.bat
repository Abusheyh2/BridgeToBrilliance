@echo off
REM Bridge to Brilliance - Network Access Startup Script for Windows

echo.
echo 🚀 Starting Bridge to Brilliance in production mode...
echo The app will be accessible from other machines on your network
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4 Address"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

echo 📍 Access the app at:
echo    Local: http://localhost:3000
echo    Network: http://%LOCAL_IP%:3000
echo.
echo Share this IP with your friends: http://%LOCAL_IP%:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the production server
set PORT=3000
npm start
pause
