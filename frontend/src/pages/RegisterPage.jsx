import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, User, ArrowRight, BookOpen, Mic, Eye, EyeOff } from 'lucide-react';
import logo from '../Logo/logo.png';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RegisterPage({ setUser }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Account created! Welcome aboard 🎉');
      if (formData.role === 'instructor') navigate('/dashboard/instructor');
      else navigate('/dashboard/student');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', icon: BookOpen, label: 'I want to Learn', desc: 'Access expert-led courses' },
    { value: 'instructor', icon: Mic, label: 'I want to Teach', desc: 'Share your expertise' },
  ];

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* Left Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-slate-800">BritSyncAI Academy</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500">Join thousands of learners growing every day</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-8 border border-slate-100">
            <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {roles.map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: value })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${formData.role === value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                      }`}
                    data-testid={`role-${value}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${formData.role === value ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                      <Icon size={16} />
                    </div>
                    <div className="text-xs font-bold text-slate-800">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="name" type="text" value={formData.name} required
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    data-testid="name-input"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="email" type="email" value={formData.email} required
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    data-testid="email-input"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} value={formData.password} required
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                    data-testid="password-input"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                data-testid="register-submit-btn"
                className="btn-shine w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/60 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight size={16} /></>
                }
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" data-testid="login-link" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }} />
        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-20%] left-[-20%] w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-white/10" />
            <span className="text-2xl font-extrabold text-white tracking-tight">BritSyncAI Academy</span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              Start Your<br /><span className="text-indigo-200">Journey Today</span>
            </h2>
            <p className="text-white/75 text-lg leading-relaxed max-w-sm">
              Get unlimited access to expert-led courses and take your skills to the next level.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['500+ Courses', 'Expert Mentors', 'Certificates', 'Community'].map((f) => (
                <div key={f} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/20">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-white text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-white/80 text-sm italic">"BritSyncAI Academy changed how I approach learning. The courses are world-class!"</p>
            <p className="text-indigo-200 text-xs font-semibold mt-2">— Sarah K., Software Engineer</p>
          </div>
        </div>
      </div>
    </div>
  );
}