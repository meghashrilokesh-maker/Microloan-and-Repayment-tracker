import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Receipt,
  BarChart3,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from '../components/NaturalVendorImage';
import { AddLoanModal, AddRepaymentModal } from '../components/TransactionModals';

const RECOMMENDED_SCHEMES = [
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi Scheme',
    tag: 'Govt. Subsidized',
    badgeClass: 'bg-[#F8ECE6] text-[#874937] border-[#F0D7CD]',
    suitableFor: 'Street vendors, hawkers & daily market stalls',
    purpose: 'Collateral-free working capital loan of ₹10,000 to ₹50,000 with 7% interest subsidy on digital repayments.',
    eligibility: 'Vendors holding Urban Local Body (ULB) vending identity cards or recommendation letters. Subject to bank verification.',
    lenders: 'Public & Private Commercial Banks, Regional Rural Banks (RRBs), and MFIs',
    portalUrl: 'https://pmsvanidhi.mohua.gov.in'
  },
  {
    id: 'mudra-shishu',
    name: 'MUDRA Loan (Shishu)',
    tag: 'Micro-Enterprise',
    badgeClass: 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]',
    suitableFor: 'Small shop owners, repair kiosks & micro artisans',
    purpose: 'Loans up to ₹50,000 to purchase inventory, tools, and daily supplies with no processing fees.',
    eligibility: 'Any Indian citizen with a feasible non-farm micro-business proposal. Reference only; subject to bank appraisal.',
    lenders: 'Commercial banks, Small Finance Banks, and NBFCs',
    portalUrl: 'https://www.mudra.org.in'
  },
  {
    id: 'shg-bank-linkage',
    name: 'SHG-Bank Linkage (NABARD)',
    tag: 'Women & Groups',
    badgeClass: 'bg-[#F2F0F8] text-[#554C78] border-[#E3DFEF]',
    suitableFor: 'Women entrepreneurs & Self-Help Group (SHG) members',
    purpose: 'Affordable group microcredit for group ventures, working capital, and trade expansion.',
    eligibility: 'Active Self-Help Groups with minimum 6 months of regular savings and book-keeping records.',
    lenders: 'Regional Rural Banks, District Cooperative Banks & Public Banks',
    portalUrl: 'https://www.nabard.org'
  },
  {
    id: 'kcc-allied',
    name: 'KCC (Animal Husbandry & Dairy)',
    tag: 'Agri & Dairy',
    badgeClass: 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]',
    suitableFor: 'Dairy vendors, poultry sellers & fishmongers',
    purpose: 'Revolving working capital credit line up to ₹2,00,000 with prompt repayment subvention (3%).',
    eligibility: 'Individuals or groups engaged in animal husbandry, dairy, or fisheries trading. Reference only.',
    lenders: 'Commercial Banks, RRBs and State Cooperative Banks',
    portalUrl: 'https://agricoop.nic.in'
  }
];

