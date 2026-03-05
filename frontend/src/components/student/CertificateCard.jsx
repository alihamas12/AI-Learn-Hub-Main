import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Award, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../Logo/logo-main.png';
import signature from '../../Images/Signature.png';

// ─── Badge definitions ────────────────────────────────────────────────────────
export const BADGES = [
  {
    id: 'first_course',
    name: 'First Steps',
    description: 'Completed your first course',
    emoji: '🎯',
    color: 'from-blue-400 to-blue-600',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  {
    id: 'fast_learner',
    name: 'Fast Learner',
    description: 'Completed a course in under 7 days',
    emoji: '⚡',
    color: 'from-yellow-400 to-orange-500',
    border: 'border-yellow-300',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
  },
  {
    id: 'top_student',
    name: 'Top Student',
    description: 'Completed 3 or more courses',
    emoji: '🏆',
    color: 'from-amber-400 to-yellow-500',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Completed 5+ courses',
    emoji: '📚',
    color: 'from-purple-400 to-indigo-600',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  {
    id: 'ai_expert',
    name: 'AI Expert',
    description: 'Completed an AI or ML course',
    emoji: '🤖',
    color: 'from-teal-400 to-cyan-600',
    border: 'border-teal-300',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
  },
  {
    id: 'certified_pro',
    name: 'Certified Pro',
    description: 'Earned 3 certificates',
    emoji: '🎓',
    color: 'from-green-400 to-emerald-600',
    border: 'border-green-300',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
];

// Determine which badges a student has earned based on their certificates
export function getEarnedBadges(certificates = []) {
  const earned = [];
  const count = certificates.length;
  const titles = certificates.map(c => (c.course?.title || '').toLowerCase());

  if (count >= 1) earned.push('first_course');
  if (count >= 3) earned.push('top_student');
  if (count >= 5) earned.push('knowledge_seeker');
  if (count >= 3) earned.push('certified_pro');
  if (titles.some(t => t.includes('ai') || t.includes('machine') || t.includes('deep learning') || t.includes('neural')))
    earned.push('ai_expert');
  // fast_learner — always give after 1st cert for demo
  if (count >= 1) earned.push('fast_learner');

  return BADGES.filter(b => earned.includes(b.id));
}

// ─── Badge Component ──────────────────────────────────────────────────────────
export function BadgeItem({ badge, size = 'md' }) {
  const sizes = {
    sm: 'w-14 h-14 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl',
  };
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-white/30`}
        title={badge.description}
      >
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
  const certRef = useRef(null);

  const studentName = certificate.user_name || certificate.student_name || 'Student';
  const courseTitle = certificate.course?.title || certificate.course_title || 'Course';
  const issuedDate = new Date(certificate.issued_date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const certId = certificate.id || '';

  const handlePrint = () => {
    const printContent = document.getElementById(`cert-print-${certId}`);
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Certificate - ${courseTitle}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Georgia', serif; background: white; }
            .cert-page { width: 1120px; height: 790px; }
          </style>
        </head>
        <body>
          <div class="cert-page">${printContent.innerHTML}</div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
    toast.success('Certificate print dialog opened!');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* ── Certificate Preview ── */}
      <div
        id={`cert-print-${certId}`}
        ref={certRef}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          position: 'relative',
          padding: '48px 56px',
          minHeight: '420px',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />
        {/* Corner ornaments */}
        <div style={{ position: 'absolute', top: 18, left: 18, width: 48, height: 48, border: '2px solid rgba(167,139,250,0.5)', borderRadius: 6 }} />
        <div style={{ position: 'absolute', top: 22, left: 22, width: 40, height: 40, border: '1px solid rgba(167,139,250,0.3)', borderRadius: 4 }} />
        <div style={{ position: 'absolute', bottom: 18, right: 18, width: 48, height: 48, border: '2px solid rgba(167,139,250,0.5)', borderRadius: 6 }} />
        <div style={{ position: 'absolute', bottom: 22, right: 22, width: 40, height: 40, border: '1px solid rgba(167,139,250,0.3)', borderRadius: 4 }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <img src={logo} alt="AI LearnHub" style={{ height: 48, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(199,210,254,0.7)', letterSpacing: 3, textTransform: 'uppercase' }}>Certificate ID</div>
            <div style={{ fontSize: 10, color: 'rgba(199,210,254,0.9)', fontFamily: 'monospace', marginTop: 2 }}>{certId.slice(0, 16).toUpperCase()}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#c7d2fe', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 10 }}>
            ✦ Certificate of Completion ✦
          </div>
          <div style={{ fontSize: 13, color: 'rgba(199,210,254,0.7)', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
            This certifies that
          </div>
          <div style={{
            fontSize: 40, fontFamily: 'Georgia, serif', color: '#ffffff',
            fontStyle: 'italic', fontWeight: 700, letterSpacing: 1,
            textShadow: '0 2px 20px rgba(139,92,246,0.5)',
            marginBottom: 12,
          }}>
            {studentName}
          </div>
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #818cf8, #a78bfa, #818cf8, transparent)', maxWidth: 320, margin: '0 auto 16px' }} />
          <div style={{ fontSize: 13, color: 'rgba(199,210,254,0.8)', letterSpacing: 1, marginBottom: 8 }}>
            has successfully completed the course
          </div>
          <div style={{
            fontSize: 22, color: '#e0e7ff', fontWeight: 700,
            fontFamily: 'Georgia, serif', maxWidth: 600, margin: '0 auto',
            lineHeight: 1.3,
          }}>
            {courseTitle}
          </div>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {['🏆', '⭐', '🎓'].map((emoji, i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(99,102,241,0.3)',
              border: '1px solid rgba(139,92,246,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>{emoji}</div>
          ))}
        </div>

        {/* Footer row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
          {/* Left: Date */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: 1, background: 'rgba(167,139,250,0.5)', width: 160, marginBottom: 6 }} />
            <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600 }}>{issuedDate}</div>
            <div style={{ fontSize: 10, color: 'rgba(199,210,254,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Date Issued</div>
          </div>

          {/* Center: Seal */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: '3px solid rgba(167,139,250,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 0 20px rgba(139,92,246,0.4)',
            }}>
              <div style={{ fontSize: 28 }}>🎓</div>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(199,210,254,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Official Seal</div>
          </div>

          {/* Right: Signature */}
          <div style={{ textAlign: 'center' }}>
            <img
              src={signature}
              alt="Signature"
              style={{ height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9, marginBottom: 6 }}
            />
            <div style={{ height: 1, background: 'rgba(167,139,250,0.5)', width: 160, marginBottom: 6 }} />
            <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600 }}>AI LearnHub</div>
            <div style={{ fontSize: 10, color: 'rgba(199,210,254,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Director of Education</div>
          </div>
        </div>
      </div>

      {/* ── Card Footer ── */}
      <div className="p-5 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-tight">{courseTitle}</h3>
          <p className="text-slate-500 text-sm mt-0.5">Issued {issuedDate}</p>
          <p className="text-slate-400 text-xs mt-0.5 font-mono">ID: {certId.slice(0, 16).toUpperCase()}</p>
        </div>
        <Button
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          data-testid="download-certificate-btn"
        >
          <Download size={16} className="mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
