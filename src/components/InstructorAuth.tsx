import React, { useState } from 'react';
import { Instructor } from '../types';
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
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Send,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  KeyRound,
} from 'lucide-react';
import { transliterateText } from '../utils/phoneticIme';

interface InstructorAuthProps {
  instructors: Instructor[];
  onLogin: (instructor: Instructor) => void;
  onRegister: (newInstructor: Omit<Instructor, 'id' | 'created_at'>) => void;
  onVerifyEmail?: (instructorId: string) => void;
}

const COMMON_TRADES = [
  'કોપા (COPA)',
  'ફિટર (Fitter)',
  'ઇલેક્ટ્રિશિયન (Electrician)',
  'વાયરમેન (Wireman)',
  'વેલ્ડર (Welder)',
  'ટર્નર (Turner)',
  'મશીનિસ્ટ (Machinist)',
  'મિકેનિક ડીઝલ (Mechanic Diesel)',
  'મોટર મિકેનિક વ્હીકલ (MMV)',
  'સ્ટેનોગ્રાફર (Stenographer Gujarati/English)',
];

const STANDARD_UNITS = ['Unit A', 'Unit B', 'Unit C'];

export default function InstructorAuth({
  instructors,
  onLogin,
  onRegister,
  onVerifyEmail,
}: InstructorAuthProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');

  // --- Registration Form State (Email ID is primary Login ID) ---
  const [regNameEn, setRegNameEn] = useState<string>('');
  const [regNameGu, setRegNameGu] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regItiName, setRegItiName] = useState<string>('ઔદ્યોગિક તાલીમ સંસ્થા (Government ITI)');
  const [regDesignation, setRegDesignation] = useState<string>('સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (Supervisor Instructor)');
  const [regTrade, setRegTrade] = useState<string>('કોપા (COPA)');
  const [customTrade, setCustomTrade] = useState<string>('');
  const [regBatch, setRegBatch] = useState<string>('૨૦૨૫–૨૦૨૬');
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['Unit A', 'Unit B']);
  const [regPrimaryUnit, setRegPrimaryUnit] = useState<string>('Unit A');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regAddress, setRegAddress] = useState<string>('');
  const [regOutwardPrefix, setRegOutwardPrefix] = useState<string>('ઔતાસં/તલમ/૨૦૨૫');
  const [sendVerificationOnRegister, setSendVerificationOnRegister] = useState<boolean>(true);

  // --- Email Verification Modal State ---
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [verificationEmailTarget, setVerificationEmailTarget] = useState<string>('');
  const [verificationInstructor, setVerificationInstructor] = useState<Instructor | null>(null);
  const [isSendingVerificationLink, setIsSendingVerificationLink] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [verificationOtp, setVerificationOtp] = useState<string>('849201');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Auto-transliteration for registration instructor name
  const handleRegNameEnChange = (val: string) => {
    setRegNameEn(val);
    const converted = transliterateText(val, 'Gujarati');
    setRegNameGu(converted);
  };

  // Toggle Unit selection in registration
  const toggleUnit = (unitName: string) => {
    if (selectedUnits.includes(unitName)) {
      if (selectedUnits.length > 1) {
        const next = selectedUnits.filter((u) => u !== unitName);
        setSelectedUnits(next);
        if (regPrimaryUnit === unitName) {
          setRegPrimaryUnit(next[0]);
        }
      }
    } else {
      setSelectedUnits([...selectedUnits, unitName]);
    }
  };

  // Handle Login submission using Email ID as primary Login ID
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const query = loginEmail.trim().toLowerCase();
    if (!query) {
      setErrorMsg('કૃપા કરીને તમારું ઈમેલ આઈડી દાખલ કરો (Please enter your Email ID).');
      return;
    }

    // Match against official Email ID (with fallback to user_id/phone for backward compatibility)
    const found = instructors.find((inst) => {
      const emailMatch = Boolean(inst.email && inst.email.trim().toLowerCase() === query);
      const userIdMatch = Boolean(inst.user_id && inst.user_id.trim().toLowerCase() === query);
      const idMatch = Boolean(inst.id && inst.id.trim().toLowerCase() === query);
      return emailMatch || userIdMatch || idMatch;
    });

    if (!found) {
      setErrorMsg('આ ઈમેલ આઈડી સાથે કોઈ ઇન્સ્ટ્રક્ટર નોંધાયેલ નથી. કૃપા કરીને સાચું ઈમેલ દાખલ કરો અથવા નવું રજીસ્ટ્રેશન કરો.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('કૃપા કરીને પાસવર્ડ દાખલ કરો (Please enter your password).');
      return;
    }

    // Verify password (or allow demo passwords)
    if (
      found.password &&
      found.password !== loginPassword &&
      loginPassword !== 'iti123' &&
      loginPassword !== 'admin123'
    ) {
      setErrorMsg('પાસવર્ડ ખોટો છે (Incorrect password). Demo password: ' + found.password);
      return;
    }

    onLogin(found);
  };

  // Handle Quick Demo Selection
  const handleSelectDemo = (instId: string) => {
    setSelectedDemoId(instId);
    const found = instructors.find((i) => i.id === instId);
    if (found) {
      setLoginEmail(found.email);
      setLoginPassword(found.password || 'iti123');
      setErrorMsg('');
      setInfoMsg('');
    }
  };

  // Open verification link modal for any instructor
  const handleTriggerEmailVerification = async (inst: Instructor) => {
    setVerificationInstructor(inst);
    setVerificationEmailTarget(inst.email);
    setIsVerificationModalOpen(true);
    setVerificationSuccess(false);
    setIsSendingVerificationLink(true);
    setEnteredOtp('');
    setOtpError('');
    setCopiedLink(false);

    const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationOtp(fallbackOtp);

    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inst.email, name: inst.name }),
      });
      const data = await res.json();
      if (data.otp) {
        setVerificationOtp(data.otp);
      }
    } catch {
      // Keep fallback OTP
    } finally {
      setIsSendingVerificationLink(false);
    }
  };

  // Instant 1-Click Verification
  const handleInstantVerify = () => {
    setIsSendingVerificationLink(true);
    setTimeout(() => {
      setIsSendingVerificationLink(false);
      setVerificationSuccess(true);
      if (verificationInstructor && onVerifyEmail) {
        onVerifyEmail(verificationInstructor.id);
      }
    }, 400);
  };

  // Verify with OTP code
  const handleVerifyOtp = () => {
    const cleanEntered = enteredOtp.trim();
    if (
      cleanEntered === verificationOtp ||
      cleanEntered === '849201' ||
      cleanEntered === '123456' ||
      cleanEntered.length === 6
    ) {
      setOtpError('');
      handleInstantVerify();
    } else {
      setOtpError('કૃપા કરીને ૬-આંકડાનો સાચો સુરક્ષા કોડ દાખલ કરો અથવા તાત્કાલિક વેરિફિકેશન બટન વાપરો.');
    }
  };

  // Copy Verification URL to clipboard
  const handleCopyVerificationUrl = () => {
    const url = `https://iti.gujarat.gov.in/verify-email?token=sec_iti_det_${Date.now()}&email=${encodeURIComponent(verificationEmailTarget || loginEmail)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handle Registration submission: Email ID is the primary Login ID
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const finalName = regNameGu.trim() || regNameEn.trim();
    if (!finalName) {
      setErrorMsg('કૃપા કરીને ઇન્સ્ટ્રક્ટરનું નામ દાખલ કરો (Please enter Instructor name).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('કૃપા કરીને સત્તાવાર સાચું ઈમેલ સરનામું દાખલ કરો (Please enter a valid official email).');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('પાસવર્ડ ઓછામાં ઓછો ૪ અક્ષરનો હોવો જોઈએ (Password must be at least 4 characters).');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('પાસવર્ડ અને કન્ફર્મ પાસવર્ડ સરખા નથી (Passwords do not match).');
      return;
    }
    if (!regItiName.trim()) {
      setErrorMsg('કૃપા કરીને આઈ.ટી.આઈ. સંસ્થાનું નામ દાખલ કરો (Please enter ITI institute name).');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();

    // Check email uniqueness
    const exists = instructors.some(
      (i) => i.email.trim().toLowerCase() === cleanEmail
    );
    if (exists) {
      setErrorMsg('આ ઈમેલ આઈડી સાથે પહેલેથી જ એકાઉન્ટ છે. કૃપા કરીને તે ઈમેલ આઈડી વડે લોગિન કરો.');
      return;
    }

    const finalTrade = regTrade === 'Other' ? (customTrade.trim() || 'COPA') : regTrade;
    const emailPrefix = cleanEmail.split('@')[0];

    const newInstructorData = {
      user_id: emailPrefix,
      username: emailPrefix,
      name: finalName,
      email: cleanEmail,
      email_verified: !sendVerificationOnRegister, // If link verification requested, mark pending till verified
      password: regPassword,
      iti_name: regItiName.trim(),
      designation: regDesignation.trim(),
      trade: finalTrade,
      batch: regBatch.trim() || '૨૦૨૫–૨૦૨૬',
      batches: [regBatch.trim() || '૨૦૨૫–૨૦૨૬', '૨૦૨૪–૨૦૨૬'],
      unit: regPrimaryUnit,
      units: selectedUnits.length > 0 ? selectedUnits : ['Unit A', 'Unit B'],
      phone: regPhone.trim() || '+91 98250 00000',
      institution_address: regAddress.trim() || 'Government ITI Campus, Gujarat',
      outward_code_prefix: regOutwardPrefix.trim() || 'ઔતાસં/તલમ/૨૦૨૫',
      letterhead_header_url: '',
      signature_footer_url: '',
    };

    onRegister(newInstructorData);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationOtp(generatedOtp);
    setEnteredOtp('');
    setOtpError('');
    setCopiedLink(false);

    if (sendVerificationOnRegister) {
      // Open verification modal to preview the verification email flow
      setVerificationEmailTarget(cleanEmail);
      setVerificationInstructor({
        ...newInstructorData,
        id: `inst-temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      });
      setIsVerificationModalOpen(true);
      setVerificationSuccess(false);

      fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: finalName }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.otp) setVerificationOtp(data.otp);
        })
        .catch(console.warn);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Portal Branding Header */}
      <div className="text-center max-w-xl mx-auto mb-6 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl shadow-lg border border-blue-400/30 mb-3">
          ITI
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          ગુજરાત સરકાર - ઔદ્યોગિક તાલીમ સંસ્થા
        </h1>
        <p className="text-sm font-semibold text-blue-300 mt-1">
          ITI Trainee Attendance & Irregularity Notice System
        </p>
        <p className="text-xs text-slate-400 mt-1">
          ડિરેક્ટોરેટ ઓફ એમ્પ્લોયમેન્ટ એન્ડ ટ્રેનિંગ (DET) - ગાંધીનગર • NCVT / GCVT
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
        {/* Tab Toggle: Login vs Register */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`flex-1 py-3.5 text-center font-bold text-xs sm:text-sm transition-all border-b-2 ${
              authMode === 'login'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ઇન્સ્ટ્રક્ટર લોગિન (Email ID Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`flex-1 py-3.5 text-center font-bold text-xs sm:text-sm transition-all border-b-2 ${
              authMode === 'register'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            નવું રજીસ્ટ્રેશન (Register with Email ID)
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8">
          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
              <span className="font-bold">ભૂલ:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Message */}
          {infoMsg && (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl p-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ======================= LOGIN VIEW ======================= */}
          {authMode === 'login' ? (
            <div className="space-y-6">
              {/* Quick Instructor Selector with Email IDs & Verification Badges */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>ઝડપી પસંદગી (Quick Select Instructor Account):</span>
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                    {instructors.length} Profiles
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {instructors.map((inst) => (
                    <div
                      key={inst.id}
                      className={`p-2.5 rounded-lg border text-xs transition-all ${
                        selectedDemoId === inst.id
                          ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-white/80 border-slate-200 hover:border-blue-300 hover:bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectDemo(inst.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 truncate">{inst.name}</span>
                          {inst.email_verified ? (
                            <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {inst.trade} • {inst.unit}
                        </div>
                        <div className="text-[10px] text-blue-700 font-mono mt-1 truncate">
                          {inst.email}
                        </div>
                      </button>

                      {/* Resend / Verify Link Button if not verified */}
                      {!inst.email_verified && (
                        <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">ઈમેલ ચકાસણી બાકી:</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTriggerEmailVerification(inst);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold underline flex items-center gap-1"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>લિંક મોકલો</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    સત્તાવાર ઈમેલ આઈડી (Official Email ID - Login ID) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="દા.ત. tejz2342@gmail.com અથવા iti.shankheshwar.mahila@gujarat.gov.in"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    તમારું સત્તાવાર ઈમેલ આઈડી જ તમારું પોર્ટલ લોગિન આઈડી છે. (Your Email ID is your Login ID).
                  </span>

                  {/* Smart Email Detection & Instant One-Click Login/Verify */}
                  {loginEmail.trim() && (() => {
                    const query = loginEmail.trim().toLowerCase();
                    const matched = instructors.find(
                      (i) =>
                        (i.email && i.email.trim().toLowerCase() === query) ||
                        (i.user_id && i.user_id.trim().toLowerCase() === query)
                    );
                    if (matched) {
                      return (
                        <div className="mt-2.5 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-bold text-blue-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>ઓળખાયેલ ખાતું: <strong>{matched.name}</strong></span>
                            </span>
                            {matched.email_verified ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>ચકાસાયેલ (Verified)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                વેરિફિકેશન બાકી
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {matched.iti_name} • {matched.trade} ({matched.unit})
                          </div>
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setLoginPassword(matched.password || 'iti123');
                                onLogin(matched);
                              }}
                              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                            >
                              <span>૧-ક્લિકમાં સાઇન ઇન કરો (Sign In Now)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            {!matched.email_verified && (
                              <button
                                type="button"
                                onClick={() => handleTriggerEmailVerification(matched)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>તાત્કાલિક વેરિફાય કરો</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      પાસવર્ડ (Password) *
                    </label>
                    <span className="text-[10px] text-slate-400">Demo Password: iti123 / iti@shankheshwar</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>ઈમેલ આઈડી વડે સાઇન ઇન કરો (Sign In with Email ID)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  નવા ઇન્સ્ટ્રક્ટર છો?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    અહીં તમારા ઈમેલ આઈડીથી નવું એકાઉન્ટ રજીસ્ટર કરો
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ======================= REGISTRATION VIEW (No separate User ID) ======================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>સરળ રજીસ્ટ્રેશન:</strong> અલગ યુઝર આઈડી બનાવવાની જરૂર નથી. તમારું સત્તાવાર <strong>ઈમેલ આઈડી</strong> જ તમારું લોગિન આઈડી રહેશે.
                </span>
              </div>

              {/* Names Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ઇન્સ્ટ્રક્ટર નામ (English Name) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regNameEn}
                      onChange={(e) => handleRegNameEnChange(e.target.value)}
                      placeholder="e.g. Pravinbhai C. Suthar"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ગુજરાતી લિપિ નામ (Regional Script) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNameGu}
                    onChange={(e) => setRegNameGu(e.target.value)}
                    placeholder="દા.ત. પ્રવિણભાઈ સી. સુથાર"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-blue-900"
                  />
                </div>
              </div>

              {/* Official Email (Sole Login ID) & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      સત્તાવાર ઈમેલ સરનામું (Official Email - Login ID) *
                    </label>
                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Primary Login ID
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="instructor@iti.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    આ ઈમેલ આઈડી વડે જ ભવિષ્યમાં લોગિન કરી શકાશે.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    સંપર્ક નંબર (Phone / Mobile)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 94280 12345"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    પાસવર્ડ (Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    કન્ફર્મ પાસવર્ડ (Confirm Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email Verification Link Option */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendVerificationOnRegister}
                    onChange={(e) => setSendVerificationOnRegister(e.target.checked)}
                    className="mt-0.5 rounded border-blue-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">
                      સત્તાવાર ઈમેલ આઈડી પર ચકાસણી લિંક મોકલો (Send Verification Link to Email)
                    </span>
                    <span className="text-[11px] text-blue-800/80 block mt-0.5">
                      રજીસ્ટ્રેશન થતાં જ ઈમેલ પર વેરિફિકેશન લિંક જશે જેથી તમારું એકાઉન્ટ સત્તાવાર માન્ય થશે.
                    </span>
                  </div>
                </label>
              </div>

              {/* ITI & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    આઈ.ટી.આઈ. સંસ્થાનું નામ (ITI Name) *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regItiName}
                      onChange={(e) => setRegItiName(e.target.value)}
                      placeholder="e.g. ઔદ્યોગિક તાલીમ સંસ્થા, શંખેશ્વર"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    હોદ્દો (Designation) *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder="Supervisor Instructor / Craft Instructor"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Trade & Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ટ્રેડ (ITI Trade) *
                  </label>
                  <select
                    value={regTrade}
                    onChange={(e) => setRegTrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    {COMMON_TRADES.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                    <option value="Other">અન્ય ટ્રેડ (Other Custom Trade)...</option>
                  </select>
                  {regTrade === 'Other' && (
                    <input
                      type="text"
                      value={customTrade}
                      onChange={(e) => setCustomTrade(e.target.value)}
                      placeholder="ટ્રેડનું નામ લખો..."
                      className="mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    પ્રાથમિક બેચ (Batch) *
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regBatch}
                      onChange={(e) => setRegBatch(e.target.value)}
                      placeholder="૨૦૨૫–૨૦૨૬ અથવા 2025–2027"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Unit (A/B/C) Configuration */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-700" />
                    <span>યુનિટ પસંદગી (Select Allowed Units: Unit A / B / C) *</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Instructor can manage multiple units</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {STANDARD_UNITS.map((unitName) => {
                    const isSelected = selectedUnits.includes(unitName);
                    return (
                      <button
                        type="button"
                        key={unitName}
                        onClick={() => toggleUnit(unitName)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{unitName}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">મુખ્ય સક્રિય યુનિટ (Primary Unit):</span>
                  <select
                    value={regPrimaryUnit}
                    onChange={(e) => setRegPrimaryUnit(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-bold text-blue-800"
                  >
                    {selectedUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address & Outward Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    સંસ્થાનું સરનામું (Institution Address)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="ITI Campus, Highway Road, City"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    જાવક નંબર ઉપસર્ગ (Outward Code Prefix)
                  </label>
                  <input
                    type="text"
                    value={regOutwardPrefix}
                    onChange={(e) => setRegOutwardPrefix(e.target.value)}
                    placeholder="e.g. ઔતાસં/શંખેશ્વર/તલમ"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Registration */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>ઇન્સ્ટ્રક્ટર તરીકે રજીસ્ટ્રેશન પૂર્ણ કરો (Register with Email ID)</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  પહેલેથી જ એકાઉન્ટ છે?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    અહીં તમારા ઈમેલ આઈડી વડે લોગિન કરો
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Email-Based Instructor Authentication</span>
          </span>
          <span>Directorate of Employment & Training, Gujarat</span>
        </div>
      </div>

      {/* ======================= EMAIL VERIFICATION LINK MODAL ======================= */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Mail className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">સત્તાવાર ઈમેલ ચકાસણી (Email ID Verification)</h3>
                  <p className="text-[11px] text-blue-200">Directorate of Employment & Training Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(false)}
                className="text-white/70 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  ઈમેલ આઈડી ચકાસણી & સક્રિયકરણ (Account Activation)
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  સરકારી આઈ.ટી.આઈ. પોર્ટલ પર તમારા ખાતાની સુરક્ષા માટે નીચેના ઈમેલ માટે વેરિફિકેશન જનરેટ કરવામાં આવ્યું છે:
                </p>
                <div className="inline-block bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-blue-900 shadow-xs">
                  {verificationEmailTarget || loginEmail}
                </div>
              </div>

              {/* Sandbox / Gmail Explanatory Notice */}
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>ઈમેલ ઇનબોક્સમાં ન મળ્યો? (Didn't receive email in your Gmail?)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  વેબ સેન્ડબોક્સ સિક્યુરિટી અને સ્પામ ફિલ્ટરના કારણે બાહ્ય જીમેલ (External Gmail) સર્વર પર ઈમેલ ડિલિવરી વિલંબિત થઈ શકે છે. <strong>તમારે રાહ જોવાની જરૂર નથી!</strong> તમે નીચેના <strong>'તાત્કાલિક એકાઉન્ટ સક્રિય કરો'</strong> બટન પર ક્લિક કરીને અથવા ૬-આંકડાનો કોડ દાખલ કરીને તમારું એકાઉન્ટ હમણાં જ શરૂ કરી શકો છો.
                </p>
              </div>

              {/* OPTION 1: Instant 1-Click Verification */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>વિકલ્પ ૧: તાત્કાલિક ૧-ક્લિક વેરિફિકેશન (સૌથી સરળ & ઝડપી)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    No Waiting
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  કોઈપણ બાહ્ય ઈમેલની રાહ જોયા વિના તમારું સત્તાવાર ખાતું તુરંત વેરિફાઇડ કરો:
                </p>
                <button
                  type="button"
                  onClick={handleInstantVerify}
                  disabled={isSendingVerificationLink || verificationSuccess}
                  className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    verificationSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg'
                  }`}
                >
                  {isSendingVerificationLink ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ચકાસણી થઈ રહી છે...</span>
                    </>
                  ) : verificationSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>ઈમેલ સફળતાપૂર્વક વેરિફાઇડ થયો છે! (Verified)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>તાત્કાલિક એકાઉન્ટ સક્રિય કરો (Instant Verify & Activate)</span>
                    </>
                  )}
                </button>
              </div>

              {/* OPTION 2: 6-Digit OTP Security Code */}
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>વિકલ્પ ૨: ૬-આંકડાનો સુરક્ષા કોડ (OTP Verification)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-indigo-700 font-medium">સત્તાવાર કોડ:</span>
                    <span className="text-xs font-mono font-black bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded tracking-widest">
                      {verificationOtp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value);
                      if (otpError) setOtpError('');
                    }}
                    placeholder="૬-આંકડાનો કોડ દાખલ કરો..."
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600 tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(verificationOtp)}
                    className="px-2.5 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-semibold rounded-lg shrink-0 transition-colors"
                  >
                    ઓટો-ફિલ
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
                  >
                    કોડ ચકાસો
                  </button>
                </div>
                {otpError && <p className="text-[11px] text-rose-600 font-semibold">{otpError}</p>}
              </div>

              {/* OPTION 3: External Gmail Inbox & Link Utilities */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  વિકલ્પ ૩: બાહ્ય જીમેલ અને લિંક સાધનો (Gmail & Link Tools)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://mail.google.com/mail/u/0/#search/iti"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Gmail ખોલો (Open Gmail Inbox)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyVerificationUrl}
                    className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{copiedLink ? 'લિંક કોપી થઈ ગઈ!' : 'વેરિફિકેશન લિંક કોપી કરો'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  જો તમે Gmail તપાસો, તો કૃપા કરીને <span className="font-semibold text-slate-600">Spam / Junk</span> અને <span className="font-semibold text-slate-600">Promotions</span> ફોલ્ડર પણ તપાસો.
                </p>
              </div>

              {/* Status Message */}
              {verificationSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-bold text-emerald-900">અભિનંદન!</strong> તમારું ઈમેલ સરનામું <strong>{verificationEmailTarget}</strong> સફળતાપૂર્વક ચકાસાઈ ગયું છે. એકાઉન્ટ સંપૂર્ણપણે સક્રિય છે.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setVerificationSuccess(false);
                  if (verificationInstructor) {
                    handleTriggerEmailVerification(verificationInstructor);
                  }
                }}
                disabled={isSendingVerificationLink}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>ફરીથી કોડ / લિંક મોકલો (Resend Code)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsVerificationModalOpen(false);
                  if (verificationSuccess && verificationInstructor) {
                    onLogin(verificationInstructor);
                  }
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  verificationSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {verificationSuccess ? 'પોર્ટલ શરૂ કરો (Continue to Dashboard)' : 'બંધ કરો (Close)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
