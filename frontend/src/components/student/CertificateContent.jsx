import React from 'react';
import logoSrc from '../../Logo/logo-main.png';
import signatureSrc from '../../Images/Signature.png';

export default function CertificateContent({ studentName, courseTitle, issuedDate, certId }) {
    return (
        <div className="absolute inset-0 p-10 flex flex-col items-center bg-white shadow-2xl">
            {/* Ornate Borders */}
            <div className="absolute inset-4 border-[5px] border-[#c5a059]" />
            <div className="absolute inset-8 border-[1.5px] border-[#c5a059]" />
            <div className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-[#fde68a] to-[#d4af37] rounded-full border border-[#c5a059] -ml-2.5 z-20" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-[#fde68a] to-[#d4af37] rounded-full border border-[#c5a059] -mr-2.5 z-20" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[#c5a059] text-xl leading-none z-20">◆</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#c5a059] text-xl leading-none z-20">◆</div>


            {/* 3D Ribbon Banner */}
            <div className="z-20 relative -mt-4 mb-10">
                <div className="absolute -left-10 top-4 w-12 h-14 bg-slate-200 z-0" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 75% 50%, 100% 100%, 0% 100%)' }} />
                <div className="absolute -right-10 top-4 w-12 h-14 bg-slate-200 z-0" style={{ clipPath: 'polygon(100% 0%, 0% 0%, 25% 50%, 0% 100%, 100% 100%)' }} />
                <div className="relative z-10 bg-gradient-to-b from-slate-50 via-white to-slate-200 px-16 py-6 rounded-lg border border-slate-300 shadow-xl min-w-[600px] text-center">
                    <h1 className="text-[54px] font-serif font-black tracking-[10px] text-slate-800 uppercase leading-none">
                        Certificate
                    </h1>
                </div>
            </div>

            <div className="z-10 text-center mb-10">
                <h2 className="text-[38px] font-serif font-black text-slate-900 tracking-wide uppercase mb-3 text-center px-4 max-w-4xl">
                    Certificate of Completion
                </h2>
                <p className="text-slate-500 text-xl italic font-serif">This certificate is proudly presented to</p>
            </div>

            <div className="z-10 flex-1 flex flex-col items-center justify-center text-center">
                <h1 className="text-[76px] font-serif italic font-medium text-slate-900 mb-10 pb-2">
                    <span style={{ fontFamily: '"Brush Script MT", cursive' }}>{studentName}</span>
                </h1>
                <p className="text-slate-500 text-[18px] max-w-3xl text-center leading-relaxed font-serif">
                    For exceptional performance and technical dedication in successfully completing the following course with outstanding achievement:
                </p>
                <h2 className="text-[32px] font-serif font-bold text-slate-900 mt-6 px-10 border-b-2 border-slate-100 text-center">
                    {courseTitle}
                </h2>
            </div>

            {/* Footer */}
            <div className="z-10 w-full flex items-end justify-between mt-auto mb-6 px-16 relative">
                {/* Signature Section */}
                <div className="flex flex-col items-center">
                    <div className="h-20 flex items-end mb-2">
                        <img src={signatureSrc} alt="Signature" className="h-16 object-contain mix-blend-multiply" style={{ maxHeight: '80px' }} />
                    </div>
                    <div className="w-56 h-[1.5px] bg-slate-800 mb-2" />
                    <p className="text-xl font-bold text-slate-900 leading-tight">Syed Siful Islam</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[2px]">Founder & CEO</p>
                </div>

                {/* Center Seal - Positioned absolute relative to footer to avoid grid constraints */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
                    <div className="relative">
                        {/* Ribbons */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-20 h-28 flex justify-between gap-1 opacity-90 z-0">
                            <div className="w-9 h-full bg-[#c5a059]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }}></div>
                            <div className="w-9 h-full bg-[#c5a059]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }}></div>
                        </div>
                        {/* Gold Seal Body */}
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#fde68a] to-[#d4af37] border-[3px] border-[#c5a059] shadow-2xl flex items-center justify-center relative z-10 transition-transform hover:scale-105 duration-500">
                            <div className="w-24 h-24 rounded-full border border-[#c5a059]/30 flex items-center justify-center">
                                <span className="text-5xl drop-shadow-lg">🎓</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo Section */}
                <div className="flex flex-col items-center">
                    <div className="h-24 flex items-center mb-2">
                        <img src={logoSrc} alt="Logo" className="h-20 w-auto object-contain" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-[3px]">AI Learn Hub</p>
                    <div className="mt-2 flex flex-col items-center opacity-40">
                        <p className="text-[10px] font-mono text-slate-500">ID: {certId}</p>
                        <p className="text-[8px] font-mono text-slate-400">© 2026 AI LEARN HUB ACADEMY</p>
                    </div>
                </div>
            </div>

            <div className="absolute top-10 right-10 text-right opacity-40">
                <p className="text-[10px] font-mono text-slate-600">ID: {certId}</p>
            </div>
        </div>
    );
}
