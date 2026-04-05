// =====================================
// FINANCEFLOW — MAIN APPLICATION
// =====================================

// ──────────────────────────────────────
// 1. CONSTANTS & CONFIG
// ──────────────────────────────────────

const APP_VERSION = '1.0.0';
const STORAGE_KEY = 'financeflow_data';

const CATEGORIES = [
  'Housing', 'Food & Dining', 'Transport', 'Health', 'Entertainment',
  'Shopping', 'Education', 'Utilities', 'Insurance', 'Personal Care',
  'Savings', 'Investment', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment Income', 'Rental Income', 'Other Income'
];

const INVESTMENT_TYPES = ['ETF', 'Stock', 'Crypto', 'Bond', 'Cash', 'Other'];

const CURRENCIES = { GBP: '£', USD: '$', EUR: '€' };

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  '#14b8a6', '#a855f7', '#fb923c'
];

// ──────────────────────────────────────
// 2. STATE MANAGEMENT
// ──────────────────────────────────────

let state = {
  transactions: [],
  budgets: [],       // { id, category, amount }
  savingsGoals: [],  // { id, name, target, current, targetDate, color }
  investments: [],   // { id, name, type, units, buyPrice, currentPrice }
  subscriptions: [], // { id, name, cost, billingCycle, renewalDate, category }
  settings: {
    currency: 'GBP',
    theme: 'light'
  }
};

// ──────────────────────────────────────
// 3. DEMO DATA
// ──────────────────────────────────────

function buildDemoData() {
  const today = new Date();
  const addMonths = (offset) => {
    const date = new Date(today);
    date.setMonth(date.getMonth() + offset);
    return date;
  };
  const fmt = (date) => date.toISOString().split('T')[0];
  const randomAmount = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);

  const transactions = [
    // Current month
    { id: generateId(), type: 'income',  date: fmt(new Date(today.getFullYear(), today.getMonth(), 1)),  description: 'Monthly Salary',            category: 'Salary',         amount: 3500, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 1)),  description: 'Rent Payment',               category: 'Housing',        amount: 1100, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 3)),  description: 'Tesco Weekly Shop',           category: 'Food & Dining',  amount: 87.45, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 5)),  description: 'Monthly Oyster Card',         category: 'Transport',      amount: 148, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 5)),  description: 'Electricity Bill',            category: 'Utilities',      amount: 62.80, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 6)),  description: 'Sainsbury\'s',               category: 'Food & Dining',  amount: 54.20, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 8)),  description: 'Netflix',                    category: 'Entertainment',  amount: 15.99, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 8)),  description: 'Spotify',                    category: 'Entertainment',  amount: 10.99, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 9)),  description: 'PureGym Membership',          category: 'Health',         amount: 24.99, notes: '' },
    { id: generateId(), type: 'income',  date: fmt(new Date(today.getFullYear(), today.getMonth(), 10)), description: 'Freelance Web Project',       category: 'Freelance',      amount: 650, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 11)), description: 'ASOS Clothing Order',         category: 'Shopping',       amount: 79.95, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 12)), description: 'Marks & Spencer Food Hall',   category: 'Food & Dining',  amount: 43.60, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 14)), description: 'Council Tax',                 category: 'Housing',        amount: 142, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 14)), description: 'Water Bill',                  category: 'Utilities',      amount: 33.50, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 15)), description: 'Boots Pharmacy',              category: 'Health',         amount: 22.40, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 16)), description: 'Amazon Prime',                category: 'Shopping',       amount: 8.99, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 17)), description: 'Costa Coffee',                category: 'Food & Dining',  amount: 18.50, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 18)), description: 'iCloud Storage',              category: 'Personal Care',  amount: 2.99, notes: '' },
    { id: generateId(), type: 'income',  date: fmt(new Date(today.getFullYear(), today.getMonth(), 20)), description: 'Dividend — Vanguard ETF',     category: 'Investment Income', amount: 42.17, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 20)), description: 'Petrol',                      category: 'Transport',      amount: 68, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 21)), description: 'Waitrose',                    category: 'Food & Dining',  amount: 61.30, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth(), 22)), description: 'Car Insurance',               category: 'Insurance',      amount: 58.33, notes: '' },
    // Last month
    { id: generateId(), type: 'income',  date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 1)),  description: 'Monthly Salary',          category: 'Salary',         amount: 3500, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 1)),  description: 'Rent Payment',             category: 'Housing',        amount: 1100, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 4)),  description: 'Tesco',                    category: 'Food & Dining',  amount: 92.10, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 5)),  description: 'Monthly Oyster Card',      category: 'Transport',      amount: 148, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 7)),  description: 'Gas Bill',                 category: 'Utilities',      amount: 71.20, notes: '' },
    { id: generateId(), type: 'income',  date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 12)), description: 'Freelance Design Work',    category: 'Freelance',      amount: 400, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 15)), description: 'Council Tax',              category: 'Housing',        amount: 142, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 18)), description: 'Dining Out — The Ivy',     category: 'Food & Dining',  amount: 84.50, notes: 'Birthday dinner' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 20)), description: 'John Lewis — Bedding',     category: 'Shopping',       amount: 65, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 22)), description: 'Netflix',                  category: 'Entertainment',  amount: 15.99, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-1, 25)), description: 'Car Insurance',            category: 'Insurance',      amount: 58.33, notes: '' },
    // Two months ago
    { id: generateId(), type: 'income',  date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 1)),  description: 'Monthly Salary',          category: 'Salary',         amount: 3500, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 1)),  description: 'Rent Payment',             category: 'Housing',        amount: 1100, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 3)),  description: 'Tesco',                    category: 'Food & Dining',  amount: 78.90, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 5)),  description: 'Monthly Oyster Card',      category: 'Transport',      amount: 148, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 8)),  description: 'Electricity Bill',         category: 'Utilities',      amount: 55.60, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 10)), description: 'PureGym',                  category: 'Health',         amount: 24.99, notes: '' },
    { id: generateId(), type: 'income',  date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 15)), description: 'Freelance Consulting',     category: 'Freelance',      amount: 850, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 15)), description: 'Council Tax',              category: 'Housing',        amount: 142, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 18)), description: 'ASOS',                     category: 'Shopping',       amount: 53.40, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 20)), description: 'Cinema Tickets',           category: 'Entertainment',  amount: 29.50, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 22)), description: 'Car Insurance',            category: 'Insurance',      amount: 58.33, notes: '' },
    { id: generateId(), type: 'expense', date: fmt(new Date(today.getFullYear(), today.getMonth()-2, 25)), description: 'Spotify',                  category: 'Entertainment',  amount: 10.99, notes: '' },
  ];

  const budgets = [
    { id: generateId(), category: 'Housing',       amount: 1300 },
    { id: generateId(), category: 'Food & Dining', amount: 350  },
    { id: generateId(), category: 'Transport',     amount: 200  },
    { id: generateId(), category: 'Utilities',     amount: 120  },
    { id: generateId(), category: 'Entertainment', amount: 80   },
    { id: generateId(), category: 'Shopping',      amount: 150  },
    { id: generateId(), category: 'Health',        amount: 60   },
    { id: generateId(), category: 'Insurance',     amount: 70   },
  ];

  const savingsGoals = [
    { id: generateId(), name: 'House Deposit',    target: 50000, current: 18400, targetDate: fmt(addMonths(18)), color: '#3b82f6' },
    { id: generateId(), name: 'Holiday — Japan',  target: 3500,  current: 1800,  targetDate: fmt(addMonths(6)),  color: '#10b981' },
    { id: generateId(), name: 'Emergency Fund',   target: 15000, current: 9200,  targetDate: fmt(addMonths(10)), color: '#f59e0b' },
  ];

  const investments = [
    { id: generateId(), name: 'Vanguard S&P 500 ETF', type: 'ETF',    units: 45.2,  buyPrice: 68.50,   currentPrice: 84.20  },
    { id: generateId(), name: 'Apple Inc (AAPL)',      type: 'Stock',  units: 12,    buyPrice: 142.30,  currentPrice: 178.50 },
    { id: generateId(), name: 'Bitcoin (BTC)',         type: 'Crypto', units: 0.15,  buyPrice: 28000,   currentPrice: 42000  },
    { id: generateId(), name: 'UK Gilt Bond Fund',     type: 'Bond',   units: 100,   buyPrice: 9.80,    currentPrice: 9.65   },
    { id: generateId(), name: 'Cash ISA',              type: 'Cash',   units: 1,     buyPrice: 5000,    currentPrice: 5213   },
  ];

  const subscriptions = [
    { id: generateId(), name: 'Netflix',          cost: 15.99, billingCycle: 'monthly',  renewalDate: fmt(addMonths(1)), category: 'Entertainment' },
    { id: generateId(), name: 'Spotify',          cost: 10.99, billingCycle: 'monthly',  renewalDate: fmt(addMonths(1)), category: 'Entertainment' },
    { id: generateId(), name: 'PureGym',          cost: 24.99, billingCycle: 'monthly',  renewalDate: fmt(addMonths(1)), category: 'Health' },
    { id: generateId(), name: 'iCloud 50GB',      cost: 2.99,  billingCycle: 'monthly',  renewalDate: fmt(addMonths(1)), category: 'Storage' },
    { id: generateId(), name: 'Amazon Prime',     cost: 95,    billingCycle: 'annual',   renewalDate: fmt(addMonths(4)), category: 'Shopping' },
    { id: generateId(), name: 'Adobe CC',         cost: 54.98, billingCycle: 'monthly',  renewalDate: fmt(addMonths(1)), category: 'Software' },
  ];

  return { transactions, budgets, savingsGoals, investments, subscriptions };
}

