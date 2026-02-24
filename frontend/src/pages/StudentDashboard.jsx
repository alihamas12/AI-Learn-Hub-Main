import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import CertificateCard from '@/components/student/CertificateCard';
import {
  BookOpen, Award, TrendingUp, AlertCircle, Clock, ArrowRight, Play,
  ChevronRight, BarChart2, Star
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StudentDashboard({ user, logout }) {
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [instructorStatus, setInstructorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [enrollmentsRes, certificatesRes, instructorsRes] = await Promise.all([
        axios.get(`${API}/enrollments/my-courses`, { headers }),
        axios.get(`${API}/certificates/my-certificates`, { headers }),
        axios.get(`${API}/instructors`, { headers })
      ]);
      setEnrollments(enrollmentsRes.data);
      setCertificates(certificatesRes.data);
      const myInstructor = instructorsRes.data.find(i => i.user_id === user?.id);
      if (myInstructor) setInstructorStatus(myInstructor.verification_status);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeCourses = enrollments.filter(e => e.status === 'active');
  const completedCourses = enrollments.filter(e => e.status === 'completed');
  const avgProgress = activeCourses.length
    ? Math.round(activeCourses.reduce((acc, e) => acc + (e.progress || 0), 0) / activeCourses.length)
    : 0;

  const stats = [
    { icon: BookOpen, label: 'Active Courses', value: activeCourses.length, color: 'from-indigo-500 to-indigo-600', testId: 'active-courses-count' },
    { icon: Award, label: 'Certificates', value: certificates.length, color: 'from-violet-500 to-violet-600', testId: 'certificates-count' },
    { icon: TrendingUp, label: 'Completed', value: completedCourses.length, color: 'from-fuchsia-500 to-fuchsia-600', testId: 'completion-rate' },
    { icon: BarChart2, label: 'Avg Progress', value: `${avgProgress}%`, color: 'from-purple-500 to-purple-600', testId: 'avg-progress' },
  ];

  return (
    <div className="min-h-screen bg-slate-50" data-testid="student-dashboard">
      <Navbar user={user} logout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Status Banners */}
        {instructorStatus === 'pending' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
            <Clock size={18} className="shrink-0 text-amber-600" />
            <p className="text-sm font-medium flex-1">Your instructor application is under review.</p>
            <button onClick={() => navigate('/become-instructor')} className="text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
              Details <ChevronRight size={14} />
            </button>
          </div>
        )}
        {instructorStatus === 'rejected' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <p className="text-sm font-medium flex-1">Your instructor application was not approved.</p>
            <button onClick={() => navigate('/become-instructor')} className="text-sm font-bold text-red-600 hover:text-red-800 flex items-center gap-1">
              View Details <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-600 mb-1">Dashboard</p>
            <h1 className="text-3xl font-extrabold text-slate-900" data-testid="dashboard-title">
              Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-500 mt-1">Continue where you left off</p>
          </div>
          <button
            data-testid="browse-courses-btn"
            onClick={() => navigate('/courses')}
            className="btn-shine flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-200/60 hover:shadow-indigo-300/50 transition-all"
          >
            Browse Courses <ArrowRight size={16} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="dashboard-stats">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-300">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-md`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mb-0.5" data-testid={s.testId}>{s.value}</div>
              <div className="text-slate-500 text-xs font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl mb-6 w-fit shadow-sm">
            <TabsTrigger value="active" data-testid="active-tab" className="rounded-xl font-semibold text-sm px-5 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              Active Courses
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="completed-tab" className="rounded-xl font-semibold text-sm px-5 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              Completed
            </TabsTrigger>
            <TabsTrigger value="certificates" data-testid="certificates-tab" className="rounded-xl font-semibold text-sm px-5 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              Certificates
            </TabsTrigger>
          </TabsList>

          {/* Active */}
          <TabsContent value="active" data-testid="active-courses">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />)}
              </div>
            ) : activeCourses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100" data-testid="no-active-courses">
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No active courses yet</h3>
                <p className="text-slate-500 mb-6">Explore our catalog and start learning today</p>
                <button onClick={() => navigate('/courses')} className="btn-shine px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md inline-flex items-center gap-2">
                  Browse Courses <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCourses.map((enrollment) => (
                  <div key={enrollment.id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-300" data-testid={`enrollment-${enrollment.id}`}>
                    <div className="flex gap-4 p-5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-100 to-violet-100">
                        <img
                          src={enrollment.course?.thumbnail || '/placeholder-course.png'}
                          alt={enrollment.course?.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-course.png'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">{enrollment.course?.title}</h3>
                        <p className="text-slate-500 text-xs line-clamp-2 mb-3">{enrollment.course?.description?.substring(0, 80)}...</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-500">Progress</span>
                            <span className="text-xs font-bold text-indigo-600" data-testid={`progress-${enrollment.id}`}>{Math.round(enrollment.progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        data-testid={`continue-learning-${enrollment.id}`}
                        onClick={() => navigate(`/course/${enrollment.course_id}/learn`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all duration-200"
                      >
                        <Play size={14} className="fill-current" />
                        Continue Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed" data-testid="completed-courses">
            {completedCourses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={28} className="text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No completed courses yet</h3>
                <p className="text-slate-500">Keep going — you're making progress!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedCourses.map((enrollment) => (
                  <div key={enrollment.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    <div className="flex gap-4 p-5">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                        <img
                          src={enrollment.course?.thumbnail || '/placeholder-course.png'}
                          alt={enrollment.course?.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-course.png'; }}
                        />
                        <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                          <Award size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full mb-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Completed
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-3 line-clamp-2">{enrollment.course?.title}</h3>
                        <button
                          onClick={() => navigate(`/course/${enrollment.course_id}/learn`)}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                        >
                          Review Course <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates" data-testid="certificates-list">
            {certificates.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Award size={28} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No certificates yet</h3>
                <p className="text-slate-500">Complete courses and pass all quizzes to earn certificates!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => <CertificateCard key={cert.id} certificate={cert} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}