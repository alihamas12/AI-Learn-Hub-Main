import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (search) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const token = localStorage.getItem('token');
    try {
      const newStatus = !currentStatus;
      await axios.patch(
        `${API}/admin/users/${userId}/status`,
        null,
        { 
          params: { active: newStatus },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `${API}/admin/users/${userId}/role`,
        null,
        { 
          params: { new_role: newRole },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-management" data-testid="user-management">
      <div className="management-header">
        <h2>User Management</h2>
        <div className="management-stats">
          <div className="stat-item">
            <span className="stat-label">Total Users:</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Students:</span>
            <span className="stat-value">{users.filter(u => u.role === 'student').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Instructors:</span>
            <span className="stat-value">{users.filter(u => u.role === 'instructor').length}</span>
          </div>
        </div>
      </div>

      <div className="management-filters">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <Input
            data-testid="user-search"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger data-testid="role-filter" style={{width: '200px'}}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="instructor">Instructors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="users-table-container">
        <table className="users-table" data-testid="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} data-testid={`user-row-${user.id}`}>
                  <td className="user-name">
                    <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Select 
                      value={user.role} 
                      onValueChange={(newRole) => handleUpdateRole(user.id, newRole)}
                    >
                      <SelectTrigger style={{width: '120px'}}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active !== false ? 'active' : 'inactive'}`}>
                      {user.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        size="sm"
                        variant={user.is_active !== false ? "ghost" : "default"}
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        data-testid={`toggle-user-${user.id}`}
                      >
                        {user.is_active !== false ? <UserX size={16} /> : <UserCheck size={16} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}