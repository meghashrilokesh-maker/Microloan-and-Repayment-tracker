/**
 * Business Assistant Knowledge Engine (Phase 4B: Business Intelligence & Smart Suggestions)
 *
 * Modular, rule-based reasoning engine that analyzes live AppContext financial data
 * (sales, expenses, loans, repayments, profile) to provide instant, factual business intelligence.
 *
 * Answers are strictly grounded in user's real recorded data, with factual week-over-week comparisons,
 * category breakdowns, net cash flow tracking, and data-driven suggestions.
 */

/**
 * Format currency safely in Indian numbering style (₹).
 * Always guards against NaN, null, and undefined.
 */
export function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to get date ranges (YYYY-MM-DD) for time periods in local time.
 * Supports: today, yesterday, this_week, last_week, this_month.
 */
export function getDateRangeForPeriod(period = 'this_week') {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dt}`;
  };

  if (period === 'today') {
    const todayStr = formatDate(now);
    return { startDate: todayStr, endDate: todayStr, label: 'today' };
  }

  if (period === 'yesterday') {
    const yest = new Date(year, month, date - 1);
    const yestStr = formatDate(yest);
    return { startDate: yestStr, endDate: yestStr, label: 'yesterday' };
  }

  if (period === 'this_week') {
    // Standard Monday-start week
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(year, month, date - diffToMonday);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { startDate: formatDate(monday), endDate: formatDate(sunday), label: 'this week' };
  }

  if (period === 'last_week') {
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(year, month, date - diffToMonday - 7);
    const lastSunday = new Date(lastMonday.getFullYear(), lastMonday.getMonth(), lastMonday.getDate() + 6);
    return { startDate: formatDate(lastMonday), endDate: formatDate(lastSunday), label: 'last week' };
  }

  if (period === 'this_month') {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { startDate: formatDate(firstDay), endDate: formatDate(lastDay), label: 'this month' };
  }

  return getDateRangeForPeriod('this_week');
}

/**
 * Detects time period from user query string.
 */
export function detectPeriod(query, defaultPeriod = 'this_week') {
  const clean = (query || '').toLowerCase();
  if (clean.includes('yesterday')) return 'yesterday';
  if (clean.includes('today')) return 'today';
  if (clean.includes('last week') || clean.includes('previous week')) return 'last_week';
  if (clean.includes('this week') || clean.includes('current week') || clean.includes('weekly') || clean.includes('my week')) return 'this_week';
  if (clean.includes('this month') || clean.includes('current month') || clean.includes('monthly')) return 'this_month';
  return defaultPeriod;
}

/**
 * Filter an array of records (sales or expenses) by inclusive YYYY-MM-DD date range.
 */
export function filterByDateRange(records = [], startDate, endDate) {
  return (records || []).filter((r) => {
    if (!r || !r.date) return false;
    const d = String(r.date).split('T')[0];
    return d >= startDate && d <= endDate;
  });
}

/**
 * Extract all loan repayments made within a date range across all loans.
 */
export function getRepaymentsInDateRange(loans = [], startDate, endDate) {
  const repayments = [];
  (loans || []).forEach((loan) => {
    (loan?.repayments || []).forEach((r) => {
      if (r && r.date) {
        const d = String(r.date).split('T')[0];
        if (d >= startDate && d <= endDate) {
          repayments.push({
            ...r,
            loanId: loan.id,
            loanName: loan.name,
            lender: loan.lender,
          });
        }
      }
    });
  });
  return repayments;
}

/**
 * Identify intent from user input string.
 * Order of checks ensures specific composite intents (like 'comparison' or 'biggest expense')
 * are captured before generic keywords ('sales' or 'expenses').
 */
export function detectIntent(query) {
  if (!query || typeof query !== 'string') return 'UNKNOWN';
  const clean = query.trim().toLowerCase();

  // 1. Week-over-week Comparison Intent (Part 7)
  if (
    clean.includes('compare this week') ||
    clean.includes('compare to last week') ||
    clean.includes('compare with last week') ||
    clean.includes('compared with last week') ||
    clean.includes('compared to last week') ||
    clean.includes('did i sell more this week') ||
    clean.includes('how am i doing compared') ||
    clean.includes('comparison with last week') ||
    clean.includes('versus last week') ||
    clean.includes('vs last week')
  ) {
    return 'WEEKLY_COMPARISON';
  }

  // 2. Biggest Expense Intent (Part 3)
  if (
    clean.includes('biggest expense') ||
    clean.includes('largest expense') ||
    clean.includes('where am i spending the most') ||
    clean.includes('where i spend the most') ||
    clean.includes('what expense costs me the most') ||
    clean.includes('spending the most') ||
    clean.includes('highest expense') ||
    clean.includes('most expensive')
  ) {
    return 'BIGGEST_EXPENSE';
  }

  // 3. Sales By Category / Best Seller Intent (Part 4)
  if (
    clean.includes('what am i selling the most') ||
    clean.includes('what do i sell the most') ||
    clean.includes('what did i sell the most') ||
    clean.includes('which product sells the most') ||
    clean.includes('sells the most') ||
    clean.includes('best-selling') ||
    clean.includes('best selling') ||
    clean.includes('top selling') ||
    clean.includes('where do most of my sales come from') ||
    clean.includes('highest sales category') ||
    clean.includes('top product')
  ) {
    return 'BEST_SELLER';
  }

  // 4. Expense Breakdown Intent (Part 5)
  if (
    clean.includes('expense breakdown') ||
    clean.includes('break down my expenses') ||
    clean.includes('breakdown of expenses') ||
    clean.includes('where does my money go') ||
    clean.includes('where my money goes') ||
    clean.includes('where is my money going') ||
    clean.includes('breakdown my expenses') ||
    clean.includes('split of expenses')
  ) {
    return 'EXPENSE_BREAKDOWN';
  }

  // 5. Business Summary / How is my business doing (Part 1)
  if (
    clean.includes('how is my business doing') ||
    clean.includes('how is business doing') ||
    clean.includes('how my business is doing') ||
    clean.includes('give me a business summary') ||
    clean.includes('business summary') ||
    clean.includes('weekly summary') ||
    clean.includes('show me my weekly summary') ||
    clean.includes('how was my week') ||
    clean.includes('how is my week') ||
    clean.includes('summary of this week') ||
    clean.includes('overall summary') ||
    clean.includes('monthly summary')
  ) {
    return 'BUSINESS_SUMMARY';
  }

  // 6. Net Cash Flow / Balance Intent (Part 6)
  if (
    clean.includes('net cash flow') ||
    clean.includes('cash flow') ||
    clean.includes('net cash') ||
    clean.includes('money left after expenses') ||
    clean.includes('money left') ||
    clean.includes('cash left') ||
    clean.includes('net balance') ||
    clean.includes('balance') ||
    clean.includes('how much left') ||
    clean.includes('after expenses') ||
    clean.includes('earn after')
  ) {
    return 'CASH_FLOW';
  }

  // 7. Next Loan Due Intent (Part 10)
  if (
    clean.includes('which loan') ||
    clean.includes('due next') ||
    clean.includes('next loan') ||
    clean.includes('next payment') ||
    clean.includes('next instalment') ||
    clean.includes('next installment') ||
    clean.includes('when is my loan') ||
    clean.includes('when is my next') ||
    clean.includes('loan payment due')
  ) {
    return 'NEXT_LOAN';
  }

  // 8. Loans Overview / Total Debt Intent (Part 10)
  if (
    clean.includes('how much do i owe') ||
    clean.includes('how much i owe') ||
    clean.includes('show my loans') ||
    clean.includes('all loans') ||
    clean.includes('loan remaining') ||
    clean.includes('total loan') ||
    clean.includes('total debt') ||
    clean.includes('remaining loan') ||
    clean.includes('my active loans') ||
    clean.includes('show loans')
  ) {
    return 'LOANS_OVERVIEW';
  }

  // 9. Profit & Business Improvement Ideas Intent (Part 8 & 9)
  if (
    clean.includes('suggestions to improve') ||
    clean.includes('improve my business') ||
    clean.includes('improve business') ||
    clean.includes('reduce my expenses') ||
    clean.includes('reduce expenses') ||
    clean.includes('what should i focus on') ||
    clean.includes('ideas to increase profit') ||
    clean.includes('profit ideas') ||
    clean.includes('increase profit') ||
    clean.includes('grow profit') ||
    clean.includes('grow business') ||
    clean.includes('business tips') ||
    clean.includes('tips for my business') ||
    clean.includes('more profit') ||
    clean.includes('boost sales') ||
    clean.includes('ideas to increase')
  ) {
    return 'PROFIT_IDEAS';
  }

  // 10. Sales Queries (Part 2 & Part 11)
  if (
    clean.includes('how much did i sell') ||
    clean.includes('sales this week') ||
    clean.includes('sales this month') ||
    clean.includes('sales today') ||
    clean.includes('today sales') ||
    clean.includes('sold today') ||
    clean.includes('made today') ||
    clean.includes('show my sales') ||
    clean.includes('today revenue') ||
    clean.includes('what are my sales') ||
    clean.includes('today earning') ||
    clean.includes('my sales')
  ) {
    return 'SALES';
  }

  // 11. Expense Queries (Part 2 & Part 11)
  if (
    clean.includes('show my expenses') ||
    clean.includes('how much did i spend') ||
    clean.includes('expenses this week') ||
    clean.includes('expenses this month') ||
    clean.includes('expenses today') ||
    clean.includes('today expenses') ||
    clean.includes('spent today') ||
    clean.includes('what are my expenses') ||
    clean.includes('my spending') ||
    clean.includes('today costs') ||
    clean.includes('my expenses')
  ) {
    return 'EXPENSES';
  }

  // 12. Conversational Greeting Intent
  if (
    clean === 'hi' ||
    clean === 'hello' ||
    clean === 'hey' ||
    clean === 'namaste' ||
    clean.startsWith('hi ') ||
    clean.startsWith('hello ') ||
    clean.startsWith('hey ') ||
    clean.includes('good morning') ||
    clean.includes('good afternoon') ||
    clean.includes('good evening')
  ) {
    return 'GREETING';
  }

  return 'UNKNOWN';
}

/**
 * 1. Business Summary (Part 1)
 * Calculates total sales, expenses, repayments, and net cash flow for specified period.
 */
export function generateBusinessSummary(context, query) {
  const period = detectPeriod(query, 'this_week');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  const filteredSales = filterByDateRange(context.sales || [], startDate, endDate);
  const filteredExpenses = filterByDateRange(context.expenses || [], startDate, endDate);
  const filteredRepayments = getRepaymentsInDateRange(context.loans || [], startDate, endDate);

  const salesTotal = filteredSales.reduce((acc, s) => acc + Number(s.amount || 0), 0);
  const expensesTotal = filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const repaymentsTotal = filteredRepayments.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const netCashFlow = salesTotal - expensesTotal - repaymentsTotal;

  // Empty data handling (Part 12)
  if (filteredSales.length === 0 && filteredExpenses.length === 0 && filteredRepayments.length === 0) {
    return (
      `You don't have any recorded transactions for ${label} yet.\n\n` +
      `💡 Tip: You can record sales and expenses anytime using voice or the Add Sale/Add Expense buttons.`
    );
  }

  const periodTitle = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    `Here's your ${periodTitle} Summary:\n\n` +
    `• Sales: ₹${formatCurrency(salesTotal)}\n` +
    `• Expenses: ₹${formatCurrency(expensesTotal)}\n` +
    `• Repayments: ₹${formatCurrency(repaymentsTotal)}\n` +
    `──────────────────────────\n` +
    `Net Cash Flow: ₹${formatCurrency(netCashFlow)}\n\n` +
    `You brought in ₹${formatCurrency(salesTotal)} and ₹${formatCurrency(netCashFlow)} remained after recorded expenses and repayments.`
  );
}

