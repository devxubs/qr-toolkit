import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useQRStore } from '../../store/useQRStore';
import { Camera, RefreshCw, Volume2, VolumeX, ShieldCheck, AlertCircle } from 'lucide-react';

export const CameraScanner: React.FC = () => {
  const {
    cameraFacing,
    toggleCameraFacing,
    beepEnabled,
    setBeepEnabled,
    setActiveScan,
    addHistoryItem,
    addToast,
  } = useQRStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [streamError, setStreamError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Play audio beep sound using Web Audio API synthesizer
  const playBeep = () => {
    if (!beepEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio context might be muted by browser policy
    }
  };

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isMounted = true;

    async function startCamera() {
      setStreamError(null);
      setIsScanning(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
          try {
            await videoRef.current.play();
          } catch (playErr: any) {
            // Ignore benign play interruption errors when component unmounts or re-renders
            if (playErr.name !== 'AbortError' && !playErr.message?.includes('interrupted')) {
              console.warn('Video playback notice:', playErr);
            }
          }
          if (isMounted) {
            requestAnimationFrame(scanTick);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Camera access error:', err);
        setStreamError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in browser permissions.'
            : 'Unable to start camera video stream.'
        );
        setIsScanning(false);
      }
    }

    function scanTick() {
      if (!isMounted) return;
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(scanTick);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data.trim()) {
          // Highlight bounding box
          drawBoundingBox(ctx, code.location);

          playBeep();

          // Stop scanning and pass result to modal
          const scannedText = code.data.trim();
          setActiveScan(scannedText);

          addHistoryItem({
            type: 'scan',
            qrType: 'raw',
            title: 'Scanned QR Code',
            content: scannedText,
            rawText: scannedText,
          });

          addToast({
            type: 'success',
            title: 'QR Code Detected!',
            description: scannedText.substring(0, 50) + '...',
          });

          return; // pause scan tick while modal is open
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanTick);
    }

    startCamera();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing]);

  // Helper to draw green square outline over detected QR code
  const drawBoundingBox = (ctx: CanvasRenderingContext2D, loc: any) => {
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
    ctx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
    ctx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
    ctx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
    ctx.closePath();
    ctx.stroke();
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Live Camera QR Scanner</h2>
            <p className="text-[11px] text-slate-400">Position the QR code inside the viewfinder target frame</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBeepEnabled(!beepEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              beepEnabled
                ? 'bg-slate-800 text-indigo-400 border-slate-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle Audio Beep"
          >
            {beepEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleCameraFacing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Switch Camera (Front/Back)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Viewfinder Canvas */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {streamError ? (
          <div className="p-6 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-200 mb-1">{streamError}</p>
            <p className="text-xs text-slate-400 mb-4">
              Try switching to Image Upload Scan or check browser permissions.
            </p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

            {/* Viewfinder Target Reticle Overlay */}
            <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-indigo-400/80 rounded-2xl relative shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 -mt-1 -ml-1 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 -mt-1 -mr-1 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 -mb-1 -ml-1 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 -mb-1 -mr-1 rounded-br-lg" />
                
                {/* Scanning laser animation bar */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent absolute animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_12px_#818cf8]" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" /> Security auto-scan enabled
        </span>
        <span>Facing Mode: <span className="font-semibold text-slate-200 capitalize">{cameraFacing}</span></span>
      </div>
    </div>
  );
};
