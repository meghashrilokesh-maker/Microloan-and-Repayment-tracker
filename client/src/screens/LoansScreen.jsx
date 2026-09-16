import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from '../components/NaturalVendorImage';
import { AddLoanModal, AddRepaymentModal } from '../components/TransactionModals';

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

  const filteredLoans = loans.filter((loan) => {
    if (activeFilter === 'Active') return loan.status !== 'Completed';
    if (activeFilter === 'Completed') return loan.status === 'Completed';
    if (activeFilter === 'Overdue') return loan.status === 'Overdue';
    return true;
  });

  const selectedLoan = loans.find(l => l.id === selectedLoanId);

  // If a loan is selected for details view:
  if (selectedLoan) {
    const progressPercent = Math.min(100, Math.round((selectedLoan.totalRepaid / selectedLoan.originalAmount) * 100));

    return (
      <div className="space-y-4 animate-in fade-in">
        {/* Top return bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedLoanId(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#48433F] hover:text-[#2D2825] bg-white px-3.5 py-2 rounded-full border border-[#EBE3D7] shadow-soft transition touch-press"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Loans</span>
          </button>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            selectedLoan.status === 'Completed' 
              ? 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]' 
              : 'bg-[#F2F0F8] text-[#554C78] border-[#E3DFEF]'
          }`}>
            {selectedLoan.status}
          </span>
        </div>

        {/* Hero Card for Loan */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#554C78] uppercase bg-[#F2F0F8] px-2.5 py-0.5 rounded-full border border-[#E3DFEF]">
                Microloan Account
              </span>
              <h2 className="font-serif font-bold text-xl text-[#2D2825] mt-1.5">
                {selectedLoan.name}
              </h2>
              <p className="text-xs text-[#7C746F] font-medium">
                {t.lender}: <span className="text-[#383330] font-semibold">{selectedLoan.lender}</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#F2F0F8] border border-[#E3DFEF] flex items-center justify-center text-[#554C78] shrink-0 shadow-soft">
              <Landmark className="w-5 h-5" />
            </div>
          </div>

          {/* Amount Balance Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7]">
              <span className="text-[11px] text-[#7C746F] block">{t.originalLoan}</span>
              <span className="text-base font-serif font-bold text-[#2D2825]">
                ₹{selectedLoan.originalAmount.toLocaleString()}
              </span>
            </div>
            <div className="bg-[#E9EFE8]/80 p-3 rounded-2xl border border-[#D3DFD2]">
              <span className="text-[11px] text-[#425541] block">{t.repaidSoFar}</span>
              <span className="text-base font-serif font-bold text-[#314030]">
                ₹{selectedLoan.totalRepaid.toLocaleString()}
              </span>
            </div>
            <div className="bg-[#F2F0F8]/80 p-3 rounded-2xl border border-[#E3DFEF] col-span-2 sm:col-span-1">
              <span className="text-[11px] text-[#554C78] block">{t.remaining}</span>
              <span className="text-lg font-serif font-bold text-[#3F3760]">
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
            <div className="w-full h-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6B8569] to-[#8EAA8C] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EBE3D7]">
            <div>
              <span className="text-[#7C746F] block">{t.nextRepayment}:</span>
              <span className="font-bold text-[#2D2825]">
                ₹{selectedLoan.repaymentAmount} ({selectedLoan.frequency})
              </span>
            </div>
            <div>
              <span className="text-[#7C746F] block">Due Date:</span>
              <span className="font-bold text-[#BF745F]">
                {selectedLoan.nextDueDate || 'Upcoming'}
              </span>
            </div>
          </div>

          {selectedLoan.notes && (
            <p className="text-xs text-[#7C746F] bg-[#FAF3EA] p-3 rounded-2xl border border-[#EAE1D4]">
              📝 {selectedLoan.notes}
            </p>
          )}

          {/* Action button */}
          {selectedLoan.remainingAmount > 0 ? (
            <button
              onClick={() => {
                setRepayTargetLoanId(selectedLoan.id);
                setAddRepayOpen(true);
              }}
              className="w-full py-3.5 px-4 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-sm shadow-pastel-terracotta transition touch-press flex items-center justify-center gap-2"
            >
              <span>+ {t.addRepayment}</span>
            </button>
          ) : (
            <div className="p-3 bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2] text-xs font-bold text-center rounded-2xl flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B8569]" />
              <span>Congratulations! This loan is 100% repaid.</span>
            </div>
          )}
        </div>

        {/* Repayment History Section */}
        <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-bold text-base text-[#2D2825] flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-[#7C746F]" />
              <span>{t.repaymentHistory}</span>
            </h3>
            <span className="text-xs font-semibold text-[#7C746F]">
              {selectedLoan.repayments?.length || 0} payments
            </span>
          </div>

          {selectedLoan.repayments && selectedLoan.repayments.length > 0 ? (
            <div className="divide-y divide-[#F3EDE3]">
              {selectedLoan.repayments.map((rep) => (
                <div key={rep.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#2D2825]">
                      Paid via {rep.method}
                    </div>
                    <div className="text-[11px] text-[#8E8681]">
                      {rep.date} • {rep.note || 'Instalment'}
                    </div>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#566E54]">
                    -₹{rep.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9A938E] py-3 text-center">
              No repayments logged yet.
            </p>
          )}
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
    <div className="space-y-4 animate-in fade-in">
      {/* Header Banner with 2D Indian Farmer illustration seamlessly integrated */}
      <div className="relative overflow-hidden bg-[#F8F2EC] rounded-3xl p-5 border border-[#EAE1D4] shadow-soft flex items-center justify-between gap-3">
        <div className="absolute top-0 right-12 w-32 h-44 bg-[#F2DDD4]/60 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-6 right-2 w-28 h-28 bg-[#EAF0E9]/60 rounded-full pointer-events-none -z-0" />

        <div className="z-10">
          <span className="text-[10px] font-bold tracking-wider text-[#874937] uppercase bg-[#F8ECE6] px-2.5 py-0.5 rounded-full border border-[#F0D7CD]">
            Vendor Microloans
          </span>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-1.5">
            {t.myLoans}
          </h1>
          <p className="text-xs text-[#7C746F] font-medium mt-0.5">
            {t.loanSummaryTitle}: <strong className="text-[#BF745F] text-sm">₹{totalLoanRemaining.toLocaleString()}</strong>
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

      {/* Filter Tabs & Add Loan Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-white p-1 rounded-full border border-[#EBE3D7] shadow-soft text-xs font-semibold">
          {['Active', 'Completed', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 touch-press ${
                activeFilter === tab
                  ? 'bg-[#566E54] text-white shadow-soft'
                  : 'text-[#7C746F] hover:text-[#2D2825]'
              }`}
            >
              {tab === 'Active' ? t.tabActive : tab === 'Completed' ? t.tabCompleted : t.tabOverdue}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddLoanOpen(true)}
          className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-bold text-xs shadow-pastel transition active:scale-95 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addLoan}</span>
        </button>
      </div>

      {/* Loan Cards List */}
      {filteredLoans.length > 0 ? (
        <div className="space-y-3">
          {filteredLoans.map((loan) => {
            const progress = Math.min(100, Math.round((loan.totalRepaid / loan.originalAmount) * 100));
            return (
              <div
                key={loan.id}
                onClick={() => setSelectedLoanId(loan.id)}
                className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft hover:shadow-soft-md transition cursor-pointer group space-y-3.5 touch-press"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#2D2825] group-hover:text-[#566E54] transition">
                      {loan.name}
                    </h3>
                    <p className="text-xs text-[#7C746F]">
                      {t.lender}: <span className="font-medium text-[#383330]">{loan.lender}</span>
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
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
                    <span className="font-bold text-[#2D2825]">₹{loan.originalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#425541] block">{t.repaidSoFar}</span>
                    <span className="font-bold text-[#566E54]">₹{loan.totalRepaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#554C78] block">{t.remaining}</span>
                    <span className="font-bold text-[#3F3760]">₹{loan.remainingAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#7C746F] mb-1">
                    <span>{progress}% Repaid</span>
                    <span>Next: ₹{loan.repaymentAmount} ({loan.frequency})</span>
                  </div>
                  <div className="w-full h-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6B8569] to-[#8EAA8C] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer with due info & Arrow */}
                <div className="flex items-center justify-between text-xs pt-1 text-[#7C746F]">
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
        <div className="bg-white rounded-3xl p-8 border border-[#EBE3D7] shadow-soft text-center space-y-3.5">
          <div className="relative mx-auto flex items-center justify-center">
            <NaturalVendorImage 
              type="farmer"
              size="lg"
              backdrop="blob"
              backdropColor="sage"
              alt="No loans"
            />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#2D2825]">
            {t.noLoansRecorded}
          </h3>
          <p className="text-xs text-[#7C746F] max-w-xs mx-auto">
            {t.addLoanPrompt}
          </p>
          <button
            onClick={() => setAddLoanOpen(true)}
            className="py-2.5 px-6 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-bold text-xs shadow-pastel transition touch-press"
          >
            + {t.addLoan}
          </button>
        </div>
      )}

      {/* Modals */}
      <AddLoanModal isOpen={addLoanOpen} onClose={() => setAddLoanOpen(false)} />
    </div>
  );
}
