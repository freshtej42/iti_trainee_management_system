import { Instructor } from '../types';
import {
  FileText,
  Users,
  CalendarCheck2,
  SendHorizontal,
  ShieldCheck,
  Building,
  UserCheck,
  Printer,
  ClipboardList,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Layers,
  LogOut,
  ChevronDown,
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
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
      {/* Top Banner with Gov Logo & Tenant Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Emblem Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white font-black text-sm shadow-xs border border-blue-600">
            ITI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                ITI Trainee Attendance & Irregularity Notice System
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                NCVT/GCVT Ready
              </span>
              {/* Firestore Cloud Sync Badge */}
              <div
                onClick={onSyncCloud}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                title="Google Cloud Firestore Live Database Connected (Click to sync)"
              >
                <Cloud className="w-3 h-3 text-amber-600" />
                <span>Firestore Cloud</span>
                {cloudSyncStatus === 'syncing' ? (
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Regional Language (ગુજરાતી / हिन्दी) Notices • Word 2021 Engine • Batch PDF • Firestore Sync
            </p>
          </div>
        </div>

        {/* Right side controls: IME Widget, Batch/Unit, and Tenant Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <ImeFloatWidget
            currentLanguage={imeLanguage}
            onLanguageChange={onImeLanguageChange}
          />

          {/* Batch & Unit Quick Manager Button */}
          {onOpenBatchUnitModal && (
            <button
              onClick={onOpenBatchUnitModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 transition-colors shadow-2xs"
              title="Add / Configure Batches and Units (A/B/C)"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold">{instructor.unit || 'Unit A'}</span>
              <span className="text-[10px] text-blue-600 font-mono">({instructor.batch})</span>
            </button>
          )}

          {/* Batch Print Button */}
          <button
            onClick={onOpenBatchModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
            title="Batch Export Multi-Page PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Batch Print</span>
            {lowAttendanceCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-amber-800 rounded-full font-bold text-[10px]">
                {lowAttendanceCount}
              </span>
            )}
          </button>

          {/* Instructor Profile & Tenant Switcher Button */}
          <button
            onClick={onOpenTenantModal}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors shadow-2xs"
            title="Manage Instructor Account or Switch Profile"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div className="text-left max-w-[150px] truncate">
              <div className="font-bold truncate flex items-center gap-1">
                <span className="truncate">{instructor.name}</span>
                {instructor.email_verified && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 inline" title="Official Email Verified" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {instructor.trade} • {instructor.unit}
              </div>
            </div>
            <Building className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
              title="Log Out (લોગ આઉટ કરો)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 py-1 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => onTabChange('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'principal-report'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>આચાર્યશ્રી રિપોર્ટ (Principal Forwarding Report)</span>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-full">
              Image 1
            </span>
          </button>

          <button
            onClick={() => onTabChange('editor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>MS Word 2021 Letter Generator</span>
          </button>

          <button
            onClick={() => onTabChange('trainees')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'trainees'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Trainee Records & Demographics</span>
          </button>

          <button
            onClick={() => onTabChange('dispatch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'dispatch'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SendHorizontal className="w-4 h-4" />
            <span>Dispatch & Outward Logs</span>
          </button>

          <div className="grow"></div>

          <button
            onClick={() => onTabChange('admin')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
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
  );
}