// ──────────────────────────────────────
// 4. LOCALSTORAGE HELPERS
// ──────────────────────────────────────

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
    toast('Could not save data. Please check your browser storage settings (storage may be full or disabled).', 'error');
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Deep merge: keep defaults for missing keys
      state.transactions  = saved.transactions  || [];
      state.budgets       = saved.budgets        || [];
      state.savingsGoals  = saved.savingsGoals   || [];
      state.investments   = saved.investments    || [];
      state.subscriptions = saved.subscriptions  || [];
      state.settings      = { ...state.settings, ...(saved.settings || {}) };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

function resetState() {
  state = {
    transactions: [],
    budgets: [],
    savingsGoals: [],
    investments: [],
    subscriptions: [],
    settings: { currency: 'GBP', theme: 'light' }
  };
  saveState();
}

function loadDemoData() {
  const demo = buildDemoData();
  state.transactions  = demo.transactions;
  state.budgets       = demo.budgets;
  state.savingsGoals  = demo.savingsGoals;
  state.investments   = demo.investments;
  state.subscriptions = demo.subscriptions;
  saveState();
  toast('Demo data loaded successfully!', 'success');
  showSection(currentSection);
}

// ──────────────────────────────────────
// 5. NAVIGATION
// ──────────────────────────────────────

let currentSection = 'dashboard';

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  // Show target
  const target = document.getElementById('section-' + sectionId);
  if (target) target.classList.add('active');

  // Update sidebar nav
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });

  // Update bottom nav
  document.querySelectorAll('#bottom-nav .bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });

  currentSection = sectionId;

  // Re-render the section
  const renderers = {
    dashboard:     renderDashboard,
    transactions:  renderTransactions,
    budget:        renderBudget,
    savings:       renderSavingsGoals,
    investments:   renderInvestments,
    subscriptions: renderSubscriptions,
    tools:         () => {},   // static HTML, no render needed
    settings:      renderSettings,
  };
  if (renderers[sectionId]) renderers[sectionId]();

  // Re-init Lucide icons for any dynamically-injected HTML
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setupNavigation() {
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showSection(el.dataset.section);
    });
  });
}

// ──────────────────────────────────────
// 6. DASHBOARD
// ──────────────────────────────────────

