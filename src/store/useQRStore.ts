import { create } from 'zustand';
import {
  NavigationTab,
  QRType,
  QRFormValues,
  QRStyling,
  QRHistoryItem,
  BatchItem,
  ToastMessage,
  SafetyReport,
} from '../types';
import { performLocalSafetyCheck } from '../utils/securityUtils';

const DEFAULT_STYLING: QRStyling = {
  fgColor: '#0F172A',
  bgColor: '#FFFFFF',
  transparentBg: false,
  gradientType: 'none',
  fgColor2: '#2563EB',
  eyeShape: 'square',
  eccLevel: 'M',
  size: 512,
  margin: 2,
  logoPreset: 'none',
  logoScale: 0.22,
  frameText: '',
  frameColor: '#0F172A',
  frameBgColor: '#F8FAFC',
};

const DEFAULT_FORM_VALUES: QRFormValues = {
  url: { url: 'https://ai.studio' },
  text: { text: 'Welcome to QR Toolkit!' },
  wifi: { ssid: 'MyHomeWiFi', password: 'SecretPassword123', encryption: 'WPA', hidden: false },
  vcard: {
    firstName: 'Alex',
    lastName: 'Morgan',
    organization: 'Tech Innovations Inc.',
    title: 'Senior Engineer',
    phoneMobile: '+1 (555) 019-2834',
    phoneWork: '+1 (555) 010-8821',
    email: 'alex.morgan@example.com',
    url: 'https://example.com',
    street: '123 Innovation Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'USA',
    note: 'Connect with me on LinkedIn',
  },
  email: { email: 'contact@example.com', subject: 'Inquiry from QR Code', body: 'Hello, I scanned your QR code.' },
  phone: { phoneNumber: '+15550192834' },
  sms: { phoneNumber: '+15550192834', message: 'Hello! I am sending this via QR Toolkit.' },
  location: { latitude: '37.7749', longitude: '-122.4194', query: 'San Francisco, CA' },
  event: {
    title: 'Annual Tech Conference 2026',
    location: 'Moscone Center, SF',
    startDate: '2026-09-15',
    startTime: '09:00',
    endDate: '2026-09-17',
    endTime: '17:00',
    description: 'Join us for keynotes and networking.',
  },
  crypto: { coin: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amount: '0.005', label: 'Coffee Donation', message: 'Thanks for supporting!' },
};

// Safe localStorage loader
function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse ${key} from storage:`, e);
    return fallback;
  }
}

function saveStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage:`, e);
  }
}

interface QRStoreState {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Active QR Generator state
  qrType: QRType;
  setQRType: (type: QRType) => void;
  formValues: QRFormValues;
  setFormValue: <K extends keyof QRFormValues>(typeKey: K, values: Partial<QRFormValues[K]>) => void;
  styling: QRStyling;
  updateStyling: (newStyling: Partial<QRStyling>) => void;
  resetStyling: () => void;

  // Camera & Scan
  cameraFacing: 'environment' | 'user';
  toggleCameraFacing: () => void;
  torchEnabled: boolean;
  setTorchEnabled: (enabled: boolean) => void;
  beepEnabled: boolean;
  setBeepEnabled: (enabled: boolean) => void;

  // Scan Result Modal
  activeScan: { rawText: string; timestamp: number } | null;
  activeSafetyReport: SafetyReport | null;
  isAnalyzingSafety: boolean;
  setActiveScan: (rawText: string | null) => void;
  fetchAISafetyReport: (rawText: string) => Promise<void>;

