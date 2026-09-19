import { useState, useMemo } from 'react';
import { Trainee, AttendanceRecord, Instructor } from '../types';
import {
  AlertTriangle,
  FileEdit,
  Printer,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  Save,
  Clock,
  Sparkles,
  TrendingDown,
  Users,
  Phone,
  Plus,
  Minus,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { formatFullName } from '../utils/mergeTags';
import A4PrintPreviewModal from './A4PrintPreviewModal';
import { useLanguage } from '../contexts/LanguageContext';

interface AttendanceTrackerProps {
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  instructor: Instructor;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onDraftNotice: (trainee: Trainee, record: AttendanceRecord) => void;
  onBulkDraft: (flaggedTrainees: { trainee: Trainee; record: AttendanceRecord }[]) => void;
}

export default function AttendanceTracker({
  trainees,
  attendanceRecords,
  instructor,
  onUpdateAttendance,
  onDraftNotice,
  onBulkDraft,
}: AttendanceTrackerProps) {
  const { t, tText } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState<string>('August 2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'regular'>('all');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isPrintRegisterOpen, setIsPrintRegisterOpen] = useState(false);

  // Available months
  const availableMonths = ['August 2025', 'September 2025', 'October 2025'];

  // Current month's records for this instructor's trainees
  const instructorTraineeIds = useMemo(() => new Set(trainees.map((t) => t.id)), [trainees]);

  // Current records map: trainee_id -> record
  const currentMonthRecords = useMemo(() => {
    return attendanceRecords.filter(
      (r) => r.month_year === selectedMonth && instructorTraineeIds.has(r.trainee_id)
    );
  }, [attendanceRecords, selectedMonth, instructorTraineeIds]);

  // Working days for this month (from records or default 24)
  const defaultWorkingDays = currentMonthRecords[0]?.total_working_days || 24;
  const [workingDaysInput, setWorkingDaysInput] = useState<number>(defaultWorkingDays);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  // Sync working days input when month changes
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const recs = attendanceRecords.filter(
      (r) => r.month_year === month && instructorTraineeIds.has(r.trainee_id)
    );
    const days = recs[0]?.total_working_days || 24;
    setWorkingDaysInput(days);
  };

  // Trainee row data merged with attendance
  const traineeRows = useMemo(() => {
    return trainees.map((trainee) => {
      const existing = currentMonthRecords.find((r) => r.trainee_id === trainee.id);
      const totalWorking = workingDaysInput;
      const present = existing ? existing.present_days : Math.round(totalWorking * 0.7);
      const absent = Math.max(0, totalWorking - present);
      const percentage = totalWorking > 0 ? Number(((present / totalWorking) * 100).toFixed(2)) : 0;
      const isFlagged = percentage < 80.0;

      return {
        trainee,
        record: existing || {
          id: `att-${trainee.id}-${selectedMonth}`,
          trainee_id: trainee.id,
          instructor_id: instructor.id,
          month_year: selectedMonth,
          total_working_days: totalWorking,
          present_days: present,
          absent_days: absent,
          attendance_percentage: percentage,
          flagged_low: isFlagged,
          updated_at: new Date().toISOString(),
        },
        present,
        absent,
        percentage,
        isFlagged,
      };
    });
  }, [trainees, currentMonthRecords, workingDaysInput, selectedMonth, instructor.id]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return traineeRows.filter(({ trainee, isFlagged }) => {
      const matchesSearch =
        trainee.roll_no.includes(searchQuery) ||
        trainee.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.student_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.enrollment_no.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'flagged') return isFlagged;
      if (statusFilter === 'regular') return !isFlagged;
      return true;
    });
  }, [traineeRows, searchQuery, statusFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = traineeRows.length;
    const flagged = traineeRows.filter((r) => r.isFlagged).length;
    const avgPercentage =
      total > 0
        ? (traineeRows.reduce((acc, curr) => acc + curr.percentage, 0) / total).toFixed(1)
        : '0.0';
    return { total, flagged, avgPercentage };
  }, [traineeRows]);

  // Handle individual present day change
  const handlePresentDayChange = (traineeId: string, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    const safeVal = isNaN(val) ? 0 : Math.min(workingDaysInput, Math.max(0, val));

    const updated = traineeRows.map((row) => {
      if (row.trainee.id === traineeId) {
        const total = workingDaysInput;
        const present = safeVal;
        const absent = Math.max(0, total - present);
        const percentage = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;
        const flagged = percentage < 80.0;

        return {
          ...row.record,
          total_working_days: total,
          present_days: present,
          absent_days: absent,
          attendance_percentage: percentage,
          flagged_low: flagged,
          updated_at: new Date().toISOString(),
        };
      }
      return row.record;
    });

    onUpdateAttendance(updated);
  };

  // Quick mobile stepper for touch devices (+ / - present days)
  const handleStepPresentDay = (traineeId: string, delta: number) => {
    const row = traineeRows.find((r) => r.trainee.id === traineeId);
    if (!row) return;
    const current = row.present;
    const nextVal = Math.min(workingDaysInput, Math.max(0, current + delta));
    handlePresentDayChange(traineeId, nextVal.toString());
  };

  // Handle global working days change
  const handleGlobalWorkingDaysChange = (newTotal: number) => {
    if (newTotal < 1) return;
    setWorkingDaysInput(newTotal);

    const updated = traineeRows.map((row) => {
      const present = Math.min(newTotal, row.present);
      const absent = Math.max(0, newTotal - present);
      const percentage = newTotal > 0 ? Number(((present / newTotal) * 100).toFixed(2)) : 0;
      const flagged = percentage < 80.0;

      return {
        ...row.record,
        total_working_days: newTotal,
        present_days: present,
        absent_days: absent,
        attendance_percentage: percentage,
        flagged_low: flagged,
        updated_at: new Date().toISOString(),
      };
    });

    onUpdateAttendance(updated);
  };

  // Bulk draft for all flagged
  const handleTriggerBulk = () => {
    const flaggedList = traineeRows
      .filter((r) => r.isFlagged)
      .map((r) => ({ trainee: r.trainee, record: r.record }));
    onBulkDraft(flaggedList);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Top Controls Bar: Month Selector & Working Days Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Operational Scope & Month */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-2.5 sm:px-3 py-2 rounded-lg text-slate-700 min-h-[38px] sm:min-h-[40px]">
              <Calendar className="w-4 h-4 text-[#346739] shrink-0" />
              <span className="text-xs font-semibold">{tText('માસ:', 'माह:', 'Month:')}</span>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Working Days input */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#f2edc2]/40 border border-[#9fcb98] px-2.5 sm:px-3 py-1.5 rounded-lg min-h-[38px] sm:min-h-[40px]">
              <Clock className="w-4 h-4 text-[#346739] shrink-0" />
              <label className="text-xs font-semibold text-[#346739]">
                {t('totalWorkingDays')}:
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={workingDaysInput}
                onChange={(e) => handleGlobalWorkingDaysChange(parseInt(e.target.value, 10) || 1)}
                className="w-11 sm:w-14 px-1 py-0.5 text-center text-xs font-bold bg-white border border-[#9fcb98] rounded text-[#346739] focus:ring-2 focus:ring-[#346739] focus:outline-none"
              />
              <span className="text-[11px] text-[#346739]/80 font-medium">{tText('દિવસ', 'दिन', 'Days')}</span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1">
              <span>{t('unit')}:</span>
              <strong className="text-slate-800 truncate max-w-[200px]">{instructor.trade} ({instructor.unit || 'Unit A'})</strong>
            </div>
          </div>

          {/* Right: Quick Action: Print Register & Bulk Notice */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPrintRegisterOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] shadow-xs transition-colors min-h-[38px] sm:min-h-[40px]"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>{tText('પ્રિન્ટ પત્રક (A4)', 'प्रिंट पत्रक (A4)', 'Print Register (A4)')}</span>
            </button>
            <button
              onClick={handleTriggerBulk}
              disabled={stats.flagged === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white shadow-xs transition-colors min-h-[38px] sm:min-h-[40px]"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t('bulkDraft')} ({stats.flagged})</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>{tText('નોંધાયેલ તાલીમાર્થીઓ', 'पंजीकृत प्रशिक्षु', 'Enrolled Trainees')}</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-400">{t('total')} ({instructor.unit})</div>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100">
            <div className="flex items-center justify-between text-rose-700 text-xs font-medium mb-1">
              <span>{t('lowAttendance')} (&lt;80%)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-rose-700">{stats.flagged}</div>
            <div className="text-[11px] text-rose-600">{tText('વાલી નોટિસ જરૂરી', 'अभिभावक नोटिस आवश्यक', 'Parent Notice Required')}</div>
          </div>

          <div className="p-3 bg-[#79ae6f]/10 rounded-lg border border-[#9fcb98]/50">
            <div className="flex items-center justify-between text-[#346739] text-xs font-medium mb-1">
              <span>{t('regular')} (&ge;80%)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#79ae6f]" />
            </div>
            <div className="text-xl font-bold text-[#346739]">
              {stats.total - stats.flagged}
            </div>
            <div className="text-[11px] text-[#346739]/80 font-medium">{t('eligibleForExam')}</div>
          </div>

          <div className="p-3 bg-[#f2edc2]/40 rounded-lg border border-[#9fcb98]/40">
            <div className="flex items-center justify-between text-[#346739] text-xs font-medium mb-1">
              <span>{t('averageAttendance')}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#79ae6f]" />
            </div>
            <div className="text-xl font-bold text-[#346739]">{stats.avgPercentage}%</div>
            <div className="text-[11px] text-[#346739]/80 font-medium">{tText('માસિક એકમ સરેરાશ', 'मासिक औसत', 'Monthly Unit Mean')}</div>
          </div>
        </div>
      </div>

      {/* Grid Filter, Search, and Mobile View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tText('રોલ નં, નામ વડે શોધો...', 'रोल नं, नाम से खोजें...', 'Search by Roll No, Name...')}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:outline-none min-h-[40px]"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap w-full sm:w-auto">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs overflow-x-auto max-w-full">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:inline shrink-0" />
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors min-h-[34px] whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#346739] text-[#f2edc2] font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('all')} ({traineeRows.length})
            </button>
            <button
              onClick={() => setStatusFilter('flagged')}
              className={`px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors min-h-[34px] whitespace-nowrap ${
                statusFilter === 'flagged'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tText('ઓછી હાજરી <80%', 'कम उपस्थिति <80%', 'Low <80%')} ({stats.flagged})
            </button>
            <button
              onClick={() => setStatusFilter('regular')}
              className={`px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors min-h-[34px] whitespace-nowrap ${
                statusFilter === 'regular'
                  ? 'bg-[#79ae6f] text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('regular')} ({stats.total - stats.flagged})
            </button>
          </div>

          {/* Mobile View Mode Toggle (Cards vs Table) */}
          <div className="flex md:hidden items-center bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMobileViewMode('cards')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors min-h-[34px] ${
                mobileViewMode === 'cards'
                  ? 'bg-[#346739] text-[#f2edc2]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Card View (Mobile Optimized)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setMobileViewMode('table')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors min-h-[34px] ${
                mobileViewMode === 'table'
                  ? 'bg-[#346739] text-[#f2edc2]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Table View (Full Grid)"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (Visible on mobile when cards mode is selected, default on phones) */}
      <div className={`${mobileViewMode === 'cards' ? 'block md:hidden' : 'hidden'} space-y-3`}>
        {filteredRows.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
            No trainees found matching the selected criteria.
          </div>
        ) : (
          filteredRows.map(({ trainee, record, present, absent, percentage, isFlagged }) => (
            <div
              key={trainee.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all ${
                isFlagged ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'
              }`}
            >
              {/* Card Header: Roll No, Names, Phone Call */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[#f2edc2] text-[#346739] font-mono font-black text-xs flex items-center justify-center shrink-0 border border-[#9fcb98]">
                    {trainee.roll_no}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm leading-snug truncate">
                      {trainee.surname} {trainee.student_name} {trainee.father_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {trainee.surname_en} {trainee.student_name_en} {trainee.father_name_en}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Enroll: {trainee.enrollment_no}
                    </div>
                  </div>
                </div>

                {/* Parent Phone Quick Call Button */}
                {trainee.parent_mobile && (
                  <a
                    href={`tel:${trainee.parent_mobile}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 active:scale-95 transition-all shrink-0 min-h-[38px]"
                    title={`Call Parent: ${trainee.parent_mobile}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              {/* Card Attendance Progress Bar & Percentage */}
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono font-bold text-sm ${
                        isFlagged ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-slate-400">{tText('હાજરી', 'उपस्थिति', 'Attendance')}</span>
                  </div>

                  {isFlagged ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>&lt;80% {tText('ચેતવણી', 'चेतावनी', 'Flagged')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{tText('સંતોષકારક', 'संतोषजनक', 'Satisfactory')}</span>
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isFlagged ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stepper Controls: Present Days & Absent Days */}
              <div className="flex items-center justify-between gap-3 mb-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">{t('presentDays')}:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleStepPresentDay(trainee.id, -1)}
                      disabled={present <= 0}
                      className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition-colors"
                      aria-label="Decrease present days"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={workingDaysInput}
                      value={present}
                      onChange={(e) => handlePresentDayChange(trainee.id, e.target.value)}
                      className="w-12 h-10 text-center font-bold text-sm text-slate-900 border-x border-slate-200 focus:outline-none focus:bg-blue-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepPresentDay(trainee.id, 1)}
                      disabled={present >= workingDaysInput}
                      className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition-colors"
                      aria-label="Increase present days"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Absent days count */}
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">{t('absentDays')}:</span>
                  <span className="font-bold text-slate-800 text-sm">{absent} {tText('દિવસ', 'दिन', 'Days')}</span>
                </div>
              </div>

              {/* Action Button: Draft Notice */}
              <button
                type="button"
                onClick={() => onDraftNotice(trainee, record)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all min-h-[44px] ${
                  isFlagged
                    ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-98'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <FileEdit className="w-4 h-4" />
                <span>{t('draftNotice')}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Attendance Grid Table (Visible on desktop or when mobileViewMode is 'table') */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${
        mobileViewMode === 'table' ? 'block' : 'hidden md:block'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-16 text-center">{t('rollNo')}</th>
                <th className="py-3 px-4">{t('studentName')}</th>
                <th className="py-3 px-4 hidden md:table-cell">{t('enrollmentNo')}</th>
                <th className="py-3 px-4 text-center w-28">{t('presentDays')}</th>
                <th className="py-3 px-4 text-center w-28">{t('absentDays')}</th>
                <th className="py-3 px-4 text-center w-36">{tText('હાજરી', 'उपस्थिति', 'Attendance')} %</th>
                <th className="py-3 px-4 text-center w-28">{t('status')}</th>
                <th className="py-3 px-4 text-right w-44">{tText('નોટિસ કાર્યવાહી', 'नोटिस कार्रवाई', 'Notice Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    {tText('કોઈ તાલીમાર્થી મળ્યા નથી.', 'कोई प्रशिक्षु नहीं मिला।', 'No trainees found.')}
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ trainee, record, present, absent, percentage, isFlagged }) => {
                  return (
                    <tr
                      key={trainee.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFlagged ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {trainee.roll_no}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {trainee.surname} {trainee.student_name} {trainee.father_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {trainee.surname_en} {trainee.student_name_en} {trainee.father_name_en}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell font-mono text-[11px] text-slate-500">
                        {trainee.enrollment_no}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStepPresentDay(trainee.id, -1)}
                            disabled={present <= 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={workingDaysInput}
                            value={present}
                            onChange={(e) => handlePresentDayChange(trainee.id, e.target.value)}
                            className={`w-14 py-1 px-1 text-center font-bold text-sm rounded border focus:outline-none focus:ring-2 ${
                              isFlagged
                                ? 'border-rose-300 text-rose-700 bg-rose-50/50 focus:ring-rose-400'
                                : 'border-slate-300 text-slate-900 bg-white focus:ring-blue-400'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleStepPresentDay(trainee.id, 1)}
                            disabled={present >= workingDaysInput}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {absent}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isFlagged ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {percentage.toFixed(2)}%
                          </span>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${isFlagged ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>&lt;80% {tText('ચેતવણી', 'चेतावनी', 'Flagged')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{tText('સંતોષકારક', 'संतोषजनक', 'Satisfactory')}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDraftNotice(trainee, record)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs shadow-2xs transition-colors min-h-[34px] ${
                            isFlagged
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>{t('draftNotice')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* A4 Print Preview Modal for Monthly Attendance Register */}
      {isPrintRegisterOpen && (
        <A4PrintPreviewModal
          isOpen={isPrintRegisterOpen}
          onClose={() => setIsPrintRegisterOpen(false)}
          title={`${tText('માસિક હાજરી પત્રક પ્રિન્ટ પ્રીવ્યૂ', 'मासिक उपस्थिति पत्रक प्रिंट पूर्वावलोकन', 'Monthly Attendance Register Print Preview')} - ${selectedMonth}`}
          subtitle={`${instructor.iti_name} • ${instructor.trade} (${instructor.unit})`}
          filename={`ITI_Attendance_Register_${instructor.trade.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedMonth.replace(/\s+/g, '_')}`}
          initialOrientation="portrait"
        >
          <div className="w-full text-slate-900 text-xs leading-relaxed font-sans">
            {/* Header / Letterhead */}
            <div className="border-b-2 border-slate-800 pb-3 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-slate-700 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-slate-50">
                  <div className="text-[7px] font-bold text-slate-800">GOVT OF</div>
                  <div className="text-sm font-black text-blue-900">ITI</div>
                  <div className="text-[6px] font-bold text-slate-700">GUJARAT</div>
                </div>

                <div className="text-center grow">
                  <div className="text-[10px] font-semibold text-slate-600">
                    {tText('શ્રમ, કૌશલ્ય વિકાસ અને રોજગાર વિભાગ, ગુજરાત સરકાર', 'श्रम, कौशल विकास और रोजगार विभाग, गुजरात सरकार', 'Labour, Skill Development & Employment Dept, Govt of Gujarat')}
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 font-serif">
                    {instructor.iti_name}
                  </h1>
                  <div className="text-xs font-bold text-blue-950 mt-0.5">
                    {tText('સત્તાવાર માસિક તાલીમાર્થી હાજરી પત્રક', 'आधिकारिक मासिक प्रशिक्षु उपस्थिति पत्रक', 'Official Monthly Trainee Attendance Register')}
                  </div>
                </div>

                <div className="w-14 h-14 rounded-full border border-slate-300 p-1 flex flex-col items-center justify-center text-center shrink-0 bg-blue-50/40">
                  <div className="text-[7px] font-bold text-blue-800 uppercase">Skill</div>
                  <div className="text-[11px] font-black text-orange-600">India</div>
                  <div className="text-[6px] text-slate-600">{tText('કૌશલ ભારત', 'कौशल भारत', 'Skill India')}</div>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-300 text-[11px] bg-slate-50 p-2 rounded">
                <div>
                  <span className="text-slate-500">{tText('વ્યવસાય (Trade):', 'व्यवसाय:', 'Trade:')}</span>{' '}
                  <strong className="text-slate-900">{instructor.trade}</strong>
                </div>
                <div>
                  <span className="text-slate-500">{tText('યુનિટ / બેચ:', 'यूनिट / बैच:', 'Unit / Batch:')}</span>{' '}
                  <strong className="text-slate-900">
                    {instructor.unit} / {instructor.batch}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">{tText('માસ / વર્ષ:', 'माह / वर्ष:', 'Month / Year:')}</span>{' '}
                  <strong className="text-slate-900">{selectedMonth}</strong>
                </div>
                <div>
                  <span className="text-slate-500">{t('totalWorkingDays')}:</span>{' '}
                  <strong className="text-blue-900">{workingDaysInput} {tText('દિવસ', 'दिन', 'Days')}</strong>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-10">{t('rollNo')}</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left">
                    {t('studentName')}
                  </th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-24">{t('enrollmentNo')}</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-14">{tText('કુલ દિવસ', 'कुल दिन', 'Total Days')}</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-14">{tText('હાજર', 'उपस्थित', 'Present')}</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-14">{tText('ગેરહાજર', 'अनुपस्थित', 'Absent')}</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-16">{tText('હાજરી', 'उपस्थिति', 'Attendance')} %</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-center w-20">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {traineeRows.map((row) => (
                  <tr
                    key={row.trainee.id}
                    className={row.isFlagged ? 'bg-rose-50/50' : 'even:bg-slate-50/50'}
                  >
                    <td className="border border-slate-400 py-1 px-2 text-center font-bold font-mono">
                      {row.trainee.roll_no}
                    </td>
                    <td className="border border-slate-400 py-1 px-2">
                      <div className="font-bold text-slate-900">
                        {formatFullName(row.trainee)}
                      </div>
                      <div className="text-[9px] text-slate-500 font-sans">
                        {row.trainee.surname_en} {row.trainee.student_name_en} {row.trainee.father_name_en}
                      </div>
                    </td>
                    <td className="border border-slate-400 py-1 px-2 text-center font-mono text-[9px] text-slate-600">
                      {row.trainee.enrollment_no}
                    </td>
                    <td className="border border-slate-400 py-1 px-2 text-center font-semibold">
                      {workingDaysInput}
                    </td>
                    <td className="border border-slate-400 py-1 px-2 text-center font-bold text-slate-900">
                      {row.present}
                    </td>
                    <td className="border border-slate-400 py-1 px-2 text-center text-slate-600">
                      {row.absent}
                    </td>
                    <td
                      className={`border border-slate-400 py-1 px-2 text-center font-bold font-mono ${
                        row.isFlagged ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {row.percentage}%
                    </td>
                    <td className="border border-slate-400 py-1 px-2 text-center">
                      {row.isFlagged ? (
                        <span className="text-[9px] font-bold text-rose-700 px-1 py-0.5 bg-rose-100 rounded">
                          {tText('ચેતવણીપાત્ર', 'चेतावनीपूर्ण', 'Flagged')}
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-emerald-700">{tText('નિયમિત', 'नियमित', 'Regular')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Attendance Analytics Box */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded mb-8 text-[11px]">
              <div>
                <span className="text-slate-500">{tText('કુલ નોંધાયેલ તાલીમાર્થીઓ:', 'कुल पंजीकृत प्रशिक्षु:', 'Total Enrolled Trainees:')}</span>{' '}
                <strong className="text-slate-900">{stats.total}</strong>
              </div>
              <div>
                <span className="text-slate-500">{tText('ઓછી હાજરીવાળા (<80%):', 'कम उपस्थिति वाले (<80%):', 'Low Attendance (<80%):')}</span>{' '}
                <strong className="text-rose-700">{stats.flagged}</strong>
              </div>
              <div>
                <span className="text-slate-500">{tText('સરેરાશ બેચ હાજરી:', 'औसत बैच उपस्थिति:', 'Average Batch Attendance:')}</span>{' '}
                <strong className="text-blue-900">{stats.avgPercentage}%</strong>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex items-end justify-between pt-6 border-t border-slate-400">
              {/* Left: Instructor Sign */}
              <div className="text-center min-w-[180px]">
                <div className="h-9 flex items-end justify-center pb-1">
                  <span className="font-serif italic font-bold text-slate-800 text-xs">
                    {instructor.name}
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-bold text-[11px] text-slate-900">{instructor.name}</div>
                  <div className="text-[10px] text-slate-600">{instructor.designation}</div>
                  <div className="text-[9px] text-slate-500">{instructor.trade}</div>
                </div>
              </div>

              {/* Center: Seal */}
              <div className="border border-dashed border-slate-400 p-2 rounded text-[9px] text-slate-400 text-center w-36">
                <div>{tText('સંસ્થાનું ગોળ સીલ', 'संस्थान की मुहर', 'Institute Seal')}</div>
                <div className="mt-3">[ ITI Seal ]</div>
              </div>

              {/* Right: Principal Sign */}
              <div className="text-center min-w-[180px]">
                <div className="h-9 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-slate-400 text-[11px]">{tText('સહી / Signature', 'हस्ताक्षर / Signature', 'Signature')}</span>
                </div>
                <div className="border-t border-slate-700 pt-1">
                  <div className="font-bold text-[11px] text-slate-900">{tText('આચાર્યશ્રી / સંસ્થા વડા', 'प्राचार्य / संस्था प्रमुख', 'Principal / Head of Institute')}</div>
                  <div className="text-[10px] text-slate-600">{instructor.iti_name.split('(')[0]}</div>
                  <div className="text-[9px] text-slate-500">{tText('તારીખ:', 'दिनांक:', 'Date:')} {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>
            </div>
          </div>
        </A4PrintPreviewModal>
      )}
    </div>
  );
}
