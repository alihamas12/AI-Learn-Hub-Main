import React, { useState, useEffect, useRef } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CertificateContent from './CertificateContent';
import { drawCertificate } from '../../utils/certificateCanvas';

// ─── Badge definitions ────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first_course', name: 'First Steps', description: 'Completed your first course', emoji: '🎯', color: 'from-blue-400 to-blue-600' },
  { id: 'fast_learner', name: 'Fast Learner', description: 'Completed a course quickly', emoji: '⚡', color: 'from-yellow-400 to-orange-500' },
  { id: 'top_student', name: 'Top Student', description: 'Completed 3+ courses', emoji: '🏆', color: 'from-amber-400 to-yellow-500' },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Completed 5+ courses', emoji: '📚', color: 'from-purple-400 to-indigo-600' },
  { id: 'ai_expert', name: 'AI Expert', description: 'Completed an AI/ML course', emoji: '🤖', color: 'from-teal-400 to-cyan-600' },
  { id: 'certified_pro', name: 'Certified Pro', description: 'Earned 3+ certificates', emoji: '🎓', color: 'from-green-400 to-emerald-600' },
];

export function getEarnedBadges(certificates = []) {
  const earned = [];
  const count = certificates.length;
  const titles = certificates.map(c => (c.course?.title || '').toLowerCase());
  if (count >= 1) { earned.push('first_course'); earned.push('fast_learner'); }
  if (count >= 3) { earned.push('top_student'); earned.push('certified_pro'); }
  if (count >= 5) earned.push('knowledge_seeker');
  if (titles.some(t => t.includes('ai') || t.includes('machine') || t.includes('deep learning') || t.includes('neural')))
    earned.push('ai_expert');
  return BADGES.filter(b => earned.includes(b.id));
}

export function BadgeItem({ badge, size = 'md' }) {
  const sizes = { sm: 'w-14 h-14 text-2xl', md: 'w-20 h-20 text-3xl', lg: 'w-24 h-24 text-4xl' };
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-white/30`} title={badge.description}>
        <span>{badge.emoji}</span>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-slate-800 leading-tight">{badge.name}</p>
        <p className="text-xs text-slate-500 leading-tight max-w-[80px]">{badge.description}</p>
      </div>
    </div>
  );
}


// ─── Certificate Card ─────────────────────────────────────────────────────────
export default function CertificateCard({ certificate }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const containerRef = useRef(null);

  const studentName = certificate?.user_name || certificate?.student_name || certificate?.user?.name || 'Student';
  const courseTitle = certificate?.course?.title || certificate?.course_title || 'Course';
  const issuedDate = certificate?.issued_date ? new Date(certificate.issued_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date Pending';
  const certId = (certificate?.id || certificate?._id || '').toString().slice(0, 16).toUpperCase();

  // Robust Javascript-based scaling
  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32; // padding
        const newScale = Math.min(containerWidth / 1120, 1);
        setScaleFactor(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1120; canvas.height = 790;
      await drawCertificate(canvas, studentName, courseTitle, issuedDate, certId);
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `Certificate_${courseTitle.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        toast.success('Certificate downloaded!');
      }, 'image/png');
    } catch (e) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-full w-full">
      {/* ── Responsive Preview Wrapper ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-slate-50 relative p-4 flex items-center justify-center min-h-[220px]"
      >
        <div
          className="relative bg-white shadow-2xl origin-center aspect-[1120/790] shrink-0"
          style={{
            width: '1120px',
            transform: `scale(${scaleFactor})`,
          }}
        >
          <CertificateContent
            studentName={studentName}
            courseTitle={courseTitle}
            issuedDate={issuedDate}
            certId={certId}
          />
        </div>
      </div>

      {/* Info bar */}
      <div className="p-4 flex items-center justify-between bg-slate-50 border-t border-slate-200 mt-auto">
        <div>
          <p className="text-slate-500 text-xs font-medium">Issued {issuedDate}</p>
          <p className="text-slate-400 text-[10px] font-mono leading-tight">{certId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/certificate/${certificate.id || certificate._id}`)}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 font-semibold rounded-lg transition-all text-xs"
            title="View full certificate page"
          >
            <ExternalLink size={14} />
            View
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-all text-xs"
          >
            <Download size={14} />
            {downloading ? 'Preparing...' : 'Download PNG'}
          </button>
        </div>
      </div>
    </div>
  );
}
