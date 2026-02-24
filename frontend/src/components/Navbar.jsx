import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, User, LogOut, LayoutDashboard, Menu, X, GraduationCap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar({ user, logout }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'instructor') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  const navLinks = [
    { to: '/', label: 'Home', testId: 'nav-home' },
    { to: '/courses', label: 'Courses', testId: 'nav-courses' },
    ...(user ? [{ to: '/profile', label: 'Profile', testId: 'nav-my-profile' }] : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20'
          : 'bg-transparent'
          }`}
        data-testid="navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group" data-testid="navbar-brand">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-400/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              AI LearnHub
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={link.testId}
                className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors rounded-xl hover:bg-indigo-50 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                    data-testid="user-menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block font-semibold text-slate-700 text-sm">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-2xl p-2 mt-2"
                >
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                  </div>
                  <div className="h-px bg-slate-100 mx-1 mb-1" />
                  <DropdownMenuItem
                    className="rounded-xl cursor-pointer py-2.5 px-3 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                    data-testid="nav-dashboard"
                    onClick={() => navigate(getDashboardLink())}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-xl cursor-pointer py-2.5 px-3 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                    data-testid="nav-profile"
                    onClick={() => navigate('/profile')}
                  >
                    <User size={16} />
                    Profile
                  </DropdownMenuItem>
                  <div className="h-px bg-slate-100 mx-1 my-1" />
                  <DropdownMenuItem
                    className="rounded-xl cursor-pointer py-2.5 px-3 font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                    data-testid="nav-logout"
                    onClick={() => { logout(); navigate('/'); }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  data-testid="nav-login-btn"
                  variant="ghost"
                  className="hidden sm:inline-flex rounded-xl font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <Button
                  data-testid="nav-register-btn"
                  className="btn-shine rounded-xl px-5 font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-indigo-300/50 transition-all"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Button
                className="mt-2 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                onClick={() => { navigate('/register'); setMobileOpen(false); }}
              >
                Get Started Free
              </Button>
            )}
          </div>
        )}
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}