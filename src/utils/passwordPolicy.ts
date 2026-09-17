/**
 * International Standard Password Policy & Validation Utility
 * Complies with NIST SP 800-63B & ISO/IEC 27001 guidelines:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*()_+-=[]{};':"|,.<>/?)
 */

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  strength: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  strengthColor: string;
  criteria: PasswordCriteria;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const pwd = password || '';
  const criteria: PasswordCriteria = {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd),
  };

  const score = Object.values(criteria).filter(Boolean).length;
  const errors: string[] = [];

  if (!criteria.minLength) {
    errors.push('ઓછામાં ઓછા ૮ અક્ષરો હોવા જોઈએ (At least 8 characters required)');
  }
  if (!criteria.hasUpper) {
    errors.push('ઓછામાં ઓછો એક કેપિટલ અક્ષર (A-Z) હોવો જોઈએ (At least 1 uppercase letter)');
  }
  if (!criteria.hasLower) {
    errors.push('ઓછામાં ઓછો એક સ્મોલ અક્ષર (a-z) હોવો જોઈએ (At least 1 lowercase letter)');
  }
  if (!criteria.hasNumber) {
    errors.push('ઓછામાં ઓછો એક અંક (0-9) હોવો જોઈએ (At least 1 numeric digit)');
  }
  if (!criteria.hasSpecial) {
    errors.push('ઓછામાં ઓછો એક સ્પેશિયલ સિમ્બોલ (@$!%*#?& વગેરે) હોવો જોઈએ (At least 1 special character)');
  }

  let strength: PasswordValidationResult['strength'] = 'Very Weak';
  let strengthColor = '#ef4444'; // rose-500

  if (score === 5) {
    strength = 'Very Strong';
    strengthColor = '#15803d'; // emerald-700
  } else if (score === 4) {
    strength = 'Strong';
    strengthColor = '#346739'; // forest-green
  } else if (score === 3) {
    strength = 'Medium';
    strengthColor = '#eab308'; // yellow-500
  } else if (score === 2) {
    strength = 'Weak';
    strengthColor = '#f97316'; // orange-500
  }

  return {
    isValid: score === 5,
    score,
    strength,
    strengthColor,
    criteria,
    errors,
  };
}

/**
 * Cleans phone/mobile number to standard 10-digit format
 */
export function cleanPhoneNumber(phone: string | undefined): string {
  if (!phone) return '';
  // Strip non-digits
  const digits = phone.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, strip 91
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  // If starts with 0 and has 11 digits, strip 0
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.substring(1);
  }
  return digits;
}

/**
 * Checks whether an email or phone number is unique among registered instructors
 */
export function checkInstructorUniqueness(
  email: string,
  phone: string,
  existingInstructors: { id: string; email?: string; phone?: string }[],
  currentInstructorId?: string
): { isUnique: boolean; emailConflict: boolean; phoneConflict: boolean; message: string } {
  const cleanTargetEmail = (email || '').trim().toLowerCase();
  const cleanTargetPhone = cleanPhoneNumber(phone);

  let emailConflict = false;
  let phoneConflict = false;

  for (const inst of existingInstructors) {
    if (currentInstructorId && inst.id === currentInstructorId) {
      continue;
    }
    const instEmail = (inst.email || '').trim().toLowerCase();
    const instPhone = cleanPhoneNumber(inst.phone);

    if (cleanTargetEmail && instEmail && instEmail === cleanTargetEmail) {
      emailConflict = true;
    }
    if (cleanTargetPhone && instPhone && instPhone === cleanTargetPhone) {
      phoneConflict = true;
    }
  }

  let message = '';
  if (emailConflict && phoneConflict) {
    message = 'આ ઈમેલ અને મોબાઈલ નંબર બંને પહેલેથી જ નોંધાયેલા છે (Both email and mobile number are already registered).';
  } else if (emailConflict) {
    message = 'આ ઈમેલ આઈડી પહેલેથી જ અન્ય ઇન્સ્ટ્રક્ટર દ્વારા ઉપયોગમાં છે (This Email ID is already in use by another instructor).';
  } else if (phoneConflict) {
    message = 'આ મોબાઈલ નંબર પહેલેથી જ અન્ય ઇન્સ્ટ્રક્ટર દ્વારા ઉપયોગમાં છે (This Mobile Number is already in use by another instructor).';
  }

  return {
    isUnique: !emailConflict && !phoneConflict,
    emailConflict,
    phoneConflict,
    message,
  };
}
