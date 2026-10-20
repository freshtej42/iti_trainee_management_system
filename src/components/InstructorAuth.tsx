import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Send,
  HelpCircle,
  KeyRound,
  X,
  Sparkles,
} from 'lucide-react';
import { transliterateText } from '../utils/phoneticIme';
import { INITIAL_INSTRUCTORS, DEMO_GUEST_INSTRUCTOR } from '../data/initialData';
import {
  validatePassword,
  cleanPhoneNumber,
  checkInstructorUniqueness,
} from '../utils/passwordPolicy';

import { Instructor, AcademicTrade, SuperAdminSettings } from '../types';
import { PaymentVerificationModal } from './PaymentVerificationModal';
import { DEFAULT_ADMIN_SETTINGS } from '../services/dataService';

interface InstructorAuthProps {
  instructors: Instructor[];
  adminSettings?: SuperAdminSettings;
  onLogin: (instructor: Instructor) => void;
  onRegister: (newInstructor: Omit<Instructor, 'id' | 'created_at'> & { id?: string }) => void;
  onVerifyEmail?: (instructorId: string) => void;
  onUpdateInstructor?: (instructor: Instructor) => void;
}

import {
  GUJARAT_ITIS,
  STANDARD_DESIGNATIONS,
  ACADEMIC_BATCHES,
  STANDARD_UNITS,
  COMMON_TRADES,
  GUJARAT_DISTRICTS,
  POPULAR_TALUKAS_BY_DISTRICT,
} from '../data/registrationOptions';

