import React, { useState } from 'react';
import { Instructor, AcademicTrade } from '../types';
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
} from 'lucide-react';
import { transliterateText } from '../utils/phoneticIme';
import { INITIAL_INSTRUCTORS } from '../data/initialData';
import {
  validatePassword,
  cleanPhoneNumber,
  checkInstructorUniqueness,
} from '../utils/passwordPolicy';

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
}: InstructorAuthProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');
  const [pendingNotice, setPendingNotice] = useState<{
    name: string;
    phone: string;
    email: string;
  } | null>(null);

  // --- Login Form State (Versatile Login: Email OR Mobile) ---
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);

  // --- Registration Form State ---
  const [regNameEn, setRegNameEn] = useState<string>('');
  const [regNameGu, setRegNameGu] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regItiName, setRegItiName] = useState<string>('ઔદ્યોગિક તાલીમ સંસ્થા (Government ITI)');
  const [regDesignation, setRegDesignation] = useState<string>('સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (Supervisor Instructor)');
  const [regTrade, setRegTrade] = useState<string>('કોપા (COPA)');
  const [customTrade, setCustomTrade] = useState<string>('');
  const [regBatch, setRegBatch] = useState<string>('૨૦૨૫–૨૦૨૬');
  const [regUnit, setRegUnit] = useState<string>('Unit A');
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
      setPendingNotice({
        name: found.name,
        phone: found.phone || 'તમારા મોબાઈલ',
        email: found.email,
      });
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

    const initialAcademicHierarchy: AcademicTrade[] = [
      {
        id: `trade-${Date.now()}`,
        name: effectiveTrade,
        batches: [
          {
            id: `batch-${Date.now()}`,
            name: regBatch || '૨૦૨૫–૨૦૨૬',
            units: [
              { id: `unit-${Date.now()}-1`, name: regUnit || 'Unit A' },
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
      iti_name: regItiName,
      designation: regDesignation,
      trade: effectiveTrade,
      trades: [effectiveTrade],
      batch: regBatch || '૨૦૨૫–૨૦૨૬',
      batches: [regBatch || '૨૦૨૫–૨૦૨૬'],
      unit: regUnit || 'Unit A',
      units: [regUnit || 'Unit A'],
      academic_hierarchy: initialAcademicHierarchy,
      institution_address: regAddress,
      outward_code_prefix: 'ઔતાસં/તલમ/૨૦૨૫',
      header_config: {
        show_logo: true,
        institute_name_gu: regItiName,
        institute_name_en: 'GOVERNMENT INDUSTRIAL TRAINING INSTITUTE',
        department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત રાજ્ય',
        address: regAddress,
        ref_prefix: 'આઈટીઆઈ/તલમ/૨૦૨૫',
      },
    };

    onRegister(newInstructorData);

    // Show pending approval notice
    setPendingNotice({
      name: finalName,
      phone: cleanPhone,
      email: cleanEmail,
    });
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
          <div className="flex border-b border-slate-200 mb-6">
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
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-amber-900">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>ખાતું મંજૂરી માટે પેન્ડિંગ છે (Pending Approval)</span>
              </div>
              <p className="mb-2 leading-relaxed">
                નમસ્તે <strong className="text-slate-900">{pendingNotice.name}</strong>, આપનું રજીસ્ટ્રેશન સફળતાપૂર્વક નોંધાયેલ છે.
                સુપર એડમિન દ્વારા આપનું ખાતું વેરિફાય કરવામાં આવી રહ્યું છે.
              </p>
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 space-y-1 text-[11px] text-slate-700">
                <div>• નોંધાયેલ મોબાઈલ નંબર: <strong className="text-slate-900">{pendingNotice.phone}</strong></div>
                <div>• નોંધાયેલ ઈમેલ આઈડી: <strong className="text-slate-900">{pendingNotice.email}</strong></div>
              </div>
              <p className="mt-2 text-[11px] text-amber-800 font-medium">
                ખાતું મંજૂર થતાં જ સુપર એડમિન આપના મોબાઈલ નંબર પર સંપર્ક/સંદેશ મોકલશે. ત્યારબાદ આપ અહીં સીધા લોગિન કરી શકશો.
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

              {/* ITI & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    સંસ્થાનું નામ (ITI Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={regItiName}
                    onChange={(e) => setRegItiName(e.target.value)}
                    placeholder="ઔદ્યોગિક તાલીમ સંસ્થા, પાટણ"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    હોદ્દો (Designation)
                  </label>
                  <input
                    type="text"
                    required
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#346739] focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Trade, Batch, Unit Hierarchy Initialization */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#346739]">
                  <Layers className="w-4 h-4 text-[#346739]" />
                  <span>પ્રાથમિક શૈક્ષણિક વિગતો (Initial Trade, Batch & Unit)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ૧. ટ્રેડ (Trade)
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
                        placeholder="ટ્રેડનું નામ દાખલ કરો"
                        value={customTrade}
                        onChange={(e) => setCustomTrade(e.target.value)}
                        className="mt-1 w-full px-2 py-1 text-xs border rounded"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ૨. બેચ (Batch)
                    </label>
                    <input
                      type="text"
                      required
                      value={regBatch}
                      onChange={(e) => setRegBatch(e.target.value)}
                      placeholder="૨૦૨૫–૨૦૨૬"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ૩. યુનિટ (Unit)
                    </label>
                    <input
                      type="text"
                      required
                      value={regUnit}
                      onChange={(e) => setRegUnit(e.target.value)}
                      placeholder="Unit A / યુનિટ ૧"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
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

              {/* Institution Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  સંસ્થાનું સરનામું (Institution Postal Address)
                </label>
                <textarea
                  rows={2}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="દા.ત. કેમ્પસ રોડ, તા. પાટણ, જી. પાટણ-૩૮૪૨૬૫"
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
    </div>
  );
}
