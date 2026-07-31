# How to Build Windows Installer (.exe) for Grocery POS

This application is fully prepared for Desktop Electron packaging into a standalone Windows `.exe` installer.

## Prerequisites
1. Node.js (v18+) installed on your PC.
2. Windows environment (or Wine on Linux/Mac).

## Packaging Steps

### Step 1: Install electron & electron-builder
Run the following in your terminal:
```bash
npm install --save-dev electron electron-builder
```

### Step 2: Add Electron scripts to package.json
In `package.json`, ensure the following scripts & builder config are added:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "electron:dev": "NODE_ENV=development electron .",
    "electron:build": "npm run build && electron-builder --win nsis"
  },
  "build": {
    "appId": "com.grocerypos.offline",
    "productName": "Grocery POS & Inventory Software",
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Step 3: Generate the Windows .exe Installer
Run:
```bash
npm run electron:build
```

### Output
The compiled Windows setup file will be placed in the `dist_electron/` directory:
- `Grocery POS & Inventory Software Setup.exe`

Double click the `.exe` file on any Windows PC to install the software completely offline!
