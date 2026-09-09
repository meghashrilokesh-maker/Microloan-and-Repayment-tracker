import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  IndianRupee, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  Server, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkBackendHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/health');
      setHealthData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Unable to connect to http://localhost:5000. Ensure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-start p-4 sm:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Microloan & Repayment Tracker
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Digital Ledger for Small Street Vendors & Micro-entrepreneurs
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Phase 1: Foundation Ready
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl space-y-6">
        {/* Backend & DB Status Card */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">Backend & Database Status</h2>
            </div>
            <button
              onClick={checkBackendHealth}
              disabled={loading}
              className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              {loading ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          {healthData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>API Connection: {healthData.status}</span>
              </div>
              <p className="text-sm text-emerald-700">{healthData.message}</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <Database className="w-4 h-4" />
                <span>{healthData.database}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Backend Server Notice:</p>
              <p>{error}</p>
              <p className="mt-2 text-xs text-slate-500">
                Run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm run server:dev</code> in a terminal to start the API server on port 5000.
              </p>
            </div>
          )}
        </section>

        {/* Phase 1 Verification Checklist */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Phase 1 Deliverables Completed
          </h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Project Scaffolding:</strong> Clean monorepo structure with independent <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">server/</code> and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">client/</code> packages.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Database Schema (Prisma ORM):</strong> Models defined for <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Vendor</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Loan</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Repayment</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Sale</code>, and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Expense</code> with relational foreign keys.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Zero-Config Local SQLite Database:</strong> Verified and synced at <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">server/prisma/dev.db</code>.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Express API Engine:</strong> Configured with CORS, JSON body parser, and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/api/health</code> endpoint.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Mobile-First Frontend:</strong> React 18, Vite, Tailwind CSS, Lucide icons, and Axios installed and operational.
              </div>
            </li>
          </ul>
        </section>

        {/* Next Step Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Ready for Phase 2</h3>
            <p className="text-emerald-100 text-sm mt-1">
              Next: Vendor Registration, Phone Login, Password Hashing (bcrypt), and JWT Authentication.
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">
            Awaiting Approval <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-xs text-slate-400 text-center">
        Microloan and Repayment Tracker &bull; College Societal Project &bull; Built with React, Express, and Prisma
      </footer>
    </div>
  );
}
