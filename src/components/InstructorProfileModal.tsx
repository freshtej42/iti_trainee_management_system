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
  Lock,
  Edit3,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  MapPin,
  Hash,
  Check,
} from 'lucide-react';
import {
  validatePassword,
  cleanPhoneNumber,
  checkInstructorUniqueness,
} from '../utils/passwordPolicy';

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

  // Form State
  const [formName, setFormName] = useState(instructor.name || '');
  const [formDesignation, setFormDesignation] = useState(instructor.designation || '');
  const [formEmail, setFormEmail] = useState(instructor.email || '');
  const [formPhone, setFormPhone] = useState(instructor.phone || '');
  const [formPassword, setFormPassword] = useState(instructor.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [formItiName, setFormItiName] = useState(instructor.iti_name || '');
  const [formAddress, setFormAddress] = useState(instructor.institution_address || '');
  const [formOutwardCode, setFormOutwardCode] = useState(instructor.outward_code_prefix || '');
  const [formTrade, setFormTrade] = useState(instructor.trade || '');
  const [formBatch, setFormBatch] = useState(instructor.batch || '');
  const [formUnit, setFormUnit] = useState(instructor.unit || '');

  // UI Feedback
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync state if instructor changes
  useEffect(() => {
    setFormName(instructor.name || '');
    setFormDesignation(instructor.designation || '');
    setFormEmail(instructor.email || '');
    setFormPhone(instructor.phone || '');
    setFormPassword(instructor.password || '');
    setFormItiName(instructor.iti_name || '');
    setFormAddress(instructor.institution_address || '');
    setFormOutwardCode(instructor.outward_code_prefix || '');
    setFormTrade(instructor.trade || '');
    setFormBatch(instructor.batch || '');
    setFormUnit(instructor.unit || '');
    setIsEditing(initialEditMode);
    setFormError('');
    setSuccessMessage('');
  }, [instructor, initialEditMode, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPhone = cleanPhoneNumber(formPhone);

    if (!formName.trim()) {
      setFormError('પૂરું નામ દાખલ કરવું ફરજિયાત છે.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('માન્ય ઈમેલ આઈડી દાખલ કરો.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('૧૦ આંકડાનો માન્ય મોબાઈલ નંબર દાખલ કરો.');
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
          'પાસવર્ડ આંતરરાષ્ટ્રીય માપદંડો મુજબ મજબૂત હોવો જોઈએ (ઓછામાં ઓછા ૮ અક્ષરો, કેપિટલ, સ્મોલ, નંબર, સ્પેશિયલ સિમ્બોલ).'
        );
        return;
      }
    }

    const updatedInstructor: Instructor = {
      ...instructor,
      name: formName.trim(),
      designation: formDesignation.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: formPassword || instructor.password,
      iti_name: formItiName.trim(),
      institution_address: formAddress.trim(),
      outward_code_prefix: formOutwardCode.trim(),
      trade: isSuperAdmin ? instructor.trade : formTrade.trim(),
      batch: isSuperAdmin ? instructor.batch : formBatch.trim(),
      unit: isSuperAdmin ? instructor.unit : formUnit.trim(),
      updated_at: new Date().toISOString(),
    };

    if (onUpdateInstructor) {
      onUpdateInstructor(updatedInstructor);
    }

    setSuccessMessage('પ્રોફાઇલ વિગતો સફળતાપૂર્વક સાચવવામાં આવી છે!');
    setTimeout(() => {
      setSuccessMessage('');
      setIsEditing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
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
                    ? 'સુપર એડમિન પ્રોફાઇલ (Super Admin Profile)'
                    : 'ઇન્સ્ટ્રક્ટર પ્રોફાઇલ (My Profile)'}
                </span>
                {isEditing && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    એડિટ મોડ
                  </span>
                )}
              </h3>
              <p
                className={`text-xs ${
                  isSuperAdmin ? 'text-amber-200/80' : 'text-[#9fcb98]'
                }`}
              >
                {isEditing
                  ? 'આપની વ્યક્તિગત પ્રોફાઇલ વિગતો સુધારો અને સાચવો'
                  : 'સુરક્ષિત સત્તાવાર લોગિન કરેલ સત્ર વિગતો'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="બંધ કરો (Close)"
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

          {isEditing ? (
            /* EDIT FORM */
            <form id="profile-edit-form" onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    પૂરું નામ (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="દા.ત. તેજસભાઈ સુથાર"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#346739]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    હોદ્દો (Designation) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="દા.ત. સુપરવાઇઝર ઇન્સ્ટ્રક્ટર / સુપર એડમિનિસ્ટ્રેટર"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#346739]"
                  />
                </div>
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>ઈમેલ આઈડી (Official Email) *</span>
                    <span className="text-[10px] text-blue-700 font-mono">યુનિક લોગિન</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="admin@iti.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#346739]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>મોબાઈલ નંબર (Mobile No) *</span>
                    <span className="text-[10px] text-blue-700 font-mono">૧૦ આંકડા</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="૧૦ આંકડાનો મોબાઈલ નંબર"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#346739]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>પાસવર્ડ (Password)</span>
                  <span className="text-[10px] text-slate-500">બદલવા માટે જ દાખલ કરો</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="નવો પાસવર્ડ દાખલ કરો"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium pr-10 focus:bg-white focus:ring-2 focus:ring-[#346739]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  નિયમ: ઓછામાં ઓછા ૮ અક્ષર, ૧ કેપિટલ, ૧ સ્મોલ, ૧ અંક અને ૧ સ્પેશિયલ સિમ્બોલ (@$!%*#?&).
                </div>
              </div>

              {/* Institute / Directorate Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isSuperAdmin ? 'સંચાલનાલય / કચેરીનું નામ *' : 'સંસ્થાનું નામ (ITI Institute Name) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formItiName}
                  onChange={(e) => setFormItiName(e.target.value)}
                  placeholder="દા.ત. રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગાંધીનગર"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#346739]"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  કચેરી / સંસ્થાનું સત્તાવાર સરનામું (Official Address)
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="દા.ત. બ્લોક નં. ૧/૨, ડો. જીવરાજ મહેતા ભવન, ગાંધીનગર"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#346739]"
                />
              </div>

              {/* Outward Code Prefix */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>જાવક નંબર પ્રીફિક્સ (Outward Reference Code Prefix)</span>
                  <span className="text-[10px] text-slate-500">દા.ત. DTE/ITI/ADMIN/2026/</span>
                </label>
                <input
                  type="text"
                  value={formOutwardCode}
                  onChange={(e) => setFormOutwardCode(e.target.value)}
                  placeholder="દા.ત. આઈટીઆઈ/શંખેશ્વર/કોપા/૨૦૨૬/"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#346739]"
                />
              </div>

              {/* For standard instructors: Trade, Batch, Unit */}
              {!isSuperAdmin && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#346739]" />
                    <span>વર્ગખંડ શૈક્ષણિક વિગતો (Trade, Batch & Unit)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">ટ્રેડ</label>
                      <input
                        type="text"
                        value={formTrade}
                        onChange={(e) => setFormTrade(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">બેચ</label>
                      <input
                        type="text"
                        value={formBatch}
                        onChange={(e) => setFormBatch(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">યુનિટ</label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
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
                    {instructor.email_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>વેરિફાઇડ (Verified)</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSuperAdmin
                          ? 'bg-slate-900 text-amber-300 border border-slate-800'
                          : 'bg-[#f2edc2] text-[#346739] border border-[#9fcb98]'
                      }`}
                    >
                      {isSuperAdmin ? 'સુપર એડમિન (Super Admin)' : 'ઇન્સ્ટ્રક્ટર (Instructor)'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {instructor.designation ||
                        (isSuperAdmin ? 'સુપર એડમિનિસ્ટ્રેટર' : 'સુપરવાઇઝર ઇન્સ્ટ્રક્ટર')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{instructor.iti_name}</span>
                  </div>
                  {instructor.institution_address && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{instructor.institution_address}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                  title="પ્રોફાઇલ વિગતો એડિટ કરો"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#346739]" />
                  <span>એડિટ કરો</span>
                </button>
              </div>

              {/* Academic Scope Grid for Instructor OR Administrative Scope for Super Admin */}
              {isSuperAdmin ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      અધિકાર ક્ષેત્ર (Jurisdiction)
                    </div>
                    <div className="font-bold text-slate-800 truncate" title="State-Wide ITIs">
                      સમગ્ર ગુજરાત ITI સંસ્થાઓ
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      મુખ્ય જવાબદારી (Scope)
                    </div>
                    <div className="font-bold text-slate-800 truncate">
                      ઇન્સ્ટ્રક્ટર મંજૂરી & સિસ્ટમ ઓડિટ
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      ટ્રેડ (Trade)
                    </div>
                    <div className="font-bold text-slate-800 truncate" title={instructor.trade}>
                      {instructor.trade}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      યુનિટ (Unit)
                    </div>
                    <div className="font-bold text-slate-800 truncate">
                      {instructor.unit || 'Unit A'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                      બેચ (Batch)
                    </div>
                    <div className="font-bold text-slate-800 truncate">
                      {instructor.batch || '૨૦૨૫–૨૦૨૬'}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">ઈમેલ આઈડી:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{instructor.email}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">મોબાઈલ નંબર:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {instructor.phone || 'ઉપલબ્ધ નથી'}
                  </span>
                </div>

                {instructor.outward_code_prefix && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">જાવક નંબર પ્રીફિક્સ:</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {instructor.outward_code_prefix}
                    </span>
                  </div>
                )}
              </div>

              {/* Security & Role Boundaries Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Lock className="w-4 h-4 text-[#346739]" />
                  <span>
                    {isSuperAdmin
                      ? 'સુપર એડમિન વહીવટી સ્વાયત્તતા (Directorate Authority)'
                      : 'સુરક્ષિત સિંગલ ઇન્સ્ટ્રક્ટર સત્ર (Isolated Profile)'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {isSuperAdmin
                    ? 'સુપર એડમિન તરીકે આપ સમગ્ર ગુજરાતની તમામ ITI ના તમામ ઇન્સ્ટ્રક્ટર પ્રોફાઇલ તેમજ આપનું વ્યક્તિગત પ્રોફાઇલ સંપૂર્ણ રીતે એડિટ અને વહીવટી નિયંત્રણ કરી શકો છો.'
                    : 'આપના તાલીમાર્થીઓ, હાજરી રેકોર્ડ, અને વર્ડ નોટિસ માત્ર આપના માટે જ સુલભ છે. આપ કોઈપણ સમયે આપની પ્રોફાઇલ વિગતો એડિટ કરી શકો છો.'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          {isEditing ? (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormError('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
              >
                રદ કરો (Cancel)
              </button>
              <button
                type="submit"
                form="profile-edit-form"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>ફેરફારો સાચવો (Save Profile)</span>
              </button>
            </div>
          ) : (
            <>
              {onLogout ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                  title="ખાતામાંથી લોગ આઉટ કરો"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>લોગ આઉટ કરો (Log Out)</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#346739] bg-[#f2edc2]/50 hover:bg-[#f2edc2] border border-[#9fcb98] transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>પ્રોફાઇલ એડિટ કરો (Edit)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-2xs"
                >
                  બંધ કરો (Close)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
