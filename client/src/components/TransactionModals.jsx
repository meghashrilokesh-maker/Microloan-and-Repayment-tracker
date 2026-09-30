import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  Mic, 
  Check, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  stopSpeechRecognition, 
  abortSpeechRecognition 
} from '../utils/speechRecognition';

// Word-to-number mapping for Indian and English spoken amounts
const WORD_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  lakh: 100000, lakhs: 100000, lac: 100000, lacs: 100000, k: 1000
};

/**
 * Intelligent parser for Indian vendor sales speech.
 * Extracts: numeric amount (digits or spoken words), category, customer/party name, and note.
 */
export function parseSalesSpeech(transcript) {
  if (!transcript || typeof transcript !== 'string') return null;
  const raw = transcript.trim();
  const lower = raw.toLowerCase();

  // 1. Amount extraction
  let detectedAmount = null;

  // Pattern A: Direct digits (e.g. 500, ₹2000, 150.50, 400 rs, rs. 1200, 2,500)
  const digitRegex = /(?:₹|rs\.?|rupees?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:₹|rs\.?|rupees?|inr)?/i;
  const matchDigits = lower.match(digitRegex);
  if (matchDigits && matchDigits[1]) {
    const val = parseFloat(matchDigits[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      detectedAmount = val;
    }
  }

  // Pattern B: Spoken words into numbers (e.g. "five hundred", "two thousand", "three hundred fifty")
  if (!detectedAmount) {
    const tokens = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
    let current = 0;
    let total = 0;
    let hasNumberWords = false;

    for (const token of tokens) {
      if (WORD_NUMBERS[token] !== undefined) {
        hasNumberWords = true;
        const val = WORD_NUMBERS[token];
        if (val === 100) {
          current = (current === 0 ? 1 : current) * 100;
        } else if (val === 1000 || val === 100000) {
          current = (current === 0 ? 1 : current) * val;
          total += current;
          current = 0;
        } else {
          current += val;
        }
      }
    }
    total += current;
    if (hasNumberWords && total > 0) {
      detectedAmount = total;
    }
  }

  // 2. Category extraction
  let detectedCategory = 'Vegetables';
  if (/vegetable|sabzi|sabji|aloo|pyaz|tomato|potato|onion|spinach|palak|bhindi|gobi|mirchi/i.test(lower)) {
    detectedCategory = 'Vegetables';
  } else if (/fruit|fal|apple|banana|mango|orange|kela|seb|grapes|papaya|chiku|watermelon/i.test(lower)) {
    detectedCategory = 'Fruits';
  } else if (/street\s*food|food|snack|chai|tea|samosa|chaat|coffee|dosa|idli|vada|pakoda|kachori|pani\s*puri/i.test(lower)) {
    detectedCategory = 'Street Food';
  } else if (/grocery|kirana|ration|dal|rice|oil|sugar|atta|wheat|flour|soap|milk|curd|doodh/i.test(lower)) {
    detectedCategory = 'Grocery';
  } else if (/cloth|kapda|shirt|pant|saree|suit|dress|towel|fabric|kurta/i.test(lower)) {
    detectedCategory = 'Clothing';
  } else if (/other|flower|phool|garland|pooja|puja|plastic|bag|stationery/i.test(lower)) {
    detectedCategory = 'Other';
  }

  // 3. Customer name extraction
  let detectedCustomer = '';
  const partyMatch = lower.match(/(?:to|from|for|customer|bhai|ji|seth)\s+([a-z]+)/i);
  if (partyMatch && partyMatch[1]) {
    const candidate = partyMatch[1];
    const excluded = [
      'rupee', 'rupees', 'rs', 'cash', 'upi', 'sale', 'today', 'fresh', 'my', 'the',
      'vegetable', 'fruit', 'five', 'hundred', 'thousand', 'kilo', 'kg', 'packet', 'gram'
    ];
    if (!excluded.includes(candidate.toLowerCase()) && candidate.length >= 3) {
      detectedCustomer = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  return {
    amount: detectedAmount ? String(detectedAmount) : '',
    category: detectedCategory,
    customerName: detectedCustomer,
    spokenText: `"${raw}"`,
    note: raw
  };
}

export function AddSaleModal({ isOpen, onClose, initialValues = null, onSaved = null }) {
  const { t, addSale } = useApp();
  const [amount, setAmount] = useState(() => (initialValues?.amount !== undefined && initialValues?.amount !== null ? String(initialValues.amount) : ''));
  const [customerName, setCustomerName] = useState(() => initialValues?.customerName || '');
  const [category, setCategory] = useState(() => initialValues?.category || 'Vegetables');
  const [date, setDate] = useState(() => initialValues?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(() => initialValues?.note || '');

  // Synchronize initialValues when modal opens or initialValues change, and reset cleanly on close
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setAmount(initialValues.amount !== undefined && initialValues.amount !== null ? String(initialValues.amount) : '');
        setCustomerName(initialValues.customerName || '');
        setCategory(initialValues.category || 'Vegetables');
        setDate(initialValues.date || new Date().toISOString().split('T')[0]);
        setNote(initialValues.note || '');
      } else {
        setAmount('');
        setCustomerName('');
        setCategory('Vegetables');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
      }
    } else {
      setAmount('');
      setCustomerName('');
      setCategory('Vegetables');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
  }, [isOpen, initialValues]);

  // Real voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState(null); // { amount, category, customerName, spokenText, note }
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const voiceErrorTimerRef = useRef(null);

  // Component unmount / modal close cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        abortSpeechRecognition(recognitionRef.current);
        recognitionRef.current = null;
      }
      if (voiceErrorTimerRef.current) {
        clearTimeout(voiceErrorTimerRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  const categories = [
    { id: 'Vegetables', label: t.catVegetables },
    { id: 'Fruits', label: t.catFruits },
    { id: 'Street Food', label: t.catStreetFood },
    { id: 'Grocery', label: t.catGrocery },
    { id: 'Clothing', label: t.catClothing },
    { id: 'Other', label: t.catOther },
  ];

  // Toggle real voice listening session
  const handleToggleVoice = () => {
    // If currently listening, tap stops recognition
    if (isListening) {
      if (recognitionRef.current) {
        stopSpeechRecognition(recognitionRef.current);
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    setVoiceError('');

    // Check browser Web Speech API availability
    if (!isSpeechRecognitionSupported()) {
      setVoiceError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or enter details manually below.'
      );
      if (voiceErrorTimerRef.current) clearTimeout(voiceErrorTimerRef.current);
      voiceErrorTimerRef.current = setTimeout(() => setVoiceError(''), 6000);
      return;
    }

    // Launch speech recognition session (en-IN)
    const instance = startSpeechRecognition({
      lang: 'en-IN',
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript) => {
        setIsListening(false);
        recognitionRef.current = null;
        if (!transcript || !transcript.trim()) return;

        // Parse transcript into sales draft
        const draft = parseSalesSpeech(transcript);
        if (draft) {
          setVoiceDraft(draft);
        }
      },
      onError: (err) => {
        setIsListening(false);
        recognitionRef.current = null;
        setVoiceError(err.message || 'Speech recognition error. Please try again.');
        if (voiceErrorTimerRef.current) clearTimeout(voiceErrorTimerRef.current);
        voiceErrorTimerRef.current = setTimeout(() => setVoiceError(''), 5000);
      },
      onEnd: () => {
        setIsListening(false);
        recognitionRef.current = null;
      }
    });

    if (instance) {
      recognitionRef.current = instance;
    }
  };

  const applyVoiceDraft = () => {
    if (voiceDraft) {
      if (voiceDraft.amount) {
        setAmount(String(voiceDraft.amount));
      }
      if (voiceDraft.category) {
        setCategory(voiceDraft.category);
      }
      if (voiceDraft.customerName) {
        setCustomerName(voiceDraft.customerName);
      }
      setNote(voiceDraft.note || 'Recorded via voice assistant');
      setVoiceDraft(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    try {
      const savedEntry = await addSale({ amount: Number(amount), category, customerName, date, note });
      setAmount('');
      setCustomerName('');
      setNote('');
      if (onSaved) {
        onSaved(savedEntry || { type: 'sale', amount: Number(amount), category, customerName, date, note });
      }
      onClose();
    } catch (_err) {
      // Toast already shown in context
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[#EBE3D7]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2D2825]">{t.addSale}</h2>
              <p className="text-[11px] text-[#7C746F]">Record incoming money from customers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
          >
            ✕
          </button>
        </div>

        {/* Voice Entry Button Card */}
        <div className="mt-4 p-3.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-soft transition active:scale-95 touch-press ${
                  isListening 
                    ? 'bg-[#BF745F] animate-pulse ring-4 ring-[#F0D7CD]' 
                    : 'bg-[#566E54] hover:bg-[#425541]'
                }`}
                title={isListening ? 'Tap to stop listening' : 'Tap to speak sale details'}
              >
                <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
              <div>
                <span className="text-xs font-bold text-[#2D2825] block">
                  {isListening ? 'Listening... Speak now' : (t.speakSale || 'Speak to Record Sale')}
                </span>
                <span className="text-[10px] text-[#7C746F]">
                  {isListening ? 'Say amount, category, or customer (e.g. "500 rupees vegetables")' : (t.speakPrompt || 'e.g. "Today\'s sale 500 rupees vegetables to Ramesh"')}
                </span>
              </div>
            </div>

            {isListening && (
              <span className="px-2 py-0.5 rounded-full bg-[#FAEEF0] text-[#8A3846] border border-[#F4DBDF] text-[10px] font-bold animate-pulse">
                REC
              </span>
            )}
          </div>

          {/* Voice Error Notice */}
          {voiceError && (
            <div className="p-2.5 rounded-xl bg-[#FAEEF0] border border-[#F4DBDF] text-xs font-semibold text-[#8A3846] flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}
        </div>

        {/* Voice confirmation dialog: Shows transcript and extracted fields for user review */}
        {voiceDraft && (
          <div className="mt-3 p-3.5 bg-[#FBF5F0] border border-[#F0D7CD] rounded-2xl animate-in fade-in space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#874937]">
                <Sparkles className="w-4 h-4 text-[#BF745F]" />
                <span>Detected Voice Input</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceDraft(null)}
                className="text-xs text-[#7C746F] hover:text-[#2D2825]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#605955] italic bg-white/80 p-2 rounded-xl border border-[#EBE3D7]">
              {voiceDraft.spokenText}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F0D7CD] text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#566E54] block">
                  Amount: {voiceDraft.amount ? `₹${voiceDraft.amount}` : 'Not detected'} • {voiceDraft.category}
                </span>
                {voiceDraft.customerName && (
                  <span className="text-[11px] text-[#7C746F] block">
                    Customer: <strong>{voiceDraft.customerName}</strong>
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setVoiceDraft(null)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#7C746F] font-medium"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={applyVoiceDraft}
                  className="px-3.5 py-1 rounded-full text-[11px] bg-[#566E54] hover:bg-[#425541] text-white font-bold shadow-pastel touch-press"
                >
                  Confirm & Fill
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.amount} (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-serif font-bold text-lg text-[#566E54]">₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xl font-serif font-bold text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                required
                autoFocus
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(prev => String(Number(prev || 0) + q))}
                  className="px-3 py-1 text-xs rounded-full bg-[#FAF7F2] hover:bg-[#E9EFE8] hover:text-[#425541] border border-[#EBE3D7] font-semibold text-[#605955] transition touch-press"
                >
                  +₹{q}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
              {t.category}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition touch-press ${
                      isSelected
                        ? 'bg-[#566E54] text-white shadow-soft font-semibold'
                        : 'bg-[#FAF7F2] hover:bg-[#F3EDE3] text-[#605955] border border-[#EBE3D7]'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.date}
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#6B8569] outline-none text-[#2D2825]"
                required
              />
            </div>
          </div>

          {/* Customer / Counterparty (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              Customer / Counterparty (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Ravi Stores, Ramesh, Walk-in"
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#6B8569] outline-none text-[#2D2825]"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.note}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Afternoon rush, UPI from Ramesh"
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#6B8569] outline-none text-[#2D2825]"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-bold text-sm shadow-pastel active:scale-98 transition flex items-center justify-center gap-2 touch-press"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveSale}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddExpenseModal({ isOpen, onClose, initialValues = null, onSaved = null }) {
  const { t, addExpense } = useApp();
  const [amount, setAmount] = useState(() => (initialValues?.amount !== undefined && initialValues?.amount !== null ? String(initialValues.amount) : ''));
  const [customerName, setCustomerName] = useState(() => initialValues?.customerName || '');
  const [category, setCategory] = useState(() => initialValues?.category || 'Stock / Purchases');
  const [date, setDate] = useState(() => initialValues?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(() => initialValues?.note || '');

  // Synchronize initialValues when modal opens or initialValues change, and reset cleanly on close
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setAmount(initialValues.amount !== undefined && initialValues.amount !== null ? String(initialValues.amount) : '');
        setCustomerName(initialValues.customerName || '');
        setCategory(initialValues.category || 'Stock / Purchases');
        setDate(initialValues.date || new Date().toISOString().split('T')[0]);
        setNote(initialValues.note || '');
      } else {
        setAmount('');
        setCustomerName('');
        setCategory('Stock / Purchases');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
      }
    } else {
      setAmount('');
      setCustomerName('');
      setCategory('Stock / Purchases');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const categories = [
    { id: 'Stock / Purchases', label: t.catStock },
    { id: 'Transport', label: t.catTransport },
    { id: 'Shop Rent', label: t.catRent },
    { id: 'Electricity / Bills', label: t.catElectricity },
    { id: 'Food & Tea', label: t.catFood },
    { id: 'Other', label: t.catOther },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    try {
      const savedEntry = await addExpense({ amount: Number(amount), category, customerName, date, note });
      setAmount('');
      setCustomerName('');
      setNote('');
      if (onSaved) {
        onSaved(savedEntry || { type: 'expense', amount: Number(amount), category, customerName, date, note });
      }
      onClose();
    } catch (_err) {
      // Toast already shown in context
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[#EBE3D7]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F8ECE6] text-[#BF745F] border border-[#F0D7CD] flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2D2825]">{t.addExpense}</h2>
              <p className="text-[11px] text-[#7C746F]">Record vendor spending & purchase costs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.amount} (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-serif font-bold text-lg text-[#BF745F]">₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xl font-serif font-bold text-[#2D2825] focus:bg-white focus:border-[#BF745F] outline-none transition"
                required
                autoFocus
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(prev => String(Number(prev || 0) + q))}
                  className="px-3 py-1 text-xs rounded-full bg-[#FAF7F2] hover:bg-[#F8ECE6] hover:text-[#874937] border border-[#EBE3D7] font-semibold text-[#605955] transition touch-press"
                >
                  +₹{q}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
              {t.category}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition touch-press ${
                      isSelected
                        ? 'bg-[#BF745F] text-white shadow-soft font-semibold'
                        : 'bg-[#FAF7F2] hover:bg-[#F3EDE3] text-[#605955] border border-[#EBE3D7]'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.date}
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#BF745F] outline-none text-[#2D2825]"
                required
              />
            </div>
          </div>

          {/* Supplier / Store (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              Supplier / Store (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. APMC Mandi, Wholesale Vendor"
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#BF745F] outline-none text-[#2D2825]"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.note}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Mandi vegetable crate, tempo auto fair"
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#BF745F] outline-none text-[#2D2825]"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-sm shadow-pastel-terracotta active:scale-98 transition flex items-center justify-center gap-2 touch-press"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveExpense}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddLoanModal({ isOpen, onClose }) {
  const { t, addLoan } = useApp();

  const [formData, setFormData] = useState(() => ({
    name: '',
    lender: '',
    amount: '',
    repaymentAmount: '',
    frequency: 'Daily',
    firstDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    finalDueDate: '',
    notes: ''
  }));

  if (!isOpen) return null;

  const loanAmountNum = Number(formData.amount || 0);
  const repayAmountNum = Number(formData.repaymentAmount || (loanAmountNum ? Math.round(loanAmountNum / 30) : 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loanAmountNum || loanAmountNum <= 0) return;

    try {
      await addLoan({
        name: formData.name || 'Microcredit Account',
        lender: formData.lender || 'Local Bank',
        amount: loanAmountNum,
        repaymentAmount: repayAmountNum || 500,
        frequency: formData.frequency,
        firstDueDate: formData.firstDueDate,
        finalDueDate: formData.finalDueDate,
        notes: formData.notes
      });
      onClose();
    } catch (_err) {
      // Toast already shown in context
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[#EBE3D7]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F2F0F8] text-[#554C78] border border-[#E3DFEF] flex items-center justify-center font-bold">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2D2825]">{t.addLoan}</h2>
              <p className="text-[11px] text-[#7C746F]">Add microcredit or wholesale supplier advance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              Loan / Scheme Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. PM SVANidhi Loan, Mandi Credit"
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none text-[#2D2825]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.lender}
            </label>
            <input
              type="text"
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
              placeholder="e.g. SBI Bank, Murthy Wholesaler, SHG"
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none text-[#2D2825]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.originalLoan} (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-serif font-bold text-[#7C746F]">₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 20000"
                className="w-full pl-8 pr-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-sm font-serif font-bold text-[#2D2825] focus:bg-white focus:border-[#554C78] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                Repayment Amount (₹)
              </label>
              <input
                type="number"
                value={formData.repaymentAmount}
                onChange={(e) => setFormData({ ...formData, repaymentAmount: e.target.value })}
                placeholder="e.g. 1000"
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none text-[#2D2825]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {t.repaymentFrequency}
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none text-[#2D2825]"
              >
                <option value="Daily">{t.daily}</option>
                <option value="Weekly">{t.weekly}</option>
                <option value="Monthly">{t.monthly}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {t.firstDueDate}
              </label>
              <input
                type="date"
                value={formData.firstDueDate}
                onChange={(e) => setFormData({ ...formData, firstDueDate: e.target.value })}
                className="w-full px-2 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-[11px] font-medium focus:bg-white focus:border-[#554C78] outline-none text-[#2D2825]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {t.finalDueDate} (Optional)
              </label>
              <input
                type="date"
                value={formData.finalDueDate}
                onChange={(e) => setFormData({ ...formData, finalDueDate: e.target.value })}
                className="w-full px-2 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-[11px] font-medium focus:bg-white focus:border-[#554C78] outline-none text-[#2D2825]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.notes}
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. 7% subsidized interest rate"
              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none text-[#2D2825]"
            />
          </div>

          {/* Live Summary Card */}
          <div className="p-3.5 bg-[#F2F0F8]/80 border border-[#E3DFEF] rounded-2xl">
            <span className="text-[11px] font-bold text-[#554C78] uppercase tracking-wide">
              Live Summary
            </span>
            <div className="grid grid-cols-3 gap-2 mt-1.5 text-center">
              <div className="bg-white/90 p-2 rounded-xl border border-[#E3DFEF]/60">
                <span className="text-[10px] text-[#7C746F] block">Loan amount</span>
                <span className="text-xs font-bold text-[#2D2825]">₹{loanAmountNum.toLocaleString()}</span>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-[#E3DFEF]/60">
                <span className="text-[10px] text-[#7C746F] block">Already repaid</span>
                <span className="text-xs font-bold text-[#566E54]">₹0</span>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-[#E3DFEF]/60">
                <span className="text-[10px] text-[#7C746F] block">Remaining</span>
                <span className="text-xs font-bold text-[#554C78]">₹{loanAmountNum.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-full bg-[#554C78] hover:bg-[#3F3760] text-white font-bold text-sm shadow-soft active:scale-98 transition flex items-center justify-center gap-2 touch-press"
            >
              <Check className="w-4 h-4" />
              <span>Save Microloan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddRepaymentModal({ isOpen, onClose, defaultLoanId = null }) {
  const { t, loans, addRepayment, showToast } = useApp();
  const activeLoans = loans.filter(l => l.status !== 'Completed');

  const isFixedLoan = Boolean(defaultLoanId);
  const [selectedLoanId, setSelectedLoanId] = useState(() => defaultLoanId || (activeLoans[0]?.id || ''));
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('UPI');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleClose = () => {
    setAmount('');
    setNote('');
    setShowConfirm(false);
    setIsSubmitting(false);
    setSubmitError(null);
    onClose();
  };

  if (!isOpen) return null;

  const currentLoanId = isFixedLoan ? defaultLoanId : (selectedLoanId || activeLoans[0]?.id);
  const currentLoan = loans.find(l => l.id === currentLoanId) || activeLoans[0];
  const repayAmountNum = Number(amount || 0);
  const remainingAfterPayment = currentLoan ? Math.max(0, currentLoan.remainingAmount - repayAmountNum) : 0;
  const isOverpaying = currentLoan && repayAmountNum > currentLoan.remainingAmount;

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!repayAmountNum || repayAmountNum <= 0) {
      showToast('⚠ Please enter a valid repayment amount');
      return;
    }
    if (isOverpaying) {
      showToast(`⚠ ${t.overpaymentWarning}`);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmedPayment = async () => {
    if (isSubmitting || !currentLoan?.id) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await addRepayment({
        loanId: currentLoan.id,
        amount: repayAmountNum,
        date,
        method,
        note
      });

      if (res && (res.success || res.id || res.remainingAmount !== undefined)) {
        handleClose();
      } else {
        const msg = res?.error || 'Failed to record repayment';
        setSubmitError(msg);
        showToast(`⚠ ${msg}`);
      }
    } catch (err) {
      console.error('Repayment confirmation failed:', err);
      const msg = err.message || 'Failed to record repayment';
      setSubmitError(msg);
      showToast(`⚠ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[#EBE3D7]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F8ECE6] text-[#BF745F] border border-[#F0D7CD] flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2D2825]">{t.addRepayment}</h2>
              <p className="text-[11px] text-[#7C746F]">Record loan instalment payment</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
          >
            ✕
          </button>
        </div>

        {/* Confirmation State */}
        {showConfirm ? (
          <div className="py-4 space-y-4 text-center animate-in fade-in">
            <div className="w-14 h-14 bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2] rounded-full flex items-center justify-center mx-auto shadow-soft">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2825]">
                Confirm Repayment of ₹{repayAmountNum.toLocaleString()}?
              </h3>
              <p className="text-xs text-[#7C746F] mt-1">
                Towards: <strong>{currentLoan?.name}</strong> ({currentLoan?.lender})
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl text-xs space-y-1.5 text-left border border-[#EBE3D7]">
              <div className="flex justify-between text-[#7C746F]">
                <span>Current Balance:</span>
                <span className="font-semibold text-[#2D2825]">₹{currentLoan?.remainingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#566E54] font-bold">
                <span>Payment Amount:</span>
                <span>-₹{repayAmountNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#2D2825] font-bold border-t border-[#EBE3D7] pt-1.5">
                <span>Remaining After:</span>
                <span>₹{remainingAfterPayment.toLocaleString()}</span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-[#FAEEF0] border border-[#F4DBDF] rounded-2xl text-xs text-[#8A3846] font-medium text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#8A3846] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{submitError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-full border border-[#EBE3D7] text-xs font-semibold text-[#7C746F] hover:bg-[#FAF7F2] transition disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmedPayment}
                className="flex-1 py-3 rounded-full bg-[#566E54] hover:bg-[#425541] disabled:opacity-60 text-xs font-bold text-white shadow-pastel transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <span>Confirm & Record</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePreSubmit} className="space-y-4 mt-4">
            {/* Loan selector */}
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {isFixedLoan ? 'Loan' : 'Select Loan'}
              </label>
              {isFixedLoan ? (
                <div className="relative">
                  <select
                    disabled
                    value={currentLoan?.id || ''}
                    aria-label="Loan"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-semibold text-[#2D2825] cursor-not-allowed appearance-none opacity-100"
                  >
                    {currentLoan && (
                      <option value={currentLoan.id}>
                        {currentLoan.name} (Remaining: ₹{currentLoan.remainingAmount.toLocaleString()})
                      </option>
                    )}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#554C78] bg-[#F2F0F8] px-2 py-0.5 rounded-full border border-[#E3DFEF] pointer-events-none">
                    Locked
                  </span>
                </div>
              ) : (
                <select
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-semibold text-[#2D2825] focus:bg-white focus:border-[#BF745F] outline-none"
                >
                  {activeLoans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (Remaining: ₹{l.remainingAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Repayment Amount */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#48433F] mb-1">
                <span>{t.amount} (₹)</span>
                {currentLoan && (
                  <span className="text-[#7C746F]">
                    Instalment: ₹{currentLoan.repaymentAmount}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-serif font-bold text-lg text-[#BF745F]">₹</span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={currentLoan ? String(currentLoan.repaymentAmount) : "0"}
                  className={`w-full pl-9 pr-4 py-3 bg-[#FAF7F2] border rounded-2xl text-xl font-serif font-bold text-[#2D2825] focus:bg-white outline-none transition ${
                    isOverpaying ? 'border-[#D994A0] focus:border-[#C57180]' : 'border-[#EBE3D7] focus:border-[#BF745F]'
                  }`}
                  required
                  autoFocus
                />
              </div>

              {isOverpaying && (
                <p className="text-[11px] text-[#C57180] font-semibold mt-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {t.overpaymentWarning}
                </p>
              )}
            </div>

            {/* Live calculation banner */}
            {currentLoan && (
              <div className="p-3 bg-[#E9EFE8] rounded-2xl border border-[#D3DFD2] text-xs">
                <span className="font-semibold text-[#425541] block">
                  Loan remaining after this payment:
                </span>
                <span className="font-serif font-bold text-base text-[#314030]">
                  ₹{remainingAfterPayment.toLocaleString()}
                </span>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'Cash', 'Bank Transfer'].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition touch-press ${
                      method === m
                        ? 'bg-[#BF745F] text-white font-bold shadow-soft'
                        : 'bg-[#FAF7F2] text-[#605955] border border-[#EBE3D7] hover:bg-[#F3EDE3]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {t.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#BF745F] outline-none text-[#2D2825]"
                required
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {t.note}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. PhonePe receipt #9842"
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#BF745F] outline-none text-[#2D2825]"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isOverpaying}
                className="w-full py-3.5 px-4 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-sm shadow-pastel-terracotta active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-press"
              >
                <Check className="w-4 h-4" />
                <span>Review & Save Repayment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