/**
 * 2. Sales Query (Part 2 & Part 11)
 * Supports today, yesterday, this week, this month.
 */
export function generateSalesAnswer(context, query) {
  const period = detectPeriod(query, 'today');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  const salesList = filterByDateRange(context.sales || [], startDate, endDate);
  const salesTotal = salesList.reduce((acc, s) => acc + Number(s.amount || 0), 0);

  if (salesList.length === 0 || salesTotal === 0) {
    return (
      `You haven't recorded any sales for ${label} yet (₹0).\n\n` +
      `💡 Tip: Tap 'Add Sale' on your dashboard or navigate to the Sales tab anytime to log cash and UPI customer purchases!`
    );
  }

  // Category breakdown
  const categoryCounts = {};
  salesList.forEach((s) => {
    const cat = s.category || 'General Sales';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + Number(s.amount || 0);
  });

  const categoryLines = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `• ${cat}: ₹${formatCurrency(amt)}`)
    .join('\n');

  const periodLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    `${periodLabel}'s total sales are ₹${formatCurrency(salesTotal)} across ${salesList.length} recorded transaction${salesList.length === 1 ? '' : 's'}.\n\n` +
    `Breakdown by category:\n${categoryLines}`
  );
}

/**
 * 3. Expense Query (Part 2 & Part 11)
 * Supports today, yesterday, this week, this month.
 */
