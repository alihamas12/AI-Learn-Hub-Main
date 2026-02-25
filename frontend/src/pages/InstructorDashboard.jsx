import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import QuickCreateCourseModal from '@/components/instructor/QuickCreateCourseModal';
import CoursesList from '@/components/instructor/CoursesList';
import EarningsView from '@/components/instructor/EarningsView';
import StripeConnectCard from '@/components/instructor/StripeConnectCard';
import {
  Plus, BookOpen, DollarSign, Users, Clock, AlertCircle, TrendingUp, ArrowRight, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function InstructorDashboard({ user, logout }) {
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, students: 0, earnings: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const stripeConnected = searchParams.get('stripe_connected');
    const stripeError = searchParams.get('stripe_error');
    if (stripeConnected === 'true') {
      toast.success("Stripe account connected! You'll receive 90% of course sales.");
      window.history.replaceState({}, '', '/dashboard/instructor');
    } else if (stripeError === 'true') {
      toast.error('Failed to connect Stripe. Please try again.');
      window.history.replaceState({}, '', '/dashboard/instructor');
    }
  }, [searchParams]);

  useEffect(() => { if (user) fetchInstructorData(); }, [user]);

  const fetchInstructorData = async () => {
    try {
      let activeInstructor = null;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const instructorsRes = await axios.get(`${API}/instructors`, { headers });
      activeInstructor = instructorsRes.data.find(i => i.user_id === user.id);
      if (user?.role === 'admin') {
        if (!activeInstructor) activeInstructor = { id: `admin-inst-${user.id}`, verification_status: 'approved', earnings: 0 };
      } else {
        if (!activeInstructor) { setLoading(false); return; }
      }
      setInstructor(activeInstructor);
      const coursesRes = await axios.get(`${API}/courses?instructor_id=${activeInstructor.id}&status=all&token=${token}`, { headers });
      const myCourses = coursesRes.data;
      setCourses(myCourses);
      const publishedCourses = myCourses.filter(c => c.status === 'published');
      setStats({ courses: myCourses.length, published: publishedCourses.length, students: 0, earnings: activeInstructor.earnings || 0 });
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (courseId) => {
    setShowCreateForm(false);
    if (courseId) {
      navigate(`/instructor/course/${courseId}`);
    } else {
      fetchInstructorData();
    }
  };

  if (loading) {
    return (
      <div data-testid="instructor-dashboard" className="min-h-screen bg-slate-50">
        <Navbar user={user} logout={logout} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin' && (!instructor || instructor.verification_status === 'pending')) {
    return (
      <div data-testid="instructor-dashboard" className="min-h-screen bg-slate-50">
        <Navbar user={user} logout={logout} />
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="bg-white rounded-3xl border border-amber-200 p-12 max-w-md text-center shadow-xl shadow-amber-50" data-testid="pending-approval">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Clock size={36} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Application Under Review</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">Your instructor account is being verified by our team. This usually takes 24-48 hours.</p>
            <button
              onClick={() => navigate('/dashboard/student')}
              className="w-full py-3 rounded-2xl font-bold text-slate-700 border-2 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} /> Go to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin' && instructor?.verification_status === 'rejected') {
    return (
      <div data-testid="instructor-dashboard" className="min-h-screen bg-slate-50">
        <Navbar user={user} logout={logout} />
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="bg-white rounded-3xl border border-red-200 p-12 max-w-md text-center shadow-xl shadow-red-50" data-testid="status-rejected">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Application Not Approved</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">Unfortunately, we couldn't approve your instructor profile at this time.</p>
            <button
              onClick={() => navigate('/dashboard/student')}
              className="w-full py-3 rounded-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: BookOpen, label: 'Total Courses', value: stats.courses, sub: `${stats.published} published`, color: 'from-indigo-500 to-indigo-600', testId: 'courses-count' },
    { icon: Users, label: 'Total Students', value: stats.students, sub: 'Across all courses', color: 'from-violet-500 to-violet-600', testId: 'students-count' },
    { icon: DollarSign, label: 'Total Earnings', value: `$${stats.earnings.toFixed(2)}`, sub: '90% revenue share', color: 'from-fuchsia-500 to-fuchsia-600', testId: 'earnings-amount' },
    { icon: TrendingUp, label: 'Published', value: stats.published, sub: `${stats.courses - stats.published} drafts`, color: 'from-purple-500 to-purple-600', testId: 'published-count' },
  ];

  return (
    <div data-testid="instructor-dashboard" className="min-h-screen bg-slate-50">
      <Navbar user={user} logout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-600 mb-1">Instructor Dashboard</p>
            <h1 className="text-3xl font-extrabold text-slate-900" data-testid="dashboard-title">
              Hello, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-500 mt-1">Manage your courses and track your earnings</p>
          </div>
          <button
            data-testid="create-course-btn"
            onClick={() => setShowCreateForm(true)}
            className="btn-shine flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-200/60 hover:shadow-indigo-300/50 transition-all"
          >
            <Plus size={18} />
            Create Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="instructor-stats">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-300">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-md`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mb-0.5" data-testid={s.testId}>{s.value}</div>
              <div className="text-slate-500 text-xs font-medium">{s.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl mb-6 w-fit shadow-sm">
            <TabsTrigger value="courses" data-testid="courses-tab" className="rounded-xl font-semibold text-sm px-5 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              My Courses
            </TabsTrigger>
            <TabsTrigger value="earnings" data-testid="earnings-tab" className="rounded-xl font-semibold text-sm px-5 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
              <CoursesList courses={courses} instructorId={instructor.id} onRefresh={fetchInstructorData} />
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
              <StripeConnectCard />
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
              <EarningsView instructorId={instructor.id} totalEarnings={stats.earnings} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <QuickCreateCourseModal
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={handleCourseCreated}
      />
    </div>
  );
}