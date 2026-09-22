import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TrackShack caught an error in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('trackshack_token');
      localStorage.removeItem('trackshack_profile');
      localStorage.removeItem('trackshack_sales');
      localStorage.removeItem('trackshack_expenses');
      localStorage.removeItem('trackshack_loans');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message 
        ? String(this.state.error.message) 
        : typeof this.state.error === 'object' 
          ? JSON.stringify(this.state.error) 
          : 'An unexpected display error occurred.';

      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D7] shadow-soft-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAEEF0] text-[#8A3846] border border-[#F4DBDF] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif font-bold text-xl text-[#2D2825]">
                Something went wrong
              </h2>
              <p className="text-xs text-[#7C746F] leading-relaxed">
                TrackShack caught an issue and protected your screen from going blank.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7] text-left">
              <span className="text-[10px] font-bold text-[#9A938E] uppercase tracking-wider block mb-1">
                Diagnostic Info:
              </span>
              <p className="text-xs font-mono text-[#874937] break-words line-clamp-3">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-xs font-bold text-[#48433F] flex items-center justify-center gap-2 transition touch-press"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-pastel flex items-center justify-center gap-2 transition touch-press"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