export function generateExpensesAnswer(context, query) {
  const period = detectPeriod(query, 'today');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  const expensesList = filterByDateRange(context.expenses || [], startDate, endDate);
  const expensesTotal = expensesList.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  if (expensesList.length === 0 || expensesTotal === 0) {
    return (
      `No expenses have been recorded for ${label} yet (₹0).\n\n` +
      `💡 Tip: Tap 'Add Expense' on your dashboard to log wholesale stock purchases, transport fares, or daily stall maintenance.`
    );
  }

  // Category breakdown
  const categoryCounts = {};
  expensesList.forEach((e) => {
    const cat = e.category || 'Stock / Purchases';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + Number(e.amount || 0);
  });

  const categoryLines = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `• ${cat}: ₹${formatCurrency(amt)}`)
    .join('\n');

  const periodLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    `${periodLabel}'s total expenses are ₹${formatCurrency(expensesTotal)} across ${expensesList.length} entry${expensesList.length === 1 ? '' : 'ies'}.\n\n` +
    `Expense breakdown:\n${categoryLines}`
  );
}

/**
 * 4. Biggest Expense (Part 3)
 * Analyzes expense transactions by category and returns the category and amount.
 */
export function generateBiggestExpenseAnswer(context, query) {
  const period = detectPeriod(query, 'this_month');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  let filteredExpenses = filterByDateRange(context.expenses || [], startDate, endDate);
  let effectiveLabel = label;

  // Fallback to all recorded expenses if specified period has none
  if (filteredExpenses.length === 0) {
    filteredExpenses = context.expenses || [];
    effectiveLabel = 'in your recorded history';
  }

  if (filteredExpenses.length === 0) {
    return "You don't have any recorded expenses for this period yet.";
  }

  const categoryTotals = {};
  filteredExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length === 0) {
    return "You don't have any recorded expenses for this period yet.";
  }

  const [topCategory, topAmount] = sortedCategories[0];
  const timeDesc = effectiveLabel === 'in your recorded history' ? 'overall' : effectiveLabel;

  let extraNote = '';
  if (sortedCategories.length > 1) {
    const [secondCat, secondAmt] = sortedCategories[1];
    extraNote = `\nFollowed by ${secondCat} at ₹${formatCurrency(secondAmt)}.`;
  }

  return (
    `Your biggest expense category ${timeDesc} is ${topCategory} at ₹${formatCurrency(topAmount)}.${extraNote}`
  );
}

