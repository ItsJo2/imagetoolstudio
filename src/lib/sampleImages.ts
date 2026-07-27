/**
 * Utility to generate high-quality sample image Files for instant testing.
 */

export function createSampleImageFile(type: 'landscape' | 'graphic' | 'portrait'): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (type === 'landscape') {
      canvas.width = 1920;
      canvas.height = 1080;

      // Vivid sunset sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.3, '#1e1b4b');
      gradient.addColorStop(0.6, '#7c2d12');
      gradient.addColorStop(0.8, '#ea580c');
      gradient.addColorStop(1, '#fde047');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing sun
      const sunGradient = ctx.createRadialGradient(960, 750, 10, 960, 750, 180);
      sunGradient.addColorStop(0, '#ffffff');
      sunGradient.addColorStop(0.2, '#fef08a');
      sunGradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(960, 750, 180, 0, Math.PI * 2);
      ctx.fill();

      // Mountain silhouettes
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(0, 1080);
      ctx.lineTo(0, 700);
      ctx.lineTo(350, 520);
      ctx.lineTo(700, 750);
      ctx.lineTo(1100, 480);
      ctx.lineTo(1500, 780);
      ctx.lineTo(1920, 620);
      ctx.lineTo(1920, 1080);
      ctx.closePath();
      ctx.fill();

      // Text overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 52px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Landscape Demo', 960, 160);
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('1920 × 1080 Full HD Sample Image', 960, 210);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sample_landscape_1080p.jpg', { type: 'image/jpeg' });
          resolve(file);
        }
      }, 'image/jpeg', 0.95);
    } else if (type === 'graphic') {
      canvas.width = 1000;
      canvas.height = 1000;

      // Dark futuristic graphic canvas
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, 1000, 1000);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1000; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1000);
        ctx.stroke();
      }
      for (let y = 0; y < 1000; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1000, y);
        ctx.stroke();
      }

      // Neon emblem circle
      ctx.lineWidth = 8;
      const ringGrad = ctx.createLinearGradient(200, 200, 800, 800);
      ringGrad.addColorStop(0, '#3b82f6');
      ringGrad.addColorStop(0.5, '#8b5cf6');
      ringGrad.addColorStop(1, '#ec4899');
      ctx.strokeStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(500, 500, 260, 0, Math.PI * 2);
      ctx.stroke();

      // Inner polygon
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(500, 500, 40, 0, Math.PI * 2);
      ctx.fill();

      // Typography
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PNG GRAPHIC LOGO', 500, 200);
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Transparent & Sharp Canvas Demo', 500, 820);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sample_graphic_logo.png', { type: 'image/png' });
          resolve(file);
        }
      }, 'image/png');
    } else {
      // Portrait
      canvas.width = 800;
      canvas.height = 1000;

      const grad = ctx.createLinearGradient(0, 0, 800, 1000);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1000);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PORTRAIT DEMO', 400, 500);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sample_portrait_demo.png', { type: 'image/png' });
          resolve(file);
        }
      }, 'image/png');
    }
  });
}
