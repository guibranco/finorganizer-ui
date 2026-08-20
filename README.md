# 📊💸 FinOrganizer UI

[![Build and Test](https://github.com/guibranco/finorganizer-ui/actions/workflows/build.yml/badge.svg)](https://github.com/guibranco/finorganizer-ui/actions/workflows/build.yml)
[![Build & Deploy](https://github.com/guibranco/finorganizer-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/guibranco/finorganizer-ui/actions/workflows/deploy.yml)

> **Your personal finances, fully organized.** A high-performance dashboard for multi-currency accounting, asset portfolio tracking, automated cash flow forecasting, and inline budget analysis.

---

## ✨ Features

- 📈 **Dashboard**: At-a-glance summary of balances, spending trends, and upcoming activity.
- 🏦 **Accounts**: Manage multiple accounts and currencies, with detailed per-account views.
- 💹 **Portfolio**: Track asset positions and events, with drill-down detail pages.
- 🧾 **Transactions**: Browse, categorize, and manage transaction history.
- 🔁 **Recurrences**: Automate recurring transactions and review pending occurrences.
- 🎯 **Planning**: Budgeting and savings goals with inline analysis.
- 🏷️ **Category Management**: Organize transactions with custom categories.
- 📥 **CSV Import Wizard**: Bulk-import transactions from CSV files.
- ⚡ **Quick Add**: Fast entry for new transactions from anywhere in the app.
- 🔌 **Bring Your Own Backend**: Connect to your own self-hosted API, or explore instantly in **mock data mode** — no server required.
- 🌗 **Modern UX**: Built with React 19, Tailwind CSS 4, and Framer Motion for smooth, responsive interactions.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | UI components & state management |
| **TypeScript** | Static typing across the app |
| **Vite** | Dev server and production build tool |
| **Tailwind CSS 4** | Utility-first styling |
| **TanStack Query** | Data fetching & caching |
| **React Hook Form + Zod** | Form state and schema validation |
| **React Router** | Client-side routing |
| **Recharts** | Charts and data visualization |
| **Motion** | Animations and transitions |
| **Lucide React** | Icon set |
| **Vitest** | Unit and integration testing |

---

## 📡 Backend API

FinOrganizer UI is a **frontend-only** application. On first launch, the **Connection Portal** asks for your server URL and API key, which are stored in `localStorage`. You can either:

- 🔗 **Connect to your own API** — point it at your self-hosted FinOrganizer backend.
- 🧪 **Use mock data mode** — explore the full UI instantly with realistic sample data, no backend required.

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** (v22 or higher)
- **npm**

### 💻 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/guibranco/finorganizer-ui.git
   cd finorganizer-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### ⚡ Local Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev` — Starts the development server at port 3000.
- `npm run build` — Compiles the project into a production-ready `dist` folder.
- `npm run preview` — Serves the production build locally.
- `npm run test` — Runs the test suite.
- `npm run test:coverage` — Runs tests and generates a coverage report.
- `npm run lint` — Type-checks the project with TypeScript.
- `npm run clean` — Removes the `dist` directory and build artifacts.

---

## 🧪 Testing

Tests are written with [Vitest](https://vitest.dev/) and live in the `tests/` directory.

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 🏗️ Building for Production

```bash
npm run build
```

The output is generated in the `dist/` directory, ready to be hosted anywhere static files are served.

---

## 🚢 Deployment

This project is configured for automatic deployment to **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`). Every push to `main`:

1. 🏗️ Builds the application.
2. 🧪 Runs the full test suite with coverage.
3. 🔍 Runs a SonarCloud scan.
4. 🚀 Deploys to GitHub Pages.
5. 🏷️ Cuts a new SemVer release automatically via GitVersion.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ✨ and ☕ by <a href="https://github.com/guibranco">guibranco</a>
</p>
