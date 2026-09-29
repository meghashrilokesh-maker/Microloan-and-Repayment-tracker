/**
 * Voice Transaction Parser (Phase 3B)
 *
 * Converts spoken voice transcripts (or natural text) into structured transaction drafts
 * for Sales and Expenses. Completely decoupled from database persistence.
 */

const SMALL_NUMBERS = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const MAGNITUDES = {
  hundred: 100,
  thousand: 1000,
  k: 1000,
  lakh: 100000,
  lakhs: 100000,
  lac: 100000,
  lacs: 100000,
  crore: 10000000,
  crores: 10000000,
};

/**
 * Parses spoken English numbers like "five hundred", "two thousand five hundred", "one lakh"
 */
export function wordsToNumber(text) {
  if (!text || typeof text !== 'string') return null;

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let total = 0;
  let current = 0;
  let foundAnyNumber = false;

  for (const word of words) {
    if (SMALL_NUMBERS[word] !== undefined) {
      current += SMALL_NUMBERS[word];
      foundAnyNumber = true;
    } else if (MAGNITUDES[word] !== undefined) {
      foundAnyNumber = true;
      const mag = MAGNITUDES[word];
      if (mag === 100) {
        current = (current === 0 ? 1 : current) * 100;
      } else {
        current = (current === 0 ? 1 : current) * mag;
        total += current;
        current = 0;
      }
    } else if (!isNaN(Number(word))) {
      current += Number(word);
      foundAnyNumber = true;
    }
  }

  const result = total + current;
  return foundAnyNumber && result > 0 ? result : null;
}

/**
 * Extracts a numeric amount from digit representation or word phrases.
 */
export function extractAmount(transcript) {
  if (!transcript || typeof transcript !== 'string') return null;

  // 1. Look for explicit digit amounts (e.g. ₹500, 500 rupees, 500.50, 1,500)
  const digitRegex = /(?:₹|rs\.?|inr|rupees?)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|lakh)?\s*(?:rs\.?|inr|rupees?)?/gi;
  const matches = [...transcript.matchAll(digitRegex)];

  for (const match of matches) {
    const rawVal = match[1]?.replace(/,/g, '');
    const num = Number(rawVal);
    if (!isNaN(num) && num > 0) {
      const fullMatch = match[0].toLowerCase();
      if (fullMatch.includes('k') || fullMatch.includes('thousand')) {
        return num * 1000;
      }
      if (fullMatch.includes('lakh')) {
        return num * 100000;
      }
      return num;
    }
  }

  // 2. Fall back to word-based number parsing (e.g. "five hundred rupees")
  const wordAmount = wordsToNumber(transcript);
  if (wordAmount && wordAmount > 0) {
    return wordAmount;
  }

  return null;
}

/**
 * Determines transaction date. Defaults to today's local date.
 */
