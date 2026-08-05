import { SafetyReport } from '../types';

/**
 * Validates URLs safely
 */
export function validateUrl(url: string): { isValid: boolean; formatted: string; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, formatted: '', error: 'URL cannot be empty' };
  }

  let trimmed = url.trim();
  // Auto prefix http:// if missing domain protocol
  if (!/^https?:\/\//i.test(trimmed) && !/^[a-z0-9]+:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, formatted: trimmed, error: 'Only http and https protocols are supported' };
    }
    return { isValid: true, formatted: parsed.href };
  } catch {
    return { isValid: false, formatted: trimmed, error: 'Invalid URL format' };
  }
}

/**
 * Validates Email address
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates Phone number
 */
export function validatePhone(phone: string): boolean {
  return /^\+?[0-9\s\-()]{6,20}$/.test(phone.trim());
}

/**
 * Validates Crypto wallet address basic format
 */
export function validateCryptoAddress(coin: string, address: string): { isValid: boolean; warning?: string } {
  const addr = address.trim();
  if (!addr) return { isValid: false, warning: 'Address is required' };

  switch (coin) {
    case 'BTC':
      // Bitcoin legacy, SegWit, Taproot format
      if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(addr)) return { isValid: true };
      return { isValid: false, warning: 'Invalid Bitcoin address format (should start with 1, 3, or bc1)' };
    case 'ETH':
    case 'USDT':
      if (/^0x[a-fA-F0-9]{40}$/.test(addr)) return { isValid: true };
      return { isValid: false, warning: 'Invalid Ethereum/EVM address format (0x... 40 hex chars)' };
    case 'SOL':
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) return { isValid: true };
      return { isValid: false, warning: 'Invalid Solana address format' };
    default:
      return { isValid: addr.length > 10 };
  }
}

/**
 * Calculates WCAG contrast ratio between two hex colors (0xRRGGBB)
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): { ratio: number; isLegible: boolean } {
  const getLuminance = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  try {
    const l1 = getLuminance(fgHex);
    const l2 = getLuminance(bgHex);
    const bright = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    const ratio = (bright + 0.05) / (dark + 0.05);

    // QR codes require high contrast ratio for camera scanners (> 3.5 ratio recommended)
    return {
      ratio: Math.round(ratio * 10) / 10,
      isLegible: ratio >= 3.5
    };
  } catch {
    return { ratio: 1, isLegible: false };
  }
}

/**
 * Heuristic scan safety analysis (runs client-side before or alongside AI)
 */
export function performLocalSafetyCheck(rawText: string): SafetyReport {
  const text = rawText.trim();
  const details: string[] = [];
  const recommendations: string[] = [];
  let threatLevel: 'safe' | 'caution' | 'danger' = 'safe';
  let score = 95;

  // Check if URL
  if (/^https?:\/\//i.test(text) || /^www\./i.test(text)) {
    let urlString = text;
    if (!/^https?:\/\//i.test(urlString)) urlString = 'https://' + urlString;

    try {
      const parsed = new URL(urlString);
      const hostname = parsed.hostname.toLowerCase();

      // Check IP address domain
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        threatLevel = 'caution';
        score -= 30;
        details.push('Direct IP address host detected instead of registered domain name.');
        recommendations.push('Do not enter passwords or personal data on IP-hosted pages.');
      }

      // Check suspicious TLDs
      const suspiciousTLDs = ['.top', '.xyz', '.zip', '.mov', '.cc', '.tk', '.ml', '.ga', '.cf', '.gq', '.kim', '.work'];
      if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
        if ((threatLevel as string) !== 'danger') threatLevel = 'caution';
        score -= 25;
        details.push(`Uses non-standard TLD (${hostname.split('.').pop()}), commonly seen in temporary phishing sites.`);
      }

      // Check credential leaks in URL user info (e.g. http://user:pass@domain)
      if (parsed.username || parsed.password) {
        threatLevel = 'danger';
        score -= 50;
        details.push('URL embeds authentication credentials in the link (potential phishing hook).');
        recommendations.push('Do NOT open this link.');
      }

      // Check multiple subdomains / misspellings
      if (hostname.split('.').length > 4) {
        score -= 15;
        details.push('Excessive subdomain depth detected.');
      }

      // Check dangerous file extensions in path
      const dangerousExts = ['.exe', '.apk', '.bat', '.cmd', '.vbs', '.msi', '.scr', '.ps1', '.iso', '.dmg'];
      if (dangerousExts.some(ext => parsed.pathname.toLowerCase().endsWith(ext))) {
        threatLevel = 'danger';
        score -= 40;
        details.push(`Direct link to downloadable executable file (${parsed.pathname.split('.').pop()}).`);
        recommendations.push('Only download files if you completely trust the creator.');
      }

      if (parsed.protocol === 'http:') {
        score -= 10;
        details.push('Unencrypted HTTP connection (not SSL HTTPS).');
        recommendations.push('Avoid submitting personal sensitive information.');
      }

    } catch {
      threatLevel = 'caution';
      score -= 20;
      details.push('Malformed URL structure.');
    }
  } else if (/^WIFI:/i.test(text)) {
    details.push('Valid Wi-Fi configuration payload.');
    recommendations.push('Ensure you trust the location before connecting to the Wi-Fi network.');
  } else if (/^BEGIN:VCARD/i.test(text)) {
    details.push('vCard Contact payload.');
    recommendations.push('Review contact details before saving to address book.');
  } else if (/javascript:/i.test(text) || /<script/i.test(text)) {
    threatLevel = 'danger';
    score = 10;
    details.push('Contains executable JavaScript or script payload.');
    recommendations.push('DO NOT execute or copy into terminal/browser console.');
  }

  if (details.length === 0) {
    details.push('No obvious malicious signatures detected by rule set.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Proceed with normal caution.');
  }

  return {
    threatLevel,
    score: Math.max(0, Math.min(100, score)),
    summary: threatLevel === 'safe' 
      ? 'Content passes heuristic security scan.' 
      : threatLevel === 'caution'
      ? 'Potential security risk or unusual configuration detected.'
      : 'HIGH THREAT RISK: Potential malicious payload or phishing link.',
    details,
    recommendations,
    analyzedAt: new Date().toISOString(),
    isFallback: true
  };
}
