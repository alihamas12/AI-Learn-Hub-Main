import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Download, Share2, Home, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CertificateContent from '../components/student/CertificateContent';
import { drawCertificate } from '../utils/certificateCanvas';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function CertificatePage() {
    const { id } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [scaleFactor, setScaleFactor] = useState(1);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/certificates/${id}`);
                setCertificate(response.data);
            } catch (err) {
                toast.error('Failed to load certificate');
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [id]);

    useEffect(() => {
        const updateScale = () => {
            const container = document.getElementById('cert-page-container');
            if (container) {
                const availableW = container.offsetWidth - 48; // padding
                const newScale = Math.min(availableW / 1120, 1.2); // Allow slight upscale on large screens
                setScaleFactor(newScale);
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [loading]);

    const handleDownload = async () => {
        if (!certificate) return;
        setDownloading(true);
        try {
            const studentName = certificate.user_name || certificate.student_name || certificate.user?.name || 'Student';
            const courseTitle = certificate.course?.title || certificate.course_title || 'Course';
            const issuedDate = new Date(certificate.issued_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            const certId = (certificate.id || certificate._id || '').toString().slice(0, 16).toUpperCase();

            const canvas = document.createElement('canvas');
            canvas.width = 1120; canvas.height = 790;

            toast.info('Preparing your certificate...');
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

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">Certificate Not Found</h1>
                <Link to="/dashboard/student" className="text-primary hover:underline flex items-center gap-2">
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    const studentName = certificate.user_name || certificate.student_name || certificate.user?.name || 'Student';
    const courseTitle = certificate.course?.title || certificate.course_title || 'Course';
    const issuedDate = new Date(certificate.issued_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const certId = (certificate.id || certificate._id || '').toString().slice(0, 16).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Header / Actions */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard/student" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600" title="Dashboard">
                        <Home size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Course Certificate</h1>
                        <p className="text-sm text-slate-500 font-medium">{courseTitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-all border border-slate-200"
                    >
                        <Share2 size={18} />
                        <span className="hidden sm:inline">Share Link</span>
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-800 text-white font-bold rounded-lg shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
                    >
                        <Download size={18} />
                        {downloading ? 'Preparing...' : 'Download PNG'}
                    </button>
                </div>
            </div>

            {/* Main Viewport */}
            <div id="cert-page-container" className="flex-1 overflow-auto p-4 md:p-12 flex items-center justify-center bg-[#f8fafc] pattern-dots">
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

            {/* Footer / Meta */}
            <div className="bg-white border-t border-slate-200 px-6 py-6 text-center">
                <p className="text-sm text-slate-500 mb-1">Offered by <span className="font-bold text-slate-800">AI Learn Hub</span></p>
                <p className="text-[10px] font-mono text-slate-400">Official Certificate Identification: {certificate.id || certificate._id}</p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .pattern-dots {
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}} />
        </div>
    );
}
