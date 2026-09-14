import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  Receipt,
  FileSpreadsheet
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
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Loans</span>
          </button>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            selectedLoan.status === 'Completed' 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-indigo-100 text-indigo-800'
          }`}>
            {selectedLoan.status}
          </span>
        </div>

        {/* Hero Card for Loan */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                Microloan Account
              </span>
              <h2 className="font-display font-bold text-xl text-slate-900 mt-1">
                {selectedLoan.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t.lender}: <span className="text-slate-700 font-semibold">{selectedLoan.lender}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
          </div>

          {/* Amount Balance Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t.originalLoan}</span>
              <span className="text-base font-display font-bold text-slate-900">
                ₹{selectedLoan.originalAmount.toLocaleString()}
              </span>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[11px] text-emerald-800 block">{t.repaidSoFar}</span>
              <span className="text-base font-display font-bold text-emerald-700">
                ₹{selectedLoan.totalRepaid.toLocaleString()}
              </span>
            </div>
            <div className="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-100 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-indigo-800 block">{t.remaining}</span>
              <span className="text-lg font-display font-extrabold text-indigo-900">
                ₹{selectedLoan.remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Repayment Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <span className="text-slate-500 block">{t.nextRepayment}:</span>
              <span className="font-bold text-slate-800">
                ₹{selectedLoan.repaymentAmount} ({selectedLoan.frequency})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Due Date:</span>
              <span className="font-bold text-amber-700">
                {selectedLoan.nextDueDate || 'Upcoming'}
              </span>
            </div>
          </div>

          {selectedLoan.notes && (
            <p className="text-xs text-slate-500 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
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
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-soft transition active:scale-98 flex items-center justify-center gap-2"
            >
              <span>+ {t.addRepayment}</span>
            </button>
          ) : (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold text-center rounded-2xl flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Congratulations! This loan is 100% repaid.</span>
            </div>
          )}
        </div>

        {/* Repayment History Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>{t.repaymentHistory}</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {selectedLoan.repayments?.length || 0} payments
            </span>
          </div>

          {selectedLoan.repayments && selectedLoan.repayments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {selectedLoan.repayments.map((rep) => (
                <div key={rep.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      Paid via {rep.method}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {rep.date} • {rep.note || 'Instalment'}
                    </div>
                  </div>
                  <span className="font-display font-extrabold text-sm text-emerald-700">
                    -₹{rep.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">
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
    <div className="space-y-4">
      {/* Header Banner with Farmer / Worker picture */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-amber-50 rounded-3xl p-4 sm:p-5 border border-indigo-100 shadow-soft flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-100/70 px-2 py-0.5 rounded-md">
            Vendor Microloans
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1">
            {t.myLoans}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {t.loanSummaryTitle}: <strong className="text-indigo-900 text-sm">₹{totalLoanRemaining.toLocaleString()}</strong>
          </p>
        </div>
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/70 p-1 shrink-0 flex items-center justify-center border border-indigo-100">
          <img 
            src="/images/vendor-farmer.jpg" 
            alt="Microloan Support" 
            className="w-full h-full object-contain vendor-photo-blend"
          />
        </div>
      </div>

      {/* Filter Tabs & Add Loan Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold">
          {['Active', 'Completed', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeFilter === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Active' ? t.tabActive : tab === 'Completed' ? t.tabCompleted : t.tabOverdue}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddLoanOpen(true)}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-soft transition active:scale-95"
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
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft hover:shadow-md transition cursor-pointer group space-y-3 touch-press"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-indigo-600 transition">
                      {loan.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t.lender}: <span className="font-medium text-slate-700">{loan.lender}</span>
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    loan.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : loan.status === 'Overdue'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {loan.status}
                  </span>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t.originalLoan}</span>
                    <span className="font-bold text-slate-800">₹{loan.originalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t.repaidSoFar}</span>
                    <span className="font-bold text-emerald-700">₹{loan.totalRepaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t.remaining}</span>
                    <span className="font-bold text-indigo-900">₹{loan.remainingAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>{progress}% Repaid</span>
                    <span>Next: ₹{loan.repaymentAmount} ({loan.frequency})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer with due info & Arrow */}
                <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Due: <strong className="text-slate-700">{loan.nextDueDate || 'Upcoming'}</strong>
                  </span>
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-0.5">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State as required by item 20 */
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft text-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-indigo-50 mx-auto flex items-center justify-center p-2">
            <img 
              src="/images/vendor-farmer.jpg" 
              alt="No loans" 
              className="w-full h-full object-contain vendor-photo-blend"
            />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900">
            {t.noLoansRecorded}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {t.addLoanPrompt}
          </p>
          <button
            onClick={() => setAddLoanOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-soft transition"
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
