import React, { useState } from 'react';
import {
  Building2,
  Users,
  CalendarCheck2,
  FileText,
  SendHorizontal,
  ShieldCheck,
  Printer,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowRight,
  Globe2,
  Mail,
  User,
  Clock,
  HelpCircle,
  Eye,
  BookOpen,
  Table2,
  Sliders,
  Download,
  GripVertical,
  KeyRound,
  Lock,
  ChevronRight,
  ExternalLink,
  ArrowUp,
  Cpu,
  ShieldAlert,
} from 'lucide-react';

interface LandingPageViewProps {
  onNavigateToAuth: (mode?: 'login' | 'register') => void;
  onLaunchDemo: () => void;
  onNavigateToTab?: (tab: string) => void;
  isAuthenticated?: boolean;
  currentInstructorName?: string;
  currentInstructorTrade?: string;
}

export default function LandingPageView({
  onNavigateToAuth,
  onLaunchDemo,
  onNavigateToTab,
  isAuthenticated = false,
  currentInstructorName,
  currentInstructorTrade,
}: LandingPageViewProps) {
  // Bilingual display language toggle: 'gu' (Gujarati) or 'en' (English)
  const [lang, setLang] = useState<'gu' | 'en'>('gu');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isGu = lang === 'gu';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-[#346739] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP BAR NAVIGATION CONTRACT (One line, 3 zones)                       */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#346739] to-[#1f4223] text-[#f2edc2] flex items-center justify-center font-black text-sm shadow-xs border border-[#2b562f]">
              ITI
            </div>
            <a
              href="#top"
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
            >
              {isGu ? 'ગુજરાત ITI પોર્ટલ' : 'Gujarat ITI Portal'}
            </a>
          </div>

          {/* Zone 2: Concise navigation links (desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#academic" className="hover:text-[#346739] transition-colors whitespace-nowrap">
              {isGu ? 'શૈક્ષણિક માળખું' : 'Academic Hierarchy'}
            </a>
            <a href="#attendance" className="hover:text-[#346739] transition-colors whitespace-nowrap">
              {isGu ? 'સ્માર્ટ હાજરી' : 'Smart Attendance'}
            </a>
            <a href="#templates" className="hover:text-[#346739] transition-colors whitespace-nowrap">
              {isGu ? 'ટેમ્પલેટ સ્ટુડિયો' : 'Template Studio'}
            </a>
            <a href="#reports" className="hover:text-[#346739] transition-colors whitespace-nowrap">
              {isGu ? 'રિપોર્ટ & નોટિસ' : 'Notice Generator'}
            </a>
            <a href="#mergetags" className="hover:text-[#346739] transition-colors whitespace-nowrap">
              {isGu ? 'કસ્ટમ ટેબલ' : 'Custom Tables'}
            </a>
            <a href="#dispatch" className="hover:text-[#346739] transition-colors whitespace-nowrap">
              {isGu ? 'જાવક રજીસ્ટર' : 'Dispatch Register'}
            </a>
            <a href="#contact" className="hover:text-[#346739] transition-colors whitespace-nowrap">
              {isGu ? 'સહાયતા & એડમિન' : 'Admin & Support'}
            </a>
          </nav>

          {/* Zone 3: Actions + Language Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Switcher Toggle */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setLang('gu')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  isGu
                    ? 'bg-[#346739] text-[#f2edc2] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ગુજરાતીમાં જુઓ"
              >
                ગુજરાતી
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  !isGu
                    ? 'bg-[#346739] text-[#f2edc2] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View in English"
              >
                English
              </button>
            </div>

            {/* If user is already authenticated */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigateToTab && onNavigateToTab('attendance')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#346739] hover:bg-[#28522c] rounded-lg shadow-xs transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <span>{isGu ? 'પોર્ટલ કન્સોલમાં જાઓ' : 'Open Portal Console'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onLaunchDemo}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors whitespace-nowrap"
                  title="ટેસ્ટિંગ માટે ડેમો મોડ ખોલો"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isGu ? 'ડેમો મોડ' : 'Try Demo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#346739] hover:bg-[#28522c] rounded-lg shadow-xs transition-all whitespace-nowrap"
                >
                  {isGu ? 'ઇન્સ્ટ્રક્ટર પ્રવેશ' : 'Sign In'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#f8fafc] border-b border-slate-200 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Editorial Label (No pills) */}
            <div className="text-xs font-bold uppercase tracking-wider text-[#346739]">
              {isGu
                ? 'ગુજરાત રાજ્ય ઔદ્યોગિક તાલીમ સંસ્થા (ITI) સુપરવાઇઝર ઇન્સ્ટ્રક્ટર પોર્ટલ'
                : 'Government of Gujarat ITI Supervisor Instructor Productivity Suite'}
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {isGu ? (
                <>
                  તાલીમાર્થી હાજરી, ગેરહાજરી નોટિસ અને સત્તાવાર પત્રક{' '}
                  <span className="text-[#346739] underline decoration-[#9fcb98] decoration-4 underline-offset-4">
                    સંપૂર્ણ ઓટોમેશન પોર્ટલ
                  </span>
                </>
              ) : (
                <>
                  Complete ITI Trainee Attendance, Warning Notices &{' '}
                  <span className="text-[#346739] underline decoration-[#9fcb98] decoration-4 underline-offset-4">
                    Official Dispatch Automation
                  </span>
                </>
              )}
            </h1>

            {/* Sub-text explanation */}
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {isGu
                ? 'ગુજરાતના તમામ ITI ઇન્સ્ટ્રક્ટરો માટે વિશેષ વિકસિત: તાલીમાર્થીઓની માસિક અને પ્રગતિશીલ હાજરીનું DGT ૮૦% નિયમ મુજબ ટ્રેકિંગ, વાલીઓને જાવક નોટિસ, આચાર્યશ્રી અહેવાલ, સંસ્થા લેટરહેડ સ્ટુડિયો અને કસ્ટમ ટેબલ પત્રકો ૧-ક્લિકમાં A4 પ્રિન્ટ અને PDF માં મેળવો.'
                : 'Engineered specifically for Gujarat ITI Instructors & Principals. Track monthly and progressive attendance under DGT 80% guidelines, auto-generate official Gujarati parent warning letters, create custom multi-student forwarding tables, and manage legal outward dispatch registers.'}
            </p>

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onNavigateToTab && onNavigateToTab('attendance')}
                  className="px-6 py-3.5 bg-[#346739] hover:bg-[#28522c] text-[#f2edc2] font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <span>{isGu ? 'કન્સોલ પર પાછા ફરો' : 'Return to Portal Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToAuth('login')}
                    className="px-6 py-3.5 bg-[#346739] hover:bg-[#28522c] text-[#f2edc2] font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isGu ? 'ઇન્સ્ટ્રક્ટર લોગિન કરો' : 'Instructor Sign In'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToAuth('register')}
                    className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-2xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#346739]" />
                    <span>{isGu ? 'નવું એકાઉન્ટ બનાવો (Register)' : 'Create New Account'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onLaunchDemo}
                    className="px-5 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-sm rounded-xl border border-amber-300 shadow-2xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{isGu ? 'લાઇવ ડેમો જુઓ (Live Demo)' : 'Try Live Demo Sandbox'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Logged in indicator banner */}
            {isAuthenticated && currentInstructorName && (
              <div className="pt-2 text-xs text-slate-500 font-medium">
                {isGu ? 'સક્રિય એકાઉન્ટ: ' : 'Active Account: '}
                <strong className="text-slate-800">{currentInstructorName}</strong>
                {currentInstructorTrade && ` (${currentInstructorTrade})`}
              </div>
            )}

            {/* Quick Proof Strip (No pills - clean unboxed metrics) */}
            <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">DGT 80%</div>
                <div className="text-xs text-slate-500">
                  {isGu ? 'હાજરી નિયમ ઓટો-વિશ્લેષણ' : 'Attendance Rule Logic'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">A4 Ready</div>
                <div className="text-xs text-slate-500">
                  {isGu ? 'સત્તાવાર સરકારી ફોર્મેટ્સ' : 'Official Print Layouts'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">1-Click PDF</div>
                <div className="text-xs text-slate-500">
                  {isGu ? 'બેચ નોટિસ અને અહેવાલ' : 'Batch Letter Export'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">100% Gujarati</div>
                <div className="text-xs text-slate-500">
                  {isGu ? 'ફોનેટિક ટાઇપિંગ કમ્પેનિયન' : 'Phonetic IME Companion'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CATEGORIZED FEATURE SECTIONS (Card Views)                               */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 1: ACADEMIC HIERARCHY & TRAINEE RECORDS                         */}
        {/* ----------------------------------------------------------------------- */}
        <section id="academic" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wide">
                {isGu ? 'વિભાગ ૧ • શૈક્ષણિક માળખું' : 'Section 1 • Academic Hierarchy'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isGu
                  ? 'શૈક્ષણિક માળખું અને તાલીમાર્થી ડિરેક્ટરી સંચાલન'
                  : 'Academic Hierarchy & Trainee Records Directory'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {isGu
                ? 'ટ્રેડ, બેચ અને યુનિટ (Unit A/B/C) નું સચોટ વિભાજન અને Excel/CSV વડે સેકન્ડોમાં તાલીમાર્થીઓનો ડેટા ઈમ્પોર્ટ કરો.'
                : 'Multi-trade, multi-batch, and unit isolation with 1-click Excel student roster import and full contact details.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#346739] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'ટ્રેડ, બેચ અને યુનિટ માળખું' : 'Trade, Batch & Unit Hierarchy'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'ઇન્સ્ટ્રક્ટર પોતાના હસ્તકના તમામ ટ્રેડ (દા.ત. કોપા, ઇલેક્ટ્રિશિયન), શૈક્ષણિક વર્ષ ૨૦૨૫-૨૦૨૬ અને યુનિટ (Unit A, B, C) અલગથી મેનેજ કરી શકે છે. દરેક વિદ્યાર્થી ચોક્કસ યુનિટ સાથે જોડાય છે.'
                  : 'Structured academic tree mapping each trainee strictly to an instructor trade, batch year, and designated Unit (Unit A, B, C) ensuring institutional record compliance.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#346739]">
                {isGu ? '✓ યુનિટ વાઈઝ ફિલ્ટરિંગ અને રિપોર્ટિંગ' : '✓ Unit-wise filtering and reporting'}
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'Excel & CSV સિંગલ-ક્લિક ઈમ્પોર્ટ' : 'Excel & CSV Instant Import'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'કચેરીમાંથી મળેલ તાલીમાર્થીઓની એક્સેલ શીટ સીધી પોર્ટલમાં અપલોડ કરો. ગુજરાતી અને અંગ્રેજી નામ, રોલ નંબર, એડમિશન નંબર અને સંપર્ક નંબર આપોઆપ ડિરેક્ટરીમાં ગોઠવાઈ જાય છે.'
                  : 'Bulk upload student lists from Excel/CSV files with automatic Gujarati Unicode name handling, mobile verification, and instant conflict detection.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-blue-700">
                {isGu ? '✓ કોઈ મેન્યુઅલ ડેટા એન્ટ્રી કરવાની જરૂર નથી' : '✓ Zero repetitive manual data entry'}
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'વાલી અને સરનામા ડિરેક્ટરી' : 'Parent & Address Directory'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'વિદ્યાર્થીના પિતા/વાલીનું પૂરું નામ, મોબાઈલ નંબર, ગામ, તાલુકો, જિલ્લો અને પિનકોડ સહિતનું સરનામું સચવાઈ રહે છે જેથી ગેરહાજરી પત્ર વાલીને મોકલતી વખતે સરનામું આપોઆપ આવી જાય.'
                  : 'Complete directory keeping student father/guardian names, parent phone numbers, village, taluka, and postal addresses ready for automated letter dispatch.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-indigo-700">
                {isGu ? '✓ પત્રકમાં સીધું સરનામું મર્જ થાય છે' : '✓ Direct merge into mailing addresses'}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 2: SMART ATTENDANCE TRACKER & PROGRESSIVE RULES                  */}
        {/* ----------------------------------------------------------------------- */}
        <section id="attendance" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wide">
                {isGu ? 'વિભાગ ૨ • સ્માર્ટ હાજરી ટ્રેકિંગ' : 'Section 2 • Smart Attendance Tracking'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isGu
                  ? 'DGT ૮૦% નિયમ અને પ્રગતિશીલ હાજરી વિશ્લેષણ'
                  : 'DGT 80% Rule & Progressive Cumulative Attendance'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {isGu
                ? 'માસિક હાજરી સાથે સંચિત પ્રગતિશીલ હાજરીનું આપોઆપ ગણિત, જેથી નિર્દોષ વિદ્યાર્થીઓને ખોટી નોટિસ ન જાય.'
                : 'Intelligent progressive attendance analysis distinguishing safe students from those requiring formal warning notices.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'DGT ૮૦% હાજરી નિયમ અનુપાલન' : 'DGT 80% Attendance Rule'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'કુલ કામકાજના દિવસો અને હાજર દિવસો દાખલ કરતાં જ હાજરીની ટકાવારી ગણાય છે. ૮૦% થી ઓછી હાજરી વાળા તાલીમાર્થીઓ આપોઆપ નોટિસ પાત્ર તરીકે ફ્લેગ થઈ જાય છે.'
                  : 'Instant calculation of monthly attendance percentage. Trainees falling below the mandatory DGT 80% threshold are immediately highlighted for notice action.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-amber-800">
                {isGu ? '✓ પરીક્ષા પાત્રતાનું પૂર્વ-નિરીક્ષણ' : '✓ Exam eligibility pre-monitoring'}
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'સંચિત પ્રગતિશીલ હાજરી નિયમ' : 'Progressive Cumulative Intelligence'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'જો ચાલુ માસમાં કોઈ કારણસર હાજરી <૮૦% થઈ હોય પરંતુ સરેરાશ પ્રગતિશીલ હાજરી ≥૮૦% હોય, તો પોર્ટલ તેને "પ્રગતિશીલ સુરક્ષિત" ગણી બિનજરૂરી નોટિસથી મુક્ત રાખે છે.'
                  : 'Protects students whose current month attendance is low but whose overall cumulative average across recorded months remains >= 80%, preventing wrongful warnings.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-sky-800">
                {isGu ? '✓ નિયમાનુસાર વાજબી અને પારદર્શક' : '✓ Fair and statistically sound warnings'}
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'સતત ગેરહાજરી મોનિટરિંગ' : 'Continuous Absence Detection'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'વગર પરવાનગીએ સતત ગેરહાજર રહેતા તાલીમાર્થીઓની શરૂઆતની તારીખ નોંધાય છે. સતત ગેરહાજર દિવસોની ગણતરી સાથે વાલીને રૂબરૂ બોલાવવા માટે તાકીદ પત્ર જનરેટ થાય છે.'
                  : 'Tracks official unapproved leave start dates, calculates consecutive absent days, and auto-generates stern parent summons notices for continuous defaulters.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-rose-800">
                {isGu ? '✓ નામ કમી કાર્યવાહી પૂર્વે કાયદેસર નોટિસ' : '✓ Legal due-process before dismissal'}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 3: OFFICIAL LETTER TEMPLATE STUDIO & TINYMCE                    */}
        {/* ----------------------------------------------------------------------- */}
        <section id="templates" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wide">
                {isGu ? 'વિભાગ ૩ • ટેમ્પલેટ સ્ટુડિયો' : 'Section 3 • Letter Template Studio'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isGu
                  ? 'સત્તાવાર પત્ર ટેમ્પલેટ સ્ટુડિયો અને વર્ડ એડિટર'
                  : 'Official Letterhead & Word-Style Template Studio'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {isGu
                ? 'Microsoft Word જેવો TinyMCE રિચ-ટેક્સ્ટ એડિટર, તૈયાર સરકારી ડ્રાફ્ટ્સ, અને સંસ્થા લેટરહેડ બિલ્ડર.'
                : 'Full-featured TinyMCE rich-text editor with Gujarat fonts, official warning starters, and letterhead banner customization.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'વર્ડ-સ્ટાઈલ TinyMCE એડિટર' : 'Word-Style Rich-Text Canvas'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'ટેબલ, બોલ્ડ, ઈટાલિક, કલર, બુલેટ્સ, લાઇન હાઇટ અને ફોન્ટ્સ સાથે પત્ર તૈયાર કરો. કાગળ પર પ્રિન્ટ કરતાં પહેલાં જેવું દેખાય તેવું જ A4 શીટ પ્રિવ્યુ મળે છે (WYSIWYG).'
                  : 'Familiar Microsoft Word-style TinyMCE canvas with tables, alignment, font scaling, and pixel-perfect WYSIWYG A4 print preview.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-blue-700">
                {isGu ? '✓ ૧૦૦% ગુજરાતી યુનિકોડ સપોર્ટ' : '✓ Full Gujarati Unicode typography'}
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#346739] flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'સત્તાવાર નોટિસ પ્રીસેટ્સ' : 'Official Notice Starter Presets'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'પ્રથમ ચેતવણી નોટિસ, દ્વિતીય કડક ચેતવણી (વાલી રૂબરૂ મુલાકાત), આખરી નામ કમી ચેતવણી, વાલી મિટિંગ (PTM) અને આચાર્યશ્રી અહેવાલના તૈયાર ડ્રાફ્ટ્સ ઉપલબ્ધ છે.'
                  : 'Includes pre-built Gujarat ITI warning templates (1st Warning, 2nd Parent Summons, Final Struck-off Notice, and PTM Invitation).'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#346739]">
                {isGu ? '✓ તૈયાર કાનૂની ભાષા અને વિષય' : '✓ Department-ready legal draft wording'}
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'સંસ્થા લેટરહેડ સ્ટુડિયો' : 'Custom Letterhead Banner Studio'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'સંસ્થાનો લોગો અપલોડ કરો, જાવક ક્રમાંક ફોર્મેટ અને સરનામું સેટ કરો. જો પ્રી-પ્રિન્ટેડ લેટરહેડ કાગળ પર છાપવું હોય તો ૧-ક્લિકમાં લેટરહેડ છુપાવી શકાય છે.'
                  : 'Upload your ITI logo and emblem, customize letterhead banners, or toggle pre-printed stationery mode to avoid printing duplicate headers.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-purple-700">
                {isGu ? '✓ સાદા અને પ્રી-પ્રિન્ટેડ કાગળ બંને માટે અનુકૂળ' : '✓ Supports plain and pre-printed paper'}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 4: UNIFIED REPORT & NOTICE GENERATOR                             */}
        {/* ----------------------------------------------------------------------- */}
        <section id="reports" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wide">
                {isGu ? 'વિભાગ ૪ • રિપોર્ટ જનરેટર' : 'Section 4 • Unified Report & Notice Generator'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isGu
                  ? 'યુનિફાઇડ રિપોર્ટ અને નોટિસ જનરેટર (A4 પ્રિન્ટ અને PDF)'
                  : 'Unified Report & Notice Generator (A4 Print & PDF)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {isGu
                ? 'વાલી દીઠ અલગ-અલગ નોટિસો છાપો અથવા તમામ વિદ્યાર્થીઓનું એક જ પાનામાં સંયુક્ત સરનામા પત્રક જનરેટ કરો.'
                : 'Batch print individual parent warning letters or generate consolidated multi-student forwarding tables on a single page.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#346739] flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'બેચ વાલી નોટિસ જનરેશન' : 'Batch Parent Notice Print'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'પસંદ કરેલ તમામ વિદ્યાર્થીઓ માટે દરેક દીઠ ૧ અલગ A4 પાનું જનરેટ થાય છે, જેમાં વિદ્યાર્થીનું નામ, રોલ નં, વાલીનું નામ, સરનામું અને ચોક્કસ હાજરી સારાંશ સામેલ હોય છે.'
                  : 'Generates one clean A4 page per student with student data, roll number, parent mobile, and individualized attendance figures.'}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Table2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'સંયુક્ત સિંગલ-પેજ ફોરવર્ડિંગ' : 'Consolidated Single-Page Table'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'કચેરી અથવા આચાર્યશ્રીને જાણ કરવા માટે તમામ વિદ્યાર્થીઓની વિગત અલગ-અલગ પાનાને બદલે એક જ પાનાના સુઘડ ટેબલમાં પ્રિન્ટ કરી શકાય છે.'
                  : 'Packs multiple students into a clean tabular layout on a single page for forwarding letters, administrative circulars, and office records.'}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'કોલમ્સ પસંદગી કસ્ટમાઇઝર' : 'Column Customizer'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'ટેબલમાં કઈ કઈ કોલમ્સ દર્શાવવી (ક્રમ, રોલ નં, નામ, વાલી, સરનામું, મોબાઈલ, હાજરી %, ગેરહાજરી તારીખ, નોંધ) તે ૧-ક્લિકમાં પસંદ કરો.'
                  : 'Interactively select which columns appear in multi-student tables (Roll No, Trainee Name, Parent Name, Full Address, Attendance %, Remarks).'}
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'હાઈ-ક્વોલિટી A4 PDF એક્સપોર્ટ' : 'Vector PDF & Print Preview'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'ચોક્કસ પેજ બ્રેક, સચોટ માર્જિન્સ અને અધિકૃત સરકારી ફોન્ટ્સ સાથે તૈયાર A4 PDF ડાઉનલોડ કરો અથવા સીધી પ્રિન્ટર પર પ્રિન્ટ કાઢો.'
                  : 'True-to-life A4 PDF export with perfect page breaks, vector typography, and direct browser print preview.'}
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 5: CUSTOM TABLE MERGE TAG BUILDER & DYNAMIC FIELDS              */}
        {/* ----------------------------------------------------------------------- */}
        <section id="mergetags" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wide">
                {isGu ? 'વિભાગ ૫ • કસ્ટમ ટેબલ અને મર્જ ટેગ્સ' : 'Section 5 • Custom Tables & Merge Tag Engine'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isGu
                  ? 'કસ્ટમ ટેબલ મર્જ ટેગ બિલ્ડર અને ડ્રેગ-એન્ડ-ડ્રોપ પેલેટ'
                  : 'Custom Table Merge Tag Builder & Drag-and-Drop Palette'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {isGu
                ? 'ઇન્સ્ટ્રક્ટર પોતાની જરૂરિયાત મુજબના કોલમવાળા ટેબલ બનાવી શકે છે અને તેમાં હાથથી લખવા ખાલી ખાના (Remarks) રાખી શકે છે.'
                : 'Instructors can create reusable multi-student table tags with formula columns and blank write-in rows for physical paper remarks.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#346739] flex items-center justify-center">
                <Table2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'કસ્ટમ ટેબલ મર્જ ટેગ મેકર' : 'Custom Table Tag Studio'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'કોઈપણ નામવાળા કોલમ ઉમેરો (દા.ત. ક્રમ, તાલીમાર્થી નામ, સરનામું, નોંધ/સહી). દરેક રોમાં કયો મર્જ ટેગ લાવવો તે પસંદ કરો. આ આખું ટેબલ એક મર્જ ટેગ બની જશે જેને કોઈપણ પત્રમાં વાપરી શકાય છે.'
                  : 'Define custom column names, map merge field values for rows, and save as a reusable merge tag (e.g. {{Custom_Table:My_Table}}) that expands dynamically for all selected students.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#346739]">
                {isGu ? '✓ કોઈપણ પત્રમાં વારંવાર વાપરો' : '✓ Reusable across any letter or circular'}
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'કાગળ પર હાથથી લખવા માટે ખાલી ખાના' : 'Blank Rows for Handwriting'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'પ્રિન્ટ કર્યા પછી કાગળ પર પેનથી રીમાર્કસ, નોંધ અથવા વાલીની સહી લેવા માટે કોલમને "ખાલી રાખો" (Leave Blank) સેટ કરી શકાય છે. પૂરતી જગ્યા માટે રો હાઇટ (28px - 60px) પણ એડજસ્ટ થાય છે.'
                  : 'Toggle "Leave Blank for Handwriting" on any column (such as Remarks or Parent Signatures) with configurable row heights for effortless pen notes after printing.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-amber-800">
                {isGu ? '✓ નોંધ અને વાલી સહી માટે અનુકૂળ' : '✓ Ideal for physical signatures & remarks'}
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <GripVertical className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'ડ્રેગ-એન્ડ-ડ્રોપ મર્જ ટેગ પેલેટ' : 'Drag & Drop Merge Palette'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'વિદ્યાર્થી, હાજરી, સરનામું, જાવક ક્રમાંક અને સંસ્થા સંબંધિત ૨૫ થી વધુ મર્જ ટેગ્સ ઉપલબ્ધ છે. માઉસથી ખેંચીને પત્રમાં ગમે ત્યાં મૂકો અથવા ક્લિક કરીને કર્સર આગળ ઉમેરો.'
                  : 'Over 25 live merge tags categorized into Trainee, Attendance, Address, Institute, and Dispatch. Drag directly onto the document canvas or click to insert.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-indigo-700">
                {isGu ? '✓ ગુજરાતી અંકો (૧, ૨, ૩) નો સપોર્ટ' : '✓ Gujarati numeral (૧, ૨, ૩) support'}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 6: INWARD & OUTWARD DISPATCH REGISTER                           */}
        {/* ----------------------------------------------------------------------- */}
        <section id="dispatch" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wide">
                {isGu ? 'વિભાગ ૬ • જાવક અને આવક રજીસ્ટર' : 'Section 6 • Inward & Outward Register'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isGu
                  ? 'કાયદેસર જાવક અને આવક રજીસ્ટ્રી (Dispatch Log Book)'
                  : 'Official Outward & Inward Dispatch Registry'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {isGu
                ? 'સરકારી ઓડિટ અને કાનૂની પુરાવા માટે રવાના કરેલ તમામ નોટિસો અને રિપોર્ટ્સનું ઓટોમેટિક રજીસ્ટ્રેશન.'
                : 'Automated legal logbook recording all dispatched parent notices and inward office submissions with outward numbers and dates.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <SendHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'ઓટોમેટિક જાવક નંબર જનરેશન' : 'Automated Outward Numbering'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'સંસ્થાના જાવક પ્રીફિક્સ અને તાલીમાર્થીના રોલ નંબર સાથે કાયદેસર જાવક ક્રમાંક (દા.ત. ઔતાસં/તલમ/૨૦૨૬/૧૫) પત્રમાં છપાય છે અને રજીસ્ટરમાં નોંધાય છે.'
                  : 'Auto-generates official outward reference codes based on institute prefixes and student roll numbers, maintaining a permanent audit trail.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-blue-700">
                {isGu ? '✓ સરકારી ઓડિટ માટે માન્ય રેકોર્ડ' : '✓ Audit-ready dispatch proof'}
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#346739] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'રવાનગી માધ્યમ અને સ્થિતિ ટ્રેકિંગ' : 'Dispatch Mode & Delivery Status'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'નોટિસ સાદી ટપાલ, રજીસ્ટર્ડ પોસ્ટ AD અથવા રૂબરૂ આપવામાં આવી છે તે મોડ નોંધી શકાય છે. પ્રિન્ટેડ, ડિસ્પેચ્ડ કે પહોંચ મળી જેવી સ્થિતિ અપડેટ થાય છે.'
                  : 'Track delivery methods (Simple Post, Registered AD, In-Person Delivery) and update delivery milestones (Drafted, Printed, Dispatched, Delivered).'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#346739]">
                {isGu ? '✓ સ્પીડ પોસ્ટ ટ્રેકિંગ નંબર સાચવો' : '✓ Tracking number integration'}
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'આચાર્યશ્રી અહેવાલ આવક નોંધણી' : 'Inward Filing for Principal Reports'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'સમગ્ર ટ્રેડનો સંયુક્ત ગેરહાજરી અહેવાલ કચેરીમાં સબમિટ કરતી વખતે કચેરી ફાઇલિંગ સારૂ અલગ આવક રજીસ્ટર નંબર સાથે રેકોર્ડ સચવાય છે.'
                  : 'Provides separate inward log classification when submitting consolidated attendance reports to ITI Principal offices for departmental action.'}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-indigo-700">
                {isGu ? '✓ કચેરી ફાઇલિંગમાં સરળતા' : '✓ Seamless office filing'}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 7: MULTI-LANGUAGE, PHONETIC TYPING & SECURITY                   */}
        {/* ----------------------------------------------------------------------- */}
        <section id="security" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wide">
                {isGu ? 'વિભાગ ૭ • ભાષા અને સુરક્ષા' : 'Section 7 • Language & Security Governance'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isGu
                  ? 'બહુભાષીય સપોર્ટ, ફોનેટિક ટાઈપિંગ અને સુરક્ષિત વહીવટ'
                  : 'Multi-Language, Phonetic IME Typing & Security Governance'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              {isGu
                ? 'કોઈપણ કીબોર્ડ પરથી સરળતાથી ગુજરાતીમાં ટાઈપ કરો અને સુપર એડમિન વેરિફિકેશન સાથે સુરક્ષિત રહો.'
                : 'Built-in phonetic typing companion, trilingual UI, Super Admin governance, and 1-year renewable validity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#346739] flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'ત્રિભાષી પોર્ટલ ઈન્ટરફેસ' : 'Trilingual Interface'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'સમગ્ર પોર્ટલ અંગ્રેજી, ગુજરાતી અને હિન્દી ભાષામાં ઉપલબ્ધ છે. ૧-ક્લિકમાં ભાષા બદલીને કામ કરી શકાય છે.'
                  : 'Full UI localized in Gujarati, English, and Hindi. Switch effortlessly between languages with a single click.'}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'બિલ્ટ-ઇન ફોનેટિક ગુજરાતી IME' : 'Phonetic Gujarati IME'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'કોઈ વધારાના સોફ્ટવેર વગર સામાન્ય કીબોર્ડ પરથી અંગ્રેજી અક્ષરો લખતાં જ ગુજરાતી થઈ જાય છે (દા.ત. "patel" લખતા "પટેલ").'
                  : 'Integrated transliteration assistant allowing fluid Gujarati typing from any standard QWERTY English keyboard.'}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'સુપર એડમિન વેરિફિકેશન' : 'Super Admin Verification'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'નવા ઇન્સ્ટ્રક્ટરનું રજીસ્ટ્રેશન સુપર એડમિન દ્વારા ચકાસીને જ મંજૂર કરાય છે. વાર્ષિક ₹૪૯ નોમિનેલ ચાર્જ સાથે ૧ વર્ષની માન્યતા મળે છે.'
                  : 'Every instructor account is verified and approved by the Super Admin, maintaining clean tenant isolation and data security (₹49 annual fee).'}
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isGu ? 'ફ્રી લાઇવ ડેમો મોડ' : 'Interactive Guest Demo'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'કોઈપણ ચુકવણી કે રજીસ્ટ્રેશન કરતાં પહેલાં પોર્ટલની તમામ સુવિધાઓ ડેમો વિદ્યાર્થીઓ સાથે લાઈવ ચલાવીને અનુભવ કરી શકાય છે.'
                  : 'Test drive all features including template editing, A4 PDF preview, and attendance tracking risk-free in guest demo mode.'}
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* 4. WEBSITE SPECIFICATIONS & TECHNICAL DETAILS                           */}
        {/* ----------------------------------------------------------------------- */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="text-xs font-bold text-[#f2edc2] uppercase tracking-wider">
                {isGu ? 'વેબસાઇટ વિગતો અને તકનીકી ધોરણો' : 'Website Specifications & Technical Standards'}
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {isGu
                  ? 'ગુજરાત ITI હાજરી અને નોટિસ મેનેજમેન્ટ સિસ્ટમ'
                  : 'Gujarat ITI Trainee Attendance & Notice Portal'}
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Version 2026 • Production Web Application
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs leading-relaxed text-slate-300">
            <div className="space-y-1.5">
              <div className="font-bold text-white text-sm">
                {isGu ? 'સૉફ્ટવેર હેતુ' : 'System Purpose'}
              </div>
              <p>
                {isGu
                  ? 'ગુજરાતની સરકારી અને ગ્રાન્ટ-ઇન-એઇડ ITI સંસ્થાઓના સુપરવાઇઝર ઇન્સ્ટ્રક્ટરો માટે તાલીમાર્થી હાજરી, ગેરહાજરી પત્રકો અને સત્તાવાર કચેરી રેકોર્ડ સંચાલન.'
                  : 'Automating student attendance compliance, parent warning dispatch, and official memorandum filing for Gujarat ITI instructors.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-white text-sm">
                {isGu ? 'પ્રિન્ટિંગ ધોરણ' : 'Print Standard'}
              </div>
              <p>
                {isGu
                  ? 'ISO A4 (210mm x 297mm) સ્ટાન્ડર્ડ કાગળ માપ, સચોટ માર્જિન, સત્તાવાર લેટરહેડ ફોર્મેટ અને ઝીરો-ડિસ્ટોર્શન વેક્ટર PDF.'
                  : 'Standard ISO A4 formatting with exact margins for official Government ITI printers, monochrome and color ink saving modes.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-white text-sm">
                {isGu ? 'ડેટા સુરક્ષા' : 'Data Architecture'}
              </div>
              <p>
                {isGu
                  ? 'Google Cloud Firestore ડેટાબેઝ વડે દરેક ઇન્સ્ટ્રક્ટરનો ડેટા સંપૂર્ણ સુરક્ષિત અને અલગ સચવાય છે (Tenant Data Isolation).'
                  : 'Secure cloud synchronization via Google Cloud Firestore with strict instructor-scoped tenancy and encrypted storage.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-white text-sm">
                {isGu ? 'બ્રાઉઝર સુસંગતતા' : 'Compatibility'}
              </div>
              <p>
                {isGu
                  ? 'Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari સહિત તમામ ડેસ્કટોપ, લેપટોપ અને ટેબ્લેટ પર સરળતાથી ચાલે છે.'
                  : 'Fully responsive for Desktop, Laptop, and Tablet browsers with mobile touch target compliance.'}
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* 5. ADMIN INFORMATION & TECHNICAL SUPPORT DESK                           */}
        {/* ----------------------------------------------------------------------- */}
        <section id="contact" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-xs font-bold text-[#346739] uppercase tracking-wider">
                {isGu ? 'સંપર્ક અને વહીવટી માહિતી' : 'Contact & Administrative Desk'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {isGu ? 'સુપર એડમિન અને તકનીકી સહાયતા કેન્દ્ર' : 'Super Admin & Technical Support Center'}
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              {isGu ? 'સોમવાર થી શનિવાર • સવારે ૯:૦૦ થી સાંજે ૬:૦૦' : 'Mon - Sat • 9:00 AM - 6:00 PM IST'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Profile Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#346739] font-black text-base flex items-center justify-center border border-emerald-300">
                  TS
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isGu ? 'તેજસ સુથાર' : 'Tejas Suthar'}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {isGu ? 'સુપર એડમિનિસ્ટ્રેટર & પોર્ટલ ડેવલપર' : 'Super Administrator & Portal Architect'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isGu
                  ? 'નવા એકાઉન્ટ વેરિફિકેશન, પાસવર્ડ રીસેટ, વાર્ષિક રિન્યુઅલ અથવા પોર્ટલ ટેકનિકલ સમસ્યાઓ માટે સીધો સંપર્ક કરી શકો છો.'
                  : 'Contact directly for new instructor account verification, password resets, annual renewal, or institutional onboarding.'}
              </p>
            </div>

            {/* Email Support Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">
                  {isGu ? 'સત્તાવાર સપોર્ટ ઈમેલ' : 'Official Support Email'}
                </div>
                <a
                  href="mailto:tejassuthar21696@gmail.com"
                  className="text-sm font-bold text-blue-700 hover:underline break-all"
                >
                  tejassuthar21696@gmail.com
                </a>
              </div>
              <p className="text-xs text-slate-500">
                {isGu
                  ? 'ચુકવણી સ્ક્રીનશોટ અથવા ટેકનિકલ પ્રશ્નો ઈમેલ પર મોકલી શકો છો. ૨૪ કલાકમાં જવાબ મળશે.'
                  : 'Send payment screenshots, approval requests, or support inquiries. Responses within 24 hours.'}
              </p>
            </div>

            {/* Online Support & Quick Response Desk */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#346739] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">
                  {isGu ? 'ઓનલાઇન સહાય અને પ્રતિસાદ' : 'Online Assistance & Turnaround'}
                </div>
                <div className="text-sm font-black text-slate-900">
                  {isGu ? 'સવારે ૯:૦૦ થી સાંજે ૬:૦૦' : '9:00 AM - 6:00 PM IST'}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {isGu
                  ? 'ઈમેલ દ્વારા મોકલેલ ચુકવણી સ્ક્રીનશોટ અને વેરિફિકેશન વિનંતીઓનું ત્વરિત નિરાકરણ કરવામાં આવે છે.'
                  : 'Fast online verification, query resolution, and account approvals processed daily via Super Admin desk.'}
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* 6. CALL TO ACTION STRIP                                                 */}
        {/* ----------------------------------------------------------------------- */}
        <section className="bg-gradient-to-r from-[#346739] via-[#2d5931] to-[#1e3c21] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isGu
              ? 'આજે જ આપના ટ્રેડ માટે ડિજિટલ હાજરી અને નોટિસ સિસ્ટમ શરૂ કરો'
              : 'Start Automating Attendance & Warning Notices for Your Trade Today'}
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            {isGu
              ? 'મેન્યુઅલ કાગળકામનો અંત લાવો. માત્ર ₹૪૯ વાર્ષિક નોમિનેલ ચાર્જ સાથે ૧ વર્ષ સુધી અમર્યાદિત નોટિસ, પત્રકો અને આવક-જાવક રેકોર્ડ મેનેજ કરો.'
              : 'End repetitive paperwork. Generate DGT-compliant notices, print custom student tables, and track dispatches seamlessly for just ₹49/year.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigateToTab && onNavigateToTab('attendance')}
                className="px-6 py-3 bg-[#f2edc2] hover:bg-white text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                {isGu ? 'પોર્ટલ કન્સોલમાં પાછા જાઓ' : 'Return to Portal Console'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateToAuth('register')}
                  className="px-6 py-3 bg-[#f2edc2] hover:bg-white text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isGu ? 'નવું ખાતું નોંધણી કરો' : 'Register Instructor Account'}
                </button>
                <button
                  type="button"
                  onClick={onLaunchDemo}
                  className="px-5 py-3 bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  {isGu ? 'ડેમો મોડ અજમાવો' : 'Try Demo Mode Risk-Free'}
                </button>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 7. OFFICIAL QUIET FOOTER                                                  */}
      {/* ========================================================================= */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Purpose */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#346739] text-[#f2edc2] flex items-center justify-center font-black text-xs">
                  ITI
                </div>
                <span className="font-bold text-white text-sm">
                  {isGu ? 'ગુજરાત ITI પોર્ટલ' : 'Gujarat ITI Portal'}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isGu
                  ? 'ઔદ્યોગિક તાલીમ સંસ્થા (ITI) સુપરવાઇઝર ઇન્સ્ટ્રક્ટરો માટે વિદ્યાર્થી હાજરી, વાલી નોટિસ અને સત્તાવાર પત્રક પ્રક્રિયાનું ડિજિટલ પ્લેટફોર્મ.'
                  : 'An independent digital productivity suite designed for Gujarat ITI instructors to manage DGT compliance, notices, and letterheads.'}
              </p>
            </div>

            {/* Col 2: Feature Quick Links */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">
                {isGu ? 'સુવિધાઓ' : 'Platform Features'}
              </div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#academic" className="hover:text-white transition-colors">{isGu ? 'શૈક્ષણિક માળખું' : 'Academic Hierarchy'}</a></li>
                <li><a href="#attendance" className="hover:text-white transition-colors">{isGu ? 'સ્માર્ટ હાજરી ટ્રેકિંગ' : 'Smart Attendance'}</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">{isGu ? 'પત્ર ટેમ્પલેટ સ્ટુડિયો' : 'Template Studio'}</a></li>
                <li><a href="#reports" className="hover:text-white transition-colors">{isGu ? 'રિપોર્ટ & નોટિસ જનરેટર' : 'Report Generator'}</a></li>
                <li><a href="#mergetags" className="hover:text-white transition-colors">{isGu ? 'કસ્ટમ ટેબલ મર્જ ટેગ્સ' : 'Custom Table Tags'}</a></li>
              </ul>
            </div>

            {/* Col 3: Legal & Standards */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">
                {isGu ? 'નિયમો અને ધોરણો' : 'Standards & Terms'}
              </div>
              <ul className="space-y-1.5 text-xs">
                <li><span>{isGu ? 'DGT ૮૦% હાજરી નિયમ' : 'DGT 80% Attendance Rule'}</span></li>
                <li><span>{isGu ? 'A4 ISO સ્ટાન્ડર્ડ પ્રિન્ટિંગ' : 'A4 ISO Printing Standards'}</span></li>
                <li><span>{isGu ? '૧-વર્ષ માન્યતા નીતિ (₹૪૯ ફી)' : '1-Year Validity Policy (₹49 Fee)'}</span></li>
                <li><span>{isGu ? 'કાયદેસર જાવક રજીસ્ટ્રી' : 'Official Outward Registry'}</span></li>
                <li><span>{isGu ? 'સંપૂર્ણ ડેટા ગોપનીયતા' : 'Tenant Data Privacy'}</span></li>
              </ul>
            </div>

            {/* Col 4: Admin Support & Top Anchor */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">
                {isGu ? 'એડમિન સંપર્ક' : 'Admin & Support'}
              </div>
              <div className="space-y-1 text-xs">
                <div>{isGu ? 'સુપર એડમિન: ' : 'Admin: '} <strong className="text-white">Tejas Suthar</strong></div>
                <div className="break-all font-mono text-[11px] text-emerald-400">tejassuthar21696@gmail.com</div>
                <div className="text-slate-400 text-[11px]">{isGu ? 'ઓનલાઇન સહાય અને ચકાસણી' : 'Online Verification & Support'}</div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>{isGu ? 'ટોચ પર પાછા જાઓ' : 'Back to Top'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Gujarat ITI Trainee Attendance & Notice Portal. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>{isGu ? 'બિન-સરકારી શૈક્ષણિક સાધન' : 'Educational Productivity Tool for ITI Instructors'}</span>
              <span>•</span>
              <span>{isGu ? 'ગુજરાતી યુનિકોડ સુસંગત' : 'Gujarati Unicode Compliant'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
