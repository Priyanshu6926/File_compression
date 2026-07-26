# PicSize Pro — Chrome Extension

> Compress images and auto-inject them into any website's file input — built for government portals, exam forms, and job applications.

---

## 🚀 How to Load in Chrome (Development)

1. Open Chrome and go to **`chrome://extensions`**
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the **`extension/`** folder from this project
5. The PicSize Pro icon appears in your toolbar ✅

---

## ⚙️ First-Time Setup

1. Click the extension icon → click ⚙ (Settings)
2. Set the **Server URL**:
   - **Development:** `http://localhost:3000` (run `npm run dev` in project root)
   - **Production:** Your Vercel deployment URL (e.g. `https://picsize-pro.vercel.app`)
3. Click **SAVE**

---

## 🎯 How to Use

1. Navigate to any website with a file upload (exam portals, gov forms, LinkedIn, etc.)
2. Click the **PicSize Pro** extension icon
3. The badge shows how many file inputs are on the page
4. **Upload** your image (drag & drop or click)
5. Pick a **Preset** (Passport India, Aadhar, LinkedIn, etc.) or set custom specs
6. Click **⚡ COMPRESS IMAGE**
7. Click **💉 INJECT INTO PAGE** — the compressed image is instantly loaded into the website's file input
8. The website highlights green ✅ and the form is ready to submit

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Auto-inject** | File appears in form input without manual picking |
| **Smart Presets** | Passport India/US, Aadhar, LinkedIn, WhatsApp DP |
| **Pick Mode** | Click 🎯 to select which input to target on pages with multiple uploads |
| **Rename** | Set output filename before injecting |
| **Download** | Also save compressed file to desktop |
| **Badge Counter** | Shows number of file inputs on current page |
| **Configurable API** | Switch between local dev and production |

---

## 🔑 Permissions Explained

| Permission | Why needed |
|-----------|------------|
| `activeTab` | Read the currently visible tab only |
| `scripting` | Inject the file into the page's DOM |
| `storage` | Remember your API URL setting |
| `host_permissions: <all_urls>` | Work on any website |

> ⚠️ **Privacy note:** Images are sent to your configured API server for compression. No data is stored. Use `localhost:3000` for full offline-mode (no external servers).

---

## 🛠 Tech Stack

- **Manifest V3** — latest Chrome Extension standard
- **DataTransfer API** — programmatically sets file input values
- **Chrome Scripting API** — injects code into page context
- **Chrome Storage Sync** — persists settings across devices
- **Service Worker** — background badge management
- Pure HTML/CSS/JS — no build step required

---

## 📁 File Structure

```
extension/
├── manifest.json       — Extension config (Manifest V3)
├── popup.html          — Extension popup UI
├── popup.js            — Compression + injection logic
├── popup.css           — Neo-brutalist styles
├── content.js          — Injected into every page
├── background.js       — Service worker
├── generate-icons.js   — Run once to generate PNG icons
├── test-page.html      — Test form to try injection
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```