function renderDashboard() {
  const now   = new Date();
  const currM = getCurrentMonth();
  const prevM = getMonthStr(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  // Monthly figures
  const currIncome   = sumTransactions(state.transactions, 'income',  currM);
  const currExpenses = sumTransactions(state.transactions, 'expense', currM);
  const prevIncome   = sumTransactions(state.transactions, 'income',  prevM);
  const prevExpenses = sumTransactions(state.transactions, 'expense', prevM);

  // All-time balance
  const totalIncome   = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBalance  = totalIncome - totalExpenses;

  // Savings rate
  const savingsRate = currIncome > 0 ? Math.max(0, ((currIncome - currExpenses) / currIncome * 100)) : 0;

  // Investment total
  const investTotal = state.investments.reduce((s, inv) => s + inv.units * inv.currentPrice, 0);

  // Net worth
  const goalSavings = state.savingsGoals.reduce((s, g) => s + g.current, 0);
  const netWorth    = totalBalance + investTotal + goalSavings;

  // Update stat cards
  setText('stat-total-balance',    formatCurrency(totalBalance));
  setText('stat-monthly-income',   formatCurrency(currIncome));
  setText('stat-monthly-expenses', formatCurrency(currExpenses));
  setText('stat-savings-rate',     savingsRate.toFixed(1) + '%');
  setText('stat-investment-total', formatCurrency(investTotal));
  setText('stat-net-worth',        formatCurrency(netWorth));

  // Change indicators
  setChangeIndicator('stat-income-change',   currIncome,   prevIncome,   '');
  setChangeIndicator('stat-expenses-change', currExpenses, prevExpenses, '', true);

  // Health score
  renderHealthScore(savingsRate, currExpenses, currIncome);

  // Recent transactions (last 5)
  renderRecentTransactions();

  // Charts
  renderIncomeVsExpensesChart();
  renderSpendingByCategoryChart();
  renderSavingsGrowthChart();
  renderInvestmentAllocationChart();
}

function setChangeIndicator(id, current, previous, suffix, invertGood) {
  const el = document.getElementById(id);
  if (!el) return;
  if (previous === 0) { el.className = 'stat-change neutral'; el.textContent = 'No comparison data'; return; }
  const diff = current - previous;
  const pct  = (Math.abs(diff) / previous * 100).toFixed(1);
  const up   = diff >= 0;
  const good = invertGood ? !up : up;
  el.className = 'stat-change ' + (good ? 'positive' : 'negative');
  el.textContent = (up ? '▲' : '▼') + ' ' + pct + '% vs last month';
}

function renderHealthScore(savingsRate, expenses, income) {
  // Score components (0–100)
  let score = 0;
  // Savings rate (up to 50 pts)
  score += Math.min(50, savingsRate * 1.25);
  // Budget adherence (up to 30 pts)
  if (state.budgets.length > 0) {
    const currM = getCurrentMonth();
    let onBudget = 0;
    state.budgets.forEach(b => {
      const spent = getSpentForCategory(b.category, currM);
      if (spent <= b.amount) onBudget++;
    });
    score += (onBudget / state.budgets.length) * 30;
  } else {
    score += 15; // neutral if no budgets set
  }
  // Has emergency fund goal (up to 20 pts)
  const ef = state.savingsGoals.find(g => g.name.toLowerCase().includes('emergency'));
  if (ef) {
    score += Math.min(20, (ef.current / ef.target) * 20);
  }

  score = Math.round(Math.min(100, Math.max(0, score)));

  const badge = document.getElementById('health-badge');
  const valueEl = document.getElementById('health-score-value');
  if (!badge || !valueEl) return;

  valueEl.textContent = score;
  badge.classList.remove('amber', 'red');
  if (score < 40)      badge.classList.add('red');
  else if (score < 70) badge.classList.add('amber');
}

function renderRecentTransactions() {
  const tbody = document.getElementById('recent-transactions-body');
  if (!tbody) return;

  const recent = [...state.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No transactions yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td class="fw-600">${escHtml(t.description)}</td>
      <td><span class="badge badge-neutral">${escHtml(t.category)}</span></td>
      <td class="${t.type === 'income' ? 'amount-positive' : 'amount-negative'}">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
      </td>
      <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${capitalize(t.type)}</span></td>
    </tr>
  `).join('');
}

// ──────────────────────────────────────
// 7. TRANSACTIONS
// ──────────────────────────────────────

function renderTransactions() {
  populateCategoryFilter();
  renderTransactionsTable();
}

function populateCategoryFilter() {
  const sel = document.getElementById('filter-category');
  if (!sel) return;
  const used = [...new Set(state.transactions.map(t => t.category))].sort();
  sel.innerHTML = '<option value="all">All Categories</option>' +
    used.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
}

function getFilteredTransactions() {
  const search = (document.getElementById('transaction-search')?.value || '').toLowerCase();
  const type   = document.getElementById('filter-type')?.value    || 'all';
  const cat    = document.getElementById('filter-category')?.value || 'all';
  const start  = document.getElementById('filter-date-start')?.value;
  const end    = document.getElementById('filter-date-end')?.value;

  return state.transactions.filter(t => {
    if (type !== 'all' && t.type !== type) return false;
    if (cat  !== 'all' && t.category !== cat) return false;
    if (start && t.date < start) return false;
    if (end   && t.date > end)   return false;
    if (search && !t.description.toLowerCase().includes(search) &&
                  !t.category.toLowerCase().includes(search)) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderTransactionsTable() {
  const tbody = document.getElementById('transactions-body');
  if (!tbody) return;
  const list = getFilteredTransactions();

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty-state">
        <i data-lucide="arrow-left-right" class="empty-icon"></i>
        <p class="empty-title">${state.transactions.length === 0 ? 'No transactions yet' : 'No results match your filters'}</p>
        <p class="empty-desc">${state.transactions.length === 0 ? 'Add your first transaction or load demo data' : 'Try adjusting your search or filters'}</p>
        ${state.transactions.length === 0 ? '<button class="btn btn-primary" onclick="openAddTransactionModal()"><i data-lucide="plus"></i> Add Transaction</button>' : ''}
      </div>
    </td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  tbody.innerHTML = list.map(t => `
    <tr>
      <td style="white-space:nowrap">${formatDate(t.date)}</td>
      <td class="fw-600">${escHtml(t.description)}</td>
      <td><span class="badge badge-neutral">${escHtml(t.category)}</span></td>
      <td class="${t.type === 'income' ? 'amount-positive' : 'amount-negative'}" style="white-space:nowrap">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
      </td>
      <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${capitalize(t.type)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditTransactionModal('${t.id}')" title="Edit">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="confirmDelete('transaction','${t.id}','${escForOnclick(t.description)}',deleteTransaction)" title="Delete">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addTransaction(data) {
  state.transactions.push({ id: generateId(), ...data });
  saveState();
  toast('Transaction added!', 'success');
}

function editTransaction(id, data) {
  const idx = state.transactions.findIndex(t => t.id === id);
  if (idx === -1) return;
  state.transactions[idx] = { id, ...data };
  saveState();
  toast('Transaction updated!', 'success');
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveState();
  renderTransactionsTable();
  toast('Transaction deleted.', 'info');
}

function exportCSV() {
  const list = getFilteredTransactions();
  if (list.length === 0) { toast('No transactions to export.', 'warning'); return; }

  const sym = CURRENCIES[state.settings.currency] || '£';
  const header = 'Date,Description,Category,Amount,Type,Notes\n';
  const rows = list.map(t =>
    `${t.date},"${t.description.replace(/"/g,'""')}","${t.category}","${sym}${t.amount.toFixed(2)}",${t.type},"${(t.notes||'').replace(/"/g,'""')}"`
  ).join('\n');

  const blob  = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url   = URL.createObjectURL(blob);
  const link  = document.createElement('a');
  link.href     = url;
  link.download = `financeflow-transactions-${getCurrentMonth()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast('CSV exported!', 'success');
}

// Form submit handler
function submitTransactionForm(e) {
  e.preventDefault();
  const id   = document.getElementById('transaction-edit-id').value;
  const data = {
    type:        document.getElementById('t-type').value,
    date:        document.getElementById('t-date').value,
    description: document.getElementById('t-description').value.trim(),
    amount:      parseFloat(document.getElementById('t-amount').value),
    category:    document.getElementById('t-category').value,
    notes:       document.getElementById('t-notes').value.trim(),
  };
  if (!data.description || isNaN(data.amount) || data.amount <= 0) {
    toast('Please fill in all required fields correctly.', 'error');
    return;
  }
  if (id) editTransaction(id, data);
  else    addTransaction(data);

  closeModal('modal-transaction');
  renderTransactionsTable();
  populateCategoryFilter();
}

// ──────────────────────────────────────
// 8. BUDGET
// ──────────────────────────────────────

function renderBudget() {
  const currM = getCurrentMonth();
  let totalBudgeted = 0, totalSpent = 0;

  state.budgets.forEach(b => {
    totalBudgeted += b.amount;
    totalSpent    += getSpentForCategory(b.category, currM);
  });

  const remaining = totalBudgeted - totalSpent;
  setText('budget-total-budgeted', formatCurrency(totalBudgeted));
  setText('budget-total-spent',    formatCurrency(totalSpent));
  setText('budget-remaining',      formatCurrency(remaining));
  const statusEl = document.getElementById('budget-status');
  if (statusEl) {
    if (state.budgets.length === 0) { statusEl.textContent = '—'; statusEl.className = 'budget-summary-value'; }
    else if (totalSpent <= totalBudgeted * 0.7) { statusEl.textContent = '✓ On Track'; statusEl.className = 'budget-summary-value text-green'; }
    else if (totalSpent <= totalBudgeted)       { statusEl.textContent = '⚠ Watch Out'; statusEl.className = 'budget-summary-value text-amber'; }
    else                                         { statusEl.textContent = '✗ Over Budget'; statusEl.className = 'budget-summary-value text-red'; }
  }

  const container = document.getElementById('budget-cards-container');
  if (!container) return;

  if (state.budgets.length === 0) {
    container.innerHTML = `<div class="empty-state-container">
      <div class="empty-state">
        <i data-lucide="wallet" class="empty-icon"></i>
        <p class="empty-title">No budgets set</p>
        <p class="empty-desc">Create spending limits for your categories</p>
        <button class="btn btn-primary" onclick="openAddBudgetModal()"><i data-lucide="plus"></i> Add Budget</button>
      </div></div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  container.innerHTML = state.budgets.map(b => {
    const spent   = getSpentForCategory(b.category, currM);
    const pct     = b.amount > 0 ? Math.min(100, (spent / b.amount) * 100) : 0;
    const cls     = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : '';
    return `
    <div class="budget-card">
      <div class="budget-card-header">
        <span class="budget-category-name">${escHtml(b.category)}</span>
        <div class="action-btns">
          <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditBudgetModal('${b.id}')" title="Edit">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="confirmDelete('budget','${b.id}','${escForOnclick(b.category)} budget',deleteBudget)" title="Delete">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      <div class="budget-amounts">
        <span class="budget-spent ${cls ? 'text-' + (cls === 'danger' ? 'red' : 'amber') : 'text-green'}">${formatCurrency(spent)} spent</span>
        <span class="budget-limit">of ${formatCurrency(b.amount)}</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill ${cls}" style="width:${pct}%"></div>
      </div>
      <p class="budget-percent ${cls}">${pct.toFixed(0)}%${pct > 100 ? ' — OVER BUDGET' : pct >= 90 ? ' — Nearly full' : ''}</p>
    </div>`;
  }).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getSpentForCategory(category, monthStr) {
  return state.transactions
    .filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(monthStr))
    .reduce((s, t) => s + t.amount, 0);
}

function addBudget(data) {
  const existing = state.budgets.find(b => b.category === data.category);
  if (existing) { toast('A budget for that category already exists. Edit it instead.', 'warning'); return false; }
  state.budgets.push({ id: generateId(), ...data });
  saveState();
  toast('Budget added!', 'success');
  return true;
}

function editBudget(id, data) {
  const idx = state.budgets.findIndex(b => b.id === id);
  if (idx === -1) return;
  state.budgets[idx] = { id, ...data };
  saveState();
  toast('Budget updated!', 'success');
}

function deleteBudget(id) {
  state.budgets = state.budgets.filter(b => b.id !== id);
  saveState();
  renderBudget();
  toast('Budget deleted.', 'info');
}

function submitBudgetForm(e) {
  e.preventDefault();
  const id   = document.getElementById('budget-edit-id').value;
  const data = {
    category: document.getElementById('b-category').value,
    amount:   parseFloat(document.getElementById('b-amount').value),
  };
  if (isNaN(data.amount) || data.amount <= 0) { toast('Please enter a valid budget amount.', 'error'); return; }
  if (id) { editBudget(id, data); closeModal('modal-budget'); renderBudget(); }
  else    { if (addBudget(data)) { closeModal('modal-budget'); renderBudget(); } }
}

// ──────────────────────────────────────
// 9. SAVINGS GOALS
// ──────────────────────────────────────

function renderSavingsGoals() {
  const container = document.getElementById('savings-goals-container');
  if (!container) return;

  if (state.savingsGoals.length === 0) {
    container.innerHTML = `<div class="empty-state-container">
      <div class="empty-state">
        <i data-lucide="piggy-bank" class="empty-icon"></i>
        <p class="empty-title">No savings goals yet</p>
        <p class="empty-desc">Set a financial target to start saving with purpose</p>
        <button class="btn btn-primary" onclick="openAddGoalModal()"><i data-lucide="plus"></i> Add Goal</button>
      </div></div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  container.innerHTML = state.savingsGoals.map(g => {
    const pct      = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
    const remaining = Math.max(0, g.target - g.current);
    const dateStr  = g.targetDate ? 'Target: ' + formatDate(g.targetDate) : '';
    return `
    <div class="goal-card" style="--goal-color:${g.color}">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${g.color};border-radius:var(--radius) var(--radius) 0 0"></div>
      <div class="goal-card-header">
        <div>
          <p class="goal-name">${escHtml(g.name)}</p>
          ${dateStr ? `<p class="goal-date">${dateStr}</p>` : ''}
        </div>
        <div class="action-btns">
          <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditGoalModal('${g.id}')" title="Edit">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="confirmDelete('goal','${g.id}','${escForOnclick(g.name)}',deleteSavingsGoal)" title="Delete">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      <div class="goal-amounts">
        <span class="goal-current" style="color:${g.color}">${formatCurrency(g.current)}</span>
        <span class="goal-target">/ ${formatCurrency(g.target)}</span>
      </div>
      <div class="goal-progress-track">
        <div class="goal-progress-fill" style="width:${pct}%;background:${g.color}"></div>
      </div>
      <p class="goal-percent" style="color:${g.color}">${pct.toFixed(1)}% complete · ${formatCurrency(remaining)} to go</p>
      <div class="goal-add-funds">
        <input type="number" class="goal-add-input" id="goal-add-${g.id}" placeholder="Add funds…" min="0.01" step="0.01">
        <button class="btn btn-primary btn-sm" onclick="addFundsToGoal('${g.id}')">Add</button>
      </div>
    </div>`;
  }).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addSavingsGoal(data) {
  state.savingsGoals.push({ id: generateId(), ...data });
  saveState();
  toast('Savings goal created!', 'success');
}

function editSavingsGoal(id, data) {
  const idx = state.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1) return;
  state.savingsGoals[idx] = { id, ...data };
  saveState();
  toast('Savings goal updated!', 'success');
}

function deleteSavingsGoal(id) {
  state.savingsGoals = state.savingsGoals.filter(g => g.id !== id);
  saveState();
  renderSavingsGoals();
  toast('Savings goal deleted.', 'info');
}

function addFundsToGoal(id) {
  const input  = document.getElementById('goal-add-' + id);
  const amount = parseFloat(input?.value);
  if (isNaN(amount) || amount <= 0) { toast('Enter a valid amount to add.', 'warning'); return; }
  const goal = state.savingsGoals.find(g => g.id === id);
  if (!goal) return;
  goal.current = Math.min(goal.target, goal.current + amount);
  saveState();
  toast(`${formatCurrency(amount)} added to "${goal.name}"!`, 'success');
  renderSavingsGoals();
}

function submitGoalForm(e) {
  e.preventDefault();
  const id   = document.getElementById('goal-edit-id').value;
  const data = {
    name:       document.getElementById('g-name').value.trim(),
    target:     parseFloat(document.getElementById('g-target').value),
    current:    parseFloat(document.getElementById('g-current').value) || 0,
    targetDate: document.getElementById('g-date').value,
    color:      document.getElementById('g-color').value,
  };
  if (!data.name || isNaN(data.target) || data.target <= 0) { toast('Please fill in all required fields.', 'error'); return; }
  if (id) editSavingsGoal(id, data);
  else    addSavingsGoal(data);
  closeModal('modal-goal');
  renderSavingsGoals();
}

// ──────────────────────────────────────
// 10. INVESTMENTS
// ──────────────────────────────────────

function renderInvestments() {
  const totalValue = state.investments.reduce((s, i) => s + i.units * i.currentPrice, 0);
  const totalCost  = state.investments.reduce((s, i) => s + i.units * i.buyPrice,     0);
  const gainLoss   = totalValue - totalCost;
  const gainPct    = totalCost > 0 ? (gainLoss / totalCost * 100) : 0;

  setText('portfolio-total-value',   formatCurrency(totalValue));
  setText('portfolio-total-cost',    formatCurrency(totalCost));
  const glEl = document.getElementById('portfolio-gain-loss');
  const gpEl = document.getElementById('portfolio-gain-percent');
  if (glEl) { glEl.textContent = (gainLoss >= 0 ? '+' : '') + formatCurrency(gainLoss); glEl.className = 'portfolio-value ' + (gainLoss >= 0 ? 'text-green' : 'text-red'); }
  if (gpEl) { gpEl.textContent = (gainPct >= 0 ? '+' : '') + gainPct.toFixed(2) + '%';  gpEl.className = 'portfolio-value ' + (gainPct >= 0 ? 'text-green' : 'text-red'); }

  const tbody = document.getElementById('investments-body');
  if (!tbody) return;

  if (state.investments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">
      <div class="empty-state">
        <i data-lucide="trending-up" class="empty-icon"></i>
        <p class="empty-title">No investments tracked</p>
        <p class="empty-desc">Add holdings to monitor portfolio performance</p>
        <button class="btn btn-primary" onclick="openAddInvestmentModal()"><i data-lucide="plus"></i> Add Investment</button>
      </div></td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  tbody.innerHTML = state.investments.map(inv => {
    const value   = inv.units * inv.currentPrice;
    const gl      = (inv.currentPrice - inv.buyPrice) * inv.units;
    const glPct   = inv.buyPrice > 0 ? ((inv.currentPrice - inv.buyPrice) / inv.buyPrice * 100) : 0;
    const alloc   = totalValue > 0 ? (value / totalValue * 100) : 0;
    return `<tr>
      <td class="fw-600">${escHtml(inv.name)}</td>
      <td><span class="badge badge-neutral">${inv.type}</span></td>
      <td>${inv.units.toLocaleString()}</td>
      <td>${formatCurrency(inv.buyPrice)}</td>
      <td>${formatCurrency(inv.currentPrice)}</td>
      <td class="fw-600">${formatCurrency(value)}</td>
      <td class="${gl >= 0 ? 'amount-positive' : 'amount-negative'}">
        ${gl >= 0 ? '+' : ''}${formatCurrency(gl)}<br>
        <small style="opacity:.7">(${glPct >= 0 ? '+' : ''}${glPct.toFixed(1)}%)</small>
      </td>
      <td>
        <div class="progress-bar-track" style="width:80px">
          <div class="progress-bar-fill" style="width:${alloc}%"></div>
        </div>
        <small>${alloc.toFixed(1)}%</small>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditInvestmentModal('${inv.id}')" title="Edit">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="confirmDelete('investment','${inv.id}','${escForOnclick(inv.name)}',deleteInvestment)" title="Delete">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addInvestment(data) {
  state.investments.push({ id: generateId(), ...data });
  saveState();
  toast('Investment added!', 'success');
}

function editInvestment(id, data) {
  const idx = state.investments.findIndex(i => i.id === id);
  if (idx === -1) return;
  state.investments[idx] = { id, ...data };
  saveState();
  toast('Investment updated!', 'success');
}

function deleteInvestment(id) {
  state.investments = state.investments.filter(i => i.id !== id);
  saveState();
  renderInvestments();
  toast('Investment deleted.', 'info');
}

function submitInvestmentForm(e) {
  e.preventDefault();
  const id   = document.getElementById('investment-edit-id').value;
  const data = {
    name:         document.getElementById('inv-name').value.trim(),
    type:         document.getElementById('inv-type').value,
    units:        parseFloat(document.getElementById('inv-units').value),
    buyPrice:     parseFloat(document.getElementById('inv-buy-price').value),
    currentPrice: parseFloat(document.getElementById('inv-current-price').value),
  };
  if (!data.name || isNaN(data.units) || isNaN(data.buyPrice) || isNaN(data.currentPrice)) {
    toast('Please fill in all fields correctly.', 'error'); return;
  }
  if (id) editInvestment(id, data);
  else    addInvestment(data);
  closeModal('modal-investment');
  renderInvestments();
}

// ──────────────────────────────────────
// 11. SUBSCRIPTIONS
// ──────────────────────────────────────

function getMonthlyCost(sub) {
  switch (sub.billingCycle) {
    case 'monthly':    return sub.cost;
    case 'annual':     return sub.cost / 12;
    case 'quarterly':  return sub.cost / 3;
    case 'weekly':     return sub.cost * 52 / 12;
    default:           return sub.cost;
  }
}

function renderSubscriptions() {
  const monthly = state.subscriptions.reduce((s, sub) => s + getMonthlyCost(sub), 0);
  const annual  = monthly * 12;

  setText('sub-monthly-total', formatCurrency(monthly));
  setText('sub-annual-total',  formatCurrency(annual));
  setText('sub-active-count',  state.subscriptions.length.toString());

  const container = document.getElementById('subscriptions-container');
  if (!container) return;

  if (state.subscriptions.length === 0) {
    container.innerHTML = `<div class="empty-state-container">
      <div class="empty-state">
        <i data-lucide="repeat" class="empty-icon"></i>
        <p class="empty-title">No subscriptions tracked</p>
        <p class="empty-desc">Add your recurring payments to see your monthly spend</p>
        <button class="btn btn-primary" onclick="openAddSubscriptionModal()"><i data-lucide="plus"></i> Add Subscription</button>
      </div></div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  container.innerHTML = state.subscriptions.map(sub => {
    const mCost     = getMonthlyCost(sub);
    const expensive = mCost > 20;
    const cycleLabel = { monthly: '/month', annual: '/year', quarterly: '/quarter', weekly: '/week' }[sub.billingCycle] || '';
    return `
    <div class="sub-card ${expensive ? 'expensive' : ''}">
      <div class="sub-card-header">
        <div>
          <p class="sub-name">${escHtml(sub.name)}</p>
          <p class="sub-meta">${escHtml(sub.category)}</p>
        </div>
        <div>
          <p class="sub-cost">${formatCurrency(sub.cost)}</p>
          <p class="sub-cycle">${cycleLabel}</p>
        </div>
      </div>
      ${sub.renewalDate ? `<p class="sub-renewal">Renews: ${formatDate(sub.renewalDate)}</p>` : ''}
      ${expensive ? `<p class="sub-expensive-flag">⚠ High cost (${formatCurrency(mCost)}/mo)</p>` : ''}
      <div class="sub-actions">
        <button class="btn btn-secondary btn-sm" onclick="openEditSubscriptionModal('${sub.id}')">
          <i data-lucide="pencil"></i> Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('subscription','${sub.id}','${escForOnclick(sub.name)}',deleteSubscription)">
          <i data-lucide="trash-2"></i> Delete
        </button>
      </div>
    </div>`;
  }).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addSubscription(data) {
  state.subscriptions.push({ id: generateId(), ...data });
  saveState();
  toast('Subscription added!', 'success');
}

function editSubscription(id, data) {
  const idx = state.subscriptions.findIndex(s => s.id === id);
  if (idx === -1) return;
  state.subscriptions[idx] = { id, ...data };
  saveState();
  toast('Subscription updated!', 'success');
}

function deleteSubscription(id) {
  state.subscriptions = state.subscriptions.filter(s => s.id !== id);
  saveState();
  renderSubscriptions();
  toast('Subscription deleted.', 'info');
}

function submitSubscriptionForm(e) {
  e.preventDefault();
  const id   = document.getElementById('subscription-edit-id').value;
  const data = {
    name:         document.getElementById('sub-name').value.trim(),
    cost:         parseFloat(document.getElementById('sub-cost').value),
    billingCycle: document.getElementById('sub-cycle').value,
    renewalDate:  document.getElementById('sub-renewal').value,
    category:     document.getElementById('sub-category').value,
  };
  if (!data.name || isNaN(data.cost) || data.cost < 0) { toast('Please fill in all fields.', 'error'); return; }
  if (id) editSubscription(id, data);
  else    addSubscription(data);
  closeModal('modal-subscription');
  renderSubscriptions();
}

// ──────────────────────────────────────
// 12. TOOLS
// ──────────────────────────────────────

function calcCompoundInterest(principal, rate, years, n) {
  const r = rate / 100;
  const fv = principal * Math.pow(1 + r / n, n * years);
  return { futureValue: fv, totalInterest: fv - principal, totalReturn: ((fv - principal) / principal * 100) };
}

function calcSavingsGoalTime(goalAmount, monthly, rate) {
  if (monthly <= 0) return null;
  const r = (rate / 100) / 12;
  if (r === 0) {
    const months = Math.ceil(goalAmount / monthly);
    return { months, years: months / 12 };
  }
  // FV annuity formula: FV = P * ((1+r)^n - 1) / r — solve for n
  const n = Math.log(1 + (goalAmount * r) / monthly) / Math.log(1 + r);
  if (!isFinite(n) || n <= 0) return null;
  return { months: Math.ceil(n), years: Math.ceil(n) / 12 };
}

function calcDebtPayoff(balance, annualRate, monthlyPayment) {
  const r = (annualRate / 100) / 12;
  if (monthlyPayment <= balance * r && r > 0) return null; // payment too small
  let remaining = balance, totalPaid = 0, months = 0;
  while (remaining > 0.01 && months < 600) {
    const interest = remaining * r;
    remaining += interest;
    remaining  = Math.max(0, remaining - monthlyPayment);
    totalPaid += Math.min(monthlyPayment, remaining + monthlyPayment);
    months++;
  }
  const totalInterest = totalPaid - balance;
  return { months, totalInterest: Math.max(0, totalInterest), totalPaid };
}

function calcEmergencyFund(monthlyExpenses, months) {
  return { target: monthlyExpenses * months, daily: (monthlyExpenses * months) / (months * 30) };
}

function calcAndShowCompoundInterest(e) {
  e.preventDefault();
  const principal = parseFloat(document.getElementById('ci-principal').value);
  const rate      = parseFloat(document.getElementById('ci-rate').value);
  const years     = parseFloat(document.getElementById('ci-years').value);
  const n         = parseInt(document.getElementById('ci-compounds').value, 10);
  if (isNaN(principal) || isNaN(rate) || isNaN(years)) { toast('Please fill in all fields.', 'warning'); return; }
  const res = calcCompoundInterest(principal, rate, years, n);
  setText('ci-future-value',    formatCurrency(res.futureValue));
  setText('ci-total-interest',  formatCurrency(res.totalInterest));
  setText('ci-total-return',    res.totalReturn.toFixed(1) + '%');
  document.getElementById('result-compound-interest').style.display = 'block';
}

function calcAndShowSavingsGoal(e) {
  e.preventDefault();
  const goal    = parseFloat(document.getElementById('sg-goal').value);
  const monthly = parseFloat(document.getElementById('sg-monthly').value);
  const rate    = parseFloat(document.getElementById('sg-rate').value) || 0;
  if (isNaN(goal) || isNaN(monthly)) { toast('Please fill in all fields.', 'warning'); return; }
  const res = calcSavingsGoalTime(goal, monthly, rate);
  if (!res) { toast('Monthly savings too low to reach goal with this interest rate.', 'error'); return; }
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + res.months);
  setText('sg-months',      res.months.toString());
  setText('sg-years',       (res.months / 12).toFixed(1));
  setText('sg-target-date', targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
  document.getElementById('result-savings-goal-calc').style.display = 'block';
}

function calcAndShowDebtPayoff(e) {
  e.preventDefault();
  const balance  = parseFloat(document.getElementById('dp-balance').value);
  const rate     = parseFloat(document.getElementById('dp-rate').value);
  const payment  = parseFloat(document.getElementById('dp-payment').value);
  if (isNaN(balance) || isNaN(rate) || isNaN(payment)) { toast('Please fill in all fields.', 'warning'); return; }
  const res = calcDebtPayoff(balance, rate, payment);
  if (!res) { toast('Monthly payment is too low to cover interest. Increase the payment.', 'error'); return; }
  const yrs = Math.floor(res.months / 12), mths = res.months % 12;
  setText('dp-payoff-time',    (yrs > 0 ? yrs + 'y ' : '') + mths + 'm');
  setText('dp-total-interest', formatCurrency(res.totalInterest));
  setText('dp-total-paid',     formatCurrency(res.totalPaid));
  document.getElementById('result-debt-payoff').style.display = 'block';
}

function calcAndShowEmergencyFund(e) {
  e.preventDefault();
  const monthly = parseFloat(document.getElementById('ef-monthly').value);
  const months  = parseInt(document.getElementById('ef-months').value, 10);
  if (isNaN(monthly)) { toast('Please enter your monthly expenses.', 'warning'); return; }
  const res = calcEmergencyFund(monthly, months);
  setText('ef-target',   formatCurrency(res.target));
  setText('ef-coverage', formatCurrency(monthly) + '/month');
  setText('ef-daily',    formatCurrency(res.daily) + '/day');
  document.getElementById('result-emergency-fund').style.display = 'block';
}

// ──────────────────────────────────────
// 13. SETTINGS
// ──────────────────────────────────────

function renderSettings() {
  const { currency, theme } = state.settings;

  // Currency buttons
  ['GBP','USD','EUR'].forEach(c => {
    const btn = document.getElementById('currency-' + c.toLowerCase() + '-btn');
    if (btn) btn.classList.toggle('active', currency === c);
  });

  // Theme buttons
  const lightBtn = document.getElementById('theme-light-btn');
  const darkBtn  = document.getElementById('theme-dark-btn');
  if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');
  if (darkBtn)  darkBtn.classList.toggle('active',  theme === 'dark');
}

function applySettings() {
  const { currency, theme } = state.settings;
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeToggleButton(theme);
  renderSettings();
}

function setCurrency(code) {
  if (!CURRENCIES[code]) return;
  state.settings.currency = code;
  saveState();
  toast('Currency updated to ' + code + '.', 'success');
  renderSettings();
  // Re-render current section to update all currency displays
  showSection(currentSection);
}

function setTheme(theme) {
  state.settings.theme = theme;
  saveState();
  applySettings();
}

function toggleTheme() {
  setTheme(state.settings.theme === 'light' ? 'dark' : 'light');
}

function updateThemeToggleButton(theme) {
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  if (label) label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
}

function resetAllData() {
  confirmDeleteAction = () => {
    resetState();
    toast('All data has been reset.', 'info');
    closeModal('modal-confirm-delete');
    showSection('dashboard');
  };
  document.getElementById('confirm-delete-message').textContent =
    'Are you sure you want to reset ALL data? This will permanently delete all transactions, budgets, goals, investments, and subscriptions. This cannot be undone.';
  document.getElementById('btn-confirm-delete').textContent = 'Reset Everything';
  openModal('modal-confirm-delete');
}

// ──────────────────────────────────────
// 14. CHARTS
// ──────────────────────────────────────

const charts = {};

function destroyChart(key) {
  if (charts[key]) {
    charts[key].destroy();
    charts[key] = null;
  }
}

function getChartDefaults() {
  const isDark = state.settings.theme === 'dark';
  return {
    gridColor:  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    textColor:  isDark ? '#8b949e' : '#9aa5b4',
  };
}

function renderIncomeVsExpensesChart() {
  destroyChart('incomeExpenses');
  const canvas = document.getElementById('canvas-income-expenses');
  if (!canvas) return;

  const labels = [];
  const incomeData   = [];
  const expensesData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mStr = getMonthStr(d);
    labels.push(getMonthLabel(i));
    incomeData.push(sumTransactions(state.transactions, 'income',  mStr));
    expensesData.push(sumTransactions(state.transactions, 'expense', mStr));
  }

  const { gridColor, textColor } = getChartDefaults();

  charts.incomeExpenses = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: incomeData,   backgroundColor: 'rgba(16,185,129,.8)',  borderRadius: 4 },
        { label: 'Expenses', data: expensesData, backgroundColor: 'rgba(239,68,68,.75)',   borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => formatCurrency(v) } }
      }
    }
  });
}

function renderSpendingByCategoryChart() {
  destroyChart('spendingCategory');
  const canvas = document.getElementById('canvas-spending-category');
  if (!canvas) return;

  const currM = getCurrentMonth();
  const catMap = {};
  state.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currM))
    .forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });

  const labels = Object.keys(catMap);
  const data   = Object.values(catMap);

  if (labels.length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const { textColor } = getChartDefaults();

  charts.spendingCategory = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: CHART_COLORS.slice(0, labels.length), borderWidth: 2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 }, padding: 10, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.parsed)}` } }
      },
      cutout: '65%'
    }
  });
}

