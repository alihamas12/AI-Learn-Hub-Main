import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Welcome back! 🎉');
      if (user.role === 'admin') navigate('/dashboard/admin');
      else if (user.role === 'instructor') navigate('/dashboard/instructor');
      else navigate('/dashboard/student');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Mesh Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
          }}
        />
        {/* Decorative Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-black text-white text-xl">
              A
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">AI LearnHub</span>
          </Link>

          {/* Center Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-white/90 text-sm font-medium">Premium Learning Platform</span>
            </div>
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              Unlock Your<br />
              <span className="text-indigo-200">Full Potential</span>
            </h2>
            <p className="text-white/75 text-lg leading-relaxed max-w-sm">
              Join thousands of learners building world-class skills with expert instructors.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex -space-x-3">
                {['A', 'B', 'C', 'D'].map((l) => (
                  <div
                    key={l}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-900 shadow"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-sm font-medium">
                <span className="text-white font-bold">10,000+</span> students enrolled
              </p>
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 w-fit">
            <div className="p-2 bg-green-400/20 rounded-xl">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">100% Secure Login</p>
              <p className="text-white/60 text-xs">Your data is always protected</p>
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to continue your learning journey</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-8 border border-slate-100">
            <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
              {/* Email */}
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
                    data-testid="email-input"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                  <Link
                    to="/forgot-password"
                    data-testid="forgot-password-link"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    data-testid="password-input"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-btn"
                className="btn-shine w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  data-testid="register-link"
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Create one free →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}