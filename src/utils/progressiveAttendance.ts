import { AttendanceRecord } from '../types';

export interface ProgressiveStats {
  monthlyPercentage: number;
  progressivePercentage: number;
  recordedMonthsCount: number;
  recordedMonthsList: string[];
  totalWorkingDaysToDate: number;
  totalPresentDaysToDate: number;
  totalAbsentDaysToDate: number;
  isMonthlyLow: boolean;
  isProgressiveLow: boolean;
  isProgressiveSafe: boolean; // Monthly < 80% but Progressive >= 80% (Compliant - No notice required)
  requiresNotice: boolean;    // Only true when Progressive < 80%
  isRedFlag: boolean;         // Red flag for instructor identification when Progressive < 80%
  statusBadge: 'regular' | 'progressive_safe' | 'notice_required';
  statusLabelGu: string;
  statusLabelEn: string;
}

/**
 * Standard threshold for NCVT / GCVT attendance notice
 */
export const ATTENDANCE_THRESHOLD = 80.0;

/**
 * Computes the progressive / cumulative attendance metrics for a specific trainee based on:
 * Total days: sum of present days divided by sum of working days across recorded session months.
 *
 * Confirmed Rule:
 * If a trainee has cumulative attendance >= 80%, they are compliant and instructor does not need to send notice.
 * If cumulative attendance < 80%, trainee is marked with a Red Flag for notice requirement.
 */
