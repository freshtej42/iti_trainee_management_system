import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Calendar,
  Clock,
  Search,
  Check,
  Plus,
  Minus,
  Sparkles,
  UserCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Trainee, AttendanceRecord, Instructor } from '../types';
import { calculateProgressiveAttendance, ATTENDANCE_THRESHOLD } from '../utils/progressiveAttendance';
import { formatFullName } from '../utils/mergeTags';

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // e.g. "August 2026" or "September 2026"
  trainees: Trainee[];
  existingRecords: AttendanceRecord[]; // All historical records
  instructor: Instructor;
  isGuest?: boolean;
  highlightTraineeId?: string;
  initialTradeFilter?: string;
  initialBatchFilter?: string;
  initialUnitFilter?: string;
  onSaveAttendance: (savedRecords: AttendanceRecord[]) => void;
}

interface StudentAttendanceDraft {
  traineeId: string;
  workingDays: number;
  presentDays: number;
  isCustomWorkingDays: boolean; // Flagged if instructor manually changed for late admission
}

const ALL_MONTHS = [
  { name: 'August', gu: 'ઓગસ્ટ', hi: 'अगस्त' },
  { name: 'September', gu: 'સપ્ટેમ્બર', hi: 'सितंबर' },
  { name: 'October', gu: 'ઓક્ટોબર', hi: 'अक्टूबर' },
  { name: 'November', gu: 'નવેમ્બર', hi: 'नवंबर' },
  { name: 'December', gu: 'ડિસેમ્બર', hi: 'दिसंबर' },
  { name: 'January', gu: 'જાન્યુઆરી', hi: 'जनवरी' },
  { name: 'February', gu: 'ફેબ્રુઆરી', hi: 'फ़रवरी' },
  { name: 'March', gu: 'માર્ચ', hi: 'मार्च' },
  { name: 'April', gu: 'એપ્રિલ', hi: 'अप्रैल' },
  { name: 'May', gu: 'મે', hi: 'मई' },
  { name: 'June', gu: 'જૂન', hi: 'जून' },
  { name: 'July', gu: 'જુલાઈ', hi: 'जुलाई' },
];

