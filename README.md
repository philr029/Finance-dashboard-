# VaultFlow — Personal Finance Dashboard

A premium, portfolio-quality personal finance dashboard that helps you track savings, budgeting, investments, debt, subscriptions, and net worth in one clean interface.

![VaultFlow](https://img.shields.io/badge/VaultFlow-Finance%20Dashboard-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

## Overview

VaultFlow is a modern SaaS-style personal finance dashboard built with Next.js 14, TypeScript, and Tailwind CSS. It provides a comprehensive suite of tools for tracking your financial life — from savings goals and monthly budgets to investments, debts, and subscriptions — all stored securely in your browser's local storage.

## Features

- **Dashboard** — Instant overview of net worth, savings, investments, debt, monthly income/expenses, and savings rate
- **Savings** — Multiple saving pots with progress bars, targets, and estimated time to goal
- **Budget** — Income and expense tracking with category breakdown charts and monthly filtering
- **Investments** — Manual portfolio tracking for stocks, ETFs, crypto, and cash with gain/loss calculations
- **Debt** — Debt tracker with APR, minimum payments, payoff estimates, and due date alerts
- **Subscriptions** — Recurring payment manager with keep/review/cancel status and renewal alerts
- **Net Worth** — Asset vs liabilities trend chart and 12-month history
- **Tools** — 8 financial calculators: emergency fund, compound interest, savings goal, debt payoff, salary, gain/loss, 50/30/20 split, and subscription impact
- **Settings** — Currency selector, light/dark mode, demo data toggle, export/import data

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | Framework & routing |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Recharts | Charts & data visualisation |
| Lucide React | Icons |
| date-fns | Date manipulation |
| react-hot-toast | Toast notifications |
| Local Storage | Data persistence |

## Project Structure

```
app/                    # Next.js App Router pages
├── page.tsx            # Dashboard
├── savings/            # Savings pots
├── budget/             # Budget tracker
├── investments/        # Portfolio tracker
├── debt/               # Debt manager
├── subscriptions/      # Subscription manager
├── net-worth/          # Net worth tracker
├── tools/              # Financial calculators
└── settings/           # App settings
components/
├── ui/                 # Reusable UI components
├── layout/             # Sidebar, Header, MobileNav
└── charts/             # Chart wrappers
lib/
└── storage.ts          # Local storage CRUD
hooks/
└── useAppData.ts       # Central data hook
types/
└── index.ts            # TypeScript interfaces
data/
└── seed.ts             # Demo seed data
utils/
├── calculations.ts     # Financial calculations
└── formatters.ts       # Display helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/your-username/vaultflow.git
cd vaultflow
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Demo Data

The app ships with realistic example data covering:
- 4 savings pots (Emergency Fund, Holiday, Laptop, House Deposit)
- Transactions for the last 2 months
- 4 investments (S&P 500 ETF, Apple, Bitcoin, Cash ISA)
- 3 debts (Student Loan, Credit Card, Car Finance)
- 8 subscriptions (Netflix, Spotify, Adobe CC, etc.)
- 12 months of net worth history

You can reset or disable demo data in the Settings page.

## Data Persistence

All data is stored in the browser's `localStorage` under the key `vaultflow_data`. No server or database is required.

### Export/Import

- **Export**: Downloads your data as a JSON file
- **Import**: Loads data from a previously exported JSON file

## Future Improvements

- [ ] Bank CSV imports (Monzo, Starling, etc.)
- [ ] Trading 212 portfolio CSV import
- [ ] Plum/Chip savings import
- [ ] Live crypto price APIs (CoinGecko)
- [ ] Open Banking integration (Plaid, TrueLayer)
- [ ] Authentication and cloud sync
- [ ] Recurring transaction automation
- [ ] Tax year reporting
- [ ] PWA / offline support
- [ ] Budget vs actual alerts

## Suggested API Integrations

| Integration | Use Case |
|-------------|---------|
| CoinGecko API | Live crypto prices |
| Alpha Vantage | Stock price updates |
| Plaid / TrueLayer | Open banking connection |
| Trading 212 CSV | Portfolio import |
| HMRC API | Tax allowance tracking |

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## Licence

MIT
