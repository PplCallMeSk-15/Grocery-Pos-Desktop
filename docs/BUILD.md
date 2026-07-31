# Build & Electron Packaging Guide

Learn how to compile web production builds and generate standalone Windows desktop installers.

## 📦 Web Bundle Build

Generates optimized static HTML, JS, and CSS files in `dist/`:

```bash
npm run build
```

---

## 🖥️ Electron Windows Desktop Installer (.exe)

This software includes preconfigured Electron settings (`electron/main.js`, `electron/preload.js`, and `package.json`).

### Step 1: Ensure Prerequisites
* Node.js v18+
* Windows 10/11 x64 environment

### Step 2: Run Electron Build
```bash
npm run electron:build
```

### Step 3: Locate Installer
The compiled setup file will be placed in `release/`:
* `Grocery POS & Inventory Software Setup.exe`

### Customizing App Icon & Branding
To change the desktop icon and installer title:
1. Replace `assets/icon.png` or `public/favicon.ico`.
2. Update `productName` and `appId` in `package.json` under the `"build"` section.
