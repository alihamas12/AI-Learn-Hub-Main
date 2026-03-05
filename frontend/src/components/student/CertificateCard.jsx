import React, { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import logoSrc from '../../Logo/logo-main.png';
import signatureSrc from '../../Images/Signature.png';

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

// ─── Helper: load an image and return HTMLImageElement ────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─── Helper: wrap text on canvas ─────────────────────────────────────────────
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const totalH = lines.length * lineHeight;
  const startY = y - totalH / 2 + lineHeight / 2;
  lines.forEach((l, i) => {
    ctx.fillText(l, x, startY + i * lineHeight);
  });
  return lines.length * lineHeight;
}

// ─── Main draw function ───────────────────────────────────────────────────────
async function drawCertificate(canvas, studentName, courseTitle, issuedDate, certId) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');

  // ── Background gradient ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#1e1b4b');
  bg.addColorStop(1, '#312e81');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Glow overlay ──
  const g1 = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.6);
  g1.addColorStop(0, 'rgba(139,92,246,0.18)');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // ── Logo (top-left) ──
  try {
    const logo = await loadImage(logoSrc);
    const lH = 70;
    const lW = (logo.width / logo.height) * lH;
    // Draw white version via composite
    const tmpC = document.createElement('canvas');
    tmpC.width = lW * 2; tmpC.height = lH * 2;
    const tCtx = tmpC.getContext('2d');
    tCtx.drawImage(logo, 0, 0, lW * 2, lH * 2);
    tCtx.globalCompositeOperation = 'source-in';
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, lW * 2, lH * 2);
    ctx.drawImage(tmpC, 50, 36, lW, lH);
  } catch (_) { /* logo failed silently */ }

  // ── Cert ID (top-right) ──
  ctx.fillStyle = 'rgba(199,210,254,0.55)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('CERTIFICATE ID', W - 50, 52);
  ctx.fillStyle = 'rgba(199,210,254,0.85)';
  ctx.font = '12px monospace';
  ctx.fillText(certId, W - 50, 70);

  // ── "Certificate of Completion" label ──
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a5b4fc';
  ctx.font = '13px Arial';
  ctx.letterSpacing = '0px';
  ctx.fillText('✦   CERTIFICATE OF COMPLETION   ✦', W / 2, 140);

  ctx.fillStyle = 'rgba(199,210,254,0.6)';
  ctx.font = '13px Arial';
  ctx.fillText('THIS CERTIFIES THAT', W / 2, 166);

  // ── Student Name (gold italic) ──
  ctx.fillStyle = '#fde68a';
  ctx.font = 'italic bold 52px Georgia, serif';
  ctx.shadowColor = 'rgba(251,191,36,0.4)';
  ctx.shadowBlur = 18;
  ctx.fillText(studentName, W / 2, 226);
  ctx.shadowBlur = 0;

  // ── Gold divider ──
  const div = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  div.addColorStop(0, 'rgba(251,191,36,0)');
  div.addColorStop(0.3, '#fbbf24');
  div.addColorStop(0.7, '#fde68a');
  div.addColorStop(1, 'rgba(251,191,36,0)');
  ctx.strokeStyle = div;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, 248);
  ctx.lineTo(W / 2 + 200, 248);
  ctx.stroke();

  // ── "has successfully completed…" ──
  ctx.fillStyle = 'rgba(199,210,254,0.72)';
  ctx.font = '14px Arial';
  ctx.fillText('has successfully completed the course', W / 2, 278);

  // ── Course title (white, wrapped) ──
  ctx.fillStyle = '#e0e7ff';
  ctx.font = 'bold 22px Georgia, serif';
  wrapText(ctx, courseTitle, W / 2, 320, W - 160, 32);

  // ── Footer dividers ──
  const footerY = H - 100;
  ctx.strokeStyle = 'rgba(167,139,250,0.42)';
  ctx.lineWidth = 1;
  // Left line
  ctx.beginPath(); ctx.moveTo(50, footerY); ctx.lineTo(220, footerY); ctx.stroke();
  // Right line
  ctx.beginPath(); ctx.moveTo(W - 220, footerY); ctx.lineTo(W - 50, footerY); ctx.stroke();

  // ── Date (bottom-left) ──
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 15px Arial';
  ctx.fillText(issuedDate, 135, footerY + 22);
  ctx.fillStyle = 'rgba(199,210,254,0.45)';
  ctx.font = '10px Arial';
  ctx.fillText('DATE ISSUED', 135, footerY + 38);

  // ── Seal (center) ──
  const sealX = W / 2;
  const sealY = footerY + 16;
  const sealR = 38;
  const sealGrad = ctx.createRadialGradient(sealX - 10, sealY - 10, 4, sealX, sealY, sealR);
  sealGrad.addColorStop(0, '#7c3aed');
  sealGrad.addColorStop(1, '#4f46e5');
  ctx.beginPath(); ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.fillStyle = sealGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(251,191,36,0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = '34px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText('🎓', sealX, sealY + 12);
  ctx.fillStyle = 'rgba(199,210,254,0.4)';
  ctx.font = '9px Arial';
  ctx.fillText('OFFICIAL SEAL', sealX, footerY + 60);

  // ── Signature (bottom-right) ──
  try {
    const sig = await loadImage(signatureSrc);
    const sH = 68;
    const sW = (sig.width / sig.height) * sH;
    const sigX = W - 170 - sW / 2;
    const sigY = footerY - sH - 4;
    // White tint
    const tmpC = document.createElement('canvas');
    tmpC.width = sW * 2; tmpC.height = sH * 2;
    const tCtx = tmpC.getContext('2d');
    tCtx.drawImage(sig, 0, 0, sW * 2, sH * 2);
    tCtx.globalCompositeOperation = 'source-in';
    tCtx.fillStyle = '#fff';
    tCtx.fillRect(0, 0, sW * 2, sH * 2);
    ctx.drawImage(tmpC, sigX, sigY, sW, sH);
  } catch (_) { /* sig failed silently */ }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('AI LearnHub', W - 135, footerY + 22);
  ctx.fillStyle = 'rgba(199,210,254,0.45)';
  ctx.font = '10px Arial';
  ctx.fillText('DIRECTOR OF EDUCATION', W - 135, footerY + 38);
}

