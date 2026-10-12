import { Instructor } from '../types';

/**
 * Checks if the instructor is a Super Admin (lifetime access, never expires)
 */
export function isSuperAdminAccount(instructor?: Partial<Instructor> | null): boolean {
  if (!instructor) return false;
  return (
    instructor.role === 'super_admin' ||
    instructor.email === 'tejassuthar21696@gmail.com'
  );
}

/**
 * Computes expiration date exactly 1 year from approval date
 */
export function calculateOneYearFromApproval(approvalDate: Date | string = new Date()): string {
  const d = typeof approvalDate === 'string' ? new Date(approvalDate) : new Date(approvalDate.getTime());
  // If invalid date, fallback to now
  const base = isNaN(d.getTime()) ? new Date() : d;
  const oneYearLater = new Date(base.getTime());
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  return oneYearLater.toISOString();
}

/**
 * Checks if an instructor account has expired
 * Super Admin never expires (lifetime access).
 * Only approved accounts with past valid_until expire.
 */
export function isAccountExpired(instructor?: Partial<Instructor> | null): boolean {
  if (!instructor) return false;
  if (isSuperAdminAccount(instructor)) return false;
  if (instructor.status !== 'approved') return false;
  if (!instructor.valid_until) return false;

  const validTime = new Date(instructor.valid_until).getTime();
  if (isNaN(validTime)) return false;
  return validTime < Date.now();
}

/**
 * Returns the number of days remaining before expiration,
 * or 'lifetime' for Super Admin, or null if not applicable.
 */
export function getValidityRemainingDays(
  instructor?: Partial<Instructor> | null
): number | 'lifetime' | null {
  if (!instructor) return null;
  if (isSuperAdminAccount(instructor)) return 'lifetime';
  if (!instructor.valid_until) return null;

  const validTime = new Date(instructor.valid_until).getTime();
  if (isNaN(validTime)) return null;

  const diffMs = validTime - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formats validity timestamp for display in Gujarati / English
 */
export function formatValidityDate(isoDateString?: string): string {
  if (!isoDateString) return '—';
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('gu-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoDateString;
  }
}

/**
 * Normalizes an instructor ensuring valid 1-year window for non-admin approved accounts,
 * and lifetime access for super admin.
 */
export function ensureInstructorValidity(instructor: Instructor): Instructor {
  if (isSuperAdminAccount(instructor)) {
    // Super admin has lifetime access
    return {
      ...instructor,
      role: 'super_admin',
      valid_until: undefined,
    };
  }

  // Non-admin instructor
  if (instructor.status === 'approved') {
    const approvedDate = instructor.approved_at || instructor.created_at || new Date().toISOString();
    // If valid_until is missing or expired in sample data, set 1 year from approval or 1 year from now
    let validUntil = instructor.valid_until;
    if (!validUntil) {
      validUntil = calculateOneYearFromApproval(approvedDate);
    }
    return {
      ...instructor,
      approved_at: approvedDate,
      valid_until: validUntil,
    };
  }

  return instructor;
}
