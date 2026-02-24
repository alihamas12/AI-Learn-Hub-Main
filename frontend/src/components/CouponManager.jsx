import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    valid_from: '',
    valid_until: '',
    usage_limit: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/coupons`, {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Coupon created successfully!');
      setShowForm(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        valid_from: '',
        valid_until: '',
        usage_limit: ''
      });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleCouponStatus = async (couponId, currentStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API}/coupons/${couponId}`, {
        is_active: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  return (
    <div className="coupon-manager" data-testid="coupon-manager">
      <div className="coupon-header">
        <h2>Manage Coupons</h2>
        <Button
          data-testid="create-coupon-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} className="mr-2" />
          Create Coupon
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateCoupon} className="coupon-form" data-testid="coupon-form">
          <div className="form-grid">
            <div className="form-group">
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                data-testid="coupon-code-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
                required
              />
            </div>

            <div className="form-group">
              <Label htmlFor="discount_type">Discount Type *</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
              >
                <SelectTrigger data-testid="discount-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label htmlFor="discount_value">
                Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                id="discount_value"
                data-testid="discount-value-input"
                type="number"
                step="0.01"
                min="0"
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
              <Input
                id="usage_limit"
                data-testid="usage-limit-input"
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="Unlimited"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="valid_from">Valid From *</Label>
              <Input
                id="valid_from"
                data-testid="valid-from-input"
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Label htmlFor="valid_until">Valid Until *</Label>
              <Input
                id="valid_until"
                data-testid="valid-until-input"
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="submit-coupon-btn">
              Create Coupon
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading coupons...</div>
      ) : (
        <div className="coupons-table" data-testid="coupons-table">
          {coupons.length === 0 ? (
            <div className="empty-state">No coupons created yet</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Valid Period</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} data-testid={`coupon-row-${coupon.id}`}>
                    <td className="coupon-code">{coupon.code}</td>
                    <td>
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value}`}
                    </td>
                    <td className="date-cell">
                      {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_until).toLocaleDateString()}
                    </td>
                    <td>
                      {coupon.used_count} / {coupon.usage_limit || '∞'}
                    </td>
                    <td>
                      <button
                        data-testid={`toggle-status-${coupon.id}`}
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                        className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <button
                        data-testid={`delete-coupon-${coupon.id}`}
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="action-btn delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