export default function AddAttendanceModal({
  isOpen,
  onClose,
  selectedMonth,
  trainees,
  existingRecords,
  instructor,
  highlightTraineeId,
  initialTradeFilter = 'ALL',
  initialBatchFilter = 'ALL',
  initialUnitFilter = 'ALL',
  onSaveAttendance,
}: AddAttendanceModalProps) {
  // Parse initial month and year from selectedMonth prop
  const initialYear = useMemo(() => {
    const parts = (selectedMonth || 'August 2026').trim().split(/\s+/);
    const parsed = parseInt(parts[parts.length - 1], 10);
    return isNaN(parsed) ? 2026 : parsed;
  }, [selectedMonth]);

  const initialMonthName = useMemo(() => {
    const parts = (selectedMonth || 'August 2026').trim().split(/\s+/);
    return parts.slice(0, parts.length - 1).join(' ') || 'August';
  }, [selectedMonth]);

  const [activeYear, setActiveYear] = useState<number>(initialYear);
  const [activeMonthName, setActiveMonthName] = useState<string>(initialMonthName);
  const currentMonthYear = `${activeMonthName} ${activeYear}`;

  // Trade, Batch, and Unit filter state inside modal
  const [selectedTrade, setSelectedTrade] = useState<string>(initialTradeFilter);
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatchFilter);
  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnitFilter);

  // Sync state if selectedMonth or initial filters change when reopened
  useEffect(() => {
    if (isOpen) {
      const parts = (selectedMonth || 'August 2026').trim().split(/\s+/);
      const parsedYr = parseInt(parts[parts.length - 1], 10);
      const parsedMName = parts.slice(0, parts.length - 1).join(' ') || 'August';
      setActiveYear(isNaN(parsedYr) ? 2026 : parsedYr);
      setActiveMonthName(parsedMName);
      setSelectedTrade(initialTradeFilter || 'ALL');
      setSelectedBatch(initialBatchFilter || 'ALL');
      setSelectedUnit(initialUnitFilter || 'ALL');
    }
  }, [isOpen, selectedMonth, initialTradeFilter, initialBatchFilter, initialUnitFilter]);

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

  // Available Batches (scoped to selectedTrade if a specific trade is chosen)
  const availableBatches = useMemo(() => {
    const batchSet = new Set<string>();
    if (selectedTrade !== 'ALL') {
      const hierarchyTrade = instructor.academic_hierarchy?.find((t) => t.name === selectedTrade);
      hierarchyTrade?.batches?.forEach((b) => {
        if (b.name) batchSet.add(b.name);
      });
      trainees
        .filter((tr) => (tr.trade || instructor.trade) === selectedTrade)
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
  }, [instructor, trainees, selectedTrade]);

  // Reset batch filter if no longer valid for selected trade
  useEffect(() => {
    if (selectedBatch !== 'ALL' && availableBatches.length > 0 && !availableBatches.includes(selectedBatch)) {
      setSelectedBatch('ALL');
    }
  }, [selectedTrade, availableBatches, selectedBatch]);

  // Available Units (scoped to selectedTrade and selectedBatch if chosen)
  const availableUnits = useMemo(() => {
    const unitSet = new Set<string>();
    const hierarchyTrades =
      selectedTrade !== 'ALL'
        ? instructor.academic_hierarchy?.filter((t) => t.name === selectedTrade) || []
        : instructor.academic_hierarchy || [];

    hierarchyTrades.forEach((t) => {
      const batches =
        selectedBatch !== 'ALL'
          ? t.batches?.filter((b) => b.name === selectedBatch) || []
          : t.batches || [];
      batches.forEach((b) => {
        b.units?.forEach((u) => {
          if (u.name) unitSet.add(u.name);
        });
      });
    });

    if (selectedTrade === 'ALL' && selectedBatch === 'ALL') {
      instructor.units?.forEach((u) => {
        if (u) unitSet.add(u);
      });
      if (instructor.unit) unitSet.add(instructor.unit);
    }

    trainees
      .filter((tr) => {
        const trTrade = tr.trade || instructor.trade;
        const trBatch = tr.batch || instructor.batch;
        const matchesTrade = selectedTrade === 'ALL' || trTrade === selectedTrade;
        const matchesBatch = selectedBatch === 'ALL' || trBatch === selectedBatch;
        return matchesTrade && matchesBatch;
      })
      .forEach((tr) => {
        if (tr.unit) unitSet.add(tr.unit);
      });

    return Array.from(unitSet);
  }, [instructor, trainees, selectedTrade, selectedBatch]);

  // Reset unit filter if no longer valid for selected trade/batch
  useEffect(() => {
    if (selectedUnit !== 'ALL' && availableUnits.length > 0 && !availableUnits.includes(selectedUnit)) {
      setSelectedUnit('ALL');
    }
  }, [selectedTrade, selectedBatch, availableUnits, selectedUnit]);

  // Trainees scoped by selected Trade, Batch & Unit
  const cohortTrainees = useMemo(() => {
    return trainees.filter((tr) => {
      const trTrade = tr.trade || instructor.trade;
      const trBatch = tr.batch || instructor.batch;
      const trUnit = tr.unit || instructor.unit;
      const matchesTrade = selectedTrade === 'ALL' || trTrade === selectedTrade;
      const matchesBatch = selectedBatch === 'ALL' || trBatch === selectedBatch;
      const matchesUnit = selectedUnit === 'ALL' || trUnit === selectedUnit;
      return matchesTrade && matchesBatch && matchesUnit;
    });
  }, [trainees, instructor.trade, instructor.batch, instructor.unit, selectedTrade, selectedBatch, selectedUnit]);

  const cohortTraineeIds = useMemo(() => new Set(cohortTrainees.map((t) => t.id)), [cohortTrainees]);

  // Current month's records
  const monthRecords = useMemo(() => {
    return existingRecords.filter((r) => r.month_year === currentMonthYear);
  }, [existingRecords, currentMonthYear]);

  // Current month's records for the active Trade/Batch cohort
  const cohortMonthRecords = useMemo(() => {
    return monthRecords.filter((r) => cohortTraineeIds.has(r.trainee_id));
  }, [monthRecords, cohortTraineeIds]);

  // Initial global working days: read from first existing cohort record or default to 24
  const initialDefaultWorkingDays = cohortMonthRecords[0]?.total_working_days || monthRecords[0]?.total_working_days || 24;
  const [batchWorkingDays, setBatchWorkingDays] = useState<number>(initialDefaultWorkingDays);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'red_flag' | 'safe'>('all');

  // Draft state map: traineeId -> draft entry
  const [drafts, setDrafts] = useState<Record<string, StudentAttendanceDraft>>({});

  // Sync batchWorkingDays when cohort changes
  useEffect(() => {
    const cohortDays = cohortMonthRecords[0]?.total_working_days || monthRecords[0]?.total_working_days || 24;
    setBatchWorkingDays(cohortDays);
  }, [selectedTrade, selectedBatch, selectedUnit, cohortMonthRecords, monthRecords]);

  // Initialize draft entries whenever modal opens or month changes
  useEffect(() => {
    if (!isOpen) return;

    const baseDays = monthRecords[0]?.total_working_days || 24;
    setBatchWorkingDays(baseDays);

    const initialMap: Record<string, StudentAttendanceDraft> = {};

    trainees.forEach((tr) => {
      const rec = monthRecords.find((r) => r.trainee_id === tr.id);
      if (rec) {
        initialMap[tr.id] = {
          traineeId: tr.id,
          workingDays: rec.total_working_days,
          presentDays: rec.present_days,
          isCustomWorkingDays: rec.total_working_days !== baseDays,
        };
      } else {
        // Default new entry: standard preset
        const defaultPres = Math.round(baseDays * 0.85); // 85% default initial
        initialMap[tr.id] = {
          traineeId: tr.id,
          workingDays: baseDays,
          presentDays: defaultPres,
          isCustomWorkingDays: false,
        };
      }
    });

    setDrafts(initialMap);
  }, [isOpen, currentMonthYear, trainees, monthRecords]);

  // Apply batch working days across active Trade/Batch cohort trainees without destructively clamping presentDays mid-typing
  const handleBatchWorkingDaysChange = (newVal: number) => {
    const safeDays = isNaN(newVal) ? 0 : Math.max(0, Math.min(31, newVal));
    setBatchWorkingDays(safeDays);

    setDrafts((prev) => {
      const next = { ...prev };
      cohortTrainees.forEach((tr) => {
        const id = tr.id;
        if (next[id] && !next[id].isCustomWorkingDays) {
          next[id] = {
            ...next[id],
            workingDays: safeDays,
          };
        }
      });
      return next;
    });
  };

  // Force apply batch working days to all students in the selected Trade/Batch cohort
  const handleForceApplyToAll = () => {
    setDrafts((prev) => {
      const next = { ...prev };
      cohortTrainees.forEach((tr) => {
        const id = tr.id;
        if (next[id]) {
          const nextPresent = Math.min(batchWorkingDays, next[id].presentDays);
          next[id] = {
            ...next[id],
            workingDays: batchWorkingDays,
            presentDays: nextPresent,
            isCustomWorkingDays: false,
          };
        }
      });
      return next;
    });
  };

  // Mark all students in the selected Trade/Batch cohort 100% present
  const handleMarkAllPresent = () => {
    setDrafts((prev) => {
      const next = { ...prev };
      cohortTrainees.forEach((tr) => {
        const id = tr.id;
        if (next[id]) {
          next[id] = {
            ...next[id],
            presentDays: next[id].workingDays,
          };
        }
      });
      return next;
    });
  };

  // Update individual student's working days (supports Late Admission)
  const handleStudentWorkingDaysChange = (traineeId: string, valStr: string) => {
    const val = parseInt(valStr, 10);
    const safeVal = isNaN(val) ? 0 : Math.max(0, Math.min(31, val));

    setDrafts((prev) => {
      const curr = prev[traineeId] || {
        traineeId,
        workingDays: batchWorkingDays,
        presentDays: batchWorkingDays,
        isCustomWorkingDays: true,
      };
      return {
        ...prev,
        [traineeId]: {
          ...curr,
          workingDays: safeVal,
          isCustomWorkingDays: safeVal !== batchWorkingDays,
        },
      };
    });
  };

  // Update individual student's present days
  const handleStudentPresentDaysChange = (traineeId: string, valStr: string) => {
    const val = parseInt(valStr, 10);
    setDrafts((prev) => {
      const curr = prev[traineeId] || {
        traineeId,
        workingDays: batchWorkingDays,
        presentDays: 0,
        isCustomWorkingDays: false,
      };
      const maxDays = Math.max(1, curr.workingDays || batchWorkingDays || 31);
      const safeVal = isNaN(val) ? 0 : Math.max(0, Math.min(maxDays, val));
      return {
        ...prev,
        [traineeId]: {
          ...curr,
          presentDays: safeVal,
        },
      };
    });
  };

  // Quick stepper for present days (+1 / -1)
  const handleStepPresent = (traineeId: string, delta: number) => {
    const curr = drafts[traineeId];
    if (!curr) return;
    const nextVal = curr.presentDays + delta;
    handleStudentPresentDaysChange(traineeId, nextVal.toString());
  };

  // Computed rows for the selected Trade/Batch cohort with real-time monthly and cumulative attendance
  const rows = useMemo(() => {
    return cohortTrainees.map((tr) => {
      const draft = drafts[tr.id] || {
        traineeId: tr.id,
        workingDays: batchWorkingDays,
        presentDays: batchWorkingDays,
        isCustomWorkingDays: false,
      };

      const working = Math.max(1, draft.workingDays || batchWorkingDays || 1);
      const present = Math.min(working, Math.max(0, draft.presentDays));
      const absent = Math.max(0, working - present);
      const monthlyPercentage = working > 0 ? Number(((present / working) * 100).toFixed(2)) : 0;
      const isMonthlyLow = monthlyPercentage < ATTENDANCE_THRESHOLD;

      // Construct transient record for cumulative calculation
      const tempCurrentRec: AttendanceRecord = {
        id: `att-${tr.id}-${currentMonthYear.replace(/\s+/g, '_')}`,
        trainee_id: tr.id,
        instructor_id: instructor.id,
        month_year: currentMonthYear,
        total_working_days: working,
        present_days: present,
        absent_days: absent,
        attendance_percentage: monthlyPercentage,
        flagged_low: isMonthlyLow,
        updated_at: new Date().toISOString(),
      };

      // Calculate cumulative metrics across all session months + this draft
      const progStats = calculateProgressiveAttendance(tr.id, tempCurrentRec, existingRecords);

      return {
        trainee: tr,
        draft,
        working,
        present,
        absent,
        monthlyPercentage,
        isMonthlyLow,
        cumulativePercentage: progStats.progressivePercentage,
        totalSessionWorking: progStats.totalWorkingDaysToDate,
        totalSessionPresent: progStats.totalPresentDaysToDate,
        recordedMonthsCount: progStats.recordedMonthsCount,
        isProgressiveSafe: progStats.isProgressiveSafe,
        isRedFlag: progStats.isRedFlag, // Cumulative < 80%
        requiresNotice: progStats.requiresNotice,
        isCustomWorkingDays: draft.isCustomWorkingDays,
      };
    });
  }, [cohortTrainees, drafts, batchWorkingDays, currentMonthYear, instructor.id, existingRecords]);

  // Filtered rows for search and filter buttons
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.trainee.roll_no.includes(q) ||
        r.trainee.student_name.toLowerCase().includes(q) ||
        r.trainee.surname.toLowerCase().includes(q) ||
        (r.trainee.student_name_en && r.trainee.student_name_en.toLowerCase().includes(q)) ||
        (r.trainee.enrollment_no && r.trainee.enrollment_no.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterType === 'red_flag') return r.isRedFlag;
      if (filterType === 'safe') return !r.isRedFlag;
      return true;
    });
  }, [rows, searchQuery, filterType]);

  // Overall summary metrics
  const summary = useMemo(() => {
    const total = rows.length;
    const redFlagCount = rows.filter((r) => r.isRedFlag).length;
    const safeCount = total - redFlagCount;
    const avgMonthly =
      total > 0 ? (rows.reduce((acc, r) => acc + r.monthlyPercentage, 0) / total).toFixed(1) : '0.0';
    const avgCumulative =
      total > 0 ? (rows.reduce((acc, r) => acc + r.cumulativePercentage, 0) / total).toFixed(1) : '0.0';

    return {
      total,
      redFlagCount,
      safeCount,
      avgMonthly,
      avgCumulative,
    };
  }, [rows]);

  // Handle Save
  const handleSave = () => {
    const recordsToSave: AttendanceRecord[] = rows.map((r) => {
      const existing = monthRecords.find((m) => m.trainee_id === r.trainee.id);
      return {
        id: existing?.id || `att-${r.trainee.id}-${currentMonthYear.replace(/\s+/g, '_')}`,
        trainee_id: r.trainee.id,
        instructor_id: instructor.id,
        month_year: currentMonthYear,
        total_working_days: r.working,
        present_days: r.present,
        absent_days: r.absent,
        attendance_percentage: r.monthlyPercentage,
        flagged_low: r.isMonthlyLow,
        progressive_attendance_percentage: r.cumulativePercentage,
        progressive_recorded_months: r.recordedMonthsCount,
        progressive_safe: r.isProgressiveSafe,
        requires_notice: r.requiresNotice,
        updated_at: new Date().toISOString(),
      };
    });

    onSaveAttendance(recordsToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#346739] text-[#f2edc2] flex items-center justify-center shadow-xs shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  માસિક હાજરી પત્રક (Mark Attendance)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f2edc2] text-[#346739] border border-[#9fcb98]">
                  {currentMonthYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {instructor.iti_name} • {selectedTrade === 'ALL' ? 'તમામ ટ્રેડ (All Trades)' : selectedTrade} • બેચ: {selectedBatch === 'ALL' ? 'તમામ બેચ (All Batches)' : selectedBatch} • યુનિટ: {selectedUnit === 'ALL' ? 'તમામ યુનિટ (All Units)' : selectedUnit}
              </p>
            </div>
          </div>

          {/* Interactive Trade, Batch, Unit, Year & Month Selectors */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Trade Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs">
              <Briefcase className="w-3.5 h-3.5 text-[#346739] shrink-0" />
              <label className="font-bold text-slate-600">ટ્રેડ:</label>
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer max-w-[160px] truncate pr-1"
              >
                <option value="ALL">તમામ ટ્રેડ (All Trades)</option>
                {availableTrades.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs">
              <Layers className="w-3.5 h-3.5 text-[#346739] shrink-0" />
              <label className="font-bold text-slate-600">બેચ:</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">તમામ બેચ (All Batches)</option>
                {availableBatches.map((b) => (
                  <option key={b} value={b}>
                    બેચ {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs">
              <Layers className="w-3.5 h-3.5 text-[#346739] shrink-0" />
              <label className="font-bold text-slate-600">યુનિટ:</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">તમામ યુનિટ (All Units)</option>
                {availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs">
              <label className="font-bold text-slate-600">વર્ષ:</label>
              <select
                value={activeYear}
                onChange={(e) => setActiveYear(parseInt(e.target.value, 10))}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
              >
                {[2026, 2027, 2028, 2029, 2030].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              <span className="text-slate-300">|</span>

              <label className="font-bold text-slate-600">માસ:</label>
              <select
                value={activeMonthName}
                onChange={(e) => setActiveMonthName(e.target.value)}
                className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
              >
                {ALL_MONTHS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.gu} ({m.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="બંધ કરો (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Controls & Batch Working Days Strip */}
        <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Global Working Days input with Late Admission Note */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs">
                <Clock className="w-4 h-4 text-[#346739] shrink-0" />
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  કુલ કામકાજના દિવસો (બેચ):
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={batchWorkingDays}
                  onChange={(e) => handleBatchWorkingDaysChange(parseInt(e.target.value, 10))}
                  className="w-14 px-2 py-1 text-center text-xs font-black text-[#346739] bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-[#346739] focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">દિવસ</span>
              </div>

              <button
                type="button"
                onClick={handleForceApplyToAll}
                className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                title="આ દિવસો તમામ તાલીમાર્થીઓને લાગુ કરો"
              >
                તમામને લાગુ કરો
              </button>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>તમામને પૂર્ણ હાજર કરો</span>
              </button>
            </div>

            {/* Right: Late Admission Note */}
            <div className="text-[11px] text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
              💡 <strong>મોડેથી પ્રવેશ (Late Admission):</strong> જે વિદ્યાર્થીઓ મોડેથી આવ્યા હોય તેમના માટે નીચે &apos;કામકાજના દિવસો&apos; કોલમમાં સીધા ઓછા દિવસો દાખલ કરી શકાય છે.
            </div>
          </div>

          {/* Quick Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200/60">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="રોલ નં અથવા નામ દ્વારા શોધો..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#346739]"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">ફિલ્ટર:</span>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                બધા ({summary.total})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('red_flag')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                  filterType === 'red_flag'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <Flag className="w-3 h-3 fill-current" />
                <span>લાલ ફ્લેગ (&lt;૮૦%): {summary.redFlagCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('safe')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                  filterType === 'safe'
                    ? 'bg-sky-700 text-white'
                    : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>સુરક્ષિત (≥૮૦%): {summary.safeCount}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Entry Table Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-y border-slate-300 font-bold">
                <th className="py-2.5 px-3 text-center w-12">રોલ નં</th>
                <th className="py-2.5 px-3">તાલીમાર્થીનું નામ</th>
                <th className="py-2.5 px-3 text-center w-28 bg-amber-50/50">
                  <div className="leading-tight">કામકાજના દિવસ</div>
                  <div className="text-[9px] font-normal text-amber-800">(મોડેથી પ્રવેશ માટે એડિટ)</div>
                </th>
                <th className="py-2.5 px-3 text-center w-36">હાજર દિવસો</th>
                <th className="py-2.5 px-2 text-center w-14 text-slate-500">ગેરહાજર</th>
                <th className="py-2.5 px-3 text-center w-20">માસિક %</th>
                <th className="py-2.5 px-3 text-center w-32 bg-sky-50 text-sky-950 font-black">
                  <div className="leading-tight">સંચિત સત્ર %</div>
                  <div className="text-[9px] font-normal text-sky-700">(કુલ હાજર ÷ કુલ કામકાજ)</div>
                </th>
                <th className="py-2.5 px-3 text-center w-36">સ્થિતિ અને ફ્લેગ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    કોઈ તાલીમાર્થી મળ્યા નથી.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr
                    key={r.trainee.id}
                    id={`trainee-row-${r.trainee.id}`}
                    className={`transition-colors hover:bg-slate-50 ${
                      r.trainee.id === highlightTraineeId
                        ? 'ring-2 ring-[#346739] bg-[#f2edc2]/40'
                        : r.isRedFlag
                        ? 'bg-rose-50/40'
                        : r.isProgressiveSafe
                        ? 'bg-sky-50/30'
                        : 'bg-white'
                    }`}
                  >
                    {/* Roll No */}
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-800">
                      {r.trainee.roll_no}
                    </td>

                    {/* Student Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{formatFullName(r.trainee)}</span>
                        {r.trainee.id === highlightTraineeId && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-[#346739] text-[#f2edc2]">
                            ⚡ એડિટ (Editing)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span>{r.trainee.enrollment_no}</span>
                        {r.trainee.trade && (
                          <span className="font-sans font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[9px]">
                            {r.trainee.trade}
                          </span>
                        )}
                        {r.trainee.batch && (
                          <span className="font-sans font-bold text-[#346739] bg-[#f2edc2]/60 border border-[#9fcb98]/60 px-1.5 py-0.2 rounded text-[9px]">
                            બેચ {r.trainee.batch}
                          </span>
                        )}
                        {r.trainee.unit && (
                          <span className="font-sans font-bold text-sky-900 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded text-[9px]">
                            {r.trainee.unit}
                          </span>
                        )}
                        {r.isCustomWorkingDays && (
                          <span className="font-sans font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded text-[9px]">
                            મોડેથી પ્રવેશ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Working Days (Editable per trainee for Late Admission) */}
                    <td className="py-2 px-3 text-center bg-amber-50/30">
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={r.working}
                        onChange={(e) => handleStudentWorkingDaysChange(r.trainee.id, e.target.value)}
                        className={`w-14 px-1.5 py-1 text-center font-bold text-xs rounded border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          r.isCustomWorkingDays
                            ? 'border-amber-400 bg-amber-100/60 text-amber-950 font-black'
                            : 'border-slate-300 bg-white text-slate-800'
                        }`}
                        title={r.isCustomWorkingDays ? 'કસ્ટમ કામકાજના દિવસો દાખલ કરેલ છે' : 'બેચ સામાન્ય દિવસો'}
                      />
                    </td>

                    {/* Present Days with Stepper */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepPresent(r.trainee.id, -1)}
                          disabled={r.present <= 0}
                          className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                          title="૧ ઘટાડો (-1)"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          min={0}
                          max={r.working}
                          value={r.present}
                          onChange={(e) => handleStudentPresentDaysChange(r.trainee.id, e.target.value)}
                          className="w-14 px-1.5 py-1 text-center font-black text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#346739] text-slate-900"
                        />

                        <button
                          type="button"
                          onClick={() => handleStepPresent(r.trainee.id, 1)}
                          disabled={r.present >= r.working}
                          className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                          title="૧ વધારો (+1)"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Absent Days */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-500 font-semibold">
                      {r.absent}
                    </td>

                    {/* Monthly Attendance % */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`font-mono font-black text-xs tabular-nums ${
                          r.isMonthlyLow ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {r.monthlyPercentage.toFixed(1)}%
                      </span>
                    </td>

                    {/* Cumulative Session Attendance % */}
                    <td className="py-2.5 px-3 text-center bg-sky-50/60">
                      <div
                        className={`font-mono font-black text-xs tabular-nums ${
                          r.isRedFlag ? 'text-rose-600' : 'text-sky-950'
                        }`}
                      >
                        {r.cumulativePercentage.toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {r.totalSessionPresent}/{r.totalSessionWorking} દિવસ ({r.recordedMonthsCount} માસ)
                      </div>
                    </td>

                    {/* Status & Flag */}
                    <td className="py-2.5 px-3 text-center">
                      {r.isRedFlag ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                          <Flag className="w-3.5 h-3.5 text-rose-600 fill-current" />
                          <span>લાલ ફ્લેગ (&lt;૮૦%)</span>
                        </div>
                      ) : r.isProgressiveSafe ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
                          <span>સંચિત સુરક્ષિત</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>નિયમિત (≥૮૦%)</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Strip & Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Summary Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-600">
              કુલ તાલીમાર્થી: <strong className="text-slate-900">{summary.total}</strong>
            </span>
            <span>•</span>
            <span className="text-slate-600">
              સરેરાશ માસિક હાજરી: <strong className="text-slate-900">{summary.avgMonthly}%</strong>
            </span>
            <span>•</span>
            <span className="text-slate-600">
              સરેરાશ સંચિત સત્ર: <strong className="text-sky-900">{summary.avgCumulative}%</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-bold text-rose-700">
              <Flag className="w-3.5 h-3.5 fill-current" />
              <span>લાલ ફ્લેગ તાલીમાર્થી (નોટિસ પાત્ર): {summary.redFlagCount}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              રદ કરો (Cancel)
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-black text-[#f2edc2] bg-[#346739] hover:bg-[#264e2b] rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>હાજરી સેવ કરો (Save Attendance)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