/**
 * 5. Best-Selling Category (Part 4)
 * Groups recorded sales by category and returns the highest sales amount.
 */
export function generateBestSellerAnswer(context, query) {
  const period = detectPeriod(query, 'this_month');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  let filteredSales = filterByDateRange(context.sales || [], startDate, endDate);
  let effectiveLabel = label;

  if (filteredSales.length === 0) {
    filteredSales = context.sales || [];
    effectiveLabel = 'in your recorded history';
  }

  if (filteredSales.length === 0) {
    return "You don't have any recorded sales for this period yet.";
  }

  const categoryTotals = {};
  filteredSales.forEach((s) => {
    const cat = s.category || 'Vegetables';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(s.amount || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length === 0) {
    return "You don't have any recorded sales for this period yet.";
  }

  const [topCategory, topAmount] = sortedCategories[0];
  const timeDesc = effectiveLabel === 'in your recorded history' ? 'overall' : effectiveLabel;

  return (
    `Your highest sales category ${timeDesc} is ${topCategory} with ₹${formatCurrency(topAmount)} in sales.`
  );
}

/**
 * 6. Expense Breakdown (Part 5)
 * Groups expenses by category and displays major categories.
 */
export function generateExpenseBreakdownAnswer(context, query) {
  const period = detectPeriod(query, 'this_month');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  let filteredExpenses = filterByDateRange(context.expenses || [], startDate, endDate);
  let effectiveLabel = label;

  if (filteredExpenses.length === 0) {
    filteredExpenses = context.expenses || [];
    effectiveLabel = 'overall';
  }

  if (filteredExpenses.length === 0) {
    return "You don't have any recorded expenses for this period yet.";
  }

  const categoryTotals = {};
  let totalAmount = 0;
  filteredExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    const amt = Number(e.amount || 0);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalAmount += amt;
  });

  const lines = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `• ${cat} — ₹${formatCurrency(amt)}`)
    .join('\n');

  return (
    `Your expenses ${effectiveLabel} (Total: ₹${formatCurrency(totalAmount)}):\n` +
    `${lines}`
  );
}

