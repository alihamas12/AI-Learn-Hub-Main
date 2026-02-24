import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function InstructorApprovals() {
  const [instructors, setInstructors] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const token = localStorage.getItem('token');
    try {
      const [instructorsRes, usersRes] = await Promise.all([
        axios.get(`${API}/instructors`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setInstructors(instructorsRes.data);
      
      // Create user lookup map
      const userMap = {};
      usersRes.data.forEach(user => {
        userMap[user.id] = user;
      });
      setUsers(userMap);
    } catch (error) {
      toast.error('Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (instructorId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API}/instructors/${instructorId}/approve`, null, {
        params: { approved: true },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Instructor approved!');
      fetchInstructors();
    } catch (error) {
      toast.error('Failed to approve instructor');
    }
  };

  const handleReject = async (instructorId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API}/instructors/${instructorId}/approve`, null, {
        params: { approved: false },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Instructor rejected');
      fetchInstructors();
    } catch (error) {
      toast.error('Failed to reject instructor');
    }
  };

  const pendingInstructors = instructors.filter(i => i.verification_status === 'pending');
  const approvedInstructors = instructors.filter(i => i.verification_status === 'approved');

  if (loading) return <div className="loading">Loading instructors...</div>;

  return (
    <div className="instructor-approvals" data-testid="instructor-approvals">
      <div className="approvals-header">
        <h2>Instructor Applications</h2>
        <div className="approvals-stats">
          <div className="stat-badge pending">
            <Clock size={16} />
            <span>{pendingInstructors.length} Pending</span>
          </div>
          <div className="stat-badge approved">
            <CheckCircle size={16} />
            <span>{approvedInstructors.length} Approved</span>
          </div>
        </div>
      </div>

      {pendingInstructors.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} className="empty-icon" />
          <p>No pending instructor applications</p>
        </div>
      ) : (
        <div className="applications-list">
          {pendingInstructors.map((instructor) => {
            const user = users[instructor.user_id];
            if (!user) return null;
            
            return (
              <div key={instructor.id} className="application-card" data-testid={`application-${instructor.id}`}>
                <div className="application-header">
                  <div className="applicant-info">
                    <div className="applicant-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3>{user.name}</h3>
                      <p className="applicant-email">{user.email}</p>
                    </div>
                  </div>
                  <span className="application-date">
                    Applied {new Date(instructor.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="application-bio">
                  <h4>Teaching Background</h4>
                  <p>{instructor.bio}</p>
                </div>

                <div className="application-actions">
                  <Button
                    data-testid={`approve-${instructor.id}`}
                    onClick={() => handleApprove(instructor.id)}
                    className="approve-btn"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Approve
                  </Button>
                  <Button
                    data-testid={`reject-${instructor.id}`}
                    onClick={() => handleReject(instructor.id)}
                    variant="outline"
                    className="reject-btn"
                  >
                    <XCircle size={18} className="mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {approvedInstructors.length > 0 && (
        <div className="approved-section">
          <h3>Approved Instructors ({approvedInstructors.length})</h3>
          <div className="approved-list">
            {approvedInstructors.map((instructor) => {
              const user = users[instructor.user_id];
              if (!user) return null;
              
              return (
                <div key={instructor.id} className="approved-item">
                  <div className="applicant-avatar small">{user.name.charAt(0).toUpperCase()}</div>
                  <div className="approved-info">
                    <span className="approved-name">{user.name}</span>
                    <span className="approved-email">{user.email}</span>
                  </div>
                  <span className="earnings-badge">${instructor.earnings.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}