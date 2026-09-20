import React, { useState } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Trash2,
  Calendar,
  Filter 
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
    .filter(s => {
      const d = new Date(s.date);
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
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Banner featuring 2D Flower Vendor illustration seamlessly integrated */}
      <div className="relative overflow-hidden bg-[#FBF5F0] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EAE1D4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-24 w-40 h-52 bg-[#F8ECE6]/80 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-8 right-4 w-36 h-36 bg-[#F3EDE3]/70 rounded-full pointer-events-none -z-0" />

        <div className="z-10 text-center sm:text-left space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-[#874937] uppercase bg-[#F8ECE6] px-2.5 py-0.5 rounded-full border border-[#F0D7CD]">
            Outflow & Stock Purchases
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825]">
            {t.expenseTracker}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C746F] font-medium">
            Log mandi inventory crates, auto transport, stall rent & daily expenses
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

      {/* 2. Three Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0D7CD] shadow-soft text-center bg-[#FCF7F4]/60">
          <span className="text-xs font-semibold text-[#7C746F] block">{t.todayTotal}</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#BF745F] mt-1 block">
            ₹{todayExpensesTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#A65E4A] font-semibold mt-0.5 block">Today's total cost</span>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-xs font-semibold text-[#7C746F] block">{t.weekTotal}</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-1 block">
            ₹{weeklyExpensesTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#9A938E] font-medium mt-0.5 block">Last 7 days total</span>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-xs font-semibold text-[#7C746F] block">{t.monthTotal}</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-1 block">
            ₹{monthlyExpensesTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#9A938E] font-medium mt-0.5 block">Current month total</span>
        </div>
      </div>

      {/* 3. RESPONSIVE EXPENSES WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Category Filter Card & Add Expense Button */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#7C746F]" />
                <h3 className="font-serif font-bold text-sm text-[#2D2825]">
                  Expense Types
                </h3>
              </div>
              <span className="text-xs font-bold text-[#874937] bg-[#F8ECE6] px-2 py-0.5 rounded-full">
                {filteredExpenses.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {categories.map((c) => {
                const isSelected = selectedCategory === c.id;
                const count = c.id === 'All' ? expenses.length : expenses.filter(e => e.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 touch-press ${
                      isSelected
                        ? 'bg-[#BF745F] text-white shadow-soft font-bold'
                        : 'bg-[#FAF7F2] text-[#605955] hover:bg-[#F3EDE3] border border-[#EBE3D7]'
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#7C746F]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setAddExpenseOpen(true)}
              className="w-full py-3.5 px-4 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-serif font-bold text-xs shadow-pastel-terracotta transition active:scale-98 flex items-center justify-center gap-2 touch-press"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addExpense}</span>
            </button>
          </div>
        </div>

        {/* Right Column (8 cols): Expenses Ledger */}
        <div className="lg:col-span-8">
          {filteredExpenses.length > 0 ? (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3] text-xs text-[#7C746F] font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7C746F]" />
                  <span>Expenses Ledger ({selectedCategory})</span>
                </div>
                <span>Sorted by Most Recent</span>
              </div>

              <div className="divide-y divide-[#F3EDE3]">
                {filteredExpenses.map((exp) => (
                  <div key={exp.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#F8ECE6] text-[#BF745F] border border-[#F0D7CD] flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-soft">
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
                        {exp.note ? (
                          <p className="text-xs text-[#7C746F] mt-0.5">
                            {exp.note}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#9A938E] mt-0.5">
                            General store purchase
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#BF745F]">
                        -₹{Number(exp.amount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteTransaction('expense', exp.id)}
                        title="Delete entry"
                        className="opacity-70 hover:opacity-100 p-1.5 rounded-lg hover:bg-[#FAEEF0] text-[#C3B099] hover:text-[#BF745F] transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EBE3D7] shadow-soft text-center space-y-4">
              <div className="relative mx-auto flex items-center justify-center">
                <NaturalVendorImage 
                  type="flowers"
                  size="lg"
                  backdrop="blob"
                  backdropColor="terracotta"
                  alt="No expenses"
                />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2D2825]">
                No expenses found in {selectedCategory}
              </h3>
              <p className="text-xs text-[#7C746F] max-w-sm mx-auto">
                Log your daily purchases to accurately calculate how much money is left.
              </p>
              <button
                onClick={() => setAddExpenseOpen(true)}
                className="py-3 px-6 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-xs shadow-pastel-terracotta transition touch-press"
              >
                + {t.addExpense}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal isOpen={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
    </div>
  );
}