/**
 * 7. Net Cash Flow / Balance (Part 6)
 * Calculates sales - expenses - repayments and clarifies accounting profit distinction when appropriate.
 */
export function generateCashFlowAnswer(context, query) {
  const period = detectPeriod(query, 'this_week');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  const filteredSales = filterByDateRange(context.sales || [], startDate, endDate);
  const filteredExpenses = filterByDateRange(context.expenses || [], startDate, endDate);
  const filteredRepayments = getRepaymentsInDateRange(context.loans || [], startDate, endDate);

  const salesTotal = filteredSales.reduce((acc, s) => acc + Number(s.amount || 0), 0);
  const expensesTotal = filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const repaymentsTotal = filteredRepayments.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const netCashFlow = salesTotal - expensesTotal - repaymentsTotal;

  const isProfitQuery = (query || '').toLowerCase().includes('profit');
  let profitExplanation = '';
  if (isProfitQuery) {
    profitExplanation =
      `\n\nYour recorded net cash flow is ₹${formatCurrency(netCashFlow)}. ` +
      `This isn't the same as accounting profit because the app doesn't currently calculate all business costs such as inventory cost/COGS.`;
  }

  return (
    `Your net cash flow ${label} is ₹${formatCurrency(netCashFlow)} after recorded expenses (₹${formatCurrency(expensesTotal)}) ` +
    `and loan repayments (₹${formatCurrency(repaymentsTotal)}).` +
    `${profitExplanation}`
  );
}

/**
 * 8. Week-over-Week Comparison (Part 7)
 * Factual comparison of sales, expenses, and net cash flow without judgmental terms.
 */
