import React, { useState } from 'react';
import { Instructor, Trainee, AttendanceRecord, DispatchLog } from '../types';
import {
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  Check,
  X,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  Layers,
  AlertCircle,
  MapPin,
  Hash,
  User,
  KeyRound,
  Copy,
} from 'lucide-react';
import {
  validatePassword,
  cleanPhoneNumber,
  checkInstructorUniqueness,
} from '../utils/passwordPolicy';

interface SuperAdminDashboardProps {
  instructors: Instructor[];
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  dispatchLogs: DispatchLog[];
  onSelectTenant?: (id: string) => void;
  onAddInstructor?: (instructor: Instructor) => void;
  onUpdateInstructor?: (instructor: Instructor) => void;
  onDeleteInstructor?: (id: string) => void;
}

export default function SuperAdminDashboard({
  instructors,
  trainees,
  attendanceRecords,
  dispatchLogs,
  onSelectTenant,
  onAddInstructor,
  onUpdateInstructor,
  onDeleteInstructor,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'analytics'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'suspended'>('all');

  // Instructor Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formItiName, setFormItiName] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formTrade, setFormTrade] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOutwardCode, setFormOutwardCode] = useState('');
  const [formEmailVerified, setFormEmailVerified] = useState(true);
  const [formMobileVerified, setFormMobileVerified] = useState(true);
  const [formStatus, setFormStatus] = useState<'approved' | 'pending' | 'rejected' | 'suspended'>('approved');
  const [formRole, setFormRole] = useState<'instructor' | 'super_admin'>('instructor');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Super Admin Personal Password Update Modal State
  const [isSuperAdminPasswordModalOpen, setIsSuperAdminPasswordModalOpen] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminPasswordShow, setAdminPasswordShow] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [adminPasswordSuccess, setAdminPasswordSuccess] = useState('');

  // Instructor Password Reset Modal State (When instructor forgot password)
  const [resetInstructorTarget, setResetInstructorTarget] = useState<Instructor | null>(null);
  const [instructorNewPassword, setInstructorNewPassword] = useState('');
  const [instructorPasswordShow, setInstructorPasswordShow] = useState(false);
  const [instructorPasswordError, setInstructorPasswordError] = useState('');
  const [instructorPasswordSuccess, setInstructorPasswordSuccess] = useState('');
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Helper to generate a NIST-compliant random strong password
  const generateRandomStrongPassword = () => {
    const specials = ['@', '#', '$', '!', '%', '&'];
    const special = specials[Math.floor(Math.random() * specials.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
    const lower = 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 24)];
    const lower2 = 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 24)];
    return `ITI${special}${upper}${lower}${lower2}${randomNum}`;
  };

  // Handler to update Super Admin's own password
  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordError('');
    setAdminPasswordSuccess('');

    const superAdminInst =
      instructors.find((i) => i.role === 'super_admin' || i.email === 'tejassuthar21696@gmail.com') ||
      instructors[0];

    if (!superAdminInst) {
      setAdminPasswordError('સુપર એડમિન એકાઉન્ટ મળ્યું નથી.');
      return;
    }

    const validation = validatePassword(adminNewPassword);
    if (!validation.isValid) {
      setAdminPasswordError('નવો પાસવર્ડ સુરક્ષા નીતિ મુજબ યોગ્ય નથી (ઓછામાં ઓછા ૮ અક્ષરો, કેપિટલ, સ્મોલ, નંબર અને સ્પેશિયલ સિમ્બોલ જરૂરી છે).');
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      setAdminPasswordError('બંને પાસવર્ડ મેળ ખાતા નથી (Passwords do not match).');
      return;
    }

    if (onUpdateInstructor) {
      onUpdateInstructor({
        ...superAdminInst,
        password: adminNewPassword,
        updated_at: new Date().toISOString(),
      });
    }

    setAdminPasswordSuccess('સુપર એડમિન પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે! હવે આપ આ નવા પાસવર્ડ વડે લોગિન કરી શકો છો.');
    setTimeout(() => {
      setIsSuperAdminPasswordModalOpen(false);
      setAdminPasswordSuccess('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
    }, 1800);
  };

  // Handler to reset/change instructor password
  const handleResetInstructorPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setInstructorPasswordError('');
    setInstructorPasswordSuccess('');

    if (!resetInstructorTarget) {
      setInstructorPasswordError('ઇન્સ્ટ્રક્ટર મળ્યા નથી.');
      return;
    }

    const validation = validatePassword(instructorNewPassword);
    if (!validation.isValid) {
      setInstructorPasswordError('પાસવર્ડ નિયમો અનુસાર ઓછામાં ઓછા ૮ અક્ષર, એક કેપિટલ લેટર, એક નંબર અને એક સ્પેશિયલ કેરેક્ટર જરૂરી છે.');
      return;
    }

    if (onUpdateInstructor) {
      onUpdateInstructor({
        ...resetInstructorTarget,
        password: instructorNewPassword,
        updated_at: new Date().toISOString(),
      });
    }

    setInstructorPasswordSuccess(`ઇન્સ્ટ્રક્ટર ${resetInstructorTarget.name} નો પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે! હવે તેઓ નવા પાસવર્ડથી લોગિન કરી શકશે.`);
  };

  // Helper to copy credentials to clipboard
  const handleCopyInstructorCredentials = () => {
    if (!resetInstructorTarget) return;
    const text = `ITI Attendance Portal Login Credentials\nનામ: ${resetInstructorTarget.name}\nસંસ્થા: ${resetInstructorTarget.iti_name}\nમોબાઈલ નંબર: ${resetInstructorTarget.phone}\nઈમેલ આઈડી: ${resetInstructorTarget.email}\nનવો પાસવર્ડ: ${instructorNewPassword}`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  // Gemini AI connection test
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  const pendingInstructors = instructors.filter((i) => i.status === 'pending');
  const approvedInstructors = instructors.filter((i) => i.status === 'approved' || !i.status);

  // Global KPIs
  const totalInstructors = instructors.length;
  const totalTrainees = trainees.length;
  const flaggedAttendanceCount = attendanceRecords.filter((r) => r.attendance_percentage < 80.0).length;
  const totalDispatches = dispatchLogs.length;

  // Filtered instructors list
  const filteredInstructors = instructors.filter((inst) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (inst.name && inst.name.toLowerCase().includes(q)) ||
      (inst.email && inst.email.toLowerCase().includes(q)) ||
      (inst.phone && inst.phone.includes(q)) ||
      (inst.iti_name && inst.iti_name.toLowerCase().includes(q)) ||
      (inst.trade && inst.trade.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'approved'
        ? inst.status === 'approved' || !inst.status
        : inst.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Approve
  const handleApprove = (inst: Instructor) => {
    if (!onUpdateInstructor) return;
    const updated: Instructor = {
      ...inst,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: 'tejassuthar21696@gmail.com',
    };
    onUpdateInstructor(updated);
  };

  // Handle Reject
  const handleReject = (inst: Instructor) => {
    if (!onUpdateInstructor) return;
    const updated: Instructor = {
      ...inst,
      status: 'rejected',
    };
    onUpdateInstructor(updated);
  };

  // Open modal for Adding New Instructor
  const openAddModal = () => {
    setEditingInstructor(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormItiName('સરકારી ઔદ્યોગિક તાલીમ સંસ્થા');
    setFormDesignation('સુપરવાઇઝર ઇન્સ્ટ્રક્ટર (Supervisor Instructor)');
    setFormAddress('');
    setFormOutwardCode('');
    setFormTrade('કોપા (COPA)');
    setFormBatch('૨૦૨૫–૨૦૨૬');
    setFormUnit('Unit A');
    setFormEmailVerified(true);
    setFormMobileVerified(true);
    setFormStatus('approved');
    setFormRole('instructor');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Editing Instructor (or Super Admin)
  const openEditModal = (inst: Instructor) => {
    setEditingInstructor(inst);
    setFormName(inst.name || '');
    setFormEmail(inst.email || '');
    setFormPhone(inst.phone || '');
    setFormPassword(inst.password || '');
    setFormItiName(inst.iti_name || '');
    setFormDesignation(inst.designation || '');
    setFormAddress(inst.institution_address || '');
    setFormOutwardCode(inst.outward_code_prefix || '');
    setFormTrade(inst.trade || '');
    setFormBatch(inst.batch || '૨૦૨૫–૨૦૨૬');
    setFormUnit(inst.unit || 'Unit A');
    setFormEmailVerified(inst.email_verified !== undefined ? inst.email_verified : true);
    setFormMobileVerified(inst.mobile_verified !== undefined ? inst.mobile_verified : true);
    setFormStatus(inst.status || 'approved');
    setFormRole(inst.role || 'instructor');
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Add/Edit Form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPhone = cleanPhoneNumber(formPhone);

    if (!formName.trim()) {
      setFormError('ઇન્સ્ટ્રક્ટરનું નામ જરૂરી છે.');
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

    // Check uniqueness
    const uniqueness = checkInstructorUniqueness(
      cleanEmail,
      cleanPhone,
      instructors,
      editingInstructor ? editingInstructor.id : undefined
    );

    if (!uniqueness.isUnique) {
      setFormError(uniqueness.message);
      return;
    }

    // Check password if creating or updating password
    if (!editingInstructor || formPassword) {
      const pwdValidation = validatePassword(formPassword);
      if (!pwdValidation.isValid) {
        setFormError('પાસવર્ડ આંતરરાષ્ટ્રીય માપદંડો મુજબ મજબૂત હોવો જોઈએ (ઓછામાં ઓછા ૮ અક્ષરો, કેપિટલ, સ્મોલ, નંબર, સ્પેશિયલ સિમ્બોલ).');
        return;
      }
    }

    if (editingInstructor) {
      // Update
      if (onUpdateInstructor) {
        const updated: Instructor = {
          ...editingInstructor,
          name: formName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password: formPassword || editingInstructor.password,
          iti_name: formItiName.trim(),
          designation: formDesignation.trim(),
          institution_address: formAddress.trim(),
          outward_code_prefix: formOutwardCode.trim(),
          email_verified: formEmailVerified,
          mobile_verified: formMobileVerified,
          trade: formTrade.trim(),
          batch: formBatch.trim(),
          unit: formUnit.trim(),
          status: formStatus,
          role: formRole,
          updated_at: new Date().toISOString(),
        };
        onUpdateInstructor(updated);
      }
    } else {
      // Add
      if (onAddInstructor) {
        const newInst: Instructor = {
          id: `inst-${Date.now()}`,
          name: formName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password: formPassword,
          iti_name: formItiName.trim(),
          designation: formDesignation.trim(),
          institution_address: formAddress.trim(),
          outward_code_prefix: formOutwardCode.trim(),
          trade: formTrade.trim(),
          trades: [formTrade.trim()],
          batch: formBatch.trim(),
          batches: [formBatch.trim()],
          unit: formUnit.trim(),
          units: [formUnit.trim()],
          academic_hierarchy: [
            {
              id: `tr-${Date.now()}`,
              name: formTrade.trim(),
              batches: [
                {
                  id: `b-${Date.now()}`,
                  name: formBatch.trim(),
                  units: [{ id: `u-${Date.now()}`, name: formUnit.trim() }],
                },
              ],
            },
          ],
          role: formRole,
          status: formStatus,
          email_verified: formEmailVerified,
          mobile_verified: formMobileVerified,
          created_at: new Date().toISOString(),
          header_config: {
            show_logo: true,
            institute_name_gu: formItiName.trim(),
            institute_name_en: 'GOVERNMENT ITI',
            department_subtitle: 'રોજગાર અને તાલીમ નિયામકશ્રીની કચેરી, ગુજરાત રાજ્ય',
            address: formAddress.trim() || 'ગુજરાત',
            ref_prefix: formOutwardCode.trim() || 'આઈટીઆઈ/તાલીમ/૨૦૨૬',
          },
        };
        onAddInstructor(newInst);
      }
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (inst: Instructor) => {
    if (inst.role === 'super_admin' || inst.email === 'tejassuthar21696@gmail.com') {
      alert('સુપર એડમિન એકાઉન્ટ ડિલીટ કરી શકાતું નથી.');
      return;
    }
    const confirmed = window.confirm(
      `શું આપ ખરેખર ઇન્સ્ટ્રક્ટર "${inst.name}" (${inst.email}) નું ખાતું ડિલીટ કરવા માંગો છો?`
    );
    if (confirmed && onDeleteInstructor) {
      onDeleteInstructor(inst.id);
    }
  };

  // Test Gemini AI
  const testGeminiConnection = async () => {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const resp = await fetch('/api/gemini/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: 'પરીક્ષણ તાલીમાર્થી',
          presentDays: 12,
          absentDays: 12,
          totalWorkingDays: 24,
          attendancePercentage: 50.0,
          language: 'Gujarati',
        }),
      });
      const data = await resp.json();
      setTestResult(`સફળતા: Gemini AI પ્રતિભાવ પ્રાપ્ત થયો - "${data.commentary.substring(0, 80)}..."`);
    } catch (e: any) {
      setTestResult(`ખામી: ${e.message}`);
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              સુપર એડમિન કંટ્રોલ સેન્ટર (Super Admin Console)
            </h2>
            <span className="text-[11px] bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
              tejassuthar21696@gmail.com
            </span>
          </div>
          <p className="text-xs text-slate-300">
            ઇન્સ્ટ્રક્ટર વેરિફિકેશન • મંજૂરી વ્યવસ્થાપન • ડ્યુઅલ લોગિન (મોબાઈલ/ઈમેલ) • શૈક્ષણિક માળખું
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>નવા ઇન્સ્ટ્રક્ટર ઉમેરો (Add)</span>
          </button>

          <button
            onClick={testGeminiConnection}
            disabled={isTestingAi}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isTestingAi ? 'કનેક્ટ થઈ રહ્યું છે...' : 'Gemini AI ટેસ્ટ'}</span>
          </button>
        </div>
      </div>

      {/* Super Admin Personal Profile Overview & Edit Card */}
      {(() => {
        const superAdminInst =
          instructors.find(
            (i) => i.role === 'super_admin' || i.email === 'tejassuthar21696@gmail.com'
          ) || instructors[0];
        if (!superAdminInst) return null;

        return (
          <div className="bg-white rounded-2xl p-5 border border-amber-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/50 via-white to-white">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 font-black flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-slate-900 text-base">{superAdminInst.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    સુપર એડમિનિસ્ટ્રેટર
                  </span>
                  {superAdminInst.email_verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      વેરિફાઇડ
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{superAdminInst.designation}</span>
                  <span className="text-slate-300">•</span>
                  <span>{superAdminInst.iti_name}</span>
                </div>
                <div className="text-xs font-mono text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {superAdminInst.email}
                  </span>
                  <span className="flex items-center gap-1 text-blue-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    {superAdminInst.phone}
                  </span>
                  {superAdminInst.outward_code_prefix && (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Hash className="w-3 h-3 text-slate-400" />
                      જાવક: {superAdminInst.outward_code_prefix}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setAdminNewPassword('');
                  setAdminConfirmPassword('');
                  setAdminPasswordError('');
                  setAdminPasswordSuccess('');
                  setIsSuperAdminPasswordModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold rounded-xl transition-colors shadow-2xs"
                title="સુપર એડમિન તરીકે આપનો પાસવર્ડ અપડેટ કરો"
              >
                <KeyRound className="w-4 h-4 text-amber-800" />
                <span>પાસવર્ડ બદલો (Change Password)</span>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(superAdminInst)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl shadow-xs transition-colors"
                title="સુપર એડમિન તરીકે આપની વ્યક્તિગત પ્રોફાઇલ વિગતો એડિટ કરો"
              >
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>પ્રોફાઇલ એડિટ (Edit Profile)</span>
              </button>
            </div>
          </div>
        );
      })()}

      {testResult && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Global System KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>કુલ ઇન્સ્ટ્રક્ટર્સ (Instructors)</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalInstructors}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{approvedInstructors.length} મંજૂર થયેલ</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold mb-1">
            <span>પેન્ડિંગ મંજૂરી (Pending)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-800">{pendingInstructors.length}</div>
          <div className="text-[11px] text-amber-700 mt-1">વેરિફિકેશનની જરૂરિયાત</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>કુલ તાલીમાર્થીઓ (Trainees)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTrainees}</div>
          <div className="text-[11px] text-slate-500 mt-1">તમામ ITI યુનિટ્સમાં</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>કુલ જાવક પત્રો (Dispatches)</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalDispatches}</div>
          <div className="text-[11px] text-slate-500 mt-1">{flaggedAttendanceCount} અનિયમિત વિદ્યાર્થીઓ</div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-[#346739] text-[#f2edc2] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>પેન્ડિંગ મંજૂરીઓ (Pending Approvals)</span>
          {pendingInstructors.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingInstructors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-[#346739] text-[#f2edc2] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>તમામ ઇન્સ્ટ્રક્ટર્સ લિસ્ટ (All Instructors)</span>
          <span className="text-[10px] text-slate-400">({instructors.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingInstructors.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">કોઈ પેન્ડિંગ રજીસ્ટ્રેશન નથી</h3>
              <p className="text-xs text-slate-500 mt-1">
                તમામ ઇન્સ્ટ્રક્ટર રજીસ્ટ્રેશન વેરિફાય થઈ ચૂક્યા છે. નવા રજીસ્ટ્રેશન અહીં પ્રદર્શિત થશે.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInstructors.map((inst) => {
                const cleanPhone = cleanPhoneNumber(inst.phone);
                const whatsappMsg = encodeURIComponent(
                  `નમસ્તે ${inst.name}, આપનું ITI Instructor એકાઉન્ટ સુપર એડમિન દ્વારા સફળતાપૂર્વક વેરિફાય અને એપ્રૂવ કરવામાં આવ્યું છે. હવે આપ આપના મોબાઈલ નંબર ${inst.phone} અથવા ઈમેલ ${inst.email} વડે પોર્ટલમાં લોગિન કરી શકો છો.`
                );

                return (
                  <div
                    key={inst.id}
                    className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{inst.name}</h3>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                              પેન્ડિંગ મંજૂરી
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{inst.designation}</p>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inst.created_at ? new Date(inst.created_at).toLocaleDateString('gu-IN') : 'આજે'}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-900">{inst.iti_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>ટ્રેડ: <strong className="text-slate-900">{inst.trade}</strong> | બેચ: {inst.batch} | યુનિટ: {inst.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>ઈમેલ: <strong className="text-slate-900">{inst.email}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>મોબાઈલ નંબર: <strong className="text-blue-700">{inst.phone}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-600 mb-1">
                        ઇન્સ્ટ્રક્ટર સાથે સંપર્ક કરો અને વેરિફિકેશન કરો:
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Direct Call */}
                        <a
                          href={`tel:${inst.phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>કૉલ કરો ({inst.phone})</span>
                        </a>

                        {/* WhatsApp Message */}
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>વોટ્સએપ સંદેશ</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(inst)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>એકાઉન્ટ મંજૂર કરો (Approve)</span>
                        </button>

                        <button
                          onClick={() => handleReject(inst)}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>અસ્વીકાર (Reject)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL INSTRUCTORS DIRECTORY */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="નામ, ઈમેલ, મોબાઈલ, ITI થી શોધો..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#346739] text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
              >
                <option value="all">તમામ સ્ટેટસ (All Status)</option>
                <option value="approved">મંજૂર થયેલ (Approved)</option>
                <option value="pending">પેન્ડિંગ (Pending)</option>
                <option value="suspended">સ્થગિત (Suspended)</option>
                <option value="rejected">અસ્વીકાર (Rejected)</option>
              </select>

              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#346739] text-[#f2edc2] rounded-xl text-xs font-bold hover:bg-[#264e2b] transition-colors whitespace-nowrap shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>નવા ઇન્સ્ટ્રક્ટર</span>
              </button>
            </div>
          </div>

          {/* Instructors Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ઇન્સ્ટ્રક્ટર વિગત</th>
                    <th className="py-3 px-4">સંસ્થા અને ટ્રેડ</th>
                    <th className="py-3 px-4">લોગિન આઈડી (ઈમેલ / મોબાઈલ)</th>
                    <th className="py-3 px-4">સ્ટેટસ</th>
                    <th className="py-3 px-4 text-right">ક્રિયાઓ (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstructors.map((inst) => {
                    const isApproved = inst.status === 'approved' || !inst.status;
                    const isPending = inst.status === 'pending';
                    const isSuperAdmin = inst.role === 'super_admin' || inst.email === 'tejassuthar21696@gmail.com';

                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inst.name}</div>
                          <div className="text-[11px] text-slate-500">{inst.designation}</div>
                          {isSuperAdmin && (
                            <span className="inline-block mt-1 text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                              સુપર એડમિન
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{inst.iti_name}</div>
                          <div className="text-[11px] text-slate-500">
                            ટ્રેડ: {inst.trade} | બેચ: {inst.batch || '૨૦૨૫–૨૦૨૬'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-900">{inst.email}</div>
                          <div className="text-blue-700 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span>{inst.phone || 'મોબાઈલ ઉપલબ્ધ નથી'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                              પેન્ડિંગ
                            </span>
                          ) : isApproved ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                              મંજૂર (Approved)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-300">
                              {inst.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setResetInstructorTarget(inst);
                                setInstructorNewPassword('');
                                setInstructorPasswordError('');
                                setInstructorPasswordSuccess('');
                                setCopiedCredentials(false);
                              }}
                              title={
                                isSuperAdmin
                                  ? 'સુપર એડમિન પાસવર્ડ બદલો'
                                  : 'ઇન્સ્ટ્રક્ટર પાસવર્ડ બદલો / રીસેટ કરો (Reset Password if Forgot)'
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-800" />
                              <span>પાસવર્ડ</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(inst)}
                              title="પ્રોફાઇલ વિગતો એડિટ કરો (Edit Profile)"
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>એડિટ</span>
                            </button>

                            {/* Delete (prevent deleting super admin) */}
                            {!isSuperAdmin && (
                              <button
                                onClick={() => handleDelete(inst)}
                                title="ખાતું ડિલીટ કરો"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCTOR ADD/UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#346739]" />
                <span>
                  {editingInstructor ? 'ઇન્સ્ટ્રક્ટર વિગત અપડેટ કરો' : 'નવા ઇન્સ્ટ્રક્ટર ઉમેરો'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ઇન્સ્ટ્રક્ટરનું નામ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="દા.ત. તેજસભાઈ સુથાર"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Email & Mobile (Strictly Unique Login IDs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>ઈમેલ આઈડી (Email ID) *</span>
                    <span className="text-[10px] text-blue-700">યુનિક લોગિન</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="instructor@iti.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>મોબાઈલ નંબર (Mobile No) *</span>
                    <span className="text-[10px] text-blue-700">યુનિક લોગિન</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="૧૦ આંકડાનો મોબાઈલ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    {editingInstructor ? 'પાસવર્ડ (બદલવા માટે દાખલ કરો)' : 'ડેડિકેટેડ પાસવર્ડ *'}
                  </span>
                  <span className="text-[10px] text-slate-500">આંતરરાષ્ટ્રીય માપદંડ</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingInstructor}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="દા.ત. Admin@ITI2026!"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  નિયમ: ઓછામાં ઓછા ૮ અક્ષર, ૧ કેપિટલ, ૧ સ્મોલ, ૧ અંક અને ૧ સ્પેશિયલ સિમ્બોલ.
                </div>
              </div>

              {/* ITI Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  સંસ્થાનું નામ (ITI / Directorate Institute Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formItiName}
                  onChange={(e) => setFormItiName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              {/* Institution Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  સંસ્થા / કચેરીનું સરનામું (Official Address)
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="દા.ત. આઈટીઆઈ કેમ્પસ, શંખેશ્વર, જિ. પાટણ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              {/* Outward Code Prefix */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>જાવક નંબર પ્રીફિક્સ (Outward Reference Prefix)</span>
                  <span className="text-[10px] text-slate-500 font-mono">દા.ત. ITI/SKSR/COPA/2026/</span>
                </label>
                <input
                  type="text"
                  value={formOutwardCode}
                  onChange={(e) => setFormOutwardCode(e.target.value)}
                  placeholder="દા.ત. આઈટીઆઈ/શંખેશ્વર/કોપા/૨૦૨૬/"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              {/* Initial Hierarchy: Trade, Batch, Unit */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#346739]" />
                  <span>પ્રાથમિક શૈક્ષણિક વિગતો (Trade, Batch & Unit)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">ટ્રેડ</label>
                    <input
                      type="text"
                      required
                      value={formTrade}
                      onChange={(e) => setFormTrade(e.target.value)}
                      placeholder="કોપા (COPA)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">બેચ</label>
                    <input
                      type="text"
                      required
                      value={formBatch}
                      onChange={(e) => setFormBatch(e.target.value)}
                      placeholder="૨૦૨૫–૨૦૨૬"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">યુનિટ</label>
                    <input
                      type="text"
                      required
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="Unit A"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ખાતાનું સ્ટેટસ (Status)</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="approved">મંજૂર (Approved)</option>
                    <option value="pending">પેન્ડિંગ (Pending)</option>
                    <option value="suspended">સ્થગિત (Suspended)</option>
                    <option value="rejected">અસ્વીકાર (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">રોલ (User Role)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="instructor">ઇન્સ્ટ્રક્ટર (Instructor)</option>
                    <option value="super_admin">સુપર એડમિન (Super Admin)</option>
                  </select>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  સુરક્ષા અને વેરિફિકેશન સ્ટેટસ (Security Verifications)
                </label>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEmailVerified}
                      onChange={(e) => setFormEmailVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-[#346739] focus:ring-[#346739] border-slate-300"
                    />
                    <span>ઈમેલ વેરિફાઇડ (Email Verified)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMobileVerified}
                      onChange={(e) => setFormMobileVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-[#346739] focus:ring-[#346739] border-slate-300"
                    />
                    <span>મોબાઈલ વેરિફાઇડ (Mobile Verified)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition-colors"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingInstructor ? 'અપડેટ સેવ કરો' : 'ઇન્સ્ટ્રક્ટર બનાવો'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN PERSONAL PASSWORD UPDATE MODAL */}
      {isSuperAdminPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            <button
              onClick={() => setIsSuperAdminPasswordModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
                <KeyRound className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  સુપર એડમિન પાસવર્ડ બદલો
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  State Super Administrator Security
                </p>
              </div>
            </div>

            {adminPasswordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{adminPasswordSuccess}</span>
              </div>
            )}

            {adminPasswordError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{adminPasswordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminPassword} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-slate-500">ખાતું (Super Admin Account):</div>
                <div className="font-semibold text-slate-900 text-xs">તેજસ સુથાર (State Directorate)</div>
                <div className="text-slate-600 font-mono text-[11px]">tejassuthar21696@gmail.com</div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  નવો પાસવર્ડ (New Password) *
                </label>
                <div className="relative">
                  <input
                    type={adminPasswordShow ? 'text' : 'password'}
                    required
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="આપનો નવો સુરક્ષિત પાસવર્ડ દાખલ કરો"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium pr-10 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAdminPasswordShow(!adminPasswordShow)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {adminPasswordShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  કન્ફર્મ નવો પાસવર્ડ (Confirm Password) *
                </label>
                <input
                  type={adminPasswordShow ? 'text' : 'password'}
                  required
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="નવો પાસવર્ડ ફરીથી દાખલ કરો"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Password criteria checklist */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>સુરક્ષા પાસવર્ડ નિયમો (Security Rules):</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                  <span className={adminNewPassword.length >= 8 ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • ઓછામાં ઓછા ૮ અક્ષર
                  </span>
                  <span className={/[A-Z]/.test(adminNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • એક કેપિટલ લેટર (A-Z)
                  </span>
                  <span className={/[a-z]/.test(adminNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • એક સ્મોલ લેટર (a-z)
                  </span>
                  <span className={/[0-9]/.test(adminNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • એક અંક (0-9)
                  </span>
                  <span className={/[@$!%*#?&]/.test(adminNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • સ્પેશિયલ સિમ્બોલ (@$!%*#?&)
                  </span>
                  {adminConfirmPassword.length > 0 && (
                    <span className={adminNewPassword === adminConfirmPassword ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      • {adminNewPassword === adminConfirmPassword ? 'પાસવર્ડ મેચ થાય છે' : 'પાસવર્ડ મળતા નથી'}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSuperAdminPasswordModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition-colors"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={!validatePassword(adminNewPassword).isValid || adminNewPassword !== adminConfirmPassword}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>પાસવર્ડ અપડેટ કરો (Update Password)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTRUCTOR PASSWORD RESET MODAL (WHEN INSTRUCTOR FORGOT PASSWORD) */}
      {resetInstructorTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
            <button
              onClick={() => {
                setResetInstructorTarget(null);
                setInstructorPasswordSuccess('');
                setInstructorPasswordError('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
                <KeyRound className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  ઇન્સ્ટ્રક્ટર પાસવર્ડ બદલો / રીસેટ કરો
                </h3>
                <p className="text-xs text-slate-500">
                  જો ઇન્સ્ટ્રક્ટર પાસવર્ડ ભૂલી ગયા હોય તો સુપર એડમિન દ્વારા નવો પાસવર્ડ સેટ કરો
                </p>
              </div>
            </div>

            {/* Target Instructor Details */}
            <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{resetInstructorTarget.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {resetInstructorTarget.designation}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <div>
                  સંસ્થા: <strong className="text-slate-900">{resetInstructorTarget.iti_name}</strong>
                </div>
                <div>
                  ટ્રેડ: <strong className="text-slate-900">{resetInstructorTarget.trade || 'કોઈ નથી'}</strong>
                </div>
                <div>
                  મોબાઈલ: <strong className="text-blue-700 font-mono">{resetInstructorTarget.phone}</strong>
                </div>
                <div>
                  ઈમેલ: <strong className="text-slate-900 font-mono">{resetInstructorTarget.email}</strong>
                </div>
              </div>
            </div>

            {instructorPasswordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{instructorPasswordSuccess}</span>
              </div>
            )}

            {instructorPasswordError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{instructorPasswordError}</span>
              </div>
            )}

            <form onSubmit={handleResetInstructorPassword} className="space-y-4 text-xs">
              {/* New Password & Auto Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    નવો પાસવર્ડ (New Password for Instructor) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = generateRandomStrongPassword();
                      setInstructorNewPassword(gen);
                      setInstructorPasswordShow(true);
                    }}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300 transition-colors shadow-2xs"
                    title="સુરક્ષિત મજબૂત પાસવર્ડ ઓટો-જનરેટ કરો"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>ઓટો-જનરેટ મજબૂત પાસવર્ડ</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={instructorPasswordShow ? 'text' : 'password'}
                    required
                    value={instructorNewPassword}
                    onChange={(e) => setInstructorNewPassword(e.target.value)}
                    placeholder="દા.ત. ITI@2026!Pravin અથવા ઓટો-જનરેટ કરો"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-medium pr-10 focus:bg-white focus:ring-2 focus:ring-[#346739]"
                  />
                  <button
                    type="button"
                    onClick={() => setInstructorPasswordShow(!instructorPasswordShow)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {instructorPasswordShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password criteria indicators */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>પાસવર્ડ નિયમો:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                  <span className={instructorNewPassword.length >= 8 ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • ઓછામાં ઓછા ૮ અક્ષર
                  </span>
                  <span className={/[A-Z]/.test(instructorNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • કેપિટલ લેટર (A-Z)
                  </span>
                  <span className={/[a-z]/.test(instructorNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • સ્મોલ લેટર (a-z)
                  </span>
                  <span className={/[0-9]/.test(instructorNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • અંક (0-9)
                  </span>
                  <span className={/[@$!%*#?&]/.test(instructorNewPassword) ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    • સ્પેશિયલ સિમ્બોલ (@$!%*#?&)
                  </span>
                </div>
              </div>

              {/* Share New Credentials with Instructor Actions */}
              {instructorNewPassword.length >= 8 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="text-[11px] font-bold text-emerald-900 flex items-center justify-between">
                    <span>ઇન્સ્ટ્રક્ટર સાથે નવો પાસવર્ડ શેર કરો:</span>
                    {copiedCredentials && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                        કોપી થઈ ગયું!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopyInstructorCredentials}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 font-bold text-xs transition-colors shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>ક્રેડેન્શિયલ્સ કોપી કરો</span>
                    </button>

                    <a
                      href={`https://wa.me/91${cleanPhoneNumber(resetInstructorTarget.phone)}?text=${encodeURIComponent(
                        `નમસ્તે ${resetInstructorTarget.name}, આપના ITI એકાઉન્ટ માટે સુપર એડમિન દ્વારા નવો પાસવર્ડ સેટ કરવામાં આવ્યો છે:\n\nમોબાઈલ: ${resetInstructorTarget.phone}\nઈમેલ: ${resetInstructorTarget.email}\nનવો પાસવર્ડ: ${instructorNewPassword}\n\nકૃપા કરીને આ ક્રેડેન્શિયલ્સ વડે પોર્ટલમાં લોગિન કરો.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>વોટ્સએપ પર મોકલો</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetInstructorTarget(null);
                    setInstructorPasswordSuccess('');
                    setInstructorPasswordError('');
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition-colors"
                >
                  બંધ કરો
                </button>
                <button
                  type="submit"
                  disabled={!validatePassword(instructorNewPassword).isValid}
                  className="px-5 py-2.5 bg-[#346739] hover:bg-[#264e2b] disabled:opacity-50 text-[#f2edc2] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>નવો પાસવર્ડ સાચવો (Update Password)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