function renderSavingsGrowthChart() {
  destroyChart('savingsGrowth');
  const canvas = document.getElementById('canvas-savings-growth');
  if (!canvas) return;

  const labels = [];
  const data   = [];
  let cumulative = 0;

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mStr = getMonthStr(d);
    labels.push(getMonthLabel(i));
    const inc = sumTransactions(state.transactions, 'income',  mStr);
    const exp = sumTransactions(state.transactions, 'expense', mStr);
    cumulative += (inc - exp);
    data.push(parseFloat(cumulative.toFixed(2)));
  }

  const { gridColor, textColor } = getChartDefaults();

  charts.savingsGrowth = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Net Savings',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => formatCurrency(v) } }
      }
    }
  });
}

function renderInvestmentAllocationChart() {
  destroyChart('investmentAllocation');
  const canvas = document.getElementById('canvas-investment-allocation');
  if (!canvas) return;

  if (state.investments.length === 0) return;

  // Aggregate by type
  const typeMap = {};
  state.investments.forEach(inv => {
    const val = inv.units * inv.currentPrice;
    typeMap[inv.type] = (typeMap[inv.type] || 0) + val;
  });

  const labels = Object.keys(typeMap);
  const data   = Object.values(typeMap);
  const { textColor } = getChartDefaults();

  charts.investmentAllocation = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: CHART_COLORS.slice(0, labels.length), borderWidth: 2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 }, padding: 10, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.parsed)} (${(ctx.parsed / data.reduce((a,b)=>a+b,0)*100).toFixed(1)}%)` } }
      },
      cutout: '65%'
    }
  });
}

// ──────────────────────────────────────
// 15. MODALS
// ──────────────────────────────────────

function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.add('open');
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.remove('open');
}

// ---- Transaction Modal ----
function openAddTransactionModal() {
  document.getElementById('modal-transaction-title').textContent = 'Add Transaction';
  document.getElementById('btn-save-transaction').textContent = 'Save Transaction';
  document.getElementById('transaction-edit-id').value = '';
  document.getElementById('form-transaction').reset();
  document.getElementById('t-date').value = new Date().toISOString().split('T')[0];
  updateCategoryOptions();
  openModal('modal-transaction');
}

function openEditTransactionModal(id) {
  const t = state.transactions.find(t => t.id === id);
  if (!t) return;
  document.getElementById('modal-transaction-title').textContent = 'Edit Transaction';
  document.getElementById('btn-save-transaction').textContent = 'Update Transaction';
  document.getElementById('transaction-edit-id').value = id;
  document.getElementById('t-type').value        = t.type;
  document.getElementById('t-date').value        = t.date;
  document.getElementById('t-description').value = t.description;
  document.getElementById('t-amount').value      = t.amount;
  document.getElementById('t-notes').value       = t.notes || '';
  updateCategoryOptions();
  document.getElementById('t-category').value    = t.category;
  openModal('modal-transaction');
}

function updateCategoryOptions() {
  const type = document.getElementById('t-type')?.value;
  const cats = type === 'income' ? INCOME_CATEGORIES : CATEGORIES;
  const sel  = document.getElementById('t-category');
  if (!sel) return;
  sel.innerHTML = cats.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
}

// ---- Budget Modal ----
function openAddBudgetModal() {
  document.getElementById('modal-budget-title').textContent = 'Add Budget';
  document.getElementById('budget-edit-id').value = '';
  document.getElementById('form-budget').reset();
  populateBudgetCategorySelect();
  openModal('modal-budget');
}

function openEditBudgetModal(id) {
  const b = state.budgets.find(b => b.id === id);
  if (!b) return;
  document.getElementById('modal-budget-title').textContent = 'Edit Budget';
  document.getElementById('budget-edit-id').value = id;
  populateBudgetCategorySelect();
  document.getElementById('b-category').value = b.category;
  document.getElementById('b-amount').value   = b.amount;
  openModal('modal-budget');
}

function populateBudgetCategorySelect() {
  const sel = document.getElementById('b-category');
  if (!sel) return;
  const used = state.budgets.map(b => b.category);
  sel.innerHTML = CATEGORIES.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
}

// ---- Goal Modal ----
function openAddGoalModal() {
  document.getElementById('modal-goal-title').textContent = 'Add Savings Goal';
  document.getElementById('goal-edit-id').value = '';
  document.getElementById('form-goal').reset();
  document.getElementById('g-current').value = '0';
  openModal('modal-goal');
}

function openEditGoalModal(id) {
  const g = state.savingsGoals.find(g => g.id === id);
  if (!g) return;
  document.getElementById('modal-goal-title').textContent = 'Edit Savings Goal';
  document.getElementById('goal-edit-id').value  = id;
  document.getElementById('g-name').value        = g.name;
  document.getElementById('g-target').value      = g.target;
  document.getElementById('g-current').value     = g.current;
  document.getElementById('g-date').value        = g.targetDate || '';
  document.getElementById('g-color').value       = g.color || '#3b82f6';
  openModal('modal-goal');
}

// ---- Investment Modal ----
function openAddInvestmentModal() {
  document.getElementById('modal-investment-title').textContent = 'Add Investment';
  document.getElementById('investment-edit-id').value = '';
  document.getElementById('form-investment').reset();
  openModal('modal-investment');
}

function openEditInvestmentModal(id) {
  const inv = state.investments.find(i => i.id === id);
  if (!inv) return;
  document.getElementById('modal-investment-title').textContent = 'Edit Investment';
  document.getElementById('investment-edit-id').value  = id;
  document.getElementById('inv-name').value            = inv.name;
  document.getElementById('inv-type').value            = inv.type;
  document.getElementById('inv-units').value           = inv.units;
  document.getElementById('inv-buy-price').value       = inv.buyPrice;
  document.getElementById('inv-current-price').value   = inv.currentPrice;
  openModal('modal-investment');
}

// ---- Subscription Modal ----
function openAddSubscriptionModal() {
  document.getElementById('modal-subscription-title').textContent = 'Add Subscription';
  document.getElementById('subscription-edit-id').value = '';
  document.getElementById('form-subscription').reset();
  openModal('modal-subscription');
}

function openEditSubscriptionModal(id) {
  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) return;
  document.getElementById('modal-subscription-title').textContent = 'Edit Subscription';
  document.getElementById('subscription-edit-id').value = id;
  document.getElementById('sub-name').value    = sub.name;
  document.getElementById('sub-cost').value    = sub.cost;
  document.getElementById('sub-cycle').value   = sub.billingCycle;
  document.getElementById('sub-renewal').value = sub.renewalDate || '';
  document.getElementById('sub-category').value = sub.category || 'Other';
  openModal('modal-subscription');
}

// ---- Confirm Delete ----
let confirmDeleteAction = null;

function confirmDelete(type, id, name, deleteFn) {
  confirmDeleteAction = () => { deleteFn(id); closeModal('modal-confirm-delete'); };
  document.getElementById('confirm-delete-message').textContent =
    `Are you sure you want to delete "${name}"? This action cannot be undone.`;
  document.getElementById('btn-confirm-delete').textContent = 'Delete';
  openModal('modal-confirm-delete');
}

// ──────────────────────────────────────
// 16. TOAST NOTIFICATIONS
// ──────────────────────────────────────

function toast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'check-circle',
    error:   'x-circle',
    warning: 'alert-triangle',
    info:    'info',
  };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="toast-icon"><i data-lucide="${icons[type] || 'info'}"></i></span>
    <span class="toast-message">${escHtml(message)}</span>
    <button class="toast-close" onclick="this.closest('.toast').remove()"><i data-lucide="x"></i></button>
  `;

  container.appendChild(el);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ──────────────────────────────────────