export function generateWeeklyComparisonAnswer(context) {
  const thisWeekRange = getDateRangeForPeriod('this_week');
  const lastWeekRange = getDateRangeForPeriod('last_week');

  const thisSales = filterByDateRange(context.sales || [], thisWeekRange.startDate, thisWeekRange.endDate);
  const thisExpenses = filterByDateRange(context.expenses || [], thisWeekRange.startDate, thisWeekRange.endDate);
  const thisRepayments = getRepaymentsInDateRange(context.loans || [], thisWeekRange.startDate, thisWeekRange.endDate);

  const lastSales = filterByDateRange(context.sales || [], lastWeekRange.startDate, lastWeekRange.endDate);
  const lastExpenses = filterByDateRange(context.expenses || [], lastWeekRange.startDate, lastWeekRange.endDate);
  const lastRepayments = getRepaymentsInDateRange(context.loans || [], lastWeekRange.startDate, lastWeekRange.endDate);

  const thisSalesTotal = thisSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const thisExpTotal = thisExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const thisRepayTotal = thisRepayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const thisNet = thisSalesTotal - thisExpTotal - thisRepayTotal;

  const lastSalesTotal = lastSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const lastExpTotal = lastExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const lastRepayTotal = lastRepayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const lastNet = lastSalesTotal - lastExpTotal - lastRepayTotal;

  // Empty data handling (Part 12)
  const hasThisWeek = thisSales.length > 0 || thisExpenses.length > 0;
  const hasLastWeek = lastSales.length > 0 || lastExpenses.length > 0;

  if (!hasThisWeek && !hasLastWeek) {
    return "I don't have enough recorded data from last week and this week to make a comparison yet.";
  }

  if (!hasLastWeek) {
    return (
      `I don't have enough recorded data from last week to make a comparison yet.\n\n` +
      `This week:\n` +
      `• Sales: ₹${formatCurrency(thisSalesTotal)}\n` +
      `• Expenses: ₹${formatCurrency(thisExpTotal)}\n` +
      `• Net cash flow: ₹${formatCurrency(thisNet)}`
    );
  }

  const salesDiff = thisSalesTotal - lastSalesTotal;
  const expDiff = thisExpTotal - lastExpTotal;

  const salesCompText =
    salesDiff > 0
      ? `Sales were ₹${formatCurrency(salesDiff)} higher this week.`
      : salesDiff < 0
      ? `Sales were ₹${formatCurrency(Math.abs(salesDiff))} lower this week.`
      : `Sales were identical to last week.`;

  const expCompText =
    expDiff > 0
      ? `Expenses were ₹${formatCurrency(expDiff)} higher this week.`
      : expDiff < 0
      ? `Expenses were ₹${formatCurrency(Math.abs(expDiff))} lower this week.`
      : `Expenses were identical to last week.`;

  return (
    `This week:\n` +
    `Sales: ₹${formatCurrency(thisSalesTotal)}\n` +
    `Expenses: ₹${formatCurrency(thisExpTotal)}\n\n` +
    `Last week:\n` +
    `Sales: ₹${formatCurrency(lastSalesTotal)}\n` +
    `Expenses: ₹${formatCurrency(lastExpTotal)}\n\n` +
    `${salesCompText}\n` +
    `${expCompText}`
  );
}

/**
 * 9. Smart Suggestions (Part 8 & Part 9)
 * Grounded in real profile details (business type, name) and actual transaction data.
 * Formulated as non-prescriptive, practical suggestions ("Consider...", "You could try...").
 */
