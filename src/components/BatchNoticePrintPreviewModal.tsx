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
  Layers,
  Users,
} from 'lucide-react';
import { Trainee, Instructor } from '../types';
import { exportBatchElementsToPdf, exportElementToPdf, printCleanDocument } from '../utils/pdfExport';

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
  onRecordDispatches?: () => void;
}

export default function BatchNoticePrintPreviewModal({
  isOpen,
  onClose,
  notices,
  instructor,
  templateName,
  language = 'Gujarati',
  onRecordDispatches,
}: BatchNoticePrintPreviewModalProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'info' | 'success' | 'warn'; msg: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const singleSheetRef = useRef<HTMLDivElement>(null);
  const allSheetsRef = useRef<HTMLDivElement>(null);

  // Initialize and adjust zoom
  useEffect(() => {
    if (isOpen) {
      setCurrentPageIndex(0);
      setFeedback(null);
      if (window.innerWidth < 640) {
        setZoomLevel(0.45);
      } else if (window.innerWidth < 1024) {
        setZoomLevel(0.65);
      } else {
        setZoomLevel(0.85);
      }
    }
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

  if (!isOpen || notices.length === 0) return null;

  const currentNotice = notices[Math.min(currentPageIndex, notices.length - 1)];
  const fontFamily =
    language === 'Hindi'
      ? "'Noto Sans Devanagari', sans-serif"
      : "'Noto Sans Gujarati', sans-serif";

  // 1. Export all notices as combined multi-page PDF
  const handleExportAllPdf = async () => {
    if (!allSheetsRef.current) return;
    const pages = Array.from(allSheetsRef.current.children) as HTMLElement[];
    if (pages.length === 0) return;

    try {
      setIsExportingPdf(true);
      setPdfProgress(`તમામ ${pages.length} પત્રો માટે A4 PDF તૈયાર થાય છે...`);
      setFeedback(null);

      onRecordDispatches?.();

      const cleanTrade = instructor.trade.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `ITI_Batch_Notices_${cleanTrade}_${pages.length}_Letters.pdf`;

      await exportBatchElementsToPdf(pages, {
        filename,
        orientation: 'portrait',
        scale: 2.0,
        onProgress: (msg) => setPdfProgress(msg),
        onPageProgress: (curr, total) => {
          setPdfProgress(`પત્ર ${curr} / ${total} નું રેન્ડરિંગ...`);
        },
      });

      setFeedback({
        type: 'success',
        msg: `બધા ${pages.length} પત્રો સફળતાપૂર્વક પીડીએફ તરીકે સેવ થયા (${filename})`,
      });
      setTimeout(() => setFeedback(null), 6000);
    } catch (err) {
      console.error('Batch PDF generation failed:', err);
      setFeedback({
        type: 'warn',
        msg: 'PDF બનાવવામાં ક્ષતિ આવી. કૃપા કરીને પ્રિન્ટ વિકલ્પ વાપરો.',
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
      setPdfProgress(`પત્ર (રોલ નં: ${currentNotice.trainee.roll_no}) માટે PDF તૈયાર થાય છે...`);
      setFeedback(null);

      onRecordDispatches?.();

      const filename = `ITI_Notice_Roll_${currentNotice.trainee.roll_no}_${currentNotice.trainee.student_name.replace(/\s+/g, '_')}.pdf`;
      await exportElementToPdf(singleSheetRef.current, {
        filename,
        orientation: 'portrait',
        scale: 2.2,
        onProgress: (msg) => setPdfProgress(msg),
      });

      setFeedback({
        type: 'success',
        msg: `પત્ર સફળતાપૂર્વક સાચવવામાં આવ્યો (${filename})`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Single PDF error:', err);
      setFeedback({
        type: 'warn',
        msg: 'પત્ર PDF બનાવવામાં ક્ષતિ આવી.',
      });
    } finally {
      setIsExportingPdf(false);
      setPdfProgress('');
    }
  };

  // 3. Print all notices directly
  const handlePrintAll = async () => {
    onRecordDispatches?.();
    setFeedback({
      type: 'info',
      msg: 'તમામ પત્રો માટે પ્રિન્ટ ડાયલોગ ખુલી રહ્યો છે...',
    });

    if (allSheetsRef.current) {
      await printCleanDocument(allSheetsRef.current, {
        title: `ITI Batch Notices - ${instructor.trade} (${notices.length} Letters)`,
        orientation: 'portrait',
      });
    } else {
      window.print();
    }
  };

  // 4. Print single notice directly
  const handlePrintCurrent = async () => {
    onRecordDispatches?.();
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
  const renderNoticeSheet = (item: BatchNoticeItem, index: number, isMultiPageStack = false) => (
    <div
      key={item.trainee.id}
      className={`bg-white text-slate-900 shadow-2xl rounded-xs a4-printable-document flex flex-col justify-between p-8 sm:p-12 w-[210mm] max-w-[210mm] min-h-[297mm] mx-auto ${
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
      {/* Official ITI Letterhead */}
      <div className="mb-6 border-b-2 border-slate-800 pb-3 select-none">
        <div className="flex items-center justify-between gap-4">
          {/* Government of Gujarat ITI Emblem */}
          <div className="w-16 h-16 rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-slate-50">
            <div className="text-[9px] font-bold tracking-tight text-slate-800 uppercase leading-none">
              GOVT OF
            </div>
            <div className="text-base font-black text-blue-900 leading-tight">ITI</div>
            <div className="text-[8px] font-bold text-slate-700 uppercase leading-none">
              GUJARAT
            </div>
          </div>

          {/* Center Title */}
          <div className="text-center grow">
            <div className="text-xs font-semibold text-slate-600 tracking-wider">
              શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif mt-0.5">
              {instructor.iti_name}
            </h1>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              Industrial Training Institute • વ્યવસાય: {instructor.trade} ({instructor.unit})
            </div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">
              ઈમેલ: {instructor.email} {instructor.phone && `• ફોન: ${instructor.phone}`}
            </div>
          </div>

          {/* Skill India emblem */}
          <div className="w-16 h-16 rounded-full border border-slate-300 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-blue-50/50">
            <div className="text-[8px] font-bold text-blue-800 uppercase">Skill</div>
            <div className="text-xs font-black text-orange-600">India</div>
            <div className="text-[7px] text-slate-600">કૌશલ ભારત</div>
          </div>
        </div>

        {/* Outward & Trainee Quick Reference Meta Bar */}
        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
          <div>
            <strong>જાવક ક્રમાંક:</strong> <span className="text-blue-950 font-bold">{item.outwardNumber}</span>
          </div>
          <div>
            <strong>રોલ નં:</strong> {item.trainee.roll_no} | <strong>હાજરી:</strong>{' '}
            <span className={item.isFlagged ? 'text-rose-700 font-bold' : 'text-slate-800'}>
              {item.percentage}%
            </span>
          </div>
          <div>
            <strong>તારીખ:</strong> {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
      </div>

      {/* Merged Notice Body */}
      <div
        className="grow prose max-w-none text-slate-900 leading-relaxed min-h-[360px] text-sm"
        dangerouslySetInnerHTML={{ __html: item.html }}
      />

      {/* Official Signature & ITI Seal Block */}
      <div className="mt-10 pt-4 border-t border-slate-300 flex items-end justify-between select-none">
        {/* Left: ITI Seal */}
        <div className="border border-dashed border-slate-400 p-2 rounded text-[10px] text-slate-500 max-w-[170px] bg-slate-50/60">
          <div className="font-bold text-slate-700">સંસ્થાનું ગોળ સીલ (ITI Seal)</div>
          <div className="text-[9px] text-slate-400 mt-4 text-center">
            [ સત્તાવાર સિક્કો અહીં લગાવો ]
          </div>
        </div>

        {/* Center: Badge */}
        <div className="text-center text-[10px] text-slate-400">
          <div className="inline-flex items-center gap-1 font-mono text-[9px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Administrative Notice • Page {index + 1} of {notices.length}</span>
          </div>
        </div>

        {/* Right: Instructor Signature */}
        <div className="text-center min-w-[210px]">
          <div className="h-10 flex items-end justify-center pb-1">
            <span className="font-serif italic font-bold text-blue-900 text-sm opacity-85">
              {instructor.name}
            </span>
          </div>
          <div className="border-t border-slate-700 pt-1">
            <div className="font-bold text-xs text-slate-900">{instructor.name}</div>
            <div className="text-[11px] text-slate-700">{instructor.designation}</div>
            <div className="text-[10px] text-slate-500">
              {instructor.trade} • {instructor.iti_name.split('(')[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col">
      {/* Top Application Bar (Controls, Navigation & Actions) */}
      <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg select-none print:hidden">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-xs">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-100">
                A4 પ્રિન્ટ પ્રીવ્યૂ અને પુષ્ટિ (Batch Notice Print Preview & Confirm)
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ {notices.length} પત્રો ચકાસણી માટે તૈયાર
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {instructor.iti_name} • {templateName} • A4 Portrait (210 × 297 mm)
            </p>
          </div>
        </div>

        {/* Center: Pagination & View Switcher */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Single Page vs All Pages Stack */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View one A4 notice page at a time with navigation controls"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>પેજ મુજબ (Single)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View all A4 notice pages continuously stacked"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>તમામ પત્રો (All {notices.length})</span>
            </button>
          </div>

          {/* Page Navigator (shown in Single Mode) */}
          {viewMode === 'single' && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                disabled={currentPageIndex === 0}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
                title="Previous Notice (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Direct Trainee Jump Dropdown */}
              <select
                value={currentPageIndex}
                onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                className="bg-slate-900 text-slate-200 text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
              >
                {notices.map((n, idx) => (
                  <option key={n.trainee.id} value={idx}>
                    {idx + 1}. [રોલ {n.trainee.roll_no}] {n.trainee.student_name} ({n.percentage}%)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setCurrentPageIndex((p) => Math.min(notices.length - 1, p + 1))}
                disabled={currentPageIndex >= notices.length - 1}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
                title="Next Notice (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

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

        {/* Right Actions: Save PDF, Print, Close */}
        <div className="flex items-center gap-2">
          {/* If in single mode, option to download single notice */}
          {viewMode === 'single' && (
            <button
              type="button"
              onClick={handleExportSinglePdf}
              disabled={isExportingPdf}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Download only the currently previewed trainee notice as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>આ પત્ર PDF</span>
            </button>
          )}

          {/* Save All as Combined Multi-Page PDF */}
          <button
            type="button"
            onClick={handleExportAllPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md transition-all disabled:opacity-50"
            title="Download all notices combined into a single multi-page A4 PDF file"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-100" />
                <span>{pdfProgress || 'PDF તૈયાર થાય છે...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>ડાઉનલોડ તમામ A4 PDF ({notices.length})</span>
              </>
            )}
          </button>

          {/* Direct Print All Notices */}
          <button
            type="button"
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md transition-all"
            title="Print all selected trainee notices via system printer (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span>પ્રિન્ટ તમામ પત્રો (A4 Print)</span>
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Verification & Confirmation Sub-Bar */}
      <div className="bg-slate-800 text-slate-300 px-4 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-amber-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ચકાસણી અને પુષ્ટિ (Check & Confirm):
          </span>
          <span className="flex items-center gap-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {notices.length} તાલીમાર્થીઓના પત્રો તૈયાર
          </span>
          <span className="flex items-center gap-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            જાવક ક્રમાંક ({instructor.trade}/...)
          </span>
          <span className="flex items-center gap-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            A4 માપ અને ગુજરાતી ફોન્ટ્સ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintAll}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            title="Confirm and print all notices"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>પુષ્ટિ &amp; પ્રિન્ટ કરો</span>
          </button>
          <button
            type="button"
            onClick={handleExportAllPdf}
            disabled={isExportingPdf}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            title="Confirm and download combined PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>પુષ્ટિ &amp; PDF ડાઉનલોડ</span>
          </button>
        </div>
      </div>

      {/* Optional Feedback or Help Toast */}
      {feedback && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b shrink-0 print:hidden ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : feedback.type === 'warn'
              ? 'bg-amber-950/90 text-amber-200 border-amber-800'
              : 'bg-blue-950/90 text-blue-200 border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {feedback.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            {feedback.type === 'info' && <FileText className="w-4 h-4 text-blue-400" />}
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

      {/* Main Preview Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-900/95 p-4 sm:p-8 flex justify-center items-start print:bg-white print:p-0 print:overflow-visible"
      >
        {/* Single Page View */}
        {viewMode === 'single' ? (
          <div
            className="transition-transform duration-150 origin-top flex flex-col items-center print:transform-none print:w-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div ref={singleSheetRef}>
              {renderNoticeSheet(currentNotice, currentPageIndex, false)}
            </div>
          </div>
        ) : (
          /* Multi-Page Stack View */
          <div
            className="transition-transform duration-150 origin-top flex flex-col items-center print:transform-none print:w-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {notices.map((item, idx) => (
              <div key={item.trainee.id} className="relative group">
                {/* Page Label Tag */}
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400 px-2 print:hidden">
                  <span className="font-mono font-bold">
                    પત્ર {idx + 1} / {notices.length} — રોલ નં: {item.trainee.roll_no} ({item.trainee.student_name})
                  </span>
                  <span className="text-[11px] text-slate-500">A4 Portrait (210 × 297 mm)</span>
                </div>
                {renderNoticeSheet(item, idx, true)}
              </div>
            ))}
          </div>
        )}
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
      <div className="bg-slate-900 border-t border-slate-800 text-slate-400 px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 print:hidden select-none">
        <div className="flex items-center gap-2">
          <span>
            💡 <strong>ચકાસણી અને પુષ્ટિ:</strong> બધા {notices.length} તાલીમાર્થીઓના પત્રો A4 માપમાં તૈયાર છે.
            તમે <strong>&quot;ડાઉનલોડ તમામ A4 PDF&quot;</strong> થી એકઠી ફાઇલ મેળવી શકો છો અથવા <strong>&quot;પ્રિન્ટ તમામ પત્રો&quot;</strong> થી સીધી પ્રિન્ટ કરી શકો છો.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>પત્ર {currentPageIndex + 1} / {notices.length}</span>
          <span>Shortcuts: ← → / Ctrl+P / Esc</span>
        </div>
      </div>
    </div>
  );
}
