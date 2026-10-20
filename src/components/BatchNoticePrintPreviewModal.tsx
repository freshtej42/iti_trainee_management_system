import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Trainee, Instructor } from '../types';
import { exportBatchElementsToPdf, exportElementToPdf, printCleanDocument } from '../utils/pdfExport';
import { getEffectiveLetterheadHtml, renderLetterheadHtml } from '../utils/letterheadPresets';

export interface BatchNoticeItem {
  trainee: Trainee;
  html: string;
  percentage: number;
  outwardNumber: string;
  monthYear: string;
  isFlagged: boolean;
}

export interface BatchNoticePrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: BatchNoticeItem[];
  instructor: Instructor;
  templateName: string;
  language?: string;
  showLetterhead?: boolean;
  letterheadHtml?: string;
  onRecordDispatches?: () => void;
}

export default function BatchNoticePrintPreviewModal({
  isOpen,
  onClose,
  notices,
  instructor,
  templateName,
  language = 'Gujarati',
  showLetterhead = true,
  letterheadHtml,
  onRecordDispatches,
}: BatchNoticePrintPreviewModalProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [isLetterheadActive, setIsLetterheadActive] = useState<boolean>(showLetterhead);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'info' | 'success' | 'warn'; msg: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const singleSheetRef = useRef<HTMLDivElement>(null);
  const allSheetsRef = useRef<HTMLDivElement>(null);

  // Standard A4 dimensions at 96 DPI: 794px width x 1123px height
  const baseWidthPx = 794;
  const baseHeightPx = 1123;

  // Responsive fit-to-screen zoom calculator for mobile/Android
  const computeFitZoom = () => {
    if (typeof window === 'undefined') return 0.85;
    const availW = Math.max(300, window.innerWidth - (window.innerWidth < 640 ? 20 : 48));
    const ratio = Number((availW / baseWidthPx).toFixed(2));
    if (window.innerWidth < 640) {
      return Math.min(0.65, Math.max(0.35, ratio));
    }
    if (window.innerWidth < 1024) {
      return 0.65;
    }
    return 0.85;
  };

  // Initialize and adjust zoom, and sync letterhead setting
  useEffect(() => {
    if (isOpen) {
      setIsLetterheadActive(showLetterhead);
      setCurrentPageIndex(0);
      setFeedback(null);
      setZoomLevel(computeFitZoom());
    }
  }, [isOpen, showLetterhead]);

  // Handle window resize to keep preview centered on mobile rotation
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setZoomLevel(computeFitZoom());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentPageIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPageIndex((prev) => Math.min(notices.length - 1, prev + 1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrintAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, notices.length]);

  if (!isOpen) return null;

  if (notices.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            No Trainees Selected
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please select at least one trainee from the report page to view preview and export PDFs.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
          >
            Back (Close)
          </button>
        </div>
      </div>
    );
  }

  const currentNotice = notices[Math.min(currentPageIndex, notices.length - 1)];
  const fontFamily =
    language === 'Hindi'
      ? "'Noto Sans Devanagari', sans-serif"
      : "'Noto Sans Gujarati', 'Anek Gujarati', sans-serif";

  // 1. Export all notices as combined multi-page PDF
  const handleExportAllPdf = async () => {
    if (!allSheetsRef.current) return;
    const pages = Array.from(allSheetsRef.current.children) as HTMLElement[];
    if (pages.length === 0) return;

    try {
      setIsExportingPdf(true);
      setPdfProgress(`Preparing A4 PDF for all ${pages.length} notices...`);
      setFeedback(null);

      onRecordDispatches?.();

      const cleanTrade = (instructor.trade || 'ITI').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `ITI_Batch_Notices_${cleanTrade}_${pages.length}_Letters.pdf`;

      await exportBatchElementsToPdf(pages, {
        filename,
        orientation: 'portrait',
        onProgress: (msg) => setPdfProgress(msg),
        onPageProgress: (curr, total) => {
          setPdfProgress(`Rendering notice ${curr} of ${total}...`);
        },
      });

      setFeedback({
        type: 'success',
        msg: `All ${pages.length} notices saved successfully as PDF (${filename})`,
      });
      setTimeout(() => setFeedback(null), 6000);
    } catch (err) {
      console.error('Batch PDF generation failed:', err);
      setFeedback({
        type: 'warn',
        msg: 'Error generating PDF. Please use the Print option.',
      });
    } finally {
      setIsExportingPdf(false);
      setPdfProgress('');
    }
  };

  // 2. Export single current notice as PDF
  const handleExportSinglePdf = async () => {
    if (!singleSheetRef.current) return;
    try {
      setIsExportingPdf(true);
      setPdfProgress(`Preparing PDF for notice (Roll: ${currentNotice.trainee.roll_no})...`);
      setFeedback(null);

      onRecordDispatches?.();

      const filename = `ITI_Notice_Roll_${currentNotice.trainee.roll_no}_${(currentNotice.trainee.student_name_en || currentNotice.trainee.student_name).replace(/\s+/g, '_')}.pdf`;
      await exportElementToPdf(singleSheetRef.current, {
        filename,
        orientation: 'portrait',
        onProgress: (msg) => setPdfProgress(msg),
      });

      setFeedback({
        type: 'success',
        msg: `Notice saved successfully (${filename})`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Single PDF error:', err);
      setFeedback({
        type: 'warn',
        msg: 'Error generating notice PDF.',
      });
    } finally {
      setIsExportingPdf(false);
      setPdfProgress('');
    }
  };

  // 3. Print all notices directly (Android & Desktop friendly)
  const handlePrintAll = async () => {
    onRecordDispatches?.();
    setFeedback({
      type: 'info',
      msg: 'Opening print dialog...',
    });

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      document.body.classList.add('is-printing-modal');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('is-printing-modal');
      }, 1000);
      return;
    }

    if (allSheetsRef.current) {
      await printCleanDocument(allSheetsRef.current, {
        title: `ITI Batch Notices - ${instructor.trade} (${notices.length} Letters)`,
        orientation: 'portrait',
      });
    } else {
      window.print();
    }
  };

  // 4. Print single current notice directly
  const handlePrintCurrent = async () => {
    onRecordDispatches?.();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      document.body.classList.add('is-printing-modal');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('is-printing-modal');
      }, 1000);
      return;
    }

    if (singleSheetRef.current) {
      await printCleanDocument(singleSheetRef.current, {
        title: `ITI Notice - Roll ${currentNotice.trainee.roll_no} - ${currentNotice.trainee.student_name}`,
        orientation: 'portrait',
      });
    } else {
      window.print();
    }
  };

  // Helper to render one A4 Notice Sheet
  const renderNoticeSheet = (item: BatchNoticeItem, index: number, isMultiPageStack = false) => {
    const effectiveLetterhead =
      letterheadHtml ||
      instructor.letterhead_html ||
      instructor.header_config?.letterhead_html ||
      getEffectiveLetterheadHtml(instructor);

    return (
      <div
        key={item.trainee.id}
        className={`bg-white text-slate-900 shadow-2xl rounded-xs a4-printable-document flex flex-col justify-start p-8 sm:p-12 w-[794px] max-w-[794px] min-h-[1123px] mx-auto ${
          isMultiPageStack ? 'mb-8 print:mb-0' : ''
        }`}
        style={{
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          fontFamily,
          pageBreakAfter: isMultiPageStack && index < notices.length - 1 ? 'always' : 'auto',
          breakAfter: isMultiPageStack && index < notices.length - 1 ? 'page' : 'auto',
        }}
      >
        {/* Official ITI Letterhead (Conditional per template or on-the-fly toggle) */}
        {isLetterheadActive && (
          effectiveLetterhead ? (
            <div
              className="mb-4 iti-rendered-letterhead select-none"
              dangerouslySetInnerHTML={{
                __html: renderLetterheadHtml(effectiveLetterhead, {
                  refNumber: item.outwardNumber,
                  issueDate: new Date().toLocaleDateString('gu-IN'),
                }),
              }}
            />
          ) : instructor.header_config?.letterhead_mode === 'custom_banner' && instructor.header_config?.custom_banner_image_url ? (
          <div
            className="mb-4 select-none"
            style={{ marginBottom: `${instructor.header_config.custom_banner_margin_bottom_mm ?? 4}mm` }}
          >
            <div
              className="w-full flex items-center justify-center overflow-hidden"
              style={{ height: `${instructor.header_config.custom_banner_height_mm || 38}mm` }}
            >
              <img
                src={instructor.header_config.custom_banner_image_url}
                alt="Institute Letterhead Banner"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Outward Details Row */}
            <div className="mt-2 pt-1 border-t border-slate-400 flex justify-between items-center text-xs text-slate-800 font-medium">
              <div>
                જાવક નંબર: <strong className="text-slate-900">{item.outwardNumber}</strong>
              </div>
              <div>
                તારીખ: <strong className="text-slate-900">{new Date().toLocaleDateString('gu-IN')}</strong>
              </div>
            </div>
          </div>
        ) : instructor.header_config?.letterhead_mode === 'blank_for_preprinted' ? (
          <div
            className="w-full print:border-none border border-dashed border-slate-300 rounded mb-4 flex items-center justify-center text-[10px] text-slate-400 select-none no-print"
            style={{ height: `${instructor.header_config?.custom_banner_height_mm || 40}mm` }}
          >
            <span>[ઓફિસ પ્રિન્ટેડ લેટરહેડ કાગળ માટે રાખેલ જગ્યા - {instructor.header_config?.custom_banner_height_mm || 40}mm]</span>
          </div>
        ) : (
          <div className="mb-6 border-b-2 border-slate-800 pb-3 select-none">
            <div className="flex items-center justify-between gap-4">
              {/* Government of Gujarat / ITI Emblem or Custom Left Logo */}
              {instructor.header_config?.show_logo !== false && (
                <div className="shrink-0 flex items-center justify-center">
                  {instructor.header_config?.logo_url ? (
                    <img
                      src={instructor.header_config.logo_url}
                      alt="Left Logo"
                      style={{
                        width: `${instructor.header_config.logo_width || 56}px`,
                        height: `${instructor.header_config.logo_width || 56}px`,
                      }}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-slate-50">
                      <div className="text-[9px] font-bold tracking-tight text-slate-800 uppercase leading-none">
                        GOVT OF
                      </div>
                      <div className="text-base font-black text-blue-900 leading-tight">ITI</div>
                      <div className="text-[8px] font-bold text-slate-700 uppercase leading-none">
                        GUJARAT
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Center Title */}
              <div className="text-center grow">
                <div className="text-xs font-semibold text-slate-600 tracking-wider">
                  {instructor.header_config?.department_subtitle || 'શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર'}
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif mt-0.5">
                  {instructor.header_config?.institute_name_gu || instructor.iti_name || 'ઔદ્યોગિક તાલીમ સંસ્થા'}
                </h1>
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  {instructor.header_config?.institute_name_en || 'INDUSTRIAL TRAINING INSTITUTE'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {instructor.header_config?.address || instructor.institution_address || 'ગુજરાત રાજ્ય'}
                </div>
              </div>

              {/* Right Meta Info or Custom Right Logo */}
              <div className="text-right text-[11px] text-slate-600 shrink-0 select-none space-y-0.5">
                {instructor.header_config?.show_right_logo && instructor.header_config?.right_logo_url ? (
                  <img
                    src={instructor.header_config.right_logo_url}
                    alt="Right Logo"
                    style={{
                      width: `${instructor.header_config.right_logo_width || 56}px`,
                      height: `${instructor.header_config.right_logo_width || 56}px`,
                    }}
                    className="object-contain ml-auto"
                  />
                ) : (
                  <>
                    <div className="font-semibold text-slate-800">ISO 9001:2015</div>
                    <div>ટ્રેડ: <strong className="text-slate-900">{instructor.trade}</strong></div>
                    <div>બેચ: <strong className="text-slate-900">{item.trainee.batch || instructor.batch}</strong></div>
                  </>
                )}
              </div>
            </div>

            {/* Sub Header Rule with Outward Details */}
            <div className="mt-3 pt-1.5 border-t border-slate-300 flex justify-between items-center text-xs text-slate-700 font-medium">
              <div>
                જાવક નંબર: <strong className="text-slate-900">{item.outwardNumber}</strong>
              </div>
              <div>
                તારીખ: <strong className="text-slate-900">{new Date().toLocaleDateString('gu-IN')}</strong>
              </div>
            </div>
          </div>
        )
      )}

      {/* Merged Letter Content */}
      <div
        className="report-rendered-document grow text-slate-900 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: item.html }}
      />
    </div>
  );
};

  const scaledWidthPx = Math.round(baseWidthPx * zoomLevel);
  const scaledHeightPx = Math.round(baseHeightPx * zoomLevel);

  return (
    <div
      id="batch-print-modal-root"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex flex-col justify-between overflow-hidden animate-in fade-in duration-150 h-[100dvh]"
    >
      {/* Top Controls Bar (Clean & Responsive for Mobile / Desktop) */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-lg print:hidden">
        {/* Left: Title & Page Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-xs shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[160px] sm:max-w-xs">
                A4 Preview
              </h2>
              <span className="text-[10px] sm:text-[11px] bg-blue-900/60 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-700/50">
                {notices.length} Notices
              </span>
            </div>
          </div>

          {/* Quick Page Navigator */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs ml-1 sm:ml-2">
            <button
              type="button"
              onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
              disabled={currentPageIndex === 0}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Previous Notice"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono font-bold text-slate-200">
              {currentPageIndex + 1} / {notices.length}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPageIndex((p) => Math.min(notices.length - 1, p + 1))}
              disabled={currentPageIndex >= notices.length - 1}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Next Notice"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle: Letterhead & Zoom Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Letterhead toggle */}
          <button
            type="button"
            onClick={() => setIsLetterheadActive(!isLetterheadActive)}
            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors border ${
              isLetterheadActive
                ? 'bg-blue-900/80 border-blue-400 text-blue-200'
                : 'bg-slate-800 border-slate-600 text-slate-300'
            }`}
            title="Toggle Letterhead Header"
          >
            <Building2 className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Letterhead:</span>
            <span>{isLetterheadActive ? 'On' : 'Off'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-slate-300 w-8 text-center select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(computeFitZoom())}
              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="Fit Screen"
            >
              Fit
            </button>
          </div>
        </div>

        {/* Right Actions: Save PDF, Print, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Save PDF Button */}
          <button
            type="button"
            onClick={handleExportAllPdf}
            disabled={isExportingPdf}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md transition-all disabled:opacity-50 min-h-[34px]"
            title="Download all notices as A4 PDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-100" />
                <span className="text-[11px]">{pdfProgress || 'PDF...'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>Save PDF</span>
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrintAll}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md transition-all min-h-[34px]"
            title="Print all notices directly"
          >
            <Printer className="w-3.5 h-3.5 text-blue-200" />
            <span>Print</span>
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Optional Feedback Toast */}
      {feedback && (
        <div
          className={`px-4 py-1.5 text-xs flex items-center justify-between border-b shrink-0 print:hidden ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : feedback.type === 'warn'
              ? 'bg-amber-950/90 text-amber-200 border-amber-800'
              : 'bg-blue-950/90 text-blue-200 border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            {feedback.type === 'warn' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            {feedback.type === 'info' && <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Preview Workdesk Viewport (Responsive & Android-Optimized) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-900/95 p-2 sm:p-6 flex flex-col items-center select-none print:bg-white print:p-0 print:overflow-visible"
      >
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
            <div ref={singleSheetRef}>
              {renderNoticeSheet(currentNotice, currentPageIndex, false)}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden DOM Stream for Generating High-DPI Multi-Page PDF & Clean Print */}
      <div
        ref={allSheetsRef}
        id="batch-all-sheets-container"
        className="fixed -left-[9999px] top-0 pointer-events-none print:static print:pointer-events-auto print:left-auto print:block print:w-full"
      >
        {notices.map((item, idx) => renderNoticeSheet(item, idx, true))}
      </div>

      {/* Bottom Information Footer */}
      <div className="bg-slate-900 border-t border-slate-800 text-slate-400 px-3 sm:px-4 py-1.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-1.5 shrink-0 print:hidden select-none">
        <div className="flex items-center gap-2">
          <span>
            💡 <strong>Android:</strong> Use <strong>&quot;Save PDF&quot;</strong> to download or <strong>&quot;Print&quot;</strong> to print directly.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Trainee: [Roll {currentNotice.trainee.roll_no}] {currentNotice.trainee.student_name_en || currentNotice.trainee.student_name}</span>
          <span className="hidden sm:inline">Notice {currentPageIndex + 1} / {notices.length}</span>
        </div>
      </div>
    </div>
  );
}