export function calculateProgressiveAttendance(
  traineeId: string,
  currentRecord?: AttendanceRecord | null,
  allHistoricalRecords?: AttendanceRecord[]
): ProgressiveStats {
  // Filter historical records for this specific trainee
  const traineeRecords = (allHistoricalRecords || []).filter(
    (r) => r.trainee_id === traineeId && Boolean(r.month_year)
  );

  // Group by normalized month_year to avoid duplicates, keeping the latest updated record
  const monthMap = new Map<string, AttendanceRecord>();

  traineeRecords.forEach((rec) => {
    if (!rec.month_year) return;
    const normKey = rec.month_year.trim();
    const existing = monthMap.get(normKey);
    if (!existing) {
      monthMap.set(normKey, rec);
    } else {
      const tNew = rec.updated_at ? new Date(rec.updated_at).getTime() : 0;
      const tOld = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
      if (tNew >= tOld) {
        monthMap.set(normKey, rec);
      }
    }
  });

  // If an active/edited record is explicitly provided, prioritize it for its month
  if (currentRecord && currentRecord.month_year) {
    monthMap.set(currentRecord.month_year.trim(), currentRecord);
  }

  const recordedRecords = Array.from(monthMap.values());
  const recordedMonthsCount = recordedRecords.length;
  const recordedMonthsList = recordedRecords.map((r) => r.month_year);

  // Determine effective monthly percentage for the active record (or latest recorded month)
  const effectiveCurrent =
    currentRecord ||
    (recordedRecords.length > 0 ? recordedRecords[recordedRecords.length - 1] : null);

  const currWorking = Number(effectiveCurrent?.total_working_days) || 0;
  const currPresent = Number(effectiveCurrent?.present_days) || 0;
  const monthlyPercentage =
    currWorking > 0
      ? Number(((currPresent / currWorking) * 100).toFixed(2))
      : Number(effectiveCurrent?.attendance_percentage || 0);

  const isMonthlyLow = recordedMonthsCount > 0 ? monthlyPercentage < ATTENDANCE_THRESHOLD : false;

  // Cumulative days: sum of working days and sum of present days across all recorded months
  const totalWorkingDaysToDate = recordedRecords.reduce(
    (acc, r) => acc + (Number(r.total_working_days) || 0),
    0
  );
  const totalPresentDaysToDate = recordedRecords.reduce(
    (acc, r) => acc + (Number(r.present_days) || 0),
    0
  );
  const totalAbsentDaysToDate = recordedRecords.reduce(
    (acc, r) =>
      acc +
      Math.max(0, (Number(r.total_working_days) || 0) - (Number(r.present_days) || 0)),
    0
  );

  // Total days formula: sum of present days divided by sum of working days
  const progressivePercentage =
    totalWorkingDaysToDate > 0
      ? Number(((totalPresentDaysToDate / totalWorkingDaysToDate) * 100).toFixed(2))
      : monthlyPercentage;

  const isProgressiveLow =
    recordedMonthsCount > 0 ? progressivePercentage < ATTENDANCE_THRESHOLD : false;
  const isProgressiveSafe = isMonthlyLow && !isProgressiveLow; // Monthly < 80% but cumulative >= 80%
  const isRedFlag = isProgressiveLow; // Red flag when cumulative < 80%
  const requiresNotice = isProgressiveLow;

  let statusBadge: 'regular' | 'progressive_safe' | 'notice_required' = 'regular';
  let statusLabelGu = 'નિયમિત હાજરી';
  let statusLabelEn = 'Regular Attendance';

  if (isProgressiveSafe) {
    statusBadge = 'progressive_safe';
    statusLabelGu = 'સંચિત સુરક્ષિત (≥૮૦%)';
    statusLabelEn = 'Cumulative Safe (≥80%)';
  } else if (isRedFlag) {
    statusBadge = 'notice_required';
    statusLabelGu = 'લાલ ફ્લેગ: ઓછી હાજરી (<૮૦%)';
    statusLabelEn = 'Red Flag: Low Attendance (<80%)';
  }

  return {
    monthlyPercentage,
    progressivePercentage,
    recordedMonthsCount: Math.max(1, recordedMonthsCount),
    recordedMonthsList,
    totalWorkingDaysToDate,
    totalPresentDaysToDate,
    totalAbsentDaysToDate,
    isMonthlyLow,
    isProgressiveLow,
    isProgressiveSafe,
    requiresNotice,
    isRedFlag,
    statusBadge,
    statusLabelGu,
    statusLabelEn,
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns a chronologically sorted list of unique recorded months (e.g. ['August 2026', 'September 2026'])
 * across the specified records.
 */
export function getRecordedMonthsInSession(
  records: AttendanceRecord[],
  traineeIds?: Set<string>
): string[] {
  const uniqueMonths = new Set<string>();

  (records || []).forEach((r) => {
    if (!r.month_year) return;
    if (traineeIds && !traineeIds.has(r.trainee_id)) return;
    uniqueMonths.add(r.month_year.trim());
  });

  return Array.from(uniqueMonths).sort((a, b) => {
    const parseMonthYear = (str: string) => {
      const parts = str.trim().split(/\s+/);
      const yr = parseInt(parts[parts.length - 1], 10) || 2026;
      const mName = parts.slice(0, parts.length - 1).join(' ');
      const mIdx = MONTH_NAMES.indexOf(mName);
      return { yr, mIdx: mIdx === -1 ? 0 : mIdx };
    };

    const dateA = parseMonthYear(a);
    const dateB = parseMonthYear(b);

    if (dateA.yr !== dateB.yr) {
      return dateA.yr - dateB.yr;
    }
    return dateA.mIdx - dateB.mIdx;
  });
}

/**
 * Retrieves a trainee's specific attendance stats for a given month_year.
 */
export function getTraineeMonthStats(
  traineeId: string,
  monthYear: string,
  records: AttendanceRecord[]
): {
  presentDays: number;
  workingDays: number;
  percentage: number;
  isLow: boolean;
  recorded: boolean;
} {
  const matches = (records || []).filter(
    (r) =>
      r.trainee_id === traineeId &&
      r.month_year?.trim().toLowerCase() === monthYear.trim().toLowerCase()
  );

  if (matches.length === 0) {
    return {
      presentDays: 0,
      workingDays: 0,
      percentage: 0,
      isLow: false,
      recorded: false,
    };
  }

  // Pick latest updated record if multiple exist for same month
  const match = matches.reduce((latest, curr) => {
    const tCurr = curr.updated_at ? new Date(curr.updated_at).getTime() : 0;
    const tLat = latest.updated_at ? new Date(latest.updated_at).getTime() : 0;
    return tCurr >= tLat ? curr : latest;
  }, matches[0]);

  const workingDays = Number(match.total_working_days) || 0;
  const presentDays = Number(match.present_days) || 0;
  const pct =
    workingDays > 0
      ? Number(((presentDays / workingDays) * 100).toFixed(2))
      : Number(match.attendance_percentage || 0);

  return {
    presentDays,
    workingDays,
    percentage: pct,
    isLow: pct < ATTENDANCE_THRESHOLD,
    recorded: true,
  };
}
