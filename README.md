# VaultFlow — Personal Finance Dashboard

A minimal, premium personal finance dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

![VaultFlow Dashboard](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

## Features

- **Dashboard** — Net worth overview, monthly income/expenses, savings rate, recent transactions
- **Savings Pots** — Track savings goals with progress bars and monthly contributions
- **Budget & Transactions** — Log income/expenses, filter by month, export to CSV
- **Investments** — Track portfolio performance with gain/loss indicators and allocation chart
- **Debt Tracker** — Monitor balances, APR, and payoff timelines
- **Subscriptions** — Track recurring costs with renewal date alerts
- **Net Worth** — Historical trends with interactive area chart
- **Financial Tools** — Emergency fund, compound interest, debt payoff, savings goal, salary, and % calculators
- **Settings** — Currency selector, dark/light mode, data export and reset

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Recharts | Interactive charts |
| lucide-react | Icons |
| date-fns | Date formatting |
| react-hot-toast | Notifications |
| LocalStorage | Data persistence |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Dashboard
│   ├── savings/            # Savings pots
│   ├── budget/             # Transactions & budget
│   ├── investments/        # Investment portfolio
│   ├── debt/               # Debt tracker
│   ├── subscriptions/      # Subscription manager
│   ├── net-worth/          # Net worth history
│   ├── tools/              # Financial calculators
│   └── settings/           # App settings
├── components/
│   ├── ui/                 # Reusable UI primitives (Card, Button, Modal, etc.)
│   ├── layout/             # Sidebar & BottomNav
│   └── charts/             # Recharts wrappers
├── hooks/                  # useAppData custom hook
├── lib/                    # storage.ts, utils.ts, csvUtils.ts
├── types/                  # TypeScript types
└── data/                   # seed.ts demo data
```

## Data Storage

All data is stored in `localStorage` under the key `vaultflow_data`. No data is sent to any server. You can reset to demo data any time from **Settings → Reset All Data**.

## Design

- Apple-inspired minimal UI with clean white / soft grey / dark mode support
- Responsive layout: sidebar on desktop, bottom navigation on mobile
- `rounded-2xl` cards with subtle shadows and hover effects
- Indigo accent colour (`#6366f1`) for primary actions
- Emerald for income/gain, red for expense/loss indicators
