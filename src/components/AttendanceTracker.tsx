import { useState, useMemo, useEffect } from 'react';
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
  Flag,
  PlusCircle,
  Check,
  Briefcase,
  Layers,
} from 'lucide-react';
import { formatFullName } from '../utils/mergeTags';
import {
  calculateProgressiveAttendance,
  ProgressiveStats,
  getRecordedMonthsInSession,
  getTraineeMonthStats,
} from '../utils/progressiveAttendance';
import A4PrintPreviewModal from './A4PrintPreviewModal';
import AddAttendanceModal from './AddAttendanceModal';
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
  const isGuest = instructor.role === 'guest' || instructor.is_guest || instructor.id === 'guest-demo-instructor';
  // 12 Standard Calendar Months (Academic Order Starting August)
  const MONTHS_LIST = useMemo(
    () => [
      { name: 'August', gu: 'ઓગસ્ટ', hi: 'अगस्त' },
      { name: 'September', gu: 'સપ્ટેમ્બર', hi: 'सितंबर' },
      { name: 'October', gu: 'ઓક્ટોબર', hi: 'અक्टूबर' },
      { name: 'November', gu: 'નવેમ્બર', hi: 'नवंबर' },
      { name: 'December', gu: 'ડિસેમ્બર', hi: 'दिसंबर' },
      { name: 'January', gu: 'જાન્યુઆરી', hi: 'जनवरी' },
      { name: 'February', gu: 'ફેબ્રુઆરી', hi: 'फ़रवरी' },
      { name: 'March', gu: 'માર્ચ', hi: 'मार्च' },
      { name: 'April', gu: 'એપ્રિલ', hi: 'अप्रैल' },
      { name: 'May', gu: 'મે', hi: 'मई' },
      { name: 'June', gu: 'જૂન', hi: 'जून' },
      { name: 'July', gu: 'જુલાઈ', hi: 'जुलाई' },
    ],
    []
  );

  // Dynamic Years List: starting from 2026, going for at least 12 years (up to 2039), plus any record years
  const availableYears = useMemo(() => {
    const baseYears: number[] = [];
    const startYear = 2026;
    const count = 14; // 14 years: 2026 through 2039
    for (let i = 0; i < count; i++) {
      baseYears.push(startYear + i);
    }
    // Also incorporate any custom/existing record years
    attendanceRecords.forEach((r) => {
      if (r.month_year) {
        const parts = r.month_year.trim().split(' ');
        const yr = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(yr) && !baseYears.includes(yr)) {
          baseYears.push(yr);
        }
      }
    });
    return baseYears.sort((a, b) => a - b);
  }, [attendanceRecords]);

  // Year and Month selection state (Defaults to 2026 and August)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthName, setSelectedMonthName] = useState<string>('August');
  const selectedMonth = `${selectedMonthName} ${selectedYear}`;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('ALL');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'progressive_safe' | 'regular'>('all');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isPrintRegisterOpen, setIsPrintRegisterOpen] = useState(false);
  const [isAddAttendanceModalOpen, setIsAddAttendanceModalOpen] = useState(false);
  const [editingTraineeId, setEditingTraineeId] = useState<string | undefined>(undefined);

  // Available Trades from instructor hierarchy, profile, and trainees
  const availableTrades = useMemo(() => {
    const tradeSet = new Set<string>();
    instructor.academic_hierarchy?.forEach((t) => {
      if (t.name) tradeSet.add(t.name);
    });
    instructor.trades?.forEach((t) => {
      if (t) tradeSet.add(t);
    });
    if (instructor.trade) tradeSet.add(instructor.trade);
    trainees.forEach((tr) => {
      if (tr.trade) tradeSet.add(tr.trade);
    });
    return Array.from(tradeSet);
  }, [instructor, trainees]);

  // Available Batches (scoped to selectedTradeFilter if a specific trade is selected)
  const availableBatches = useMemo(() => {
    const batchSet = new Set<string>();
    if (selectedTradeFilter !== 'ALL') {
      const hierarchyTrade = instructor.academic_hierarchy?.find((t) => t.name === selectedTradeFilter);
      hierarchyTrade?.batches?.forEach((b) => {
        if (b.name) batchSet.add(b.name);
      });
      trainees
        .filter((tr) => (tr.trade || instructor.trade) === selectedTradeFilter)
        .forEach((tr) => {
          if (tr.batch) batchSet.add(tr.batch);
        });
    } else {
      instructor.academic_hierarchy?.forEach((t) => {
        t.batches?.forEach((b) => {
          if (b.name) batchSet.add(b.name);
        });
      });
      instructor.batches?.forEach((b) => {
        if (b) batchSet.add(b);
      });
      if (instructor.batch) batchSet.add(instructor.batch);
      trainees.forEach((tr) => {
        if (tr.batch) batchSet.add(tr.batch);
      });
    }
    return Array.from(batchSet);
  }, [instructor, trainees, selectedTradeFilter]);

  // Reset batch filter if no longer valid for selected trade
  useEffect(() => {
    if (
      selectedBatchFilter !== 'ALL' &&
      availableBatches.length > 0 &&
      !availableBatches.includes(selectedBatchFilter)
    ) {
      setSelectedBatchFilter('ALL');
    }
  }, [selectedTradeFilter, availableBatches, selectedBatchFilter]);

  // Available Units (scoped to selectedTradeFilter and selectedBatchFilter if chosen)
  const availableUnits = useMemo(() => {
    const unitSet = new Set<string>();
    const hierarchyTrades =
      selectedTradeFilter !== 'ALL'
        ? instructor.academic_hierarchy?.filter((t) => t.name === selectedTradeFilter) || []
        : instructor.academic_hierarchy || [];

    hierarchyTrades.forEach((t) => {
      const batches =
        selectedBatchFilter !== 'ALL'
          ? t.batches?.filter((b) => b.name === selectedBatchFilter) || []
          : t.batches || [];
      batches.forEach((b) => {
        b.units?.forEach((u) => {
          if (u.name) unitSet.add(u.name);
        });
      });
    });

    if (selectedTradeFilter === 'ALL' && selectedBatchFilter === 'ALL') {
      instructor.units?.forEach((u) => {
        if (u) unitSet.add(u);
      });
      if (instructor.unit) unitSet.add(instructor.unit);
    }

    trainees
      .filter((tr) => {
        const trTrade = tr.trade || instructor.trade;
        const trBatch = tr.batch || instructor.batch;
        const matchesTrade = selectedTradeFilter === 'ALL' || trTrade === selectedTradeFilter;
        const matchesBatch = selectedBatchFilter === 'ALL' || trBatch === selectedBatchFilter;
        return matchesTrade && matchesBatch;
      })
      .forEach((tr) => {
        if (tr.unit) unitSet.add(tr.unit);
      });

    return Array.from(unitSet);
  }, [instructor, trainees, selectedTradeFilter, selectedBatchFilter]);

  // Reset unit filter if no longer valid for selected trade/batch
  useEffect(() => {
    if (
      selectedUnitFilter !== 'ALL' &&
      availableUnits.length > 0 &&
      !availableUnits.includes(selectedUnitFilter)
    ) {
      setSelectedUnitFilter('ALL');
    }
  }, [selectedTradeFilter, selectedBatchFilter, availableUnits, selectedUnitFilter]);

  // Trainees scoped by selected Trade, Batch & Unit filters
  const scopedTrainees = useMemo(() => {
    return trainees.filter((tr) => {
      const trTrade = tr.trade || instructor.trade;
      const trBatch = tr.batch || instructor.batch;
      const trUnit = tr.unit || instructor.unit;
      const matchesTrade = selectedTradeFilter === 'ALL' || trTrade === selectedTradeFilter;
      const matchesBatch = selectedBatchFilter === 'ALL' || trBatch === selectedBatchFilter;
      const matchesUnit = selectedUnitFilter === 'ALL' || trUnit === selectedUnitFilter;
      return matchesTrade && matchesBatch && matchesUnit;
    });
  }, [trainees, instructor.trade, instructor.batch, instructor.unit, selectedTradeFilter, selectedBatchFilter, selectedUnitFilter]);

  // Current month's records for the filtered trainees
  const instructorTraineeIds = useMemo(() => new Set(scopedTrainees.map((t) => t.id)), [scopedTrainees]);

  // Chronologically ordered recorded months in academic session for this class
  const sessionRecordedMonths = useMemo(() => {
    const recorded = getRecordedMonthsInSession(attendanceRecords, instructorTraineeIds);
    if (recorded.length === 0) {
      return [selectedMonth];
    }
    return recorded;
  }, [attendanceRecords, instructorTraineeIds, selectedMonth]);

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

  // Automatically sync workingDaysInput whenever currentMonthRecords updates (e.g., after Mark Attendance modal save)
  useEffect(() => {
    if (currentMonthRecords.length > 0 && currentMonthRecords[0]?.total_working_days) {
      setWorkingDaysInput(Number(currentMonthRecords[0].total_working_days));
    }
  }, [currentMonthRecords]);

  // Sync working days input when month or year changes
  const syncWorkingDaysForMonth = (monthYearStr: string) => {
    const recs = attendanceRecords.filter(
      (r) => r.month_year === monthYearStr && instructorTraineeIds.has(r.trainee_id)
    );
    const days = recs[0]?.total_working_days || 24;
    setWorkingDaysInput(days);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    syncWorkingDaysForMonth(`${selectedMonthName} ${newYear}`);
  };

  const handleMonthNameChange = (newMonthName: string) => {
    setSelectedMonthName(newMonthName);
    syncWorkingDaysForMonth(`${newMonthName} ${selectedYear}`);
  };

  // Sync working days input when month changes
  const handleMonthChange = (month: string) => {
    const parts = month.trim().split(' ');
    if (parts.length >= 2) {
      const yr = parseInt(parts[parts.length - 1], 10);
      const mName = parts.slice(0, parts.length - 1).join(' ');
      if (!isNaN(yr)) setSelectedYear(yr);
      if (mName) setSelectedMonthName(mName);
    }
    syncWorkingDaysForMonth(month);
  };

  // Trainee row data merged with attendance and progressive attendance calculation
  const traineeRows = useMemo(() => {
    return scopedTrainees.map((trainee) => {
      const existing = currentMonthRecords.find((r) => r.trainee_id === trainee.id);

      // Compute progressive attendance strictly using actual recorded months in attendanceRecords
      const progStats: ProgressiveStats = calculateProgressiveAttendance(
        trainee.id,
        existing || null,
        attendanceRecords
      );

      // Use saved working & present days if this month is recorded; otherwise fall back cleanly without corrupting cumulative stats
      const totalWorking = existing
        ? Number(existing.total_working_days) || workingDaysInput
        : workingDaysInput;
      const present = existing
        ? Number(existing.present_days) || 0
        : progStats.totalPresentDaysToDate > 0
        ? Math.round((progStats.monthlyPercentage / 100) * totalWorking)
        : 0;
      const absent = Math.max(0, totalWorking - present);
      const percentage = existing
        ? totalWorking > 0
          ? Number(((present / totalWorking) * 100).toFixed(2))
          : Number(existing.attendance_percentage || 0)
        : progStats.monthlyPercentage;
      const isMonthlyLow = percentage < 80.0;

      const baseRecord: AttendanceRecord = existing || {
        id: `att-${trainee.id}-${selectedMonth.replace(/\s+/g, '_')}`,
        trainee_id: trainee.id,
        instructor_id: instructor.id,
        month_year: selectedMonth,
        total_working_days: totalWorking,
        present_days: present,
        absent_days: absent,
        attendance_percentage: percentage,
        flagged_low: isMonthlyLow,
        updated_at: new Date().toISOString(),
      };

      const isProgressiveSafe = progStats.isProgressiveSafe; // Monthly < 80% but Progressive >= 80%
      const requiresNotice = progStats.requiresNotice; // Progressive < 80%

      const record: AttendanceRecord = {
        ...baseRecord,
        total_working_days: totalWorking,
        present_days: present,
        absent_days: absent,
        attendance_percentage: percentage,
        flagged_low: isMonthlyLow,
        progressive_attendance_percentage: progStats.progressivePercentage,
        progressive_recorded_months: progStats.recordedMonthsCount,
        progressive_safe: isProgressiveSafe,
        requires_notice: requiresNotice,
      };

      return {
        trainee,
        record,
        present,
        absent,
        percentage,
        isMonthlyLow,
        progressivePercentage: progStats.progressivePercentage,
        recordedMonthsCount: progStats.recordedMonthsCount,
        totalSessionWorking: progStats.totalWorkingDaysToDate,
        totalSessionPresent: progStats.totalPresentDaysToDate,
        isProgressiveSafe,
        requiresNotice,
        isRedFlag: progStats.isRedFlag,
        isFlagged: progStats.isRedFlag, // Only true notice requirement flags trainee for bulk notice
        progStats,
      };
    });
  }, [scopedTrainees, currentMonthRecords, workingDaysInput, selectedMonth, instructor.id, attendanceRecords]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return traineeRows.filter(({ trainee, isRedFlag, isProgressiveSafe }) => {
      const matchesSearch =
        trainee.roll_no.includes(searchQuery) ||
        trainee.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.student_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.enrollment_no.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'flagged') return isRedFlag; // Red flag students (<80% cumulative)
      if (statusFilter === 'progressive_safe') return isProgressiveSafe; // Monthly <80% but Progressive >=80%
      if (statusFilter === 'regular') return !isRedFlag; // Compliant students
      return true;
    });
  }, [traineeRows, searchQuery, statusFilter]);

  // Summary statistics with progressive metrics
  const stats = useMemo(() => {
    const total = traineeRows.length;
    const noticeRequired = traineeRows.filter((r) => r.requiresNotice).length;
    const progressiveSafe = traineeRows.filter((r) => r.isProgressiveSafe).length;
    const regular = traineeRows.filter((r) => !r.isMonthlyLow && !r.requiresNotice).length;
    const compliant = total - noticeRequired; // All students exempt from notice
    const avgPercentage =
      total > 0
        ? (traineeRows.reduce((acc, curr) => acc + curr.percentage, 0) / total).toFixed(1)
        : '0.0';
    const avgProgressive =
      total > 0
        ? (traineeRows.reduce((acc, curr) => acc + curr.progressivePercentage, 0) / total).toFixed(1)
        : '0.0';

    return {
      total,
      flagged: noticeRequired, // Backwards compatibility for bulk actions
      noticeRequired,
      progressiveSafe,
      regular,
      compliant,
      avgPercentage,
      avgProgressive,
    };
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

        const baseRec = {
          ...row.record,
          total_working_days: total,
          present_days: present,
          absent_days: absent,
          attendance_percentage: percentage,
          flagged_low: flagged,
          updated_at: new Date().toISOString(),
        };

        const pStats = calculateProgressiveAttendance(traineeId, baseRec, attendanceRecords);

        return {
          ...baseRec,
          progressive_attendance_percentage: pStats.progressivePercentage,
          progressive_recorded_months: pStats.recordedMonthsCount,
          progressive_safe: pStats.isProgressiveSafe,
          requires_notice: pStats.requiresNotice,
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

      const baseRec = {
        ...row.record,
        total_working_days: newTotal,
        present_days: present,
        absent_days: absent,
        attendance_percentage: percentage,
        flagged_low: flagged,
        updated_at: new Date().toISOString(),
      };

      const pStats = calculateProgressiveAttendance(row.trainee.id, baseRec, attendanceRecords);

      return {
        ...baseRec,
        progressive_attendance_percentage: pStats.progressivePercentage,
        progressive_recorded_months: pStats.recordedMonthsCount,
        progressive_safe: pStats.isProgressiveSafe,
        requires_notice: pStats.requiresNotice,
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

  // Localized year label helper
  const formatYearLabel = (y: number) => {
    const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
    const toGu = (num: number) => String(num).replace(/[0-9]/g, (d) => gujaratiDigits[+d]);
    return tText(`${toGu(y)} (${y})`, `${y}`, `${y}`);
  };

  // Localized month label helper
  const formatMonthOnlyLabel = (mName: string) => {
    const item = MONTHS_LIST.find((x) => x.name === mName);
    if (!item) return mName;
    return tText(`${item.gu} (${item.name})`, `${item.hi} (${item.name})`, item.name);
  };

  // Localized month column header helper for month-wise matrix view
  const formatMonthHeaderLabel = (monthYearStr: string) => {
    const parts = monthYearStr.trim().split(/\s+/);
    const yr = parts[parts.length - 1];
    const yrShort = yr.length === 4 ? yr.slice(-2) : yr;
    const mName = parts.slice(0, parts.length - 1).join(' ');
    const item = MONTHS_LIST.find((x) => x.name.toLowerCase() === mName.toLowerCase());
    const guName = item ? item.gu : mName;
    const hiName = item ? item.hi : mName;
    return {
      gu: `${guName} '${yrShort} %`,
      hi: `${hiName} '${yrShort} %`,
      en: `${mName.slice(0, 3)} '${yrShort} %`,
      monthName: mName,
      year: yr,
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Top Controls Bar: Trade & Batch Filters, Dual Year & Month Selectors & Working Days Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Operational Scope & Dropdowns (Trade, Batch, Year & Month) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Trade Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#f2edc2]/40 hover:bg-[#f2edc2]/70 transition-colors border border-[#9fcb98] px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-700 min-h-[38px] sm:min-h-[40px] shadow-xs">
              <Briefcase className="w-4 h-4 text-[#346739] shrink-0" />
              <label htmlFor="attendance-trade-select" className="text-xs font-semibold text-[#346739] whitespace-nowrap">
                {tText('ટ્રેડ:', 'ट्रेड:', 'Trade:')}
              </label>
              <select
                id="attendance-trade-select"
                value={selectedTradeFilter}
                onChange={(e) => setSelectedTradeFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer max-w-[165px] sm:max-w-[200px] truncate pr-1"
                aria-label={tText('ટ્રેડ પસંદ કરો', 'ट्रेड चुनें', 'Select Trade')}
              >
                <option value="ALL">{tText('તમામ ટ્રેડ (All Trades)', 'सभी ट्रेड (All Trades)', 'All Trades')}</option>
                {availableTrades.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#f2edc2]/40 hover:bg-[#f2edc2]/70 transition-colors border border-[#9fcb98] px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-700 min-h-[38px] sm:min-h-[40px] shadow-xs">
              <Layers className="w-4 h-4 text-[#346739] shrink-0" />
              <label htmlFor="attendance-batch-select" className="text-xs font-semibold text-[#346739] whitespace-nowrap">
                {tText('બેચ:', 'बैच:', 'Batch:')}
              </label>
              <select
                id="attendance-batch-select"
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                aria-label={tText('બેચ પસંદ કરો', 'बैच चुनें', 'Select Batch')}
              >
                <option value="ALL">{tText('તમામ બેચ (All Batches)', 'सभी बैच (All Batches)', 'All Batches')}</option>
                {availableBatches.map((b) => (
                  <option key={b} value={b}>
                    {tText(`બેચ ${b}`, `बैच ${b}`, `Batch ${b}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#f2edc2]/40 hover:bg-[#f2edc2]/70 transition-colors border border-[#9fcb98] px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-700 min-h-[38px] sm:min-h-[40px] shadow-xs">
              <Layers className="w-4 h-4 text-[#346739] shrink-0" />
              <label htmlFor="attendance-unit-select" className="text-xs font-semibold text-[#346739] whitespace-nowrap">
                {tText('યુનિટ:', 'यूनिट:', 'Unit:')}
              </label>
              <select
                id="attendance-unit-select"
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                aria-label={tText('યુનિટ પસંદ કરો', 'यूनिट चुनें', 'Select Unit')}
              >
                <option value="ALL">{tText('તમામ યુનિટ (All Units)', 'सभी यूनिट (All Units)', 'All Units')}</option>
                {availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* 1. Year Drop-down (From 2026, 12+ years dynamic) */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/60 transition-colors border border-slate-200/90 px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-700 min-h-[38px] sm:min-h-[40px] shadow-xs">
              <Calendar className="w-4 h-4 text-[#346739] shrink-0" />
              <label htmlFor="attendance-year-select" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                {tText('વર્ષ:', 'वर्ष:', 'Year:')}
              </label>
              <select
                id="attendance-year-select"
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                aria-label={tText('વર્ષ પસંદ કરો', 'वर्ष चुनें', 'Select Year')}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {formatYearLabel(yr)}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Month Drop-down (12 Months dynamic) */}
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/60 transition-colors border border-slate-200/90 px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-700 min-h-[38px] sm:min-h-[40px] shadow-xs">
              <Calendar className="w-4 h-4 text-[#346739] shrink-0" />
              <label htmlFor="attendance-month-select" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                {tText('માસ:', 'माह:', 'Month:')}
              </label>
              <select
                id="attendance-month-select"
                value={selectedMonthName}
                onChange={(e) => handleMonthNameChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                aria-label={tText('માસ પસંદ કરો', 'माह चुनें', 'Select Month')}
              >
                {MONTHS_LIST.map((m) => (
                  <option key={m.name} value={m.name}>
                    {formatMonthOnlyLabel(m.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Dedicated Add / Edit Attendance Modal Button beside month */}
            <button
              type="button"
              onClick={() => {
                setEditingTraineeId(undefined);
                setIsAddAttendanceModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] shadow-xs transition-colors min-h-[38px] sm:min-h-[40px]"
              title={tText('આ માસની હાજરી ભરો અથવા સુધારો', 'इस माह की उपस्थिति दर्ज करें या संपादित करें', 'Mark or Edit Attendance for this month')}
            >
              <PlusCircle className="w-4 h-4 shrink-0 text-[#f2edc2]" />
              <span className="whitespace-nowrap">{tText('હાજરી ભરો (Mark Attendance)', 'उपस्थिति भरें', 'Mark Attendance')}</span>
            </button>

            {/* Dynamic Status Pill */}
            {currentMonthRecords.length > 0 ? (
              <span
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                title={tText('આ માસની હાજરી નોંધાયેલી છે', 'इस माह की उपस्थिति दर्ज है', 'Attendance recorded for this month')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{tText('નોંધાયેલ', 'दर्ज', 'Recorded')}</span>
              </span>
            ) : (
              <span
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold"
                title={tText('નવો માસ - હાજરી ભરવા તૈયાર', 'नया माह - उपस्थिति भरने के लिए तैयार', 'New month - ready for attendance entry')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>{tText('નવો માસ', 'नया माह', 'New Month')}</span>
              </span>
            )}

            {/* Total Working Days input */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg min-h-[38px] sm:min-h-[40px] border bg-[#f2edc2]/40 border-[#9fcb98]">
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
                className="w-11 sm:w-14 px-1 py-0.5 text-center text-xs font-bold rounded focus:ring-2 focus:ring-[#346739] focus:outline-none bg-white border border-[#9fcb98] text-[#346739]"
              />
              <span className="text-[11px] text-[#346739]/80 font-medium">{tText('દિવસ', 'दिन', 'Days')}</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>{tText('નોંધાયેલ તાલીમાર્થીઓ', 'पंजीकृत प्रशिक्षु', 'Enrolled Trainees')}</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-400">
              {t('total')} ({selectedUnitFilter === 'ALL' ? tText('તમામ યુનિટ', 'सभी यूनिट', 'All Units') : selectedUnitFilter})
            </div>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-200">
            <div className="flex items-center justify-between text-rose-700 text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-rose-600 fill-current" />
                <span>{tText('લાલ ફ્લેગ (<૮૦%)', 'लाल फ्लैग (<80%)', 'Red Flag (<80%)')}</span>
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-black text-rose-700">{stats.noticeRequired}</div>
            <div className="text-[11px] text-rose-600 font-semibold">{tText('સંચિત હાજરી <૮૦% (નોટિસ પાત્ર)', 'संचित <80%', 'Cumulative <80%')}</div>
          </div>

          <div className="p-3 bg-sky-50/70 rounded-lg border border-sky-200">
            <div className="flex items-center justify-between text-sky-800 text-xs font-medium mb-1">
              <span>{tText('પ્રગતિશીલ સુરક્ષિત', 'प्रगतिशील सुरक्षित', 'Progressive Safe')}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xl font-bold text-sky-900">{stats.progressiveSafe}</div>
            <div className="text-[11px] text-sky-700 font-semibold">{tText('સંચિત ≥૮૦% (નોટિસ મુક્ત)', 'संचित ≥80% (मुक्त)', 'Cumulative ≥80% (Safe)')}</div>
          </div>

          <div className="p-3 bg-[#79ae6f]/10 rounded-lg border border-[#9fcb98]/50">
            <div className="flex items-center justify-between text-[#346739] text-xs font-medium mb-1">
              <span>{t('regular')} (&ge;80%)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#79ae6f]" />
            </div>
            <div className="text-xl font-bold text-[#346739]">{stats.regular}</div>
            <div className="text-[11px] text-[#346739]/80 font-medium">{tText('માસિક ≥૮૦% નિયમિત', 'मासिक ≥80%', 'Monthly Regular')}</div>
          </div>

          <div className="p-3 bg-[#f2edc2]/40 rounded-lg border border-[#9fcb98]/40 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[#346739] text-xs font-medium mb-1">
              <span>{tText('સંચિત / માસિક સરેરાશ', 'संचित / मासिक औसत', 'Avg Progressive / Mo')}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#79ae6f]" />
            </div>
            <div className="text-xl font-bold text-[#346739] tabular-nums font-mono">{stats.avgProgressive}%</div>
            <div className="text-[11px] text-[#346739]/80 font-medium">{tText(`માસિક: ${stats.avgPercentage}%`, `मासिक: ${stats.avgPercentage}%`, `Monthly: ${stats.avgPercentage}%`)}</div>
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
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-bold text-xs transition-colors min-h-[34px] whitespace-nowrap ${
                statusFilter === 'flagged'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200'
              }`}
              title="સંચિત હાજરી ૮૦% થી ઓછી હોય તેવા લાલ ફ્લેગ તાલીમાર્થીઓ"
            >
              <Flag className="w-3 h-3 fill-current" />
              <span>{tText('લાલ ફ્લેગ <૮૦%', 'लाल फ्लैग <80%', 'Red Flag <80%')} ({stats.noticeRequired})</span>
            </button>
            <button
              onClick={() => setStatusFilter('progressive_safe')}
              className={`px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors min-h-[34px] whitespace-nowrap ${
                statusFilter === 'progressive_safe'
                  ? 'bg-sky-700 text-white font-bold'
                  : 'text-sky-800 hover:bg-sky-50'
              }`}
              title="ચાલુ માસમાં ૮૦% થી ઓછી પણ સરેરાશ પ્રગતિશીલ હાજરી ૮૦% કે વધુ હોવાથી નોટિસ મુક્ત"
            >
              {tText('પ્રગતિશીલ સુરક્ષિત', 'प्रगतिशील सुरक्षित', 'Progressive Safe')} ({stats.progressiveSafe})
            </button>
            <button
              onClick={() => setStatusFilter('regular')}
              className={`px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors min-h-[34px] whitespace-nowrap ${
                statusFilter === 'regular'
                  ? 'bg-[#79ae6f] text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tText('નિયમિત / મુક્ત', 'नियमित / सुरक्षित', 'Compliant')} ({stats.compliant})
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
            {tText('પસંદ કરેલ માપદંડ મુજબ કોઈ તાલીમાર્થી મળ્યા નથી.', 'कोई प्रशिक्षु नहीं मिला।', 'No trainees found matching the selected criteria.')}
          </div>
        ) : (
          filteredRows.map(({ trainee, record, present, absent, percentage, progressivePercentage, recordedMonthsCount, isProgressiveSafe, requiresNotice, isMonthlyLow, totalSessionWorking, totalSessionPresent, isRedFlag }) => (
            <div
              key={trainee.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all ${
                isProgressiveSafe
                  ? 'border-sky-300 bg-sky-50/20'
                  : requiresNotice
                  ? 'border-rose-300 bg-rose-50/10'
                  : 'border-slate-200'
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
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span>Enroll: {trainee.enrollment_no}</span>
                      {trainee.trade && (
                        <span className="font-sans font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[9px]">
                          {trainee.trade}
                        </span>
                      )}
                      {trainee.batch && (
                        <span className="font-sans font-bold text-[#346739] bg-[#f2edc2]/60 border border-[#9fcb98]/60 px-1.5 py-0.2 rounded text-[9px]">
                          બેચ {trainee.batch}
                        </span>
                      )}
                      {trainee.unit && (
                        <span className="font-sans font-bold text-sky-900 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded text-[9px]">
                          {trainee.unit}
                        </span>
                      )}
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

              {/* Card Attendance Progress & Progressive Metrics */}
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Monthly Percentage */}
                  <div className="bg-white p-2 rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium mb-0.5">{tText('ચાલુ માસિક', 'मासिक', 'Monthly')}</div>
                    <div className="flex items-baseline gap-1">
                      <span className={`font-mono font-bold text-sm tabular-nums ${isMonthlyLow ? 'text-amber-700' : 'text-slate-900'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progressive / Cumulative Percentage */}
                  <div className={`p-2 rounded border ${isProgressiveSafe ? 'bg-sky-50 border-sky-300' : requiresNotice ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200/80'}`}>
                    <div className="text-[10px] text-slate-500 font-medium mb-0.5 flex items-center justify-between">
                      <span>{tText('સંચિત / પ્રગતિશીલ', 'संचित', 'Cumulative')}</span>
                      <span className="text-[9px] text-slate-400 font-mono">({recordedMonthsCount} {tText('માસ', 'माह', 'mo')})</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`font-mono font-bold text-sm tabular-nums ${
                        isProgressiveSafe
                          ? 'text-sky-800 font-black'
                          : requiresNotice
                          ? 'text-rose-600 font-black'
                          : 'text-emerald-700'
                      }`}>
                        {progressivePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {totalSessionPresent}/{totalSessionWorking} દિવસ
                    </div>
                  </div>
                </div>

                {/* Month-Wise Attendance Breakdown */}
                <div className="pt-2 border-t border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-bold mb-1.5">
                    {tText('માસવાર હાજરી % (Month-wise):', 'माहवार उपस्थिति %:', 'Month-wise Attendance %:')}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {sessionRecordedMonths.map((mY) => {
                      const mStats = getTraineeMonthStats(trainee.id, mY, attendanceRecords);
                      const lbl = formatMonthHeaderLabel(mY);
                      return (
                        <div
                          key={mY}
                          className={`p-1.5 rounded border text-center ${
                            mY === selectedMonth ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="text-[9px] text-slate-500 truncate font-medium">
                            {tText(lbl.gu, lbl.hi, lbl.en)}
                          </div>
                          <div
                            className={`font-mono text-xs tabular-nums ${
                              mStats.recorded
                                ? mStats.isLow
                                ? 'text-rose-600 font-black'
                                : 'text-slate-900 font-bold'
                                : 'text-slate-400 font-medium'
                            }`}
                          >
                            {mStats.recorded ? `${mStats.percentage.toFixed(1)}%` : '-'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-500">{t('status')}:</span>
                  {isProgressiveSafe ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                      <CheckCircle2 className="w-2.5 h-2.5 text-sky-700 shrink-0" />
                      <span>{tText('પ્રગતિશીલ સુરક્ષિત (≥૮૦%)', 'प्रगतिशील सुरक्षित', 'Progressive Safe')}</span>
                    </span>
                  ) : requiresNotice ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                      <Flag className="w-2.5 h-2.5 text-rose-600 fill-current shrink-0" />
                      <span>{tText('🚩 લાલ ફ્લેગ (<૮૦%)', '🚩 लाल फ्लैग', '🚩 Red Flag (<80%)')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      <span>{tText('સંતોષકારક (નિયમિત)', 'संतोषजनक', 'Regular (≥80%)')}</span>
                    </span>
                  )}
                </div>

                {isProgressiveSafe && (
                  <div className="text-[10px] text-sky-900 bg-sky-100/70 p-1.5 rounded border border-sky-200 leading-tight">
                    {tText('✓ સરેરાશ પ્રગતિશીલ હાજરી ૮૦% કે વધુ હોવાથી નોટિસ કાઢવાની જરૂર નથી.', '✓ संचित उपस्थिति 80% या अधिक होने से नोटिस मुक्त।', '✓ Cumulative attendance ≥80%. Exempt from warning notice.')}
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit Attendance & Draft Notice */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTraineeId(trainee.id);
                    setIsAddAttendanceModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-[#f2edc2] hover:bg-[#e6dfa8] text-[#346739] border border-[#9fcb98] transition-all min-h-[40px] shadow-2xs"
                >
                  <FileEdit className="w-4 h-4 text-[#346739]" />
                  <span>{tText('હાજરી એડિટ (Edit)', 'उपस्थिति संपादित', 'Edit Attendance')}</span>
                </button>

                {requiresNotice && (
                  <button
                    type="button"
                    onClick={() => onDraftNotice(trainee, record)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs shadow-xs transition-all min-h-[40px] bg-rose-600 hover:bg-rose-700 text-white active:scale-98"
                  >
                    <span>{t('draftNotice')}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attendance Grid Table (Visible on desktop or when mobileViewMode is 'table') */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${
        mobileViewMode === 'table' ? 'block' : 'hidden md:block'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-14 text-center">{t('rollNo')}</th>
                <th className="py-3 px-3 min-w-[180px]">{t('studentName')}</th>
                <th className="py-3 px-3 hidden lg:table-cell w-32">{t('enrollmentNo')}</th>
                
                {/* Dynamic Month-Wise Percentage Columns for Recorded Months in Academic Session */}
                {sessionRecordedMonths.map((mY) => {
                  const lbl = formatMonthHeaderLabel(mY);
                  const isSelected = mY === selectedMonth;
                  return (
                    <th
                      key={mY}
                      className={`py-3 px-2 text-center border-x min-w-[82px] ${
                        isSelected
                          ? 'bg-emerald-50 text-[#346739] font-black border-emerald-200'
                          : 'border-slate-200'
                      }`}
                      title={mY}
                    >
                      <div className="leading-tight text-[11px]">
                        {tText(lbl.gu, lbl.hi, lbl.en)}
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-normal text-emerald-700 block tracking-normal">
                          ({tText('પસંદ કરેલ', 'चयनित', 'Active')})
                        </span>
                      )}
                    </th>
                  );
                })}

                <th className="py-3 px-3 text-center w-36 bg-sky-50/50 text-sky-950 font-bold border-x border-sky-100">
                  {tText('સંચિત / પ્રગતિશીલ %', 'संचित %', 'Progressive %')}
                </th>
                <th className="py-3 px-3 text-center w-36">{t('status')}</th>
                <th className="py-3 px-3 text-right w-40">{tText('કાર્યવાહી / એડિટ', 'कार्रवाई / संपादित', 'Actions / Edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6 + sessionRecordedMonths.length} className="py-10 text-center text-slate-400">
                    {tText('કોઈ તાલીમાર્થી મળ્યા નથી.', 'कोई प्रशिक्षु नहीं मिला।', 'No trainees found.')}
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ trainee, record, percentage, progressivePercentage, recordedMonthsCount, isProgressiveSafe, requiresNotice, totalSessionWorking, totalSessionPresent }) => {
                  return (
                    <tr
                      key={trainee.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isProgressiveSafe
                          ? 'bg-sky-50/20'
                          : requiresNotice
                          ? 'bg-rose-50/25'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {trainee.roll_no}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 text-sm">
                          {trainee.surname} {trainee.student_name} {trainee.father_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>{trainee.surname_en} {trainee.student_name_en} {trainee.father_name_en}</span>
                          {trainee.trade && (
                            <span className="font-sans font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[9px]">
                              {trainee.trade}
                            </span>
                          )}
                          {trainee.batch && (
                            <span className="font-sans font-bold text-[#346739] bg-[#f2edc2]/60 border border-[#9fcb98]/60 px-1.5 py-0.2 rounded text-[9px]">
                              બેચ {trainee.batch}
                            </span>
                          )}
                          {trainee.unit && (
                            <span className="font-sans font-bold text-sky-900 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded text-[9px]">
                              {trainee.unit}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell font-mono text-[11px] text-slate-500">
                        {trainee.enrollment_no}
                      </td>

                      {/* Month-Wise Percentage Columns: if < 80 then RED font */}
                      {sessionRecordedMonths.map((mY) => {
                        const mStats = getTraineeMonthStats(trainee.id, mY, attendanceRecords);
                        return (
                          <td
                            key={mY}
                            className={`py-3 px-2 text-center border-x ${
                              mY === selectedMonth ? 'bg-emerald-50/20 border-emerald-100' : 'border-slate-100'
                            }`}
                          >
                            {mStats.recorded ? (
                              <div className="flex flex-col items-center">
                                <span
                                  className={`font-mono text-sm tabular-nums ${
                                    mStats.isLow
                                      ? 'text-rose-600 font-black'
                                      : 'text-slate-900 font-bold'
                                  }`}
                                  title={`${mY}: ${mStats.presentDays}/${mStats.workingDays} દિવસ (${mStats.percentage.toFixed(2)}%)`}
                                >
                                  {mStats.percentage.toFixed(1)}%
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {mStats.presentDays}/{mStats.workingDays}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono text-xs" title="નોંધાયેલ નથી (Not Recorded)">
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Cumulative % Column: if < 80 then RED font */}
                      <td className={`py-3 px-3 text-center border-x ${
                        isProgressiveSafe ? 'bg-sky-50/70 border-sky-200' : 'bg-slate-50/40 border-slate-100'
                      }`}>
                        <div className="flex flex-col items-center">
                          <span
                            className={`font-mono text-sm tabular-nums ${
                              requiresNotice
                                ? 'text-rose-600 font-black'
                                : isProgressiveSafe
                                ? 'text-sky-800 font-black'
                                : 'text-emerald-700 font-black'
                            }`}
                          >
                            {progressivePercentage.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {totalSessionPresent}/{totalSessionWorking} દિવસ ({recordedMonthsCount} માસ)
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3 px-3 text-center">
                        {isProgressiveSafe ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300"
                            title={tText('ચાલુ માસમાં ૮૦% થી ઓછી પણ સરેરાશ સંચિત હાજરી ૮૦% કે વધુ હોવાથી નોટિસ મુક્ત', 'संचित उपस्थिति 80% से अधिक होने के कारण नोटिस मुक्त', 'Monthly <80% but Cumulative >=80%. Compliant & Exempt from notice.')}
                          >
                            <CheckCircle2 className="w-3 h-3 text-sky-700 shrink-0" />
                            <span>{tText('સંચિત સુરક્ષિત', 'संचित सुरक्षित', 'Cumulative Safe')}</span>
                          </span>
                        ) : requiresNotice ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs"
                            title={tText('સંચિત હાજરી ૮૦% થી ઓછી હોવાથી લાલ ફ્લેગ - નોટિસ જરૂરી', 'संचित उपस्थिति 80% से कम - लाल फ्लैग', 'Cumulative <80% - Red Flag')}
                          >
                            <Flag className="w-3.5 h-3.5 text-rose-600 fill-current shrink-0" />
                            <span>{tText('🚩 લાલ ફ્લેગ (<૮૦%)', '🚩 लाल फ्लैग', '🚩 Red Flag (<80%)')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>{tText('નિયમિત (≥૮૦%)', 'નિયમિત', 'Regular')}</span>
                          </span>
                        )}
                      </td>

                      {/* Action Column with Edit button at the end for each student */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTraineeId(trainee.id);
                              setIsAddAttendanceModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#f2edc2] hover:bg-[#e6dfa8] text-[#346739] border border-[#9fcb98] transition-all active:scale-95 shadow-2xs min-h-[32px]"
                            title={tText('આ તાલીમાર્થી અને વર્ગની હાજરી એડિટ કરો', 'उपस्थिति संपादित करें', 'Edit Attendance')}
                          >
                            <FileEdit className="w-3.5 h-3.5 text-[#346739]" />
                            <span>{tText('એડિટ', 'संपादित', 'Edit')}</span>
                          </button>

                          {requiresNotice && (
                            <button
                              type="button"
                              onClick={() => onDraftNotice(trainee, record)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-2xs transition-all bg-rose-600 hover:bg-rose-700 text-white active:scale-95 min-h-[32px]"
                              title={t('draftNotice')}
                            >
                              <span>{tText('નોટિસ', 'नोटिस', 'Notice')}</span>
                            </button>
                          )}
                        </div>
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
                  <strong className="text-slate-900">
                    {selectedTradeFilter === 'ALL' ? instructor.trade : selectedTradeFilter}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">{tText('યુનિટ / બેચ:', 'यूनिट / बैच:', 'Unit / Batch:')}</span>{' '}
                  <strong className="text-slate-900">
                    {selectedUnitFilter === 'ALL' ? instructor.unit : selectedUnitFilter} / {selectedBatchFilter === 'ALL' ? instructor.batch : selectedBatchFilter}
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

            {/* Attendance Table: Month-Wise Breakdown (Image 2) */}
            <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-400 py-1.5 px-1.5 text-center w-8">{t('rollNo')}</th>
                  <th className="border border-slate-400 py-1.5 px-2 text-left min-w-[130px]">
                    {t('studentName')}
                  </th>
                  <th className="border border-slate-400 py-1.5 px-1.5 text-center w-20">{t('enrollmentNo')}</th>

                  {/* Dynamic Month-Wise Columns in Print Preview */}
                  {sessionRecordedMonths.map((mY) => {
                    const lbl = formatMonthHeaderLabel(mY);
                    return (
                      <th key={mY} className="border border-slate-400 py-1.5 px-1 text-center min-w-[50px]">
                        {lbl.gu}
                      </th>
                    );
                  })}

                  <th className="border border-slate-400 py-1.5 px-1 text-center w-11">{tText('કુલ', 'कुल', 'Total')}</th>
                  <th className="border border-slate-400 py-1.5 px-1 text-center w-11">{tText('હાજર', 'उपस्थित', 'Pres.')}</th>
                  <th className="border border-slate-400 py-1.5 px-1 text-center w-14 bg-sky-50/70 font-bold text-sky-950">
                    {tText('સંચિત %', 'संचित %', 'Prog. %')}
                  </th>
                  <th className="border border-slate-400 py-1.5 px-1.5 text-center w-24">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {traineeRows.map((row) => (
                  <tr
                    key={row.trainee.id}
                    className={
                      row.isProgressiveSafe
                        ? 'bg-sky-50/30'
                        : row.requiresNotice
                        ? 'bg-rose-50/50'
                        : 'even:bg-slate-50/50'
                    }
                  >
                    <td className="border border-slate-400 py-1 px-1 text-center font-bold font-mono">
                      {row.trainee.roll_no}
                    </td>
                    <td className="border border-slate-400 py-1 px-2">
                      <div className="font-bold text-slate-900 leading-tight">
                        {formatFullName(row.trainee)}
                      </div>
                      <div className="text-[9px] text-slate-500 font-sans">
                        {row.trainee.surname_en} {row.trainee.student_name_en} {row.trainee.father_name_en}
                      </div>
                    </td>
                    <td className="border border-slate-400 py-1 px-1 text-center font-mono text-[9px] text-slate-600">
                      {row.trainee.enrollment_no}
                    </td>

                    {/* Month-Wise Attendance % for each student: <80% in bold red font */}
                    {sessionRecordedMonths.map((mY) => {
                      const mStats = getTraineeMonthStats(row.trainee.id, mY, attendanceRecords);
                      return (
                        <td
                          key={mY}
                          className="border border-slate-400 py-1 px-1 text-center font-mono text-[10px]"
                          style={{
                            color: mStats.recorded && mStats.isLow ? '#dc2626' : '#0f172a',
                            fontWeight: mStats.recorded && mStats.isLow ? 'bold' : 'normal',
                            backgroundColor: mStats.recorded && mStats.isLow ? '#fef2f2' : 'transparent',
                          }}
                        >
                          {mStats.recorded ? `${mStats.percentage.toFixed(1)}%` : '-'}
                        </td>
                      );
                    })}

                    <td className="border border-slate-400 py-1 px-1 text-center font-semibold text-slate-800">
                      {row.totalSessionWorking}
                    </td>
                    <td className="border border-slate-400 py-1 px-1 text-center font-bold text-slate-900">
                      {row.totalSessionPresent}
                    </td>
                    <td
                      className="border border-slate-400 py-1 px-1 text-center font-black font-mono tabular-nums text-[10px]"
                      style={{
                        color: row.requiresNotice ? '#dc2626' : row.isProgressiveSafe ? '#0369a1' : '#15803d',
                        backgroundColor: row.requiresNotice ? '#fef2f2' : row.isProgressiveSafe ? '#f0f9ff' : 'transparent',
                      }}
                    >
                      {row.progressivePercentage.toFixed(1)}%
                    </td>
                    <td className="border border-slate-400 py-1 px-1 text-center text-[9px]">
                      {row.isProgressiveSafe ? (
                        <span className="font-bold text-sky-900 px-1 py-0.5 bg-sky-100 rounded inline-block whitespace-nowrap">
                          {tText('સંચિત સુરક્ષિત', 'प्रगतिशील सुरक्षित', 'Progressive Safe')}
                        </span>
                      ) : row.requiresNotice ? (
                        <span className="font-bold text-rose-700 px-1 py-0.5 bg-rose-100 rounded inline-block whitespace-nowrap">
                          {tText('લાલ ફ્લેગ (<૮૦%)', 'लाल फ्लैग', 'Red Flag (<80%)')}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700 inline-block whitespace-nowrap">
                          {tText('નિયમિત', 'नियमित', 'Regular')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Attendance Analytics Box */}
            <div className="grid grid-cols-4 gap-2.5 p-2.5 bg-slate-50 border border-slate-300 rounded mb-8 text-[11px]">
              <div>
                <span className="text-slate-500">{tText('કુલ તાલીમાર્થીઓ:', 'कुल प्रशिक्षु:', 'Total Trainees:')}</span>{' '}
                <strong className="text-slate-900">{stats.total}</strong>
              </div>
              <div>
                <span className="text-slate-500">{tText('નોટિસ પાત્ર (<૮૦%):', 'नोटिस आवश्यक (<80%):', 'Notice Required (<80%):')}</span>{' '}
                <strong className="text-rose-700">{stats.noticeRequired}</strong>
              </div>
              <div>
                <span className="text-slate-500">{tText('પ્રગતિશીલ સુરક્ષિત:', 'प्रगतिशील सुरक्षित:', 'Progressive Safe:')}</span>{' '}
                <strong className="text-sky-800">{stats.progressiveSafe} {tText('(નોટિસ મુક્ત)', '(मुक्त)', '(Exempt)')}</strong>
              </div>
              <div>
                <span className="text-slate-500">{tText('સંચિત / માસિક સરેરાશ:', 'संचित / मासिक औसत:', 'Avg Progressive / Mo:')}</span>{' '}
                <strong className="text-blue-900">{stats.avgProgressive}% / {stats.avgPercentage}%</strong>
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

      {/* Dedicated Add / Edit Attendance Modal Window */}
      {isAddAttendanceModalOpen && (
        <AddAttendanceModal
          isOpen={isAddAttendanceModalOpen}
          onClose={() => {
            setIsAddAttendanceModalOpen(false);
            setEditingTraineeId(undefined);
          }}
          selectedMonth={selectedMonth}
          trainees={trainees}
          existingRecords={attendanceRecords}
          instructor={instructor}
          isGuest={isGuest}
          highlightTraineeId={editingTraineeId}
          initialTradeFilter={selectedTradeFilter}
          initialBatchFilter={selectedBatchFilter}
          initialUnitFilter={selectedUnitFilter}
          onSaveAttendance={(savedRecords) => {
            if (savedRecords.length > 0) {
              const savedMonthYear = savedRecords[0].month_year;
              if (savedMonthYear) {
                const parts = savedMonthYear.trim().split(/\s+/);
                const yr = parseInt(parts[parts.length - 1], 10);
                const mName = parts.slice(0, parts.length - 1).join(' ');
                if (!isNaN(yr)) setSelectedYear(yr);
                if (mName) setSelectedMonthName(mName);
              }
              if (savedRecords[0].total_working_days) {
                setWorkingDaysInput(Number(savedRecords[0].total_working_days));
              }
            }
            onUpdateAttendance(savedRecords);
            setIsSavedNotice(true);
            setTimeout(() => setIsSavedNotice(false), 4000);
          }}
        />
      )}
    </div>
  );
}
