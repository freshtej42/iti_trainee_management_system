import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Instructor,
  Trainee,
  AttendanceRecord,
  FormativeAssessmentSheet,
  FormativePracticalEntry,
  FormativeScoreKey,
  TradeType,
  SemesterCurriculum,
  LOCurriculumItem,
  PracticalCurriculumItem,
} from '../types';
import {
  FORMATIVE_CATEGORIES,
  FORMATIVE_SUB_PARAMETERS,
  distributeTarget100Marks,
  calculateCategoryTotals,
  calculateLOAverages,
  generateDefaultPracticals,
  getDefaultCurriculum,
  generatePracticalsFromCurriculum,
  distributeTargetMarksToLO,
  clearMarksAfterCutoff,
  clearAllMarks,
  calculateVerticalTotalsAndAverages,
} from '../utils/formativeScoring';
import { exportFormativeAssessmentToExcel } from '../utils/formativeExcelExport';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Save,
  Wand2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  X,
  FileCheck,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  Award,
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Settings,
  HelpCircle,
  FileText,
  ListOrdered,
  Percent,
  Filter,
  UserX,
  AlertTriangle,
  RotateCw,
  Search,
  CheckSquare,
} from 'lucide-react';

export interface FormativeAssessmentViewProps {
  instructor: Instructor;
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
}

