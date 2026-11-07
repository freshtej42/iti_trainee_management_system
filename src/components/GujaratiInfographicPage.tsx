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
  Star,
  Zap,
  Clock,
  CheckCircle,
  Percent,
  UserX,
  CreditCard,
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
              <span className="text-xs font-black uppercase tracking-wider text-[#346739] flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>૧-પેજ સત્તાવાર બ્રોશર • 1-Page Official A4 Color Brochure</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                વાર્ષિક સબ્સ્ક્રિપ્શન: માત્ર ₹49 / વર્ષ
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">
                A4 સાઈઝ (210mm × 297mm)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              આ ૧-પેજની રંગીન બ્રોશરમાં પોર્ટલની તમામ સુવિધાઓ, નવીનતમ FAR-1 આંતરિક મૂલ્યાંકન (નમૂનો-૨), ₹49 સબ્સ્ક્રિપ્શન વિગત, લાઈવ વેબસાઈટ URL અને સ્કેન કરી શકાય તેવો QR કોડ સામેલ છે.
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#346739] hover:bg-[#264e2b] disabled:opacity-60 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>PDF બને છે...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>૧-પેજ બ્રોશર PDF ડાઉનલોડ કરો</span>
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
              <span>A4 પ્રિન્ટ</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable A4 Single-Page High-Conversion Gujarati Brochure */}
      <div className="overflow-x-auto flex justify-center pb-4">
        <div
          ref={posterRef}
          id="gujarati-infographic-a4"
          className="guide-a4-page bg-white text-slate-900 border border-slate-300 shadow-md print:shadow-none print:border-0 box-border flex flex-col justify-between font-gujarati"
          style={{
            width: '794px',
            minHeight: '1123px',
            maxHeight: '1123px',
            padding: '22px 26px',
            pageBreakAfter: 'always',
          }}
        >
          {/* TOP CONTENT GROUP */}
          <div className="space-y-2.5">
            {/* 1. OFFICIAL HEADER BANNER WITH SUBSCRIPTION VALUE HIGHLIGHT */}
            <div className="bg-[#122a16] text-white rounded-2xl p-3 border-2 border-[#346739] flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-xl bg-[#f2edc2] text-[#1b381e] flex flex-col items-center justify-center font-black border-2 border-[#9fcb98] shrink-0 shadow-xs">
                  <span className="text-base font-black leading-none">ITI</span>
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">
                    GUJARAT
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#9fcb98]">
                      ITI ઇન્સ્ટ્રક્ટર ડિજિટલ ટૂલકીટ • NCVT / GCVT &amp; DET Norms
                    </span>
                    <span className="text-[8.5px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                      સત્તાવાર પોર્ટલ
                    </span>
                  </div>
                  <h1 className="text-lg font-black text-[#f2edc2] tracking-tight leading-tight mt-0.5">
                    ITI તાલીમાર્થી હાજરી, વાલી નોટિસ અને આંતરિક મૂલ્યાંકન પોર્ટલ
                  </h1>
                  <p className="text-[10.5px] text-emerald-100 font-medium mt-0.5">
                    માસિક હાજરી • ૮૦% પ્રોગ્રેસિવ ગણતરી • A4 વાલી નોટિસ • <strong>નમૂનો-૨ (FAR-1)</strong> • આચાર્ય રિપોર્ટ • WhatsApp
                  </p>
                </div>
              </div>

              {/* Eye-Catching Pricing Badge */}
              <div className="text-right shrink-0 bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-400/50 rounded-xl px-3 py-1.5 flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                  વાર્ષિક સબ્સ્ક્રિપ્શન
                </span>
                <div className="text-base font-black text-amber-300 leading-tight">
                  માત્ર ₹49 <span className="text-[10px] font-normal text-white">/ વર્ષ</span>
                </div>
                <span className="text-[9px] text-emerald-200 font-medium mt-0.5">
                  ૧-વર્ષ માન્યતા • ફ્રી લાઈવ ડેમો
                </span>
              </div>
            </div>

            {/* 2. BLOCKBUSTER HIGHLIGHT: FORMATIVE ASSESSMENT (FAR-1 / નમૂનો-૨) */}
            <div className="bg-gradient-to-r from-[#fefbf0] via-[#f7faf5] to-[#f0f7ee] border-2 border-[#b49b4c] rounded-2xl p-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#d8c582]/60 pb-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#346739] text-[#f2edc2] text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>નવી વિશેષ સુવિધા • NEW BLOCKBUSTER FEATURE</span>
                  </span>
                  <h2 className="text-xs font-black text-[#1b381e]">
                    આંતરિક મૂલ્યાંકન પત્રક (નમૂનો-૨ / FAR-1) અને LO મુજબ સ્માર્ટ ગણતરી
                  </h2>
                </div>
                <span className="text-[9.5px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/80 font-mono">
                  Official 36-Column Matrix
                </span>
              </div>

              {/* 3-Column Feature Cards for Formative Assessment */}
              <div className="grid grid-cols-3 gap-2">
                {/* Feature 1 */}
                <div className="bg-white border border-[#c4dcbf] rounded-xl p-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[#346739] font-black text-[11px] mb-1">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#346739]" />
                        <span>૩૬-કોલમ બ્લુપ્રિન્ટ &amp; LO એન્ટ્રી</span>
                      </span>
                      <span className="text-[9px] bg-emerald-50 text-[#1b381e] px-1 rounded font-bold">Col 1–36</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      DET ગુજરાતના નિયમો મુજબ <strong>૨૪ સબ-પેરામીટર</strong>, <strong>VIVA (૧૫ ગુણ)</strong>, પ્રેક્ટિકલ (૮૫ ગુણ) અને <strong>Col 36 (LO સરેરાશ / ૧૦૦)</strong>. સીધા LO1, LO2... ના ગુણ આપો.
                    </p>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 text-[9px] font-bold text-[#1b381e]">
                    ✓ ૯૦° એન્ટી-ક્લોકવાઇઝ રોટેટેડ હેડર્સ
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white border border-[#c4dcbf] rounded-xl p-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[#346739] font-black text-[11px] mb-1">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-[#346739]" />
                        <span>±૩ થી ±૫ રેન્ડમાઇઝેશન &amp; ઓટો-ફિલ</span>
                      </span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 px-1 rounded font-bold">Smart Math</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      દરેક પ્રેક્ટિકલના ગુણમાં <strong>±૩ થી ±૫ નું કુદરતી વૈવિધ્ય</strong> પણ LO ની લક્ષિત સરેરાશ ચોક્કસ જળવાય છે! <strong>હાજરી % મુજબ ૧-ક્લિકમાં</strong> ૫૫ થી ૯૫ ગુણ ઓટો-ફિલ કરવાની સુવિધા.
                    </p>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 text-[9px] font-bold text-[#1b381e]">
                    ✓ વાસ્તવિક માર્ક્સ વિતરણ (No Flat Marks)
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white border border-[#c4dcbf] rounded-xl p-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[#346739] font-black text-[11px] mb-1">
                      <span className="flex items-center gap-1">
                        <UserX className="w-3.5 h-3.5 text-rose-600" />
                        <span>સંસ્થા છોડેલ (Cutoff) &amp; નિકાસ</span>
                      </span>
                      <span className="text-[9px] bg-rose-50 text-rose-800 px-1 rounded font-bold">A4 &amp; Excel</span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      વિદ્યાર્થી સંસ્થા છોડે (દા.ત. 05-11-2026) તો છેલ્લો પ્રેક્ટિકલ (P36) પસંદ કરતા જ બાકીના P37–P50 ગુણ ક્લિયર થઈ <strong>[Left]</strong> બેજ લાગે છે. <strong>Sign of F.I. / Supervisor</strong> સાથે A4 &amp; Excel નિકાસ.
                    </p>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 text-[9px] font-bold text-[#1b381e]">
                    ✓ વર્ગ સરેરાશ સુરક્ષિત (Auto Cleared)
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TWO CORE PILLARS: ATTENDANCE ENGINE & AUTOMATIC NOTICE STUDIO */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Pillar A: Monthly & Progressive Attendance Engine */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck2 className="w-4 h-4 text-[#346739]" />
                      <h3 className="text-xs font-black text-slate-900">
                        માસિક અને ૮૦% પ્રોગ્રેસિવ હાજરી એન્જિન
                      </h3>
                    </div>
                    <span className="text-[9px] font-bold text-[#346739] bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      NCVT Norms
                    </span>
                  </div>

                  <ul className="space-y-1 text-[10.5px] text-slate-700">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>ટ્રેડ + બેચ (84–95) + યુનિટ A/B/C ફિલ્ટર:</strong> દરેક ઇન્સ્ટ્રક્ટર પોતાના ચોક્કસ વર્ગના તાલીમાર્થીઓ ફિલ્ટર કરી સરળતાથી હાજરી ભરી શકે છે.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>સચોટ ૮૦% ક્યુમ્યુલેટિવ ફોર્મ્યુલા:</strong> જે મહિનાની હાજરી ભરેલી નથી તેને 0 ન ગણતા, માત્ર નોંધાયેલા મહિનાઓ પરથી સાચી પરીક્ષા પાત્રતા % ગણાય છે.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>કલર-કોડેડ સુરક્ષા એલર્ટ્સ:</strong> ≥80% સેફ (લીલો), 75–79.9% ચેતવણી (પીળો), &lt;75% ગંભીર તાકીદ નોટિસ (લાલ).
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>બલ્ક Excel/CSV સ્ટુડન્ટ ઈમ્પોર્ટ:</strong> વિદ્યાર્થીઓના નામ, રોલ નંબર અને વાલીના નંબર ૧-ક્લિકમાં અપલોડ થાય છે.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[9px] font-bold text-slate-600">
                  <span>✓ ISO A4 માસિક રજીસ્ટર પ્રિન્ટ</span>
                  <span className="text-[#346739]">પ્રોગ્રેસિવ % = (કુલ હાજર ÷ કુલ કાર્યદિવસ) × 100</span>
                </div>
              </div>

              {/* Pillar B: Automatic Parent Notices, Principal Report & Dispatch */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <SendHorizontal className="w-4 h-4 text-[#346739]" />
                      <h3 className="text-xs font-black text-slate-900">
                        ઓટોમેટિક વાલી નોટિસ, અહેવાલ &amp; WhatsApp
                      </h3>
                    </div>
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      Batch Dispatch
                    </span>
                  </div>

                  <ul className="space-y-1 text-[10.5px] text-slate-700">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>બલ્ક A4 વાલી નોટિસ (69/1, 69/2...):</strong> &lt;80% હાજરીવાળા તમામ તાલીમાર્થીઓની સ્વતંત્ર A4 નોટિસ ક્રમિક જાવક નંબર સાથે ૧-ક્લિકમાં PDF બને છે.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>ટેમ્પલેટ સ્ટુડિયો &amp; લેટરહેડ:</strong> ગુજરાતી/હિન્દી/અંગ્રેજી નોટિસ, સત્તાવાર લેટરહેડ ON/OFF અને ૨૫+ ડાયનેમિક મર્જ ટૅગ્સ.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>આચાર્યશ્રીનો માસિક સમરી રિપોર્ટ:</strong> વર્ગના કુલ તાલીમાર્થી અને ઓછી હાજરીવાળાની વિગત સાથે સહી-સિક્કા વાળો તૈયાર અહેવાલ.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#346739] shrink-0 mt-0.5" />
                      <span>
                        <strong>સીધો વાલીને WhatsApp &amp; રજીસ્ટર:</strong> ૧-ક્લિકમાં વાલીના મોબાઈલ પર મેસેજ મોકલો અને આવક/જાવક રજીસ્ટરમાં ઓટો-નોંધ રાખો.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[9px] font-bold text-slate-600">
                  <span>✓ ૧૦૦% સરકારી પત્રવ્યવહાર ઓડિટ લોગ</span>
                  <span className="text-[#346739]">ફોનેટિક ગુજરાતી ટાઈપિંગ (IME) ઇન-બિલ્ટ</span>
                </div>
              </div>
            </div>

            {/* 4. HIGH-CONVERSION SUBSCRIPTION & LIVE PORTAL ACCESS BOX */}
            <div className="bg-[#1b381e] text-white rounded-2xl p-2.5 border-2 border-[#9fcb98] flex items-center justify-between gap-3 shadow-md">
              {/* Left Column: Why Subscribe */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-950" />
                    <span>વાર્ષિક સબ્સ્ક્રિપ્શન ઓફર</span>
                  </span>
                  <span className="text-xs font-black text-[#f2edc2]">
                    માત્ર ₹49 / વર્ષ (મહિને માત્ર ~₹4)
                  </span>
                </div>
                <div className="text-[10px] text-emerald-100 leading-snug">
                  • <strong>અમર્યાદિત ઉપયોગ:</strong> તમારા તમામ ટ્રેડ, બેચ (84–95), યુનિટ અને વિદ્યાર્થીઓ માટે ૧ વર્ષ સુધી સંપૂર્ણ છૂટ.
                  <br />
                  • <strong>સરળ પેમેન્ટ:</strong> UPI QR સ્કેન કરી ₹49 ચૂકવો અને UTR નંબર નાખી તુરંત એકાઉન્ટ એક્ટિવેટ કરો.
                  <br />
                  • <strong>૧૦૦% સલામત &amp; વ્યક્તિગત:</strong> તમારો ડેટા સંપૂર્ણ સુરક્ષિત રહે છે અને ક્લાઉડ પર સચવાય છે.
                </div>
                <div className="pt-0.5 flex items-center gap-2">
                  <span className="text-[9.5px] bg-emerald-900/90 border border-emerald-700 text-emerald-200 px-2 py-0.5 rounded-md font-bold">
                    ★ લાઈવ ડેમો મોડ (Free Demo): ૧ રૂપિયો ચૂકવ્યા વગર તમામ સુવિધાઓ તુરંત ચકાસો!
                  </span>
                </div>
              </div>

              {/* Center: Live URL & Link Box */}
              <div className="bg-emerald-950/80 border border-emerald-700 rounded-xl p-2 flex flex-col items-center justify-center shrink-0 w-44 text-center">
                <Globe className="w-4 h-4 text-[#9fcb98] mb-1" />
                <span className="text-[8.5px] font-bold text-emerald-200 uppercase tracking-wider">
                  લાઈવ વેબ પોર્ટલ લિંક
                </span>
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10.5px] font-mono font-bold text-[#f2edc2] underline decoration-amber-400 break-all leading-tight mt-0.5 hover:text-white"
                >
                  {activeUrl}
                </a>
                <span className="text-[8.5px] text-emerald-300 mt-1">
                  મોબાઈલ કે PC પર બ્રાઉઝરમાં ખોલો
                </span>
              </div>

              {/* Right: Scannable Vector QR Code */}
              <div className="bg-white p-2 rounded-xl border-2 border-[#f2edc2] flex flex-col items-center shrink-0 shadow-xs">
                <QRCodeSVG
                  value={activeUrl || PUBLISHED_LIVE_URL}
                  size={66}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#122a16"
                />
                <span className="text-[8.5px] font-black text-[#1b381e] mt-1 tracking-tight">
                  QR સ્કેન કરી પોર્ટલ ખોલો
                </span>
              </div>
            </div>

            {/* 5. FOUR POWER BENEFIT BADGES FOR INSTRUCTORS */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[#f7faf6] border border-[#c4dcbf] rounded-xl p-1.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#346739] text-[#f2edc2] flex items-center justify-center font-black shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-900 leading-tight">૯૫% સમયની બચત</div>
                  <div className="text-[8.5px] text-slate-600 mt-0.5 leading-tight">કલાકોનું રજીસ્ટર કામ મિનિટોમાં</div>
                </div>
              </div>

              <div className="bg-[#f7faf6] border border-[#c4dcbf] rounded-xl p-1.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#346739] text-[#f2edc2] flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-900 leading-tight">૦% ગણતરી ભૂલ</div>
                  <div className="text-[8.5px] text-slate-600 mt-0.5 leading-tight">NCVT &amp; FAR-1 સચોટ ગણતરી</div>
                </div>
              </div>

              <div className="bg-[#f7faf6] border border-[#c4dcbf] rounded-xl p-1.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#346739] text-[#f2edc2] flex items-center justify-center font-black shrink-0">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-900 leading-tight">ઓડિટ &amp; ઇન્સ્પેક્શન રેડી</div>
                  <div className="text-[8.5px] text-slate-600 mt-0.5 leading-tight">સહી-સિક્કા સાથે તૈયાર A4 રિપોર્ટ્સ</div>
                </div>
              </div>

              <div className="bg-[#f7faf6] border border-[#c4dcbf] rounded-xl p-1.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#346739] text-[#f2edc2] flex items-center justify-center font-black shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-900 leading-tight">કોઈ ઇન્સ્ટોલેશન નહીં</div>
                  <div className="text-[8.5px] text-slate-600 mt-0.5 leading-tight">મોબાઈલ/લેપટોપ બ્રાઉઝરમાં સીધું લાઈવ</div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM FOOTER BAR WITH ACCREDITATION & LIVE LINK */}
          <div className="pt-1.5 border-t-2 border-[#346739] flex items-center justify-between gap-3 text-[9px] text-slate-600">
            <div className="font-bold text-[#1b381e]">
              ITI Trainee Attendance, Notice &amp; Formative Assessment Portal • ગુજરાતની તમામ સરકારી, ગ્રાન્ટેડ અને સેલ્ફ-ફાઇનાન્સ ITI ના ઇન્સ્ટ્રક્ટરશ્રીઓ માટે ઉપયોગી
            </div>
            <div className="font-mono font-bold text-[#346739] truncate">
              {activeUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