export function extractDate(transcript) {
  const clean = (transcript || '').toLowerCase();
  const d = new Date();

  if (clean.includes('yesterday')) {
    d.setDate(d.getDate() - 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extracts customer name for sales or supplier name for purchases if clearly stated.
 */
export function extractCustomerName(transcript) {
  if (!transcript || typeof transcript !== 'string') return '';

  // Match "to <Customer>" or "customer <Customer>"
  const customerMatch = transcript.match(/\b(?:to|customer)\s+([A-Za-z0-9&'\s]+?)(?:\s+(?:for|of|on|worth|rupees|rs|\d|today|yesterday|$))/i);
  if (customerMatch && customerMatch[1]) {
    const name = customerMatch[1].trim();
    if (name.length > 1 && !['a', 'an', 'the', 'my', 'his', 'her', 'our'].includes(name.toLowerCase())) {
      return name;
    }
  }

  // Match "from <Supplier>" or "supplier <Supplier>"
  const supplierMatch = transcript.match(/\b(?:from|supplier)\s+([A-Za-z0-9&'\s]+?)(?:\s+(?:for|of|on|worth|rupees|rs|\d|today|yesterday|$))/i);
  if (supplierMatch && supplierMatch[1]) {
    const name = supplierMatch[1].trim();
    if (name.length > 1 && !['a', 'an', 'the', 'my', 'his', 'her', 'our', 'wholesale'].includes(name.toLowerCase())) {
      return name;
    }
  }

  return '';
}

/**
 * Maps spoken keywords to exact existing form categories.
 */
export function extractCategory(transcript, type) {
  const clean = (transcript || '').toLowerCase();

  if (type === 'sale') {
    if (
      clean.includes('vegetable') ||
      clean.includes('veggie') ||
      clean.includes('sabzi') ||
      clean.includes('tomato') ||
      clean.includes('onion') ||
      clean.includes('potato')
    ) {
      return 'Vegetables';
    }

    if (
      clean.includes('fruit') ||
      clean.includes('apple') ||
      clean.includes('banana') ||
      clean.includes('mango') ||
      clean.includes('orange') ||
      clean.includes('papaya')
    ) {
      return 'Fruits';
    }

    if (
      clean.includes('street food') ||
      clean.includes('chaat') ||
      clean.includes('dosa') ||
      clean.includes('idli') ||
      clean.includes('samosa') ||
      clean.includes('panipuri') ||
      clean.includes('snacks')
    ) {
      return 'Street Food';
    }

    if (
      clean.includes('grocery') ||
      clean.includes('kirana') ||
      clean.includes('provisions') ||
      clean.includes('rice') ||
      clean.includes('dal') ||
      clean.includes('oil') ||
      clean.includes('atta')
    ) {
      return 'Grocery';
    }

    if (
      clean.includes('cloth') ||
      clean.includes('clothing') ||
      clean.includes('garment') ||
      clean.includes('saree') ||
      clean.includes('shirt') ||
      clean.includes('pants')
    ) {
      return 'Clothing';
    }

    return 'Vegetables'; // Default popular small vendor category
  }

  // Expense categories
  if (type === 'expense') {
    if (
      clean.includes('transport') ||
      clean.includes('auto') ||
      clean.includes('tempo') ||
      clean.includes('cargo') ||
      clean.includes('bus') ||
      clean.includes('petrol') ||
      clean.includes('diesel') ||
      clean.includes('fare')
    ) {
      return 'Transport';
    }

    if (clean.includes('rent') || clean.includes('stall rent') || clean.includes('room rent')) {
      return 'Shop Rent';
    }

    if (
      clean.includes('electric') ||
      clean.includes('bill') ||
      clean.includes('power') ||
      clean.includes('current') ||
      clean.includes('battery') ||
      clean.includes('recharge')
    ) {
      return 'Electricity / Bills';
    }

    if (
      clean.includes('tea') ||
      clean.includes('chai') ||
      clean.includes('coffee') ||
      clean.includes('food') ||
      clean.includes('lunch') ||
      clean.includes('breakfast') ||
      clean.includes('bun')
    ) {
      return 'Food & Tea';
    }

    // Default wholesale stock/produce
    return 'Stock / Purchases';
  }

  return 'Other';
}

/**
 * Main parser function: translates transcript into structured draft or clarification error.
 */
export function parseVoiceTransaction(transcript) {
  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return {
      success: false,
      message: 'No transcript was provided. Please speak your sale or expense.',
    };
  }

  const clean = transcript.trim().toLowerCase();

  // 1. Identify Sale vs Expense signals
  const hasSaleSignal =
    /\b(sold|sell|sales?|earned|earning|received|made a sale)\b/i.test(clean);

  const hasExpenseSignal =
    /\b(spent|spend|spending|bought|purchased?|purchases?|paid on|paid for|paid to|costs?|expenses?)\b/i.test(clean);

  // Requirement 9: Ambiguity handling
  // "I paid 500" is ambiguous because "paid" alone could be credit, repayment, or incomplete.
  const isBarePaid =
    /\bi\s+paid\b/i.test(clean) &&
    !clean.includes('for') &&
    !clean.includes('to') &&
    !clean.includes('on') &&
    !clean.includes('transport') &&
    !clean.includes('stock') &&
    !clean.includes('tea') &&
    !clean.includes('rent');

  if (isBarePaid || (hasSaleSignal && hasExpenseSignal) || (!hasSaleSignal && !hasExpenseSignal)) {
    return {
      success: false,
      message:
        "Please say whether this was a sale or an expense, for example: 'I sold vegetables for ₹500' or 'I spent ₹500 on transport.'",
    };
  }

  const type = hasSaleSignal ? 'sale' : 'expense';

  // 2. Extract Amount
  const amount = extractAmount(transcript);
  if (!amount || amount <= 0) {
    return {
      success: false,
      message:
        "Could not detect an amount. Please specify the amount, for example: '₹500' or '500 rupees'.",
    };
  }

  // 3. Extract Category
  const category = extractCategory(transcript, type);

  // 4. Extract Date
  const date = extractDate(transcript);

  // 5. Extract Customer / Supplier Name
  const customerName = extractCustomerName(transcript);

  // 6. Build Note
  const note = 'Voice entry';

  return {
    success: true,
    transaction: {
      type,
      amount,
      category,
      date,
      customerName,
      note,
    },
  };
}

export default parseVoiceTransaction;
