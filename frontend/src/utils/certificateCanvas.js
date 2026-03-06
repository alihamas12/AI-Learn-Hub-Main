import logoSrc from '../Logo/logo-main.png';
import signatureSrc from '../Images/Signature.png';

// ─── Helper: load an image and return HTMLImageElement ────────────────────────
export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ─── Helper: wrap text on canvas ─────────────────────────────────────────────
export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
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
export async function drawCertificate(canvas, studentName, courseTitle, issuedDate, certId) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // 1. Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // 2. Ornate Gold Borders
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 5;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(45, 45, W - 90, H - 90);

    // Side Dots
    const drawCircle = (x, y, r) => {
        ctx.fillStyle = '#d4af37';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        const g = ctx.createRadialGradient(x - r / 3, y - r / 3, 0, x, y, r);
        g.addColorStop(0, '#fde68a');
        g.addColorStop(1, '#d4af37');
        ctx.fillStyle = g; ctx.fill();
    };
    drawCircle(30, H / 2, 10);
    drawCircle(W - 30, H / 2, 10);

    // Diamond Ornaments (Center Top/Bottom)
    const drawDiamond = (x, y) => {
        ctx.fillStyle = '#c5a059';
        ctx.beginPath();
        ctx.moveTo(x, y - 10); ctx.lineTo(x + 8, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 8, y);
        ctx.closePath(); ctx.fill();
    };
    drawDiamond(W / 2, 30);
    drawDiamond(W / 2, H - 30);



    // 4. Modern Heading Bar
    const barW = 600;
    const barH = 75;
    const barX = W / 2 - barW / 2;
    const barY = 120;

    // Translucent background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.03)'; // Very light slate
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 8);
    ctx.fill();

    // Borders (Top/Bottom matching the UI)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barX, barY); ctx.lineTo(barX + barW, barY);
    ctx.moveTo(barX, barY + barH); ctx.lineTo(barX + barW, barY + barH);
    ctx.stroke();

    // "CERTIFICATE" Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px sans-serif';
    ctx.letterSpacing = '14px';
    ctx.fillText('CERTIFICATE', W / 2, barY + 52);
    ctx.letterSpacing = '0px';

    // 5. Titles
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px serif'; // Reduced from 34
    ctx.letterSpacing = '5px';
    ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 250);
    ctx.letterSpacing = '0px';

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 18px serif';
    ctx.fillText('This certificate is proudly presented to', W / 2, 285);

    // 6. Student Name
    ctx.fillStyle = '#d4af37';
    ctx.font = '60px "Playball", cursive'; // Matched with text-6xl
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 8;
    ctx.fillText(studentName, W / 2, 370);
    ctx.shadowBlur = 0;

    // 7. Success Text
    ctx.fillStyle = '#64748b';
    ctx.font = '400 16px serif'; // Smaller
    wrapText(ctx, `For exceptional performance and technical dedication in successfully completing the following course with outstanding achievement:`, W / 2, 440, W - 350, 24);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px serif'; // Smaller
    ctx.fillText(courseTitle, W / 2, 500);

    // 8. Footer Section
    const footerBaselineY = H - 140; // Lifted

    // Signature (Left)
    const sigImg = await loadImage(signatureSrc);
    if (sigImg) {
        const sw = 140; const sh = 70;
        ctx.drawImage(sigImg, W * 0.22 - sw / 2, footerBaselineY - sh - 10, sw, sh);
    }
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.12, footerBaselineY); ctx.lineTo(W * 0.32, footerBaselineY); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#0f172a'; ctx.font = 'bold 18px serif';
    ctx.fillText('Syed Siful Islam', W * 0.22, footerBaselineY + 30);
    ctx.fillStyle = '#64748b'; ctx.font = 'bold 10px sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('FOUNDER & CEO', W * 0.22, footerBaselineY + 45);
    ctx.letterSpacing = '0px';

    // Logo (Right)
    const logoImg = await loadImage(logoSrc);
    if (logoImg) {
        const lH = 80; const lW = (logoImg.width / logoImg.height) * lH;
        ctx.drawImage(logoImg, W * 0.78 - lW / 2, footerBaselineY - lH - 10, lW, lH);
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('AI LEARN HUB', W * 0.78, footerBaselineY + 20);
    ctx.letterSpacing = '0px';

    // 9. Seal (Center)
    const sealX = W / 2;
    const sealY = H - 220; // Lifted more
    // Ribbons
    ctx.fillStyle = '#c5a059';
    ctx.beginPath();
    ctx.moveTo(sealX - 20, sealY + 30); ctx.lineTo(sealX - 40, sealY + 100); ctx.lineTo(sealX - 20, sealY + 85); ctx.lineTo(sealX, sealY + 100); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sealX + 20, sealY + 30); ctx.lineTo(sealX + 40, sealY + 100); ctx.lineTo(sealX + 20, sealY + 85); ctx.lineTo(sealX, sealY + 100); ctx.closePath(); ctx.fill();

    // Seal Body
    ctx.beginPath(); ctx.arc(sealX, sealY + 40, 48, 0, Math.PI * 2);
    const sG = ctx.createRadialGradient(sealX, sealY + 40, 0, sealX, sealY + 40, 48);
    sG.addColorStop(0, '#fde68a'); sG.addColorStop(1, '#d4af37');
    ctx.fillStyle = sG; ctx.fill();
    ctx.strokeStyle = '#c5a059'; ctx.lineWidth = 2.5; ctx.stroke();

    ctx.fillStyle = '#000'; ctx.font = '36px serif';
    ctx.fillText('🎓', sealX, sealY + 54);

    // Metadata lines
    ctx.textAlign = 'center'; ctx.fillStyle = '#94a3b8'; ctx.font = '400 8px monospace';
    ctx.fillText(`ID: ${certId}`, W * 0.78, footerBaselineY + 35);
    ctx.fillText(`VERIFICATION HUB`, W * 0.78, footerBaselineY + 46);
}