  // History & Favorites
  history: QRHistoryItem[];
  addHistoryItem: (item: Omit<QRHistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (id: string) => void;
  importHistoryJSON: (jsonStr: string) => boolean;

  // Batch Generator
  batchItems: BatchItem[];
  setBatchItems: (items: BatchItem[]) => void;
  clearBatchItems: () => void;

  // Safety Sandbox input
  safetySandboxInput: string;
  setSafetySandboxInput: (val: string) => void;

  // Toast Notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useQRStore = create<QRStoreState>((set, get) => ({
  activeTab: 'generator',
  setActiveTab: (tab) => set({ activeTab: tab }),

  qrType: 'url',
  setQRType: (type) => set({ qrType: type }),

  formValues: DEFAULT_FORM_VALUES,
  setFormValue: (typeKey, values) =>
    set((state) => ({
      formValues: {
        ...state.formValues,
        [typeKey]: {
          ...state.formValues[typeKey],
          ...values,
        },
      },
    })),

  styling: loadStorage<QRStyling>('qr_toolkit_styling', DEFAULT_STYLING),
  updateStyling: (newStyling) =>
    set((state) => {
      const updated = { ...state.styling, ...newStyling };
      saveStorage('qr_toolkit_styling', updated);
      return { styling: updated };
    }),
  resetStyling: () => {
    saveStorage('qr_toolkit_styling', DEFAULT_STYLING);
    set({ styling: DEFAULT_STYLING });
  },

  // Camera Settings
  cameraFacing: 'environment',
  toggleCameraFacing: () =>
    set((state) => ({
      cameraFacing: state.cameraFacing === 'environment' ? 'user' : 'environment',
    })),
  torchEnabled: false,
  setTorchEnabled: (enabled) => set({ torchEnabled: enabled }),
  beepEnabled: true,
  setBeepEnabled: (enabled) => set({ beepEnabled: enabled }),

  // Scan Result Modal
  activeScan: null,
  activeSafetyReport: null,
  isAnalyzingSafety: false,
  setActiveScan: (rawText) => {
    if (!rawText) {
      set({ activeScan: null, activeSafetyReport: null, isAnalyzingSafety: false });
      return;
    }
    const report = performLocalSafetyCheck(rawText);
    set({
      activeScan: { rawText, timestamp: Date.now() },
      activeSafetyReport: report,
      isAnalyzingSafety: false,
    });
  },

  fetchAISafetyReport: async (rawText) => {
    set({ isAnalyzingSafety: true });
    try {
      const res = await fetch('/api/scan-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawText, type: 'url_or_text' }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          activeSafetyReport: {
            ...data,
            analyzedAt: new Date().toISOString(),
          },
          isAnalyzingSafety: false,
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (e) {
      console.warn('Fallback to local safety check:', e);
      set({
        activeSafetyReport: performLocalSafetyCheck(rawText),
        isAnalyzingSafety: false,
      });
    }
  },

  // History & Favorites
  history: loadStorage<QRHistoryItem[]>('qr_toolkit_history', []),
  addHistoryItem: (item) => {
    const newItem: QRHistoryItem = {
      ...item,
      id: 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      isFavorite: false,
    };
    set((state) => {
      // Prevent duplicates in recent 5 items
      const isDuplicate = state.history.slice(0, 5).some((h) => h.rawText === item.rawText);
      if (isDuplicate) return state;

      const updated = [newItem, ...state.history].slice(0, 100); // keep top 100
      saveStorage('qr_toolkit_history', updated);
      return { history: updated };
    });
  },
  deleteHistoryItem: (id) =>
    set((state) => {
      const updated = state.history.filter((h) => h.id !== id);
      saveStorage('qr_toolkit_history', updated);
      return { history: updated };
    }),
  clearHistory: () => {
    saveStorage('qr_toolkit_history', []);
    set({ history: [] });
  },
  toggleFavorite: (id) =>
    set((state) => {
      const updated = state.history.map((h) => (h.id === id ? { ...h, isFavorite: !h.isFavorite } : h));
      saveStorage('qr_toolkit_history', updated);
      return { history: updated };
    }),
  importHistoryJSON: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        set((state) => {
          const merged = [...parsed, ...state.history].slice(0, 150);
          saveStorage('qr_toolkit_history', merged);
          return { history: merged };
        });
        return true;
      }
    } catch {
      return false;
    }
    return false;
  },

  // Batch
  batchItems: [],
  setBatchItems: (items) => set({ batchItems: items }),
  clearBatchItems: () => set({ batchItems: [] }),

  // Safety sandbox
  safetySandboxInput: '',
  setSafetySandboxInput: (val) => set({ safetySandboxInput: val }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
