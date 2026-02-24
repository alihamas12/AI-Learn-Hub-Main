import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { CheckCircle2, Loader2, XCircle, ArrowRight, LayoutDashboard, Play } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentSuccess({ user, logout }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [courseId, setCourseId] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) checkPaymentStatus();
    else { setStatus('failed'); toast.error('No payment session found'); }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    const maxAttempts = 5;
    let currentAttempt = 0;

    const pollStatus = async () => {
      try {
        currentAttempt++;
        setAttempts(currentAttempt);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/payments/status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const paymentData = response.data;
        const isSuccess = paymentData.payment_status === 'paid' || paymentData.payment_status === 'no_payment_required';

        if (isSuccess) {
          setStatus('success');
          const metadata = paymentData.metadata || {};
          const cid = metadata.course_id || paymentData.course_id;
          if (cid && cid !== 'undefined') setCourseId(cid);
          toast.success('Payment successful! You are now enrolled.');
          return true;
        } else if (paymentData.payment_status === 'expired' || paymentData.status === 'expired') {
          setStatus('failed'); toast.error('Payment session expired'); return true;
        } else if (currentAttempt >= maxAttempts) {
          setStatus('failed'); toast.error('Unable to verify payment. Contact support.'); return true;
        }
        return false;
      } catch {
        if (currentAttempt >= maxAttempts) { setStatus('failed'); toast.error('Payment verification failed'); return true; }
        return false;
      }
    };

    const poll = async () => {
      const done = await pollStatus();
      if (!done && currentAttempt < maxAttempts) setTimeout(poll, 2000);
    };
    poll();
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="payment-success-page">
      <Navbar user={user} logout={logout} />
      <div className="max-w-lg mx-auto px-4 py-24 text-center">

        {status === 'checking' && (
          <div data-testid="payment-checking" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Loader2 size={36} className="text-indigo-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Verifying Payment…</h1>
            <p className="text-slate-500">Please wait while we confirm your payment</p>
            <div className="mt-6 flex justify-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < attempts ? 'bg-indigo-500' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div data-testid="payment-success" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">You're Enrolled! 🎉</h1>
            <p className="text-slate-500 mb-8">Payment successful. Time to start learning something amazing!</p>
            <div className="flex flex-col gap-3">
              <button
                data-testid="start-learning-btn"
                onClick={() => { if (courseId) navigate(`/course/${courseId}/learn`); else navigate('/dashboard/student'); }}
                className="btn-shine w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/60 transition-all flex items-center justify-center gap-2"
              >
                <Play size={16} className="fill-white" /> Start Learning Now
              </button>
              <button
                data-testid="view-dashboard-btn"
                onClick={() => navigate('/dashboard/student')}
                className="w-full py-3.5 rounded-2xl font-bold text-slate-600 border-2 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={16} /> View Dashboard
              </button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div data-testid="payment-failed" className="bg-white rounded-3xl border border-red-100 shadow-sm p-12">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Verification Failed</h1>
            <p className="text-slate-500 mb-8">We couldn't verify your payment. Please try again or contact support.</p>
            <button
              data-testid="back-to-courses-btn"
              onClick={() => navigate('/courses')}
              className="btn-shine w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg flex items-center justify-center gap-2"
            >
              Browse Courses <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}