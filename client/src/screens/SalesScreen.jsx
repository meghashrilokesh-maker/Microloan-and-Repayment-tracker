import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Trash2,
  Calendar,
  Filter
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
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Banner featuring 2D Street Vendor seamlessly integrated */}
      <div className="relative overflow-hidden bg-[#FAF4ED] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EAE1D4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-24 w-40 h-52 bg-[#EAF0E9]/70 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-8 right-4 w-36 h-36 bg-[#FAEEF0]/60 rounded-full pointer-events-none -z-0" />

        <div className="z-10 text-center sm:text-left space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-[#425541] uppercase bg-[#E9EFE8] px-2.5 py-0.5 rounded-full border border-[#D3DFD2]">
            Daily Earnings & Revenue
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825]">
            {t.salesTracker}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C746F] font-medium">
            Record every sale effortlessly with touch or voice assistant
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

      {/* 2. Three Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft text-center bg-[#F5F8F5]/60">
          <span className="text-xs font-semibold text-[#7C746F] block">{t.todayTotal}</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#566E54] mt-1 block">
            ₹{todaySalesTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#8EAA8C] font-semibold mt-0.5 block">Today's cash & UPI</span>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-xs font-semibold text-[#7C746F] block">{t.weekTotal}</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-1 block">
            ₹{weeklySalesTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#9A938E] font-medium mt-0.5 block">Last 7 days total</span>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft text-center">
          <span className="text-xs font-semibold text-[#7C746F] block">{t.monthTotal}</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-1 block">
            ₹{monthlySalesTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#9A938E] font-medium mt-0.5 block">Current month total</span>
        </div>
      </div>

      {/* 3. RESPONSIVE SALES WORKSPACE: Sidebar Filters + Main Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Category Filter Card & Action Button */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#7C746F]" />
                <h3 className="font-serif font-bold text-sm text-[#2D2825]">
                  Filter by Category
                </h3>
              </div>
              <span className="text-xs font-bold text-[#566E54] bg-[#E9EFE8] px-2 py-0.5 rounded-full">
                {filteredSales.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = cat === 'All' ? sales.length : sales.filter(s => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 touch-press ${
                      isSelected
                        ? 'bg-[#566E54] text-white shadow-soft font-bold'
                        : 'bg-[#FAF7F2] text-[#605955] hover:bg-[#F3EDE3] border border-[#EBE3D7]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#7C746F]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setAddSaleOpen(true)}
              className="w-full py-3.5 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-serif font-bold text-xs shadow-pastel transition active:scale-98 flex items-center justify-center gap-2 touch-press"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addSale}</span>
            </button>
          </div>
        </div>

        {/* Right Column (8 cols): Sales Transactions Ledger */}
        <div className="lg:col-span-8">
          {filteredSales.length > 0 ? (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3] text-xs text-[#7C746F] font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7C746F]" />
                  <span>Sales Ledger ({selectedCategory})</span>
                </div>
                <span>Sorted by Most Recent</span>
              </div>

              <div className="divide-y divide-[#F3EDE3]">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2] flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-soft">
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
                        {sale.note ? (
                          <p className="text-xs text-[#7C746F] mt-0.5">
                            {sale.note}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#9A938E] mt-0.5">
                            Customer transaction
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#566E54]">
                        +₹{Number(sale.amount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteTransaction('sale', sale.id)}
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
                  type="cottoncandy"
                  size="lg"
                  backdrop="blob"
                  backdropColor="sage"
                  alt="No sales"
                />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2D2825]">
                No sales found in {selectedCategory}
              </h3>
              <p className="text-xs text-[#7C746F] max-w-sm mx-auto">
                {t.addFirstSale}
              </p>
              <button
                onClick={() => setAddSaleOpen(true)}
                className="py-3 px-6 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-bold text-xs shadow-pastel transition touch-press"
              >
                + {t.addSale}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddSaleModal isOpen={addSaleOpen} onClose={() => setAddSaleOpen(false)} />
    </div>
  );
}
