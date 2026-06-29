# 🗓️ Shift Swap Calendar (12-Cycle Weeks)

A modern, responsive Progressive Web App (PWA) built with React 19, Vite, and TypeScript. It features a 12-cycle shift swap scheduling system with reusable patterns and built-in Excel export capabilities (`xlsx`).

Live Demo: [https://www.j35t312.ca/](https://www.j35t312.ca/)

---

## 🚀 Features

* **12-Cycle Shift Tracker:** Easily manage and visualize 12-week or 12-cycle recurring schedule patterns.
* **Fully Offline Capable (PWA):** Powered by Workbox via `vite-plugin-pwa` for seamless offline access, background asset caching, and automatic updates.
* **Data Export:** Download and back up schedule permutations directly to Excel spreadsheet formats.
* **Optimized Performance:** Blazing fast development server and optimized build asset pipelines powered by Vite.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 (Functional components, hooks)
* **Build Tool & Bundler:** Vite 8
* **Language:** TypeScript 6 (Strictly typed codebases & configurations)
* **PWA Setup:** `vite-plugin-pwa` & `@vitejs/plugin-react`
* **Linter:** ESLint 10 with `typescript-eslint` rules
* **Utilities:** `xlsx` for spreadsheet parsing and sheet generation

---

## 📦 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+ recommended) and **npm** installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/12-cycle-weeks.git](https://github.com/your-username/12-cycle-weeks.git)
   cd 12-cycle-weeks# 🗓️ Shift Swap Calendar (12-Cycle Weeks)

A modern, responsive Progressive Web App (PWA) built with React 19, Vite, and TypeScript. It features a 12-cycle shift swap scheduling system with reusable patterns and built-in Excel export capabilities (`xlsx`).

Live Demo: [https://www.j35t312.ca/](https://www.j35t312.ca/)

---

## 🚀 Features

* **12-Cycle Shift Tracker:** Easily manage and visualize 12-week or 12-cycle recurring schedule patterns.
* **Fully Offline Capable (PWA):** Powered by Workbox via `vite-plugin-pwa` for seamless offline access, background asset caching, and automatic updates.
* **Data Export:** Download and back up schedule permutations directly to Excel spreadsheet formats.
* **Optimized Performance:** Blazing fast development server and optimized build asset pipelines powered by Vite.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 (Functional components, hooks)
* **Build Tool & Bundler:** Vite 8
* **Language:** TypeScript 6 (Strictly typed codebases & configurations)
* **PWA Setup:** `vite-plugin-pwa` & `@vitejs/plugin-react`
* **Linter:** ESLint 10 with `typescript-eslint` rules
* **Utilities:** `xlsx` for spreadsheet parsing and sheet generation

---

## 📦 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+ recommended) and **npm** installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/12-cycle-weeks.git
   cd 12-cycle-weeks
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

In the project directory, you can run the following automated tasks:

#### 💻 Development Server
Starts the local development server with Hot Module Replacement (HMR). 
```bash
npm run dev
```
> **Note:** PWA service workers are disabled during local development (`enabled: false` in `vite.config.ts`) to prevent aggressive caching and module interception from breaking HMR.

#### 🏗️ Production Build
Typechecks the TypeScript source files and compiles the production-ready static assets into the `dist/` directory.
```bash
npm run build
```

#### 🔍 Linting
Runs ESLint to find, analyze, and flag code quality issues or style violations.
```bash
npm run lint
```

#### 🌐 Preview
Locally previews your compiled production build to test performance and asset loading.
```bash
npm run preview
```

#### 🎨 Generate PWA Assets
Automatically generates required progressive web app icons, splash screens, and target dimensions based on a base SVG file.
```bash
npm run generate-pwa-assets
```

---

## 📱 PWA Asset Generation Details

The project utilizes `@vitejs/plugin-pwa/assets-generator` to handle cross-platform iconography. If you update the base icon located at `public/pwa-icon.svg`, make sure to regenerate the manifest assets by executing:

```bash
npm run generate-pwa-assets
```

This creates the required image sizes mapped inside the manifest file, including:
* Standard UI dimensions (`64x64`, `192x192`, `512x512`)
* Android adaptive structures (`maskable-icon-512x512.png`)
* Apple-specific touch target headers

---

## ⚙️ Configuration Details

* **Base URL:** Set to system root (`/`). Adjust the `base` property in `vite.config.ts` if deploying to a nested sub-path.
* **Service Worker Caching:** Custom workbox pattern caches all `js`, `css`, `html`, `ico`, `png`, `svg`, and `woff2` assets. 
* **API Passthrough:** The service worker bypasses routing scopes starting with `/api` via a fallback denylist regex rule.
