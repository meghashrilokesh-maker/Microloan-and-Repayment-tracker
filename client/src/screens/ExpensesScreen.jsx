import React, { useState } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from '../components/NaturalVendorImage';
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
      {/* Header Banner featuring 2D Flower Vendor illustration seamlessly integrated */}
      <div className="relative overflow-hidden bg-[#FBF5F0] rounded-3xl p-5 border border-[#EAE1D4] shadow-soft flex items-center justify-between gap-3">
        <div className="absolute top-0 right-12 w-32 h-44 bg-[#F8ECE6]/80 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-6 right-2 w-28 h-28 bg-[#F3EDE3]/70 rounded-full pointer-events-none -z-0" />

        <div className="z-10">
          <span className="text-[10px] font-bold tracking-wider text-[#874937] uppercase bg-[#F8ECE6] px-2.5 py-0.5 rounded-full border border-[#F0D7CD]">
            Outflow & Purchases
          </span>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-1.5">
            {t.expenseTracker}
          </h1>
          <p className="text-xs text-[#7C746F] font-medium mt-0.5">
            Log inventory crates, mandi costs, transport, stall rent & bills
          </p>
        </div>

        <div className="relative shrink-0 z-10">
          <NaturalVendorImage 
            type="flowers"
            size="md"
            backdrop="arch"
            backdropColor="terracotta"
            showBotanical={true}
            alt="Flower Vendor Illustration"
          />
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3.5 border border-[#F0D7CD] shadow-soft text-center bg-[#FCF7F4]/50">
          <span className="text-[10px] font-semibold text-[#7C746F] block">{t.todayTotal}</span>
          <span className="font-serif font-bold text-base sm:text-lg text-[#BF745F] mt-0.5 block">
            ₹{todayExpensesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-[10px] font-semibold text-[#7C746F] block">{t.weekTotal}</span>
          <span className="font-serif font-bold text-base sm:text-lg text-[#2D2825] mt-0.5 block">
            ₹{weeklyExpensesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-[10px] font-semibold text-[#7C746F] block">{t.monthTotal}</span>
          <span className="font-serif font-bold text-base sm:text-lg text-[#2D2825] mt-0.5 block">
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 touch-press ${
                selectedCategory === c.id
                  ? 'bg-[#BF745F] text-white shadow-soft'
                  : 'bg-white text-[#7C746F] hover:bg-[#FAF7F2] border border-[#EBE3D7]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddExpenseOpen(true)}
          className="shrink-0 flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-xs shadow-pastel-terracotta transition active:scale-95 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Expense Transactions List */}
      {filteredExpenses.length > 0 ? (
        <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft space-y-2 divide-y divide-[#F3EDE3]">
          <div className="flex items-center justify-between pb-2 text-xs text-[#7C746F] font-semibold">
            <span>{filteredExpenses.length} Expenses Recorded</span>
            <span>Sorted by Most Recent</span>
          </div>

          {filteredExpenses.map((exp) => (
            <div key={exp.id} className="pt-3 pb-1 flex items-center justify-between gap-2 group">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F8ECE6] text-[#BF745F] border border-[#F0D7CD] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#2D2825]">
                      {exp.category}
                    </span>
                    <span className="text-[10px] text-[#8E8681]">
                      {exp.date} {exp.time ? `• ${exp.time}` : ''}
                    </span>
                  </div>
                  {exp.note && (
                    <p className="text-[11px] text-[#7C746F] mt-0.5 truncate max-w-[180px] sm:max-w-xs">
                      {exp.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-serif font-bold text-sm sm:text-base text-[#BF745F]">
                  -₹{Number(exp.amount).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteTransaction('expense', exp.id)}
                  title="Delete entry"
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#C3B099] hover:text-[#BF745F] transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 border border-[#EBE3D7] shadow-soft text-center space-y-3.5">
          <div className="relative mx-auto flex items-center justify-center">
            <NaturalVendorImage 
              type="flowers"
              size="lg"
              backdrop="blob"
              backdropColor="terracotta"
              alt="No expenses"
            />
          </div>
          <h3 className="font-serif font-bold text-base text-[#2D2825]">
            No expenses recorded today
          </h3>
          <p className="text-xs text-[#7C746F] max-w-xs mx-auto">
            Log your daily purchases to accurately calculate how much money is left.
          </p>
          <button
            onClick={() => setAddExpenseOpen(true)}
            className="py-2.5 px-6 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-xs shadow-pastel-terracotta transition touch-press"
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