// 17. UTILITIES
// ──────────────────────────────────────

function formatCurrency(amount) {
  const code = state.settings.currency || 'GBP';
  const sym  = CURRENCIES[code] || '£';
  const locale = code === 'GBP' ? 'en-GB' : code === 'EUR' ? 'de-DE' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return sym + Math.abs(amount).toFixed(2);
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getCurrentMonth() {
  return getMonthStr(new Date());
}

function getMonthStr(date) {
  const y = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${monthStr}`;
}

function getMonthLabel(monthsAgo) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString('en-GB', { month: 'short' });
}

function sumTransactions(txns, type, monthStr) {
  return txns
    .filter(t => t.type === type && t.date.startsWith(monthStr))
    .reduce((s, t) => s + t.amount, 0);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escape a string for safe use as a single-quoted JS string literal inside an HTML attribute.
// Must escape backslashes first, then single quotes, then HTML-special characters.
function escForOnclick(str) {
  return String(str)
    .replace(/\\/g, '\\\\')   // backslash → \\ (JS string literal)
    .replace(/'/g,  "\\'")    // single-quote → \' (JS string literal)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ──────────────────────────────────────
// 18. EVENT LISTENERS SETUP
// ──────────────────────────────────────

function setupEventListeners() {
  // Transactions page buttons
  const btnAddTx   = document.getElementById('btn-add-transaction');
  const btnExport  = document.getElementById('btn-export-csv');
  const btnDemoTx  = document.getElementById('btn-load-demo-transactions');
  if (btnAddTx)  btnAddTx.addEventListener('click',  openAddTransactionModal);
  if (btnExport) btnExport.addEventListener('click', exportCSV);
  if (btnDemoTx) btnDemoTx.addEventListener('click', loadDemoData);

  // Filters
  ['transaction-search','filter-type','filter-category','filter-date-start','filter-date-end'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderTransactionsTable);
  });
  ['filter-type','filter-category'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderTransactionsTable);
  });

  // Budget
  const btnAddBudget = document.getElementById('btn-add-budget');
  if (btnAddBudget) btnAddBudget.addEventListener('click', openAddBudgetModal);

  // Savings Goals
  const btnAddGoal = document.getElementById('btn-add-goal');
  if (btnAddGoal) btnAddGoal.addEventListener('click', openAddGoalModal);

  // Investments
  const btnAddInv = document.getElementById('btn-add-investment');
  if (btnAddInv) btnAddInv.addEventListener('click', openAddInvestmentModal);

  // Subscriptions
  const btnAddSub = document.getElementById('btn-add-subscription');
  if (btnAddSub) btnAddSub.addEventListener('click', openAddSubscriptionModal);

  // Settings
  const btnDemoSettings = document.getElementById('btn-load-demo-settings');
  const btnResetData    = document.getElementById('btn-reset-data');
  if (btnDemoSettings) btnDemoSettings.addEventListener('click', loadDemoData);
  if (btnResetData)    btnResetData.addEventListener('click',    resetAllData);

  // Confirm delete button
  const btnConfirm = document.getElementById('btn-confirm-delete');
  if (btnConfirm) btnConfirm.addEventListener('click', () => {
    if (confirmDeleteAction) confirmDeleteAction();
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Close modals on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    }
  });
}

// ──────────────────────────────────────
// 19. INITIALIZATION
// ──────────────────────────────────────

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  applySettings();
  setupNavigation();
  setupEventListeners();

  // Init Lucide icons for static HTML
  if (typeof lucide !== 'undefined') lucide.createIcons();

  showSection('dashboard');

  // Small delay so the loading animation shows briefly
  setTimeout(hideLoadingOverlay, 400);
});
