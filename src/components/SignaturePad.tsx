import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface SignaturePadProps {
  value?: string;
  onChange: (signatureDataUrl: string) => void;
  label?: string;
  required?: boolean;
  signerName?: string;
  defaultSignature?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  label = 'Signature',
  required = false,
  signerName,
  defaultSignature,
}) => {
  const [tab, setTab] = useState<'draw' | 'upload' | 'default'>('draw');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (tab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#0f2942'; // Dark Navy ink
      }
    }
  }, [tab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseDefault = () => {
    if (defaultSignature) {
      onChange(defaultSignature);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Signature Attached
          </span>
        )}
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
        <button
          type="button"
          onClick={() => setTab('draw')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            tab === 'draw'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          Draw Digital Signature
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            tab === 'upload'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Image File
        </button>
        {defaultSignature && (
          <button
            type="button"
            onClick={() => {
              setTab('default');
              handleUseDefault();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              tab === 'default'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Use Saved Signature
          </button>
        )}
      </div>

      {/* Mode 1: Drawing Canvas */}
      {tab === 'draw' && (
        <div className="relative border border-slate-300 rounded-lg bg-white overflow-hidden shadow-xs">
          <canvas
            ref={canvasRef}
            width={460}
            height={130}
            className="w-full h-32 touch-none cursor-crosshair bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 select-none pointer-events-none">
            Sign inside this box with mouse or touch
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: File Upload */}
      {tab === 'upload' && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          {value && tab === 'upload' ? (
            <div className="space-y-2">
              <div className="h-24 max-w-xs mx-auto p-2 bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                <img
                  src={value}
                  alt="Uploaded signature"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Change Image File
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer space-y-1.5"
            >
              <Upload className="w-7 h-7 mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">
                Click to browse signature image
              </p>
              <p className="text-[11px] text-slate-400">PNG, JPG, or SVG up to 5MB</p>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Use Profile Signature */}
      {tab === 'default' && defaultSignature && (
        <div className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-32 border border-slate-100 rounded bg-slate-50 p-1 flex items-center justify-center overflow-hidden">
              <img
                src={defaultSignature}
                alt="Saved signature"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Profile Signature on File
              </p>
              <p className="text-[11px] text-slate-500">
                {signerName || 'Verified Corporate Account'}
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Applied
          </span>
        </div>
      )}

      {/* Visual Live Signature Bar */}
      {value && tab !== 'default' && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Preview:</span>
            <div className="h-9 w-28 bg-white border border-slate-200 rounded px-1 flex items-center justify-center">
              <img
                src={value}
                alt="Signature preview"
                className="max-h-8 max-w-full object-contain"
              />
            </div>
          </div>
          {signerName && (
            <span className="text-[11px] text-slate-500 font-medium">
              Signer: {signerName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
