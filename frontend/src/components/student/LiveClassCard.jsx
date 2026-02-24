import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, Users } from 'lucide-react';

export default function LiveClassCard({ liveClass }) {
  const scheduledDate = new Date(liveClass.scheduled_at);
  const now = new Date();
  const isLive = liveClass.status === 'live';
  const isPast = scheduledDate < now && liveClass.status !== 'live';
  const isUpcoming = scheduledDate > now;

  const handleJoin = () => {
    if (liveClass.meeting_url) {
      window.open(liveClass.meeting_url, '_blank');
    }
  };

  return (
    <div className={`live-class-card ${isLive ? 'live' : ''}`} data-testid={`live-class-${liveClass.id}`}>
      <div className="live-class-header">
        <Video className="class-icon" size={24} />
        <h4>{liveClass.title}</h4>
        {isLive && <span className="live-badge">LIVE NOW</span>}
      </div>

      {liveClass.description && (
        <p className="class-description">{liveClass.description}</p>
      )}

      <div className="class-meta">
        <div className="meta-item">
          <Calendar size={16} />
          <span>{scheduledDate.toLocaleDateString()}</span>
        </div>
        <div className="meta-item">
          <Clock size={16} />
          <span>{scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="meta-item">
          <Clock size={16} />
          <span>{liveClass.duration} minutes</span>
        </div>
        {liveClass.max_attendees && (
          <div className="meta-item">
            <Users size={16} />
            <span>Max {liveClass.max_attendees} attendees</span>
          </div>
        )}
      </div>

      {isLive && liveClass.meeting_url && (
        <Button
          data-testid="join-live-class-btn"
          onClick={handleJoin}
          className="join-button"
        >
          Join Live Class
        </Button>
      )}

      {isUpcoming && (
        <div className="upcoming-notice">
          Starting in {Math.ceil((scheduledDate - now) / (1000 * 60 * 60))} hours
        </div>
      )}

      {isPast && liveClass.status === 'completed' && (
        <div className="completed-notice">This session has ended</div>
      )}
    </div>
  );
}