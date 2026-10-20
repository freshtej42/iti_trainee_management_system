import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Users,
  CalendarCheck2,
  FileText,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Loader2,
  FileSpreadsheet,
  MessageSquare,
  Award,
} from 'lucide-react';
import { exportElementToPdf, printCleanDocument } from '../utils/pdfExport';

export const PUBLISHED_LIVE_URL =
  'https://itiattandancesystem.ai.studio';

interface GujaratiInfographicPageProps {
  showToolbar?: boolean;
  liveUrl?: string;
  onLiveUrlChange?: (url: string) => void;
}

export default function GujaratiInfographicPage({
  showToolbar = true,
  liveUrl: controlledUrl,
  onLiveUrlChange,
}: GujaratiInfographicPageProps) {
  const [internalUrl, setInternalUrl] = useState<string>(PUBLISHED_LIVE_URL);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const activeUrl = controlledUrl !== undefined ? controlledUrl : internalUrl;
  const setActiveUrl = (val: string) => {
    if (onLiveUrlChange) {
      onLiveUrlChange(val);
    } else {
      setInternalUrl(val);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPosterPdf = async () => {
    if (!posterRef.current) return;
    try {
      setIsExporting(true);
      await exportElementToPdf(posterRef.current, {
        filename: 'ITI_Attendance_Portal_1Page_Gujarati_Infographic.pdf',
        orientation: 'portrait',
        scale: 2.2,
      });
    } catch (err) {
      console.error('Failed to export 1-page Gujarati Infographic PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPoster = async () => {
    if (!posterRef.current) return;
    await printCleanDocument(posterRef.current, {
      title: 'ITI પોર્ટલ ૧-પેજ ગુજરાતી માર્ગદર્શિકા (Infographic)',
      orientation: 'portrait',
    });
  };

  return (
    <div className="space-y-4">
      {/* Interactive Action Bar (Hidden in Print) */}
      {showToolbar && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#346739]">
                ૧-પેજ ગુજરાતી પોર્ટલ ઈન્ફોગ્રાફિક • One-Page Short Guide
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">
                A4 પોસ્ટર સાઈઝ (210mm × 297mm)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              આ ૧-પેજની ગુજરાતી માર્ગદર્શિકામાં પોર્ટલની તમામ સુવિધાઓ, ૬-સ્ટેપ વર્કફ્લો, લાઈવ વેબસાઈટ URL અને સ્કેન કરી શકાય તેવો QR કોડ સામેલ છે.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live URL input / copy control */}
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 gap-2 max-w-full sm:max-w-md">
              <Globe className="w-3.5 h-3.5 text-[#346739] shrink-0" />
              <input
                type="text"
                value={activeUrl}
                onChange={(e) => setActiveUrl(e.target.value)}
                aria-label="Published Live Portal URL"
                className="text-xs font-mono text-slate-800 bg-transparent focus:outline-none w-52 sm:w-64 truncate"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                title="Copy Published URL"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>લિંક કોપી</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadPosterPdf}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#346739] hover:bg-[#264e2b] disabled:opacity-60 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF બની રહી છે...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>૧-પેજ ગુજરાતી ઈન્ફોગ્રાફિક PDF ડાઉનલોડ કરો</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintPoster}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>A4 પોસ્ટર પ્રિન્ટ</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable A4 Single-Page Gujarati Infographic Poster */}
      <div className="overflow-x-auto flex justify-center pb-4">
        <div
          ref={posterRef}
          id="gujarati-infographic-a4"
          className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between font-gujarati"
          style={{
            width: '794px',
            minHeight: '1123px',
            maxHeight: '1123px',
            padding: '28px 34px',
            pageBreakAfter: 'always',
          }}
        >
          {/* TOP CONTENT GROUP */}
          <div className="space-y-3.5">
            {/* 1. OFFICIAL HEADER BANNER */}
            <div className="bg-[#1b381e] text-white rounded-2xl p-4 border-2 border-[#346739] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#f2edc2] text-[#1b381e] flex flex-col items-center justify-center font-black border-2 border-[#9fcb98] shrink-0">
                  <span className="text-lg leading-none">ITI</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">
                    GUJARAT
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#9fcb98]">
                    ITI ઇન્સ્ટ્રક્ટર ડિજિટલ ટૂલકીટ • NCVT / GCVT 80% હાજરી ધોરણો મુજબ
                  </div>
                  <h1 className="text-xl font-black text-[#f2edc2] tracking-tight leading-snug mt-0.5">
                    ITI તાલીમાર્થી હાજરી અને વાલી નોટિસ પોર્ટલ — સંક્ષિપ્ત માર્ગદર્શિકા
                  </h1>
                  <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
                    માસિક હાજરી • પ્રોગ્રેસિવ 80% ગણતરી • ઓટોમેટિક A4 વાલી નોટિસ • આચાર્ય અહેવાલ • જાવક અને WhatsApp રજીસ્ટર
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 border-l border-emerald-800 pl-3.5">
                <div className="text-[10px] uppercase tracking-wider text-[#9fcb98] font-bold">
                  ૧-પેજ પોર્ટલ ઈન્ફોગ્રાફિક
                </div>
                <div className="text-sm font-black text-white mt-0.5">Quick Guide</div>
                <div className="text-[10px] text-emerald-200 mt-0.5">ગુજરાતી આવૃત્તિ</div>
              </div>
            </div>

            {/* 2. PUBLISHED LIVE WEB APPLICATION URL & QR CODE CALLOUT */}
            <div className="bg-[#f2edc2]/45 border-2 border-[#346739] rounded-2xl p-3.5 flex items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#346739] inline-block" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#1b381e]">
                    લાઈવ વેબ એપ્લિકેશન લિંક (Published Live Portal URL)
                  </span>
                </div>
                <div className="bg-white border border-[#9fcb98] rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] font-mono font-bold text-[#1b381e] underline decoration-[#346739] break-all leading-tight"
                  >
                    {activeUrl}
                  </a>
                  <ExternalLink className="w-4 h-4 text-[#346739] shrink-0" />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-700 font-semibold pt-0.5">
                  <span>
                    • <strong>મોબાઈલ / કોમ્પ્યુટર:</strong> કોઈપણ બ્રાઉઝરમાં ઉપરોક્ત લિંક ખોલો
                  </span>
                  <span>
                    • <strong>લાઈવ ડેમો:</strong> લોગિન વગર &ldquo;લાઈવ ડેમો (Demo Mode)&rdquo; બટનથી તુરંત ચકાસો
                  </span>
                </div>
              </div>

              {/* Scannable Vector QR Code */}
              <div className="bg-white p-2 rounded-xl border border-slate-300 flex flex-col items-center shrink-0">
                <QRCodeSVG
                  value={activeUrl || PUBLISHED_LIVE_URL}
                  size={74}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#1b381e"
                />
                <span className="text-[9px] font-extrabold text-[#1b381e] mt-1 tracking-tight">
                  QR સ્કેન કરી પોર્ટલ ખોલો
                </span>
              </div>
            </div>

            {/* 3. SIX-STEP VISUAL WORKFLOW INFOGRAPHIC IN GUJARATI */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#1b381e] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#346739]" />
                  <span>પોર્ટલનો ઉપયોગ કરવાના ૬ સરળ સ્ટેપ્સ (6-Step Portal Workflow)</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500">
                  રજીસ્ટ્રેશનથી વાલી નોટિસ સુધીની સંપૂર્ણ પ્રક્રિયા
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Step 1 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-[#346739]">સ્ટેપ ૦૧</span>
                      <ShieldCheck className="w-4 h-4 text-[#346739]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900">
                      રજીસ્ટ્રેશન, લોગિન અને ડેમો
                    </h3>
                    <p className="text-[10.5px] text-slate-600 leading-snug mt-1">
                      ઈમેલ કે મોબાઈલ નંબરથી લોગિન કરો. નવું ખાતું બનાવવા ₹199 વાર્ષિક સબ્સ્ક્રિપ્શન (૧ વર્ષ માન્યતા) અથવા <strong>લાઈવ ડેમો</strong> મોડમાં તમામ સુવિધા વિનામૂલ્યે ચકાસો.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] font-bold text-[#1b381e]">
                    ✓ ૧૦૦% સુરક્ષિત વ્યક્તિગત ડેટાબેઝ
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-[#346739]">સ્ટેપ ૦૨</span>
                      <Layers className="w-4 h-4 text-[#346739]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900">
                      ટ્રેડ, બેચ (84–95) અને યુનિટ
                    </h3>
                    <p className="text-[10.5px] text-slate-600 leading-snug mt-1">
                      <strong>Academic Setup</strong> માં જઈ તમારા ટ્રેડ (દા.ત. Fitter, Copa, Electrician), શૈક્ષણિક બેચ (84, 85, 86...) અને યુનિટ (Unit A, Unit B) ઉમેરો.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] font-bold text-[#1b381e]">
                    ✓ મલ્ટી-ટ્રેડ અને મલ્ટી-બેચ સપોર્ટ
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-[#346739]">સ્ટેપ ૦૩</span>
                      <FileSpreadsheet className="w-4 h-4 text-[#346739]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900">
                      તાલીમાર્થી યાદી અને Excel ઈમ્પોર્ટ
                    </h3>
                    <p className="text-[10.5px] text-slate-600 leading-snug mt-1">
                      <strong>Trainee Directory</strong> માં તાલીમાર્થીઓના નામ, રોલ નંબર, ટ્રેડ, બેચ, યુનિટ અને વાલીના WhatsApp નંબર Excel/CSV ફાઈલથી એકસાથે અપલોડ કરો.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] font-bold text-[#1b381e]">
                    ✓ ૧-ક્લિકમાં બલ્ક સ્ટુડન્ટ ઈમ્પોર્ટ
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-[#346739]">સ્ટેપ ૦૪</span>
                      <CalendarCheck2 className="w-4 h-4 text-[#346739]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900">
                      માસિક અને પ્રોગ્રેસિવ હાજરી
                    </h3>
                    <p className="text-[10.5px] text-slate-600 leading-snug mt-1">
                      <strong>ટ્રેડ + બેચ + યુનિટ ફિલ્ટર</strong> પસંદ કરી મહિનાના કુલ કાર્યદિવસ અને હાજર દિવસ ભરો. પોર્ટલ આપોઆપ માસિક % અને કુલ પ્રોગ્રેસિવ % ગણશે.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] font-bold text-[#1b381e]">
                    ✓ A4 માસિક હાજરી રજીસ્ટર પ્રિન્ટ
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-[#346739]">સ્ટેપ ૦૫</span>
                      <FileText className="w-4 h-4 text-[#346739]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900">
                      ટેમ્પલેટ સ્ટુડિયો અને લેટરહેડ
                    </h3>
                    <p className="text-[10.5px] text-slate-600 leading-snug mt-1">
                      ગુજરાતી, હિન્દી અને અંગ્રેજી નોટિસ ટેમ્પલેટ કસ્ટમાઈઝ કરો. કોરા કાગળ માટે ઓફિશિયલ લેટરહેડ ON રાખો અથવા પ્રિન્ટેડ લેટરહેડ માટે OFF કરો.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] font-bold text-[#1b381e]">
                    ✓ ડાયનેમિક મર્જ ટૅગ્સ ઓટો-ફિલ
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-[#346739]">સ્ટેપ ૦૬</span>
                      <SendHorizontal className="w-4 h-4 text-[#346739]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900">
                      બલ્ક વાલી નોટિસ અને WhatsApp
                    </h3>
                    <p className="text-[10.5px] text-slate-600 leading-snug mt-1">
                      80% થી ઓછી હાજરીવાળા તાલીમાર્થીઓ માટે એકસાથે જાવક નંબર (69/1, 69/2...) સાથે A4 PDF નોટિસ, આચાર્ય રિપોર્ટ અને સીધો વાલીને WhatsApp મોકલો.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[9.5px] font-bold text-[#1b381e]">
                    ✓ ઓટોમેટિક આવક-જાવક રજીસ્ટર નોંધ
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PROGRESSIVE ATTENDANCE FORMULA & 80% NCVT RULE INFOGRAPHIC */}
            <div className="bg-emerald-950 text-white rounded-2xl p-3.5 border border-emerald-800">
              <div className="flex items-center justify-between gap-4 border-b border-emerald-800/80 pb-2 mb-2.5">
                <div>
                  <h2 className="text-xs font-black text-[#f2edc2] uppercase tracking-wider">
                    NCVT / GCVT 80% પ્રોગ્રેસિવ હાજરી ગણતરીનું સચોટ સૂત્ર (Smart Cumulative Formula)
                  </h2>
                  <p className="text-[10.5px] text-emerald-200 mt-0.5">
                    જે મહિનાઓની હાજરી ભરેલી નથી (Future Months) તેને 0 ગણવામાં આવતા નથી — માત્ર નોંધાયેલા મહિનાઓના આધારે જ સચોટ ગણતરી:
                  </p>
                </div>
                <div className="bg-[#f2edc2] text-[#1b381e] px-3 py-1.5 rounded-xl font-black text-[11px] shrink-0">
                  પ્રોગ્રેસિવ % = (કુલ હાજર દિવસ ÷ કુલ કાર્યદિવસ) × 100
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-[10.5px]">
                <div className="bg-emerald-900/70 border border-emerald-700 rounded-xl p-2 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-emerald-200">≥ 80% — સંતોષકારક (Safe)</div>
                    <div className="text-emerald-100/90 text-[10px] mt-0.5">
                      NCVT પરીક્ષા માટે પાત્ર. કોઈ વાલી નોટિસની જરૂર નથી (લીલો રંગ).
                    </div>
                  </div>
                </div>
                <div className="bg-amber-950/80 border border-amber-700/80 rounded-xl p-2 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-amber-200">75% થી 79.9% — ચેતવણી (Borderline)</div>
                    <div className="text-amber-100/90 text-[10px] mt-0.5">
                      હાજરી સુધારવા માટે પ્રથમ તાકીદ નોટિસ / વાલી સંપર્ક (પીળો રંગ).
                    </div>
                  </div>
                </div>
                <div className="bg-rose-950/80 border border-rose-700/80 rounded-xl p-2 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-rose-200">&lt; 75% — ગંભીર (Critical Alert)</div>
                    <div className="text-rose-100/90 text-[10px] mt-0.5">
                      તાત્કાલિક વાલી નોટિસ, અંતિમ કારણદર્શક નોટિસ અને આચાર્ય રિપોર્ટ (લાલ રંગ).
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. KEY MODULES & FACILITY COMPARISON (2-COLUMN VISUAL SUMMARY) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left Box: Core Portal Facilities */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <h3 className="text-xs font-black text-[#1b381e] border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#346739]" />
                  <span>પોર્ટલની મુખ્ય સુવિધાઓ (Key Highlights)</span>
                </h3>
                <ul className="space-y-1.5 text-[10.5px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <span className="font-black text-[#346739]">૧.</span>
                    <span>
                      <strong>ટ્રેડ + બેચ + યુનિટ ફિલ્ટર:</strong> એકથી વધુ ટ્રેડ કે બેચ ધરાવતા ઇન્સ્ટ્રક્ટર પોતાના ચોક્કસ યુનિટના જ તાલીમાર્થીઓ ફિલ્ટર કરી હાજરી ભરી શકે છે.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-black text-[#346739]">૨.</span>
                    <span>
                      <strong>બલ્ક A4 વાલી નોટિસ (69/1, 69/2...):</strong> એક જ ક્લિકમાં તમામ ઓછી હાજરીવાળા તાલીમાર્થીઓની સ્વતંત્ર A4 નોટિસ ક્રમિક જાવક નંબર સાથે PDF માં બને છે.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-black text-[#346739]">૩.</span>
                    <span>
                      <strong>આચાર્યશ્રીનો માસિક સમરી રિપોર્ટ:</strong> વર્ગના કુલ તાલીમાર્થી, &lt;80% હાજરી ધરાવતા તાલીમાર્થીઓની યાદી અને સહી-સિક્કા સાથેનો તૈયાર A4 અહેવાલ.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-black text-[#346739]">૪.</span>
                    <span>
                      <strong>ફોનેટિક ગુજરાતી ટાઈપિંગ (IME):</strong> અંગ્રેજી કીબોર્ડથી સીધું ગુજરાતી કે હિન્દીમાં ટાઈપ કરવાની ઇન-બિલ્ટ સુવિધા.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Right Box: Monthly Instructor Operating Checklist */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <h3 className="text-xs font-black text-[#1b381e] border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#346739]" />
                  <span>ઇન્સ્ટ્રક્ટર માટે દર મહિનાની કામગીરી (Monthly Checklist)</span>
                </h3>
                <div className="space-y-1.5 text-[10.5px] text-slate-700">
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="font-black text-[#346739]">☑ ૧.</span>
                    <span>મહિનાના અંતે <strong>ટ્રેડ, બેચ અને યુનિટ</strong> પસંદ કરી કુલ કાર્યદિવસ (Working Days) નાખો.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="font-black text-[#346739]">☑ ૨.</span>
                    <span>દરેક તાલીમાર્થીના <strong>હાજર દિવસ (Present Days)</strong> ભરી સેવ કરો.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="font-black text-[#346739]">☑ ૩.</span>
                    <span><strong>Batch Notice</strong> દ્વારા &lt;80% હાજરીવાળા તાલીમાર્થીઓની A4 નોટિસ PDF ડાઉનલોડ કરો.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="font-black text-[#346739]">☑ ૪.</span>
                    <span><strong>આચાર્ય સમરી રિપોર્ટ</strong> પ્રિન્ટ કરો અને <strong>જાવક રજીસ્ટર</strong> માંથી વાલીને WhatsApp કરો.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM FOOTER BAR WITH LIVE URL */}
          <div className="pt-2.5 border-t-2 border-[#346739] flex items-center justify-between gap-3 text-[10px] text-slate-600">
            <div className="font-bold text-[#1b381e]">
              ITI Trainee Attendance & Notice Portal • ગુજરાતની તમામ સરકારી અને ગ્રાન્ટેડ ITI ના ઇન્સ્ટ્રક્ટરશ્રીઓ માટે ઉપયોગી
            </div>
            <div className="font-mono font-bold text-[#346739] truncate">
              Live URL: {activeUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
