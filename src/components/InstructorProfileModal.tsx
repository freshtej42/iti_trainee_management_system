import React, { useState, useEffect } from 'react';
import { Instructor } from '../types';
import {
  User,
  Building,
  Mail,
  Phone,
  Briefcase,
  Layers,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  X,
  Edit3,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  validatePassword,
  cleanPhoneNumber,
  checkInstructorUniqueness,
} from '../utils/passwordPolicy';
import { formatValidityDate, getValidityRemainingDays } from '../utils/validityHelper';

interface InstructorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
  allInstructors?: Instructor[];
  onUpdateInstructor?: (updated: Instructor) => void;
  onLogout?: () => void;
  initialEditMode?: boolean;
}

export default function InstructorProfileModal({
  isOpen,
  onClose,
  instructor,
  allInstructors = [],
  onUpdateInstructor,
  onLogout,
  initialEditMode = false,
}: InstructorProfileModalProps) {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const isSuperAdmin = instructor.role === 'super_admin';
  const isGuest = instructor.role === 'guest' || instructor.is_guest || instructor.id === 'guest-demo-instructor';

  // Dual Language Form States (English & Gujarati stored separately)
  const [formName, setFormName] = useState(instructor.name || '');
  const [formNameGu, setFormNameGu] = useState(instructor.name_gu || '');
  const [formDesignation, setFormDesignation] = useState(instructor.designation || '');
  const [formDesignationGu, setFormDesignationGu] = useState(instructor.designation_gu || '');
  const [formEmail, setFormEmail] = useState(instructor.email || '');
  const [formPhone, setFormPhone] = useState(instructor.phone || '');
  const [formPassword, setFormPassword] = useState(instructor.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [formItiName, setFormItiName] = useState(instructor.iti_name || '');
  const [formItiNameGu, setFormItiNameGu] = useState(instructor.iti_name_gu || '');
  const [formAddress, setFormAddress] = useState(instructor.institution_address || '');
  const [formAddressGu, setFormAddressGu] = useState(instructor.institution_address_gu || '');
  const [formOutwardCode, setFormOutwardCode] = useState(instructor.outward_code_prefix || '');
  const [formTrade, setFormTrade] = useState(instructor.trade || '');
  const [formTradeGu, setFormTradeGu] = useState(instructor.trade_gu || '');
  const [formBatch, setFormBatch] = useState(instructor.batch || '');
  const [formUnit, setFormUnit] = useState(instructor.unit || '');

  // UI Feedback
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync state if instructor changes
  useEffect(() => {
    setFormName(instructor.name || '');
    setFormNameGu(instructor.name_gu || '');
    setFormDesignation(instructor.designation || '');
    setFormDesignationGu(instructor.designation_gu || '');
    setFormEmail(instructor.email || '');
    setFormPhone(instructor.phone || '');
    setFormPassword(instructor.password || '');
    setFormItiName(instructor.iti_name || '');
    setFormItiNameGu(instructor.iti_name_gu || '');
    setFormAddress(instructor.institution_address || '');
    setFormAddressGu(instructor.institution_address_gu || '');
    setFormOutwardCode(instructor.outward_code_prefix || '');
    setFormTrade(instructor.trade || '');
    setFormTradeGu(instructor.trade_gu || '');
    setFormBatch(instructor.batch || '');
    setFormUnit(instructor.unit || '');
    setIsEditing(isGuest ? false : initialEditMode);
    setFormError('');
    setSuccessMessage('');
  }, [instructor, initialEditMode, isOpen, isGuest]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (isGuest) {
      setFormError('This is a Guest Demo account. Profile modifications are disabled for security.');
      return;
    }

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPhone = cleanPhoneNumber(formPhone);

    if (!formName.trim()) {
      setFormError('Please enter full name in English.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Uniqueness validation against other users
    if (allInstructors.length > 0) {
      const uniqueness = checkInstructorUniqueness(
        cleanEmail,
        cleanPhone,
        allInstructors,
        instructor.id
      );
      if (!uniqueness.isUnique) {
        setFormError(uniqueness.message);
        return;
      }
    }

    // Password validation if changed
    if (formPassword && formPassword !== instructor.password) {
      const pwdValidation = validatePassword(formPassword);
      if (!pwdValidation.isValid) {
        setFormError(
          'Password must meet standard security criteria (minimum 8 characters with uppercase, lowercase, number, and special character).'
        );
        return;
      }
    }

    const updatedInstructor: Instructor = {
      ...instructor,
      name: formName.trim(),
      name_gu: formNameGu.trim() || undefined,
      designation: formDesignation.trim(),
      designation_gu: formDesignationGu.trim() || undefined,
      email: cleanEmail,
      phone: cleanPhone,
      password: formPassword || instructor.password,
      iti_name: formItiName.trim(),
      iti_name_gu: formItiNameGu.trim() || undefined,
      institution_address: formAddress.trim(),
      institution_address_gu: formAddressGu.trim() || undefined,
      outward_code_prefix: formOutwardCode.trim(),
      trade: isSuperAdmin ? instructor.trade : formTrade.trim(),
      trade_gu: isSuperAdmin ? instructor.trade_gu : formTradeGu.trim() || undefined,
      batch: isSuperAdmin ? instructor.batch : formBatch.trim(),
      unit: isSuperAdmin ? instructor.unit : formUnit.trim(),
      updated_at: new Date().toISOString(),
    };

    if (onUpdateInstructor) {
      onUpdateInstructor(updatedInstructor);
    }

    setSuccessMessage('Profile details saved successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      setIsEditing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isSuperAdmin
              ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white border-slate-800'
              : 'bg-gradient-to-r from-[#346739] to-[#264e2b] text-[#f2edc2] border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shadow-xs ${
                isSuperAdmin
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-[#f2edc2] text-[#346739]'
              }`}
            >
              {isSuperAdmin ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-tight text-white flex items-center gap-2">
                <span>
                  {isSuperAdmin
                    ? 'Super Admin Profile'
                    : 'Instructor Profile'}
                </span>
                {isEditing && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    Edit Mode
                  </span>
                )}
              </h3>
              <p
                className={`text-xs ${
                  isSuperAdmin ? 'text-amber-200/80' : 'text-[#9fcb98]'
                }`}
              >
                {isEditing
                  ? 'Update and manage your dual-language details'
                  : 'Official authenticated account details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Guest Demo Notice */}
          {isGuest && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 text-xs rounded-xl flex items-start gap-2.5 font-medium animate-in fade-in">
              <Eye className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900">Guest Demo Account</div>
                <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  This is a read-only demo account for evaluation. Profile modifications are disabled.
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            /* EDIT FORM */
            <form id="profile-edit-form" onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Dual Language Names */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#346739]" />
                  <span>Instructor Name (Dual Language)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Tejas Suthar"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Name (Gujarati)
                    </label>
                    <input
                      type="text"
                      value={formNameGu}
                      onChange={(e) => setFormNameGu(e.target.value)}
                      placeholder="e.g. તેજસભાઈ સુથાર"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                </div>
              </div>

              {/* Dual Language Designation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#346739]" />
                  <span>Designation (Dual Language)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Designation (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      placeholder="e.g. Supervisor Instructor"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Designation (Gujarati)
                    </label>
                    <input
                      type="text"
                      value={formDesignationGu}
                      onChange={(e) => setFormDesignationGu(e.target.value)}
                      placeholder="e.g. સુપરવાઇઝર ઇન્સ્ટ્રક્ટર"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Official Email *</span>
                    <span className="text-[10px] text-blue-700 font-mono">Login ID</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="instructor@iti.gov.in"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Mobile Number *</span>
                    <span className="text-[10px] text-blue-700 font-mono">10 digits</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98250 12345"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-500">Leave blank to keep existing</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium pr-10 focus:ring-2 focus:ring-[#346739]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dual Language ITI / Institute Name */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#346739]" />
                  <span>ITI / Institute Name (Dual Language)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Institute Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formItiName}
                      onChange={(e) => setFormItiName(e.target.value)}
                      placeholder="e.g. Government ITI Shankheshwar"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Institute Name (Gujarati)
                    </label>
                    <input
                      type="text"
                      value={formItiNameGu}
                      onChange={(e) => setFormItiNameGu(e.target.value)}
                      placeholder="e.g. સરકારી ઔદ્યોગિક તાલીમ સંસ્થા, શંખેશ્વર"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                </div>
              </div>

              {/* Dual Language Address */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#346739]" />
                  <span>Institution Address (Dual Language)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Address (English)
                    </label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="e.g. Station Road, Shankheshwar, Dist. Patan"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Address (Gujarati)
                    </label>
                    <input
                      type="text"
                      value={formAddressGu}
                      onChange={(e) => setFormAddressGu(e.target.value)}
                      placeholder="e.g. સ્ટેશન રોડ, શંખેશ્વર, જિ. પાટણ"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                    />
                  </div>
                </div>
              </div>

              {/* Outward Code Prefix */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Outward Reference Code Prefix</span>
                  <span className="text-[10px] text-slate-500">e.g. ITI/SHANK/2026/</span>
                </label>
                <input
                  type="text"
                  value={formOutwardCode}
                  onChange={(e) => setFormOutwardCode(e.target.value)}
                  placeholder="e.g. ITI/SHANK/COPA/2026/"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#346739]"
                />
              </div>

              {/* Classroom Academic Scope (Instructors Only) */}
              {!isSuperAdmin && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#346739]" />
                    <span>Academic Scope (Trade, Batch &amp; Unit)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Trade (English)</label>
                      <input
                        type="text"
                        value={formTrade}
                        onChange={(e) => setFormTrade(e.target.value)}
                        placeholder="e.g. COPA"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Trade (Gujarati)</label>
                      <input
                        type="text"
                        value={formTradeGu}
                        onChange={(e) => setFormTradeGu(e.target.value)}
                        placeholder="e.g. કોપા"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Batch</label>
                      <input
                        type="text"
                        value={formBatch}
                        onChange={(e) => setFormBatch(e.target.value)}
                        placeholder="e.g. 2025-2026"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Unit</label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="e.g. Unit A"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* VIEW DETAILS MODE */
            <>
              {/* Identity Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">
                      {instructor.name}
                    </span>
                    {instructor.name_gu && (
                      <span className="text-slate-600 font-medium text-sm">
                        ({instructor.name_gu})
                      </span>
                    )}
                    {instructor.email_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSuperAdmin
                          ? 'bg-slate-900 text-amber-300 border border-slate-800'
                          : 'bg-[#f2edc2] text-[#346739] border border-[#9fcb98]'
                      }`}
                    >
                      {isSuperAdmin ? 'Super Admin' : 'Instructor'}
                    </span>
                    {isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                        <ShieldCheck className="w-3 h-3 text-purple-700" />
                        <span>Lifetime Access</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Calendar className="w-3 h-3 text-emerald-700" />
                        <span>
                          Valid until: {formatValidityDate(instructor.valid_until)} ({getValidityRemainingDays(instructor)} days left)
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {instructor.designation || (isSuperAdmin ? 'Super Administrator' : 'Supervisor Instructor')}
                      {instructor.designation_gu && ` (${instructor.designation_gu})`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {instructor.iti_name}
                      {instructor.iti_name_gu && ` • ${instructor.iti_name_gu}`}
                    </span>
                  </div>
                  {instructor.institution_address && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{instructor.institution_address}</span>
                    </div>
                  )}
                </div>

                {!isGuest && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#346739]" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Academic Scope Grid for Instructor OR Administrative Scope for Super Admin */}
              {isSuperAdmin ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      Jurisdiction
                    </div>
                    <div className="font-bold text-slate-800 truncate" title="Portal Administration">
                      Portal Administration
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      Scope
                    </div>
                    <div className="font-bold text-slate-800 truncate">
                      Instructor Approvals &amp; Audit
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      Trade
                    </div>
                    <div className="font-bold text-slate-800 truncate" title={instructor.trade}>
                      {instructor.trade}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      Unit
                    </div>
                    <div className="font-bold text-slate-800 truncate">
                      {instructor.unit || 'Unit A'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      Batch
                    </div>
                    <div className="font-bold text-slate-800 truncate">
                      {instructor.batch || '2025-2026'}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Credentials Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Contact &amp; Credentials
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono truncate">{instructor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{instructor.phone}</span>
                  </div>
                </div>
                {instructor.outward_code_prefix && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="text-slate-500">Outward Reference Prefix:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {instructor.outward_code_prefix}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:text-rose-900 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="profile-edit-form"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#346739] hover:bg-[#264e2b] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
