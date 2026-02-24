import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { XCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PaymentCancel({ user, logout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50" data-testid="payment-cancel-page">
      <Navbar user={user} logout={logout} />
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12" data-testid="payment-cancelled">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Payment Cancelled</h1>
          <p className="text-slate-500 mb-8">
            No worries — you weren't charged. You can browse courses and try again whenever you're ready.
          </p>
          <div className="flex flex-col gap-3">
            <button
              data-testid="back-to-courses-btn"
              onClick={() => navigate('/courses')}
              className="btn-shine w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/60 transition-all flex items-center justify-center gap-2"
            >
              Browse Courses <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 rounded-2xl font-bold text-slate-600 border-2 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}