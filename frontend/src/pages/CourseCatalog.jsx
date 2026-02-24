import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Search, SlidersHorizontal, Star, ArrowRight, BookOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Health', 'Language'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-slate-100 rounded-full" />
        <div className="h-4 w-4/5 bg-slate-100 rounded-full" />
        <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
        <div className="flex justify-between pt-2">
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function CourseCatalog({ user, logout }) {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses?status=published`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    let filtered = [...courses];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category === category);
    }
    return filtered;
  }, [search, category, courses]);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="course-catalog">
      <Navbar user={user} logout={logout} />

      {/* Page Header with gradient */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full mb-4">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-indigo-700 text-sm font-semibold">{courses.length} Courses Available</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3" data-testid="catalog-title">
            Explore <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">All Courses</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">Discover expert-led courses across every topic. Learn at your own pace.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Filters ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-8" data-testid="course-filters">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                data-testid="search-input"
                type="text"
                placeholder="Search courses by title or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>
            {/* Active filter count display */}
            {(search || category !== 'all') && (
              <button
                onClick={() => { setSearch(''); setCategory('all'); }}
                className="px-5 py-3 rounded-2xl font-semibold text-sm text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${category === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                data-testid={`category-${cat.toLowerCase()}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${category === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm font-medium text-slate-500 mb-5">
            {filteredCourses.length === 0
              ? 'No courses found'
              : `Showing ${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="loading">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 text-center" data-testid="no-courses">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mb-5">
              <BookOpen size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No courses found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search or category filter</p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); }}
              className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="courses-grid">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/course/${course.id}`)}
                data-testid={`course-card-${course.id}`}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
                  <img
                    src={course.thumbnail || '/placeholder-course.png'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-course.png'; }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-5">
                    <span className="bg-white text-indigo-700 font-bold text-sm px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                      View Course <ArrowRight size={14} />
                    </span>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-700 rounded-full border border-white/50 shadow-sm">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{course.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs font-semibold text-slate-600 ml-1">4.8</span>
                    </div>
                    <span className="text-xl font-extrabold text-indigo-600" data-testid={`price-${course.id}`}>
                      ${course.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}