# Offline Usage Guide

This application is designed to work entirely locally within your institutional network. No internet connection is required once the initial setup is complete.

## How to Run Offline
1. **Using Node.js (Recommended)**:
   - Ensure [Node.js](https://nodejs.org/) is installed on your system.
   - Double-click the `start_portal.bat` file in the project folder.
   - This will start a local server and open the portal in your browser at `http://localhost:5173`.

2. **Strictly Offline Environments**:
   - If you need to move the app to a computer with **absolutely no internet access**:
     - Zip the entire `COE_frontend` folder (including the `node_modules` folder) from a computer that has internet.
     - Move the zip to the offline computer and extract it.
     - Run `start_portal.bat`.

## Technical Notes
- **Local Assets**: All icons (Lucide), fonts (Inter/Outfit), and libraries (React/Tailwind) are bundled within the project or handled by the local dev server.
- **Reporting**: The PDF and XLSX reports are stored in the `public/reports` folder and do not require external API calls to download or preview.
- **Persistence**: All data (dates, holidays, classifications) is stored in the browser's memory. Refreshing the page or restarting the server will reset the state (unless implemented with LocalStorage).
