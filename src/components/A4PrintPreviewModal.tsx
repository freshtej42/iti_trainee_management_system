import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
  Maximize2,
} from 'lucide-react';
import { exportElementToPdf, printCleanDocument } from '../utils/pdfExport';

export interface A4PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  filename?: string;
  initialOrientation?: 'portrait' | 'landscape';
  children: React.ReactNode;
  onBeforePrint?: () => void;
  showLetterheadToggle?: boolean;
  isLetterheadActive?: boolean;
  onToggleLetterhead?: () => void;
}

export default function A4PrintPreviewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  filename = 'document.pdf',
  initialOrientation = 'portrait',
  children,
  onBeforePrint,
  showLetterheadToggle = false,
  isLetterheadActive = true,
  onToggleLetterhead,
}: A4PrintPreviewModalProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(initialOrientation);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [printFeedback, setPrintFeedback] = useState<{ type: 'info' | 'success' | 'warn'; msg: string } | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  const isPortrait = orientation === 'portrait';
  const baseWidthPx = isPortrait ? 794 : 1123;
  const baseHeightPx = isPortrait ? 1123 : 794;

  const computeFitZoom = () => {
    const padding = window.innerWidth < 640 ? 16 : 48;
    const availW = window.innerWidth - padding;
    const ratio = Number((availW / baseWidthPx).toFixed(2));
    if (window.innerWidth < 640) {
      return Math.min(0.65, Math.max(0.35, ratio));
    }
    return Math.min(1.0, Math.max(0.4, ratio));
  };

  // Sync orientation and calculate responsive zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrientation(initialOrientation);
      setPrintFeedback(null);
      if (window.innerWidth < 640) {
        setZoomLevel(computeFitZoom());
      } else if (window.innerWidth < 1024) {
        setZoomLevel(0.65);
      } else {
        setZoomLevel(0.85);
      }
    }
  }, [isOpen, initialOrientation]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrintDirectly();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, orientation]);

  if (!isOpen) return null;

  // 1. Save as PDF action
  const handleSavePdf = async () => {
    if (!sheetRef.current) return;
    try {
      setIsExportingPdf(true);
      setPdfProgress('A4 PDF તૈયાર થઈ રહી છે...');
      setPrintFeedback(null);

      const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      await exportElementToPdf(sheetRef.current, {
        filename: safeFilename,
        orientation,
        scale: 2.0,
        onProgress: (msg) => setPdfProgress(msg),
      });

      setPrintFeedback({
        type: 'success',
        msg: `PDF સફળતાપૂર્વક સાચવવામાં આવી (${safeFilename})`,
      });
      setTimeout(() => setPrintFeedback(null), 5000);
    } catch (err) {
      console.error('Save PDF Error:', err);
      setPrintFeedback({
        type: 'warn',
        msg: 'PDF બનાવવામાં ક્ષતિ આવી. કૃપા કરીને પ્રિન્ટ વિકલ્પ વાપરો.',
      });
    } finally {
      setIsExportingPdf(false);
      setPdfProgress('');
    }
  };

  // 2. Print Directly action with Android-friendly native print
  const handlePrintDirectly = async () => {
    onBeforePrint?.();
    if (!sheetRef.current) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      document.body.classList.add('is-printing-modal');
      try {
        window.print();
      } catch (printErr) {
        console.warn('Mobile print blocked by sandbox, downloading PDF:', printErr);
        handleSavePdf();
      }
      setTimeout(() => {
        document.body.classList.remove('is-printing-modal');
      }, 1000);
      return;
    }

    try {
      await printCleanDocument(sheetRef.current, {
        title,
        orientation,
      });
    } catch (err) {
      console.warn('Print direct fallback:', err);
      window.print();
    }
  };

  const scaledWidthPx = Math.round(baseWidthPx * zoomLevel);
  const scaledHeightPx = Math.round(baseHeightPx * zoomLevel);

  return (
    <div
      id="print-modal-root"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col justify-between overflow-hidden animate-in fade-in duration-150 h-[100dvh]"
    >
      {/* Top Header Bar (Excluded from Print) */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0 shadow-lg print:hidden">
        {/* Document Title and Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-xs shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
                {title}
              </h2>
              <span className="text-[10px] sm:text-[11px] bg-blue-900/60 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-700/50">
                A4 {isPortrait ? 'Portrait (ઊભું)' : 'Landscape (આડું)'}
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-md">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Middle: Controls (Orientation, Zoom & Letterhead) */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1 text-xs">
          {/* Orientation Toggle */}
          <div className="flex items-center font-semibold text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-2 py-1 rounded transition-colors ${
                isPortrait
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="A4 Portrait standard size (210 × 297 mm)"
            >
              ઊભું
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-2 py-1 rounded transition-colors ${
                !isPortrait
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="A4 Landscape wide size (297 × 210 mm)"
            >
              આડું
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-0.5"></div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.3, Number((z - 0.08).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-slate-300 w-8 sm:w-10 text-center select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.08).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(computeFitZoom())}
              className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
              title="Fit to screen width (સ્ક્રીન માપ)"
            >
              Fit
            </button>
          </div>

          {showLetterheadToggle && onToggleLetterhead && (
            <>
              <div className="h-4 w-px bg-slate-700 mx-0.5 hidden sm:block"></div>
              <button
                type="button"
                onClick={onToggleLetterhead}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  isLetterheadActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title="સાદા A4 કાગળ માટે લેટરહેડ ચાલુ રાખો, પ્રી-પ્રિન્ટેડ કાગળ માટે બંધ કરો"
              >
                <span>લેટરહેડ: {isLetterheadActive ? 'હા' : 'ના'}</span>
              </button>
            </>
          )}
        </div>

        {/* Right Actions: Save PDF, Print Directly, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
          {/* Save as PDF Button */}
          <button
            type="button"
            onClick={handleSavePdf}
            disabled={isExportingPdf}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md transition-all disabled:opacity-50 min-h-[36px]"
            title="Download crisp vector A4 PDF file directly to your device"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-100" />
                <span className="text-[11px]">{pdfProgress || 'PDF...'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>સેવ PDF</span>
              </>
            )}
          </button>

          {/* Print Directly Button */}
          <button
            type="button"
            onClick={handlePrintDirectly}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md transition-all min-h-[36px]"
            title="Print directly using your browser / system printer dialog"
          >
            <Printer className="w-3.5 h-3.5 text-blue-200" />
            <span>પ્રિન્ટ</span>
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Optional Feedback or Help Toast */}
      {printFeedback && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b shrink-0 print:hidden ${
            printFeedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : printFeedback.type === 'warn'
              ? 'bg-amber-950/90 text-amber-200 border-amber-800'
              : 'bg-blue-950/90 text-blue-200 border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {printFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {printFeedback.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {printFeedback.type === 'info' && <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{printFeedback.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setPrintFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Preview Workdesk Viewport (Responsive & Android-Optimized) */}
      <div className="flex-1 overflow-auto bg-slate-900/95 p-2 sm:p-6 flex flex-col items-center select-none print:bg-white print:p-0 print:overflow-visible">
        {/* Scaled Wrapper: Takes exact scaled width so it centers cleanly on Android screens without clipping */}
        <div
          className="print:w-full print:m-0"
          style={{
            width: `${scaledWidthPx}px`,
            minHeight: `${scaledHeightPx}px`,
            position: 'relative',
            margin: '0 auto',
          }}
        >
          <div
            className="print:transform-none print:w-full"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              width: `${baseWidthPx}px`,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {/* The true A4 sheet paper */}
            <div
              ref={sheetRef}
              id="printable-preview-a4-content"
              className="bg-white text-slate-900 shadow-2xl rounded-xs p-6 sm:p-10 font-gujarati text-slate-900 leading-relaxed a4-printable-document print:shadow-none print:border-none print:m-0 print:p-8 print:w-full print:max-w-none"
              style={{
                width: `${baseWidthPx}px`,
                minHeight: `${baseHeightPx}px`,
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar (Hidden during print) */}
      <div className="bg-slate-900 border-t border-slate-800 text-slate-400 px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 print:hidden select-none">
        <div className="flex items-center gap-2">
          <span>💡 <strong>ટીપ:</strong> Android ઉપકરણો પર <strong>&quot;સેવ PDF&quot;</strong> થી ફાઇલ ડાઉનલોડ કરી સીધી પ્રિન્ટ કરી શકો છો.</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>ISO 216: A4 ({isPortrait ? '210 × 297 mm' : '297 × 210 mm'})</span>
          <span className="hidden sm:inline">Shortcuts: Ctrl+P / Esc</span>
        </div>
      </div>
    </div>
  );
}
