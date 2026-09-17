import { useState } from 'react';
import { Instructor } from '../types';
import {
  FileText,
  Users,
  CalendarCheck2,
  SendHorizontal,
  ShieldCheck,
  Building,
  Printer,
  ClipboardList,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Layers,
  LogOut,
  Menu,
  X,
  Palette,
  User,
  AlertCircle,
} from 'lucide-react';
import ImeFloatWidget from './ImeFloatWidget';

export type ActiveTab =
  | 'hierarchy'
  | 'trainees'
  | 'templates'
  | 'report'
  | 'attendance'
  | 'principal-report'
  | 'dispatch'
  | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  instructor: Instructor;
  onOpenProfileModal: () => void;
  onOpenBatchUnitModal?: () => void;
  onLogout?: () => void;
  imeLanguage: 'Gujarati' | 'Hindi' | 'English';
  onImeLanguageChange: (lang: 'Gujarati' | 'Hindi' | 'English') => void;
  lowAttendanceCount: number;
  onOpenBatchModal: () => void;
  cloudSyncStatus?: 'connected' | 'syncing' | 'offline';
  onSyncCloud?: () => void;
}

export default function Header({
  activeTab,
  onTabChange,
  instructor,
  onOpenProfileModal,
  onOpenBatchUnitModal,
  onLogout,
  imeLanguage,
  onImeLanguageChange,
  lowAttendanceCount,
  onOpenBatchModal,
  cloudSyncStatus = 'connected',
  onSyncCloud,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileTabSelect = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  const isSuperAdmin = instructor.role === 'super_admin';

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden w-full max-w-full overflow-hidden">
        {/* Top Banner with Gov Logo & Tenant Identity */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-100 w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {/* Emblem Icon */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-xs shrink-0 ${
              isSuperAdmin
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 border border-slate-700'
                : 'bg-gradient-to-br from-[#346739] to-[#1b381e] text-[#f2edc2] border border-[#264e2b]'
            }`}>
              {isSuperAdmin ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : 'ITI'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
                <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
                  {isSuperAdmin ? (
                    <>
                      <span className="sm:hidden">DET Super Admin</span>
                      <span className="hidden sm:inline">રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી - સુપર એડમિન પોર્ટલ</span>
                    </>
                  ) : (
                    <>
                      <span className="sm:hidden">ITI Attendance</span>
                      <span className="hidden sm:inline">ITI Trainee Attendance & Irregularity Notice System</span>
                    </>
                  )}
                </h1>
                {isSuperAdmin ? (
                  <span className="hidden lg:inline-flex text-[11px] font-bold bg-slate-900 text-amber-400 border border-slate-800 px-2 py-0.5 rounded-full shrink-0">
                    Super Admin Console
                  </span>
                ) : (
                  <span className="hidden lg:inline-flex text-[11px] font-semibold bg-[#f2edc2] text-[#346739] border border-[#9fcb98] px-2 py-0.5 rounded-full shrink-0">
                    NCVT/GCVT
                  </span>
                )}
                {/* Color Hunt Palette Swatch Badge (Only for instructors) */}
                {!isSuperAdmin && (
                  <div
                    className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f2edc2]/40 border border-[#9fcb98] text-[10px] font-semibold text-[#346739] shrink-0"
                    title="Color Hunt Palette: #346739 (Forest) • #79AE6F (Sage) • #9FCB98 (Mint) • #F2EDC2 (Cream)"
                  >
                    <Palette className="w-3 h-3 text-[#346739] shrink-0" />
                    <div className="flex items-center -space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#346739] border border-white" title="#346739 Forest Green"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#79ae6f] border border-white" title="#79AE6F Sage Green"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9fcb98] border border-white" title="#9FCB98 Mint Green"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f2edc2] border border-slate-300" title="#F2EDC2 Warm Cream"></span>
                    </div>
                  </div>
                )}
                {/* Firestore Cloud Sync Badge */}
                <button
                  type="button"
                  onClick={onSyncCloud}
                  className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full cursor-pointer transition-colors shrink-0 ${
                    isSuperAdmin
                      ? 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
                      : 'bg-[#f2edc2]/70 text-[#264e2b] border border-[#9fcb98] hover:bg-[#f2edc2]'
                  }`}
                  title="Google Cloud Firestore Live Database Connected (Click to sync)"
                >
                  <Cloud className={`w-3 h-3 shrink-0 ${isSuperAdmin ? 'text-slate-700' : 'text-[#346739]'}`} />
                  <span className="hidden md:inline">Firestore</span>
                  {cloudSyncStatus === 'syncing' ? (
                    <RefreshCw className={`w-2.5 h-2.5 animate-spin shrink-0 ${isSuperAdmin ? 'text-slate-700' : 'text-[#346739]'}`} />
                  ) : (
                    <CheckCircle2 className={`w-2.5 h-2.5 shrink-0 ${isSuperAdmin ? 'text-emerald-600' : 'text-[#346739]'}`} />
                  )}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block">
                {isSuperAdmin
                  ? 'રાજ્ય સ્તરીય ITI સંચાલન • ઇન્સ્ટ્રક્ટર વેરિફિકેશન & મંજૂરી વ્યવસ્થા • સિસ્ટમ ઓડિટ'
                  : 'Regional Language (ગુજરાતી / हिन्दी) Notices • Word 2021 Engine • Batch PDF'}
              </p>
              <div className="sm:hidden text-[10px] text-slate-500 truncate leading-tight">
                {isSuperAdmin ? 'રાજ્ય વહીવટ • ગાંધીનગર (DET Gujarat)' : `${instructor.trade} • ${instructor.unit || 'Unit A'}`}
              </div>
            </div>
          </div>

          {/* Right side controls: IME Widget, Batch/Unit, and Profile */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <ImeFloatWidget
              currentLanguage={imeLanguage}
              onLanguageChange={onImeLanguageChange}
            />

            {/* Batch & Unit Quick Manager Button - Desktop (Instructors Only) */}
            {!isSuperAdmin && onOpenBatchUnitModal && (
              <button
                onClick={onOpenBatchUnitModal}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#9fcb98] bg-[#f2edc2]/30 hover:bg-[#f2edc2] text-[#346739] transition-colors shadow-2xs min-h-[36px]"
                title="Add / Configure Batches and Units (A/B/C)"
              >
                <Layers className="w-3.5 h-3.5 text-[#346739]" />
                <span className="font-bold">{instructor.unit || 'Unit A'}</span>
                <span className="text-[10px] text-[#346739]/80 font-mono">({instructor.batch})</span>
              </button>
            )}

            {/* Batch Print Button (Instructors Only) */}
            {!isSuperAdmin && (
              <button
                onClick={onOpenBatchModal}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#79ae6f] hover:bg-[#669a5c] text-white shadow-xs transition-colors min-h-[34px] sm:min-h-[36px] shrink-0"
                title="Batch Export Multi-Page PDF"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Batch Print</span>
                {lowAttendanceCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#f2edc2] text-[#346739] rounded-full font-bold text-[10px]">
                    {lowAttendanceCount}
                  </span>
                )}
              </button>
            )}

            {/* Account Profile Button */}
            <button
              onClick={onOpenProfileModal}
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-2xs min-h-[34px] sm:min-h-[36px] shrink-0 ${
                isSuperAdmin
                  ? 'border-slate-800 bg-slate-900 text-white hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
              title={isSuperAdmin ? 'સુપર એડમિન પ્રોફાઇલ' : `આપનું ઇન્સ્ટ્રક્ટર પ્રોફાઇલ: ${instructor.name}`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${isSuperAdmin ? 'bg-amber-400 ring-2 ring-amber-400/30' : 'bg-emerald-500'}`}></div>
              <div className="text-left max-w-[55px] sm:max-w-[140px] truncate hidden sm:block">
                <div className="font-bold truncate flex items-center gap-1 text-[11px] sm:text-xs">
                  <span className="truncate">{instructor.name.split(' ')[0]}</span>
                  {instructor.email_verified && (
                    <CheckCircle2 className={`w-3 h-3 shrink-0 inline ${isSuperAdmin ? 'text-amber-400' : 'text-emerald-600'}`} title="Verified" />
                  )}
                </div>
                <div className={`text-[9px] sm:text-[10px] truncate hidden md:block ${isSuperAdmin ? 'text-slate-300' : 'text-slate-500'}`}>
                  {isSuperAdmin ? 'સુપર એડમિન • ગાંધીનગર' : `${instructor.trade} • ${instructor.unit}`}
                </div>
              </div>
              <User className={`w-3.5 h-3.5 shrink-0 ${isSuperAdmin ? 'text-amber-400' : 'text-slate-600'}`} />
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="hidden lg:flex p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors min-h-[36px] items-center justify-center shrink-0"
                title="Log Out (લોગ આઉટ કરો)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 min-h-[34px] sm:min-h-[36px] min-w-[34px] sm:min-w-[36px] flex items-center justify-center shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 hidden md:block">
          {isSuperAdmin ? (
            /* Super Admin Workspace Header - No Classroom Tabs */
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>સુપર એડમિનિસ્ટ્રેટર કંટ્રોલ સેન્ટર (Directorate Console)</span>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  ઇન્સ્ટ્રક્ટર એકાઉન્ટ મંજૂરી • એકાઉન્ટ વહીવટ • રાજ્યવ્યાપી આંકડાકીય મોનિટરિંગ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>માત્ર વહીવટી કાર્યક્ષેત્ર (Administrative Tasks Only)</span>
                </span>
              </div>
            </div>
          ) : (
            /* Standard Instructor Navigation Tabs - Strictly Instructors Only */
            <nav className="flex space-x-1 sm:space-x-2 py-1 overflow-x-auto text-xs sm:text-sm font-medium scrollbar-none">
              <button
                onClick={() => onTabChange('hierarchy')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                  activeTab === 'hierarchy'
                    ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                    : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>શૈક્ષણિક માળખું (Trade → Batch → Unit)</span>
              </button>

              <button
                onClick={() => onTabChange('trainees')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                  activeTab === 'trainees'
                    ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                    : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>તાલીમાર્થી મેનેજમેન્ટ (Trainees)</span>
              </button>

              <button
                onClick={() => onTabChange('templates')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                  activeTab === 'templates'
                    ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                    : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>વર્ડ રિપોર્ટ ડિઝાઇનર (MS Word Studio)</span>
              </button>

              <button
                onClick={() => onTabChange('report')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                  activeTab === 'report'
                    ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                    : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>રિપોર્ટ જનરેટર (Unified Reports)</span>
              </button>

              <button
                onClick={() => onTabChange('attendance')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                  activeTab === 'attendance'
                    ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                    : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
                }`}
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>માસિક હાજરી (Attendance)</span>
                {lowAttendanceCount > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === 'attendance'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {lowAttendanceCount} &lt;80%
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('principal-report')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                  activeTab === 'principal-report'
                    ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                    : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>આચાર્યશ્રી રિપોર્ટ (Principal Report)</span>
              </button>

              <button
                onClick={() => onTabChange('dispatch')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                  activeTab === 'dispatch'
                    ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                    : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
                }`}
              >
                <SendHorizontal className="w-4 h-4" />
                <span>આવક-જાવક રજીસ્ટર (Outward Logs)</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Menu Dropdown / Drawer Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl shadow-2xl p-4 border-t border-slate-200 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isSuperAdmin
                    ? 'bg-slate-900 text-amber-400 border border-slate-700'
                    : 'bg-gradient-to-br from-[#346739] to-[#1b381e] text-[#f2edc2] border border-[#264e2b]'
                }`}>
                  {isSuperAdmin ? <ShieldCheck className="w-4 h-4 text-amber-400" /> : 'ITI'}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{instructor.name}</div>
                  <div className="text-xs text-slate-500">
                    {isSuperAdmin ? 'સુપર એડમિન • ગાંધીનગર (DET Gujarat)' : `${instructor.trade} • ${instructor.unit || 'Unit A'}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Grid in Mobile Menu */}
            {isSuperAdmin ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs font-semibold text-left min-h-[44px]"
                >
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div>સુપર એડમિન પ્રોફાઇલ</div>
                    <div className="text-[10px] text-slate-300 font-normal">Account Details</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (onSyncCloud) onSyncCloud();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold text-left min-h-[44px]"
                >
                  <Cloud className="w-4 h-4 text-slate-700 shrink-0" />
                  <div>
                    <div>Firestore Cloud</div>
                    <div className="text-[10px] text-slate-500 font-normal">State Database</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {onOpenBatchUnitModal && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenBatchUnitModal();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-[#9fcb98] bg-[#f2edc2]/40 text-[#346739] text-xs font-semibold text-left min-h-[44px]"
                  >
                    <Layers className="w-4 h-4 text-[#346739] shrink-0" />
                    <div>
                      <div>Units & Batches</div>
                      <div className="text-[10px] text-[#346739]/80 font-normal">{instructor.unit} ({instructor.batch})</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold text-left min-h-[44px]"
                >
                  <User className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <div>મારું પ્રોફાઇલ</div>
                    <div className="text-[10px] text-slate-500 font-normal">View Profile</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenBatchModal();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-[#79ae6f] bg-[#79ae6f]/15 text-[#1b381e] text-xs font-semibold text-left min-h-[44px]"
                >
                  <Printer className="w-4 h-4 text-[#346739] shrink-0" />
                  <div>
                    <div>Batch Print PDF</div>
                    <div className="text-[10px] text-[#264e2b] font-normal">{lowAttendanceCount} Notices</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (onSyncCloud) onSyncCloud();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-[#9fcb98] bg-[#9fcb98]/20 text-[#346739] text-xs font-semibold text-left min-h-[44px]"
                >
                  <Cloud className="w-4 h-4 text-[#346739] shrink-0" />
                  <div>
                    <div>Firestore Sync</div>
                    <div className="text-[10px] text-[#264e2b] font-normal">Cloud Connected</div>
                  </div>
                </button>
              </div>
            )}

            {/* Navigation Options List */}
            {isSuperAdmin ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleMobileTabSelect('admin')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold bg-slate-900 text-white min-h-[44px]"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-left">
                    <div>સુપર એડમિન કંટ્રોલ સેન્ટર</div>
                    <div className="text-[11px] text-slate-300 font-normal">ઇન્સ્ટ્રક્ટર મંજૂરી અને રાજ્યવ્યાપી વહીવટ</div>
                  </div>
                </button>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>વહીવટી સ્વાયત્તતા સૂચના</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    સુપર એડમિન તરીકે આપ માત્ર રાજ્ય કક્ષાના વહીવટ, ઇન્સ્ટ્રક્ટર એકાઉન્ટ મંજૂરી અને સિસ્ટમ ઓડિટની કામગીરી સંભાળો છો. વ્યક્તિગત વર્ગખંડ સંચાલન ઇન્સ્ટ્રક્ટર્સના અધિકારમાં છે.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => handleMobileTabSelect('hierarchy')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'hierarchy'
                      ? 'bg-[#346739] text-[#f2edc2]'
                      : 'text-slate-700 hover:bg-[#f2edc2]/40'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span>શૈક્ષણિક માળખું (Trade → Batch → Unit)</span>
                </button>

                <button
                  onClick={() => handleMobileTabSelect('trainees')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'trainees'
                      ? 'bg-[#346739] text-[#f2edc2]'
                      : 'text-slate-700 hover:bg-[#f2edc2]/40'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>તાલીમાર્થી મેનેજમેન્ટ (Trainee Records)</span>
                </button>

                <button
                  onClick={() => handleMobileTabSelect('templates')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'templates'
                      ? 'bg-[#346739] text-[#f2edc2]'
                      : 'text-slate-700 hover:bg-[#f2edc2]/40'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>વર્ડ રિપોર્ટ ડિઝાઇનર (MS Word Studio)</span>
                </button>

                <button
                  onClick={() => handleMobileTabSelect('report')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'report'
                      ? 'bg-[#346739] text-[#f2edc2]'
                      : 'text-slate-700 hover:bg-[#f2edc2]/40'
                  }`}
                >
                  <Printer className="w-5 h-5" />
                  <span>રિપોર્ટ જનરેટર (Unified Reports & PDF)</span>
                </button>

                <button
                  onClick={() => handleMobileTabSelect('attendance')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'attendance'
                      ? 'bg-[#346739] text-[#f2edc2]'
                      : 'text-slate-700 hover:bg-[#f2edc2]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarCheck2 className="w-5 h-5" />
                    <span>માસિક હાજરી (Monthly Attendance)</span>
                  </div>
                  {lowAttendanceCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'attendance' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {lowAttendanceCount} &lt;80%
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleMobileTabSelect('principal-report')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'principal-report'
                      ? 'bg-[#346739] text-[#f2edc2]'
                      : 'text-slate-700 hover:bg-[#f2edc2]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5" />
                    <span>આચાર્યશ્રી રિપોર્ટ (Principal Forwarding)</span>
                  </div>
                </button>

                <button
                  onClick={() => handleMobileTabSelect('dispatch')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'dispatch'
                      ? 'bg-[#346739] text-[#f2edc2]'
                      : 'text-slate-700 hover:bg-[#f2edc2]/40'
                  }`}
                >
                  <SendHorizontal className="w-5 h-5" />
                  <span>આવક-જાવક રજીસ્ટર (Outward Logs)</span>
                </button>
              </div>
            )}

            {/* Logout Row */}
            {onLogout && (
              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-bold min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out (લોગ આઉટ કરો)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Native-style Bottom Navigation Bar for Mobile Smartphones */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 py-1 flex items-center justify-around print:hidden pb-[max(4px,env(safe-area-inset-bottom))]"
      >
        {isSuperAdmin ? (
          <>
            <button
              onClick={() => onTabChange('admin')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors min-h-[48px] min-w-[70px] ${
                activeTab === 'admin'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-600" />
              <span className="text-[10px] leading-tight">કંટ્રોલ સેન્ટર</span>
            </button>

            <button
              onClick={onOpenProfileModal}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors min-h-[48px] min-w-[70px]"
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">પ્રોફાઇલ</span>
            </button>

            <button
              onClick={onSyncCloud}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors min-h-[48px] min-w-[70px]"
            >
              <Cloud className="w-5 h-5 mb-0.5 text-[#346739]" />
              <span className="text-[10px] leading-tight">ક્લાઉડ સિંક</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-rose-600 hover:text-rose-800 transition-colors min-h-[48px] min-w-[70px]"
              >
                <LogOut className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">લોગ આઉટ</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => onTabChange('attendance')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors relative min-h-[48px] min-w-[56px] ${
                activeTab === 'attendance'
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarCheck2 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">હાજરી</span>
              {lowAttendanceCount > 0 && (
                <span className="absolute top-0.5 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {lowAttendanceCount > 9 ? '9+' : lowAttendanceCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('principal-report')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[48px] min-w-[56px] ${
                activeTab === 'principal-report'
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">રિપોર્ટ</span>
            </button>

            <button
              onClick={() => onTabChange('templates')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[48px] min-w-[56px] ${
                activeTab === 'templates'
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">ટેમ્પ્લેટ</span>
            </button>

            <button
              onClick={() => onTabChange('trainees')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[48px] min-w-[56px] ${
                activeTab === 'trainees'
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">તાલીમાર્થી</span>
            </button>

            <button
              onClick={() => onTabChange('dispatch')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[48px] min-w-[56px] ${
                activeTab === 'dispatch'
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <SendHorizontal className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">આવક/જાવક</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors min-h-[48px] min-w-[52px]"
            >
              <Menu className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">વધુ (More)</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
}
