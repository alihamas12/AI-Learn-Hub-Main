import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AddLiveClassForm({ courseId, sectionId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration: '60',
    meeting_url: '',
    max_attendees: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        section_id: sectionId,
        duration: parseInt(formData.duration),
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
      };

      const token = localStorage.getItem('token');
      await axios.post(`${API}/courses/${courseId}/live-classes`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Live class scheduled successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to schedule live class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="add-live-class-form">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Schedule Live Class</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="live-class-form" style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <Label htmlFor="title">Class Title *</Label>
            <Input
              id="title"
              data-testid="live-class-title-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Live Q&A Session, Workshop, etc."
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="live-class-description-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will be covered in this session?"
              rows={3}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <Label htmlFor="scheduled_at">Date & Time *</Label>
              <Input
                id="scheduled_at"
                data-testid="scheduled-at-input"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                data-testid="duration-input"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="meeting_url">Meeting URL (Zoom, Google Meet, etc.)</Label>
            <Input
              id="meeting_url"
              data-testid="meeting-url-input"
              value={formData.meeting_url}
              onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="form-group">
            <Label htmlFor="max_attendees">Max Attendees (Optional)</Label>
            <Input
              id="max_attendees"
              data-testid="max-attendees-input"
              type="number"
              min="1"
              value={formData.max_attendees}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="submit-live-class-btn">
              {loading ? 'Scheduling...' : 'Schedule Live Class'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}