import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    try {
      const [analyticsRes, coursesRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAnalytics(analyticsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!analytics) return <div>No analytics data</div>;

  // Prepare chart data
  const categoryData = courses.reduce((acc, course) => {
    const cat = course.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat]++;
    return acc;
  }, {});

  const categoriesChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const statusData = [
    { name: 'Published', value: courses.filter(c => c.status === 'published').length },
    { name: 'Draft', value: courses.filter(c => c.status === 'draft').length }
  ];

  return (
    <div className="platform-analytics" data-testid="platform-analytics">
      <h2>Platform Analytics</h2>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="metric-card revenue">
          <DollarSign className="metric-icon" size={32} />
          <div className="metric-content">
            <h3 data-testid="total-revenue">${analytics.total_revenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
            <span className="metric-sub">Admin: ${analytics.admin_earnings.toFixed(2)}</span>
          </div>
        </div>

        <div className="metric-card users">
          <Users className="metric-icon" size={32} />
          <div className="metric-content">
            <h3 data-testid="total-users">{analytics.total_users}</h3>
            <p>Total Users</p>
            <span className="metric-sub">Active platform users</span>
          </div>
        </div>

        <div className="metric-card courses">
          <BookOpen className="metric-icon" size={32} />
          <div className="metric-content">
            <h3 data-testid="total-courses">{analytics.total_courses}</h3>
            <p>Published Courses</p>
            <span className="metric-sub">{courses.filter(c => c.status === 'draft').length} drafts</span>
          </div>
        </div>

        <div className="metric-card enrollments">
          <TrendingUp className="metric-icon" size={32} />
          <div className="metric-content">
            <h3 data-testid="total-enrollments">{analytics.total_enrollments}</h3>
            <p>Total Enrollments</p>
            <span className="metric-sub">Course registrations</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Courses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoriesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Course Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Courses */}
      <div className="top-courses-section">
        <h3>Recent Courses</h3>
        <div className="top-courses-list">
          {courses.slice(0, 5).map((course) => (
            <div key={course.id} className="top-course-item">
              <div className="course-thumbnail-small">
                <img src={course.thumbnail || '/placeholder-course.png'} alt={course.title} />
              </div>
              <div className="course-info-small">
                <h4>{course.title}</h4>
                <p>{course.category} • ${course.price}</p>
              </div>
              <span className={`status-badge ${course.status}`}>{course.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}