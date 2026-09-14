import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Mic, 
  Calendar, 
  Trash2, 
  Filter, 
  Tag, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AddSaleModal } from '../components/TransactionModals';

export default function SalesScreen() {
  const { 
    t, 
    sales, 
    todaySalesTotal, 
    deleteTransaction 
  } = useApp();

  const [addSaleOpen, setAddSaleOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Compute Week & Month sales
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const weeklySalesTotal = sales
    .filter(s => new Date(s.date) >= oneWeekAgo)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const monthlySalesTotal = sales
    .filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const categories = ['All', 'Vegetables', 'Fruits', 'Street Food', 'Grocery', 'Clothing', 'Other'];

  const filteredSales = sales.filter((sale) => {
    if (selectedCategory === 'All') return true;
    return sale.category === selectedCategory;
  });

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header Banner featuring Tea Vendor picture seamlessly blended */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-soft flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-100/70 px-2 py-0.5 rounded-md">
            Earnings & Revenue
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1">
            {t.salesTracker}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Record every sale easily with touch or voice
          </p>
        </div>
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/70 p-1 shrink-0 flex items-center justify-center border border-emerald-100">
          <img 
            src="/images/vendor-tea.jpg" 
            alt="Tea Vendor" 
            className="w-full h-full object-contain vendor-photo-blend"
          />
        </div>
      </div>

      {/* 3 Summary Cards (Today, This Week, This Month) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">{t.todayTotal}</span>
          <span className="font-display font-bold text-base sm:text-lg text-emerald-700">
            ₹{todaySalesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">{t.weekTotal}</span>
          <span className="font-display font-bold text-base sm:text-lg text-slate-800">
            ₹{weeklySalesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">{t.monthTotal}</span>
          <span className="font-display font-bold text-base sm:text-lg text-slate-800">
            ₹{monthlySalesTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Category Pills & Add Sale Button */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-soft'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat === 'All' ? 'All' : cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddSaleOpen(true)}
          className="shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addSale}</span>
        </button>
      </div>

      {/* Sales Transactions List */}
      {filteredSales.length > 0 ? (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-2 divide-y divide-slate-100">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-500 font-semibold">
            <span>{filteredSales.length} Entries Recorded</span>
            <span>Sorted by Most Recent</span>
          </div>

          {filteredSales.map((sale) => (
            <div key={sale.id} className="pt-3 pb-1 flex items-center justify-between gap-2 group">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">
                      {sale.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {sale.date} {sale.time ? `• ${sale.time}` : ''}
                    </span>
                  </div>
                  {sale.note && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px] sm:max-w-xs">
                      {sale.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-sm sm:text-base text-emerald-700">
                  +₹{Number(sale.amount).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteTransaction('sale', sale.id)}
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
          <div className="w-20 h-20 rounded-full bg-emerald-50 mx-auto flex items-center justify-center p-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900">
            No sales recorded today
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {t.addFirstSale}
          </p>
          <button
            onClick={() => setAddSaleOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition"
          >
            + {t.addSale}
          </button>
        </div>
      )}

      {/* Modals */}
      <AddSaleModal isOpen={addSaleOpen} onClose={() => setAddSaleOpen(false)} />
    </div>
  );
}