export function generateSmartSuggestions(context) {
  const profile = context.profile || {};
  const businessType = profile.businessType || 'retail stall';
  const businessName = profile.businessName || 'your business';

  // Analyze actual expenses
  const allExpenses = context.expenses || [];
  const categoryExpenseTotals = {};
  let totalExpenses = 0;
  allExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    const amt = Number(e.amount || 0);
    categoryExpenseTotals[cat] = (categoryExpenseTotals[cat] || 0) + amt;
    totalExpenses += amt;
  });

  // Analyze actual sales
  const allSales = context.sales || [];
  const categorySalesTotals = {};
  let totalSales = 0;
  allSales.forEach((s) => {
    const cat = s.category || 'Other';
    const amt = Number(s.amount || 0);
    categorySalesTotals[cat] = (categorySalesTotals[cat] || 0) + amt;
    totalSales += amt;
  });

  const suggestions = [];

  // Suggestion based on expense concentration
  const transportExpense = categoryExpenseTotals['Transport'] || 0;
  const stockExpense = categoryExpenseTotals['Stock / Purchases'] || 0;

  if (totalExpenses > 0 && transportExpense / totalExpenses > 0.15) {
    suggestions.push(
      `• Transport is one of your larger recorded expenses (₹${formatCurrency(transportExpense)}). ` +
      `You could look at combining supplier trips or planning purchases together to reduce travel costs.`
    );
  } else if (totalExpenses > 0 && stockExpense / totalExpenses > 0.4) {
    suggestions.push(
      `• Stock / Purchases account for a large share of your recorded expenses (₹${formatCurrency(stockExpense)}). ` +
      `Consider tracking which products sell fastest before increasing stock.`
    );
  } else {
    suggestions.push(
      `• For a ${businessType} trade, sourcing direct wholesale batches and negotiating weekly bulk rates may help manage procurement costs.`
    );
  }

  // Suggestion based on sales concentration
  const sortedSales = Object.entries(categorySalesTotals).sort((a, b) => b[1] - a[1]);
  if (sortedSales.length > 0 && totalSales > 0) {
    const [topCat, topAmt] = sortedSales[0];
    if (topAmt / totalSales > 0.5) {
      suggestions.push(
        `• Most of your recorded sales come from ${topCat} (₹${formatCurrency(topAmt)}). ` +
        `You could consider keeping popular ${topCat} items well stocked during peak customer hours.`
      );
    } else {
      suggestions.push(
        `• You have a balanced sales mix across categories. Consider small combo pairings to encourage repeat customer purchases.`
      );
    }
  } else {
    suggestions.push(
      `• Consider introducing quick-grab bundles during morning and evening rush hours to encourage higher average sales per customer.`
    );
  }

  // Suggestion based on cash flow / loans
  const activeLoans = context.activeLoans || (context.loans || []).filter((l) => l && l.status !== 'Completed');
  if (activeLoans.length > 0) {
    suggestions.push(
      `• You have active microloans. Maintaining consistent digital repayments helps build a strong credit history for future working capital subsidies.`
    );
  } else {
    suggestions.push(
      `• You have no active microloans. Consider setting aside a modest reserve from weekly net cash flow for upcoming seasonal stock demands.`
    );
  }

  return (
    `Here are practical suggestions for ${businessName}:\n\n` +
    suggestions.join('\n\n')
  );
}

/**
 * 10. Next Loan Due (Part 10)
 */
export function generateNextLoanAnswer(context) {
  const nextLoan = context.nextRepaymentLoan;

  if (!nextLoan) {
    return (
      "You currently have no upcoming microloan payments due.\n\n" +
      "All your loans are either completed or you haven't recorded any active loans yet. Great job keeping your accounts clear!"
    );
  }

  const lenderName = nextLoan.lender || 'Local Bank / Lender';
  const loanName = nextLoan.name || 'Microloan';
  const dueDate = nextLoan.nextDueDate || 'Pending schedule';
  const installment = formatCurrency(nextLoan.repaymentAmount || 0);
  const remaining = formatCurrency(nextLoan.remainingAmount || 0);
  const frequency = nextLoan.frequency || 'Daily';
  const status = nextLoan.status || 'On Track';

  return (
    `Your next upcoming repayment is for ${loanName} (${lenderName}):\n\n` +
    `• Due Date: ${dueDate}\n` +
    `• Instalment Due: ₹${installment} (${frequency})\n` +
    `• Remaining Loan Balance: ₹${remaining}\n` +
    `• Loan Status: ${status}\n\n` +
    `💡 You can open the Loans tab to log your repayment when paid.`
  );
}

/**
 * 11. Loans Overview / Total Debt (Part 10)
 */
