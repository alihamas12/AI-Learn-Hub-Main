import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import CourseReviews from '@/components/student/CourseReviews';
import {
  BookOpen, Clock, Award, Check, Play, Tag, ArrowLeft,
  Shield, Infinity, Smartphone, Star
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CourseDetail({ user, logout }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
    if (user) checkEnrollment();
  }, [id, user]);

  const fetchCourse = async () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        axios.get(`${API}/courses/${id}`, { headers }),
        axios.get(`${API}/courses/${id}/lessons`, { headers })
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API}/enrollments/my-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEnrolled(res.data.some(e => e.course_id === id));
    } catch { /* silent */ }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    if (!user) { toast.error('Please login to apply coupon'); return; }
    const token = localStorage.getItem('token');
    setValidatingCoupon(true);
    try {
      const res = await axios.post(
        `${API}/coupons/validate?code=${couponCode}&course_id=${id}`, null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppliedCoupon(res.data);
      toast.success('Coupon applied!');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => { setCouponCode(''); setAppliedCoupon(null); toast.info('Coupon removed'); };

  const handleEnroll = async () => {
    if (!user) { toast.error('Please login to enroll'); navigate('/login'); return; }
    const token = localStorage.getItem('token');
    setEnrolling(true);
    try {
      const url = appliedCoupon
        ? `${API}/payments/checkout?course_id=${id}&coupon_code=${couponCode}`
        : `${API}/payments/checkout?course_id=${id}`;
      const res = await axios.post(url, null, { headers: { Authorization: `Bearer ${token}` } });
      window.location.href = res.data.url;
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to start checkout');
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50" data-testid="course-detail">
        <Navbar user={user} logout={logout} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            <div className="h-72 bg-white rounded-3xl border border-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} logout={logout} />
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Course not found</h2>
        <button onClick={() => navigate('/courses')} className="text-indigo-600 font-semibold hover:underline">← Back to Courses</button>
      </div>
    </div>
  );

  const includes = [
    { icon: Infinity, text: 'Full lifetime access' },
    { icon: Smartphone, text: 'Access on mobile & TV' },
    { icon: Award, text: 'Certificate of completion' },
    { icon: Clock, text: 'Self-paced learning' },
  ];

  return (
    <div className="min-h-screen bg-slate-50" data-testid="course-detail">
      <Navbar user={user} logout={logout} />

      {/* ── Hero Banner ── */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          {/* Back Link */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row items-start gap-12">
            {/* Left: Info */}
            <div className="flex-1 space-y-5">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30"
                data-testid="course-category"
              >
                <Tag size={12} /> {course.category}
              </span>

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight"
                data-testid="course-title"
              >
                {course.title}
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl" data-testid="course-description">
                {course.description}
              </p>

              {/* Stars */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-amber-400 font-bold text-sm">4.8</span>
                <span className="text-slate-500 text-sm">(Highly Rated)</span>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium" data-testid="course-meta">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 text-slate-300 rounded-xl border border-white/10">
                  <BookOpen size={15} className="text-indigo-400" />
                  <span data-testid="lessons-count">{lessons.length} Lessons</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 text-slate-300 rounded-xl border border-white/10">
                  <Clock size={15} className="text-indigo-400" />
                  <span>Self-paced</span>
                </div>
                {course.instructor && (
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 text-slate-300 rounded-xl border border-white/10">
                    <Award size={15} className="text-indigo-400" />
                    <Link
                      to={`/profile/${course.instructor.id}`}
                      className="hover:text-white transition-colors"
                      data-testid="instructor-name"
                    >
                      {course.instructor.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Thumbnail */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="aspect-video rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group">
                <img
                  src={course.thumbnail || '/placeholder-course.png'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-course.png'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Lessons + Reviews ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lessons */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-900">Course Content</h2>
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {lessons.length} lessons
                </span>
              </div>
              <div className="divide-y divide-slate-50" data-testid="lessons-list">
                {lessons.length === 0 ? (
                  <p className="text-slate-400 text-center py-12 text-sm">No lessons available yet</p>
                ) : (
                  lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 px-7 py-4 hover:bg-slate-50 transition-colors group"
                      data-testid={`lesson-${lesson.id}`}
                    >
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{lesson.title}</h4>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">{lesson.type}</span>
                          {lesson.duration && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={10} /> {lesson.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                      <Play size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-7 py-5 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-900">Student Reviews</h2>
              </div>
              <div className="p-7">
                <CourseReviews courseId={id} isEnrolled={isEnrolled} userId={user?.id} />
              </div>
            </div>
          </div>

          {/* ── Right: Sticky Pricing ── */}
          <div className="space-y-4">
            <div className="sticky top-6">
              {isEnrolled ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 text-center space-y-4">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-lg">You're Enrolled!</p>
                    <p className="text-slate-400 text-sm mt-1">Start learning at your own pace</p>
                  </div>
                  <button
                    data-testid="start-learning-btn"
                    onClick={() => navigate(`/course/${id}/learn`)}
                    className="btn-shine w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/60 transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={16} className="fill-white" /> Continue Learning
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-5">
                  {/* Price */}
                  <div data-testid="course-price">
                    {appliedCoupon ? (
                      <div className="space-y-1">
                        <div className="flex items-end gap-3">
                          <span className="text-4xl font-extrabold text-slate-900">${appliedCoupon.final_price.toFixed(2)}</span>
                          <span className="text-xl text-slate-400 line-through mb-1">${appliedCoupon.original_price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {appliedCoupon.coupon.discount_type === 'percentage'
                              ? `${appliedCoupon.coupon.discount_value}% OFF`
                              : `$${appliedCoupon.coupon.discount_value} OFF`}
                          </span>
                          <span className="text-xs text-green-600 font-semibold">Saved ${appliedCoupon.discount_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-extrabold text-slate-900">${course.price}</span>
                        <p className="text-slate-400 text-xs mt-1 font-medium">One-time payment · Lifetime access</p>
                      </div>
                    )}
                  </div>

                  {/* Coupon */}
                  {!appliedCoupon ? (
                    <div className="space-y-2" data-testid="coupon-section">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Have a coupon?</label>
                      <div className="flex gap-2">
                        <input
                          data-testid="coupon-input"
                          type="text"
                          placeholder="CODE123"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={validatingCoupon}
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        />
                        <button
                          data-testid="apply-coupon-btn"
                          onClick={validateCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                        >
                          {validatingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 bg-green-50 rounded-2xl border border-green-200" data-testid="applied-coupon">
                      <div className="flex items-center gap-2 text-green-700">
                        <Check size={16} className="bg-green-600 text-white rounded-full p-0.5" />
                        <span className="text-sm font-bold">Coupon Applied!</span>
                      </div>
                      <button
                        data-testid="remove-coupon-btn"
                        onClick={removeCoupon}
                        className="text-xs text-slate-500 font-semibold hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Enroll CTA */}
                  <button
                    data-testid="enroll-btn"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn-shine w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/60 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {enrolling
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Enroll Now'
                    }
                  </button>

                  <p className="text-center text-xs text-slate-400 font-medium">30-day money-back guarantee</p>
                </div>
              )}

              {/* What's Included */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                <h3 className="font-extrabold text-slate-900 mb-5">What's included</h3>
                <div className="space-y-3">
                  {includes.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-indigo-600" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantee */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Shield size={20} className="text-indigo-200" />
                  <h3 className="font-extrabold">Satisfaction Guaranteed</h3>
                </div>
                <p className="text-indigo-200 text-sm leading-relaxed">
                  Not satisfied? Get a full refund within 30 days. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}