export default function LoansScreen() {
  const { 
    t, 
    loans, 
    selectedLoanId, 
    setSelectedLoanId,
    totalLoanRemaining 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('Active'); // 'Active' | 'Completed' | 'Overdue'
  const [addLoanOpen, setAddLoanOpen] = useState(false);
  const [addRepayOpen, setAddRepayOpen] = useState(false);
  const [repayTargetLoanId, setRepayTargetLoanId] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const filteredLoans = loans.filter((loan) => {
    if (activeFilter === 'Active') return loan.status !== 'Completed';
    if (activeFilter === 'Completed') return loan.status === 'Completed';
    if (activeFilter === 'Overdue') return loan.status === 'Overdue';
    return true;
  });

  const selectedLoan = loans.find(l => l.id === selectedLoanId);

  // If a loan is selected for details view:
  if (selectedLoan) {
    const repayments = selectedLoan.repayments || [];
    const totalRepaid = repayments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const originalAmount = Number(selectedLoan.originalAmount || 0);
    const remainingAmount = Math.max(0, originalAmount - totalRepaid);

    let avgDaily = 0;
    let avgMonthly = 0;

    if (repayments.length === 1) {
      avgDaily = Number(repayments[0].amount || 0);
      avgMonthly = Number(repayments[0].amount || 0);
    } else if (repayments.length > 1) {
      const timestamps = repayments
        .map((r) => new Date(r.date).getTime())
        .filter((t) => !isNaN(t));

      if (timestamps.length > 0) {
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        const minDate = new Date(minTime);
        const maxDate = new Date(maxTime);

        const diffTime = maxTime - minTime;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        avgDaily = diffDays > 0 ? Math.round(totalRepaid / diffDays) : totalRepaid;

        const monthDiff =
          (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
          (maxDate.getMonth() - minDate.getMonth());
        const diffMonths = Math.max(monthDiff, Math.round(diffDays / 30));
        avgMonthly = diffMonths > 0 ? Math.round(totalRepaid / diffMonths) : totalRepaid;
      } else {
        avgDaily = totalRepaid;
        avgMonthly = totalRepaid;
      }
    }

    const progressPercent = originalAmount > 0
      ? Math.min(100, Math.round((totalRepaid / originalAmount) * 100))
      : 0;

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Top return bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedLoanId(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#48433F] hover:text-[#2D2825] bg-white px-4 py-2.5 rounded-full border border-[#EBE3D7] shadow-soft transition touch-press"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Microloans</span>
          </button>
          <span className={`text-xs font-bold px-3.5 py-1 rounded-full border ${
            selectedLoan.status === 'Completed' 
              ? 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]' 
              : 'bg-[#F2F0F8] text-[#554C78] border-[#E3DFEF]'
          }`}>
            {selectedLoan.status}
          </span>
        </div>

        {/* Responsive 2-Column Detail View: Left details, Right repayment ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Hero Card for Loan */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#EBE3D7] shadow-soft space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#554C78] uppercase bg-[#F2F0F8] px-2.5 py-0.5 rounded-full border border-[#E3DFEF]">
                  Microloan Account
                </span>
                <h2 className="font-serif font-bold text-2xl text-[#2D2825] mt-1.5">
                  {selectedLoan.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#7C746F] font-medium mt-0.5">
                  {t.lender}: <span className="text-[#383330] font-semibold">{selectedLoan.lender}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#F2F0F8] border border-[#E3DFEF] flex items-center justify-center text-[#554C78] shrink-0 shadow-soft">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            {/* Amount Balance Numbers */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE3D7] text-center">
                <span className="text-[11px] text-[#7C746F] block">{t.originalLoan}</span>
                <span className="text-base sm:text-lg font-serif font-bold text-[#2D2825] mt-0.5 block">
                  ₹{selectedLoan.originalAmount.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#E9EFE8]/80 p-3.5 rounded-2xl border border-[#D3DFD2] text-center">
                <span className="text-[11px] text-[#425541] block">{t.repaidSoFar}</span>
                <span className="text-base sm:text-lg font-serif font-bold text-[#314030] mt-0.5 block">
                  ₹{selectedLoan.totalRepaid.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#F2F0F8]/80 p-3.5 rounded-2xl border border-[#E3DFEF] text-center">
                <span className="text-[11px] text-[#554C78] block">{t.remaining}</span>
                <span className="text-base sm:text-lg font-serif font-bold text-[#3F3760] mt-0.5 block">
                  ₹{selectedLoan.remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#7C746F] mb-1.5">
                <span>Repayment Progress</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6B8569] to-[#8EAA8C] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Schedule Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE3D7]">
              <div>
                <span className="text-[#7C746F] block">{t.nextRepayment}:</span>
                <span className="font-bold text-[#2D2825] text-sm">
                  ₹{selectedLoan.repaymentAmount} ({selectedLoan.frequency})
                </span>
              </div>
              <div>
                <span className="text-[#7C746F] block">Due Date:</span>
                <span className="font-bold text-[#BF745F] text-sm">
                  {selectedLoan.nextDueDate || 'Upcoming'}
                </span>
              </div>
            </div>

            {selectedLoan.notes && (
              <p className="text-xs text-[#7C746F] bg-[#FAF3EA] p-3.5 rounded-2xl border border-[#EAE1D4] leading-relaxed">
                📝 <strong>Notes:</strong> {selectedLoan.notes}
              </p>
            )}

            {/* Action button */}
            {selectedLoan.remainingAmount > 0 ? (
              <button
                onClick={() => {
                  setRepayTargetLoanId(selectedLoan.id);
                  setAddRepayOpen(true);
                }}
                className="w-full py-4 px-6 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-serif font-bold text-sm shadow-pastel-terracotta transition touch-press flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addRepayment}</span>
              </button>
            ) : (
              <div className="p-4 bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2] text-xs font-bold text-center rounded-2xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#6B8569]" />
                <span>Congratulations! This loan is 100% repaid and closed.</span>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Repayment Summary & Repayment History */}
          <div className="lg:col-span-5 space-y-6">
            {/* Repayment Summary Section */}
            <div className="bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
                <h3 className="font-serif font-bold text-base text-[#2D2825] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#7C746F]" />
                  <span>Repayment Summary</span>
                </h3>
                <span className="text-[11px] font-semibold text-[#7C746F] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#EBE3D7]">
                  Analytics
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Total Repaid - Sage Green */}
                <div className="bg-[#E9EFE8]/80 p-3.5 rounded-2xl border border-[#D3DFD2]">
                  <span className="text-[11px] text-[#425541] font-medium block">Total Repaid</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-[#314030] mt-0.5 block">
                    ₹{totalRepaid.toLocaleString()}
                  </span>
                </div>

                {/* Remaining Amount - Lavender */}
                <div className="bg-[#F2F0F8]/80 p-3.5 rounded-2xl border border-[#E3DFEF]">
                  <span className="text-[11px] text-[#554C78] font-medium block">Remaining Amount</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-[#3F3760] mt-0.5 block">
                    ₹{remainingAmount.toLocaleString()}
                  </span>
                </div>

                {/* Average Daily Repayment - Warm Sand */}
                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE3D7]">
                  <span className="text-[11px] text-[#7C746F] font-medium block">Avg. Daily Repayment</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-[#2D2825] mt-0.5 block">
                    ₹{avgDaily.toLocaleString()}
                  </span>
                </div>

                {/* Average Monthly Repayment - Warm Sand */}
                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE3D7]">
                  <span className="text-[11px] text-[#7C746F] font-medium block">Avg. Monthly Repayment</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-[#2D2825] mt-0.5 block">
                    ₹{avgMonthly.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Repayment History Section */}
            <div className="bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
                <h3 className="font-serif font-bold text-base text-[#2D2825] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#7C746F]" />
                  <span>{t.repaymentHistory}</span>
                </h3>
                <span className="text-xs font-semibold text-[#554C78] bg-[#F2F0F8] px-2.5 py-0.5 rounded-full">
                  {selectedLoan.repayments?.length || 0} instalments
                </span>
              </div>

              {selectedLoan.repayments && selectedLoan.repayments.length > 0 ? (
                <div className="divide-y divide-[#F3EDE3] max-h-[480px] overflow-y-auto pr-1">
                  {selectedLoan.repayments.map((rep) => (
                    <div key={rep.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#2D2825]">
                          Paid via {rep.method}
                        </div>
                        <div className="text-[11px] text-[#8E8681] mt-0.5">
                          {rep.date} • {rep.note || 'Instalment'}
                        </div>
                      </div>
                      <span className="font-serif font-bold text-sm sm:text-base text-[#566E54]">
                        -₹{rep.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#9A938E] py-8 text-center">
                  No repayments logged yet for this loan.
                </p>
              )}
            </div>
          </div>
        </div>

        <AddRepaymentModal
          isOpen={addRepayOpen}
          onClose={() => setAddRepayOpen(false)}
          defaultLoanId={repayTargetLoanId}
        />
      </div>
    );
  }

  // Normal All Loans List View:
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Banner with 2D Indian Farmer illustration seamlessly integrated */}
      <div className="relative overflow-hidden bg-[#F8F2EC] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EAE1D4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-24 w-40 h-52 bg-[#F2DDD4]/60 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-8 right-4 w-36 h-36 bg-[#EAF0E9]/60 rounded-full pointer-events-none -z-0" />

        <div className="z-10 text-center sm:text-left space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-[#874937] uppercase bg-[#F8ECE6] px-2.5 py-0.5 rounded-full border border-[#F0D7CD]">
            Vendor Microloans & Credit Schemes
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825]">
            {t.myLoans}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C746F] font-medium">
            {t.loanSummaryTitle}: <strong className="text-[#BF745F] text-base">₹{totalLoanRemaining.toLocaleString()}</strong> remaining across accounts
          </p>
        </div>

        <div className="relative shrink-0 z-10">
          <NaturalVendorImage 
            type="farmer"
            size="md"
            backdrop="arch"
            backdropColor="terracotta"
            showBotanical={true}
            alt="Microloan Support"
          />
        </div>
      </div>

      {/* 2. Filter Tabs & Add Loan Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-white p-1 rounded-full border border-[#EBE3D7] shadow-soft text-xs font-semibold w-fit">
          {['Active', 'Completed', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full transition-all duration-200 touch-press ${
                activeFilter === tab
                  ? 'bg-[#566E54] text-white shadow-soft font-bold'
                  : 'text-[#7C746F] hover:text-[#2D2825]'
              }`}
            >
              {tab === 'Active' ? t.tabActive : tab === 'Completed' ? t.tabCompleted : t.tabOverdue}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddLoanOpen(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-serif font-bold text-xs shadow-pastel transition active:scale-95 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addLoan}</span>
        </button>
      </div>

      {/* 3. MULTI-COLUMN RESPONSIVE LOAN CARDS GRID (1 col mobile, 2 cols tablet, 3 cols desktop) */}
      {filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredLoans.map((loan) => {
            const progress = Math.min(100, Math.round((loan.totalRepaid / loan.originalAmount) * 100));
            return (
              <div
                key={loan.id}
                onClick={() => setSelectedLoanId(loan.id)}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft hover:shadow-soft-md transition cursor-pointer group space-y-4 touch-press flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2825] group-hover:text-[#566E54] transition">
                        {loan.name}
                      </h3>
                      <p className="text-xs text-[#7C746F] mt-0.5">
                        {t.lender}: <span className="font-medium text-[#383330]">{loan.lender}</span>
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                      loan.status === 'Completed'
                        ? 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]'
                        : loan.status === 'Overdue'
                        ? 'bg-[#FAEEF0] text-[#8A3846] border-[#F4DBDF]'
                        : 'bg-[#F2F0F8] text-[#554C78] border-[#E3DFEF]'
                    }`}>
                      {loan.status}
                    </span>
                  </div>

                  {/* Numbers Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7] text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#7C746F] block">{t.originalLoan}</span>
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#2D2825] mt-0.5 block">
                        ₹{loan.originalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#425541] block">{t.repaidSoFar}</span>
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#566E54] mt-0.5 block">
                        ₹{loan.totalRepaid.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#554C78] block">{t.remaining}</span>
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#3F3760] mt-0.5 block">
                        ₹{loan.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#7C746F] mb-1">
                      <span>{progress}% Repaid</span>
                      <span>Next: ₹{loan.repaymentAmount} ({loan.frequency})</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6B8569] to-[#8EAA8C] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with due info & Arrow */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#F3EDE3] text-[#7C746F]">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#BF745F]" />
                    Due: <strong className="text-[#383330]">{loan.nextDueDate || 'Upcoming'}</strong>
                  </span>
                  <span className="text-xs font-bold text-[#566E54] group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EBE3D7] shadow-soft text-center space-y-4">
          <div className="relative mx-auto flex items-center justify-center">
            <NaturalVendorImage 
              type="farmer"
              size="lg"
              backdrop="blob"
              backdropColor="sage"
              alt="No loans"
            />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#2D2825]">
            {t.noLoansRecorded}
          </h3>
          <p className="text-xs sm:text-sm text-[#7C746F] max-w-sm mx-auto">
            {t.addLoanPrompt}
          </p>
          <button
            onClick={() => setAddLoanOpen(true)}
            className="py-3 px-6 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-serif font-bold text-xs shadow-pastel transition touch-press"
          >
            + {t.addLoan}
          </button>
        </div>
      )}

      {/* 4. Recommended Loan Schemes Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F3EDE3]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#BF745F]" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#2D2825]">
                Recommended Loan Schemes
              </h2>
            </div>
            <p className="text-xs text-[#7C746F] mt-0.5">
              Government & institutional microfinance schemes suitable for small vendors and micro-businesses.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#874937] bg-[#F8ECE6] px-3 py-1 rounded-full border border-[#F0D7CD] self-start sm:self-auto">
            Suggestions for Reference
          </span>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="flex items-start gap-2.5 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7] text-xs text-[#7C746F]">
          <Info className="w-4 h-4 text-[#BF745F] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-[#2D2825]">Important Note:</strong> These schemes are external suggestions for reference only. The tracker does not verify or guarantee your eligibility. Please verify criteria, interest rates, and required documentation directly with official lender branches or government portals.
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECOMMENDED_SCHEMES.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EBE3D7] flex flex-col justify-between hover:border-[#D6CCC2] transition space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.badgeClass}`}>
                    {scheme.tag}
                  </span>
                  <span className="text-[10px] text-[#8E8681] font-medium">Ref. only</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#2D2825] leading-snug">
                    {scheme.name}
                  </h3>
                  <p className="text-[11px] text-[#566E54] font-medium mt-0.5">
                    <strong>For:</strong> {scheme.suitableFor}
                  </p>
                </div>
                <p className="text-[11px] text-[#7C746F] leading-relaxed">
                  <strong>Purpose:</strong> {scheme.purpose}
                </p>
                <div className="text-[10px] text-[#8E8681] bg-white/80 p-2 rounded-xl border border-[#EBE3D7]/80 leading-snug">
                  <strong className="text-[#383330]">Eligibility:</strong> {scheme.eligibility}
                </div>
              </div>

              <div className="pt-2 border-t border-[#EBE3D7]/60">
                <button
                  type="button"
                  onClick={() => setSelectedScheme(scheme)}
                  className="w-full py-1.5 px-3 rounded-full bg-white hover:bg-[#F3EDE3] border border-[#D6CCC2] text-[#2D2825] font-serif font-bold text-[11px] transition touch-press flex items-center justify-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3 text-[#7C746F]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddLoanModal isOpen={addLoanOpen} onClose={() => setAddLoanOpen(false)} />

      {/* Modal for Scheme Details */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#EBE3D7] shadow-xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-2 border-b border-[#F3EDE3] pb-3">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${selectedScheme.badgeClass}`}>
                  {selectedScheme.tag}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2D2825] mt-1.5">
                  {selectedScheme.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EBE3D7] flex items-center justify-center text-[#7C746F] hover:text-[#2D2825] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#48433F]">
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7C746F] block">Suitable For</span>
                <p className="text-xs font-semibold text-[#2D2825]">{selectedScheme.suitableFor}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7C746F] block">Purpose & Use</span>
                <p className="leading-relaxed text-[#5A534E]">{selectedScheme.purpose}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7C746F] block">Eligibility Criteria</span>
                <p className="leading-relaxed text-[#5A534E]">{selectedScheme.eligibility}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7C746F] block">Participating Lenders</span>
                <p className="leading-relaxed text-[#5A534E]">{selectedScheme.lenders}</p>
              </div>

              <div className="bg-[#FAF3EA] p-3.5 rounded-2xl border border-[#EAE1D4] text-[11px] text-[#874937] leading-relaxed">
                <strong>Verification Notice:</strong> You are not automatically eligible for this scheme. These details are for reference only. Please visit your nearest participating bank branch or official portal to confirm eligibility, terms, and paperwork.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="py-2 px-5 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-serif font-bold text-xs shadow-pastel transition touch-press"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