export function generateLoansOverviewAnswer(context) {
  const activeLoans = context.activeLoans || (context.loans || []).filter((l) => l && l.status !== 'Completed');
  const totalRemaining = Number(context.totalLoanRemaining || 0);

  if (activeLoans.length === 0 || totalRemaining === 0) {
    return (
      "You currently have no outstanding loan balance (₹0 owed).\n\n" +
      "You have completed all scheduled loan repayments, or have not added any active loans."
    );
  }

  const loanItems = activeLoans
    .map((l) => {
      const remaining = formatCurrency(l.remainingAmount || 0);
      const original = formatCurrency(l.originalAmount || 0);
      const nextDue = l.nextDueDate ? ` (Next due: ${l.nextDueDate})` : '';
      return `• ${l.name}: ₹${remaining} remaining of ₹${original}${nextDue}`;
    })
    .join('\n');

  return (
    `You have ${activeLoans.length} active loan${activeLoans.length === 1 ? '' : 's'} with a total remaining balance of ₹${formatCurrency(totalRemaining)}.\n\n` +
    `Active Loan Details:\n${loanItems}`
  );
}

/**
 * 12. Friendly Greeting
 */
export function generateGreeting(context) {
  const profile = context.profile || {};
  const name = (profile.ownerName || 'Vendor').split(' ')[0];
  const shop = profile.businessName || 'your business';

  return (
    `Hello, ${name}! Welcome to your Business Assistant for ${shop}.\n\n` +
    `I can give you live updates on:\n` +
    `• Weekly & monthly business summaries\n` +
    `• Sales & expense breakdowns\n` +
    `• Biggest expenses & best-selling categories\n` +
    `• Net cash flow & week-over-week comparisons\n` +
    `• Practical suggestions to improve operations\n\n` +
    `What would you like to check?`
  );
}

/**
 * Fallback response for unhandled queries
 */
export function generateFallback() {
  return (
    `I can help with your sales, expenses, cash flow, loans, and business analysis.\n\n` +
    `You can try asking:\n` +
    `• "How is my business doing this week?"\n` +
    `• "What was my biggest expense?"\n` +
    `• "What am I selling the most?"\n` +
    `• "Show my expense breakdown"\n` +
    `• "Compare this week with last week"\n` +
    `• "What is my net cash flow?"\n` +
    `• "Give me suggestions to improve my business"`
  );
}

/**
 * Main query processor: takes user text and AppContext snapshot,
 * detects intent, and produces the corresponding factual response (Phase 4B).
 */
export async function processBusinessQuery(query, context = {}) {
  const intent = detectIntent(query);

  let replyText = '';

  switch (intent) {
    case 'WEEKLY_COMPARISON':
      replyText = generateWeeklyComparisonAnswer(context);
      break;

    case 'BUSINESS_SUMMARY':
      replyText = generateBusinessSummary(context, query);
      break;

    case 'BIGGEST_EXPENSE':
      replyText = generateBiggestExpenseAnswer(context, query);
      break;

    case 'BEST_SELLER':
      replyText = generateBestSellerAnswer(context, query);
      break;

    case 'EXPENSE_BREAKDOWN':
      replyText = generateExpenseBreakdownAnswer(context, query);
      break;

    case 'CASH_FLOW':
      replyText = generateCashFlowAnswer(context, query);
      break;

    case 'PROFIT_IDEAS':
      replyText = generateSmartSuggestions(context);
      break;

    case 'SALES':
      replyText = generateSalesAnswer(context, query);
      break;

    case 'EXPENSES':
      replyText = generateExpensesAnswer(context, query);
      break;

    case 'NEXT_LOAN':
      replyText = generateNextLoanAnswer(context);
      break;

    case 'LOANS_OVERVIEW':
      replyText = generateLoansOverviewAnswer(context);
      break;

    case 'GREETING':
      replyText = generateGreeting(context);
      break;

    case 'UNKNOWN':
    default:
      replyText = generateFallback();
      break;
  }

  return {
    success: true,
    query,
    intent,
    reply: replyText,
  };
}

export default processBusinessQuery;
