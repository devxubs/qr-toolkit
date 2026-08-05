export type QRType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'email'
  | 'phone'
  | 'sms'
  | 'location'
  | 'event'
  | 'crypto';

export type NavigationTab =
  | 'generator'
  | 'camera-scanner'
  | 'upload-scanner'
  | 'batch'
  | 'history'
  | 'safety';

export type ECCLevel = 'L' | 'M' | 'Q' | 'H';

export type EyeShape = 'square' | 'rounded' | 'circle' | 'leaf';

export type GradientType = 'none' | 'linear' | 'radial';

export type LogoPreset = 'none' | 'wifi' | 'phone' | 'email' | 'bitcoin' | 'user' | 'custom';

export interface QRStyling {
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  gradientType: GradientType;
  fgColor2: string;
  eyeShape: EyeShape;
  eccLevel: ECCLevel;
  size: number; // render resolution px (256 - 2048)
  margin: number;
  logoPreset: LogoPreset;
  customLogoUrl?: string;
  logoScale: number; // 0.15 - 0.28
  frameText?: string;
  frameColor?: string;
  frameBgColor?: string;
}

export interface URLInputs {
  url: string;
}

export interface TextInputs {
  text: string;
}

export interface WiFiInputs {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardInputs {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phoneMobile: string;
  phoneWork: string;
  email: string;
  url: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  note: string;
}

export interface EmailInputs {
  email: string;
  subject: string;
  body: string;
}

export interface PhoneInputs {
  phoneNumber: string;
}

export interface SMSInputs {
  phoneNumber: string;
  message: string;
}

export interface LocationInputs {
  latitude: string;
  longitude: string;
  query: string;
}

export interface EventInputs {
  title: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
}

export interface CryptoInputs {
  coin: 'BTC' | 'ETH' | 'SOL' | 'USDT' | 'DOGE';
  address: string;
  amount: string;
  label: string;
  message: string;
}

export interface QRFormValues {
  url: URLInputs;
  text: TextInputs;
  wifi: WiFiInputs;
  vcard: VCardInputs;
  email: EmailInputs;
  phone: PhoneInputs;
  sms: SMSInputs;
  location: LocationInputs;
  event: EventInputs;
  crypto: CryptoInputs;
}

export interface SafetyReport {
  threatLevel: 'safe' | 'caution' | 'danger' | 'unknown';
  score: number; // 0 to 100
  summary: string;
  details: string[];
  recommendations: string[];
  analyzedAt: string;
  isFallback?: boolean;
}

export interface QRHistoryItem {
  id: string;
  type: 'generate' | 'scan';
  qrType: QRType | 'raw';
  title: string;
  content: string;
  rawText: string;
  timestamp: number;
  isFavorite: boolean;
  styling?: Partial<QRStyling>;
  safetyReport?: SafetyReport;
}

export interface BatchItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  dataUrl?: string;
  error?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
