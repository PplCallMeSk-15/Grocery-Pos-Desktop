# Deployment Guide

This guide covers deploying the **Grocery POS & Inventory System** to web hosting platforms or running it locally on store cashier PCs.

## Option 1: Web Hosting Deployment (Vercel / Netlify / Cloud Run)

### Vercel Deployment
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Configure Environment Variables (`GEMINI_API_KEY`, `APP_URL`).
5. Click **Deploy**.

---

## Option 2: Local Supermarket Cashier PC Deployment (Offline Mode)

For store terminals requiring 100% offline uptime without internet dependence:

1. Build static production assets:
   ```bash
   npm run build
   ```
2. Serve locally using `serve` or standard local HTTP web server:
   ```bash
   npx serve -s dist -l 3000
   ```
3. Set browser in Kiosk Mode (`--kiosk http://localhost:3000`).

---

## Option 3: Desktop Executable (.exe) Deployment

Package into a native Windows application using Electron:

```bash
npm run electron:build
```

Copy the generated installer from `release/` to any cashier PC and double click to install.