export default function InstructorAuth({
  instructors,
  adminSettings = DEFAULT_ADMIN_SETTINGS,
  onLogin,
  onRegister,
  onUpdateInstructor,
}: InstructorAuthProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');
  const [pendingNotice, setPendingNotice] = useState<{
    instructor: Instructor;
    name: string;
    phone: string;
    email: string;
  } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [activePaymentInstructor, setActivePaymentInstructor] = useState<Instructor | null>(null);

  // --- Login Form State (Versatile Login: Email OR Mobile) ---
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);

  const [regNameEn, setRegNameEn] = useState<string>('');
  const [regNameGu, setRegNameGu] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regItiName, setRegItiName] = useState<string>(GUJARAT_ITIS[0]);
  const [customItiName, setCustomItiName] = useState<string>('');
  const [regDesignation, setRegDesignation] = useState<string>(STANDARD_DESIGNATIONS[0]);
  const [customDesignation, setCustomDesignation] = useState<string>('');
  const [regTrade, setRegTrade] = useState<string>(COMMON_TRADES[0]);
  const [customTrade, setCustomTrade] = useState<string>('');
  const [regBatch, setRegBatch] = useState<string>(ACADEMIC_BATCHES[0]);
  const [customBatch, setCustomBatch] = useState<string>('');
  const [regUnit, setRegUnit] = useState<string>(STANDARD_UNITS[0]);
  const [customUnit, setCustomUnit] = useState<string>('');
  const [regDistrict, setRegDistrict] = useState<string>(GUJARAT_DISTRICTS[0] || 'ગાંધીનગર');
  const [customDistrict, setCustomDistrict] = useState<string>('');
  const [regTaluka, setRegTaluka] = useState<string>('ગાંધીનગર');
  const [customTaluka, setCustomTaluka] = useState<string>('');
  const [regAddress, setRegAddress] = useState<string>('');

  // Live password validation
  const passwordValidation = validatePassword(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  // Auto-transliteration for registration instructor name
  const handleRegNameEnChange = (val: string) => {
    setRegNameEn(val);
    const converted = transliterateText(val, 'Gujarati');
    setRegNameGu(converted);
  };

  // Handle Login submission with Dual Login (Email OR Mobile Number)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setPendingNotice(null);

    const rawQuery = loginIdentifier.trim();
    if (!rawQuery) {
      setErrorMsg('કૃપા કરીને આપનો મોબાઈલ નંબર અથવા ઈમેલ આઈડી દાખલ કરો (Please enter Mobile Number or Email ID).');
      return;
    }

    const cleanQuery = rawQuery.toLowerCase();
    const cleanPhone = cleanPhoneNumber(rawQuery);

    // Fast-path for guest demo login
    if (
      cleanQuery === 'guest' ||
      cleanQuery === 'demo' ||
      cleanQuery === 'guest@itidemo.gov.in' ||
      cleanPhone === '9999900000'
    ) {
      onLogin(DEMO_GUEST_INSTRUCTOR);
      return;
    }

    // Search by Email OR 10-digit Mobile Number OR User ID
    const searchPool = [...instructors, ...INITIAL_INSTRUCTORS];
    const found = searchPool.find((inst) => {
      const emailMatch = inst.email && inst.email.trim().toLowerCase() === cleanQuery;
      const phoneMatch = cleanPhone.length >= 10 && cleanPhoneNumber(inst.phone) === cleanPhone;
      const userIdMatch = inst.user_id && inst.user_id.trim().toLowerCase() === cleanQuery;
      const idMatch = inst.id && inst.id.trim().toLowerCase() === cleanQuery;
      return emailMatch || phoneMatch || userIdMatch || idMatch;
    });

    if (!found) {
      setErrorMsg(
        'આ મોબાઈલ નંબર અથવા ઈમેલ સાથે કોઈ એકાઉન્ટ મળ્યું નથી. કૃપા કરીને સાચી વિગત દાખલ કરો અથવા નવું રજીસ્ટ્રેશન કરો.'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMsg('કૃપા કરીને પાસવર્ડ દાખલ કરો (Please enter password).');
      return;
    }

    // Check account verification status
    if (found.status === 'pending') {
      setActivePaymentInstructor(found);
      setPendingNotice({
        instructor: found,
        name: found.name,
        phone: found.phone || 'તમારા મોબાઈલ',
        email: found.email,
      });
      // If user has not submitted payment screenshot yet, open payment verification modal
      if (!found.payment_screenshot_url) {
        setShowPaymentModal(true);
      }
      return;
    }

    if (found.status === 'rejected') {
      setErrorMsg('આ એકાઉન્ટ સુપર એડમિન દ્વારા અસ્વીકાર (Rejected) કરવામાં આવ્યું છે. કૃપા કરીને વહીવટકર્તાનો સંપર્ક કરો.');
      return;
    }

    if (found.status === 'suspended') {
      setErrorMsg('આ એકાઉન્ટ હાલ પૂરતું સ્થગિત (Suspended) કરેલ છે.');
      return;
    }

    // Verify password strictly against stored account password
    const isPasswordValid = found.password === loginPassword;

    if (!isPasswordValid) {
      setErrorMsg('પાસવર્ડ ખોટો છે (Incorrect password). જો પાસવર્ડ ભૂલી ગયા હોવ તો સુપર એડમિનનો સંપર્ક કરો.');
      return;
    }

    onLogin(found);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const finalName = regNameGu.trim() || regNameEn.trim();
    if (!finalName) {
      setErrorMsg('કૃપા કરીને ઇન્સ્ટ્રક્ટરનું પૂરું નામ દાખલ કરો (Please enter full name).');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('કૃપા કરીને માન્ય ઈમેલ આઈડી દાખલ કરો (Please enter valid email address).');
      return;
    }

    const cleanPhone = cleanPhoneNumber(regPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('કૃપા કરીને માન્ય ૧૦ આંકડાનો મોબાઈલ નંબર દાખલ કરો (Please enter 10-digit mobile number).');
      return;
    }

    // Strict Uniqueness Check
    const uniqueness = checkInstructorUniqueness(cleanEmail, cleanPhone, instructors);
    if (!uniqueness.isUnique) {
      setErrorMsg(uniqueness.message);
      return;
    }

    // Strict Password Validation
    if (!passwordValidation.isValid) {
      setErrorMsg('પાસવર્ડ સુરક્ષા માપદંડો મુજબનો નથી. કૃપા કરીને મજબૂત પાસવર્ડ બનાવો.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('પાસવર્ડ અને કન્ફર્મ પાસવર્ડ સરખા નથી (Passwords do not match).');
      return;
    }

    const effectiveTrade = regTrade === 'other' ? customTrade.trim() : regTrade;
    if (!effectiveTrade) {
      setErrorMsg('કૃપા કરીને આપનો ટ્રેડ દાખલ કરો (Please select/enter Trade).');
      return;
    }

    const effectiveItiName = regItiName === 'other' ? (customItiName.trim() || 'ઔદ્યોગિક તાલીમ સંસ્થા') : regItiName;
    const effectiveDesignation = regDesignation === 'other' ? (customDesignation.trim() || 'સુપરવાઇઝર ઇન્સ્ટ્રક્ટર') : regDesignation;
    const effectiveBatch = regBatch === 'other' ? (customBatch.trim() || '84') : regBatch;
    const effectiveUnit = regUnit === 'other' ? (customUnit.trim() || 'Unit A') : regUnit;

    const initialAcademicHierarchy: AcademicTrade[] = [
      {
        id: `trade-${Date.now()}`,
        name: effectiveTrade,
        batches: [
          {
            id: `batch-${Date.now()}`,
            name: effectiveBatch,
            units: [
              { id: `unit-${Date.now()}-1`, name: effectiveUnit },
            ],
          },
        ],
      },
    ];

    const newInstructorData: Omit<Instructor, 'id' | 'created_at'> = {
      name: finalName,
      name_gu: regNameGu.trim() || finalName,
      email: cleanEmail,
      phone: cleanPhone,
      password: regPassword,
      role: 'instructor',
      status: 'pending', // Requires Super Admin approval!
      email_verified: false,
      mobile_verified: false,
      iti_name: effectiveItiName,
      designation: effectiveDesignation,
      trade: effectiveTrade,
      trades: [effectiveTrade],
      batch: effectiveBatch,
      batches: [effectiveBatch],
      unit: effectiveUnit,
      units: [effectiveUnit],
      academic_hierarchy: initialAcademicHierarchy,
      institution_address: regAddress.trim() || `તા. ${regTaluka === 'other' ? customTaluka : regTaluka.split(' ')[0]}, જી. ${regDistrict === 'other' ? customDistrict : regDistrict.split(' ')[0]}, ગુજરાત`,
      outward_code_prefix: 'ઔતાસં/તલમ/૨૦૨૫',
      header_config: {
        show_logo: true,
        institute_name_gu: effectiveItiName,
        institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE',
        department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત રાજ્ય',
        address: regAddress.trim() || `તા. ${regTaluka === 'other' ? customTaluka : regTaluka.split(' ')[0]}, જી. ${regDistrict === 'other' ? customDistrict : regDistrict.split(' ')[0]}, ગુજરાત`,
        ref_prefix: 'આઈટીઆઈ/તલમ/૨૦૨૫',
      },
    };

    const registrationId = `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const createdInstructorTemp: Instructor = {
      ...newInstructorData,
      id: registrationId,
      created_at: new Date().toISOString(),
    };

    onRegister({
      ...newInstructorData,
      id: registrationId,
    });

    // Show pending approval notice and link to payment modal
    setActivePaymentInstructor(createdInstructorTemp);
    setPendingNotice({
      instructor: createdInstructorTemp,
      name: finalName,
      phone: cleanPhone,
      email: cleanEmail,
    });
    // Immediately open payment verification modal upon registration completion
    setShowPaymentModal(true);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1b381e] to-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#346739] text-[#f2edc2] shadow-xl border border-[#9fcb98]/40 mb-3">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          ITI Trainee Attendance Portal
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી • ગુજરાત રાજ્ય
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-6 px-4 shadow-2xl rounded-2xl sm:px-8 border border-slate-200">
          {/* Top Auth Mode Tabs */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setPendingNotice(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-colors ${
                authMode === 'login'
                  ? 'border-[#346739] text-[#346739]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ઇન્સ્ટ્રક્ટર લોગિન (Login)
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
                setPendingNotice(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-colors ${
                authMode === 'register'
                  ? 'border-[#346739] text-[#346739]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              નવું રજીસ્ટ્રેશન (Register)
            </button>
          </div>

          {/* Guest Demo Portal Exploration Card */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-emerald-50/40 to-slate-50 border border-amber-300 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900">
                      લાઇવ ડેમો એકાઉન્ટ (Full Interactive Demo)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      તમામ સુવિધાઓ ચાલુ (All Features Unlocked)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    ચૂકવણી કરતાં પહેલાં પોર્ટલની તમામ સુવિધાઓ (તાલીમાર્થી ઉમેરવા/એક્સેલ ઈમ્પોર્ટ, માસિક હાજરી નોંધણી, ટેમ્પલેટ સ્ટુડિયો, નોટિસ/આચાર્ય રિપોર્ટ જનરેશન અને આવક-જાવક રજીસ્ટર) લાઇવ વાપરીને અનુભવ કરો.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="text-[10px] sm:text-[11px] text-slate-600 font-mono flex items-center gap-1.5 flex-wrap">
                <span className="bg-white px-2 py-1 rounded-md border border-amber-200 text-slate-700">
                  ID: <strong className="text-slate-900 font-bold">guest@itidemo.gov.in</strong>
                </span>
                <span className="bg-white px-2 py-1 rounded-md border border-amber-200 text-slate-700">
                  Pass: <strong className="text-slate-900 font-bold">Guest@Demo2026!</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('guest@itidemo.gov.in');
                    setLoginPassword('Guest@Demo2026!');
                    setAuthMode('login');
                    setErrorMsg('');
                  }}
                  className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-[11px] font-bold transition-colors"
                  title="ડેમો ક્રેડેન્શિયલ્સ ભરો"
                >
                  ઓટો-ફિલ
                </button>
                <button
                  type="button"
                  onClick={() => onLogin(DEMO_GUEST_INSTRUCTOR)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#346739] hover:bg-[#2b552f] text-[#f2edc2] rounded-xl text-xs font-black shadow-xs transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>ડેમો તરીકે તરત પ્રવેશ કરો (Instant Demo)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Pending Approval Notice Dialog */}
          {pendingNotice && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2 font-bold text-sm text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>ખાતું મંજૂરી માટે પેન્ડિંગ છે (Pending Approval)</span>
                </div>
                {pendingNotice.instructor.payment_screenshot_url && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    પેમેન્ટ સબમિટ થયેલ
                  </span>
                )}
              </div>
              <p className="mb-2 leading-relaxed">
                નમસ્તે <strong className="text-slate-900">{pendingNotice.name}</strong>, આપનું રજીસ્ટ્રેશન સફળતાપૂર્વક નોંધાયેલ છે.
                સુપર એડમિન દ્વારા આપનું ખાતું વેરિફાય કરવામાં આવી રહ્યું છે.
              </p>
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 space-y-1 text-[11px] text-slate-700">
                <div>• નોંધાયેલ મોબાઈલ નંબર: <strong className="text-slate-900">{pendingNotice.phone}</strong></div>
                <div>• નોંધાયેલ ઈમેલ આઈડી: <strong className="text-slate-900">{pendingNotice.email}</strong></div>
                {pendingNotice.instructor.payment_utr && (
                  <div>• સબમિટ કરેલ UTR / Ref ID: <strong className="text-slate-900 font-mono">{pendingNotice.instructor.payment_utr}</strong></div>
                )}
                {pendingNotice.instructor.payment_screenshot_url && (
                  <div className="pt-2 border-t border-amber-200">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">અપલોડ કરેલ ચુકવણી સ્ક્રીનશોટ:</span>
                    <img
                      src={pendingNotice.instructor.payment_screenshot_url}
                      alt="Payment Receipt"
                      className="max-h-28 rounded-lg border border-emerald-300 bg-white object-contain p-1 shadow-2xs cursor-pointer"
                      onClick={() => {
                        setActivePaymentInstructor(pendingNotice.instructor);
                        setShowPaymentModal(true);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* UPI Payment Status / Action */}
              <div className="mt-3 pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-amber-900">
                  {pendingNotice.instructor.payment_screenshot_url ? (
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ₹{pendingNotice.instructor.payment_amount || adminSettings.fee_amount || 9} ની ચુકવણી રસીદ સુપર એડમિન પાસે ચકાસણી માટે મોકલેલ છે.
                    </span>
                  ) : (
                    <span className="text-amber-800 font-medium">
                      ⚠️ રજીસ્ટ્રેશન વેરિફિકેશન માટે ₹{adminSettings.fee_amount || 9} ચૂકવણી અને સ્ક્રીનશોટ જરૂરી છે.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentInstructor(pendingNotice.instructor);
                    setShowPaymentModal(true);
                  }}
                  className="px-3 py-1.5 bg-[#346739] hover:bg-[#2b552f] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <span>{pendingNotice.instructor.payment_screenshot_url ? 'પેમેન્ટ વિગતો જુઓ / ફરી અપલોડ કરો' : 'QR કોડ સ્કેન કરી ₹9 ચૂકવો'}</span>
                </button>
              </div>

              <p className="mt-2 text-[10px] text-amber-800 font-medium">
                સુપર એડમિન આપના મોબાઈલ નંબર પર સંપર્ક/સંદેશ મોકલશે. ત્યારબાદ આપ અહીં સીધા લોગિન કરી શકશો.
              </p>
            </div>
          )}

          {/* LOGIN VIEW */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  મોબાઈલ નંબર અથવા ઈમેલ આઈડી (Mobile Number or Email ID)
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="દા.ત. 9825012345 અથવા email@gujarat.gov.in"
                    className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white transition-all text-slate-900 font-medium"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  આપ આપના ૧૦ આંકડાના મોબાઈલ નંબર અથવા નોંધાયેલ ઈમેલ વડે લોગિન કરી શકો છો.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    પાસવર્ડ (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] font-bold text-[#346739] hover:text-[#264e2b] hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3 text-[#346739]" />
                    <span>પાસવર્ડ ભૂલી ગયા? (Forgot Password?)</span>
                  </button>
                </div>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="આપનો પાસવર્ડ દાખલ કરો"
                    className="block w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white transition-all text-slate-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] text-sm font-bold shadow-md transition-all active:scale-[0.99] min-h-[44px]"
              >
                <Lock className="w-4 h-4" />
                <span>સુરક્ષિત લોગિન કરો (Sign In)</span>
              </button>
            </form>
          )}

          {/* REGISTRATION VIEW */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <strong>સૂચના:</strong> નવું ખાતું બનાવ્યા પછી સુપર એડમિન દ્વારા આપનું વેરિફિકેશન કરવામાં આવશે.
                મોબાઈલ નંબર અને ઈમેલ આઈડી યુનિક હોવા જરૂરી છે.
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ઇન્સ્ટ્રક્ટરનું પૂરું નામ (અંગ્રેજીમાં)
                  </label>
                  <input
                    type="text"
                    required
                    value={regNameEn}
                    onChange={(e) => handleRegNameEnChange(e.target.value)}
                    placeholder="e.g. Tejas Suthar"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ઇન્સ્ટ્રક્ટર નામ (ગુજરાતીમાં)
                  </label>
                  <input
                    type="text"
                    value={regNameGu}
                    onChange={(e) => setRegNameGu(e.target.value)}
                    placeholder="દા.ત. તેજસભાઈ સુથાર"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium font-gujarati"
                  />
                </div>
              </div>

              {/* Email and Mobile Number (Dual Login IDs - Strictly Unique) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>ઈમેલ આઈડી (Email ID) *</span>
                    <span className="text-[10px] text-blue-700 font-semibold">લોગિન આઈડી</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="instructor@iti.gujarat.gov.in"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>મોબાઈલ નંબર (Mobile No) *</span>
                    <span className="text-[10px] text-blue-700 font-semibold">લોગિન આઈડી</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="૧૦ આંકડાનો મોબાઈલ દા.ત. 9825012345"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* ITI & Designation Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    સંસ્થાનું નામ (ITI Name) *
                  </label>
                  <select
                    value={regItiName}
                    onChange={(e) => setRegItiName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                  >
                    {GUJARAT_ITIS.map((iti) => (
                      <option key={iti} value={iti}>
                        {iti}
                      </option>
                    ))}
                    <option value="other">અન્ય સંસ્થા (Custom ITI)...</option>
                  </select>
                  {regItiName === 'other' && (
                    <input
                      type="text"
                      required
                      placeholder="સંસ્થાનું પૂરું નામ દાખલ કરો"
                      value={customItiName}
                      onChange={(e) => setCustomItiName(e.target.value)}
                      className="mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] text-slate-900 font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    હોદ્દો (Designation) *
                  </label>
                  <select
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                  >
                    {STANDARD_DESIGNATIONS.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                    <option value="other">અન્ય હોદ્દો (Custom Designation)...</option>
                  </select>
                  {regDesignation === 'other' && (
                    <input
                      type="text"
                      required
                      placeholder="આપનો હોદ્દો દાખલ કરો"
                      value={customDesignation}
                      onChange={(e) => setCustomDesignation(e.target.value)}
                      className="mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] text-slate-900 font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Trade, Batch, Unit Hierarchy Initialization with Dropdowns */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#346739]">
                  <Layers className="w-4 h-4 text-[#346739]" />
                  <span>પ્રાથમિક શૈક્ષણિક વિગતો (Initial Trade, Batch & Unit)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ૧. ટ્રેડ (Trade) *
                    </label>
                    <select
                      value={regTrade}
                      onChange={(e) => setRegTrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      {COMMON_TRADES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      <option value="other">અન્ય ટ્રેડ (Custom)...</option>
                    </select>
                    {regTrade === 'other' && (
                      <input
                        type="text"
                        required
                        placeholder="ટ્રેડનું નામ દાખલ કરો"
                        value={customTrade}
                        onChange={(e) => setCustomTrade(e.target.value)}
                        className="mt-1.5 w-full px-2 py-1 text-xs border rounded"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ૨. બેચ (Batch) *
                    </label>
                    <select
                      value={regBatch}
                      onChange={(e) => setRegBatch(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      {ACADEMIC_BATCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value="other">અન્ય બેચ (Custom)...</option>
                    </select>
                    {regBatch === 'other' && (
                      <input
                        type="text"
                        required
                        placeholder="બેચ દા.ત. 84, 85, 86..."
                        value={customBatch}
                        onChange={(e) => setCustomBatch(e.target.value)}
                        className="mt-1.5 w-full px-2 py-1 text-xs border rounded"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ૩. યુનિટ (Unit) *
                    </label>
                    <select
                      value={regUnit}
                      onChange={(e) => setRegUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      {STANDARD_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                      <option value="other">અન્ય યુનિટ (Custom)...</option>
                    </select>
                    {regUnit === 'other' && (
                      <input
                        type="text"
                        required
                        placeholder="યુનિટ દા.ત. Unit A"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        className="mt-1.5 w-full px-2 py-1 text-xs border rounded"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Strong Password Section with Live Standard Meter */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#346739]" />
                    <span>પાસવર્ડ બનાવો (Create Strong Password) *</span>
                  </label>
                  {regPassword.length > 0 && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${passwordValidation.strengthColor}20`,
                        color: passwordValidation.strengthColor,
                      }}
                    >
                      {passwordValidation.strength}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="મજબૂત પાસવર્ડ દાખલ કરો"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] text-slate-900 font-medium"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="કન્ફર્મ પાસવર્ડ ફરીથી દાખલ કરો"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Live Password Criteria Checklist */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1.5">
                  <div className="font-semibold text-slate-700">આંતરરાષ્ટ્રીય સુરક્ષા માપદંડો (Security Criteria):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${passwordValidation.criteria.minLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>ઓછામાં ઓછા ૮ અક્ષરો (Min 8 chars)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.criteria.hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>કેપિટલ અક્ષર (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.criteria.hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>સ્મોલ અક્ષર (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.criteria.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>અંક (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.criteria.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>સ્પેશિયલ સિમ્બોલ (@$!%*#?&)</span>
                    </div>
                    {regConfirmPassword.length > 0 && (
                      <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{passwordsMatch ? 'પાસવર્ડ મેચ થાય છે' : 'પાસવર્ડ મેળ ખાતા નથી'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Institution District & Taluka Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    સંસ્થાનો જિલ્લો (District) *
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => {
                      const dist = e.target.value;
                      setRegDistrict(dist);
                      const talukas = POPULAR_TALUKAS_BY_DISTRICT[dist] || [];
                      if (talukas.length > 0) {
                        setRegTaluka(talukas[0].split(' ')[0] || talukas[0]);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                  >
                    {GUJARAT_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                    <option value="other">અન્ય જિલ્લો (Other District)...</option>
                  </select>
                  {regDistrict === 'other' && (
                    <input
                      type="text"
                      required
                      placeholder="જિલ્લાનું નામ દાખલ કરો"
                      value={customDistrict}
                      onChange={(e) => setCustomDistrict(e.target.value)}
                      className="mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] text-slate-900 font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    સંસ્થાનો તાલુકો (Taluka) *
                  </label>
                  <select
                    value={regTaluka}
                    onChange={(e) => setRegTaluka(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                  >
                    {(POPULAR_TALUKAS_BY_DISTRICT[regDistrict] || [
                      'ગાંધીનગર',
                      'અમદાવાદ',
                      'પાટણ',
                    ]).map((tal) => (
                      <option key={tal} value={tal.split(' ')[0] || tal}>
                        {tal}
                      </option>
                    ))}
                    <option value="other">અન્ય તાલુકો (Other Taluka)...</option>
                  </select>
                  {regTaluka === 'other' && (
                    <input
                      type="text"
                      required
                      placeholder="તાલુકાનું નામ દાખલ કરો"
                      value={customTaluka}
                      onChange={(e) => setCustomTaluka(e.target.value)}
                      className="mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] text-slate-900 font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Institution Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  સંસ્થાનું સરનામું (Institution Postal Address)
                </label>
                <textarea
                  rows={2}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="દા.ત. કેમ્પસ રોડ, જી.આઈ.ડી.સી. પાસે (વૈકલ્પિક વિગત)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={!passwordValidation.isValid || !passwordsMatch}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#346739] hover:bg-[#264e2b] disabled:opacity-50 text-[#f2edc2] text-sm font-bold shadow-md transition-all active:scale-[0.99] min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                <span>રજીસ્ટ્રેશન કરો અને મંજૂરી માટે મોકલો (Submit for Verification)</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Help Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  પાસવર્ડ રીસેટ સહાય (Password Reset)
                </h3>
                <p className="text-xs text-slate-500">
                  રોજગાર અને તાલીમ નિયામકશ્રી કચેરી સુરક્ષા માર્ગદર્શિકા
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>સુપર એડમિન દ્વારા પાસવર્ડ રીસેટ સુવિધા:</span>
                </p>
                <p>
                  જો આપ આપનો પાસવર્ડ ભૂલી ગયા હોવ, તો આપના રાજ્ય સ્તરીય <strong>સુપર એડમિનિસ્ટ્રેટર</strong> તેમના એડમિન કન્સોલ દ્વારા આપના એકાઉન્ટ માટે તાત્કાલિક નવો પાસવર્ડ જનરેટ અથવા બદલી આપશે.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 text-[11px]">
                  સુપર એડમિન સંપર્ક વિગતો (Super Admin Contact):
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-sans font-semibold text-slate-900">તેજસ સુથાર (સુપર એડમિનિસ્ટ્રેટર)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-800">tejassuthar21696@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-blue-700 font-bold">9825012345</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-sans text-slate-600">રોજગાર અને તાલીમ નિયામકશ્રી કચેરી, બ્લોક ૧/૩, ગાંધીનગર</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                સુપર એડમિનને આપનું પૂરું નામ, ITI નું નામ અને મોબાઈલ નંબર જણાવશો જેથી આપનો પાસવર્ડ સત્વરે રીસેટ કરી આપવામાં આવે.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                સમજાઈ ગયું (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment Verification Modal */}
      {showPaymentModal && activePaymentInstructor && (
        <PaymentVerificationModal
          instructor={activePaymentInstructor}
          adminSettings={adminSettings}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSubmitPayment={async (details) => {
            const updated: Instructor = {
              ...activePaymentInstructor,
              ...details,
              payment_submitted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setActivePaymentInstructor(updated);
            if (pendingNotice && pendingNotice.instructor.id === activePaymentInstructor.id) {
              setPendingNotice({
                ...pendingNotice,
                instructor: updated,
              });
            }
            if (onUpdateInstructor) {
              await onUpdateInstructor(updated);
            }
          }}
        />
      )}
    </div>
  );
}
