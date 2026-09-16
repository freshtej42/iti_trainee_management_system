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
} from 'lucide-react';
import ImeFloatWidget from './ImeFloatWidget';

export type ActiveTab = 'attendance' | 'principal-report' | 'editor' | 'trainees' | 'dispatch' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  instructor: Instructor;
  onOpenTenantModal: () => void;
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
  onOpenTenantModal,
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

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden w-full max-w-full overflow-hidden">
        {/* Top Banner with Gov Logo & Tenant Identity */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-100 w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {/* Emblem Icon styled with Forest Green Palette */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#346739] to-[#1b381e] flex items-center justify-center text-[#f2edc2] font-black text-xs sm:text-sm shadow-xs border border-[#264e2b] shrink-0">
              ITI
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
                <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
                  <span className="sm:hidden">ITI Attendance</span>
                  <span className="hidden sm:inline">ITI Trainee Attendance & Irregularity Notice System</span>
                </h1>
                <span className="hidden lg:inline-flex text-[11px] font-semibold bg-[#f2edc2] text-[#346739] border border-[#9fcb98] px-2 py-0.5 rounded-full shrink-0">
                  NCVT/GCVT
                </span>
                {/* Color Hunt Palette Swatch Badge */}
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
                {/* Firestore Cloud Sync Badge */}
                <button
                  type="button"
                  onClick={onSyncCloud}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full cursor-pointer transition-colors bg-[#f2edc2]/70 text-[#264e2b] border border-[#9fcb98] hover:bg-[#f2edc2] shrink-0"
                  title="Google Cloud Firestore Live Database Connected (Click to sync)"
                >
                  <Cloud className="w-3 h-3 text-[#346739] shrink-0" />
                  <span className="hidden md:inline">Firestore</span>
                  {cloudSyncStatus === 'syncing' ? (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#346739] shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#346739] shrink-0" />
                  )}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block">
                Regional Language (ગુજરાતી / हिन्दी) Notices • Word 2021 Engine • Batch PDF
              </p>
              <div className="sm:hidden text-[10px] text-slate-500 truncate leading-tight">
                {instructor.trade} • {instructor.unit || 'Unit A'}
              </div>
            </div>
          </div>

          {/* Right side controls: IME Widget, Batch/Unit, and Tenant Switcher */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <ImeFloatWidget
              currentLanguage={imeLanguage}
              onLanguageChange={onImeLanguageChange}
            />

            {/* Batch & Unit Quick Manager Button - Desktop */}
            {onOpenBatchUnitModal && (
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

            {/* Batch Print Button */}
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

            {/* Instructor Profile & Tenant Switcher Button */}
            <button
              onClick={onOpenTenantModal}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors shadow-2xs min-h-[34px] sm:min-h-[36px] shrink-0"
              title={`Manage Instructor: ${instructor.name}`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
              <div className="text-left max-w-[55px] sm:max-w-[140px] truncate hidden sm:block">
                <div className="font-bold truncate flex items-center gap-1 text-[11px] sm:text-xs">
                  <span className="truncate">{instructor.name.split(' ')[0]}</span>
                  {instructor.email_verified && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 inline" title="Official Email Verified" />
                  )}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 truncate hidden md:block">
                  {instructor.trade} • {instructor.unit}
                </div>
              </div>
              <User className="w-3.5 h-3.5 text-slate-600 sm:hidden shrink-0" />
              <Building className="w-3.5 h-3.5 text-slate-400 hidden md:block ml-0.5" />
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

        {/* Desktop Main Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 hidden md:block">
          <nav className="flex space-x-1 sm:space-x-2 py-1 overflow-x-auto text-xs sm:text-sm font-medium scrollbar-none">
            <button
              onClick={() => onTabChange('attendance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                activeTab === 'attendance'
                  ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                  : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Monthly Attendance & Flagging</span>
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                activeTab === 'principal-report'
                  ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                  : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>આચાર્યશ્રી રિપોર્ટ (Principal Forwarding Report)</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'principal-report' ? 'bg-[#79ae6f] text-[#f2edc2]' : 'bg-[#f2edc2] text-[#346739] border border-[#9fcb98]'
              }`}>
                Image 1
              </span>
            </button>

            <button
              onClick={() => onTabChange('editor')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                activeTab === 'editor'
                  ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                  : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>MS Word 2021 Letter Generator</span>
            </button>

            <button
              onClick={() => onTabChange('trainees')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                activeTab === 'trainees'
                  ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                  : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Trainee Records & Demographics</span>
            </button>

            <button
              onClick={() => onTabChange('dispatch')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                activeTab === 'dispatch'
                  ? 'bg-[#346739] text-[#f2edc2] font-semibold shadow-xs hover:bg-[#264e2b]'
                  : 'text-slate-700 hover:text-[#346739] hover:bg-[#f2edc2]/40'
              }`}
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Dispatch & Outward Logs</span>
            </button>

            <div className="grow"></div>

            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Super Admin / Developer Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Super Admin</span>
            </button>
          </nav>
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#346739] to-[#1b381e] flex items-center justify-center text-[#f2edc2] font-bold text-xs border border-[#264e2b]">
                  ITI
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{instructor.name}</div>
                  <div className="text-xs text-slate-500">{instructor.trade} • {instructor.unit || 'Unit A'}</div>
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
                  onOpenTenantModal();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold text-left min-h-[44px]"
              >
                <Building className="w-4 h-4 text-slate-600 shrink-0" />
                <div>
                  <div>Switch Profile</div>
                  <div className="text-[10px] text-slate-500 font-normal">Change Instructor</div>
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

            {/* Navigation Options List */}
            <div className="space-y-1">
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
                  <span>Monthly Attendance & Flagging</span>
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
                <span className="text-[10px] bg-[#f2edc2] text-[#346739] border border-[#9fcb98] font-bold px-1.5 py-0.5 rounded-full">
                  Image 1
                </span>
              </button>

              <button
                onClick={() => handleMobileTabSelect('editor')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                  activeTab === 'editor'
                    ? 'bg-[#346739] text-[#f2edc2]'
                    : 'text-slate-700 hover:bg-[#f2edc2]/40'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>MS Word 2021 Letter Generator</span>
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
                <span>Trainee Records & Demographics</span>
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
                <span>Dispatch & Outward Logs</span>
              </button>

              <button
                onClick={() => handleMobileTabSelect('admin')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Super Admin / Developer Dashboard</span>
              </button>
            </div>

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
          onClick={() => onTabChange('editor')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[48px] min-w-[56px] ${
            activeTab === 'editor'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">નોટિસ પત્ર</span>
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
      </nav>
    </>
  );
}
