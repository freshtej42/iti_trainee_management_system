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
 * Strict Tenancy & Isolation Rules:
 * 1. Super Admin can view all students across all trades and institutes.
 * 2. Demo Guest Account (guest-demo-instructor) is strictly isolated to demo sample students only.
 * 3. Regular Instructors are strictly prevented from viewing demo records or other instructors' records.
 * 4. Regular Instructors must satisfy BOTH instructor ID ownership (trainee.instructor_id === instructor.id)
 *    AND matching assigned academic Unit.
 */
export function isStudentAssignedToInstructor(trainee: Trainee, instructor: Instructor): boolean {
  if (!instructor || !trainee) return false;

  // 1. Super Admin universal access
  if (instructor.role === 'super_admin') {
    return true;
  }

  const isGuest =
    instructor.id === 'guest-demo-instructor' ||
    instructor.role === 'guest' ||
    Boolean(instructor.is_guest);
  const isDemoTrainee =
    trainee.instructor_id === 'guest-demo-instructor' ||
    trainee.id.startsWith('demo-');

  // 2. Guest demo account: strictly confined to demo sample data
  if (isGuest) {
    return isDemoTrainee;
  }

  // 3. Regular instructors: strictly blocked from accessing demo records
  if (isDemoTrainee) {
    return false;
  }

  // 4. Regular instructors: MUST be the assigned owner (trainee.instructor_id === instructor.id)
  if (!trainee.instructor_id || trainee.instructor_id !== instructor.id) {
    return false;
  }

  // 5. AND must match assigned Unit (academic hierarchy check)
  const validUnits = new Set<string>();
  if (instructor.unit) validUnits.add(instructor.unit);
  if (instructor.units) instructor.units.forEach((u) => validUnits.add(u));
  if (instructor.academic_hierarchy) {
    instructor.academic_hierarchy.forEach((h) => {
      h.batches?.forEach((b) => {
        b.units?.forEach((u) => validUnits.add(u.name));
      });
    });
  }

  if (validUnits.size > 0 && trainee.unit) {
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
