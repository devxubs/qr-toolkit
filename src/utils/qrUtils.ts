import QRCode from 'qrcode';
import { QRType, QRFormValues, QRStyling, EyeShape } from '../types';

/**
 * Encodes structured user inputs into standard QR payload string
 */
export function formatQRContent(type: QRType, formValues: QRFormValues): string {
  switch (type) {
    case 'url': {
      let url = formValues.url.url.trim();
      if (!url) return 'https://example.com';
      if (!/^https?:\/\//i.test(url) && !/^[a-z0-9]+:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      return url;
    }

    case 'text':
      return formValues.text.text || 'Hello World';

    case 'wifi': {
      const { ssid, password, encryption, hidden } = formValues.wifi;
      const cleanSSID = (ssid || '').replace(/([\\;:,"])/g, '\\$1');
      const cleanPass = (password || '').replace(/([\\;:,"])/g, '\\$1');
      const hiddenStr = hidden ? 'H:true;' : '';
      if (encryption === 'nopass') {
        return `WIFI:T:nopass;S:${cleanSSID};;${hiddenStr};`;
      }
      return `WIFI:T:${encryption};S:${cleanSSID};P:${cleanPass};;${hiddenStr};`;
    }

    case 'vcard': {
      const v = formValues.vcard;
      const fn = `${v.firstName} ${v.lastName}`.trim() || 'John Doe';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${v.lastName};${v.firstName};;;`,
        `FN:${fn}`,
      ];
      if (v.organization) lines.push(`ORG:${v.organization}`);
      if (v.title) lines.push(`TITLE:${v.title}`);
      if (v.phoneMobile) lines.push(`TEL;TYPE=CELL:${v.phoneMobile}`);
      if (v.phoneWork) lines.push(`TEL;TYPE=WORK:${v.phoneWork}`);
      if (v.email) lines.push(`EMAIL;TYPE=INTERNET:${v.email}`);
      if (v.url) lines.push(`URL:${v.url}`);
      if (v.street || v.city || v.state || v.postalCode || v.country) {
        lines.push(`ADR;TYPE=WORK:;;${v.street};${v.city};${v.state};${v.postalCode};${v.country}`);
      }
      if (v.note) lines.push(`NOTE:${v.note}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'email': {
      const { email, subject, body } = formValues.email;
      const params: string[] = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return `mailto:${email.trim()}${query}`;
    }

    case 'phone':
      return `tel:${formValues.phone.phoneNumber.trim()}`;

    case 'sms': {
      const { phoneNumber, message } = formValues.sms;
      const msgParam = message ? `?body=${encodeURIComponent(message)}` : '';
      return `smsto:${phoneNumber.trim()}${msgParam}`;
    }

    case 'location': {
      const { latitude, longitude, query } = formValues.location;
      if (latitude && longitude) {
        return `geo:${latitude.trim()},${longitude.trim()}`;
      }
      if (query) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
      }
      return `geo:37.7749,-122.4194`;
    }

    case 'event': {
      const e = formValues.event;
      const formatDate = (dateStr: string, timeStr: string) => {
        if (!dateStr) return '';
        const cleanDate = dateStr.replace(/-/g, '');
        const cleanTime = (timeStr || '09:00').replace(/:/g, '') + '00';
        return `${cleanDate}T${cleanTime}`;
      };

      const start = formatDate(e.startDate, e.startTime);
      const end = formatDate(e.endDate, e.endTime) || start;

      const lines = [
        'BEGIN:VEVENT',
        `SUMMARY:${e.title || 'New Event'}`,
      ];
      if (start) lines.push(`DTSTART:${start}`);
      if (end) lines.push(`DTEND:${end}`);
      if (e.location) lines.push(`LOCATION:${e.location}`);
      if (e.description) lines.push(`DESCRIPTION:${e.description}`);
      lines.push('END:VEVENT');
      return lines.join('\n');
    }

    case 'crypto': {
      const c = formValues.crypto;
      const addr = c.address.trim();
      if (!addr) return 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

      const schemeMap: Record<string, string> = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        SOL: 'solana',
        USDT: 'ethereum',
        DOGE: 'dogecoin',
      };

      const scheme = schemeMap[c.coin] || 'bitcoin';
      const params: string[] = [];
      if (c.amount) params.push(`amount=${c.amount.trim()}`);
      if (c.label) params.push(`label=${encodeURIComponent(c.label.trim())}`);
      if (c.message) params.push(`message=${encodeURIComponent(c.message.trim())}`);

      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return `${scheme}:${addr}${query}`;
    }

    default:
      return 'https://example.com';
  }
}

/**
 * Custom SVG logo presets
 */
export function getPresetLogoSvg(preset: string, color: string = '#1E293B'): string {
  switch (preset) {
    case 'wifi':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.85a10 10 0 0 1 14 0"/><path d="M8.5 16.88a5 5 0 0 1 7 0"/></svg>`;
    case 'phone':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
    case 'email':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
    case 'bitcoin':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.767 19.089c4.924.868 6.14-2.125 6.14-4.556 0-2.002-1.312-3.376-3.14-3.722 1.312-.52 2.302-1.737 2.302-3.41 0-2.327-1.871-3.664-5.232-3.664H6v15.352h5.767z"/><path d="M8.5 7h4c1.5 0 2.5.5 2.5 1.75s-1 1.75-2.5 1.75h-4z"/><path d="M8.5 11.5h4.5c1.75 0 2.75.75 2.75 2.25s-1 2.25-2.75 2.25h-4.5z"/><path d="M9 4v3"/><path d="M13 4v3"/><path d="M9 17v3"/><path d="M13 17v3"/></svg>`;
    case 'user':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    default:
      return '';
  }
}

/**
 * Draws custom eye corners onto the canvas
 */
function drawCustomEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: EyeShape,
  color: string,
  bgColor: string
) {
  ctx.save();
  ctx.fillStyle = color;

  if (shape === 'square') {
    // Outer square
    ctx.fillRect(x, y, size, size);
    // Inner clear space
    const innerSize = (size / 7) * 5;
    const innerOffset = (size / 7) * 1;
    ctx.fillStyle = bgColor;
    ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
    // Center pupil
    const pupilSize = (size / 7) * 3;
    const pupilOffset = (size / 7) * 2;
    ctx.fillStyle = color;
    ctx.fillRect(x + pupilOffset, y + pupilOffset, pupilSize, pupilSize);
  } else if (shape === 'rounded' || shape === 'circle' || shape === 'leaf') {
    const r = shape === 'circle' ? size / 2 : shape === 'leaf' ? size / 3 : size / 4;

    // Outer rounded shape
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    } else {
      ctx.roundRect(x, y, size, size, r);
    }
    ctx.fill();

    // Inner clear space
    const innerSize = (size / 7) * 5;
    const innerOffset = (size / 7) * 1;
    const innerR = shape === 'circle' ? innerSize / 2 : innerSize / 4;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(x + size / 2, y + size / 2, innerSize / 2, 0, Math.PI * 2);
    } else {
      ctx.roundRect(x + innerOffset, y + innerOffset, innerSize, innerSize, innerR);
    }
    ctx.fill();

    // Pupil shape
    const pupilSize = (size / 7) * 3;
    const pupilOffset = (size / 7) * 2;
    const pupilR = shape === 'circle' ? pupilSize / 2 : pupilSize / 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(x + size / 2, y + size / 2, pupilSize / 2, 0, Math.PI * 2);
    } else {
      ctx.roundRect(x + pupilOffset, y + pupilOffset, pupilSize, pupilSize, pupilR);
    }
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Renders high resolution custom QR code to HTMLCanvasElement
 */
export async function generateQRToCanvas(
  canvas: HTMLCanvasElement,
  content: string,
  styling: QRStyling
): Promise<void> {
  const {
    fgColor,
    bgColor,
    transparentBg,
    gradientType,
    fgColor2,
    eyeShape,
    eccLevel,
    margin,
    logoPreset,
    customLogoUrl,
    logoScale,
    frameText,
    frameColor = '#0F172A',
    frameBgColor = '#F1F5F9',
  } = styling;

  const targetSize = styling.size || 512;
  const qrData = QRCode.create(content, { errorCorrectionLevel: eccLevel });
  const modules = qrData.modules;
  const moduleCount = modules.size;

  // Frame calculation if frameText exists
  const hasFrame = Boolean(frameText && frameText.trim());
  const frameHeaderHeight = hasFrame ? Math.round(targetSize * 0.12) : 0;
  const frameFooterHeight = hasFrame ? Math.round(targetSize * 0.18) : 0;

  const canvasWidth = targetSize;
  const canvasHeight = targetSize + frameHeaderHeight + frameFooterHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw outer frame background
  if (hasFrame) {
    ctx.fillStyle = frameBgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 2. Clear / fill main QR rectangle
  const qrX = 0;
  const qrY = frameHeaderHeight;
  const qrWidth = canvasWidth;
  const qrHeight = targetSize;

  if (transparentBg) {
    ctx.clearRect(qrX, qrY, qrWidth, qrHeight);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(qrX, qrY, qrWidth, qrHeight);
  }

  const padding = margin * 10;
  const usableWidth = qrWidth - padding * 2;
  const moduleSize = usableWidth / moduleCount;

  // Setup Foreground Gradient / Color
  let fgFillStyle: string | CanvasGradient = fgColor;
  if (gradientType === 'linear') {
    const grad = ctx.createLinearGradient(qrX, qrY, qrX + qrWidth, qrY + qrHeight);
    grad.addColorStop(0, fgColor);
    grad.addColorStop(1, fgColor2 || fgColor);
    fgFillStyle = grad;
  } else if (gradientType === 'radial') {
    const cx = qrX + qrWidth / 2;
    const cy = qrY + qrHeight / 2;
    const grad = ctx.createRadialGradient(cx, cy, usableWidth * 0.1, cx, cy, usableWidth * 0.7);
    grad.addColorStop(0, fgColor);
    grad.addColorStop(1, fgColor2 || fgColor);
    fgFillStyle = grad;
  }

  ctx.fillStyle = fgFillStyle;

  // Helper to check if module coordinate is part of finder eyes (top-left, top-right, bottom-left)
  const isEyeModule = (r: number, c: number) => {
    if (r < 7 && c < 7) return true; // Top-left
    if (r < 7 && c >= moduleCount - 7) return true; // Top-right
    if (r >= moduleCount - 7 && c < 7) return true; // Bottom-left
    return false;
  };

  // 3. Draw QR Data Modules (skipping finder eyes if custom eye shape selected)
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (modules.get(r, c)) {
        if (eyeShape !== 'square' && isEyeModule(r, c)) {
          continue; // Handled separately
        }
        const mx = qrX + padding + c * moduleSize;
        const my = qrY + padding + r * moduleSize;

        if (eyeShape === 'circle') {
          ctx.beginPath();
          ctx.arc(mx + moduleSize / 2, my + moduleSize / 2, moduleSize / 2 * 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else if (eyeShape === 'rounded') {
          ctx.beginPath();
          ctx.roundRect(mx, my, moduleSize, moduleSize, moduleSize * 0.35);
          ctx.fill();
        } else {
          ctx.fillRect(mx, my, moduleSize + 0.3, moduleSize + 0.3); // slight overlap to avoid subpixel gaps
        }
      }
    }
  }

  // 4. Draw Custom Eye Finder Patterns
  if (eyeShape !== 'square') {
    const eyeModuleSize = 7 * moduleSize;
    const activeBgColor = transparentBg ? '#FFFFFF' : bgColor;

    // Top-Left Eye
    drawCustomEye(ctx, qrX + padding, qrY + padding, eyeModuleSize, eyeShape, fgColor, activeBgColor);
    // Top-Right Eye
    drawCustomEye(
      ctx,
      qrX + padding + (moduleCount - 7) * moduleSize,
      qrY + padding,
      eyeModuleSize,
      eyeShape,
      fgColor,
      activeBgColor
    );
    // Bottom-Left Eye
    drawCustomEye(
      ctx,
      qrX + padding,
      qrY + padding + (moduleCount - 7) * moduleSize,
      eyeModuleSize,
      eyeShape,
      fgColor,
      activeBgColor
    );
  }

  // 5. Draw Center Logo Overlay if requested
  let logoImgSrc = '';
  if (logoPreset !== 'none' && logoPreset !== 'custom') {
    const svgStr = getPresetLogoSvg(logoPreset, fgColor);
    if (svgStr) {
      logoImgSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    }
  } else if (logoPreset === 'custom' && customLogoUrl) {
    logoImgSrc = customLogoUrl;
  }

  if (logoImgSrc) {
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const lSize = targetSize * (logoScale || 0.2);
          const lx = qrX + (qrWidth - lSize) / 2;
          const ly = qrY + (qrHeight - lSize) / 2;

          // Draw white background circle/square behind logo for legibility
          ctx.fillStyle = transparentBg ? '#FFFFFF' : bgColor;
          ctx.beginPath();
          ctx.arc(lx + lSize / 2, ly + lSize / 2, (lSize / 2) * 1.15, 0, Math.PI * 2);
          ctx.fill();

          // Draw logo
          ctx.drawImage(img, lx, ly, lSize, lSize);
          resolve();
        };
        img.onerror = () => resolve(); // continue gracefully if logo fails
        img.src = logoImgSrc;
      });
    } catch (e) {
      console.warn('Failed to draw logo overlay:', e);
    }
  }

  // 6. Draw Call-To-Action Banner Text Frame
  if (hasFrame && frameText) {
    ctx.save();
    ctx.fillStyle = frameColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(canvasWidth * 0.05)}px sans-serif`;

    // Draw header text
    ctx.fillText(frameText.toUpperCase(), canvasWidth / 2, frameHeaderHeight / 2);

    // Draw bottom subtext or border
    ctx.fillStyle = frameColor;
    ctx.fillRect(canvasWidth * 0.1, canvasHeight - frameFooterHeight + 10, canvasWidth * 0.8, 3);
    ctx.restore();
  }
}

/**
 * Returns SVG markup representation of the QR Code
 */
export async function generateQRSvg(content: string, styling: QRStyling): Promise<string> {
  const { fgColor, bgColor, eccLevel, margin } = styling;
  return QRCode.toString(content, {
    type: 'svg',
    errorCorrectionLevel: eccLevel,
    margin,
    color: {
      dark: fgColor,
      light: bgColor,
    },
  });
}
