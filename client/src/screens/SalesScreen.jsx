import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from '../components/NaturalVendorImage';
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
      {/* Header Banner featuring 2D Cotton Candy Street Vendor seamlessly integrated */}
      <div className="relative overflow-hidden bg-[#F7F3EB] rounded-3xl p-5 border border-[#EAE1D4] shadow-soft flex items-center justify-between gap-3">
        <div className="absolute top-0 right-12 w-32 h-44 bg-[#EAF0E9]/70 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-6 right-2 w-28 h-28 bg-[#FAEEF0]/60 rounded-full pointer-events-none -z-0" />

        <div className="z-10">
          <span className="text-[10px] font-bold tracking-wider text-[#425541] uppercase bg-[#E9EFE8] px-2.5 py-0.5 rounded-full border border-[#D3DFD2]">
            Earnings & Revenue
          </span>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-1.5">
            {t.salesTracker}
          </h1>
          <p className="text-xs text-[#7C746F] font-medium mt-0.5">
            Record every sale effortlessly with touch or quick log
          </p>
        </div>

        <div className="relative shrink-0 z-10">
          <NaturalVendorImage 
            type="cottoncandy"
            size="md"
            backdrop="arch"
            backdropColor="sage"
            showBotanical={true}
            alt="Street Vendor Illustration"
          />
        </div>
      </div>

      {/* 3 Summary Cards (Today, This Week, This Month) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3.5 border border-[#D3DFD2] shadow-soft text-center bg-[#F5F8F5]/50">
          <span className="text-[10px] font-semibold text-[#7C746F] block">{t.todayTotal}</span>
          <span className="font-serif font-bold text-base sm:text-lg text-[#566E54] mt-0.5 block">
            ₹{todaySalesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-[10px] font-semibold text-[#7C746F] block">{t.weekTotal}</span>
          <span className="font-serif font-bold text-base sm:text-lg text-[#2D2825] mt-0.5 block">
            ₹{weeklySalesTotal.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-[10px] font-semibold text-[#7C746F] block">{t.monthTotal}</span>
          <span className="font-serif font-bold text-base sm:text-lg text-[#2D2825] mt-0.5 block">
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 touch-press ${
                selectedCategory === cat
                  ? 'bg-[#566E54] text-white shadow-soft'
                  : 'bg-white text-[#7C746F] hover:bg-[#FAF7F2] border border-[#EBE3D7]'
              }`}
            >
              {cat === 'All' ? 'All' : cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddSaleOpen(true)}
          className="shrink-0 flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-bold text-xs shadow-pastel transition active:scale-95 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addSale}</span>
        </button>
      </div>

      {/* Sales Transactions List */}
      {filteredSales.length > 0 ? (
        <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft space-y-2 divide-y divide-[#F3EDE3]">
          <div className="flex items-center justify-between pb-2 text-xs text-[#7C746F] font-semibold">
            <span>{filteredSales.length} Entries Recorded</span>
            <span>Sorted by Most Recent</span>
          </div>

          {filteredSales.map((sale) => (
            <div key={sale.id} className="pt-3 pb-1 flex items-center justify-between gap-2 group">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#2D2825]">
                      {sale.category}
                    </span>
                    <span className="text-[10px] text-[#8E8681]">
                      {sale.date} {sale.time ? `• ${sale.time}` : ''}
                    </span>
                  </div>
                  {sale.note && (
                    <p className="text-[11px] text-[#7C746F] mt-0.5 truncate max-w-[180px] sm:max-w-xs">
                      {sale.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-serif font-bold text-sm sm:text-base text-[#566E54]">
                  +₹{Number(sale.amount).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteTransaction('sale', sale.id)}
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
              type="cottoncandy"
              size="lg"
              backdrop="blob"
              backdropColor="sage"
              alt="No sales"
            />
          </div>
          <h3 className="font-serif font-bold text-base text-[#2D2825]">
            No sales recorded today
          </h3>
          <p className="text-xs text-[#7C746F] max-w-xs mx-auto">
            {t.addFirstSale}
          </p>
          <button
            onClick={() => setAddSaleOpen(true)}
            className="py-2.5 px-6 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-bold text-xs shadow-pastel transition touch-press"
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
