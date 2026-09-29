/**
 * Voice Transaction Parser (Phase 4A)
 *
 * Converts spoken voice transcripts (or natural text) into structured transaction drafts
 * for Sales and Expenses. Supports natural language variations and multiple transactions
 * in a single sentence.
 *
 * Completely decoupled from database persistence.
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
 * Detects whether the amount mentioned is approximate.
 * e.g. "about 300 rupees", "around 500", "approximately 1000"
 */
export function isApproximateAmount(transcript) {
  if (!transcript || typeof transcript !== 'string') return false;
  return /\b(about|around|approx\.?|approximately|roughly|nearly|almost)\b/i.test(transcript);
}

/**
 * Determines transaction date.
 * If sentence or clause contains "yesterday", returns yesterday.
 * Otherwise returns fallbackDate or today's local date.
 */
export function extractDate(transcript, fallbackDate = null) {
  const clean = (transcript || '').toLowerCase();
  const d = new Date();

  if (clean.includes('yesterday')) {
    d.setDate(d.getDate() - 1);
  } else if (clean.includes('today')) {
    // Keep today's date
  } else if (fallbackDate) {
    return fallbackDate;
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
    if (name.length > 1 && !['a', 'an', 'the', 'my', 'his', 'her', 'our', 'auto'].includes(name.toLowerCase())) {
      return name;
    }
  }

  // Match "from <Supplier>" or "supplier <Supplier>"
  const supplierMatch = transcript.match(/\b(?:from|supplier)\s+([A-Za-z0-9&'\s]+?)(?:\s+(?:for|of|on|worth|rupees|rs|\d|today|yesterday|$))/i);
  if (supplierMatch && supplierMatch[1]) {
    const name = supplierMatch[1].trim();
    if (name.length > 1 && !['a', 'an', 'the', 'my', 'his', 'her', 'our', 'wholesale', 'fruits', 'vegetables', 'selling'].includes(name.toLowerCase())) {
      return name;
    }
  }

  return '';
}

/**
 * Maps spoken / natural keywords to exact existing form categories.
 */
export function extractCategory(transcript, type) {
  const clean = (transcript || '').toLowerCase();

  if (type === 'sale') {
    if (
      /\b(vegetable|vegetables|veggie|veggies|sabzi|subzi|tomato|tomatoes|onion|onions|potato|potatoes|brinjal|carrot|cabbage|cauliflower|cucumber)\b/i.test(clean)
    ) {
      return 'Vegetables';
    }

    if (
      /\b(fruit|fruits|apple|apples|banana|bananas|mango|mangoes|orange|oranges|papaya|grapes|watermelon)\b/i.test(clean)
    ) {
      return 'Fruits';
    }

    if (
      /\b(street food|chaat|chat|dosa|idli|samosa|samosas|panipuri|pani puri|snacks|vada|vada pav|pav bhaji|bhel|bhelpuri)\b/i.test(clean)
    ) {
      return 'Street Food';
    }

    if (
      /\b(grocery|groceries|kirana|provisions?|rice|dal|oil|atta|flour|spices|pulses|sugar|milk)\b/i.test(clean)
    ) {
      return 'Grocery';
    }

    if (
      /\b(cloth|cloths|clothes|clothing|garment|garments|saree|sarees|sari|shirt|shirts|pants|trousers|dress|apparel)\b/i.test(clean)
    ) {
      return 'Clothing';
    }

    return 'Vegetables'; // Default popular small vendor category
  }

  // Expense categories
  if (type === 'expense') {
    if (
      /\b(transport|transportation|auto|tempo|cargo|bus|petrol|diesel|fuel|fare|cab|taxi|vehicle|delivery)\b/i.test(clean)
    ) {
      return 'Transport';
    }

    if (
      /\b(shop rent|stall rent|room rent|store rent|rent)\b/i.test(clean)
    ) {
      return 'Shop Rent';
    }

    if (
      /\b(electric|electricity|bills?|power|current|battery|recharge|mobile recharge|light bill|water bill)\b/i.test(clean)
    ) {
      return 'Electricity / Bills';
    }

    if (
      /\b(tea|chai|coffee|food|lunch|breakfast|dinner|snacks?|bun|biscuits?|refreshments?)\b/i.test(clean)
    ) {
      return 'Food & Tea';
    }

    // Default wholesale stock/produce ("bought stock", "purchased vegetables", "bought produce", etc.)
    return 'Stock / Purchases';
  }

  return 'Other';
}

/**
 * Splits a compound natural language sentence into independent transaction clauses.
 * Does NOT blindly split every occurrence of "and" (e.g. "fruits and vegetables for 1000" remains one clause).
 */
export function splitIntoClauses(transcript) {
  if (!transcript || typeof transcript !== 'string') return [];
  const text = transcript.trim();

  // Pattern identifying the start of a financial action
  const actionPattern = /\b(?:i\s+)?(?:sold|sell|selling|sales?|earned|earning|received|made\s+a\s+sale|spent|spend|spending|paid|bought|purchased?|costs?)\b/i;

  // 1. Initial split on semicolons or distinct sentence breaks
  const segments = text.split(/(?:;\s*|(?<=\D)\.\s+(?=[A-Z]|\b))/i);
  const clauses = [];

  for (const seg of segments) {
    if (!seg.trim()) continue;

    // 2. Split on explicit multi-part connectors like "and then", "and also", "then", "also", "plus"
    const explicitSplit = seg.split(/\s*(?:,\s*|\s+)(?:and\s+then|and\s+also|then|also|plus)\s+/i);

    for (const part of explicitSplit) {
      if (!part.trim()) continue;

      // 3. Conditional split on "and":
      // An "and" splits into two transactions ONLY if:
      // (a) followed by an action verb (e.g. "and spent 200 on transport", "and bought stock")
      // OR
      // (b) both preceding and succeeding clauses contain their own independent amount
      const andParts = part.split(/\s+and\s+/i);

      if (andParts.length > 1) {
        let currentCombined = andParts[0];

        for (let i = 1; i < andParts.length; i++) {
          const nextPart = andParts[i];
          const hasAction = actionPattern.test(nextPart);
          const currentHasAmount = extractAmount(currentCombined) !== null;
          const nextHasAmount = extractAmount(nextPart) !== null;

          if (hasAction || (currentHasAmount && nextHasAmount)) {
            clauses.push(currentCombined.trim());
            currentCombined = nextPart;
          } else {
            // Compound noun phrase (e.g. "fruits and vegetables for 1000" or "tea and snacks for 50")
            currentCombined += ' and ' + nextPart;
          }
        }
        if (currentCombined.trim()) {
          clauses.push(currentCombined.trim());
        }
      } else {
        clauses.push(part.trim());
      }
    }
  }

  return clauses.filter(Boolean);
}

/**
 * Detects whether a string is purely an amount (plus optional currency or approximation words)
 * without any transaction context (e.g. "10", "500", "₹1000", "200 rupees", "about 300", "around 500").
 */
export function isAmountOnly(text) {
  if (!text || typeof text !== 'string') return false;
  const stripped = text
    .toLowerCase()
    .replace(/[0-9.,₹\-?!]/g, ' ')
    .replace(/\b(rs\.?|inr|rupees?|bucks?)\b/g, ' ')
    .replace(/\b(about|around|approx\.?|approximately|nearly|almost|roughly)\b/g, ' ')
    .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|k|lakh|lakhs|lac|lacs|crore|crores)\b/g, ' ')
    .replace(/\b(only|total|just)\b/g, ' ')
    .trim();

  return stripped.length === 0;
}

/**
 * Evaluates whether a clause is an ambiguous financial statement requiring user clarification.
 * Examples:
 * "I paid 500." -> Bare payment without purpose or recipient
 * "I made 2000." -> Bare made without purpose, category, or sale wording
 * "10" / "500" / "₹1000" -> Bare amount without sale or expense context
 */
function checkAmbiguity(clause) {
  const clean = (clause || '').toLowerCase().trim();

  // 1. Bare "paid 500" / "I paid 500"
  const isBarePaid =
    /\bi\s+paid\b/i.test(clean) &&
    !clean.includes('for') &&
    !clean.includes('on') &&
    !clean.includes('to') &&
    !clean.includes('transport') &&
    !clean.includes('stock') &&
    !clean.includes('tea') &&
    !clean.includes('rent') &&
    !clean.includes('auto') &&
    !clean.includes('electricity') &&
    !clean.includes('bill');

  // 2. Bare "I made 2000" / "made 2000"
  const isBareMade =
    /\bi\s+made\s+(?:₹|rs\.?|rupees?)?\s*\d+\s*(?:rs\.?|rupees?)?\.?$/i.test(clean) &&
    !clean.includes('selling') &&
    !clean.includes('sale') &&
    !clean.includes('from') &&
    !clean.includes('fruit') &&
    !clean.includes('vegetable');

  if (isBarePaid || isBareMade) {
    const amt = extractAmount(clause);
    const formatted = amt ? `₹${amt.toLocaleString('en-IN')}` : 'this amount';
    return {
      isAmbiguous: true,
      message: `Was the ${formatted} a sale or an expense? Please mention what it was for.`,
    };
  }

  // 3. Amount-only input (e.g. "10", "500", "₹1000", "200 rupees", "about 300", "around 500")
  if (isAmountOnly(clean)) {
    const amt = extractAmount(clause);
    const formatted = amt ? `₹${amt.toLocaleString('en-IN')}` : 'this amount';
    return {
      isAmbiguous: true,
      message: `I have the amount ${formatted}, but I’m not sure whether this is a sale or an expense. Please tell me what it was for.`,
    };
  }

  return { isAmbiguous: false };
}

/**
 * Main parser: Parses single or multiple transactions from spoken or typed input (Phase 4A).
 * Returns structured draft array, clarification notes, or ambiguity warnings.
 */
export function parseVoiceTransactions(transcript) {
  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return {
      success: false,
      transactions: [],
      message: 'No transcript was provided. Please speak or type your sale or expense.',
    };
  }

  const rawClean = transcript.trim();
  const lowerText = rawClean.toLowerCase();

  // Global date for the entire sentence (e.g. "Yesterday I sold ... and spent ...")
  const globalDate = extractDate(lowerText);

  // Check whole-string ambiguity first (e.g. "I paid 500." or "I made 2000.")
  const globalAmbiguity = checkAmbiguity(rawClean);
  if (globalAmbiguity.isAmbiguous) {
    return {
      success: false,
      transactions: [],
      isAmbiguous: true,
      message: globalAmbiguity.message,
    };
  }

  // Split into independent clauses
  const rawClauses = splitIntoClauses(rawClean);
  const clauses = rawClauses.length > 0 ? rawClauses : [rawClean];

  const transactions = [];
  const incompleteClauses = [];

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    const cleanClause = clause.toLowerCase();

    // Check clause-level ambiguity
    const clauseAmbiguity = checkAmbiguity(clause);
    if (clauseAmbiguity.isAmbiguous) {
      return {
        success: false,
        transactions: [],
        isAmbiguous: true,
        message: clauseAmbiguity.message,
      };
    }

    // 1. Identify Sale vs Expense signals
    const hasSaleSignal =
      /\b(sold|sell|selling|sales?|earned|earning|received|made a sale)\b/i.test(cleanClause) ||
      /\b(made|got)\s+(?:₹|rs\.?|inr|rupees?)?\s*\d+.*(?:from|selling)/i.test(cleanClause);

    const hasExpenseSignal =
      /\b(spent|spend|spending|bought|purchased?|purchases?|paid on|paid for|paid to|paid \d+ for|costs?|expenses?)\b/i.test(cleanClause);

    // 2. Check for missing amount on an active financial clause (Requirement 5)
    const amount = extractAmount(clause);
    if (!amount || amount <= 0) {
      if (hasExpenseSignal || hasSaleSignal || cleanClause.includes('bought') || cleanClause.includes('stock')) {
        let missingPurpose = 'next transaction';
        if (cleanClause.includes('stock')) missingPurpose = 'stock purchase';
        else if (cleanClause.includes('transport') || cleanClause.includes('auto')) missingPurpose = 'transport expense';
        else if (cleanClause.includes('tea') || cleanClause.includes('food')) missingPurpose = 'food/tea expense';
        else if (cleanClause.includes('rent')) missingPurpose = 'rent payment';
        else if (hasExpenseSignal) missingPurpose = 'expense';
        else if (hasSaleSignal) missingPurpose = 'sale';

        incompleteClauses.push({ clause, missingPurpose });
      }
      continue;
    }

    // Determine type
    let type = null;
    if (hasExpenseSignal && !hasSaleSignal) {
      type = 'expense';
    } else if (hasSaleSignal && !hasExpenseSignal) {
      type = 'sale';
    } else if (hasSaleSignal && hasExpenseSignal) {
      // Clause has mixed signals; check dominant keyword
      if (/\b(spent|bought|purchased|paid)\b/i.test(cleanClause)) {
        type = 'expense';
      } else {
        type = 'sale';
      }
    } else {
      // Neither action signal explicit in this clause; check for category keywords
      const hasExpenseCategory =
        cleanClause.includes('transport') ||
        cleanClause.includes('auto') ||
        cleanClause.includes('tempo') ||
        cleanClause.includes('cargo') ||
        cleanClause.includes('rent') ||
        cleanClause.includes('bill') ||
        cleanClause.includes('electric') ||
        cleanClause.includes('tea') ||
        cleanClause.includes('chai') ||
        cleanClause.includes('coffee') ||
        cleanClause.includes('stock');

      const hasSaleCategory =
        cleanClause.includes('vegetable') ||
        cleanClause.includes('veggie') ||
        cleanClause.includes('sabzi') ||
        cleanClause.includes('fruit') ||
        cleanClause.includes('chaat') ||
        cleanClause.includes('street food') ||
        cleanClause.includes('grocery') ||
        cleanClause.includes('kirana') ||
        cleanClause.includes('cloth') ||
        cleanClause.includes('saree') ||
        cleanClause.includes('shirt');

      if (hasExpenseCategory && !hasSaleCategory) {
        type = 'expense';
      } else if (hasSaleCategory && !hasExpenseCategory) {
        type = 'sale';
      } else {
        // Insufficient contextual evidence to determine sale vs expense
        const amt = extractAmount(clause);
        const formatted = amt ? `₹${amt.toLocaleString('en-IN')}` : 'this amount';
        return {
          success: false,
          transactions: [],
          isAmbiguous: true,
          message: `I have the amount ${formatted}, but I’m not sure whether this is a sale or an expense. Please tell me what it was for.`,
        };
      }
    }

    // 3. Extract Category
    const category = extractCategory(clause, type);

    // 4. Extract Date (Clause date or global shared date)
    const date = extractDate(clause, globalDate);

    // 5. Extract Customer / Supplier
    const customerName = extractCustomerName(clause);

    // 6. Check if approximate
    const approximate = isApproximateAmount(clause);

    // 7. Assemble Draft
    const draft = {
      id: `draft-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      amount,
      category,
      date,
      customerName,
      note: 'Voice entry',
      ...(approximate ? { approximate: true } : {}),
    };

    transactions.push(draft);
  }

  // Handle case: At least one transaction detected, but another clause lacked an amount (Requirement 5)
  if (transactions.length > 0 && incompleteClauses.length > 0) {
    const missingDesc = incompleteClauses[0].missingPurpose;
    const firstTx = transactions[0];
    const clarification = `I understood the ₹${firstTx.amount} ${firstTx.type}, but I need the amount for the ${missingDesc}.`;

    return {
      success: true,
      transactions,
      clarification,
    };
  }

  // Handle case: Transactions successfully parsed
  if (transactions.length > 0) {
    return {
      success: true,
      transactions,
    };
  }

  // Handle case: Action detected but missing amount (no transactions created)
  if (incompleteClauses.length > 0) {
    return {
      success: false,
      transactions: [],
      message: "Could not detect an amount. Please specify the amount, for example: '₹500' or '500 rupees'.",
    };
  }

  // Fallback clarification
  return {
    success: false,
    transactions: [],
    message: "Please say whether this was a sale or an expense, for example: 'I sold vegetables for ₹500' or 'I spent ₹500 on transport.'",
  };
}

/**
 * Backward-compatible single-transaction parser wrapper (Phase 3B compatible).
 */
export function parseVoiceTransaction(transcript) {
  const result = parseVoiceTransactions(transcript);
  if (result.success && result.transactions && result.transactions.length > 0) {
    return {
      success: true,
      transaction: result.transactions[0],
      transactions: result.transactions,
      clarification: result.clarification,
    };
  }

  return {
    success: false,
    message: result.message || result.clarification || "Could not parse transaction.",
  };
}

export default parseVoiceTransactions;
