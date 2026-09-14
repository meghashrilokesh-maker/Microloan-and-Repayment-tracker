import React, { useState } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Truck, 
  Building2, 
  Zap, 
  Coffee, 
  HelpCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AddExpenseModal } from '../components/TransactionModals';

export default function ExpensesScreen() {
  const { 
    t, 
    expenses, 
    todayExpensesTotal, 
    deleteTransaction 
  } = useApp();

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Compute Week & Month expenses
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const weeklyExpensesTotal = expenses
    .filter(e => new Date(e.date) >= oneWeekAgo)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const monthlyExpensesTotal = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const categories = [
    { id: 'All', label: 'All' },
    { id: 'Stock / Purchases', label: t.catStock },
    { id: 'Transport', label: t.catTransport },
    { id: 'Shop Rent', label: t.catRent },
    { id: 'Electricity / Bills', label: t.catElectricity },
    { id: 'Food & Tea', label: t.catFood },
    { id: 'Other', label: t.catOther },
  ];

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedCategory === 'All') return true;
    return exp.category === selectedCategory;
  });

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header Banner featuring Flower Vendor picture */}
      <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-white rounded-3xl p-4 sm:p-5 border border-rose-100 shadow-soft flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-rose-800 uppercase bg-rose-100/70 px-2 py-0.5 rounded-md">
            Outflow & Purchases
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1">
            {t.expenseTracker}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Keep track of raw materials, stall rent, transport & bills
          </p>
        </div>
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/70 p-1 shrink-0 flex items-center justify-center border border-rose-100">
          <img 
            src="/images/vendor-flowers.jpg" 
            alt="Flower Vendor" 
            className="w-full h-full object-contain vendor-photo-blend"
          />
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-rose-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">{t.todayTotal}</span>
          <span className="font-display font-bold text-base sm:text-lg text-rose-700">
            ₹{todayExpensesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">{t.weekTotal}</span>
          <span className="font-display font-bold text-base sm:text-lg text-slate-800">
            ₹{weeklyExpensesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">{t.monthTotal}</span>
          <span className="font-display font-bold text-base sm:text-lg text-slate-800">
            ₹{monthlyExpensesTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Category Pills & Add Expense Button */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c.id
                  ? 'bg-rose-600 text-white shadow-soft'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddExpenseOpen(true)}
          className="shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-soft transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Expense Transactions List */}
      {filteredExpenses.length > 0 ? (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-2 divide-y divide-slate-100">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-500 font-semibold">
            <span>{filteredExpenses.length} Expenses Recorded</span>
            <span>Sorted by Most Recent</span>
          </div>

          {filteredExpenses.map((exp) => (
            <div key={exp.id} className="pt-3 pb-1 flex items-center justify-between gap-2 group">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {exp.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {exp.date} {exp.time ? `• ${exp.time}` : ''}
                    </span>
                  </div>
                  {exp.note && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px] sm:max-w-xs">
                      {exp.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-sm sm:text-base text-rose-700">
                  -₹{Number(exp.amount).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteTransaction('expense', exp.id)}
                  title="Delete entry"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-rose-50 mx-auto flex items-center justify-center p-2">
            <TrendingDown className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900">
            No expenses recorded today
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Log your daily purchases to accurately calculate how much money is left.
          </p>
          <button
            onClick={() => setAddExpenseOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-soft transition"
          >
            + {t.addExpense}
          </button>
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal isOpen={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
    </div>
  );
}
