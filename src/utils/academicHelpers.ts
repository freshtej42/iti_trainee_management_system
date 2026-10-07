import { Instructor, Trainee } from '../types';

// Normalize Gujarati numerals to English digits
export function normalizeGujaratiNumerals(str: string): string {
  if (!str) return '';
  const map: Record<string, string> = {
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
    '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9'
  };
  return str.replace(/[૦-૯]/g, (m) => map[m] || m);
}

// Clean alphanumeric key for flexible comparisons
export function getCleanKey(str?: string): string {
  if (!str) return '';
  return normalizeGujaratiNumerals(str)
    .toLowerCase()
    .replace(/[–—_]/g, '-')
    .replace(/[^a-z0-9]/g, '');
}

// Match Trade flexibly
export function doesTradeMatch(traineeTrade?: string, targetTrade?: string): boolean {
  if (!traineeTrade || !targetTrade) return false;
  const t1 = traineeTrade.trim().toLowerCase();
  const t2 = targetTrade.trim().toLowerCase();
  if (t1 === t2) return true;

  const k1 = getCleanKey(traineeTrade);
  const k2 = getCleanKey(targetTrade);
  if (k1 === k2) return true;
  if (k1.includes(k2) || k2.includes(k1)) return true;

  // Check English acronyms (e.g. "copa", "fitter", "welder", "electrician")
  const acr1: string[] = t1.match(/[a-z0-9]{3,}/g) || [];
  const acr2: string[] = t2.match(/[a-z0-9]{3,}/g) || [];
  for (const a of acr1) {
    if (acr2.includes(a)) return true;
  }

  return false;
}

// Match Batch flexibly
export function doesBatchMatch(traineeBatch?: string, targetBatch?: string): boolean {
  if (!traineeBatch || !targetBatch) return false;
  const b1 = traineeBatch.trim().toLowerCase();
  const b2 = targetBatch.trim().toLowerCase();
  if (b1 === b2) return true;

  const k1 = getCleanKey(traineeBatch);
  const k2 = getCleanKey(targetBatch);
  if (k1 === k2) return true;
  if (k1.includes(k2) || k2.includes(k1)) return true;

  return false;
}

// Canonical unit alias for counting Unit A <-> Unit 1 <-> યુનિટ ૧
export function canonicalUnit(unitStr?: string): string {
  if (!unitStr) return '';
  const key = getCleanKey(unitStr);
  if (
    key === 'unita' ||
    key === 'unit1' ||
    key === 'unit૧' ||
    key === '1' ||
    key === 'a' ||
    key.includes('યુનિટ1') ||
    key.includes('યુનિટ૧')
  ) {
    return 'unit-1';
  }
  if (
    key === 'unitb' ||
    key === 'unit2' ||
    key === 'unit૨' ||
    key === '2' ||
    key === 'b' ||
    key.includes('યુનિટ2') ||
    key.includes('યુનિટ૨')
  ) {
    return 'unit-2';
  }
  if (
    key === 'unitc' ||
    key === 'unit3' ||
    key === 'unit૩' ||
    key === '3' ||
    key === 'c' ||
    key.includes('યુનિટ3') ||
    key.includes('યુનિટ૩')
  ) {
    return 'unit-3';
  }
  if (
    key === 'unitd' ||
    key === 'unit4' ||
    key === 'unit૪' ||
    key === '4' ||
    key === 'd' ||
    key.includes('યુનિટ4') ||
    key.includes('યુનિટ૪')
  ) {
    return 'unit-4';
  }
  return key;
}

export function doesUnitMatch(traineeUnit?: string, targetUnit?: string): boolean {
  if (!traineeUnit || !targetUnit) return false;
  const u1 = traineeUnit.trim().toLowerCase();
  const u2 = targetUnit.trim().toLowerCase();
  if (u1 === u2) return true;

  const c1 = canonicalUnit(traineeUnit);
  const c2 = canonicalUnit(targetUnit);
  if (c1 && c2 && c1 === c2) return true;

  return getCleanKey(traineeUnit) === getCleanKey(targetUnit);
}

/**
 * Checks if a trainee belongs to the specified instructor.
 * Matching rules:
 * 1. Super Admin can view all students across all trades and institutes.
 * 2. If student has instructor_id that explicitly matches instructor.id, student belongs to instructor.
 * 3. Match by Trade, Batch, and Unit assigned to the instructor (checking active trade/batch/unit
 *    as well as any trade/batch/unit in the instructor's academic_hierarchy, trades, batches, units arrays).
 */
export function isStudentAssignedToInstructor(trainee: Trainee, instructor: Instructor): boolean {
  if (!instructor) return false;
  if (instructor.role === 'super_admin') return true;

  // Direct foreign key match
  if (trainee.instructor_id && trainee.instructor_id === instructor.id) {
    return true;
  }

  // Check matching by trade, batch, and unit assigned to instructor
  // Collect all acceptable trades for this instructor
  const validTrades = new Set<string>();
  if (instructor.trade) validTrades.add(instructor.trade);
  if (instructor.trades) instructor.trades.forEach((t) => validTrades.add(t));
  if (instructor.academic_hierarchy) {
    instructor.academic_hierarchy.forEach((h) => validTrades.add(h.name));
  }

  // Check if trainee trade matches any instructor trade
  let tradeMatched = false;
  let matchingTradeObj = instructor.academic_hierarchy?.find((h) => doesTradeMatch(trainee.trade, h.name));
  for (const vt of validTrades) {
    if (doesTradeMatch(trainee.trade, vt)) {
      tradeMatched = true;
      break;
    }
  }

  if (!tradeMatched) {
    return false;
  }

  // Collect valid batches for this trade / instructor
  const validBatches = new Set<string>();
  if (instructor.batch) validBatches.add(instructor.batch);
  if (instructor.batches) instructor.batches.forEach((b) => validBatches.add(b));
  if (matchingTradeObj?.batches) {
    matchingTradeObj.batches.forEach((b) => validBatches.add(b.name));
  }

  let batchMatched = false;
  let matchingBatchObj = matchingTradeObj?.batches?.find((b) => doesBatchMatch(trainee.batch, b.name));
  for (const vb of validBatches) {
    if (doesBatchMatch(trainee.batch, vb)) {
      batchMatched = true;
      break;
    }
  }

  if (!batchMatched) {
    return false;
  }

  // Collect valid units for this batch / instructor
  const validUnits = new Set<string>();
  if (instructor.unit) validUnits.add(instructor.unit);
  if (instructor.units) instructor.units.forEach((u) => validUnits.add(u));
  if (matchingBatchObj?.units) {
    matchingBatchObj.units.forEach((u) => validUnits.add(u.name));
  }

  // If instructor configured units, verify unit match
  if (validUnits.size > 0) {
    let unitMatched = false;
    for (const vu of validUnits) {
      if (doesUnitMatch(trainee.unit, vu)) {
        unitMatched = true;
        break;
      }
    }
    return unitMatched;
  }

  return true;
}
