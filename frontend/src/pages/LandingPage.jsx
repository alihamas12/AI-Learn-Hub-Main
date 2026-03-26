import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { getThumbnailUrl } from '@/utils/thumbnailUrl';
import BlogSection from '@/components/BlogSection';
import NewsletterSignup from '@/components/NewsletterSignup';
import '@/components/Newsletter.css';
import logo from '../Logo/logo-main.png';
import {
  BookOpen, Users, Award, TrendingUp, ArrowRight, Star, Play, ChevronRight,
  Zap, Shield, Globe
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage({ user, logout }) {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, students: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      // Fetch courses - updated to use limit and backend sorting
      const response = await axios.get(`${API}/courses?status=published&limit=6`);
      setCourses(response.data);

      // Fetch real-time stats
      const statsResponse = await axios.get(`${API}/stats`);
      setStats({
        courses: statsResponse.data.courses,
        students: statsResponse.data.students,
        instructors: statsResponse.data.instructors,
        completionRate: statsResponse.data.completionRate
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to basic counts if API fails
      setStats({ courses: 0, students: 0, instructors: 0, completionRate: 98 });
    }
  };

  const statItems = [
    { icon: BookOpen, val: `${stats.courses || '0'}+`, label: 'Expert Courses', color: 'from-blue-500 to-blue-600' },
    { icon: Users, val: `${stats.students || '0'}+`, label: 'Active Students', color: 'from-blue-600 to-blue-700' },
    { icon: Award, val: `${stats.instructors || '0'}+`, label: 'Top Instructors', color: 'from-blue-700 to-blue-800' },
    { icon: TrendingUp, val: `${stats.completionRate || '98'}%`, label: 'Completion Rate', color: 'from-blue-800 to-blue-900' },
  ];

  const features = [
    { icon: Zap, title: 'Learn Faster', desc: 'Structured learning paths designed for maximum retention.' },
    { icon: Shield, title: 'Quality Assured', desc: 'All content vetted by industry experts. Zero fluff.' },
    { icon: Globe, title: 'Learn Anywhere', desc: 'Access all content offline on any device, anytime.' },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      <Navbar user={user} logout={logout} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32" data-testid="hero-section">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/50 via-blue-50/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            {/* Center Copy */}
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full mb-6 mx-auto">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-indigo-700 text-sm font-semibold">New Courses Every Week</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-8" data-testid="hero-title">
                Learn Without
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-800 bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed" data-testid="hero-subtitle">
                Master in-demand skills with world-class instructors. Advance your career with practical, project-based learning.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <button
                  data-testid="explore-courses-btn"
                  onClick={() => navigate('/courses')}
                  className="btn-shine group w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-white text-lg bg-primary hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-blue-300/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Explore Courses
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                {!user && (
                  <button
                    data-testid="get-started-btn"
                    onClick={() => navigate('/register')}
                    className="group w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-slate-700 text-lg bg-white border-2 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <Play size={18} className="fill-current" />
                    Start for Free
                  </button>
                )}
              </div>

              {/* Trust Signal */}
              <div className="flex flex-col items-center gap-4 mt-12">
                <div className="flex -space-x-3">
                  {['I', 'J', 'K', 'L', 'M'].map((l) => (
                    <div key={l} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                    <span className="text-slate-800 font-bold ml-1">4.9/5</span>
                  </div>
                  <p className="text-slate-500 text-sm">Trusted by 10,000+ learners worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      <section className="py-24 bg-slate-50" data-testid="featured-courses">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-4">
                <span className="text-slate-700 text-sm font-semibold">Top Picks</span>
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900">Featured Courses</h2>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="hidden md:flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all"
            >
              View all <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-blue-100/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/course/${course.id}`)}
                data-testid={`course-card-${course.id}`}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                  <img
                    src={getThumbnailUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-course.png'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="bg-white text-indigo-700 font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                      View Course
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-600 text-white rounded-full">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                      <span className="text-xs font-semibold text-slate-600 ml-1">4.8</span>
                    </div>
                    <span className="text-xl font-extrabold text-indigo-600">${course.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-slate-900" data-testid="stats-section">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((s, i) => (
            <div key={i} className="text-center" data-testid={`stat-${i}`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                <s.icon size={20} className="text-white" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{s.val}</div>
              <div className="text-slate-400 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full mb-4">
              <span className="text-indigo-700 text-sm font-semibold">Why AI LearnHub?</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Built for real results</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Everything you need to go from beginner to expert, in one platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-200 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <div className="py-24 bg-white"><BlogSection /></div>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0056D2 0%, #003E99 100%)' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-5">
              Ready to Level<br />Up Your Skills?
            </h2>
            <p className="text-white/75 text-lg mb-8 max-w-md leading-relaxed">
              Join 10,000+ learners already transforming their careers. Your next breakthrough starts here.
            </p>
            <button
              data-testid="browse-courses-btn"
              onClick={() => navigate('/courses')}
              className="group px-8 py-4 bg-white text-primary font-bold text-base rounded-2xl hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
            >
              Browse All Courses
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Stay in the loop</h3>
            <p className="text-white/70 mb-6">Get the latest courses and learning tips straight to your inbox.</p>
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </div>
  );
}