/**
 * Business Assistant Knowledge Engine (Phase 5: Advanced Business Intelligence & Category Analysis)
 *
 * Modular, rule-based reasoning engine that analyzes live AppContext financial data
 * (sales, expenses, loans, repayments, profile) to provide instant, factual business intelligence.
 *
 * Phase 5 Capabilities:
 * - Category-specific sales questions (e.g. "How much did I earn from vegetables this month?")
 * - Category-specific expense questions (e.g. "How much did I spend on transport?")
 * - Detailed loan questions (distinguishing borrowed, repaid, remaining, and next due date)
 * - Month-over-month comparisons (sales, expenses, net cash flow)
 * - Flexible natural language variations
 * - Grounded strictly in real app data without guessing or double-counting.
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
 * Supports: today, yesterday, this_week, last_week, this_month, last_month, all_time.
 */
export function getDateRangeForPeriod(period = 'this_month') {
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

  if (period === 'last_month') {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return { startDate: formatDate(firstDay), endDate: formatDate(lastDay), label: 'last month' };
  }

  if (period === 'all_time') {
    return { startDate: '1970-01-01', endDate: '2099-12-31', label: 'overall' };
  }

  return getDateRangeForPeriod('this_month');
}

/**
 * Detects time period from user query string. Returns null if no period was mentioned.
 */