export default function FormativeAssessmentView({
  instructor,
  trainees,
  attendanceRecords,
}: FormativeAssessmentViewProps) {
  // 1. Detect Trade Type and Semester Count
  const detectedIsEngg = useMemo(() => {
    const hTrade = instructor.academic_hierarchy?.find(
      (t) =>
        t.name.toLowerCase() === (instructor.trade || '').toLowerCase() ||
        t.id === instructor.trade
    );
    if (hTrade?.trade_type === 'engineering' || hTrade?.semester_count === 4) {
      return true;
    }
    const nameLower = (instructor.trade || '').toLowerCase();
    return (
      nameLower.includes('fitter') ||
      nameLower.includes('electrician') ||
      nameLower.includes('wireman') ||
      nameLower.includes('turner') ||
      nameLower.includes('machinist') ||
      nameLower.includes('mmv') ||
      nameLower.includes('motor') ||
      nameLower.includes('diesel')
    );
  }, [instructor]);

  // State to toggle/override trade type (2 Semesters vs 4 Semesters)
  const [totalSemesters, setTotalSemesters] = useState<2 | 4>(detectedIsEngg ? 4 : 2);
  const isEngineering = totalSemesters === 4;

  // Active Semester (1 to 2 or 1 to 4)
  const [activeSemester, setActiveSemester] = useState<number>(1);

  // View Mode: 'roster' (Batch Trainee Marks Entry) | 'sheet' (Individual FAR-1 Sheet) | 'curriculum' (Practicals per LO per Sem)
  const [viewMode, setViewMode] = useState<'roster' | 'sheet' | 'curriculum'>('roster');

  // Selected Trainee for Sheet View
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(trainees[0]?.id || '');
  const currentTrainee = useMemo(() => {
    return trainees.find((t) => t.id === selectedTraineeId) || trainees[0] || null;
  }, [trainees, selectedTraineeId]);

  // Trainee Attendance Lookup for current selected trainee
  const currentAttendance = useMemo(() => {
    if (!currentTrainee) return null;
    const recs = attendanceRecords.filter((r) => r.trainee_id === currentTrainee.id);
    return recs[recs.length - 1] || null;
  }, [attendanceRecords, currentTrainee]);

  // Assessment Header Metadata State
  const [sessionYear, setSessionYear] = useState<string>('2026-27');
  const [assessmentDate, setAssessmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [assessmentLocation, setAssessmentLocation] = useState<'ITI' | 'Industry'>('ITI');
  const [industryName, setIndustryName] = useState<string>('');
  const [tradeName, setTradeName] = useState<string>(
    instructor.trade || 'Computer Operator & Programming Assistant (COPA)'
  );
  const [batchNo, setBatchNo] = useState<string>(
    instructor.unit ? `${instructor.unit} (${instructor.trade || 'COPA'})` : '84 (A)'
  );
  const durationText = totalSemesters === 4 ? '2 Years' : '1 Year';

  // 2. CURRICULUM STATE (Practicals per LO per Semester)
  const curriculumStorageKey = `iti_curriculum_${tradeName}_total_${totalSemesters}`;
  const [curriculum, setCurriculum] = useState<SemesterCurriculum[]>(() => {
    try {
      const saved = localStorage.getItem(curriculumStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return getDefaultCurriculum(isEngineering ? 'engineering' : 'non_engineering', totalSemesters);
  });

  // Save curriculum changes
  const saveCurriculum = (updated: SemesterCurriculum[]) => {
    setCurriculum(updated);
    try {
      localStorage.setItem(curriculumStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Active Semester Curriculum
  const currentSemesterCurriculum = useMemo(() => {
    return (
      curriculum.find((c) => c.semester === activeSemester) ||
      curriculum[0] || { semester: activeSemester, learning_outcomes: [] }
    );
  }, [curriculum, activeSemester]);

  // 3. PRACTICALS STATE FOR SELECTED TRAINEE IN ACTIVE SEMESTER
  const traineeSheetStorageKey = `iti_far1_${instructor.id}_sem${activeSemester}_${selectedTraineeId || 'default'}`;

  const [practicals, setPracticals] = useState<FormativePracticalEntry[]>(() => {
    return generatePracticalsFromCurriculum(curriculum, activeSemester, 82, 0.15);
  });

  // LO-wise marks input for current sheet (e.g. { LO1: 81, LO2: 81 })
  const [loMarksInput, setLoMarksInput] = useState<Record<string, number>>(() => ({
    LO1: 81,
    LO2: 81,
    LO3: 80,
    LO4: 80,
  }));
  const [useRealisticVariance, setUseRealisticVariance] = useState<boolean>(true);

  // Left Institute Info for current sheet
  const [sheetLeftInstitute, setSheetLeftInstitute] = useState<boolean>(false);
  const [sheetLeavingDate, setSheetLeavingDate] = useState<string>('');
  const [sheetCutoffPractical, setSheetCutoffPractical] = useState<string>('');

  // UI Modals & Print States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const printSheetRef = useRef<HTMLDivElement>(null);

  // 4. BATCH TRAINEE ROSTER STATE (Overall Marks & Column-based LO Marks)
  const batchRosterStorageKey = `iti_batch_scores_${instructor.id}_sem${activeSemester}`;
  const batchLOMarksStorageKey = `iti_batch_lo_scores_${instructor.id}_sem${activeSemester}`;

  const [batchTargetMarks, setBatchTargetMarks] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(batchRosterStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const init: Record<string, number> = {};
    trainees.forEach((tr) => {
      const recs = attendanceRecords.filter((r) => r.trainee_id === tr.id);
      const att = recs[recs.length - 1];
      const pct = att?.attendance_percentage || 80;
      init[tr.id] = Math.max(55, Math.min(95, Math.round(pct * 0.95 + 4)));
    });
    return init;
  });

  // LO-wise marks per trainee e.g. { traineeId: { LO1: 85, LO2: 80 } }
  const [batchLOMarks, setBatchLOMarks] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem(batchLOMarksStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Track trainee leaving details in batch { traineeId: { left: boolean, date: string, cutoff: string } }
  const [traineeLeavingMap, setTraineeLeavingMap] = useState<
    Record<string, { left: boolean; date?: string; cutoff?: string }>
  >({});

  // Track which trainees have distributed sheets saved
  const [distributedTrainees, setDistributedTrainees] = useState<Record<string, boolean>>({});

  // Left Institute Cutoff Modal State
  const [leftCutoffModalTrainee, setLeftCutoffModalTrainee] = useState<Trainee | null>(null);
  const [leftModalDate, setLeftModalDate] = useState<string>('2026-11-05');
  const [leftModalCutoffPractical, setLeftModalCutoffPractical] = useState<string>('P36');

  // 5. MULTI-FILTER STATE (For interactive view & custom filtered print/PDF/Excel)
  const [filterLO, setFilterLO] = useState<string>('ALL');
  const [filterPracticalFrom, setFilterPracticalFrom] = useState<string>('ALL');
  const [filterPracticalTo, setFilterPracticalTo] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE_ONLY' | 'CLEARED_ONLY'>('ALL');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Refresh distributed and leaving statuses from localStorage
  const refreshTraineeStatuses = () => {
    const statusMap: Record<string, boolean> = {};
    const leavingMap: Record<string, { left: boolean; date?: string; cutoff?: string }> = {};

    trainees.forEach((tr) => {
      const key = `iti_far1_${instructor.id}_sem${activeSemester}_${tr.id}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          statusMap[tr.id] = true;
          const parsed: FormativeAssessmentSheet = JSON.parse(saved);
          if (parsed.left_institute) {
            leavingMap[tr.id] = {
              left: true,
              date: parsed.leaving_date,
              cutoff: parsed.last_appeared_practical,
            };
          }
        }
      } catch {
        // ignore
      }
    });

    setDistributedTrainees(statusMap);
    setTraineeLeavingMap(leavingMap);
  };

  useEffect(() => {
    refreshTraineeStatuses();
  }, [trainees, activeSemester, instructor.id]);

  // Load saved sheet when trainee or active semester changes
  useEffect(() => {
    if (!selectedTraineeId) return;
    try {
      const saved = localStorage.getItem(traineeSheetStorageKey);
      if (saved) {
        const parsed: FormativeAssessmentSheet = JSON.parse(saved);
        if (parsed.practicals && parsed.practicals.length > 0) {
          setPracticals(parsed.practicals);
          const loadedLOMarks: Record<string, number> = {};
          parsed.practicals.forEach((p) => {
            if (p.lo_number && p.target_marks_100 && !loadedLOMarks[p.lo_number]) {
              loadedLOMarks[p.lo_number] = p.target_marks_100;
            }
          });
          if (Object.keys(loadedLOMarks).length > 0) {
            setLoMarksInput((prev) => ({ ...prev, ...loadedLOMarks }));
          }
        }
        if (parsed.session_year) setSessionYear(parsed.session_year);
        if (parsed.assessment_date) setAssessmentDate(parsed.assessment_date);
        if (parsed.assessment_location) setAssessmentLocation(parsed.assessment_location);
        if (parsed.industry_name) setIndustryName(parsed.industry_name);
        setSheetLeftInstitute(Boolean(parsed.left_institute));
        setSheetLeavingDate(parsed.leaving_date || '');
        setSheetCutoffPractical(parsed.last_appeared_practical || '');
        return;
      }
    } catch {
      // fallback
    }

    // Default: generate practicals from current semester curriculum LO-wise
    const traineeLOs = batchLOMarks[selectedTraineeId] || {};
    let newPracticals = generatePracticalsFromCurriculum(
      curriculum,
      activeSemester,
      80,
      useRealisticVariance ? 0.15 : 0
    );
    const initialLOInputs: Record<string, number> = {};
    currentSemesterCurriculum.learning_outcomes.forEach((lo) => {
      const loScore = traineeLOs[lo.lo_number] ?? 80;
      initialLOInputs[lo.lo_number] = loScore;
      newPracticals = distributeTargetMarksToLO(newPracticals, lo.lo_number, loScore, {
        varianceFactor: useRealisticVariance ? 0.15 : 0,
      });
    });
    setLoMarksInput(initialLOInputs);
    setPracticals(newPracticals);
    setSheetLeftInstitute(false);
    setSheetLeavingDate('');
    setSheetCutoffPractical('');
  }, [selectedTraineeId, traineeSheetStorageKey, activeSemester, curriculum, batchLOMarks, currentSemesterCurriculum, useRealisticVariance]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Build the complete sheet object for export or saving
  const currentSheet: FormativeAssessmentSheet = useMemo(() => {
    return {
      id: `far1-sem${activeSemester}-${selectedTraineeId}`,
      instructor_id: instructor.id,
      trainee_id: currentTrainee?.id || '',
      trainee_name: currentTrainee?.student_name_en || currentTrainee?.student_name || 'તાલીમાર્થી',
      roll_no: currentTrainee?.roll_no || 1,
      trade_name: tradeName,
      trade_type: isEngineering ? 'engineering' : 'non_engineering',
      semester: activeSemester,
      total_semesters: totalSemesters,
      batch_no: batchNo,
      session_year: sessionYear,
      assessment_date: assessmentDate,
      iti_name: instructor.iti_name || 'Govt ITI',
      industry_name: industryName,
      assessment_location: assessmentLocation,
      duration: durationText,
      practicals: practicals,
      sign_fi: instructor.name,
      left_institute: sheetLeftInstitute,
      leaving_date: sheetLeavingDate,
      last_appeared_practical: sheetCutoffPractical,
      updated_at: new Date().toISOString(),
    };
  }, [
    activeSemester,
    selectedTraineeId,
    currentTrainee,
    instructor,
    tradeName,
    isEngineering,
    totalSemesters,
    batchNo,
    sessionYear,
    assessmentDate,
    industryName,
    assessmentLocation,
    durationText,
    practicals,
    sheetLeftInstitute,
    sheetLeavingDate,
    sheetCutoffPractical,
  ]);

  // Save current sheet to localStorage
  const handleSaveSheet = () => {
    try {
      localStorage.setItem(traineeSheetStorageKey, JSON.stringify(currentSheet));
      refreshTraineeStatuses();
      showToast(`✓ સેમેસ્ટર ${activeSemester} નું આકારણી પત્રક સફળતાપૂર્વક સાચવવામાં આવ્યું!`);
    } catch {
      showToast('⚠️ ડેટા સાચવવામાં સમસ્યા આવી.');
    }
  };

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  const filteredPracticals = useMemo(() => {
    let result = [...practicals];

    // Filter by LO
    if (filterLO !== 'ALL') {
      result = result.filter(
        (p) => (p.lo_number || 'LO1').toUpperCase() === filterLO.toUpperCase()
      );
    }

    // Filter by Status
    if (filterStatus === 'ACTIVE_ONLY') {
      result = result.filter((p) => !p.is_cleared);
    } else if (filterStatus === 'CLEARED_ONLY') {
      result = result.filter((p) => p.is_cleared);
    }

    // Filter by Practical Range
    if (filterPracticalFrom !== 'ALL') {
      const fromIdx = practicals.findIndex((p) => p.practical_number === filterPracticalFrom);
      if (fromIdx !== -1) {
        result = result.filter((p) => {
          const idx = practicals.findIndex((orig) => orig.practical_number === p.practical_number);
          return idx >= fromIdx;
        });
      }
    }

    if (filterPracticalTo !== 'ALL') {
      const toIdx = practicals.findIndex((p) => p.practical_number === filterPracticalTo);
      if (toIdx !== -1) {
        result = result.filter((p) => {
          const idx = practicals.findIndex((orig) => orig.practical_number === p.practical_number);
          return idx <= toIdx;
        });
      }
    }

    // Filter by Search Query
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.practical_number.toLowerCase().includes(q) ||
          (p.practical_title && p.practical_title.toLowerCase().includes(q)) ||
          p.lo_number.toLowerCase().includes(q)
      );
    }

    return result;
  }, [
    practicals,
    filterLO,
    filterStatus,
    filterPracticalFrom,
    filterPracticalTo,
    filterSearch,
  ]);

  // Group filtered practicals by Learning Outcome (LO)
  const groupedFilteredPracticals = useMemo(() => {
    const groups: { lo: string; practicals: FormativePracticalEntry[] }[] = [];
    const map: Record<string, FormativePracticalEntry[]> = {};

    filteredPracticals.forEach((p) => {
      const lo = p.lo_number || 'LO1';
      if (!map[lo]) {
        map[lo] = [];
        groups.push({ lo, practicals: map[lo] });
      }
      map[lo].push(p);
    });

    return groups;
  }, [filteredPracticals]);

  // Calculate LO Averages for filtered practicals (strictly rounded whole numbers)
  const loAverages = useMemo(() => {
    return calculateLOAverages(filteredPracticals);
  }, [filteredPracticals]);

  // Calculate Bottom Vertical Totals and Averages across filtered practicals
  const verticalSummary = useMemo(() => {
    return calculateVerticalTotalsAndAverages(filteredPracticals);
  }, [filteredPracticals]);

  // Overall Sheet Summary
  const overallAvg = useMemo(() => {
    return verticalSummary.averages.categoryAverages.grand_avg;
  }, [verticalSummary]);

  // ==========================================
  // REVERSE SCORING & LO-WISE MARKS DISTRIBUTION
  // ==========================================

  // Apply reverse marks to ALL practicals in current sheet with natural randomized LO practical variation
  const handleApplyReverseToAllPracticals = (targetMarks: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(targetMarks)));
    setPracticals((prev) => {
      const distinctLOs: string[] = Array.from(new Set(prev.map((p) => p.lo_number.trim().toUpperCase())));
      let updated = [...prev];
      distinctLOs.forEach((loNum) => {
        updated = distributeTargetMarksToLO(updated, loNum, clamped, {
          varianceFactor: useRealisticVariance ? 0.15 : 0,
          maxSpread: 4,
        });
      });
      return updated;
    });
    showToast(
      `✓ સેમેસ્ટર ${activeSemester} ના તમામ પ્રેક્ટિકલમાં ${clamped}/100 ગુણ ૨૭ માપદંડોમાં રેન્ડમાઇઝ્ડ સરેરાશ સાથે સફળતાપૂર્વક વહેંચાયા!`
    );
  };

  // LO-wise reverse marks distribution for current sheet
  const handleApplyReverseToLO = (loNumber: string, targetMarks: number) => {
    const updated = distributeTargetMarksToLO(practicals, loNumber, targetMarks, {
      varianceFactor: useRealisticVariance ? 0.15 : 0,
    });
    setPracticals(updated);
    showToast(`✓ ${loNumber} ના પ્રેક્ટિકલ્સમાં ${targetMarks}/100 ગુણ સફળતાપૂર્વક વહેંચાયા!`);
  };

  // Auto suggest score based on Trainee Attendance % (LO-wise)
  const handleAutoSuggestFromAttendance = () => {
    const attPct = currentAttendance?.attendance_percentage || 80;
    const suggested = Math.max(55, Math.min(95, Math.round(attPct * 0.95 + 4)));
    const updatedInputs: Record<string, number> = {};
    let updatedPracticals = [...practicals];
    currentSemesterCurriculum.learning_outcomes.forEach((lo) => {
      updatedInputs[lo.lo_number] = suggested;
      updatedPracticals = distributeTargetMarksToLO(updatedPracticals, lo.lo_number, suggested, {
        varianceFactor: useRealisticVariance ? 0.15 : 0,
      });
    });
    setLoMarksInput(updatedInputs);
    setPracticals(updatedPracticals);
    showToast(`✓ હાજરી (${attPct}%) મુજબ તમામ LO માં ${suggested}/100 ગુણ વહેંચાયા.`);
  };

  // Manual Cell Edit for fine-tuning
  const handleScoreChange = (
    practicalId: string,
    key: FormativeScoreKey,
    rawVal: string,
    maxMarks: number
  ) => {
    const num = rawVal === '' ? 0 : Number(rawVal);
    const clamped = isNaN(num) ? 0 : Math.max(0, Math.min(maxMarks, Math.round(num)));

    setPracticals((prev) =>
      prev.map((p) => {
        if (p.id === practicalId) {
          const updatedScores = {
            ...p.scores,
            [key]: clamped,
          };
          const newTotals = calculateCategoryTotals(updatedScores);
          return {
            ...p,
            target_marks_100: newTotals.grand_total,
            scores: updatedScores,
          };
        }
        return p;
      })
    );
  };

  // Add new Practical exercise to current sheet
  const handleAddPractical = (loNumber: string = 'LO1') => {
    const newIdx = practicals.length + 1;
    const loScore = loMarksInput[loNumber] ?? 80;
    const newP: FormativePracticalEntry = {
      id: `p-sem${activeSemester}-${Date.now()}`,
      semester: activeSemester,
      lo_number: loNumber,
      practical_number: `P${newIdx}`,
      practical_title: `Practical Exercise ${newIdx}`,
      target_marks_100: loScore,
      scores: distributeTarget100Marks(loScore, { saltIndex: newIdx }),
    };
    setPracticals((prev) => [...prev, newP]);
    showToast(`✓ નવો પ્રેક્ટિકલ ${newP.practical_number} (${loNumber}) ઉમેરાયો.`);
  };

  // Remove Practical exercise from current sheet
  const handleRemovePractical = (id: string) => {
    if (practicals.length <= 1) {
      showToast('⚠️ ઓછામાં ઓછો એક પ્રેક્ટિકલ હોવો જરૂરી છે.');
      return;
    }
    setPracticals((prev) => prev.filter((p) => p.id !== id));
    showToast('પ્રેક્ટિકલ દૂર કરવામાં આવ્યો.');
  };

  // Reset current sheet to syllabus standard practicals
  const handleResetToStandard = () => {
    if (
      confirm(
        `શું તમે સેમેસ્ટર ${activeSemester} ના અભ્યાસક્રમ મુજબ પ્રેક્ટિકલ્સ રીસેટ કરવા માંગો છો?`
      )
    ) {
      let def = generatePracticalsFromCurriculum(
        curriculum,
        activeSemester,
        80,
        useRealisticVariance ? 0.15 : 0
      );
      currentSemesterCurriculum.learning_outcomes.forEach((lo) => {
        const loScore = loMarksInput[lo.lo_number] ?? 80;
        def = distributeTargetMarksToLO(def, lo.lo_number, loScore, {
          varianceFactor: useRealisticVariance ? 0.15 : 0,
        });
      });
      setPracticals(def);
      setSheetLeftInstitute(false);
      setSheetLeavingDate('');
      setSheetCutoffPractical('');
      showToast(`✓ સેમેસ્ટર ${activeSemester} ના પ્રમાણિત પ્રેક્ટિકલ રીસેટ થયા.`);
    }
  };

  // ==========================================
  // BATCH TRAINEE ROSTER OPERATIONS
  // ==========================================

  // Update batch overall score for a specific trainee
  const handleUpdateBatchScore = (traineeId: string, score: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    setBatchTargetMarks((prev) => {
      const updated = { ...prev, [traineeId]: clamped };
      try {
        localStorage.setItem(batchRosterStorageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Update batch LO-specific mark for a trainee
  const handleUpdateBatchLOScore = (traineeId: string, loNumber: string, score: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    setBatchLOMarks((prev) => {
      const traineeLOs = prev[traineeId] || {};
      const updated = {
        ...prev,
        [traineeId]: {
          ...traineeLOs,
          [loNumber]: clamped,
        },
      };
      try {
        localStorage.setItem(batchLOMarksStorageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Also distribute this LO directly in the trainee's saved sheet
    const trKey = `iti_far1_${instructor.id}_sem${activeSemester}_${traineeId}`;
    try {
      const saved = localStorage.getItem(trKey);
      let trPracticals: FormativePracticalEntry[];
      if (saved) {
        const parsed: FormativeAssessmentSheet = JSON.parse(saved);
        trPracticals = parsed.practicals;
      } else {
        trPracticals = generatePracticalsFromCurriculum(
          curriculum,
          activeSemester,
          batchTargetMarks[traineeId] || 80,
          0.15
        );
      }

      const updatedPracticals = distributeTargetMarksToLO(trPracticals, loNumber, clamped, {
        varianceFactor: 0.15,
      });

      const tr = trainees.find((t) => t.id === traineeId);
      const sheetObj: FormativeAssessmentSheet = {
        id: `far1-sem${activeSemester}-${traineeId}`,
        instructor_id: instructor.id,
        trainee_id: traineeId,
        trainee_name: tr?.student_name_en || tr?.student_name || 'Trainee',
        roll_no: tr?.roll_no || 1,
        trade_name: tradeName,
        trade_type: isEngineering ? 'engineering' : 'non_engineering',
        semester: activeSemester,
        total_semesters: totalSemesters,
        batch_no: batchNo,
        session_year: sessionYear,
        assessment_date: assessmentDate,
        iti_name: instructor.iti_name || 'Govt ITI',
        industry_name: industryName,
        assessment_location: assessmentLocation,
        duration: durationText,
        practicals: updatedPracticals,
        sign_fi: instructor.name,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(trKey, JSON.stringify(sheetObj));
      refreshTraineeStatuses();
    } catch {
      // ignore
    }

    showToast(`✓ Roll ${trainees.find((t) => t.id === traineeId)?.roll_no}: ${loNumber} ગુણ વહેંચાયા.`);
  };



  // Auto-calculate all batch trainees LO marks from attendance %
  const handleAutoFillAllFromAttendance = () => {
    const updatedLOMarks = { ...batchLOMarks };
    trainees.forEach((tr) => {
      const recs = attendanceRecords.filter((r) => r.trainee_id === tr.id);
      const att = recs[recs.length - 1];
      const pct = att?.attendance_percentage || 80;
      const suggested = Math.max(55, Math.min(95, Math.round(pct * 0.95 + 4)));
      if (!updatedLOMarks[tr.id]) updatedLOMarks[tr.id] = {};
      currentSemesterCurriculum.learning_outcomes.forEach((lo) => {
        updatedLOMarks[tr.id][lo.lo_number] = suggested;
      });
    });
    setBatchLOMarks(updatedLOMarks);
    try {
      localStorage.setItem(batchLOMarksStorageKey, JSON.stringify(updatedLOMarks));
    } catch {
      // ignore
    }
    showToast('✓ તમામ તાલીમાર્થીઓના LO મુજબના ગુણ હાજરી ટકાવારી પરથી આપોઆપ ગણાયા.');
  };

  // BATCH DISTRIBUTE ALL TRAINEES (STRICTLY LO-WISE)
  const handleBatchDistributeAll = () => {
    let count = 0;
    trainees.forEach((tr) => {
      let trPracticals = generatePracticalsFromCurriculum(
        curriculum,
        activeSemester,
        80,
        0.16
      );

      // Apply LO marks for each LO in curriculum for this trainee
      const traineeLOs = batchLOMarks[tr.id] || {};
      currentSemesterCurriculum.learning_outcomes.forEach((lo) => {
        const loScore = traineeLOs[lo.lo_number] ?? 80;
        trPracticals = distributeTargetMarksToLO(trPracticals, lo.lo_number, loScore);
      });

      // Check if trainee had left institute
      const leaving = traineeLeavingMap[tr.id];
      if (leaving?.left && leaving.cutoff) {
        trPracticals = clearMarksAfterCutoff(trPracticals, leaving.cutoff, leaving.date);
      }

      const sheetObj: FormativeAssessmentSheet = {
        id: `far1-sem${activeSemester}-${tr.id}`,
        instructor_id: instructor.id,
        trainee_id: tr.id,
        trainee_name: tr.student_name_en || tr.student_name || `Trainee ${tr.roll_no}`,
        roll_no: tr.roll_no,
        trade_name: tradeName,
        trade_type: isEngineering ? 'engineering' : 'non_engineering',
        semester: activeSemester,
        total_semesters: totalSemesters,
        batch_no: batchNo,
        session_year: sessionYear,
        assessment_date: assessmentDate,
        iti_name: instructor.iti_name || 'Govt ITI',
        industry_name: industryName,
        assessment_location: assessmentLocation,
        duration: durationText,
        practicals: trPracticals,
        sign_fi: instructor.name,
        left_institute: leaving?.left,
        leaving_date: leaving?.date,
        last_appeared_practical: leaving?.cutoff,
        updated_at: new Date().toISOString(),
      };

      const key = `iti_far1_${instructor.id}_sem${activeSemester}_${tr.id}`;
      try {
        localStorage.setItem(key, JSON.stringify(sheetObj));
        count++;
      } catch {
        // ignore
      }
    });

    refreshTraineeStatuses();
    showToast(
      `🎉 સફળ! સેમેસ્ટર ${activeSemester} માટે તમામ ${count} તાલીમાર્થીઓના ગુણ LO મુજબ આપોઆપ વહેંચાઈ ગયા છે!`
    );
  };

  // Distribute and open sheet for a single trainee from roster (LO-wise)
  const handleDistributeAndOpenSheet = (traineeId: string) => {
    setSelectedTraineeId(traineeId);
    let trPracticals = generatePracticalsFromCurriculum(
      curriculum,
      activeSemester,
      80,
      0.15
    );

    // Apply LO marks for each LO in curriculum for this trainee
    const traineeLOs = batchLOMarks[traineeId] || {};
    const initialLOMarks: Record<string, number> = {};
    currentSemesterCurriculum.learning_outcomes.forEach((lo) => {
      const loScore = traineeLOs[lo.lo_number] ?? 80;
      initialLOMarks[lo.lo_number] = loScore;
      trPracticals = distributeTargetMarksToLO(trPracticals, lo.lo_number, loScore);
    });

    // Apply left cutoff if applicable
    const leaving = traineeLeavingMap[traineeId];
    if (leaving?.left && leaving.cutoff) {
      trPracticals = clearMarksAfterCutoff(trPracticals, leaving.cutoff, leaving.date);
    }

    setPracticals(trPracticals);
    setLoMarksInput(initialLOMarks);

    const tr = trainees.find((t) => t.id === traineeId);
    const sheetObj: FormativeAssessmentSheet = {
      id: `far1-sem${activeSemester}-${traineeId}`,
      instructor_id: instructor.id,
      trainee_id: traineeId,
      trainee_name: tr?.student_name_en || tr?.student_name || 'Trainee',
      roll_no: tr?.roll_no || 1,
      trade_name: tradeName,
      trade_type: isEngineering ? 'engineering' : 'non_engineering',
      semester: activeSemester,
      total_semesters: totalSemesters,
      batch_no: batchNo,
      session_year: sessionYear,
      assessment_date: assessmentDate,
      iti_name: instructor.iti_name || 'Govt ITI',
      industry_name: industryName,
      assessment_location: assessmentLocation,
      duration: durationText,
      practicals: trPracticals,
      sign_fi: instructor.name,
      left_institute: leaving?.left,
      leaving_date: leaving?.date,
      last_appeared_practical: leaving?.cutoff,
      updated_at: new Date().toISOString(),
    };

    const key = `iti_far1_${instructor.id}_sem${activeSemester}_${traineeId}`;
    try {
      localStorage.setItem(key, JSON.stringify(sheetObj));
    } catch {
      // ignore
    }

    refreshTraineeStatuses();
    setViewMode('sheet');
    showToast(`✓ Roll No ${tr?.roll_no} નું પત્રક ખોલવામાં આવ્યું.`);
  };

  // Open Left Cutoff Modal
  const handleOpenLeftCutoffModal = (tr: Trainee) => {
    setLeftCutoffModalTrainee(tr);
    const existing = traineeLeavingMap[tr.id];
    setLeftModalDate(existing?.date || new Date().toISOString().split('T')[0]);
    setLeftModalCutoffPractical(existing?.cutoff || 'P36');
  };

  // Apply Left Cutoff to a trainee (e.g. appeared till P36, clear P37 onwards)
  const handleConfirmLeftCutoff = () => {
    if (!leftCutoffModalTrainee) return;
    const traineeId = leftCutoffModalTrainee.id;
    const trKey = `iti_far1_${instructor.id}_sem${activeSemester}_${traineeId}`;

    let trPracticals: FormativePracticalEntry[];
    try {
      const saved = localStorage.getItem(trKey);
      if (saved) {
        const parsed: FormativeAssessmentSheet = JSON.parse(saved);
        trPracticals = parsed.practicals;
      } else {
        trPracticals = generatePracticalsFromCurriculum(
          curriculum,
          activeSemester,
          batchTargetMarks[traineeId] || 80,
          0.15
        );
      }
    } catch {
      trPracticals = generatePracticalsFromCurriculum(
        curriculum,
        activeSemester,
        80,
        0.15
      );
    }

    // Clear marks after cutoff
    const updatedPracticals = clearMarksAfterCutoff(
      trPracticals,
      leftModalCutoffPractical,
      leftModalDate
    );

    const sheetObj: FormativeAssessmentSheet = {
      id: `far1-sem${activeSemester}-${traineeId}`,
      instructor_id: instructor.id,
      trainee_id: traineeId,
      trainee_name:
        leftCutoffModalTrainee.student_name_en ||
        leftCutoffModalTrainee.student_name ||
        'Trainee',
      roll_no: leftCutoffModalTrainee.roll_no,
      trade_name: tradeName,
      trade_type: isEngineering ? 'engineering' : 'non_engineering',
      semester: activeSemester,
      total_semesters: totalSemesters,
      batch_no: batchNo,
      session_year: sessionYear,
      assessment_date: assessmentDate,
      iti_name: instructor.iti_name || 'Govt ITI',
      industry_name: industryName,
      assessment_location: assessmentLocation,
      duration: durationText,
      practicals: updatedPracticals,
      sign_fi: instructor.name,
      left_institute: true,
      leaving_date: leftModalDate,
      last_appeared_practical: leftModalCutoffPractical,
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(trKey, JSON.stringify(sheetObj));
    } catch {
      // ignore
    }

    if (selectedTraineeId === traineeId) {
      setPracticals(updatedPracticals);
      setSheetLeftInstitute(true);
      setSheetLeavingDate(leftModalDate);
      setSheetCutoffPractical(leftModalCutoffPractical);
    }

    refreshTraineeStatuses();
    setLeftCutoffModalTrainee(null);
    showToast(
      `✓ Roll ${leftCutoffModalTrainee.roll_no}: ${leftModalCutoffPractical} પછીના તમામ માર્ક્સ ક્લિયર થયા (${leftModalDate}).`
    );
  };

  // Clear ALL marks for trainee (never appeared)
  const handleConfirmClearAllMarks = () => {
    if (!leftCutoffModalTrainee) return;
    const traineeId = leftCutoffModalTrainee.id;
    const trKey = `iti_far1_${instructor.id}_sem${activeSemester}_${traineeId}`;

    let trPracticals: FormativePracticalEntry[];
    try {
      const saved = localStorage.getItem(trKey);
      if (saved) {
        const parsed: FormativeAssessmentSheet = JSON.parse(saved);
        trPracticals = parsed.practicals;
      } else {
        trPracticals = generatePracticalsFromCurriculum(
          curriculum,
          activeSemester,
          80,
          0.15
        );
      }
    } catch {
      trPracticals = generatePracticalsFromCurriculum(
        curriculum,
        activeSemester,
        80,
        0.15
      );
    }

    const clearedPracticals = clearAllMarks(
      trPracticals,
      `Left institute on ${leftModalDate} (No exams appeared)`
    );

    const sheetObj: FormativeAssessmentSheet = {
      id: `far1-sem${activeSemester}-${traineeId}`,
      instructor_id: instructor.id,
      trainee_id: traineeId,
      trainee_name:
        leftCutoffModalTrainee.student_name_en ||
        leftCutoffModalTrainee.student_name ||
        'Trainee',
      roll_no: leftCutoffModalTrainee.roll_no,
      trade_name: tradeName,
      trade_type: isEngineering ? 'engineering' : 'non_engineering',
      semester: activeSemester,
      total_semesters: totalSemesters,
      batch_no: batchNo,
      session_year: sessionYear,
      assessment_date: assessmentDate,
      iti_name: instructor.iti_name || 'Govt ITI',
      industry_name: industryName,
      assessment_location: assessmentLocation,
      duration: durationText,
      practicals: clearedPracticals,
      sign_fi: instructor.name,
      left_institute: true,
      leaving_date: leftModalDate,
      last_appeared_practical: 'None',
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(trKey, JSON.stringify(sheetObj));
    } catch {
      // ignore
    }

    if (selectedTraineeId === traineeId) {
      setPracticals(clearedPracticals);
      setSheetLeftInstitute(true);
      setSheetLeavingDate(leftModalDate);
      setSheetCutoffPractical('None');
    }

    refreshTraineeStatuses();
    setLeftCutoffModalTrainee(null);
    showToast(`✓ Roll ${leftCutoffModalTrainee.roll_no}: તમામ માર્ક્સ ક્લિયર કરવામાં આવ્યા.`);
  };

  // Restore/Undo clear for a trainee
  const handleRestoreTraineeMarks = () => {
    if (!leftCutoffModalTrainee) return;
    const traineeId = leftCutoffModalTrainee.id;
    const trKey = `iti_far1_${instructor.id}_sem${activeSemester}_${traineeId}`;

    const score = batchTargetMarks[traineeId] || 80;
    const restored = generatePracticalsFromCurriculum(
      curriculum,
      activeSemester,
      score,
      0.15
    );

    const sheetObj: FormativeAssessmentSheet = {
      id: `far1-sem${activeSemester}-${traineeId}`,
      instructor_id: instructor.id,
      trainee_id: traineeId,
      trainee_name:
        leftCutoffModalTrainee.student_name_en ||
        leftCutoffModalTrainee.student_name ||
        'Trainee',
      roll_no: leftCutoffModalTrainee.roll_no,
      trade_name: tradeName,
      trade_type: isEngineering ? 'engineering' : 'non_engineering',
      semester: activeSemester,
      total_semesters: totalSemesters,
      batch_no: batchNo,
      session_year: sessionYear,
      assessment_date: assessmentDate,
      iti_name: instructor.iti_name || 'Govt ITI',
      industry_name: industryName,
      assessment_location: assessmentLocation,
      duration: durationText,
      practicals: restored,
      sign_fi: instructor.name,
      left_institute: false,
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(trKey, JSON.stringify(sheetObj));
    } catch {
      // ignore
    }

    if (selectedTraineeId === traineeId) {
      setPracticals(restored);
      setSheetLeftInstitute(false);
      setSheetLeavingDate('');
      setSheetCutoffPractical('');
    }

    refreshTraineeStatuses();
    setLeftCutoffModalTrainee(null);
    showToast(`✓ Roll ${leftCutoffModalTrainee.roll_no}: સામાન્ય માર્ક્સ પુનઃસ્થાપિત થયા.`);
  };

  // Export trainee sheet to Excel with custom filter support
  const handleExportTraineeExcel = (tr: Trainee, onlyFiltered: boolean = false) => {
    const key = `iti_far1_${instructor.id}_sem${activeSemester}_${tr.id}`;
    let trSheet: FormativeAssessmentSheet;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        trSheet = JSON.parse(saved);
      } else {
        const score = batchTargetMarks[tr.id] || 80;
        const trPracticals = generatePracticalsFromCurriculum(
          curriculum,
          activeSemester,
          score,
          0.15
        );
        trSheet = {
          id: `far1-sem${activeSemester}-${tr.id}`,
          instructor_id: instructor.id,
          trainee_id: tr.id,
          trainee_name: tr.student_name_en || tr.student_name,
          roll_no: tr.roll_no,
          trade_name: tradeName,
          trade_type: isEngineering ? 'engineering' : 'non_engineering',
          semester: activeSemester,
          total_semesters: totalSemesters,
          batch_no: batchNo,
          session_year: sessionYear,
          assessment_date: assessmentDate,
          iti_name: instructor.iti_name || 'Govt ITI',
          industry_name: industryName,
          assessment_location: assessmentLocation,
          duration: durationText,
          practicals: trPracticals,
          sign_fi: instructor.name,
          updated_at: new Date().toISOString(),
        };
      }
      exportFormativeAssessmentToExcel(
        trSheet,
        onlyFiltered ? filteredPracticals : undefined
      );
      showToast(`✓ Roll ${tr.roll_no} નું Excel પત્રક ડાઉનલોડ થયું!`);
    } catch {
      showToast('⚠️ Excel બનાવવામાં ભૂલ આવી.');
    }
  };

  // ==========================================
  // CURRICULUM MANAGEMENT OPERATIONS
  // ==========================================
  const [newPracticalCode, setNewPracticalCode] = useState<string>('');
  const [newPracticalTitle, setNewPracticalTitle] = useState<string>('');
  const [newPracticalTargetLO, setNewPracticalTargetLO] = useState<string>('LO1');
  const [newLONumber, setNewLONumber] = useState<string>('');
  const [newLOTitle, setNewLOTitle] = useState<string>('');
  const [isAddingLO, setIsAddingLO] = useState<boolean>(false);

  const handleAddPracticalToCurriculum = (loNumber: string) => {
    if (!newPracticalTitle.trim()) {
      showToast('⚠️ કૃપા કરીને પ્રેક્ટિકલનું નામ દાખલ કરો.');
      return;
    }

    const code =
      newPracticalCode.trim() ||
      `P${
        currentSemesterCurriculum.learning_outcomes.flatMap((l) => l.practicals).length + 1
      }`;

    const updated = curriculum.map((sem) => {
      if (sem.semester !== activeSemester) return sem;
      return {
        ...sem,
        learning_outcomes: sem.learning_outcomes.map((lo) => {
          if (lo.lo_number !== loNumber) return lo;
          const newItem: PracticalCurriculumItem = {
            id: `p-${Date.now()}`,
            practical_number: code,
            practical_title: newPracticalTitle.trim(),
          };
          return {
            ...lo,
            practicals: [...lo.practicals, newItem],
          };
        }),
      };
    });

    saveCurriculum(updated);
    setNewPracticalTitle('');
    setNewPracticalCode('');
    showToast(`✓ નવો પ્રેક્ટિકલ ${code} (${loNumber}) માં ઉમેરાયો.`);
  };

  const handleDeletePracticalFromCurriculum = (loNumber: string, practicalId: string) => {
    const updated = curriculum.map((sem) => {
      if (sem.semester !== activeSemester) return sem;
      return {
        ...sem,
        learning_outcomes: sem.learning_outcomes.map((lo) => {
          if (lo.lo_number !== loNumber) return lo;
          return {
            ...lo,
            practicals: lo.practicals.filter((p) => p.id !== practicalId),
          };
        }),
      };
    });
    saveCurriculum(updated);
    showToast('પ્રેક્ટિકલ દૂર કરવામાં આવ્યો.');
  };

  const handleAddNewLO = () => {
    if (!newLONumber.trim() || !newLOTitle.trim()) {
      showToast('⚠️ કૃપા કરીને LO નંબર અને શીર્ષક બંને દાખલ કરો.');
      return;
    }

    const newLO: LOCurriculumItem = {
      id: `lo-${Date.now()}`,
      lo_number: newLONumber.trim().toUpperCase(),
      lo_title: newLOTitle.trim(),
      practicals: [
        {
          id: `p-init-${Date.now()}`,
          practical_number: 'P1',
          practical_title: `${newLOTitle.trim()} - Exercise 1`,
        },
      ],
    };

    const updated = curriculum.map((sem) => {
      if (sem.semester !== activeSemester) return sem;
      return {
        ...sem,
        learning_outcomes: [...sem.learning_outcomes, newLO],
      };
    });

    saveCurriculum(updated);
    setNewLONumber('');
    setNewLOTitle('');
    setIsAddingLO(false);
    showToast(`✓ નવું Learning Outcome (${newLO.lo_number}) ઉમેરાયું.`);
  };

  const handleResetCurriculumToDefault = () => {
    if (confirm('શું તમે સિલેબસ પ્રમાણિત NCVT ફોર્મેટ પર રીસેટ કરવા માંગો છો?')) {
      const def = getDefaultCurriculum(
        isEngineering ? 'engineering' : 'non_engineering',
        totalSemesters
      );
      saveCurriculum(def);
      showToast('✓ સિલેબસ પ્રમાણિત NCVT ફોર્મેટ મુજબ રીસેટ થયો.');
    }
  };

  // ==========================================
  // PRINT & PDF EXPORT
  // ==========================================
  const handlePrintLandscape = () => {
    document.body.classList.add('is-printing-landscape');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-landscape');
    }, 1000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('⏳ Landscape A4 PDF જનરેટ થઈ રહ્યું છે...');

      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas-pro');

      const target = document.getElementById('far1-printable-sheet');
      if (!target) {
        showToast('⚠️ પ્રિન્ટ એલિમેન્ટ મળ્યો નથી.');
        setIsGeneratingPdf(false);
        return;
      }

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 297;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(210, pdfHeight));

      const safeName = (
        currentTrainee?.student_name_en ||
        currentTrainee?.student_name ||
        'Trainee'
      ).replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`FAR-1_Sem${activeSemester}_${safeName}_Roll_${currentTrainee?.roll_no || 1}.pdf`);

      showToast('✓ Landscape A4 PDF સફળતાપૂર્વક ડાઉનલોડ થયું!');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('⚠️ PDF બનાવવામાં ભૂલ આવી. પ્રિન્ટ ઓપ્શનનો ઉપયોગ કરો.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-gujarati text-slate-900 pb-16">
      {/* Dynamic Print CSS Injection for strict Landscape A4 output */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .far1-landscape-sheet {
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="bg-[#185abd] text-white px-4 sm:px-6 py-3.5 shadow-md border-b border-blue-600 no-print">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
                  નમૂનો - ૨ (FAR-1)
                </span>
                <span className="text-xs text-blue-200">Format for Internal Assessment</span>
                <span className="text-xs bg-blue-900/80 border border-blue-400/30 text-blue-100 font-bold px-2 py-0.5 rounded">
                  {totalSemesters} સેમેસ્ટર ({isEngineering ? 'એન્જિનિયરિંગ' : 'નોન-એન્જિનિયરિંગ'})
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                તાલીમાર્થી ફોર્મેટિવ આકારણી વ્યવસ્થા (Formative Assessment Automation)
              </h1>
            </div>
          </div>

          {/* Quick Actions (View Mode Switcher + Save + Export) */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleSaveSheet}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
              title="Save current trainee assessment"
            >
              <Save className="w-3.5 h-3.5" />
              <span>સેવ કરો (Save)</span>
            </button>

            <button
              type="button"
              onClick={() => exportFormativeAssessmentToExcel(currentSheet, filteredPracticals)}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg border border-emerald-500/40 transition-all shadow-xs cursor-pointer"
              title="Download official Excel .xlsx file (respects active filters)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              <span>Excel (.xlsx) ડાઉનલોડ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Preview & print landscape A4 sheet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>A4 Landscape પ્રિન્ટ / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION CONTROLS: View Mode Tabs & Semester Selection Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-2.5 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main View Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('roster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'roster'
                  ? 'bg-[#185abd] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>બેચ રોસ્ટર (૧૦૦ માંથી ગુણ / LO Wise)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  viewMode === 'roster' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {trainees.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('sheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'sheet'
                  ? 'bg-[#185abd] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>વ્યક્તિગત FAR-1 પત્રક (૩૫ કોલમ)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('curriculum')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'curriculum'
                  ? 'bg-[#185abd] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>સેમેસ્ટર પ્રેક્ટિકલ્સ સિલેબસ (LO Master)</span>
            </button>
          </div>

          {/* Semester Switcher Tabs + Trade Type Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Semester Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>સેમેસ્ટર:</span>
              </span>
              {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setActiveSemester(sem)}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    activeSemester === sem
                      ? 'bg-amber-400 text-slate-950 shadow-xs scale-102'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  સેમેસ્ટર {sem}
                </button>
              ))}
            </div>

            {/* Trade Type Toggle (2 Sem vs 4 Sem) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTotalSemesters(2);
                  if (activeSemester > 2) setActiveSemester(1);
                  showToast('નોન-એન્જિનિયરિંગ ટ્રેડ (૨ સેમેસ્ટર / ૧ વર્ષ) સેટ થયું.');
                }}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  totalSemesters === 2
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Non-Engineering Trade (2 Semesters / 1 Year)"
              >
                ૨ સેમ (Non-Engg)
              </button>

              <button
                type="button"
                onClick={() => {
                  setTotalSemesters(4);
                  showToast('એન્જિનિયરિંગ ટ્રેડ (૪ સેમેસ્ટર / ૨ વર્ષ) સેટ થયું.');
                }}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  totalSemesters === 4
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Engineering Trade (4 Semesters / 2 Years)"
              >
                ૪ સેમ (Engg)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* METADATA STRIP (Visible in Sheet view) */}
      {viewMode === 'sheet' && (
        <div className="bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3 no-print">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {/* 1. Trainee Selector */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                તાલીમાર્થી પસંદ કરો (Select Trainee):
              </label>
              <select
                value={selectedTraineeId}
                onChange={(e) => setSelectedTraineeId(e.target.value)}
                className="w-full bg-blue-50/70 border border-blue-300 text-blue-950 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {trainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    Roll {t.roll_no} - {t.student_name_en || t.student_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Trade Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">ટ્રેડ (Trade):</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
              />
            </div>

            {/* 3. Batch No */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                બેચ નં (Batch No):
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
              />
            </div>

            {/* 4. Session Year */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">સત્ર (Session):</label>
              <input
                type="text"
                value={sessionYear}
                onChange={(e) => setSessionYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
              />
            </div>

            {/* 5. Assessment Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">તારીખ (Date):</label>
              <input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: BATCH TRAINEE ROSTER (Overall & Column-Based LO Marks Entry)      */}
      {/* ========================================================================= */}
      {viewMode === 'roster' && (
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 mt-6 space-y-4 no-print">
          {/* Batch Header Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-amber-300" />
                  <h2 className="text-base font-black text-amber-300">
                    બેચ તાલીમાર્થી માર્ક્સ રોસ્ટર — સેમેસ્ટર {activeSemester} (LO-wise Marks Entry)
                  </h2>
                </div>
                <p className="text-xs text-blue-100">
                  તાલીમાર્થીઓના ગુણ LO મુજબ (LO1, LO2...) દાખલ કરો. સિસ્ટમ NCVT નિયમ મુજબ પૂર્ણાંક સંખ્યામાં ૨૭ માપદંડોમાં વહેંચી દેશે.
                </p>
              </div>

              {/* Master 1-Click Distribute Button */}
              <button
                type="button"
                onClick={handleBatchDistributeAll}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer self-start md:self-auto shrink-0"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>તમામ તાલીમાર્થીઓના ગુણ વહેંચો (Distribute All LOs)</span>
              </button>
            </div>

            {/* Quick Batch Operations Strip */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAutoFillAllFromAttendance}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg border border-blue-400/40 text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Auto-calculate each LO for all trainees based on attendance %"
                >
                  <Percent className="w-3.5 h-3.5 text-amber-300" />
                  <span>હાજરી % મુજબ તમામ LO ગુણ આપો</span>
                </button>
              </div>

              <div className="text-blue-200 text-xs flex items-center gap-2">
                <span className="font-bold text-emerald-300">
                  કુલ તાલીમાર્થીઓ: {trainees.length}
                </span>
                <span>•</span>
                <span className="font-bold text-amber-300">
                  વહેંચાયેલ: {Object.values(distributedTrainees).filter(Boolean).length} / {trainees.length}
                </span>
              </div>
            </div>
          </div>

          {/* Trainee Roster Table with Column-Based LO Inputs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-3 w-14 text-center">રોલ નં</th>
                    <th className="py-3 px-4 min-w-[190px]">તાલીમાર્થીનું નામ</th>
                    <th className="py-3 px-3 text-center w-24">હાજરી %</th>
                    {/* Dynamic LO Columns */}
                    {currentSemesterCurriculum.learning_outcomes.map((lo) => (
                      <th
                        key={lo.lo_number}
                        className="py-3 px-2 text-center min-w-[125px] bg-blue-50/70 border-r border-blue-200/60 text-blue-900"
                      >
                        <div className="font-bold text-[11px]">{lo.lo_number} / ૧૦૦</div>
                        <div className="text-[9px] font-normal text-blue-600 truncate max-w-[115px]">
                          {lo.practicals.length} પ્રેક્ટિકલ્સ
                        </div>
                      </th>
                    ))}
                    {/* Calculated Average of All Assessed LOs */}
                    <th className="py-3 px-2 text-center min-w-[110px] bg-amber-500/10 border-r border-amber-300/50 text-amber-950 font-black">
                      <div className="text-[11px]">LO સરેરાશ / ૧૦૦</div>
                      <div className="text-[9px] font-medium text-amber-800">
                        (Avg of All LOs)
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[170px]">સ્થિતિ (Status)</th>
                    <th className="py-3 px-4 text-right min-w-[210px]">કાર્ય (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainees.map((tr) => {
                    const recs = attendanceRecords.filter((r) => r.trainee_id === tr.id);
                    const att = recs[recs.length - 1];
                    const attPct = att?.attendance_percentage || 80;
                    const isDistributed = distributedTrainees[tr.id];
                    const leaving = traineeLeavingMap[tr.id];
                    const traineeLOs = batchLOMarks[tr.id] || {};

                    return (
                      <tr
                        key={tr.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          leaving?.left ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        {/* Roll No */}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 font-mono">
                          {tr.roll_no}
                        </td>

                        {/* Trainee Name */}
                        <td className="py-2.5 px-4">
                          <div className="font-bold text-slate-900">
                            {tr.student_name} {tr.surname}
                          </div>
                          {tr.student_name_en && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              {tr.student_name_en} {tr.surname_en}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">
                            Enroll: {tr.enrollment_no}
                          </div>
                        </td>

                        {/* Attendance % */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              attPct >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : attPct >= 70
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {attPct}%
                          </span>
                        </td>

                        {/* Dynamic Column-Based LO Inputs */}
                        {currentSemesterCurriculum.learning_outcomes.map((lo) => {
                          const loScore = traineeLOs[lo.lo_number] ?? 80;

                          return (
                            <td
                              key={lo.lo_number}
                              className="py-2.5 px-2 text-center bg-blue-50/30 border-r border-blue-200/40"
                            >
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={loScore}
                                  onChange={(e) =>
                                    handleUpdateBatchLOScore(
                                      tr.id,
                                      lo.lo_number,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-14 text-center font-black text-sm text-blue-950 bg-white border-2 border-blue-300 rounded-lg py-1 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                                  title={`Enter marks for ${lo.lo_number} (distributed among its ${lo.practicals.length} practicals)`}
                                />
                              </div>
                            </td>
                          );
                        })}

                        {/* Calculated Average of All LO Marks Assessed by Instructor */}
                        {(() => {
                          const loScores = currentSemesterCurriculum.learning_outcomes.map(
                            (lo) => traineeLOs[lo.lo_number] ?? 80
                          );
                          const avgLOScore =
                            loScores.length > 0
                              ? Math.round(
                                  loScores.reduce((sum, score) => sum + score, 0) / loScores.length
                                )
                              : 80;

                          return (
                            <td className="py-2.5 px-2 text-center bg-amber-50/40 border-r border-amber-200 font-black text-slate-900 text-xs">
                              <span
                                className="inline-block px-2.5 py-1 rounded-md bg-amber-200/80 text-slate-950 font-black border border-amber-300"
                                title="સર્વે LO ના ગુણની સરેરાશ (Average of all LO marks assessed by Instructor)"
                              >
                                {avgLOScore}
                              </span>
                            </td>
                          );
                        })()}

                        {/* Status Badge */}
                        <td className="py-2.5 px-3 text-center">
                          {leaving?.left ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <UserX className="w-3 h-3 text-rose-600" />
                              <span>છોડેલ ({leaving.cutoff || 'Cutoff'})</span>
                            </span>
                          ) : isDistributed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>તૈયાર (Ready)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span>બાકી (Pending)</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDistributeAndOpenSheet(tr.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#185abd] hover:bg-[#144ca3] text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                              title="Distribute marks & view full 35-column sheet"
                            >
                              <span>પત્રક જુઓ</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenLeftCutoffModal(tr)}
                              className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                                leaving?.left
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                                  : 'text-slate-600 hover:bg-slate-100 border-slate-200'
                              }`}
                              title="Clear marks of practicals after student left institute (Cutoff)"
                            >
                              <UserX className="w-3.5 h-3.5 text-rose-700" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExportTraineeExcel(tr)}
                              className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-200"
                              title="Download FAR-1 Excel for this trainee"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CURRICULUM SYLLABUS MASTER (Practicals per LO per Semester)      */}
      {/* ========================================================================= */}
      {viewMode === 'curriculum' && (
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 mt-6 space-y-4 no-print">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-[#185abd]" />
                <h2 className="text-base font-black text-slate-900">
                  સેમેસ્ટર {activeSemester} ના પ્રેક્ટિકલ્સ અને લર્નિંગ આઉટકમ (Practicals per LO)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                અહીં તમે દરેક સેમેસ્ટર મુજબ Learning Outcomes (LO) અને તેના હેઠળ લેવાના થતા Practical Exercises (P1, P2...) ઉમેરી અથવા સુધારી શકો છો.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddingLO(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#185abd] text-white rounded-xl shadow-xs hover:bg-[#144ca3] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>નવું LO ઉમેરો (Add LO)</span>
              </button>

              <button
                type="button"
                onClick={handleResetCurriculumToDefault}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>NCVT સિલેબસ રીસેટ</span>
              </button>
            </div>
          </div>

          {/* Add LO Inline Modal / Box */}
          {isAddingLO && (
            <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-2xl space-y-3 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-blue-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-700" />
                  <span>સેમેસ્ટર {activeSemester} માં નવું Learning Outcome (LO) ઉમેરો</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingLO(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  રદ કરો
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    LO નંબર (e.g. LO3 અથવા LO4):
                  </label>
                  <input
                    type="text"
                    value={newLONumber}
                    onChange={(e) => setNewLONumber(e.target.value)}
                    placeholder="દા.ત. LO3"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    LO શીર્ષક / વિષય (LO Title):
                  </label>
                  <input
                    type="text"
                    value={newLOTitle}
                    onChange={(e) => setNewLOTitle(e.target.value)}
                    placeholder="દા.ત. Database Management, SQL Queries and Web Technologies"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingLO(false)}
                  className="px-3 py-1 text-xs text-slate-600 rounded-lg"
                >
                  રદ
                </button>
                <button
                  type="button"
                  onClick={handleAddNewLO}
                  className="px-4 py-1.5 text-xs font-bold bg-[#185abd] text-white rounded-lg shadow-xs"
                >
                  LO ઉમેરો
                </button>
              </div>
            </div>
          )}

          {/* LO Cards List */}
          <div className="space-y-4">
            {currentSemesterCurriculum.learning_outcomes.map((lo) => (
              <div
                key={lo.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#185abd] font-black text-xs flex items-center justify-center shrink-0">
                      {lo.lo_number}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{lo.lo_title}</h3>
                      <div className="text-[11px] text-slate-500">
                        સેમેસ્ટર {activeSemester} • {lo.practicals.length} પ્રેક્ટિકલ્સ નિર્ધારિત
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                    {lo.practicals.length} Exercises
                  </span>
                </div>

                {/* Practicals Table under this LO */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                        <th className="py-2 px-3 w-16 text-center">કોડ #</th>
                        <th className="py-2 px-4">પ્રેક્ટિકલ કસરતનું નામ (Practical Title)</th>
                        <th className="py-2 px-3 text-right w-20">ડિલીટ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lo.practicals.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center font-bold text-blue-900 font-mono">
                            {p.practical_number}
                          </td>
                          <td className="py-2 px-4 text-slate-800 font-medium">{p.practical_title}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeletePracticalFromCurriculum(lo.lo_number, p.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="Delete practical"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Inline Add Practical Row */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="દા.ત. P8"
                    value={newPracticalTargetLO === lo.lo_number ? newPracticalCode : ''}
                    onChange={(e) => {
                      setNewPracticalTargetLO(lo.lo_number);
                      setNewPracticalCode(e.target.value);
                    }}
                    className="w-full sm:w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                  <input
                    type="text"
                    placeholder="નવા પ્રેક્ટિકલનું નામ દાખલ કરો..."
                    value={newPracticalTargetLO === lo.lo_number ? newPracticalTitle : ''}
                    onChange={(e) => {
                      setNewPracticalTargetLO(lo.lo_number);
                      setNewPracticalTitle(e.target.value);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewPracticalTargetLO(lo.lo_number);
                      handleAddPracticalToCurriculum(lo.lo_number);
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#185abd] text-white rounded-lg hover:bg-[#144ca3] shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ઉમેરો ({lo.lo_number})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: INDIVIDUAL 35-COLUMN FAR-1 LANDSCAPE SHEET VIEW                   */}
      {/* ========================================================================= */}
      {viewMode === 'sheet' && (
        <>
          {/* LO-WISE MARKS INSERTION CONTROL PANEL */}
          <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 sm:px-6 py-4 shadow-md no-print">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left: Status / Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="w-4 h-4 text-amber-300 animate-pulse" />
                    <h2 className="text-sm font-black tracking-wide text-amber-300 uppercase">
                      LO-Wise Marks Insertion — સેમેસ્ટર {activeSemester} (દરેક LO મુજબ ગુણ દાખલ કરો)
                    </h2>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    NCVT ITI નિયમ મુજબ ગુણ ફક્ત LO વાઈઝ દાખલ કરવાના રહેશે. સિસ્ટમ દરેક LO ના પ્રેક્ટિકલ્સમાં રેન્ડમાઇઝ્ડ ગુણ આપીને ૨૭ માપદંડોમાં પૂર્ણાંક સંખ્યામાં વહેંચી આપશે.
                  </p>
                </div>

                {currentAttendance && (
                  <button
                    type="button"
                    onClick={handleAutoSuggestFromAttendance}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl border border-blue-400/40 shadow-sm transition-all cursor-pointer shrink-0"
                    title={`Auto-fill each LO based on trainee's ${currentAttendance.attendance_percentage}% attendance`}
                  >
                    <Percent className="w-3.5 h-3.5 text-amber-300" />
                    <span>હાજરી મુજબ LO માર્ક્સ સેટ કરો ({currentAttendance.attendance_percentage}%)</span>
                  </button>
                )}
              </div>

              {/* LO-Wise Dedicated Insertion Cards */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LO માર્ક્સ દાખલ કરો:</span>
                </span>
                {currentSemesterCurriculum.learning_outcomes.map((lo) => {
                  const currentLOMark = loMarksInput[lo.lo_number] ?? 81;

                  return (
                    <div
                      key={lo.lo_number}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20"
                    >
                      <div>
                        <div className="text-xs font-black text-white">{lo.lo_number}</div>
                        <div className="text-[9px] text-blue-200">{lo.practicals.length} પ્રેક્ટિકલ</div>
                      </div>

                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={currentLOMark}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLoMarksInput((prev) => ({ ...prev, [lo.lo_number]: val }));
                        }}
                        className="w-14 text-center font-black text-sm text-slate-950 bg-white border-2 border-amber-400 rounded-lg py-0.5 focus:outline-hidden"
                        title={`Target marks out of 100 for ${lo.lo_number}`}
                      />

                      <button
                        type="button"
                        onClick={() => handleApplyReverseToLO(lo.lo_number, currentLOMark)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] px-2 py-1 rounded-lg transition-transform active:scale-95 cursor-pointer"
                        title={`Distribute ${currentLOMark} across ${lo.lo_number} practicals`}
                      >
                        વહેંચો
                      </button>

                      {/* Quick Chips */}
                      <div className="hidden sm:flex items-center gap-1 border-l border-white/20 pl-2">
                        {[75, 80, 85].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setLoMarksInput((prev) => ({ ...prev, [lo.lo_number]: preset }));
                              handleApplyReverseToLO(lo.lo_number, preset);
                            }}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                              currentLOMark === preset
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : 'bg-white/15 text-white hover:bg-white/25'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="ml-auto text-blue-200 text-xs flex items-center gap-2">
                  <span className="font-semibold text-emerald-300">
                    કુલ: {filteredPracticals.length} પ્રેક્ટિકલ ({verticalSummary.activeCount} હાજર)
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleResetToStandard}
                    className="text-blue-300 hover:text-white underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>રીસેટ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MULTI-FILTER BAR (Live filtering for Table, Print, and Excel) */}
          <div className="max-w-[1600px] w-full mx-auto px-2 sm:px-4 mt-4 no-print">
            <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#185abd]" />
                  <span>કસ્ટમ ફિલ્ટર (Custom Filter):</span>
                </span>

                {/* LO Filter */}
                <select
                  value={filterLO}
                  onChange={(e) => setFilterLO(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="ALL">તમામ LO (All LOs)</option>
                  {currentSemesterCurriculum.learning_outcomes.map((lo) => (
                    <option key={lo.lo_number} value={lo.lo_number}>
                      {lo.lo_number} ({lo.practicals.length} Practicals)
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
                >
                  <option value="ALL">તમામ પ્રેક્ટિકલ્સ</option>
                  <option value="ACTIVE_ONLY">માત્ર હાજર (Hide Left/Cleared)</option>
                  <option value="CLEARED_ONLY">માત્ર છોડેલ (Cleared Only)</option>
                </select>

                {/* Practical Range: From & To */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold">કસરત:</span>
                  <select
                    value={filterPracticalFrom}
                    onChange={(e) => setFilterPracticalFrom(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="ALL">પ્રથમથી</option>
                    {practicals.map((p) => (
                      <option key={p.practical_number} value={p.practical_number}>
                        {p.practical_number}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400 text-xs">→</span>
                  <select
                    value={filterPracticalTo}
                    onChange={(e) => setFilterPracticalTo(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="ALL">છેલ્લા સુધી</option>
                    {practicals.map((p) => (
                      <option key={p.practical_number} value={p.practical_number}>
                        {p.practical_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="શોધો (P#, શીર્ષક)..."
                    className="bg-slate-50 border border-slate-300 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 w-36"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                </div>

                {(filterLO !== 'ALL' ||
                  filterStatus !== 'ALL' ||
                  filterPracticalFrom !== 'ALL' ||
                  filterPracticalTo !== 'ALL' ||
                  filterSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterLO('ALL');
                      setFilterStatus('ALL');
                      setFilterPracticalFrom('ALL');
                      setFilterPracticalTo('ALL');
                      setFilterSearch('');
                    }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    ફિલ્ટર હટાવો
                  </button>
                )}
              </div>

              {/* Filter Count & Export Filtered */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                  દર્શાવેલ: {filteredPracticals.length} / {practicals.length}
                </span>

                <button
                  type="button"
                  onClick={() => handleExportTraineeExcel(currentTrainee as Trainee, true)}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-1 rounded-lg text-xs"
                  title="Export only filtered practicals to Excel"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                  <span>ફિલ્ટર કરેલ Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-1 rounded-lg text-xs"
                  title="Print filtered practicals"
                >
                  <Printer className="w-3 h-3 text-amber-700" />
                  <span>ફિલ્ટર પ્રિન્ટ</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN DATA VIEW: Formative Assessment Matrix (35 Columns with 90° Rotated Headers) */}
          <div className="max-w-[1600px] w-full mx-auto px-2 sm:px-4 mt-3">
            <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden">
              {/* Table Header Action Strip */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 no-print">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-800">
                    ઇન્ટરનલ એસેસમેન્ટ મેટ્રિક્સ — સેમેસ્ટર {activeSemester} (FAR-1 Matrix)
                  </h3>
                  <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    {currentTrainee?.student_name_en || currentTrainee?.student_name} (રોલ નં: {currentTrainee?.roll_no})
                  </span>
                  {sheetLeftInstitute && (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-300">
                      સંસ્થા છોડેલ (Cutoff: {sheetCutoffPractical || 'None'}, Date: {sheetLeavingDate})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddPractical('LO1')}
                    className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>LO1 પ્રેક્ટિકલ ઉમેરો</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddPractical('LO2')}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>LO2 પ્રેક્ટિકલ ઉમેરો</span>
                  </button>
                </div>
              </div>

              {/* Interactive Responsive Table Container */}
              <div className="overflow-x-auto max-h-[750px] overflow-y-auto">
                <table className="w-full border-collapse text-center text-[11px] font-sans">
                  {/* Category Header Row */}
                  <thead className="bg-[#185abd] text-white sticky top-0 z-20 shadow-xs">
                    <tr className="border-b border-blue-600">
                      <th rowSpan={2} className="border-r border-blue-600 px-2 py-2 min-w-[50px] font-bold">
                        LO #
                      </th>
                      <th rowSpan={2} className="border-r border-blue-600 px-2 py-2 min-w-[55px] font-bold">
                        Skill #
                      </th>

                      {/* 1. Safety (Cols 3-6) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#144ca3]">
                        Safety consciousness
                      </th>

                      {/* 2. Hygiene (Cols 7-10) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#185abd]">
                        Workplace hygiene & economical use
                      </th>

                      {/* 3. Attendance (Cols 11-14) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#144ca3]">
                        Attendance/Punctuality
                      </th>

                      {/* 4. Manuals (Cols 15-18) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#185abd]">
                        Ability to follow manuals
                      </th>

                      {/* 5. Knowledge (Cols 19-22) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#144ca3]">
                        Application of knowledge
                      </th>

                      {/* 6. Tools (Cols 23-26) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#185abd]">
                        Skills to handle tools & equipment
                      </th>

                      {/* 7. Speed (Cols 27-30) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#144ca3]">
                        Speed in doing work
                      </th>

                      {/* 8. Quality (Cols 31-34) */}
                      <th colSpan={4} className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#185abd]">
                        Quality in workmanship
                      </th>

                      {/* 9. VIVA (Col 35) */}
                      <th className="border-r border-blue-600 px-1 py-1.5 font-bold bg-[#144ca3]">
                        VIVA
                      </th>

                      {/* 10. TOTAL (Col 36) */}
                      <th className="border-r border-blue-600 px-1.5 py-1.5 font-black bg-blue-950 text-amber-300">
                        TOTAL (કુલ ગુણ)
                      </th>

                      <th rowSpan={2} className="px-1 py-2 min-w-[36px] bg-blue-900 font-bold no-print">
                        Action
                      </th>
                    </tr>

                    {/* Sub-Parameters Row WITH 90° ANTI-CLOCKWISE ROTATION */}
                    <tr className="border-b border-blue-400/50 text-[10px] bg-[#104899] h-32 align-bottom">
                      {/* Safety (Dress code, Use PPE, Apply safety, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Dress code
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Use PPE
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Apply safety
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Hygiene (Cleanliness, Dispose scrap, Select material, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Cleanliness
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Dispose scrap
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Select material
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Attendance (Initiative, Accountability, Participative, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Initiative
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Accountability
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Participative
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Manuals (Select manual, Search topic, Read/interpret, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Select manual
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Search topic
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Read / interpret
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Knowledge (Plan work, Select tools, Review work, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Plan work
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Select tools
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Review work
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Tools (Handle/use, Maintain safety, Care/maintain, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Handle / use
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Maintain safety
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Care / maintain
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Speed (Sequence, Technique, Review exec, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Sequence
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Technique
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Review during exec
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Quality (Accuracy, Conform, Satisfy purpose, TOTAL) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Accuracy
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Conform
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-0.5 py-1 w-8 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Satisfy purpose
                        </div>
                      </th>
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950/70 align-bottom pb-2">
                        TOTAL
                      </th>

                      {/* Viva (Response clarity) */}
                      <th className="border-r border-blue-600 px-0.5 py-1 w-9 align-bottom">
                        <div className="h-28 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-white font-medium text-[10px] mx-auto select-none">
                          Response clarity
                        </div>
                      </th>

                      {/* Column 36: TOTAL / 100 */}
                      <th className="border-r border-blue-600 px-1 py-1 font-black bg-blue-950 text-amber-300 align-bottom pb-2">
                        TOTAL / 100
                      </th>
                    </tr>

                    {/* Maximum Marks Reference Row */}
                    <tr className="bg-[#0b3877] text-amber-300 font-bold text-[10px]">
                      <th className="border-r border-blue-600 py-0.5">1</th>
                      <th className="border-r border-blue-600 py-0.5">2</th>
                      <th className="border-r border-blue-600 py-0.5">2</th>
                      <th className="border-r border-blue-600 py-0.5">5</th>
                      <th className="border-r border-blue-600 py-0.5">8</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">15</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5">2</th>
                      <th className="border-r border-blue-600 py-0.5">5</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">10</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5">4</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">10</th>
                      <th className="border-r border-blue-600 py-0.5">1</th>
                      <th className="border-r border-blue-600 py-0.5">2</th>
                      <th className="border-r border-blue-600 py-0.5">2</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">5</th>
                      <th className="border-r border-blue-600 py-0.5">4</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">10</th>
                      <th className="border-r border-blue-600 py-0.5">4</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">10</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5">5</th>
                      <th className="border-r border-blue-600 py-0.5">2</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">10</th>
                      <th className="border-r border-blue-600 py-0.5">7</th>
                      <th className="border-r border-blue-600 py-0.5">3</th>
                      <th className="border-r border-blue-600 py-0.5">5</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">15</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-white">15</th>
                      <th className="border-r border-blue-600 py-0.5 font-black bg-blue-950 text-amber-300">100</th>
                      <th className="no-print"></th>
                    </tr>
                  </thead>

                  {/* Matrix Rows: Practicals & Whole-Number LO Averages */}
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {groupedFilteredPracticals.map((grp) => {
                      const loAvg = loAverages.find((a) => a.lo_number === grp.lo);

                      return (
                        <React.Fragment key={grp.lo}>
                          {grp.practicals.map((p) => {
                            const catTotals = calculateCategoryTotals(p.scores);
                            const isCleared = p.is_cleared;

                            return (
                              <tr
                                key={p.id}
                                className={`transition-colors ${
                                  isCleared ? 'bg-rose-50/50' : 'hover:bg-blue-50/50'
                                }`}
                              >
                                {/* LO Number */}
                                <td className="border-r border-slate-200 py-1 font-bold text-slate-800 bg-slate-50/50">
                                  {p.lo_number}
                                </td>

                                {/* Practical Skill Number */}
                                <td
                                  className="border-r border-slate-200 py-1 font-bold text-blue-900 bg-slate-50/50"
                                  title={p.practical_title}
                                >
                                  <span>{p.practical_number}</span>
                                  {isCleared && (
                                    <span className="block text-[8px] text-rose-600 font-normal">
                                      Left
                                    </span>
                                  )}
                                </td>

                                {/* 1. Safety Consciousness (Cols 3-6) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={2}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.safety_dress}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'safety_dress', e.target.value, 2)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.safety_ppe}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'safety_ppe', e.target.value, 5)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={8}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.safety_apply}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'safety_apply', e.target.value, 8)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.safety_total}
                                </td>

                                {/* 2. Workplace Hygiene (Cols 7-10) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.hygiene_clean}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'hygiene_clean', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={2}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.hygiene_scrap}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'hygiene_scrap', e.target.value, 2)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.hygiene_material}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'hygiene_material', e.target.value, 5)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.hygiene_total}
                                </td>

                                {/* 3. Attendance/Punctuality (Cols 11-14) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.attendance_initiative}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'attendance_initiative', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.attendance_accountability}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'attendance_accountability', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.attendance_participative}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'attendance_participative', e.target.value, 4)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.attendance_total}
                                </td>

                                {/* 4. Ability to follow manuals (Cols 15-18) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.manuals_select}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'manuals_select', e.target.value, 1)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={2}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.manuals_search}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'manuals_search', e.target.value, 2)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={2}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.manuals_interpret}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'manuals_interpret', e.target.value, 2)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.manuals_total}
                                </td>

                                {/* 5. Application of knowledge (Cols 19-22) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.knowledge_plan}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'knowledge_plan', e.target.value, 4)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.knowledge_tools}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'knowledge_tools', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.knowledge_review}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'knowledge_review', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.knowledge_total}
                                </td>

                                {/* 6. Skills to handle tools & equipment (Cols 23-26) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.tools_handle}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'tools_handle', e.target.value, 4)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.tools_safety}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'tools_safety', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.tools_maintain}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'tools_maintain', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.tools_total}
                                </td>

                                {/* 7. Speed in doing work (Cols 27-30) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.speed_sequence}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'speed_sequence', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.speed_technique}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'speed_technique', e.target.value, 5)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={2}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.speed_review}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'speed_review', e.target.value, 2)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.speed_total}
                                </td>

                                {/* 8. Quality in workmanship (Cols 31-34) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={7}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.quality_accuracy}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'quality_accuracy', e.target.value, 7)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={3}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.quality_conform}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'quality_conform', e.target.value, 3)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.quality_purpose}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'quality_purpose', e.target.value, 5)
                                    }
                                    className="w-8 text-center py-0.5 font-medium rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>
                                <td className="border-r border-slate-200 py-1 font-bold bg-slate-100 text-slate-900">
                                  {isCleared ? 0 : catTotals.quality_total}
                                </td>

                                {/* 9. VIVA (Col 35) */}
                                <td className="border-r border-slate-200 p-0.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={15}
                                    disabled={isCleared}
                                    value={isCleared ? 0 : p.scores.viva_clarity}
                                    onChange={(e) =>
                                      handleScoreChange(p.id, 'viva_clarity', e.target.value, 15)
                                    }
                                    className="w-9 text-center py-0.5 font-bold rounded hover:bg-slate-100 focus:bg-amber-100 focus:ring-1 focus:ring-blue-600 focus:outline-hidden disabled:bg-transparent disabled:text-slate-400"
                                  />
                                </td>

                                {/* Column 36: Practical Total / 100 */}
                                <td className="border-r border-slate-200 py-1 font-black bg-slate-100 text-slate-900 text-xs">
                                  {isCleared ? 0 : catTotals.grand_total}
                                </td>

                                {/* Row Action */}
                                <td className="p-0.5 no-print">
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePractical(p.id)}
                                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                                    title="Remove practical row"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                          {/* LO AVERAGE ROW (STRICTLY WHOLE NUMBERS) */}
                          {loAvg && (
                            <tr className="bg-amber-100/70 text-slate-950 font-black border-y-2 border-amber-300">
                              <td className="py-1.5 border-r border-amber-300 text-center text-xs">
                                {loAvg.lo_number}
                              </td>
                              <td className="py-1.5 border-r border-amber-300 text-center text-[10px] uppercase tracking-wider">
                                Avg
                              </td>

                              {/* Safety Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.safety_dress}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.safety_ppe}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.safety_apply}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.safety_avg}
                              </td>

                              {/* Hygiene Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.hygiene_clean}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.hygiene_scrap}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.hygiene_material}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.hygiene_avg}
                              </td>

                              {/* Attendance Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.attendance_initiative}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.attendance_accountability}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.attendance_participative}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.attendance_avg}
                              </td>

                              {/* Manuals Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.manuals_select}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.manuals_search}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.manuals_interpret}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.manuals_avg}
                              </td>

                              {/* Knowledge Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.knowledge_plan}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.knowledge_tools}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.knowledge_review}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.knowledge_avg}
                              </td>

                              {/* Tools Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.tools_handle}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.tools_safety}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.tools_maintain}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.tools_avg}
                              </td>

                              {/* Speed Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.speed_sequence}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.speed_technique}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.speed_review}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.speed_avg}
                              </td>

                              {/* Quality Averages */}
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.quality_accuracy}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.quality_conform}</td>
                              <td className="border-r border-amber-200 py-1">{loAvg.averages.quality_purpose}</td>
                              <td className="border-r border-amber-300 py-1 bg-amber-200/80 font-black">
                                {loAvg.categoryAverages.quality_avg}
                              </td>

                              {/* Viva Average */}
                              <td className="border-r border-amber-300 py-1 font-black bg-amber-200/80">
                                {loAvg.averages.viva_clarity}
                              </td>

                              {/* Column 36: LO Average Total / 100 */}
                              <td className="border-r border-amber-300 py-1 font-black bg-amber-300 text-slate-950 text-xs">
                                {loAvg.categoryAverages.grand_avg}
                              </td>

                              <td className="no-print"></td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>

                  {/* BOTTOM VERTICAL AVERAGE SUMMARY ROW */}
                  <tfoot className="border-t-4 border-slate-900 bg-slate-100 font-sans">
                    {/* Vertical Average Row (Strictly Whole Numbers) */}
                    <tr className="bg-amber-300 text-slate-950 font-black text-xs">
                      <td colSpan={2} className="py-2 px-2 border-r border-amber-400 text-left font-black">
                        ઊભી સરેરાશ (AVERAGE)
                        <span className="block text-[9px] font-medium text-slate-800">
                          (કુલ / {verticalSummary.activeCount} પૂર્ણાંક સરેરાશ)
                        </span>
                      </td>

                      {/* Safety Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.safety_dress}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.safety_ppe}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.safety_apply}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.safety_avg}
                      </td>

                      {/* Hygiene Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.hygiene_clean}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.hygiene_scrap}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.hygiene_material}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.hygiene_avg}
                      </td>

                      {/* Attendance Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.attendance_initiative}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.attendance_accountability}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.attendance_participative}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.attendance_avg}
                      </td>

                      {/* Manuals Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.manuals_select}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.manuals_search}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.manuals_interpret}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.manuals_avg}
                      </td>

                      {/* Knowledge Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.knowledge_plan}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.knowledge_tools}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.knowledge_review}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.knowledge_avg}
                      </td>

                      {/* Tools Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.tools_handle}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.tools_safety}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.tools_maintain}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.tools_avg}
                      </td>

                      {/* Speed Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.speed_sequence}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.speed_technique}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.speed_review}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.speed_avg}
                      </td>

                      {/* Quality Averages */}
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.quality_accuracy}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.quality_conform}</td>
                      <td className="border-r border-amber-400 py-1">{verticalSummary.averages.subParams.quality_purpose}</td>
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.categoryAverages.quality_avg}
                      </td>

                      {/* Viva Average */}
                      <td className="border-r border-amber-400 py-1 bg-amber-400 font-black">
                        {verticalSummary.averages.subParams.viva_clarity}
                      </td>

                      {/* Column 36: Average of all LO marks assessed by Instructor */}
                      <td
                        className="border-r border-amber-400 py-1 bg-amber-400 font-black text-slate-950 text-xs"
                        title="સર્વે LO ગુણની સરેરાશ (Average of all LO marks assessed by Instructor)"
                      >
                        {verticalSummary.averages.categoryAverages.grand_avg}
                      </td>

                      <td className="no-print"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Table Footer Summary & Signature Notice */}
              <div className="bg-slate-50 border-t border-slate-300 px-4 py-3 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">
                    Sign of F.I. (Faculty Instructor): {instructor.name}
                  </span>
                  <span>•</span>
                  <span>Trade: {tradeName}</span>
                  <span>•</span>
                  <span>Semester: {activeSemester}</span>
                  <span>•</span>
                  <span>Date: {assessmentDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    સબ-પેરામીટર શિર્ષકો ૯૦° એન્ટી-ક્લોકવાઇઝ ફેરવેલ છે જેથી પૂર્ણ લખાણ વંચાય છે.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LEFT INSTITUTE / DROPOUT CUTOFF MARKS MANAGEMENT                   */}
      {/* ========================================================================= */}
      {leftCutoffModalTrainee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    સંસ્થા છોડી ગયેલ તાલીમાર્થી માર્ક્સ કટઓફ (Left Cutoff)
                  </h3>
                  <div className="text-xs text-slate-500">
                    Roll {leftCutoffModalTrainee.roll_no}: {leftCutoffModalTrainee.student_name}{' '}
                    {leftCutoffModalTrainee.surname}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLeftCutoffModalTrainee(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>માર્ક્સ ક્લિયરિંગ નિયમ:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                જો તાલીમાર્થી ચોક્કસ તારીખે સંસ્થા છોડી ગયો હોય (દા.ત. P36 સુધી હાજર રહ્યો હતો), તો P37 થી આગળના તમામ પ્રેક્ટિકલ માર્ક્સ ક્લિયર થશે અને તે સરેરાશ ગણતરીમાંથી બાકાત રહેશે જેથી અગાઉના ગુણ બગડશે નહીં.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  સંસ્થા છોડ્યાની તારીખ (Leaving Date):
                </label>
                <input
                  type="date"
                  value={leftModalDate}
                  onChange={(e) => setLeftModalDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  છેલ્લે હાજર રહેલ પ્રેક્ટિકલ (Last Appeared):
                </label>
                <select
                  value={leftModalCutoffPractical}
                  onChange={(e) => setLeftModalCutoffPractical(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  {practicals.map((p) => (
                    <option key={p.practical_number} value={p.practical_number}>
                      {p.practical_number} ({p.lo_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleRestoreTraineeMarks}
                className="text-slate-600 hover:text-slate-900 underline font-bold text-left cursor-pointer"
              >
                સામાન્ય સ્થિતિ પુનઃસ્થાપિત કરો (Undo / Restore)
              </button>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleConfirmClearAllMarks}
                  className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 font-bold hover:bg-rose-100 cursor-pointer"
                  title="Clear all practical marks (student never appeared)"
                >
                  તમામ માર્ક્સ ક્લિયર
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLeftCutoff}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {leftModalCutoffPractical} પછીના માર્ક્સ ક્લિયર કરો
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT / PDF MODAL (Exact Landscape A4 with 90° Rotated Headers & Totals) */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#185abd] text-white px-5 py-3 flex items-center justify-between shadow-sm no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm">
                    A4 Landscape પ્રિન્ટ અને પીડીએફ પૂર્વાવલોકન — સેમેસ્ટર {activeSemester} (FAR-1 Preview)
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    નમૂનો - ૨ (FAR-1) Format for Internal Assessment • {filteredPracticals.length} પ્રેક્ટિકલ્સ ({filterLO === 'ALL' ? 'તમામ LO' : filterLO})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintLandscape}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>પ્રિન્ટ (Print)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? 'જનરેટ થઈ રહ્યું છે...' : 'PDF ડાઉનલોડ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: A4 Landscape Canvas */}
            <div className="flex-1 bg-slate-200 p-4 sm:p-6 overflow-auto flex justify-center">
              <div
                id="far1-printable-sheet"
                ref={printSheetRef}
                className="bg-white text-slate-950 p-6 sm:p-8 shadow-xl border border-slate-300 far1-landscape-sheet text-[10px] font-sans"
                style={{
                  width: '280mm',
                  minHeight: '195mm',
                  boxSizing: 'border-box',
                }}
              >
                {/* Header Title matching FAR-1 exactly */}
                <div className="text-center mb-3">
                  <div className="text-sm font-black text-slate-900 tracking-wide">
                    નમૂનો - ૨ (FAR-1)
                  </div>
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Format for Internal Assessment
                  </div>
                </div>

                {/* Trainee & Institutional Metadata Grid */}
                <div className="border border-slate-900 text-[10px] mb-3 leading-tight">
                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-6 p-1 border-r border-slate-900">
                      <strong>Name of Trainee :</strong>{' '}
                      <span className="font-bold text-slate-900">
                        {currentTrainee?.student_name_en || currentTrainee?.student_name}
                      </span>
                    </div>
                    <div className="col-span-3 p-1 border-r border-slate-900">
                      <strong>Roll No :</strong> {currentTrainee?.roll_no || 1}
                    </div>
                    <div className="col-span-3 p-1">
                      <strong>Year of Enrollment:</strong> {sessionYear}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-9 p-1 border-r border-slate-900">
                      <strong>Name & Address of ITI (Govt./GIA/Pvt.):</strong>{' '}
                      {instructor.iti_name || 'Govt ITI'}
                    </div>
                    <div className="col-span-3 p-1">
                      <strong>Date of Assessment:</strong> {assessmentDate}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-9 p-1 border-r border-slate-900">
                      <strong>Name & Address of the Industry:</strong>{' '}
                      {industryName || 'Govt. ITI Workshop Campus'}
                    </div>
                    <div className="col-span-3 p-1">
                      <strong>Assessment location (Industry/ITI):</strong> {assessmentLocation}
                    </div>
                  </div>

                  <div className="grid grid-cols-12">
                    <div className="col-span-5 p-1 border-r border-slate-900">
                      <strong>Trade Name:</strong> {tradeName}
                    </div>
                    <div className="col-span-4 p-1 border-r border-slate-900">
                      <strong>Batch No:</strong> {batchNo} (Sem {activeSemester})
                    </div>
                    <div className="col-span-3 p-1">
                      <strong>Duration:</strong> {durationText}
                    </div>
                  </div>
                </div>

                {/* The 35-Column Landscape Official Grid WITH 90° ROTATED SUB-PARAMETER HEADERS */}
                <table className="w-full border-collapse border border-slate-900 text-center text-[9px] font-sans">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-100 font-bold">
                      <th rowSpan={2} className="border-r border-slate-900 p-0.5">
                        LO
                      </th>
                      <th rowSpan={2} className="border-r border-slate-900 p-0.5">
                        P#
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Safety consciousness
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Workplace hygiene
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Attendance
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Manuals
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Knowledge
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Tools/Equip
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Speed
                      </th>
                      <th colSpan={4} className="border-r border-slate-900 p-0.5">
                        Quality
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold">VIVA</th>
                      <th className="p-0.5 font-black bg-slate-200">TOTAL</th>
                    </tr>

                    {/* Sub-parameters row with 90° Anti-Clockwise vertical text */}
                    <tr className="border-b border-slate-900 text-[8px] bg-slate-50 h-28 align-bottom">
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Dress code
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Use PPE
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Apply safety
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Cleanliness
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Dispose scrap
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Select mat
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Initiative
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Accountable
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Participative
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Select man
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Search topic
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Read/interp
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Plan work
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Select tools
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Review work
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Handle/use
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Maintain safe
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Care/maintain
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Sequence
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Technique
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Review exec
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Accuracy
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Conform
                        </div>
                      </th>
                      <th className="border-r border-slate-900 px-0.5 py-0.5 align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Satisfy purp
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-0.5 font-bold align-bottom pb-1">TOT</th>

                      <th className="border-r border-slate-900 px-0.5 py-0.5 font-bold align-bottom">
                        <div className="h-24 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                          Response
                        </div>
                      </th>
                      <th className="p-0.5 font-black bg-slate-200 align-bottom pb-1">TOT/100</th>
                    </tr>

                    <tr className="border-b border-slate-900 bg-slate-100 font-bold text-[8px]">
                      <td className="border-r border-slate-900">—</td>
                      <td className="border-r border-slate-900">—</td>
                      <td className="border-r border-slate-900">2</td>
                      <td className="border-r border-slate-900">5</td>
                      <td className="border-r border-slate-900">8</td>
                      <td className="border-r border-slate-900 font-black">15</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900">2</td>
                      <td className="border-r border-slate-900">5</td>
                      <td className="border-r border-slate-900 font-black">10</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900">4</td>
                      <td className="border-r border-slate-900 font-black">10</td>
                      <td className="border-r border-slate-900">1</td>
                      <td className="border-r border-slate-900">2</td>
                      <td className="border-r border-slate-900">2</td>
                      <td className="border-r border-slate-900 font-black">5</td>
                      <td className="border-r border-slate-900">4</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900 font-black">10</td>
                      <td className="border-r border-slate-900">4</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900 font-black">10</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900">5</td>
                      <td className="border-r border-slate-900">2</td>
                      <td className="border-r border-slate-900 font-black">10</td>
                      <td className="border-r border-slate-900">7</td>
                      <td className="border-r border-slate-900">3</td>
                      <td className="border-r border-slate-900">5</td>
                      <td className="border-r border-slate-900 font-black">15</td>
                      <td className="border-r border-slate-900 font-black">15</td>
                      <td className="font-black bg-slate-200">100</td>
                    </tr>
                  </thead>

                  <tbody>
                    {groupedFilteredPracticals.map((grp) => {
                      const loAvg = loAverages.find((a) => a.lo_number === grp.lo);

                      return (
                        <React.Fragment key={grp.lo}>
                          {grp.practicals.map((p) => {
                            const catTotals = calculateCategoryTotals(p.scores);
                            const isCleared = p.is_cleared;

                            return (
                              <tr key={p.id} className="border-b border-slate-300">
                                <td className="border-r border-slate-900 p-0.5">{p.lo_number}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold">
                                  {p.practical_number}
                                  {isCleared && <span className="block text-[7px] text-slate-500">Left</span>}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.safety_dress}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.safety_ppe}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.safety_apply}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.safety_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.hygiene_clean}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.hygiene_scrap}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.hygiene_material}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.hygiene_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.attendance_initiative}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.attendance_accountability}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.attendance_participative}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.attendance_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.manuals_select}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.manuals_search}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.manuals_interpret}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.manuals_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.knowledge_plan}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.knowledge_tools}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.knowledge_review}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.knowledge_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.tools_handle}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.tools_safety}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.tools_maintain}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.tools_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.speed_sequence}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.speed_technique}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.speed_review}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.speed_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.quality_accuracy}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.quality_conform}</td>
                                <td className="border-r border-slate-900 p-0.5">{isCleared ? 0 : p.scores.quality_purpose}</td>
                                <td className="border-r border-slate-900 p-0.5 font-bold bg-slate-50">
                                  {isCleared ? 0 : catTotals.quality_total}
                                </td>

                                <td className="border-r border-slate-900 p-0.5 font-bold">
                                  {isCleared ? 0 : p.scores.viva_clarity}
                                </td>
                                <td className="p-0.5 font-black bg-slate-100">
                                  {isCleared ? 0 : catTotals.grand_total}
                                </td>
                              </tr>
                            );
                          })}

                          {/* LO Average in Print view */}
                          {loAvg && (
                            <tr className="border-b-2 border-slate-900 font-bold bg-slate-100">
                              <td className="border-r border-slate-900 p-0.5">{loAvg.lo_number}</td>
                              <td className="border-r border-slate-900 p-0.5">Avg</td>

                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.safety_dress}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.safety_ppe}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.safety_apply}</td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.safety_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.hygiene_clean}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.hygiene_scrap}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.hygiene_material}</td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.hygiene_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5">
                                {loAvg.averages.attendance_initiative}
                              </td>
                              <td className="border-r border-slate-900 p-0.5">
                                {loAvg.averages.attendance_accountability}
                              </td>
                              <td className="border-r border-slate-900 p-0.5">
                                {loAvg.averages.attendance_participative}
                              </td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.attendance_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.manuals_select}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.manuals_search}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.manuals_interpret}</td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.manuals_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.knowledge_plan}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.knowledge_tools}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.knowledge_review}</td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.knowledge_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.tools_handle}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.tools_safety}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.tools_maintain}</td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.tools_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.speed_sequence}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.speed_technique}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.speed_review}</td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.speed_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.quality_accuracy}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.quality_conform}</td>
                              <td className="border-r border-slate-900 p-0.5">{loAvg.averages.quality_purpose}</td>
                              <td className="border-r border-slate-900 p-0.5 font-black">
                                {loAvg.categoryAverages.quality_avg}
                              </td>

                              <td className="border-r border-slate-900 p-0.5 font-black bg-slate-200">
                                {loAvg.averages.viva_clarity}
                              </td>
                              <td className="p-0.5 font-black bg-slate-300">
                                {loAvg.categoryAverages.grand_avg}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* GRAND VERTICAL AVERAGE ROW IN PRINT */}
                    <tr className="border-t-2 border-slate-900 font-black bg-slate-300 text-[9px]">
                      <td colSpan={2} className="border-r border-slate-900 p-0.5 text-left font-black">
                        AVERAGE
                      </td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.safety_dress}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.safety_ppe}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.safety_apply}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.safety_avg}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.hygiene_clean}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.hygiene_scrap}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.hygiene_material}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.hygiene_avg}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.attendance_initiative}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.attendance_accountability}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.attendance_participative}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.attendance_avg}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.manuals_select}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.manuals_search}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.manuals_interpret}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.manuals_avg}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.knowledge_plan}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.knowledge_tools}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.knowledge_review}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.knowledge_avg}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.tools_handle}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.tools_safety}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.tools_maintain}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.tools_avg}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.speed_sequence}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.speed_technique}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.speed_review}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.speed_avg}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.quality_accuracy}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.quality_conform}</td>
                      <td className="border-r border-slate-900 p-0.5">{verticalSummary.averages.subParams.quality_purpose}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black">{verticalSummary.averages.categoryAverages.quality_avg}</td>
                      <td className="border-r border-slate-900 p-0.5 font-black bg-slate-300 text-slate-950">{verticalSummary.averages.subParams.viva_clarity}</td>
                      {/* Column 36: Average of all LO marks assessed by Instructor */}
                      <td className="p-0.5 font-black bg-slate-400 text-slate-950">{verticalSummary.averages.categoryAverages.grand_avg}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Sign of F.I. Signature block */}
                <div className="mt-8 flex justify-between items-end text-xs font-bold pt-4">
                  <div className="text-left">
                    <div>Sign of F.I.</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-6">
                      (Formative Instructor / Faculty Signature)
                    </div>
                  </div>

                  <div className="text-right">
                    <div>{instructor.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Supervisor Instructor / ITI Authority
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
