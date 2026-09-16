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
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfExport';

export interface A4PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  filename?: string;
  initialOrientation?: 'portrait' | 'landscape';
  children: React.ReactNode;
  onBeforePrint?: () => void;
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
}: A4PrintPreviewModalProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(initialOrientation);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [printFeedback, setPrintFeedback] = useState<{ type: 'info' | 'success' | 'warn'; msg: string } | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  // Sync orientation when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrientation(initialOrientation);
      setPrintFeedback(null);
      // Sensible default zoom depending on window width
      if (window.innerWidth < 420) {
        setZoomLevel(0.38);
      } else if (window.innerWidth < 640) {
        setZoomLevel(0.48);
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
        scale: 2.2,
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

  // 2. Print Directly action
  const handlePrintDirectly = () => {
    onBeforePrint?.();
    setPrintFeedback({
      type: 'info',
      msg: 'પ્રિન્ટ ડાયલોગ શરૂ થઈ રહ્યો છે... જો બ્રાઉઝર પ્રીવ્યૂમાં ડાયલોગ ન ખુલે, તો "સેવ PDF" બટન વાપરો.',
    });

    try {
      // Mark body with print class for targeted styling
      document.body.classList.add('is-printing-a4-preview');

      // Attempt native print
      window.print();

      setTimeout(() => {
        document.body.classList.remove('is-printing-a4-preview');
      }, 1000);
    } catch (printErr) {
      console.warn('Native window.print() failed:', printErr);
      document.body.classList.remove('is-printing-a4-preview');
      setPrintFeedback({
        type: 'warn',
        msg: 'આઇફ્રેમ સેન્ડબોક્સમાં પ્રિન્ટ ડાયલોગ બ્લોક થયો હોઈ શકે છે. કૃપા કરીને "સેવ PDF" વિકલ્પ વાપરો.',
      });
    }
  };

  const isPortrait = orientation === 'portrait';

  return (
    <div
      id="print-modal-root"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-between overflow-hidden animate-in fade-in duration-150"
    >
      {/* Top Header Bar (Excluded from Print) */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg print:hidden">
        {/* Document Title and Info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                {title}
              </h2>
              <span className="text-[11px] bg-blue-900/60 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-700/50">
                A4 {isPortrait ? 'Portrait (ઊભું)' : 'Landscape (આડું)'} • 210 × 297 mm
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Middle: Controls (Orientation & Zoom) */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1">
          {/* Orientation Toggle */}
          <div className="flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-2.5 py-1 rounded transition-colors ${
                isPortrait
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="A4 Portrait standard size (210 × 297 mm)"
            >
              ઊભું (Portrait)
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-2.5 py-1 rounded transition-colors ${
                !isPortrait
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="A4 Landscape wide size (297 × 210 mm)"
            >
              આડું (Landscape)
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] font-bold text-slate-300 w-10 text-center select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(0.85)}
              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right Actions: Save PDF, Print Directly, Close */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
          {/* Save as PDF Button */}
          <button
            type="button"
            onClick={handleSavePdf}
            disabled={isExportingPdf}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md transition-all disabled:opacity-50 min-h-[38px]"
            title="Download crisp vector A4 PDF file directly to your device"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-100" />
                <span>{pdfProgress || 'PDF...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>સેવ PDF (Save)</span>
              </>
            )}
          </button>

          {/* Print Directly Button */}
          <button
            type="button"
            onClick={handlePrintDirectly}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md transition-all min-h-[38px]"
            title="Print directly using your browser / system printer dialog (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span>પ્રિન્ટ (Print)</span>
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 min-h-[38px] min-w-[38px] flex items-center justify-center"
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
            {printFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {printFeedback.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            {printFeedback.type === 'info' && <FileText className="w-4 h-4 text-blue-400" />}
            <span>{printFeedback.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setPrintFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Preview Workdesk Viewport */}
      <div className="flex-1 overflow-auto bg-slate-900/90 p-4 sm:p-8 flex justify-center items-start print:bg-white print:p-0 print:overflow-visible">
        <div
          className="transition-transform duration-150 origin-top flex flex-col items-center print:transform-none print:w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* The true A4 sheet paper */}
          <div
            ref={sheetRef}
            id="printable-preview-a4-content"
            className={`bg-white text-slate-900 shadow-2xl rounded-xs relative a4-printable-document ${
              isPortrait
                ? 'w-[210mm] max-w-[210mm] min-h-[297mm]'
                : 'w-[297mm] max-w-[297mm] min-h-[210mm]'
            } p-8 sm:p-12 print:shadow-none print:border-none print:m-0 print:p-8 print:w-full print:max-w-none`}
            style={{
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar (Hidden during print) */}
      <div className="bg-slate-900 border-t border-slate-800 text-slate-400 px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span>💡 <strong>ટીપ:</strong> તમે આ A4 રિપોર્ટને <strong>&quot;સેવ PDF&quot;</strong> થી પીડીએફ તરીકે સાચવી શકો છો અથવા <strong>&quot;સીધી પ્રિન્ટ&quot;</strong> થી પ્રિન્ટર પર મોકલી શકો છો.</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>ISO 216: A4 ({isPortrait ? '210 × 297 mm' : '297 × 210 mm'})</span>
          <span>Shortcuts: Ctrl+P / Esc</span>
        </div>
      </div>
    </div>
  );
}
