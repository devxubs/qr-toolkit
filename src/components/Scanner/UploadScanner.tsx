import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useQRStore } from '../../store/useQRStore';
import { Upload, Image as ImageIcon, Clipboard, AlertCircle } from 'lucide-react';

export const UploadScanner: React.FC = () => {
  const { setActiveScan, addHistoryItem, addToast } = useQRStore();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Process image file or blob
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File Type',
        description: 'Please upload an image file (PNG, JPG, WEBP, SVG).',
      });
      return;
    }

    setDecodeError(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const imgUrl = evt.target?.result as string;
      if (!imgUrl) return;

      setSelectedImage(imgUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data && code.data.trim()) {
          const scannedText = code.data.trim();
          setActiveScan(scannedText);

          addHistoryItem({
            type: 'scan',
            qrType: 'raw',
            title: 'Image QR Scan',
            content: scannedText,
            rawText: scannedText,
          });

          addToast({
            type: 'success',
            title: 'QR Code Decoded!',
            description: scannedText.substring(0, 50) + '...',
          });
        } else {
          setDecodeError('No valid QR code was detected in this image. Ensure image is clear and unblurred.');
          addToast({
            type: 'warning',
            title: 'No QR Code Detected',
            description: 'Try uploading a higher contrast or clearer photo.',
          });
        }
      };
      img.src = imgUrl;
    };

    reader.readAsDataURL(file);
  };

  // Clipboard Paste Handler (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            addToast({
              type: 'info',
              title: 'Pasted Image from Clipboard',
            });
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
          <Upload className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Image & Photo QR Scanner</h2>
          <p className="text-[11px] text-slate-400">Upload, drag & drop, or paste screenshot directly (Ctrl+V)</p>
        </div>
      </div>

      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {selectedImage ? (
          <div className="space-y-3">
            <img
              src={selectedImage}
              alt="Uploaded Preview"
              className="max-h-48 rounded-xl border border-slate-800 mx-auto shadow-lg object-contain"
            />
            <p className="text-xs text-slate-400">Click or drop another image to scan again</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/5">
              <ImageIcon className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mb-1">
              Drop your QR Code image here, or <span className="text-indigo-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
              <Clipboard className="w-3.5 h-3.5 text-slate-500" /> Or paste screenshot from clipboard using <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+V</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Cmd+V</kbd>
            </p>
          </>
        )}
      </div>

      {decodeError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{decodeError}</span>
        </div>
      )}

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
