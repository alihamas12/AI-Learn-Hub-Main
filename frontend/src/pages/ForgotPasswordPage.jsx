import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle, GraduationCap, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${API}/auth/forgot-password`, { email });
            setSubmitted(true);
            toast.success('Reset link sent if account exists');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" data-testid="forgot-password-page">
            {/* Left Panel - Branding (consistent with login) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
                    }}
                />
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-black text-xl">
                            A
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight">AI LearnHub</span>
                    </Link>

                    <div className="flex flex-col gap-6">
                        <h2 className="text-5xl font-extrabold leading-tight">
                            Retrieve Your<br />
                            <span className="text-indigo-200">Account Access</span>
                        </h2>
                        <p className="text-white/75 text-lg leading-relaxed max-w-sm">
                            Don't worry, even the smartest learners forget passwords sometimes. We'll help you get back in.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 w-fit">
                        <div className="p-2 bg-indigo-400/20 rounded-xl">
                            <GraduationCap className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Secure Recovery</p>
                            <p className="text-white/60 text-xs">Identity verified via email</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white">
                            A
                        </div>
                        <span className="font-extrabold text-xl text-slate-800">AI LearnHub</span>
                    </Link>

                    {submitted ? (
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-10 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-green-500" size={40} />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Check your email</h1>
                            <p className="text-slate-500 mb-8">
                                We've sent a password reset link to <br /><span className="font-bold text-slate-700">{email}</span>
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-10 border border-slate-100">
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Forgot password?</h1>
                            <p className="text-slate-500 mb-8">No problem! Enter your email and we'll send you recovery instructions.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-shine w-full py-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Send Recovery Link <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <Link
                                    to="/login"
                                    className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
