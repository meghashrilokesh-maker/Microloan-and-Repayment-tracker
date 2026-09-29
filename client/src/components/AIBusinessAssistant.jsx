import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  X, 
  Bot, 
  User, 
  Clock, 
  Lightbulb, 
  Info, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { processBusinessQuery, detectIntent } from '../utils/businessAssistantEngine';
import { 
  startSpeechRecognition, 
  stopSpeechRecognition, 
  abortSpeechRecognition, 
  isSpeechRecognitionSupported 
} from '../utils/speechRecognition';
import { parseVoiceTransactions, extractAmount } from '../utils/voiceTransactionParser';

/**
 * Default prompt suggestions for quick business questions.
 */
const QUICK_SUGGESTIONS = [
  'How much did I earn from vegetables this month?',
  'How much loan do I still owe?',
  'Compare this month with last month',
  'Where am I spending the most?',
];

const INITIAL_WELCOME = 'Hi! I can help you with your sales, expenses, loans and reports.';

/**
 * Modular hook / service stub for future Phase integrations:
 * Can be replaced by or chained with external LLM services.
 */
export async function queryBusinessAssistant(userInput, context = {}) {
  return processBusinessQuery(userInput, context);
}

export function AIBusinessAssistant() {
  const {
    sales,
    expenses,
    loans,
    activeLoans,
    todaySalesTotal,
    todayExpensesTotal,
    todayRepaymentsTotal,
    moneyLeft,
    totalLoanRemaining,
    totalOriginalLoan,
    totalRepaidSoFar,
    nextRepaymentLoan,
    profile,
    openTransactionModal,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: INITIAL_WELCOME,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceErrorTimerRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking, isListening]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Abort speech recognition if assistant is closed
  useEffect(() => {
    if (!isOpen && recognitionRef.current) {
      abortSpeechRecognition(recognitionRef.current);
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        abortSpeechRecognition(recognitionRef.current);
      }
      if (voiceErrorTimerRef.current) {
        clearTimeout(voiceErrorTimerRef.current);
      }
    };
  }, []);

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Action handler: Review a transaction draft by opening the existing prefilled form (Phase 3C / 4A)
   */
  const handleReviewDraft = (msgId, draftId, draft) => {
    if (!draft) return;

    // Mark the specific draft as reviewed
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const updatedDrafts = (m.drafts || []).map((d) =>
          d.id === draftId ? { ...d, isReviewed: true } : d
        );
        return {
          ...m,
          drafts: updatedDrafts,
          isReviewed: m.draft?.id === draftId ? true : m.isReviewed,
        };
      })
    );

    // Open existing form modal prefilled via AppContext mechanism
    openTransactionModal({
      type: draft.type,
      initialValues: {
        amount: draft.amount,
        category: draft.category,
        date: draft.date,
        customerName: draft.customerName || '',
        note: draft.note || (draft.source === 'text' ? 'Text entry' : 'Voice entry'),
      },
      onSaved: (savedEntry) => {
        const typeLabel = draft.type === 'expense' ? 'Expense' : 'Sale';
        const formattedAmt = Number(savedEntry?.amount || draft.amount || 0).toLocaleString('en-IN');
        const successNotice = {
          id: `saved-ack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: 'assistant',
          text: `✓ ${typeLabel} of ₹${formattedAmt} recorded successfully.`,
          timestamp: formatCurrentTime(),
        };
        setMessages((prev) => {
          const updated = prev.map((m) => {
            if (m.id !== msgId) return m;
            const updatedDrafts = (m.drafts || []).map((d) =>
              d.id === draftId ? { ...d, isSaved: true, isReviewed: true } : d
            );
            return {
              ...m,
              drafts: updatedDrafts,
              draft: m.draft?.id === draftId ? { ...m.draft, isSaved: true, isReviewed: true } : m.draft,
            };
          });
          return [...updated, successNotice];
        });
      },
    });
  };

  /**
   * Action handler: Cancel and dismiss an individual transaction draft
   */
  const handleCancelDraft = (msgId, draftId) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const updatedDrafts = (m.drafts || []).filter((d) => d.id !== draftId);
        const allCancelled = updatedDrafts.length === 0;
        return {
          ...m,
          drafts: updatedDrafts,
          draft: m.draft?.id === draftId ? null : m.draft,
          text: allCancelled ? 'Transaction draft(s) cancelled.' : m.text,
        };
      })
    );
  };

  /**
   * Dispatches typed user message: checks for transaction entries vs business query intents
   */
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    // 1. Check if this is an explicit business question first (Phase 2A preservation)
    const queryIntent = detectIntent(query);
    const isExplicitBusinessQuestion = queryIntent !== 'UNKNOWN' && !extractAmount(query);

    if (!isExplicitBusinessQuestion) {
      // 2. Attempt to parse natural language transaction(s) (Phase 4A)
      const parsed = parseVoiceTransactions(query, { source: 'text' });

      if (parsed.success && parsed.transactions && parsed.transactions.length > 0) {
        setIsThinking(false);
        const count = parsed.transactions.length;
        let introText =
          count === 1
            ? `I've prepared a ${parsed.transactions[0].type === 'sale' ? 'Sale' : 'Expense'} draft:`
            : `I've prepared ${count} transaction drafts:`;

        if (parsed.clarification) {
          introText += `\n\n⚠️ ${parsed.clarification}`;
        }

        const assistantDraftReply = {
          id: `assistant-draft-${Date.now()}`,
          sender: 'assistant',
          text: introText,
          drafts: parsed.transactions,
          timestamp: formatCurrentTime(),
        };
        setMessages((prev) => [...prev, assistantDraftReply]);
        return;
      }

      if (parsed.isAmbiguous || (parsed.clarification && (!parsed.transactions || parsed.transactions.length === 0))) {
        setIsThinking(false);
        const assistantClarifyReply = {
          id: `assistant-clarify-${Date.now()}`,
          sender: 'assistant',
          text: parsed.message || parsed.clarification,
          timestamp: formatCurrentTime(),
        };
        setMessages((prev) => [...prev, assistantClarifyReply]);
        return;
      }
    }

    // 3. Fallback / Route to Business Knowledge Engine
    const financialSnapshot = {
      sales,
      expenses,
      loans,
      activeLoans,
      todaySalesTotal,
      todayExpensesTotal,
      todayRepaymentsTotal,
      moneyLeft,
      totalLoanRemaining,
      totalOriginalLoan,
      totalRepaidSoFar,
      nextRepaymentLoan,
      profile,
    };

    try {
      const result = await processBusinessQuery(query, financialSnapshot);
      setTimeout(() => {
        const assistantReply = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: result.reply,
          timestamp: formatCurrentTime(),
        };
        setMessages((prev) => [...prev, assistantReply]);
        setIsThinking(false);
      }, 350);
    } catch (_err) {
      setTimeout(() => {
        const fallbackReply = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: "I can currently help with your sales, expenses, balance, loans, and basic business suggestions.",
          timestamp: formatCurrentTime(),
        };
        setMessages((prev) => [...prev, fallbackReply]);
        setIsThinking(false);
      }, 300);
    }
  };

  /**
   * Native Web Speech API recognition handler with Phase 4A Multi-Transaction Draft Parsing
   */
  const handleMicClick = () => {
    // If currently listening, user tap cancels/stops listening
    if (isListening) {
      if (recognitionRef.current) {
        stopSpeechRecognition(recognitionRef.current);
      }
      setIsListening(false);
      return;
    }

    setVoiceError('');

    // Verify browser support
    if (!isSpeechRecognitionSupported()) {
      setVoiceError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or a browser with Web Speech API support, or type your message below.'
      );
      if (voiceErrorTimerRef.current) clearTimeout(voiceErrorTimerRef.current);
      voiceErrorTimerRef.current = setTimeout(() => setVoiceError(''), 5000);
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

        if (!transcript) return;

        // Display user voice transcript
        const voiceUserMessage = {
          id: `user-voice-${Date.now()}`,
          sender: 'user',
          text: transcript,
          timestamp: formatCurrentTime(),
          isVoice: true,
        };

        // 1. Check if this is an explicit spoken business query first
        const queryIntent = detectIntent(transcript);
        const isExplicitBusinessQuestion = queryIntent !== 'UNKNOWN' && !extractAmount(transcript);

        if (!isExplicitBusinessQuestion) {
          // 2. Parse voice transcript into structured Transaction Drafts (Phase 4A)
          const parsed = parseVoiceTransactions(transcript, { source: 'voice' });

          if (parsed.success && parsed.transactions && parsed.transactions.length > 0) {
            const count = parsed.transactions.length;
            let introText =
              count === 1
                ? `I've prepared a ${parsed.transactions[0].type === 'sale' ? 'Sale' : 'Expense'} draft from your voice input:`
                : `I've prepared ${count} transaction drafts from your voice input:`;

            if (parsed.clarification) {
              introText += `\n\n⚠️ ${parsed.clarification}`;
            }

            const assistantDraftReply = {
              id: `assistant-draft-${Date.now() + 1}`,
              sender: 'assistant',
              text: introText,
              drafts: parsed.transactions,
              timestamp: formatCurrentTime(),
            };
            setMessages((prev) => [...prev, voiceUserMessage, assistantDraftReply]);
            return;
          } else if (parsed.isAmbiguous) {
            const assistantClarifyReply = {
              id: `assistant-clarify-${Date.now() + 1}`,
              sender: 'assistant',
              text: `🎙️ Heard: "${transcript}"\n\n${parsed.message}`,
              timestamp: formatCurrentTime(),
            };
            setMessages((prev) => [...prev, voiceUserMessage, assistantClarifyReply]);
            return;
          }
        }

        // 3. Spoken Business Question: run through businessAssistantEngine
        const financialSnapshot = {
          sales,
          expenses,
          loans,
          activeLoans,
          todaySalesTotal,
          todayExpensesTotal,
          todayRepaymentsTotal,
          moneyLeft,
          totalLoanRemaining,
          totalOriginalLoan,
          totalRepaidSoFar,
          nextRepaymentLoan,
          profile,
        };

        processBusinessQuery(transcript, financialSnapshot).then((result) => {
          const assistantReply = {
            id: `assistant-${Date.now() + 1}`,
            sender: 'assistant',
            text: result.reply,
            timestamp: formatCurrentTime(),
          };
          setMessages((prev) => [...prev, voiceUserMessage, assistantReply]);
        }).catch(() => {
          const assistantClarifyReply = {
            id: `assistant-clarify-${Date.now() + 1}`,
            sender: 'assistant',
            text: `🎙️ Heard: "${transcript}"\n\nPlease say whether this was a sale or an expense, or ask about your sales, balance, or loans.`,
            timestamp: formatCurrentTime(),
          };
          setMessages((prev) => [...prev, voiceUserMessage, assistantClarifyReply]);
        });
      },
      onError: (err) => {
        setIsListening(false);
        recognitionRef.current = null;
        setVoiceError(err.message || 'Microphone error. Please try again or type your message.');
        if (voiceErrorTimerRef.current) clearTimeout(voiceErrorTimerRef.current);
        voiceErrorTimerRef.current = setTimeout(() => setVoiceError(''), 5000);
      },
      onEnd: () => {
        setIsListening(false);
        recognitionRef.current = null;
      },
    });

    recognitionRef.current = instance;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <>
      {/* 1. FLOATING AI ASSISTANT TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#566E54] hover:bg-[#465B44] text-white rounded-full shadow-soft-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border border-[#EBE3D7]/40 touch-press group"
          aria-label="Open Business Assistant"
          title="Open Business Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#FAF7F2] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#BF745F] rounded-full ring-2 ring-white" />
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-wide pr-0.5">
            Business Assistant
          </span>
        </button>
      )}

      {/* 2. ASSISTANT MODAL / PANEL */}
      {isOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-header-title"
          className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[420px] h-[540px] max-h-[82vh] bg-white rounded-3xl border border-[#EBE3D7] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#FAF7F2] border-b border-[#EBE3D7] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E9EFE8] border border-[#D3DFD2] text-[#425541] flex items-center justify-center shadow-pastel">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 
                    id="assistant-header-title"
                    className="font-serif font-bold text-sm sm:text-base text-[#2D2825]"
                  >
                    Business Assistant
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2]">
                    {isListening ? 'Listening...' : 'Phase 5'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7C746F]">
                  Voice & live business knowledge
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-[#7C746F] hover:text-[#2D2825] hover:bg-[#EBE3D7]/60 transition"
              aria-label="Close Assistant"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FCFAF7]">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const activeDrafts = msg.drafts || (msg.draft ? [msg.draft] : []);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft whitespace-pre-line ${
                        isAssistant
                          ? 'bg-white text-[#2D2825] border border-[#EBE3D7] rounded-tl-xs'
                          : 'bg-[#566E54] text-white rounded-tr-xs'
                      }`}
                    >
                      {msg.isVoice && (
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] text-[#E9EFE8] mr-1 pb-0.5">
                          <Mic className="w-3 h-3 inline" /> Voice:
                        </span>
                      )}
                      {msg.text}

                      {/* Phase 4A: Structured Transaction Draft Cards (Single or Multiple) */}
                      {activeDrafts.length > 0 && (
                        <div className="mt-3 space-y-2.5">
                          {activeDrafts.map((draft, dIdx) => {
                            const draftId = draft.id || `draft-${msg.id}-${dIdx}`;
                            return (
                              <div
                                key={draftId}
                                className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7] shadow-soft space-y-2 text-xs text-[#2D2825]"
                              >
                                {/* Card Header & Type Badge */}
                                <div className="flex items-center justify-between border-b border-[#EBE3D7]/70 pb-2">
                                  <div className="flex items-center gap-1.5 font-bold">
                                    {draft.type === 'sale' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2]">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Sale Draft
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F8ECE6] text-[#BF745F] border border-[#F0D7CD]">
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        Expense Draft
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#7C746F] font-semibold">
                                    {draft.isSaved
                                      ? 'Saved'
                                      : draft.isReviewed
                                      ? 'Under Review'
                                      : 'Draft Ready'}
                                  </span>
                                </div>

                                {/* Card Fields */}
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#7C746F]">Amount:</span>
                                    <span className="font-serif font-bold text-sm text-[#2D2825]">
                                      ₹{Number(draft.amount || 0).toLocaleString('en-IN')}
                                      {draft.approximate ? (
                                        <span className="ml-1 text-[10px] text-[#A09891] font-normal italic">
                                          (approx)
                                        </span>
                                      ) : null}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-[#7C746F]">Category:</span>
                                    <span className="font-semibold text-[#48433F]">{draft.category}</span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-[#7C746F]">Date:</span>
                                    <span className="font-medium text-[#605955]">{draft.date}</span>
                                  </div>

                                  {draft.customerName ? (
                                    <div className="flex items-center justify-between">
                                      <span className="text-[#7C746F]">
                                        {draft.type === 'sale' ? 'Customer:' : 'Supplier:'}
                                      </span>
                                      <span className="font-semibold text-[#2D2825]">{draft.customerName}</span>
                                    </div>
                                  ) : null}

                                  <div className="flex items-center justify-between">
                                    <span className="text-[#7C746F]">Note:</span>
                                    <span className="font-medium text-[#7C746F] italic">{draft.note}</span>
                                  </div>
                                </div>

                                {/* Card Actions (Review / Cancel) */}
                                {draft.isSaved ? (
                                  <div className="mt-2 pt-2 border-t border-[#EBE3D7]/70 flex items-center justify-between text-[11px] font-semibold text-[#566E54] bg-[#E9EFE8]/50 p-2 rounded-xl">
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-[#566E54] shrink-0" />
                                      <span>Recorded successfully in records</span>
                                    </div>
                                  </div>
                                ) : draft.isReviewed ? (
                                  <div className="mt-2 pt-2 border-t border-[#EBE3D7]/70 flex items-center justify-between text-[11px] font-semibold text-[#566E54] bg-[#E9EFE8]/50 p-2 rounded-xl">
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-[#566E54] shrink-0" />
                                      <span>Form opened. Review & click Save.</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleReviewDraft(msg.id, draftId, draft)}
                                      className="text-[10px] text-[#425541] font-bold underline hover:no-underline ml-1 shrink-0"
                                    >
                                      Re-open
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-2.5 pt-2 border-t border-[#EBE3D7]/70 flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCancelDraft(msg.id, draftId)}
                                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#7C746F] hover:text-[#2D2825] hover:bg-[#F3EDE3] border border-[#EBE3D7] transition touch-press"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReviewDraft(msg.id, draftId, draft)}
                                      className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#566E54] hover:bg-[#465B44] transition shadow-soft touch-press"
                                    >
                                      Review
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A09891] mt-1 px-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-[#F8ECE6] text-[#BF745F] border border-[#EED7CE] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Typing state indicator */}
            {isThinking && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-[#EBE3D7] rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-soft flex items-center gap-1.5 text-xs text-[#7C746F]">
                  <span className="w-1.5 h-1.5 bg-[#7C746F] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#7C746F] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#7C746F] rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Checking records...</span>
                </div>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C746F] mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-[#BF745F]" />
                <span>Try asking:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={isThinking || isListening}
                    className="text-left text-xs bg-white hover:bg-[#F3EDE3] active:bg-[#EAE0D1] disabled:opacity-50 text-[#48433F] border border-[#EBE3D7] rounded-full px-3 py-1.5 transition shadow-soft touch-press"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Indicator Banner */}
          {isListening && (
            <div className="px-4 py-2.5 bg-[#F8ECE6] border-t border-[#EED7CE] text-[#874937] text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BF745F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BF745F]"></span>
                </span>
                <span className="font-bold text-[#BF745F]">Listening... Speak clearly</span>
              </div>
              <span className="text-[10px] text-[#A65B46] italic">
                e.g. "Today I sold vegetables for 800 and spent 200 on transport"
              </span>
            </div>
          )}

          {/* Voice Error Notification Banner */}
          {voiceError && (
            <div className="px-4 py-2.5 bg-[#FDF2F0] border-t border-[#F5C2B8] text-[#874937] text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pr-2">
                <AlertCircle className="w-4 h-4 text-[#BF745F] shrink-0" />
                <span className="text-[11px] leading-tight">{voiceError}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceError('')}
                className="text-[#874937] hover:text-[#2D2825] text-xs font-bold p-1 shrink-0"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input & Action Bar */}
          <form 
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-[#EBE3D7] flex items-center gap-2 shrink-0"
          >
            {/* Microphone Button (Native Speech Recognition) */}
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isThinking}
              className={`p-2.5 rounded-full transition active:scale-95 touch-press shrink-0 ${
                isListening
                  ? 'bg-[#BF745F] text-white shadow-soft animate-pulse ring-4 ring-[#BF745F]/30'
                  : 'text-[#7C746F] hover:text-[#BF745F] hover:bg-[#F8ECE6]'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              title={isListening ? 'Listening... Click to stop' : 'Start voice input (Speech-to-text)'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to speech...' : 'Type or speak: sales, expenses, loans...'}
              className="flex-1 text-xs sm:text-sm bg-[#FAF7F2] border border-[#EBE3D7] rounded-full px-3.5 py-2 text-[#2D2825] placeholder:text-[#A09891] focus:outline-none focus:border-[#566E54] focus:ring-1 focus:ring-[#566E54] transition"
              disabled={isThinking || isListening}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking || isListening}
              className="p-2.5 bg-[#566E54] hover:bg-[#465B44] disabled:opacity-40 disabled:hover:bg-[#566E54] text-white rounded-full transition shadow-soft touch-press shrink-0"
              aria-label="Send message"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="px-4 py-1.5 bg-[#FAF7F2] border-t border-[#EBE3D7] flex items-center justify-center gap-1 text-[10px] text-[#7C746F]">
            <Info className="w-3 h-3 text-[#A09891]" />
            <span>Business Intelligence & Voice • Phase 5</span>
          </div>
        </div>
      )}
    </>
  );
}

export default AIBusinessAssistant;
