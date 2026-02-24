import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Award } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CertificateCard({ certificate }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(`${API}/certificates/${certificate.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${certificate.course.title.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Certificate downloaded!');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  return (
    <div className="certificate-card" data-testid="certificate-card">
      <div className="certificate-icon">
        <Award size={48} color="#10b981" />
      </div>
      <div className="certificate-info">
        <h3>{certificate.course.title}</h3>
        <p className="certificate-date">
          Issued on {new Date(certificate.issued_date).toLocaleDateString()}
        </p>
        <p className="certificate-id">ID: {certificate.id}</p>
      </div>
      <Button onClick={handleDownload} data-testid="download-certificate-btn">
        <Download size={18} className="mr-2" />
        Download PDF
      </Button>
    </div>
  );
}
