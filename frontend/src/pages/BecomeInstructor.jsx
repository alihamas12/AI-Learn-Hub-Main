import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import { BookOpen, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BecomeInstructor({ user, logout }) {
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkExistingApplication();
    }
  }, [user]);

  const checkExistingApplication = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/instructors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const myInstructor = response.data.find(i => i.user_id === user.id);

      if (myInstructor) {
        setAlreadyApplied(true);
        setApplicationStatus(myInstructor.verification_status);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/instructors/apply`, null, {
        params: { bio },
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Application submitted! Wait for admin approval.');
      setAlreadyApplied(true);
      setApplicationStatus('pending');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div data-testid="become-instructor">
        <Navbar user={user} logout={logout} />
        <div className="auth-page">
          <div className="auth-container">
            <h1>Become an Instructor</h1>
            <p>Please login to apply as an instructor</p>
            <Button onClick={() => navigate('/login')}>Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div data-testid="become-instructor">
        <Navbar user={user} logout={logout} />
        <div className="become-instructor-page">
          <div className="application-status-container">
            {applicationStatus === 'pending' && (
              <div className="status-card pending" data-testid="status-pending">
                <BookOpen size={64} className="status-icon" />
                <h1>Application Under Review</h1>
                <p>Your instructor application is being reviewed by our team.</p>
                <p>You'll be notified via email once approved.</p>
              </div>
            )}

            {applicationStatus === 'approved' && (
              <div className="status-card approved" data-testid="status-approved">
                <CheckCircle size={64} className="status-icon" />
                <h1>You're an Instructor!</h1>
                <p>Congratulations! Your application has been approved.</p>
                <Button onClick={() => navigate('/dashboard/instructor')}>
                  Go to Instructor Dashboard
                </Button>
              </div>
            )}

            {applicationStatus === 'rejected' && (
              <div className="status-card rejected" data-testid="status-rejected">
                <h1>Application Not Approved</h1>
                <p>Unfortunately, your instructor application was not approved at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="become-instructor">
      <Navbar user={user} logout={logout} />

      <div className="become-instructor-page">
        <div className="instructor-application-container">
          <div className="application-header">
            <BookOpen size={64} className="header-icon" />
            <h1>Become an Instructor</h1>
            <p>Share your knowledge and earn money by teaching on AI LearnHub</p>
          </div>

          <div className="benefits-section">
            <h2>Why Teach on AI LearnHub?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>Earn Money</h3>
                <p>Keep 85% of your course sales</p>
              </div>
              <div className="benefit-card">
                <h3>Reach Students</h3>
                <p>Access thousands of eager learners</p>
              </div>
              <div className="benefit-card">
                <h3>AI Tools</h3>
                <p>Course assistant to help create content</p>
              </div>
              <div className="benefit-card">
                <h3>Full Support</h3>
                <p>We handle payments, hosting, and tech</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="application-form" data-testid="instructor-application-form">
            <h2>Tell Us About Yourself</h2>

            <div className="form-group">
              <Label htmlFor="bio">Your Teaching Background *</Label>
              <Textarea
                id="bio"
                data-testid="bio-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your experience, expertise, and what you'd like to teach..."
                rows={6}
                required
              />
              <p className="help-text">Minimum 50 characters</p>
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                disabled={loading || bio.length < 50}
                data-testid="submit-application-btn"
                size="lg"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