export function detectPeriod(query, defaultPeriod = null) {
  const clean = (query || '').toLowerCase();
  if (clean.includes('yesterday')) return 'yesterday';
  if (clean.includes('today')) return 'today';
  if (clean.includes('last week') || clean.includes('previous week')) return 'last_week';
  if (clean.includes('this week') || clean.includes('current week') || clean.includes('weekly') || clean.includes('my week')) return 'this_week';
  if (clean.includes('last month') || clean.includes('previous month')) return 'last_month';
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
 * Identifies specific sales category from query keywords.
 */
export function detectSaleCategory(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.toLowerCase();

  if (/\b(vegetable|vegetables|veggie|veggies|sabzi|subzi|tomato|tomatoes|potato|potatoes|onion|onions)\b/i.test(clean)) {
    return 'Vegetables';
  }
  if (/\b(fruit|fruits|apple|apples|banana|bananas|mango|mangoes|orange|oranges|papaya)\b/i.test(clean)) {
    return 'Fruits';
  }
  if (/\b(street food|chaat|chat|dosa|idli|samosa|samosas|panipuri|pani puri|snacks|fast food)\b/i.test(clean)) {
    return 'Street Food';
  }
  if (/\b(grocery|groceries|kirana|provisions?|rice|dal|oil|atta|flour|spices|sugar|milk)\b/i.test(clean)) {
    return 'Grocery';
  }
  if (/\b(cloth|cloths|clothes|clothing|garment|garments|saree|sarees|shirt|shirts|pants)\b/i.test(clean)) {
    return 'Clothing';
  }
  if (/\b(food)\b/i.test(clean) && !clean.includes('food & tea') && !clean.includes('food and tea')) {
    return 'Street Food';
  }
  return null;
}

/**
 * Identifies specific expense category from query keywords.
 */
export function detectExpenseCategory(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.toLowerCase();

  if (/\b(transport|transportation|auto|tempo|cargo|bus|petrol|diesel|fuel|fare|cab|taxi)\b/i.test(clean)) {
    return 'Transport';
  }
  if (/\b(shop rent|stall rent|room rent|store rent|rent)\b/i.test(clean)) {
    return 'Shop Rent';
  }
  if (/\b(electric|electricity|bills?|power|current|battery|recharge|light bill|water bill)\b/i.test(clean)) {
    return 'Electricity / Bills';
  }
  if (/\b(tea|chai|coffee|bun|biscuits?|food & tea|food and tea)\b/i.test(clean)) {
    return 'Food & Tea';
  }
  if (/\b(stock|purchases?|wholesale|inventory|raw materials?|goods)\b/i.test(clean)) {
    return 'Stock / Purchases';
  }
  return null;
}

/**
 * Identify intent from user input string (Phase 5).
 * Order of checks ensures specific composite intents (like category sales or monthly comparison)
 * are captured before generic keywords.
 */
export function detectIntent(query) {
  if (!query || typeof query !== 'string') return 'UNKNOWN';
  const clean = query.trim().toLowerCase();

  // 1. Month-over-month Comparison Intent (Phase 5 D)
  if (
    clean.includes('compare this month') ||
    clean.includes('compare to last month') ||
    clean.includes('compare with last month') ||
    clean.includes('compared with last month') ||
    clean.includes('compared to last month') ||
    clean.includes('did my sales increase this month') ||
    clean.includes('did sales increase this month') ||
    clean.includes('did my expenses increase this month') ||
    clean.includes('did expenses increase this month') ||
    clean.includes('monthly comparison') ||
    clean.includes('comparison with last month') ||
    clean.includes('sales increase this month') ||
    clean.includes('expenses increase this month') ||
    (clean.includes('compare') && clean.includes('month')) ||
    clean.includes('versus last month') ||
    clean.includes('vs last month')
  ) {
    return 'MONTHLY_COMPARISON';
  }

  // 2. Week-over-week Comparison Intent (Phase 4B Part 7)
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

  // 3. Category-specific Sales Intent (Phase 5 A)
  // e.g. "How much did I earn from vegetables this month?", "How much did I sell in fruits this week?", "What are my sales for vegetables?"
  const saleCat = detectSaleCategory(clean);
  const isSaleQuery =
    saleCat &&
    (clean.includes('earn') ||
      clean.includes('selling') ||
      clean.includes('sold') ||
      clean.includes('sale') ||
      clean.includes('sales') ||
      clean.includes('make') ||
      clean.includes('made') ||
      clean.includes('sell') ||
      clean.includes('revenue') ||
      clean.includes('how much'));

  if (isSaleQuery) {
    return 'CATEGORY_SALES';
  }

  // 4. Category-specific Expense Intent (Phase 5 B)
  // e.g. "How much did I spend on transport?", "What did I spend on rent?", "How much did electricity cost me this month?"
  const expCat = detectExpenseCategory(clean);
  const isExpQuery =
    expCat &&
    (clean.includes('spend') ||
      clean.includes('spent') ||
      clean.includes('cost') ||
      clean.includes('costs') ||
      clean.includes('paid') ||
      clean.includes('pay') ||
      clean.includes('expense') ||
      clean.includes('expenses') ||
      clean.includes('how much') ||
      clean.includes('what did') ||
      clean.includes('what was'));

  if (isExpQuery) {
    return 'CATEGORY_EXPENSES';
  }

  // 5. Loan Repayment Progress Intent (Phase 5 C)
  // e.g. "How much have I repaid?", "How much repayment have I made?", "Total repaid"
  if (
    clean.includes('how much have i repaid') ||
    clean.includes('how much i have repaid') ||
    clean.includes('how much i repaid') ||
    clean.includes('how much did i repay') ||
    clean.includes('how much repaid') ||
    clean.includes('repayment progress') ||
    clean.includes('total repaid') ||
    clean.includes('how much have we repaid') ||
    clean.includes('how much loan have i repaid') ||
    clean.includes('how much loan did i repay') ||
    clean.includes('how much repayment') ||
    (clean.includes('how much') && clean.includes('repaid')) ||
    (clean.includes('how much') && clean.includes('repay'))
  ) {
    return 'LOAN_REPAID';
  }

  // 6. Next Loan Due / Next Repayment Intent (Phase 5 C)
  // e.g. "Which loan is due next?", "What is my next repayment?", "How much is my repayment?"
  if (
    clean.includes('which loan') ||
    clean.includes('due next') ||
    clean.includes('next loan') ||
    clean.includes('next payment') ||
    clean.includes('next repayment') ||
    clean.includes('how much is my repayment') ||
    clean.includes('what is my repayment') ||
    clean.includes('next instalment') ||
    clean.includes('next installment') ||
    clean.includes('when is my loan') ||
    clean.includes('when is my next') ||
    clean.includes('loan payment due') ||
    clean.includes('loan due date') ||
    clean.includes('next due') ||
    clean.includes('upcoming repayment') ||
    clean.includes('upcoming loan')
  ) {
    return 'NEXT_LOAN';
  }

  // 7. Loans Overview / Total Debt Intent (Phase 5 C)
  // e.g. "How much do I owe?", "How much loan do I have left?", "Tell me about my active loans.", "How much do I still owe?"
  if (
    clean.includes('how much do i owe') ||
    clean.includes('how much i owe') ||
    clean.includes('how much do i still owe') ||
    clean.includes('how much loan do i have left') ||
    clean.includes('how much loan is left') ||
    clean.includes('how much loan do i have') ||
    clean.includes('how much loan') ||
    clean.includes('what do i owe') ||
    clean.includes('do i owe') ||
    clean.includes('still owe') ||
    clean.includes('remaining balance') ||
    clean.includes('tell me about my active loans') ||
    clean.includes('tell me about my loans') ||
    clean.includes('my active loans') ||
    clean.includes('show my loans') ||
    clean.includes('all loans') ||
    clean.includes('loan remaining') ||
    clean.includes('total loan') ||
    clean.includes('total debt') ||
    clean.includes('remaining loan') ||
    clean.includes('show loans') ||
    clean.includes('loan status')
  ) {
    return 'LOANS_OVERVIEW';
  }

  // 8. Biggest Expense Intent (Phase 4B Part 3 / Phase 5 E)
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

  // 9. Sales By Category / Best Seller Intent (Phase 4B Part 4)
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

  // 10. Expense Breakdown Intent (Phase 4B Part 5)
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

  // 11. Business Summary / How is my business doing (Phase 4B Part 1)
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
    clean.includes('monthly summary') ||
    clean.includes('what are my sales looking like')
  ) {
    return 'BUSINESS_SUMMARY';
  }

  // 12. Net Cash Flow / Balance Intent (Phase 4B Part 6)
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

  // 13. Profit & Business Improvement Ideas Intent (Phase 4B Part 8 & 9)
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

  // 14. General Sales Queries (Phase 2A / Phase 4B / Phase 5 E)
  // e.g. "How much did I sell this week?", "How much did I make?", "Show my sales"
  if (
    clean.includes('how much did i sell') ||
    clean.includes('how much did i make') ||
    clean.includes('how much i made') ||
    clean.includes('how were my sales') ||
    clean.includes('how are my sales') ||
    clean.includes('sales this week') ||
    clean.includes('sales this month') ||
    clean.includes('sales last month') ||
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

  // 15. General Expense Queries (Phase 2A / Phase 4B / Phase 5 E)
  // e.g. "How much did I spend this week?", "How are my expenses this month?", "Show my expenses"
  if (
    clean.includes('how much did i spend') ||
    clean.includes('how were my expenses') ||
    clean.includes('how are my expenses') ||
    clean.includes('show my expenses') ||
    clean.includes('expenses this week') ||
    clean.includes('expenses this month') ||
    clean.includes('expenses last month') ||
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

  // 16. Conversational Greeting Intent
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
 * A. Category-Specific Sales Answer (Phase 5 A)
 * Answers questions like "How much did I earn from vegetables this month?"
 */
export function generateCategorySalesAnswer(context, query) {
  const category = detectSaleCategory(query) || 'Vegetables';
  const detectedPeriod = detectPeriod(query, null);

  let period = detectedPeriod || 'this_month';
  let { startDate, endDate, label } = getDateRangeForPeriod(period);

  let filtered = filterByDateRange(context.sales || [], startDate, endDate);

  // If no explicit period was mentioned and current month is empty, fall back to all recorded history
  if (!detectedPeriod && filtered.length === 0) {
    filtered = context.sales || [];
    label = 'overall';
  }

  const catKey = category.toLowerCase();
  const catSales = filtered.filter((s) => (s.category || '').toLowerCase().includes(catKey));
  const catTotal = catSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const overallSalesTotal = filtered.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  if (catSales.length === 0 || catTotal === 0) {
    return (
      `You haven't recorded any sales in ${category} for ${label} yet (₹0).\n\n` +
      `💡 Tip: When recording sales, select '${category}' to keep track of this category's earnings.`
    );
  }

  const shareText =
    overallSalesTotal > 0
      ? ` (${Math.round((catTotal / overallSalesTotal) * 100)}% of your recorded sales)`
      : '';

  return (
    `Your sales for ${category} ${label} total ₹${formatCurrency(catTotal)} across ${catSales.length} recorded transaction${catSales.length === 1 ? '' : 's'}${shareText}.`
  );
}

/**
 * B. Category-Specific Expense Answer (Phase 5 B)
 * Answers questions like "How much did I spend on transport?"
 */
export function generateCategoryExpensesAnswer(context, query) {
  const category = detectExpenseCategory(query) || 'Stock / Purchases';
  const detectedPeriod = detectPeriod(query, null);

  let period = detectedPeriod || 'this_month';
  let { startDate, endDate, label } = getDateRangeForPeriod(period);

  let filtered = filterByDateRange(context.expenses || [], startDate, endDate);

  // If no explicit period was mentioned and current month is empty, fall back to all recorded history
  if (!detectedPeriod && filtered.length === 0) {
    filtered = context.expenses || [];
    label = 'overall';
  }

  const catKey = category.toLowerCase().split('/')[0].trim();
  const catExpenses = filtered.filter((e) => (e.category || '').toLowerCase().includes(catKey));
  const catTotal = catExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const overallExpTotal = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  if (catExpenses.length === 0 || catTotal === 0) {
    return (
      `You haven't recorded any expenses for ${category} for ${label} yet (₹0).\n\n` +
      `💡 Tip: Tap 'Add Expense' anytime to record receipts under '${category}'.`
    );
  }

  const shareText =
    overallExpTotal > 0
      ? ` (${Math.round((catTotal / overallExpTotal) * 100)}% of your recorded expenses)`
      : '';

  return (
    `You spent ₹${formatCurrency(catTotal)} on ${category} ${label} across ${catExpenses.length} recorded entry${catExpenses.length === 1 ? '' : 'ies'}${shareText}.`
  );
}

/**
 * C. Loan Repaid Answer (Phase 5 C)
 * Answers questions like "How much have I repaid?"
 */
export function generateLoanRepaidAnswer(context) {
  const loans = context.loans || [];

  if (loans.length === 0) {
    return (
      "You currently have no recorded microloans in the tracker.\n\n" +
      "💡 Tip: You can add an active microloan from the Loans screen to track balances and repayment instalments."
    );
  }

  const totalOriginal = loans.reduce((sum, l) => sum + Number(l.originalAmount || 0), 0);
  const totalRepaid = loans.reduce((sum, l) => sum + Number(l.totalRepaid || 0), 0);
  const totalRemaining = loans.reduce((sum, l) => sum + Number(l.remainingAmount || 0), 0);
  const percentCleared = totalOriginal > 0 ? Math.round((totalRepaid / totalOriginal) * 100) : 0;

  const perLoanLines = loans
    .map((l) => {
      const repaid = formatCurrency(l.totalRepaid || 0);
      const remaining = formatCurrency(l.remainingAmount || 0);
      return `• ${l.name}: ₹${repaid} repaid (₹${remaining} remaining)`;
    })
    .join('\n');

  return (
    `You have repaid a total of ₹${formatCurrency(totalRepaid)} so far across your loans (out of ₹${formatCurrency(totalOriginal)} borrowed, ${percentCleared}% cleared).\n\n` +
    `Your remaining total loan balance is ₹${formatCurrency(totalRemaining)}.\n\n` +
    `Repayment by loan:\n${perLoanLines}`
  );
}

/**
 * D. Month-over-Month Comparison (Phase 5 D)
 * Compares current month with previous calendar month factually.
 */
export function generateMonthlyComparisonAnswer(context, query) {
  const thisMonthRange = getDateRangeForPeriod('this_month');
  const lastMonthRange = getDateRangeForPeriod('last_month');

  const thisSales = filterByDateRange(context.sales || [], thisMonthRange.startDate, thisMonthRange.endDate);
  const thisExpenses = filterByDateRange(context.expenses || [], thisMonthRange.startDate, thisMonthRange.endDate);
  const thisRepayments = getRepaymentsInDateRange(context.loans || [], thisMonthRange.startDate, thisMonthRange.endDate);

  const lastSales = filterByDateRange(context.sales || [], lastMonthRange.startDate, lastMonthRange.endDate);
  const lastExpenses = filterByDateRange(context.expenses || [], lastMonthRange.startDate, lastMonthRange.endDate);
  const lastRepayments = getRepaymentsInDateRange(context.loans || [], lastMonthRange.startDate, lastMonthRange.endDate);

  const thisSalesTotal = thisSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const thisExpTotal = thisExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const thisRepayTotal = thisRepayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const thisNet = thisSalesTotal - thisExpTotal - thisRepayTotal;

  const lastSalesTotal = lastSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const lastExpTotal = lastExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const lastRepayTotal = lastRepayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const lastNet = lastSalesTotal - lastExpTotal - lastRepayTotal;

  const hasThisMonth = thisSales.length > 0 || thisExpenses.length > 0;
  const hasLastMonth = lastSales.length > 0 || lastExpenses.length > 0;

  if (!hasThisMonth && !hasLastMonth) {
    return "I don't have enough recorded data from last month and this month to make a comparison yet.";
  }

  if (!hasLastMonth) {
    return (
      `I don't have enough recorded data from last month to make a comparison yet.\n\n` +
      `This month so far:\n` +
      `• Sales: ₹${formatCurrency(thisSalesTotal)}\n` +
      `• Expenses: ₹${formatCurrency(thisExpTotal)}\n` +
      `• Net Cash Flow: ₹${formatCurrency(thisNet)}`
    );
  }

  const salesDiff = thisSalesTotal - lastSalesTotal;
  const expDiff = thisExpTotal - lastExpTotal;

  const clean = (query || '').toLowerCase();
  const isSalesSpecific = clean.includes('sales');
  const isExpSpecific = clean.includes('expenses') || clean.includes('expense');

  // Specialized response if user asked specifically about sales
  if (isSalesSpecific && !isExpSpecific) {
    const compText =
      salesDiff > 0
        ? `Sales were ₹${formatCurrency(salesDiff)} higher this month compared to last month.`
        : salesDiff < 0
        ? `Sales were ₹${formatCurrency(Math.abs(salesDiff))} lower this month compared to last month.`
        : `Sales were identical to last month.`;

    return (
      `This Month Sales: ₹${formatCurrency(thisSalesTotal)}\n` +
      `Last Month Sales: ₹${formatCurrency(lastSalesTotal)}\n\n` +
      `${compText}`
    );
  }

  // Specialized response if user asked specifically about expenses
  if (isExpSpecific && !isSalesSpecific) {
    const compText =
      expDiff > 0
        ? `Expenses were ₹${formatCurrency(expDiff)} higher this month compared to last month.`
        : expDiff < 0
        ? `Expenses were ₹${formatCurrency(Math.abs(expDiff))} lower this month compared to last month.`
        : `Expenses were identical to last month.`;

    return (
      `This Month Expenses: ₹${formatCurrency(thisExpTotal)}\n` +
      `Last Month Expenses: ₹${formatCurrency(lastExpTotal)}\n\n` +
      `${compText}`
    );
  }

  // Full month-over-month comparison
  const salesCompText =
    salesDiff > 0
      ? `Sales were ₹${formatCurrency(salesDiff)} higher this month.`
      : salesDiff < 0
      ? `Sales were ₹${formatCurrency(Math.abs(salesDiff))} lower this month.`
      : `Sales were identical to last month.`;

  const expCompText =
    expDiff > 0
      ? `Expenses were ₹${formatCurrency(expDiff)} higher this month.`
      : expDiff < 0
      ? `Expenses were ₹${formatCurrency(Math.abs(expDiff))} lower this month.`
      : `Expenses were identical to last month.`;

  return (
    `Here is your month-over-month comparison:\n\n` +
    `This Month:\n` +
    `• Sales: ₹${formatCurrency(thisSalesTotal)}\n` +
    `• Expenses: ₹${formatCurrency(thisExpTotal)}\n` +
    `• Net Cash Flow: ₹${formatCurrency(thisNet)}\n\n` +
    `Last Month:\n` +
    `• Sales: ₹${formatCurrency(lastSalesTotal)}\n` +
    `• Expenses: ₹${formatCurrency(lastExpTotal)}\n` +
    `• Net Cash Flow: ₹${formatCurrency(lastNet)}\n\n` +
    `Summary:\n` +
    `• ${salesCompText}\n` +
    `• ${expCompText}`
  );
}

/**
 * 1. Business Summary (Phase 4B Part 1)
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
 * 2. Sales Query (Supports today, yesterday, this week, last week, this month, last month)
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
 * 3. Expense Query (Supports today, yesterday, this week, last week, this month, last month)
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
 * 4. Biggest Expense (Phase 4B Part 3)
 */
export function generateBiggestExpenseAnswer(context, query) {
  const period = detectPeriod(query, 'this_month');
  const { startDate, endDate, label } = getDateRangeForPeriod(period);

  let filteredExpenses = filterByDateRange(context.expenses || [], startDate, endDate);
  let effectiveLabel = label;

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
 * 5. Best-Selling Category (Phase 4B Part 4)
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
 * 6. Expense Breakdown (Phase 4B Part 5)
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
 * 7. Net Cash Flow / Balance (Phase 4B Part 6)
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
 * 8. Week-over-Week Comparison (Phase 4B Part 7)
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
 * 9. Smart Suggestions (Phase 4B Part 8 & 9)
 */
export function generateSmartSuggestions(context) {
  const profile = context.profile || {};
  const businessType = profile.businessType || 'retail stall';
  const businessName = profile.businessName || 'your business';

  const allExpenses = context.expenses || [];
  const categoryExpenseTotals = {};
  let totalExpenses = 0;
  allExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    const amt = Number(e.amount || 0);
    categoryExpenseTotals[cat] = (categoryExpenseTotals[cat] || 0) + amt;
    totalExpenses += amt;
  });

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
 * 10. Next Loan Due / Next Repayment (Phase 5 C)
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
    `• Next Instalment: ₹${installment} (${frequency})\n` +
    `• Remaining Loan Balance: ₹${remaining}\n` +
    `• Loan Status: ${status}\n\n` +
    `💡 You can open the Loans tab to log your repayment when paid.`
  );
}

/**
 * 11. Loans Overview / Total Debt (Phase 5 C)
 * Distinguishes original borrowing, total repaid, and remaining balance.
 */
export function generateLoansOverviewAnswer(context) {
  const loans = context.loans || [];
  const activeLoans = context.activeLoans || loans.filter((l) => l && l.status !== 'Completed');
  const totalRemaining = Number(context.totalLoanRemaining || activeLoans.reduce((sum, l) => sum + Number(l.remainingAmount || 0), 0));
  const totalOriginal = Number(context.totalOriginalLoan || activeLoans.reduce((sum, l) => sum + Number(l.originalAmount || 0), 0));
  const totalRepaid = Number(context.totalRepaidSoFar || activeLoans.reduce((sum, l) => sum + Number(l.totalRepaid || 0), 0));

  if (loans.length === 0 || (activeLoans.length === 0 && totalRemaining === 0)) {
    return (
      "You currently have no outstanding loan balance (₹0 owed).\n\n" +
      "You have completed all scheduled loan repayments, or have not added any active loans."
    );
  }

  const loanItems = activeLoans
    .map((l) => {
      const remaining = formatCurrency(l.remainingAmount || 0);
      const original = formatCurrency(l.originalAmount || 0);
      const repaid = formatCurrency(l.totalRepaid || 0);
      const nextDue = l.nextDueDate ? ` (Next due: ${l.nextDueDate})` : '';
      return `• ${l.name}: ₹${remaining} remaining of ₹${original} (₹${repaid} repaid)${nextDue}`;
    })
    .join('\n');

  return (
    `You have ${activeLoans.length} active loan${activeLoans.length === 1 ? '' : 's'} with a total remaining balance of ₹${formatCurrency(totalRemaining)}.\n\n` +
    `Loan Summary:\n` +
    `• Total Borrowed: ₹${formatCurrency(totalOriginal)}\n` +
    `• Total Repaid: ₹${formatCurrency(totalRepaid)}\n` +
    `• Total Remaining: ₹${formatCurrency(totalRemaining)}\n\n` +
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
    `• Category sales (e.g. vegetables, fruits)\n` +
    `• Category expenses (e.g. transport, rent, stock)\n` +
    `• Monthly & weekly comparisons\n` +
    `• Loan repayment progress & upcoming due dates\n` +
    `• Practical suggestions to improve profit\n\n` +
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
    `• "How much did I earn from vegetables this month?"\n` +
    `• "How much did I spend on transport?"\n` +
    `• "Compare this month with last month"\n` +
    `• "How much loan do I have left?"\n` +
    `• "How much have I repaid?"\n` +
    `• "What was my biggest expense?"\n` +
    `• "Give me suggestions to improve my business"`
  );
}

/**
 * Main query processor: takes user text and AppContext snapshot,
 * detects intent, and produces the corresponding factual response (Phase 5).
 */
export async function processBusinessQuery(query, context = {}) {
  const intent = detectIntent(query);

  let replyText = '';

  switch (intent) {
    case 'CATEGORY_SALES':
      replyText = generateCategorySalesAnswer(context, query);
      break;

    case 'CATEGORY_EXPENSES':
      replyText = generateCategoryExpensesAnswer(context, query);
      break;

    case 'LOAN_REPAID':
      replyText = generateLoanRepaidAnswer(context);
      break;

    case 'MONTHLY_COMPARISON':
      replyText = generateMonthlyComparisonAnswer(context, query);
      break;

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