// ─── Certificate Card ─────────────────────────────────────────────────────────
export default function CertificateCard({ certificate }) {
  const previewRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Defensive check for certificate object
  if (!certificate) {
    return (
      <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300">
        <p className="text-slate-500">Certificate data not available.</p>
      </div>
    );
  }

  const studentName = certificate.user_name || certificate.student_name || 'Student';
  const courseTitle = certificate.course?.title || certificate.course_title || 'Course';

  let issuedDate = 'Date Pending';
  try {
    if (certificate.issued_date) {
      issuedDate = new Date(certificate.issued_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    }
  } catch (e) {
    console.error("Invalid date:", certificate.issued_date);
  }

  const certId = (certificate.id || certificate._id || '').toString().slice(0, 16).toUpperCase();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1120;
      canvas.height = 790;
      await drawCertificate(canvas, studentName, courseTitle, issuedDate, certId);

      // Download as PNG
      canvas.toBlob(blob => {
        if (!blob) {
          toast.error('Failed to generate image blob');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate_${courseTitle.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Certificate downloaded!');
      }, 'image/png');
    } catch (e) {
      console.error("Download error:", e);
      toast.error('Download failed, please try again');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">

      {/* ── Certificate Preview (HTML render — just for display) ── */}
      <div
        ref={previewRef}
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)',
          padding: '36px 44px 32px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 370,
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 60%)',
        }} />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <img src={logoSrc} alt="AI LearnHub"
            style={{ height: 60, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'rgba(199,210,254,0.55)', letterSpacing: 3, textTransform: 'uppercase' }}>Certificate ID</div>
            <div style={{ fontSize: 10, color: 'rgba(199,210,254,0.85)', fontFamily: 'monospace', marginTop: 2 }}>{certId}</div>
          </div>
        </div>

        {/* Center body */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#a5b4fc', letterSpacing: 5, textTransform: 'uppercase', marginBottom: 8 }}>
            ✦ &nbsp;Certificate of Completion&nbsp; ✦
          </div>
          <div style={{ fontSize: 11, color: 'rgba(199,210,254,0.62)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            This certifies that
          </div>
          {/* Gold student name */}
          <div style={{
            fontFamily: 'Georgia,"Times New Roman",serif', fontStyle: 'italic', fontWeight: 700,
            fontSize: 42, color: '#fde68a',
            textShadow: '0 2px 18px rgba(251,191,36,0.4)',
            marginBottom: 12, lineHeight: 1.15,
          }}>
            {studentName}
          </div>
          {/* Gold divider */}
          <div style={{
            height: 2, maxWidth: 340, margin: '0 auto 12px',
            background: 'linear-gradient(90deg, transparent, #fbbf24, #fde68a, #fbbf24, transparent)',
          }} />
          <div style={{ fontSize: 12, color: 'rgba(199,210,254,0.72)', letterSpacing: 1, marginBottom: 8 }}>
            has successfully completed the course
          </div>
          <div style={{
            fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 20, color: '#e0e7ff',
            maxWidth: 540, margin: '0 auto', lineHeight: 1.35,
          }}>
            {courseTitle}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 }}>
          {/* Date */}
          <div style={{ textAlign: 'center', minWidth: 130 }}>
            <div style={{ height: 1, background: 'rgba(167,139,250,0.42)', width: 130, marginBottom: 6 }} />
            <div style={{ fontSize: 14, color: '#c7d2fe', fontWeight: 700 }}>{issuedDate}</div>
            <div style={{ fontSize: 9, color: 'rgba(199,210,254,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>Date Issued</div>
          </div>
          {/* Seal */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              border: '3px solid rgba(251,191,36,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', boxShadow: '0 0 18px rgba(139,92,246,0.45)',
            }}>
              <span style={{ fontSize: 28 }}>🎓</span>
            </div>
            <div style={{ fontSize: 8, color: 'rgba(199,210,254,0.42)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Official Seal</div>
          </div>
          {/* Signature */}
          <div style={{ textAlign: 'center', minWidth: 130 }}>
            <img src={signatureSrc} alt="Signature"
              style={{ height: 58, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9, display: 'block', margin: '0 auto 6px' }} />
            <div style={{ height: 1, background: 'rgba(167,139,250,0.42)', width: 130, marginBottom: 6 }} />
            <div style={{ fontSize: 14, color: '#c7d2fe', fontWeight: 700 }}>AI LearnHub</div>
            <div style={{ fontSize: 9, color: 'rgba(199,210,254,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>Director of Education</div>
          </div>
        </div>
      </div>

      {/* ── Card footer ── */}
      <div className="p-5 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-tight">{courseTitle}</h3>
          <p className="text-slate-500 text-sm mt-0.5">Issued {issuedDate}</p>
          <p className="text-slate-400 text-xs mt-0.5 font-mono">ID: {certId}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          data-testid="download-certificate-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all text-sm"
        >
          <Download size={16} />
          {downloading ? 'Generating…' : 'Download PNG'}
        </button>
      </div>
    </div>
  );
}
