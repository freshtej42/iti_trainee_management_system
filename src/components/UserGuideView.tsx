import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  CheckCircle2,
  Layers,
  Users,
  CalendarCheck2,
  FileText,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Loader2,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
  Eye,
  HelpCircle,
  X,
} from 'lucide-react';
import { exportBatchElementsToPdf, printCleanDocument } from '../utils/pdfExport';
import GujaratiInfographicPage, { PUBLISHED_LIVE_URL } from './GujaratiInfographicPage';

interface UserGuideViewProps {
  isModal?: boolean;
  onClose?: () => void;
  initialMode?: 'infographic-gu' | 'full-manual';
}

interface GuideSectionMeta {
  id: string;
  pageNumber: number;
  titleEn: string;
  titleGu: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GUIDE_SECTIONS: GuideSectionMeta[] = [
  {
    id: 'page-1',
    pageNumber: 1,
    titleEn: 'Cover, Executive Overview & System Architecture',
    titleGu: 'મુખપૃષ્ઠ, પોર્ટલ પરિચય અને સિસ્ટમ આર્કિટેક્ચર ડાયાગ્રામ',
    badge: 'Page 1',
    icon: BookOpen,
  },
  {
    id: 'page-2',
    pageNumber: 2,
    titleEn: '1. Registration, Login, Demo Mode & 1-Year Validity',
    titleGu: '૧. રજીસ્ટ્રેશન, લોગિન, ડેમો મોડ અને ૧-વર્ષની માન્યતા',
    badge: 'Page 2',
    icon: Lock,
  },
  {
    id: 'page-3',
    pageNumber: 3,
    titleEn: '2. Academic Hierarchy (Trade, Batch 84–95 & Unit)',
    titleGu: '૨. શૈક્ષણિક માળખું (ટ્રેડ, બેચ ૮૪–૯૫ અને યુનિટ A/B/C)',
    badge: 'Page 3',
    icon: Layers,
  },
  {
    id: 'page-4',
    pageNumber: 4,
    titleEn: '3. Trainee Directory & Bulk Excel/CSV Import',
    titleGu: '૩. તાલીમાર્થી યાદી અને બલ્ક એક્સેલ (Excel/CSV) ઈમ્પોર્ટ',
    badge: 'Page 4',
    icon: Users,
  },
  {
    id: 'page-5',
    pageNumber: 5,
    titleEn: '4. Monthly & Progressive Attendance Engine (80% Rule)',
    titleGu: '૪. માસિક અને પ્રોગ્રેસિવ હાજરી ગણતરી (૮૦% NCVT નિયમ)',
    badge: 'Page 5',
    icon: CalendarCheck2,
  },
  {
    id: 'page-6',
    pageNumber: 6,
    titleEn: '5. Template Studio, Letterhead & Merge Tags',
    titleGu: '૫. ટેમ્પલેટ સ્ટુડિયો, લેટરહેડ અને ડાયનેમિક મર્જ ટૅગ્સ',
    badge: 'Page 6',
    icon: FileText,
  },
  {
    id: 'page-7',
    pageNumber: 7,
    titleEn: '6. Notice Generator, Principal Report & Dispatch Log',
    titleGu: '૬. નોટિસ જનરેટર, આચાર્ય અહેવાલ અને જાવક/આવક રજીસ્ટર',
    badge: 'Page 7',
    icon: SendHorizontal,
  },
  {
    id: 'page-8',
    pageNumber: 8,
    titleEn: '7. Super Admin Console, Bilingual IME & Best Practices',
    titleGu: '૭. સુપર એડમિન કંટ્રોલ પેનલ, ગુજરાતી ટાઈપિંગ અને માર્ગદર્શન',
    badge: 'Page 8',
    icon: ShieldCheck,
  },
];

export default function UserGuideView({
  isModal = false,
  onClose,
  initialMode = 'infographic-gu',
}: UserGuideViewProps) {
  const [guideMode, setGuideMode] = useState<'infographic-gu' | 'full-manual'>(initialMode);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const pagesContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadFullPdf = async () => {
    if (!pagesContainerRef.current) return;
    const pageNodes = Array.from(
      pagesContainerRef.current.querySelectorAll('.guide-a4-page')
    ) as HTMLElement[];
    if (pageNodes.length === 0) return;

    try {
      setIsExportingPdf(true);
      setExportProgress(`Preparing ${pageNodes.length}-page Professional User Guide PDF...`);

      await exportBatchElementsToPdf(pageNodes, {
        filename: 'ITI_Attendance_Portal_Professional_User_Guide.pdf',
        orientation: 'portrait',
        scale: 2.0,
        onProgress: (msg) => setExportProgress(msg),
        onPageProgress: (curr, total) =>
          setExportProgress(`Rendering High-Resolution A4 Page ${curr} of ${total}...`),
      });
    } catch (err) {
      console.error('Failed to export User Guide PDF:', err);
    } finally {
      setIsExportingPdf(false);
      setExportProgress('');
    }
  };

  const handlePrintGuide = async () => {
    if (!pagesContainerRef.current) return;
    await printCleanDocument(pagesContainerRef.current, {
      title: 'ITI Attendance & Notice Portal - User Guide',
      orientation: 'portrait',
    });
  };

  const scrollToPage = (id: string) => {
    setSelectedSectionId(id);
    if (id === 'ALL') {
      const topEl = document.getElementById('guide-page-1');
      topEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const target = document.getElementById(`guide-${id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Top Action Header Bar with Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#346739] text-[#f2edc2] flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                પોર્ટલ માર્ગદર્શિકા અને ૧-પેજ ગુજરાતી ઈન્ફોગ્રાફિક (User Guide & Infographic)
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              લાઈવ વેબ એપ્લિકેશન લિંક ({PUBLISHED_LIVE_URL}) સાથે ૧-પેજ ગુજરાતી સંક્ષિપ્ત ઈન્ફોગ્રાફિક પોસ્ટર અથવા ૮-પેજની સંપૂર્ણ વિગતવાર માર્ગદર્શિકા PDF ડાઉનલોડ કરો.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Segmented Mode Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setGuideMode('infographic-gu')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                guideMode === 'infographic-gu'
                  ? 'bg-[#346739] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              ૧-પેજ ગુજરાતી ઈન્ફોગ્રાફિક (Short Guide)
            </button>
            <button
              type="button"
              onClick={() => setGuideMode('full-manual')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                guideMode === 'full-manual'
                  ? 'bg-[#346739] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              ૮-પેજ સંપૂર્ણ માર્ગદર્શિકા (8-Page Manual)
            </button>
          </div>

          {guideMode === 'full-manual' && (
            <>
              <button
                onClick={handleDownloadFullPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#346739] hover:bg-[#264e2b] disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{exportProgress || 'Generating A4 PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download 8-Page PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrintGuide}
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Manual</span>
              </button>
            </>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
              title="Close User Guide"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Render 1-Page Gujarati Infographic when selected */}
      {guideMode === 'infographic-gu' && <GujaratiInfographicPage showToolbar={true} />}

      {/* Progress Banner when exporting 8-page manual */}
      {guideMode === 'full-manual' && isExportingPdf && (
        <div className="bg-emerald-950 text-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-emerald-800 shadow-md print:hidden">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-amber-300 shrink-0" />
            <span>{exportProgress}</span>
          </div>
          <span className="text-[11px] text-emerald-300 font-mono">
            A4 Portrait • 300 DPI Crisp Vector Text & Diagrams
          </span>
        </div>
      )}

      {/* Main Layout: Left Section Jump Sidebar + Right Multi-Page A4 Preview */}
      {guideMode === 'full-manual' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Table of Contents Navigation */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs lg:sticky lg:top-20 print:hidden">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-2 pb-2.5 border-b border-slate-100 flex items-center justify-between">
            <span>Sections & Pages</span>
            <span className="text-[11px] font-mono text-[#346739]">8 Pages</span>
          </div>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => scrollToPage('ALL')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                selectedSectionId === 'ALL'
                  ? 'bg-[#346739] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Show All 8 A4 Pages</span>
              <span className="text-[10px] opacity-80">1–8</span>
            </button>

            {GUIDE_SECTIONS.map((sec) => {
              const IconComponent = sec.icon;
              const isActive = selectedSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToPage(sec.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-[#f2edc2]/70 text-[#1b381e] font-bold border border-[#9fcb98]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 text-[#346739] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="leading-snug truncate">{sec.titleEn}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{sec.titleGu}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">P.{sec.pageNumber}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 px-2 space-y-2">
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Every page on the right is formatted to exact <strong>ISO A4 Portrait (210mm × 297mm)</strong> dimensions with embedded diagrams and checklists.
            </div>
            <button
              onClick={handleDownloadFullPdf}
              disabled={isExportingPdf}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PDF Manual</span>
            </button>
          </div>
        </div>

        {/* Right Column: Printable A4 Document Stream */}
        <div className="lg:col-span-9 overflow-x-auto pb-8">
          <div
            ref={pagesContainerRef}
            className="flex flex-col items-center gap-8 print:gap-0"
          >
            {/* =====================================================================
                PAGE 1: COVER PAGE, SYSTEM OVERVIEW & ARCHITECTURE DIAGRAM
               ===================================================================== */}
            <div
              id="guide-page-1"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px', pageBreakAfter: 'always' }}
            >
              <div>
                {/* Top Official Header Banner */}
                <div className="border-b-2 border-[#346739] pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#346739] text-[#f2edc2] flex flex-col items-center justify-center font-black text-base tracking-wider border-2 border-[#1b381e]">
                      <span>ITI</span>
                      <span className="text-[9px] font-semibold uppercase tracking-normal">Gujarat</span>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-[#346739]">
                        Industrial Training Institute (ITI) Digital Toolkit • NCVT / GCVT Norms
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                        ITI Trainee Attendance & Notice Portal
                      </h1>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        ઔદ્યોગિક તાલીમ સંસ્થા (ITI) તાલીમાર્થી હાજરી, પ્રોગ્રેસિવ ગણતરી અને વાલી નોટિસ પોર્ટલ — સંપૂર્ણ વપરાશકર્તા માર્ગદર્શિકા
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-[#346739] uppercase">USER GUIDE PDF</div>
                    <div className="text-[11px] text-slate-500 font-mono">Edition: 2026–2027</div>
                    <div className="text-[11px] text-slate-500 font-mono">Pages: 08 (A4)</div>
                  </div>
                </div>

                {/* Executive Purpose Block */}
                <div className="mt-5 bg-[#f7f9f6] border border-[#9fcb98] rounded-xl p-4">
                  <h2 className="text-sm font-extrabold text-[#1b381e] uppercase tracking-wide">
                    Executive Summary & Purpose of the Application (પોર્ટલનો મુખ્ય હેતુ)
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
                    The <strong>ITI Trainee Attendance & Notice Management Portal</strong> is a specialized multi-tenant web application engineered for Supervisor Instructors, Trade Instructors, and Principals across Industrial Training Institutes (ITIs). It automates monthly and session-wide progressive attendance calculation under the mandatory <strong>80% NCVT/GCVT examination eligibility rule</strong>, generates Gujarati/Hindi/English parent warning notices with dynamic merge tags, produces Principal Monthly Reports, and maintains an audited Inward/Outward Dispatch Register.
                  </p>
                </div>

                {/* DIAGRAM 1: END-TO-END SYSTEM ARCHITECTURE & WORKFLOW */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Diagram 1.1 — End-to-End Application Workflow Architecture (સિસ્ટમ વર્કફ્લો ડાયાગ્રામ)
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">7-Stage Operational Pipeline</span>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/70">
                    {/* Row 1 of Architecture Flowchart */}
                    <div className="grid grid-cols-4 gap-2.5 items-stretch">
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-white bg-[#346739] px-1.5 py-0.5 rounded">STAGE 1</span>
                          <span className="text-[10px] font-mono text-slate-400">Auth</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5">Instructor Onboarding</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Register ITI, Trade, Batch (84–95) & Unit, or launch instant Demo Mode.
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 rounded-lg p-2.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-white bg-[#346739] px-1.5 py-0.5 rounded">STAGE 2</span>
                          <span className="text-[10px] font-mono text-slate-400">Structure</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5">Academic Hierarchy</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Configure multiple Trades → Batches (84–95) → Units (Unit A, B, C).
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 rounded-lg p-2.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-white bg-[#346739] px-1.5 py-0.5 rounded">STAGE 3</span>
                          <span className="text-[10px] font-mono text-slate-400">Roster</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5">Trainee Directory</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Add students or bulk import via Excel/CSV with Gujarati transliteration.
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 rounded-lg p-2.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-white bg-[#346739] px-1.5 py-0.5 rounded">STAGE 4</span>
                          <span className="text-[10px] font-mono text-slate-400">Engine</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5">Monthly & Progressive</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Filter by Trade/Batch/Unit, mark days, auto-evaluate 80% cumulative rule.
                        </div>
                      </div>
                    </div>

                    {/* Connector Arrow Row */}
                    <div className="flex items-center justify-center my-2.5 text-[11px] font-bold text-[#346739]">
                      <span>▼ Automated Data Flow from Attendance Engine to Official Documentation & Dispatch ▼</span>
                    </div>

                    {/* Row 2 of Architecture Flowchart */}
                    <div className="grid grid-cols-3 gap-3 items-stretch">
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded">STAGE 5</span>
                          <span className="text-[10px] font-mono text-slate-400">Templates</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5">Template Studio & Letterhead</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Customize ITI Header, Gujarati/Hindi/English notice templates & 25+ dynamic merge tags.
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded">STAGE 6</span>
                          <span className="text-[10px] font-mono text-slate-400">A4 Export</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5">Single / Batch Notice & Report</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Generate individual notices, multi-page batch PDFs (69/1, 69/2), or Principal tabular reports.
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded">STAGE 7</span>
                          <span className="text-[10px] font-mono text-slate-400">Audit Log</span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1.5">Inward / Outward & WhatsApp</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Log Outward numbers, send 1-click Parent WhatsApp advisories, and record parent replies.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master Section-by-Section Table of Contents */}
                <div className="mt-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                    Master Table of Contents (વિભાગવાર અનુક્રમણિકા)
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-3 py-2 w-16 font-bold">Page</th>
                        <th className="border border-slate-300 px-3 py-2 font-bold">Section Title & Core Module</th>
                        <th className="border border-slate-300 px-3 py-2 font-bold">Key Features & Diagrams Covered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 1</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">Executive Overview & Architecture</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">System Purpose, 7-Stage Pipeline Diagram, Role Matrix</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 2</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">1. Authentication, Demo & Validity</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">Registration (Batches 84–95), Dual Login, Sandbox Demo, Fee & 1-Yr Validity Diagram</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 3</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">2. Academic Hierarchy Manager</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">3-Tier Hierarchy Diagram (Trade → Batch → Unit), Multi-Class Isolation</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 4</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">3. Trainee Directory & Excel Import</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">Student Fields, Trade/Batch/Unit Filters, Smart Excel Import Pipeline Diagram</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 5</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">4. Monthly & Progressive Attendance</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">Trade/Batch/Unit Attendance Filters, Progressive Formula & 80% Decision Diagram</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 6</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">5. Template Studio & Merge Tags</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">Custom Letterhead, Pre-printed Mode, Complete Merge Tags Reference Table</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 7</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">6. Notice Generator & Dispatch Log</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">Single/Batch A4 PDF Export, Principal Table Report, Inward/Outward & WhatsApp Flow</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-[#346739]">Page 8</td>
                        <td className="border border-slate-300 px-3 py-2 font-bold">7. Super Admin & Best Practices</td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600">UTR Payment Approval, Dynamic UPI Settings, Phonetic Gujarati Typing & Print Tips</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* User Roles Summary Box */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="border border-slate-200 rounded-xl p-3 bg-white">
                    <div className="text-xs font-extrabold text-[#346739]">1. Supervisor / Trade Instructor</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Manages assigned Trades, Batches (84–95), Units (A/B/C), marks monthly attendance, and issues parent notices.
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-white">
                    <div className="text-xs font-extrabold text-amber-800">2. Demo / Visitor Account</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Instant 1-click evaluation mode pre-loaded with sample trades, multi-month attendance, notices, and dispatch logs.
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-white">
                    <div className="text-xs font-extrabold text-slate-900">3. State Super Admin</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Verifies fee UTRs, approves instructor accounts for 1-year validity, configures UPI QR, and audits records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>ITI Trainee Attendance & Notice Management Portal — Operational User Guide</span>
                <span className="font-mono font-bold text-slate-700">Page 1 of 8</span>
              </div>
            </div>

            {/* =====================================================================
                PAGE 2: SECTION 1 — AUTHENTICATION, DEMO MODE & 1-YEAR VALIDITY
               ===================================================================== */}
            <div
              id="guide-page-2"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px', pageBreakAfter: 'always' }}
            >
              <div>
                {/* Section Header */}
                <div className="border-b-2 border-[#346739] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#346739]">
                      SECTION 01 • AUTHENTICATION, ONBOARDING & LICENSING
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      1. Registration, Dual Login, Demo Mode & 1-Year Validity
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#f2edc2] text-[#1b381e] px-2.5 py-1 rounded-md border border-[#9fcb98]">
                    Page 02
                  </span>
                </div>

                {/* 1.1 New Instructor Registration */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    1.1 New Instructor Registration Workflow (નવા ઇન્સ્ટ્રક્ટરની નોંધણી)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Instructors can create a dedicated, isolated workspace for their ITI classroom by selecting the <strong>New Registration (નવી નોંધણી)</strong> tab on the authentication screen.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      <strong>Automatic Bilingual Name Transliteration:</strong> Typing your Full Name in English (e.g., <code>Rameshbhai Patel</code>) automatically transliterates it into Gujarati script (<code>રમેશભાઈ પટેલ</code>) in real time for official letter sign-offs.
                    </li>
                    <li>
                      <strong>Standardized ITI & Designation Selection:</strong> Choose from the pre-loaded list of Government & Grant-in-Aid Gujarat ITIs (or enter a custom institute name) and select your designation (<em>Supervisor Instructor</em>, <em>Group Instructor</em>, <em>Trade Instructor</em>, or <em>Principal</em>).
                    </li>
                    <li>
                      <strong>Trade, Batch (84 to 95) & Unit Assignment:</strong> Select your primary NCVT/GCVT Trade (e.g., Electrician, Fitter, COPA), select your <strong>Batch Number (`84, 85, 86 ... 95`)</strong>, and choose your primary <strong>Unit (`Unit A, Unit B, Unit C, Unit I, Unit II`)</strong>.
                    </li>
                    <li>
                      <strong>Security & Uniqueness Policy:</strong> The portal enforces unique Email ID and 10-digit Mobile Number validation and requires a strong password (minimum 8 characters with uppercase, lowercase, number, and special symbol).
                    </li>
                  </ul>
                </div>

                {/* 1.2 Dual Login & Password Recovery */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    1.2 Versatile Dual Login (ઈમેલ અથવા મોબાઈલ નંબરથી લોગિન)
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <div className="text-xs font-bold text-slate-900">Option A: Login via 10-Digit Mobile Number</div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Enter your registered 10-digit mobile number (e.g., <code>9825012345</code>) and password for rapid daily access from mobile or desktop.
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <div className="text-xs font-bold text-slate-900">Option B: Login via Official Email ID</div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Enter your registered email address and password. Includes a built-in <strong>Forgot Password</strong> verification modal to reset credentials.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1.3 Interactive Demo Account */}
                <div className="mt-4 bg-amber-50/70 border border-amber-300 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-amber-950">
                      1.3 Full-Featured Interactive Demo Account (ડેમો એકાઉન્ટની વિશેષતાઓ)
                    </h3>
                    <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                      Session Sandbox
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    Prospective instructors can click <strong>"ડેમો એકાઉન્ટ જુઓ (Try Interactive Demo)"</strong> on the login screen to experience every feature of the web app before registering or paying:
                  </p>
                  <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-amber-950 list-disc pl-5">
                    <li><strong>Pre-loaded Multi-Trade Roster:</strong> 12 realistic trainees across Electrician, Fitter & COPA (Batches 84 & 85, Units A & B).</li>
                    <li><strong>Multi-Month Attendance Dataset:</strong> Pre-entered August, September & October 2026 records showing Regular, Progressive Safe, and Red-Flagged cases.</li>
                    <li><strong>Full Write Capabilities in Session:</strong> Add/edit trainees, mark attendance, edit templates, and export real A4 PDFs.</li>
                    <li><strong>Automatic Clean Reset on Reload:</strong> All changes remain isolated in memory and reset cleanly when the browser reloads.</li>
                  </ul>
                </div>

                {/* DIAGRAM 2: ACCOUNT APPROVAL & 1-YEAR VALIDITY LIFECYCLE */}
                <div className="mt-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                    Diagram 1.2 — Account Verification, UPI Payment & 1-Year Validity Lifecycle
                  </h3>
                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50">
                    <div className="grid grid-cols-5 gap-2 items-center text-center">
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-[#346739]">STEP 1</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Submit Form</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Account created in Pending state</div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-[#346739]">STEP 2</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Scan UPI QR</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Pay nominal annual fee (e.g. ₹9)</div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-[#346739]">STEP 3</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Upload UTR</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Enter 12-digit UTR & screenshot</div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-[#346739]">STEP 4</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Admin Approval</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Super Admin verifies & activates</div>
                      </div>
                      <div className="bg-[#f2edc2]/60 border border-[#346739] rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-[#1b381e]">STEP 5</div>
                        <div className="text-xs font-bold text-[#1b381e] mt-1">365-Day Access</div>
                        <div className="text-[10px] text-slate-700 mt-0.5">Valid for 1 full year from approval</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Table: Account States */}
                <div className="mt-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Account Status & Access Rights Matrix
                  </h4>
                  <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Account Status</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Cloud Persistence</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Validity Duration</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">System Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-amber-800">Demo Mode (Guest)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Session Memory Only</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Unlimited Preview</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">All features unlocked; resets on browser refresh</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-blue-800">Pending Approval</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Profile Saved</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Awaiting Verification</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Displays UPI QR payment & UTR submission screen</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-emerald-800">Approved Instructor</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Full Cloud Firestore</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">1 Year from Approval Date</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Full multi-device sync for assigned trades & batches</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-rose-800">Expired (&gt; 1 Year)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Data Safely Preserved</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Requires Annual Renewal</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Prompts for renewal payment without losing historical data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Section 1: Authentication, Demo Mode & Account Validity</span>
                <span className="font-mono font-bold text-slate-700">Page 2 of 8</span>
              </div>
            </div>

            {/* =====================================================================
                PAGE 3: SECTION 2 — ACADEMIC HIERARCHY MANAGER
               ===================================================================== */}
            <div
              id="guide-page-3"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px', pageBreakAfter: 'always' }}
            >
              <div>
                {/* Section Header */}
                <div className="border-b-2 border-[#346739] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#346739]">
                      SECTION 02 • CLASSROOM STRUCTURE & MULTI-CHARGE MANAGEMENT
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      2. Academic Hierarchy: Trades, Batches (84–95) & Units
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#f2edc2] text-[#1b381e] px-2.5 py-1 rounded-md border border-[#9fcb98]">
                    Page 03
                  </span>
                </div>

                {/* Overview */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    2.1 Why the 3-Tier Academic Hierarchy Matters (શૈક્ષણિક માળખાની જરૂરિયાત)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    In Government and Grant-in-Aid ITIs, a single Supervisor Instructor or Trade Instructor often holds charge of multiple trades (e.g., <em>Electrician</em> and <em>Wireman</em>), multiple admission batches (e.g., senior <strong>Batch 84</strong> and junior <strong>Batch 85</strong>), or multiple shift units (<strong>Unit A</strong>, <strong>Unit B</strong>, <strong>Unit C</strong>). The <strong>Academic Hierarchy (`શૈક્ષણિક માળખું`)</strong> tab allows you to model your exact institutional structure.
                  </p>
                </div>

                {/* DIAGRAM 3: 3-TIER HIERARCHY TREE DIAGRAM */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                    Diagram 2.1 — Three-Tier Classroom Hierarchy Tree (ટ્રેડ → બેચ → યુનિટ માળખું)
                  </h3>
                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50">
                    {/* Root Node */}
                    <div className="flex justify-center">
                      <div className="bg-[#346739] text-white px-5 py-2 rounded-lg text-xs font-extrabold shadow-xs">
                        INSTRUCTOR WORKSPACE (સુપરવાઈઝર ઇન્સ્ટ્રક્ટર એકાઉન્ટ)
                      </div>
                    </div>

                    <div className="text-center text-xs font-bold text-slate-400 my-1.5">│</div>

                    {/* Level 1: Trades */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Trade Branch 1 */}
                      <div className="border border-[#9fcb98] bg-white rounded-xl p-3">
                        <div className="text-xs font-black text-[#1b381e] bg-[#f2edc2] px-2.5 py-1 rounded border border-[#9fcb98] flex items-center justify-between">
                          <span>TIER 1: TRADE — Electrician (ઇલેક્ટ્રિશિયન)</span>
                          <span className="font-mono text-[10px]">2 Years</span>
                        </div>

                        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <div className="text-[11px] font-bold text-slate-800">TIER 2: Batch 84</div>
                            <div className="mt-1.5 space-y-1">
                              <div className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-semibold text-[#346739]">
                                • TIER 3: Unit A (20 Trainees)
                              </div>
                              <div className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-semibold text-[#346739]">
                                • TIER 3: Unit B (20 Trainees)
                              </div>
                            </div>
                          </div>

                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <div className="text-[11px] font-bold text-slate-800">TIER 2: Batch 85</div>
                            <div className="mt-1.5 space-y-1">
                              <div className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-semibold text-[#346739]">
                                • TIER 3: Unit A (22 Trainees)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trade Branch 2 */}
                      <div className="border border-slate-300 bg-white rounded-xl p-3">
                        <div className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-300 flex items-center justify-between">
                          <span>TIER 1: TRADE — Fitter (ફિટર - વધારાનો ચાર્જ)</span>
                          <span className="font-mono text-[10px]">2 Years</span>
                        </div>

                        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <div className="text-[11px] font-bold text-slate-800">TIER 2: Batch 84</div>
                            <div className="mt-1.5 space-y-1">
                              <div className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-semibold text-slate-700">
                                • TIER 3: Unit A (18 Trainees)
                              </div>
                            </div>
                          </div>

                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <div className="text-[11px] font-bold text-slate-800">TIER 2: Batch 85</div>
                            <div className="mt-1.5 space-y-1">
                              <div className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded font-semibold text-slate-700">
                                • TIER 3: Unit B (19 Trainees)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2.2 Step-by-Step Operations */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    2.2 Step-by-Step Hierarchy Operations (માળખામાં ફેરફાર કરવાની રીત)
                  </h3>
                  <ol className="mt-2 space-y-2 text-xs text-slate-700 list-decimal pl-5">
                    <li>
                      <strong>Adding a New Trade (`+ નવો ટ્રેડ ઉમેરો`):</strong> Open the <em>Academic Hierarchy</em> tab, select any NCVT/GCVT trade from the dropdown (or enter a custom trade name), and click <strong>Add Trade</strong>.
                    </li>
                    <li>
                      <strong>Adding Batches (84 to 95) under a Trade (`+ બેચ ઉમેરો`):</strong> Inside any Trade card, select a Batch number from <code>84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95</code> and click <strong>Add Batch</strong>.
                    </li>
                    <li>
                      <strong>Adding Units under a Batch (`+ યુનિટ ઉમેરો`):</strong> Inside any Batch block, add <code>Unit A</code>, <code>Unit B</code>, <code>Unit C</code>, <code>Unit I</code>, or <code>Unit II</code>. Each Unit displays a live badge of how many trainees are currently enrolled in that unit.
                    </li>
                    <li>
                      <strong>Assigning Unassigned Trainees to a Unit:</strong> Click the <strong>Assign Trainees</strong> button on any Unit card to quickly move or assign students into that specific Trade + Batch + Unit combination.
                    </li>
                    <li>
                      <strong>One-Click Jump to Roster:</strong> Clicking <strong>View Trainees</strong> on any Unit card automatically switches to the <em>Trainee Directory</em> pre-filtered to that exact Trade, Batch, and Unit.
                    </li>
                  </ol>
                </div>

                {/* 2.3 Header Quick-Switcher */}
                <div className="mt-4 bg-[#f7f9f6] border border-[#9fcb98] rounded-xl p-3.5">
                  <h3 className="text-xs font-extrabold text-[#1b381e] uppercase tracking-wide">
                    2.3 Header Unit & Batch Quick-Manager Modal (હેડરમાંથી ઝડપી બેચ/યુનિટ સેટિંગ)
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    In the top navigation bar, clicking the <strong>Unit & Batch badge (e.g., <code>Unit A (84)</code>)</strong> opens the <strong>Batch & Unit Quick Manager Modal</strong>. From here, you can switch your active default batch/unit or add new batches and units without leaving your current screen.
                  </p>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Section 2: Academic Hierarchy Manager (Trades, Batches 84–95 & Units)</span>
                <span className="font-mono font-bold text-slate-700">Page 3 of 8</span>
              </div>
            </div>

            {/* =====================================================================
                PAGE 4: SECTION 3 — TRAINEE DIRECTORY & EXCEL IMPORT
               ===================================================================== */}
            <div
              id="guide-page-4"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px', pageBreakAfter: 'always' }}
            >
              <div>
                {/* Section Header */}
                <div className="border-b-2 border-[#346739] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#346739]">
                      SECTION 03 • STUDENT ROSTER & BULK SPREADSHEET ONBOARDING
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      3. Trainee Directory & Bulk Excel / CSV Import
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#f2edc2] text-[#1b381e] px-2.5 py-1 rounded-md border border-[#9fcb98]">
                    Page 04
                  </span>
                </div>

                {/* 3.1 Overview & Filtering */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    3.1 Trainee Directory & Cascading Cohort Filters (તાલીમાર્થી યાદી અને ફિલ્ટર)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The <strong>Trainee Directory (`તાલીમાર્થી યાદી`)</strong> maintains the master profile of every student assigned to the instructor. At the top of the directory, three synchronized dropdown filters let you isolate students immediately:
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2.5">
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <div className="text-xs font-bold text-[#346739]">1. Trade Filter (ટ્રેડ)</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Filter by All Trades or select a specific trade (e.g., Electrician, Fitter, COPA).
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <div className="text-xs font-bold text-[#346739]">2. Batch Filter (બેચ)</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Dynamically lists batches belonging to the selected trade (e.g., Batch 84, Batch 85).
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <div className="text-xs font-bold text-[#346739]">3. Unit Filter (યુનિટ)</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Isolates students in Unit A, Unit B, or Unit C within the chosen trade and batch.
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIAGRAM 4: EXCEL IMPORT PIPELINE */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                    Diagram 3.1 — Smart Excel / CSV Import & Auto-Transliteration Pipeline
                  </h3>
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50">
                    <div className="grid grid-cols-4 gap-2.5 text-center">
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">STEP 1</div>
                        <div className="text-xs font-bold text-slate-900 mt-1.5">Download Sample</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Click <em>Sample Excel</em> to get the pre-formatted column headers.
                        </div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">STEP 2</div>
                        <div className="text-xs font-bold text-slate-900 mt-1.5">Select Target Cohort</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Choose target Trade, Batch (84–95) & Unit in the Import Modal.
                        </div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">STEP 3</div>
                        <div className="text-xs font-bold text-slate-900 mt-1.5">Smart Parsing & IME</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          English names & addresses auto-convert to Gujarati script if blank.
                        </div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">STEP 4</div>
                        <div className="text-xs font-bold text-slate-900 mt-1.5">Verify & Save</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Preview imported rows and commit batch to Cloud Firestore.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.2 Complete Trainee Fields Reference Table */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    3.2 Trainee Data Fields & Postal Address Specification
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Field Name</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Description & Format</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Used In Notice Merge Tag</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Roll No. & SR No.</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Classroom Roll Number & NCVT/GCVT Registration No.</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Roll_No}} / {{SR_No}}`}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Trainee Name (EN & GU)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Full student name in English & Gujarati script</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Full_Name}} / {{Trainee_Name}}`}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Father / Guardian Name</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Parent name addressed at the top of official notices</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Parent_Name}} / {{Father_Name}}`}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Trade, Batch & Unit</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Assigned Trade, Batch (84–95) & Unit (Unit A/B/C)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Trade_Name}} / {{Batch_Year}}`}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Parent Mobile (WhatsApp)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">10-digit parent phone number for 1-click WhatsApp notice</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Parent_Mobile}}`}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Postal Address, Taluka, PIN</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Complete residential postal block for Registered Post (RPAD)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Address}} / {{Taluka}} / {{Pin_Code}}`}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3.3 Individual & Bulk Roster Management */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    3.3 Managing Individual & Bulk Trainee Records (તાલીમાર્થી વિગતોમાં સુધારા-વધારા)
                  </h3>
                  <ul className="mt-1.5 space-y-1.5 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      <strong>Add Single Trainee (`+ નવો તાલીમાર્થી ઉમેરો`):</strong> Opens a structured form with built-in phonetic Gujarati typing support. When you type in English, pressing <code>Space</code> or tabbing converts names and addresses into Gujarati automatically.
                    </li>
                    <li>
                      <strong>Edit Trainee Profile (`ફેરફાર કરો`):</strong> Click the Edit icon on any student row/card to update their mobile number, parent WhatsApp number, postal address, or move them to another Batch/Unit.
                    </li>
                    <li>
                      <strong>Export Roster to Excel/CSV:</strong> Download your filtered Trade/Batch/Unit student list as a clean spreadsheet at any time for institutional backup.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Section 3: Trainee Directory & Bulk Excel/CSV Import</span>
                <span className="font-mono font-bold text-slate-700">Page 4 of 8</span>
              </div>
            </div>

            {/* =====================================================================
                PAGE 5: SECTION 4 — MONTHLY & PROGRESSIVE ATTENDANCE ENGINE
               ===================================================================== */}
            <div
              id="guide-page-5"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px', pageBreakAfter: 'always' }}
            >
              <div>
                {/* Section Header */}
                <div className="border-b-2 border-[#346739] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#346739]">
                      SECTION 04 • CORE ATTENDANCE ENGINE & NCVT 80% COMPLIANCE
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      4. Monthly Attendance & Progressive Calculation Engine
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#f2edc2] text-[#1b381e] px-2.5 py-1 rounded-md border border-[#9fcb98]">
                    Page 05
                  </span>
                </div>

                {/* 4.1 Multi-Filter Cohort Selection */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    4.1 Filtering by Trade, Batch & Unit on Monthly Attendance Page (ટ્રેડ, બેચ અને યુનિટ ફિલ્ટર)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The <strong>Monthly Attendance (`માસિક હાજરી પત્રક`)</strong> page features a dedicated top filter bar containing <strong>Trade (`ટ્રેડ`)</strong>, <strong>Batch (`બેચ 84–95`)</strong>, <strong>Unit (`યુનિટ A/B/C`)</strong>, <strong>Year (`વર્ષ`)</strong>, and <strong>Month (`માસ`)</strong> selectors.
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      When an instructor selects a specific <strong>Trade + Batch + Unit</strong> on the page and clicks <strong>Mark Attendance (`હાજરી ભરો`)</strong>, the modal automatically opens pre-filtered to that exact cohort.
                    </li>
                    <li>
                      Setting <strong>Batch Working Days</strong> (e.g., 24 days) or clicking <strong>100% Present for All</strong> inside the modal applies strictly to the students of the selected Trade, Batch, and Unit—never overwriting other batches or units.
                    </li>
                  </ul>
                </div>

                {/* DIAGRAM 5: PROGRESSIVE ATTENDANCE FORMULA & 3-STATE DECISION LOGIC */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                    Diagram 4.1 — Session Progressive Attendance Formula & 80% Decision Logic
                  </h3>
                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-3">
                    {/* Mathematical Formula Box */}
                    <div className="bg-white border border-[#9fcb98] rounded-lg p-3 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#346739]">
                        Cumulative Session Progressive Formula (નોંધાયેલા મહિનાઓ મુજબ સરેરાશ ગણતરી)
                      </div>
                      <div className="text-sm font-black text-slate-900 font-mono mt-1">
                        Progressive % = [ Sum of Present Days (Recorded Months up to Selected Month) ÷ Sum of Working Days (Recorded Months) ] × 100
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        <strong>Important Rule:</strong> Unrecorded future months are <em>never</em> counted as 0%. If only August 2026 is recorded (e.g., 20/24 = 83.3%), Progressive % equals <strong>83.3% (1 Month Average)</strong>.
                      </div>
                    </div>

                    {/* 3 Classification Outcomes */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5">
                        <div className="text-xs font-black text-emerald-900">1. Regular (નિયમિત ≥ 80%)</div>
                        <div className="text-[11px] text-emerald-800 mt-1 leading-snug">
                          <strong>Condition:</strong> Current Month ≥ 80% AND Progressive ≥ 80%.
                          <br />
                          <strong>Action:</strong> Eligible for NCVT/GCVT Exam. No notice needed.
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-2.5">
                        <div className="text-xs font-black text-blue-900">2. Progressive Safe (પ્રોગ્રેસિવ સેફ)</div>
                        <div className="text-[11px] text-blue-800 mt-1 leading-snug">
                          <strong>Condition:</strong> Current Month &lt; 80%, <strong>BUT Cumulative Progressive ≥ 80%</strong>.
                          <br />
                          <strong>Action:</strong> Protected by cumulative session surplus. Notice optional.
                        </div>
                      </div>

                      <div className="bg-rose-50 border border-rose-300 rounded-lg p-2.5">
                        <div className="text-xs font-black text-rose-900">3. Red Flag (&lt; 80% Progressive)</div>
                        <div className="text-[11px] text-rose-800 mt-1 leading-snug">
                          <strong>Condition:</strong> Cumulative Progressive Attendance falls <strong>below 80.0%</strong>.
                          <br />
                          <strong>Action:</strong> Flagged for mandatory Parent Warning Notice.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Numerical Example Table */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    4.2 Practical Calculation Examples Across Months
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Trainee Case</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Aug 2026 (24d)</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Sep 2026 (25d)</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Cumulative Days</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Progressive % & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Case A (Single Month Entered)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono">21 / 24 (87.5%)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 text-slate-400 italic">Not Entered Yet</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono">21 / 24 (1 Month)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-emerald-700">87.5% • Regular (નિયમિત)</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Case B (Low Month, High Prior)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono">23 / 24 (95.8%)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-amber-700">18 / 25 (72.0%)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono">41 / 49 (2 Months)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-blue-700">83.7% • Progressive Safe</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Case C (Critically Low)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-rose-700">15 / 24 (62.5%)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-rose-700">14 / 25 (56.0%)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono">29 / 49 (2 Months)</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold text-rose-700">59.2% • Red Flag (નોટિસ પાત્ર)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4.3 Mark Attendance Modal Features */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    4.3 Inside the "Mark Attendance" Modal & A4 Register Print (`હાજરી ભરો` અને રજીસ્ટર પ્રિન્ટ)
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      <strong>Custom Working Days for Late Admissions:</strong> While the global Batch Working Days slider sets the default for the class, you can adjust an individual student's working days if they were admitted mid-month.
                    </li>
                    <li>
                      <strong>A4 Official Attendance Register Print:</strong> Click <strong>Print Register (`રજીસ્ટર પ્રિન્ટ`)</strong> on the Monthly Attendance bar to generate a formal A4 tabular attendance sheet complete with Trade, Batch, Unit header and Instructor/Principal signature blocks.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Section 4: Monthly Attendance Tracker & Progressive Calculation Engine</span>
                <span className="font-mono font-bold text-slate-700">Page 5 of 8</span>
              </div>
            </div>

            {/* =====================================================================
                PAGE 6: SECTION 5 — TEMPLATE STUDIO & MERGE TAGS
               ===================================================================== */}
            <div
              id="guide-page-6"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px', pageBreakAfter: 'always' }}
            >
              <div>
                {/* Section Header */}
                <div className="border-b-2 border-[#346739] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#346739]">
                      SECTION 05 • OFFICIAL LETTERHEAD & DYNAMIC TEMPLATE STUDIO
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      5. Template Studio, Custom Letterhead & Merge Tags
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#f2edc2] text-[#1b381e] px-2.5 py-1 rounded-md border border-[#9fcb98]">
                    Page 06
                  </span>
                </div>

                {/* 5.1 Official Letterhead Customization */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    5.1 Customizing Your Official ITI Letterhead (સંસ્થાનું સત્તાવાર લેટરહેડ સેટિંગ)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    In the <strong>Template Studio (`ટેમ્પલેટ સ્ટુડિયો`)</strong> tab, instructors can customize both the institutional letterhead and the body of every official notice:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      <strong>Editable Header Fields:</strong> Customize the Department Subtitle (e.g., <em>કૌશલ્ય વિકાસ અને વ્યાવસાયિક તાલીમ વિભાગ</em>), ITI Name, Full Institute Postal Address, Email ID, and Landline/Phone Number.
                    </li>
                    <li>
                      <strong>Letterhead Toggle (`લેટરહેડ સાથે` vs `પ્રી-પ્રિન્ટેડ પેપર`):</strong> Toggle <em>Show Letterhead</em> ON when printing on plain white A4 paper, or turn it OFF when printing onto pre-printed official ITI stationery.
                    </li>
                  </ul>
                </div>

                {/* 5.2 Complete Merge Tags Reference Table */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    5.2 Complete Dynamic Merge Tags Reference Table (ડાયનેમિક મર્જ ટૅગ્સ યાદી)
                  </h3>
                  <p className="text-[11px] text-slate-600 mb-2">
                    Click any Merge Tag chip in the Template Studio toolbar to insert it at the cursor position. During notice generation, each tag is automatically replaced with live trainee and attendance data:
                  </p>
                  <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Category</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Merge Tag Syntax</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Replaced Live Output Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Trainee Identity</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Full_Name}}, {{Roll_No}}, {{SR_No}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">પટેલ આરવ રાકેશભાઈ, Roll No: 101</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Parent & Postal Block</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Parent_Name}}, {{Address}}, {{Taluka}}, {{District}}, {{Pin_Code}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">શ્રી રાકેશભાઈ પટેલ, સેક્ટર-૨૧, ગાંધીનગર - 382021</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Trade & Cohort</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Trade_Name}}, {{Batch_Year}}, {{Unit_Name}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">ઇલેક્ટ્રિશિયન, Batch 84, Unit A</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Monthly Attendance</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Month_Year}}, {{Total_Working_Days}}, {{Present_Days}}, {{Absent_Days}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">August 2026, કુલ દિવસો: 24, હાજર: 14, ગેરહાજર: 10</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Percentages</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Attendance_Percentage}}, {{Progressive_Percentage}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">માસિક: 58.33%, પ્રોગ્રેસિવ સરેરાશ: 64.20%</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Dispatch Metadata</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Outward_No}}, {{Notice_Date}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">ITI/ATT/2026/69/1, તા. 20/10/2026</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Sign-Off & Institute</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Instructor_Name}}, {{Designation}}, {{ITI_Name}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">સુપરવાઈઝર ઇન્સ્ટ્રક્ટર, સરકારી ઔ.તા.સં. ગાંધીનગર</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Principal Table</td>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[#346739]">{`{{Students_Table}}`}</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Auto-generates bordered table of all &lt;80% trainees</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5.3 Built-in Official Templates */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="text-xs font-extrabold text-[#346739]">1. First Warning Notice</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Advises parents of monthly/progressive attendance shortfall (&lt;80%) and requests an in-person visit within 3 days.
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="text-xs font-extrabold text-rose-800">2. Final Show-Cause Notice</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Strict notice citing NCVT exam debarment & stipend stoppage rules for chronic absenteeism.
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="text-xs font-extrabold text-slate-900">3. Principal Summary Report</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Consolidated monthly report submitted by the Supervisor Instructor to the Principal with <code>{`{{Students_Table}}`}</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Section 5: Template Studio, Custom Letterhead & Dynamic Merge Tags</span>
                <span className="font-mono font-bold text-slate-700">Page 6 of 8</span>
              </div>
            </div>

            {/* =====================================================================
                PAGE 7: SECTION 6 — NOTICE GENERATOR, PRINCIPAL REPORT & DISPATCH
               ===================================================================== */}
            <div
              id="guide-page-7"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px', pageBreakAfter: 'always' }}
            >
              <div>
                {/* Section Header */}
                <div className="border-b-2 border-[#346739] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#346739]">
                      SECTION 06 • A4 NOTICE GENERATION, BATCH PRINT & DISPATCH REGISTER
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      6. Notice Generator, Principal Report & Dispatch Register
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#f2edc2] text-[#1b381e] px-2.5 py-1 rounded-md border border-[#9fcb98]">
                    Page 07
                  </span>
                </div>

                {/* 6.1 Report Generator (Single Notice & Principal Report) */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    6.1 Report & Notice Generator (`નોટિસ જનરેટર અને આચાર્ય અહેવાલ`)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The <strong>Notice Generator (`નોટિસ જનરેટર`)</strong> tab provides a live WYSIWYG A4 preview and supports two primary document modes:
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <div className="text-xs font-bold text-[#346739]">Mode A: Individual Parent Notice</div>
                      <ul className="mt-1 space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                        <li>Select Month, Trainee, and Notice Template.</li>
                        <li>Enter Outward No. (e.g., <code>69</code>) and Notice Date.</li>
                        <li>Optionally click <strong>Generate Smart Commentary</strong> to insert a tailored parent advisory paragraph.</li>
                        <li>Click <strong>Download A4 PDF</strong> or <strong>Print Notice</strong>.</li>
                      </ul>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <div className="text-xs font-bold text-slate-900">Mode B: Principal Monthly Summary Report</div>
                      <ul className="mt-1 space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                        <li>Select the <strong>Principal Monthly Report (`આચાર્યશ્રીનો અહેવાલ`)</strong> template.</li>
                        <li>Automatically populates <code>{`{{Students_Table}}`}</code> with all trainees having Progressive Attendance &lt; 80%.</li>
                        <li>Includes dual signature blocks for Supervisor Instructor & Principal.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 6.2 Batch Multi-Page Print Modal */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    6.2 Batch Multi-Page Notice PDF Export (`બલ્ક નોટિસ પ્રિન્ટ` — 1 Click for All Flagged Students)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Click the green <strong>Batch Print (`બલ્ક પ્રિન્ટ`)</strong> button in the top header to generate notices for multiple trainees simultaneously:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      <strong>Auto-Select Red-Flagged Trainees:</strong> Automatically selects all students whose cumulative progressive attendance is below 80%.
                    </li>
                    <li>
                      <strong>Sequential Sub-Outward Numbering:</strong> If you enter base Outward Number <code>69</code>, the portal automatically numbers each student's letter sequentially as <code>69/1</code>, <code>69/2</code>, <code>69/3</code>, and logs every letter into the Outward Register automatically.
                    </li>
                  </ul>
                </div>

                {/* DIAGRAM 6: DISPATCH & WHATSAPP WORKFLOW */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                    Diagram 6.1 — Outward / Inward Dispatch Register & Parent WhatsApp Delivery Flow
                  </h3>
                  <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50">
                    <div className="grid grid-cols-4 gap-2.5 text-center">
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">1. GENERATE</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Export / Print Notice</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          Assigns Outward No. (e.g. 69/1) & Notice Date.
                        </div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">2. AUTO-LOG</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Outward Register</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          Creates permanent entry in <em>जાવક રજીસ્ટર</em>.
                        </div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">3. DELIVER</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">WhatsApp / RPAD Post</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          1-click formatted Gujarati WhatsApp message to Parent.
                        </div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2.5">
                        <div className="text-[10px] font-black text-white bg-[#346739] px-2 py-0.5 rounded inline-block">4. FOLLOW UP</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Inward / Acknowledged</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          Record parent visit, medical certificate, or reply in <em>આવક રજીસ્ટર</em>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6.3 Inward & Outward Register Capabilities */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    6.3 Managing the Inward & Outward Dispatch Register (`જાવક અને આવક રજીસ્ટર`)
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      <strong>Outward Register (`જાવક રજીસ્ટર`):</strong> Tracks every notice issued with Outward Reference No., Date, Trainee Name, Attendance %, Delivery Mode (In-Person, Registered Post, WhatsApp), and Current Status (<em>Drafted, Dispatched, Acknowledged</em>).
                    </li>
                    <li>
                      <strong>Inward Register (`આવક રજીસ્ટર`):</strong> Record incoming letters, parent leave applications, medical certificates, or departmental circulars with Inward No., Sender Name, Subject, and Remarks.
                    </li>
                    <li>
                      <strong>Direct Parent WhatsApp Trigger:</strong> Click the green <strong>WhatsApp</strong> button on any dispatch row to open WhatsApp pre-filled with an official Gujarati attendance advisory addressed to the trainee's parent.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Section 6: Notice Generator, Principal Report & Dispatch Register</span>
                <span className="font-mono font-bold text-slate-700">Page 7 of 8</span>
              </div>
            </div>

            {/* =====================================================================
                PAGE 8: SECTION 7 — SUPER ADMIN CONSOLE, IME & BEST PRACTICES
               ===================================================================== */}
            <div
              id="guide-page-8"
              className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between"
              style={{ width: '794px', minHeight: '1123px', padding: '42px 46px' }}
            >
              <div>
                {/* Section Header */}
                <div className="border-b-2 border-[#346739] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#346739]">
                      SECTION 07 • STATE ADMINISTRATION, MULTILINGUAL IME & PRINT GUIDE
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      7. Super Admin Console, Phonetic Typing & Best Practices
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#f2edc2] text-[#1b381e] px-2.5 py-1 rounded-md border border-[#9fcb98]">
                    Page 08
                  </span>
                </div>

                {/* 7.1 Super Admin Console */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    7.1 State Super Admin Console (`સુપર એડમિન કંટ્રોલ પેનલ`)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The Super Admin account operates in a dedicated administrative jurisdiction designed for state-level oversight, instructor approval, and fee management:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-700 list-disc pl-5">
                    <li>
                      <strong>Instructor Account Approval & 1-Year Validity:</strong> Inspect newly registered instructors, verify their 12-digit UPI UTR reference number and uploaded payment screenshot, and click <strong>Approve (`મંજૂર કરો`)</strong> to grant 365 days of active portal access.
                    </li>
                    <li>
                      <strong>Dynamic Payment & UPI QR Configuration:</strong> Update the portal's UPI ID, Payee Name, Annual Maintenance Fee amount (e.g., ₹9), or upload a custom UPI QR image in real time.
                    </li>
                    <li>
                      <strong>State-Wide Directory & Audit:</strong> Search, edit, or reset passwords for any registered instructor across Gujarat ITIs, and inspect global trainee and dispatch statistics.
                    </li>
                  </ul>
                </div>

                {/* 7.2 Multilingual UI & Phonetic IME Companion */}
                <div className="mt-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    7.2 Trilingual Interface & Phonetic Gujarati/Hindi Typing (`ગુજરાતી / હિન્દી ફોનેટિક ટાઈપિંગ`)
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <div className="text-xs font-bold text-[#346739]">Global Portal Language Switcher</div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Switch the entire application interface instantly between <strong>ગુજરાતી (Gujarati)</strong>, <strong>हिन्दी (Hindi)</strong>, and <strong>English</strong> using the language selector in the top header bar.
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <div className="text-xs font-bold text-[#346739]">Built-in Phonetic IME Pad</div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        No external Gujarati keyboard software is required. Type phonetically in English (e.g., <code>namaste</code> → <code>નમસ્તે</code>) inside the floating IME companion or any form field.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7.3 Monthly Operational Checklist for Instructors */}
                <div className="mt-5 bg-[#f7f9f6] border border-[#9fcb98] rounded-xl p-4">
                  <h3 className="text-xs font-extrabold text-[#1b381e] uppercase tracking-wider mb-2">
                    7.3 Monthly Standard Operating Checklist for ITI Instructors (માસિક કામગીરી ચેકલિસ્ટ)
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-800">
                    <div className="flex items-start gap-2">
                      <span className="font-black text-[#346739]">☑ Step 1:</span>
                      <span>Verify your Trade, Batch (84–95) & Unit structure in <strong>Academic Hierarchy</strong> at session start.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-black text-[#346739]">☑ Step 2:</span>
                      <span>Import or update student & parent WhatsApp numbers in <strong>Trainee Directory</strong>.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-black text-[#346739]">☑ Step 3:</span>
                      <span>At month-end, filter by Trade/Batch/Unit in <strong>Monthly Attendance</strong> and mark present days.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-black text-[#346739]">☑ Step 4:</span>
                      <span>Print the <strong>A4 Monthly Attendance Register</strong> for physical classroom binder filing.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-black text-[#346739]">☑ Step 5:</span>
                      <span>Use <strong>Batch Print</strong> to export A4 notices for all Red-Flagged (&lt;80% Progressive) students.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-black text-[#346739]">☑ Step 6:</span>
                      <span>Print the <strong>Principal Monthly Summary Report</strong> and send WhatsApp advisories from <strong>Dispatch Register</strong>.</span>
                    </div>
                  </div>
                </div>

                {/* 7.4 Troubleshooting & Print Quality Reference */}
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    7.4 Quick Troubleshooting & Print Quality Guide
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Scenario / Question</th>
                        <th className="border border-slate-300 px-2.5 py-1.5 font-bold">Recommended Solution</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Only 1 month is entered; how is Progressive % computed?</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">The engine divides Present Days by Working Days of <em>only recorded months</em>. Unentered future months are never counted as zero.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">How to mark attendance for only 1 batch/unit?</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Select the specific <strong>Trade, Batch, and Unit</strong> dropdowns at the top of the Monthly Attendance page or inside the Mark Attendance modal.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Printing on pre-printed ITI letterhead paper?</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">In <strong>Template Studio</strong>, toggle <em>Show Official Letterhead</em> OFF so only Outward No., Date, Body, and Signatures print.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">Best PDF export method on Android / Desktop?</td>
                        <td className="border border-slate-300 px-2.5 py-1.5">Use the built-in <strong>Download A4 PDF</strong> button, which renders high-DPI Indic fonts without overlapping matras.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Section 7: Super Admin Console, Bilingual IME & Best Practices — End of Manual</span>
                <span className="font-mono font-bold text-slate-700">Page 8 of 8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-[#f7f9f6] rounded-2xl shadow-2xl border border-slate-300 w-full max-w-7xl max-h-[94vh] overflow-y-auto p-3 sm:p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
