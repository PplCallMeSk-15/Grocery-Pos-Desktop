# Installation Guide

Follow these step-by-step instructions to install and configure the Grocery POS software on your local system or store cashier PC.

## Prerequisites

Ensure your system meets the following requirements:
* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **npm**: v9.0.0 or higher
* **Git**: Installed on your system

---

## Step 1: Clone Repository

```bash
git clone https://github.com/PplCallMeSk-15/Grocery-Pos-Desktop
cd Grocery-Pos-Desktop
```

---

## Step 2: Install Dependencies

Run the following command in the project root folder:

```bash
npm install
```

---

## Step 3: Configure Environment Variables

1. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in a text editor and configure required values:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   APP_URL=http://localhost:3000
   ```

---

## Step 4: Launch Application

To run the application in web development mode:

```bash
npm run dev
```

Navigate to `http://localhost:3000` in Google Chrome or Microsoft Edge.
