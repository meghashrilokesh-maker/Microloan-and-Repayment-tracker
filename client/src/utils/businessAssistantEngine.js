/**
 * Business Assistant Knowledge Engine (Phase 2A)
 *
 * Modular, rule-based reasoning engine that analyzes live AppContext financial data
 * (sales, expenses, loans, repayments, profile) to provide instant, factual answers.
 *
 * Designed to seamlessly interface with future Phase 3 LLM / Voice components.
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
 * Identify intent from user input string.
 * Order of checks ensures specific composite intents (like 'balance' or 'next loan')
 * are not prematurely captured by generic keywords ('sales' or 'loans').
 */
export function detectIntent(query) {
  if (!query || typeof query !== 'string') return 'UNKNOWN';
  const clean = query.trim().toLowerCase();

  // 1. Balance / Money Left Intent
  if (
    clean.includes('money left') ||
    clean.includes('balance') ||
    clean.includes('after expenses') ||
    clean.includes('cash left') ||
    clean.includes('net profit') ||
    clean.includes('net balance') ||
    clean.includes('how much left') ||
    clean.includes('earn after')
  ) {
    return 'BALANCE';
  }

  // 2. Next Loan Due Intent
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

  // 3. Loans Overview / Total Debt Intent
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

  // 4. Profit & Business Improvement Ideas Intent
  if (
    clean.includes('increase profit') ||
    clean.includes('profit ideas') ||
    clean.includes('improve my business') ||
    clean.includes('improve business') ||
    clean.includes('reduce expenses') ||
    clean.includes('grow profit') ||
    clean.includes('grow business') ||
    clean.includes('business tips') ||
    clean.includes('more profit') ||
    clean.includes('boost sales') ||
    clean.includes('ideas to increase')
  ) {
    return 'PROFIT_IDEAS';
  }

  // 5. Today's Sales Intent
  if (
    clean.includes('how much did i sell') ||
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

  // 6. Today's Expenses Intent
  if (
    clean.includes('show my expenses') ||
    clean.includes('how much did i spend') ||
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

  // 7. Conversational Greeting Intent
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
 * A. Answer generator for Today's Sales
 */
export function generateSalesAnswer(context) {
  const todayStr = getTodayDateString();
  const todaySalesTotal = Number(context.todaySalesTotal || 0);
  const salesList = (context.sales || []).filter((s) => s && s.date === todayStr);

  if (salesList.length === 0 || todaySalesTotal === 0) {
    return (
      "You haven't recorded any sales for today yet (₹0).\n\n" +
      "💡 Tip: Tap 'Add Sale' on your dashboard or navigate to the Sales tab anytime to log cash and UPI customer purchases!"
    );
  }

  // Compute category breakdowns
  const categoryCounts = {};
  salesList.forEach((s) => {
    const cat = s.category || 'General Sales';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + Number(s.amount || 0);
  });

  const categoryLines = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `• ${cat}: ₹${formatCurrency(amt)}`)
    .join('\n');

  return (
    `Today's total sales are ₹${formatCurrency(todaySalesTotal)} across ${salesList.length} recorded transaction${salesList.length === 1 ? '' : 's'}.\n\n` +
    `Breakdown by category:\n${categoryLines}\n\n` +
    `Keep up the great momentum!`
  );
}

/**
 * B. Answer generator for Today's Expenses
 */
export function generateExpensesAnswer(context) {
  const todayStr = getTodayDateString();
  const todayExpensesTotal = Number(context.todayExpensesTotal || 0);
  const expensesList = (context.expenses || []).filter((e) => e && e.date === todayStr);

  if (expensesList.length === 0 || todayExpensesTotal === 0) {
    return (
      "No expenses have been recorded for today yet (₹0).\n\n" +
      "💡 Tip: Tap 'Add Expense' on your dashboard to log wholesale stock purchases, transport fares, or daily stall maintenance."
    );
  }

  // Compute category breakdowns
  const categoryCounts = {};
  expensesList.forEach((e) => {
    const cat = e.category || 'Stock / Purchases';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + Number(e.amount || 0);
  });

  const categoryLines = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `• ${cat}: ₹${formatCurrency(amt)}`)
    .join('\n');

  return (
    `Today's total expenses are ₹${formatCurrency(todayExpensesTotal)} across ${expensesList.length} entry${expensesList.length === 1 ? '' : 'ies'}.\n\n` +
    `Expense breakdown:\n${categoryLines}`
  );
}

/**
 * C. Answer generator for Today's Balance / Cash Left
 */
export function generateBalanceAnswer(context) {
  const salesAmt = Number(context.todaySalesTotal || 0);
  const expAmt = Number(context.todayExpensesTotal || 0);
  const repayAmt = Number(context.todayRepaymentsTotal || 0);
  const moneyLeft = Number(context.moneyLeft !== undefined ? context.moneyLeft : salesAmt - expAmt - repayAmt);

  const statusNote =
    moneyLeft > 0
      ? '🟢 You have a positive net cash balance today.'
      : moneyLeft === 0
      ? '⚪ Your cash balance is even for today.'
      : '🔴 Expenses and loan repayments currently exceed recorded sales today.';

  return (
    `Your cash balance left today is ₹${formatCurrency(moneyLeft)}.\n\n` +
    `Today's Financial Summary:\n` +
    `• Sales Recorded: +₹${formatCurrency(salesAmt)}\n` +
    `• Expenses Recorded: -₹${formatCurrency(expAmt)}\n` +
    `• Loan Repayments Paid: -₹${formatCurrency(repayAmt)}\n` +
    `──────────────────────────\n` +
    `= Net Cash Left: ₹${formatCurrency(moneyLeft)}\n\n` +
    `${statusNote}`
  );
}

/**
 * D. Answer generator for Next Loan Due
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
 * E. Answer generator for Loan Overview / Total Debt
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
 * F. Answer generator for Practical Profit & Expense Ideas
 */
export function generateProfitIdeas(context) {
  const profile = context.profile || {};
  const businessType = profile.businessType || 'General Retail & Stall';
  const products = profile.productsServices || 'daily essentials';
  const todaySales = Number(context.todaySalesTotal || 0);
  const todayExpenses = Number(context.todayExpensesTotal || 0);

  // Dynamic suggestion 1: Procurement / Cost optimization tailored to business type
  let suggestion1 = '';
  if (businessType.toLowerCase().includes('vegetable') || businessType.toLowerCase().includes('fruit')) {
    suggestion1 =
      `1. Early Wholesale Procurement & Grading: For your ${businessType} trade, sourcing fresh items directly in early morning APMC Mandi wholesale auctions can lower purchase costs by 10–15%. Grade produce into premium and quick-sale batches to eliminate spoilage loss.`;
  } else if (businessType.toLowerCase().includes('food')) {
    suggestion1 =
      `1. Bulk Ingredient Sourcing: Procure non-perishable cooking essentials (oils, grains, spices) in weekly wholesale quantities rather than daily retail buying to capture 8–12% volume discounts.`;
  } else {
    suggestion1 =
      `1. Stock Turn Optimization: Prioritize fast-moving items among your ${products} and negotiate 5–10% credit terms with suppliers on regular weekly replenishments.`;
  }

  // Dynamic suggestion 2: Bundling & Sales Increase
  const suggestion2 =
    `2. Peak-Hour Combo Bundles: Create quick-grab bundled packs of complementary goods during morning and evening rush hours. This accelerates customer turnover and raises your average ticket value.`;

  // Dynamic suggestion 3: Cash Flow, UPI & Subsidies
  let suggestion3 = '';
  if (todayExpenses > todaySales && todaySales > 0) {
    suggestion3 =
      `3. Cash Flow Alignment: Today's recorded expenses (₹${formatCurrency(todayExpenses)}) exceed sales (₹${formatCurrency(todaySales)}). Prioritize collecting pending customer khata balances and defer non-critical tool/asset upgrades until weekend sales settle.`;
  } else {
    suggestion3 =
      `3. Digital Repayment & Subsidy Benefits: Ensure timely digital microloan repayments (via UPI/QR) to build an excellent credit profile and take advantage of interest subvention programs (such as PM SVANidhi's 7% interest subsidy on prompt digital repayments).`;
  }

  return (
    `Here are 3 practical suggestions to improve profit for ${profile.businessName || 'your business'}:\n\n` +
    `${suggestion1}\n\n` +
    `${suggestion2}\n\n` +
    `${suggestion3}`
  );
}

/**
 * G. Friendly Greeting
 */
export function generateGreeting(context) {
  const profile = context.profile || {};
  const name = (profile.ownerName || 'Vendor').split(' ')[0];
  const shop = profile.businessName || 'your business';

  return (
    `Hello, ${name}! Welcome to your TrackShack Business Assistant for ${shop}.\n\n` +
    `I can give you live updates on:\n` +
    `• Today's sales & revenue\n` +
    `• Today's expenses & purchases\n` +
    `• Current cash balance\n` +
    `• Upcoming microloan due dates\n` +
    `• Practical suggestions to grow your profit\n\n` +
    `What would you like to check?`
  );
}

/**
 * Fallback response for unhandled queries
 */
export function generateFallback() {
  return (
    `I can currently help with your sales, expenses, balance, loans, and basic business suggestions.\n\n` +
    `You can try asking:\n` +
    `• "How much did I sell today?"\n` +
    `• "Show my expenses"\n` +
    `• "How much money is left today?"\n` +
    `• "Which loan is due next?"\n` +
    `• "How much loan is remaining?"\n` +
    `• "Give me ideas to increase profit"`
  );
}

/**
 * Main query processor: takes user text and AppContext snapshot,
 * detects intent, and produces the corresponding factual response.
 */
export async function processBusinessQuery(query, context = {}) {
  const intent = detectIntent(query);

  let replyText = '';

  switch (intent) {
    case 'SALES':
      replyText = generateSalesAnswer(context);
      break;

    case 'EXPENSES':
      replyText = generateExpensesAnswer(context);
      break;

    case 'BALANCE':
      replyText = generateBalanceAnswer(context);
      break;

    case 'NEXT_LOAN':
      replyText = generateNextLoanAnswer(context);
      break;

    case 'LOANS_OVERVIEW':
      replyText = generateLoansOverviewAnswer(context);
      break;

    case 'PROFIT_IDEAS':
      replyText = generateProfitIdeas(context);
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
