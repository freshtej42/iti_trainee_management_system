import React, { useState, useMemo, useEffect } from 'react';
import { Instructor, Trainee, AttendanceRecord, DispatchLog, SuperAdminSettings } from '../types';
import {
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  Send,
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
  QrCode,
  CreditCard,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Download,
  Upload,
  Image as ImageIcon,
  Settings,
  UserX,
  Calendar,
} from 'lucide-react';
import {
  validatePassword,
  cleanPhoneNumber,
  checkInstructorUniqueness,
} from '../utils/passwordPolicy';
import { UpiQrCode } from './UpiQrCode';
import { DEFAULT_ADMIN_SETTINGS, deduplicateInstructors } from '../services/dataService';
import {
  compressImageFile,
  SAMPLE_UPI_RECEIPT_DATA_URL,
  DEFAULT_ADMIN_QR_IMAGE_URL,
} from '../utils/imageCompressor';
import {
  calculateOneYearFromApproval,
  formatValidityDate,
  getValidityRemainingDays,
  isAccountExpired,
  isSuperAdminAccount,
} from '../utils/validityHelper';
import {
  GUJARAT_ITIS,
  STANDARD_DESIGNATIONS,
  ACADEMIC_BATCHES,
  STANDARD_UNITS,
  COMMON_TRADES,
} from '../data/registrationOptions';

interface SuperAdminDashboardProps {
  instructors: Instructor[];
  trainees: Trainee[];
  attendanceRecords: AttendanceRecord[];
  dispatchLogs: DispatchLog[];
  adminSettings?: SuperAdminSettings;
  onSelectTenant?: (id: string) => void;
  onAddInstructor?: (instructor: Instructor) => void;
  onUpdateInstructor?: (instructor: Instructor) => void;
  onDeleteInstructor?: (id: string) => void;
  onUpdateTrainee?: (trainee: Trainee) => void;
  onDeleteTrainee?: (id: string) => void;
  onBatchDeleteTrainees?: (ids: string[]) => void;
  onUpdateAdminSettings?: (settings: SuperAdminSettings) => void;
}

export default function SuperAdminDashboard({
  instructors,
  trainees,
  attendanceRecords,
  dispatchLogs,
  adminSettings = DEFAULT_ADMIN_SETTINGS,
  onSelectTenant,
  onAddInstructor,
  onUpdateInstructor,
  onDeleteInstructor,
  onUpdateTrainee,
  onDeleteTrainee,
  onBatchDeleteTrainees,
  onUpdateAdminSettings,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'all-students' | 'cleanup' | 'upi-settings'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'suspended'>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentTradeFilter, setStudentTradeFilter] = useState('ALL');
  const [studentUnitFilter, setStudentUnitFilter] = useState('ALL');
  const [studentInstructorFilter, setStudentInstructorFilter] = useState('ALL');

  // Trainee Management Modals State (Super Admin Universal Edit & Reassignment)
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);
  const [editTraineeForm, setEditTraineeForm] = useState<Partial<Trainee>>({});
  const [reassigningTrainee, setReassigningTrainee] = useState<Trainee | null>(null);
  const [reassignTargetInstructorId, setReassignTargetInstructorId] = useState('');
  const [reassignTargetTrade, setReassignTargetTrade] = useState('');
  const [reassignTargetBatch, setReassignTargetBatch] = useState('');
  const [reassignTargetUnit, setReassignTargetUnit] = useState('');
  const [traineeActionFeedback, setTraineeActionFeedback] = useState('');

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

  // Instructor Deletion / Removal Modal State
  const [deleteTargetInstructor, setDeleteTargetInstructor] = useState<Instructor | null>(null);
  const [deleteNotification, setDeleteNotification] = useState('');

  // Newly Added Instructor Credentials Modal State
  const [newlyAddedInstructor, setNewlyAddedInstructor] = useState<{
    instructor: Instructor;
    plainPassword?: string;
  } | null>(null);
  const [copiedNewCredentials, setCopiedNewCredentials] = useState(false);

  // UPI Settings & Admin QR Code Form State
  const [settingsUpiId, setSettingsUpiId] = useState(adminSettings.upi_id || 'tejassuthar21696@okhdfcbank');
  const [settingsPayeeName, setSettingsPayeeName] = useState(adminSettings.payee_name || 'Tejas Suthar (Super Admin)');
  const [settingsFeeAmount, setSettingsFeeAmount] = useState(adminSettings.fee_amount || 49);
  const [settingsInstructions, setSettingsInstructions] = useState(adminSettings.payment_instructions || 'Pay ₹49 for ITI Trainee Portal Account Verification & Activation');
  const [settingsQrImageUrl, setSettingsQrImageUrl] = useState<string>(
    adminSettings.qr_image_url || DEFAULT_ADMIN_QR_IMAGE_URL
  );
  const [isUploadingQr, setIsUploadingQr] = useState<boolean>(false);
  const [qrUploadError, setQrUploadError] = useState<string>('');
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  useEffect(() => {
    if (adminSettings) {
      if (adminSettings.upi_id) setSettingsUpiId(adminSettings.upi_id);
      if (adminSettings.payee_name) setSettingsPayeeName(adminSettings.payee_name);
      if (adminSettings.fee_amount) setSettingsFeeAmount(adminSettings.fee_amount);
      if (adminSettings.payment_instructions) setSettingsInstructions(adminSettings.payment_instructions);
      if (adminSettings.qr_image_url) setSettingsQrImageUrl(adminSettings.qr_image_url);
    }
  }, [adminSettings]);

  const [settingsQrUrlInput, setSettingsQrUrlInput] = useState<string>('');

  const saveCurrentSettings = (overrideQrUrl?: string) => {
    const finalQr = overrideQrUrl !== undefined ? overrideQrUrl : settingsQrImageUrl;
    if (onUpdateAdminSettings) {
      onUpdateAdminSettings({
        upi_id: settingsUpiId.trim(),
        payee_name: settingsPayeeName.trim(),
        fee_amount: Number(settingsFeeAmount) || 49,
        payment_instructions: settingsInstructions.trim(),
        qr_enabled: true,
        qr_image_url: finalQr,
        updated_at: new Date().toISOString(),
      });
    }
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3500);
  };

  const handleQrCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploadError('');
    if (!file.type.startsWith('image/')) {
      setQrUploadError('કૃપા કરીને ફક્ત છબી ફાઇલ (PNG, JPG, SVG, WebP) સિલેક્ટ કરો.');
      return;
    }
    try {
      setIsUploadingQr(true);
      const compressed = await compressImageFile(file, 900, 0.88);
      setSettingsQrImageUrl(compressed);
      saveCurrentSettings(compressed);
    } catch (err: unknown) {
      setQrUploadError(err instanceof Error ? err.message : 'QR કોડ અપલોડ કરવામાં ભૂલ આવી.');
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleApplyQrUrl = () => {
    if (!settingsQrUrlInput.trim()) return;
    setSettingsQrImageUrl(settingsQrUrlInput.trim());
    saveCurrentSettings(settingsQrUrlInput.trim());
    setSettingsQrUrlInput('');
  };

  const handleGenerateDynamicQr = () => {
    const encodedUpiId = encodeURIComponent(settingsUpiId.trim());
    const encodedPayeeName = encodeURIComponent(settingsPayeeName.trim());
    const encodedNote = encodeURIComponent(`ITI Account Verification Fee - ${settingsPayeeName.trim()}`);
    const amount = Number(settingsFeeAmount) || 9;
    const upiUri = `upi://pay?pa=${encodedUpiId}&pn=${encodedPayeeName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
    const generatedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}&margin=2&qzone=1`;
    setSettingsQrImageUrl(generatedUrl);
    saveCurrentSettings(generatedUrl);
  };

  const handleResetDefaultQr = () => {
    setSettingsQrImageUrl(DEFAULT_ADMIN_QR_IMAGE_URL);
    setQrUploadError('');
    saveCurrentSettings(DEFAULT_ADMIN_QR_IMAGE_URL);
  };

  // Payment Screenshot Viewer Modal State
  const [previewScreenshotInstructor, setPreviewScreenshotInstructor] = useState<Instructor | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState<number>(1);
  const [screenshotRotate, setScreenshotRotate] = useState<number>(0);
  const [copiedUtrTarget, setCopiedUtrTarget] = useState<string | null>(null);
  const [screenshotActionMessage, setScreenshotActionMessage] = useState<string>('');

  // Cleanup Tool State
  const [selectedOrphanIds, setSelectedOrphanIds] = useState<string[]>([]);
  const [cleanupSuccessMessage, setCleanupSuccessMessage] = useState('');
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    traineeIds: string[];
    count: number;
  }>({ isOpen: false, traineeIds: [], count: 0 });

  // Super Admin Trainee Management Handlers
  const openEditTrainee = (t: Trainee) => {
    setEditingTrainee(t);
    setEditTraineeForm({ ...t });
  };

  const handleSaveEditTraineeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainee || !onUpdateTrainee) return;
    const updated: Trainee = {
      ...editingTrainee,
      ...editTraineeForm,
      updated_at: new Date().toISOString(),
    } as Trainee;
    onUpdateTrainee(updated);
    setEditingTrainee(null);
    setTraineeActionFeedback(`તાલીમાર્થી "${updated.student_name} ${updated.surname}" ની વિગતો સફળતાપૂર્વક અપડેટ કરવામાં આવી.`);
    setTimeout(() => setTraineeActionFeedback(''), 4000);
  };

  const openReassignTrainee = (t: Trainee) => {
    setReassigningTrainee(t);
    setReassignTargetInstructorId(t.instructor_id || '');
    setReassignTargetTrade(t.trade || '');
    setReassignTargetBatch(t.batch || '૨૦૨૫–૨૦૨૬');
    setReassignTargetUnit(t.unit || 'Unit A');
  };

  const handleSaveReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningTrainee || !onUpdateTrainee) return;
    const targetInst = instructors.find((i) => i.id === reassignTargetInstructorId);
    const updated: Trainee = {
      ...reassigningTrainee,
      instructor_id: reassignTargetInstructorId,
      trade: reassignTargetTrade || targetInst?.trade || reassigningTrainee.trade,
      batch: reassignTargetBatch || targetInst?.batch || reassigningTrainee.batch,
      unit: reassignTargetUnit || targetInst?.unit || reassigningTrainee.unit,
      updated_at: new Date().toISOString(),
    };
    onUpdateTrainee(updated);
    setReassigningTrainee(null);
    setTraineeActionFeedback(`તાલીમાર્થી "${updated.student_name} ${updated.surname}" ને સફળતાપૂર્વક નવા ઇન્સ્ટ્રક્ટર સાથે અસાઇન કરવામાં આવ્યો.`);
    setTimeout(() => setTraineeActionFeedback(''), 4000);
  };

  const handleDeleteSingleTrainee = (t: Trainee) => {
    if (!onDeleteTrainee) return;
    if (window.confirm(`શું આપ ખરેખર તાલીમાર્થી "${t.student_name} ${t.surname}" (#${t.roll_no}) ને કાયમી ડિલીટ કરવા માંગો છો?`)) {
      onDeleteTrainee(t.id);
      setTraineeActionFeedback(`તાલીમાર્થી "${t.student_name} ${t.surname}" ને સફળતાપૂર્વક ડિલીટ કરવામાં આવ્યો.`);
      setTimeout(() => setTraineeActionFeedback(''), 4000);
    }
  };

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

  const pendingInstructors = useMemo(
    () => deduplicateInstructors(instructors.filter((i) => i.status === 'pending')),
    [instructors]
  );
  const approvedInstructors = useMemo(
    () => deduplicateInstructors(instructors.filter((i) => i.status === 'approved' || !i.status)),
    [instructors]
  );

  // Global KPIs
  const totalInstructors = instructors.length;
  const totalTrainees = trainees.length;
  const flaggedAttendanceCount = attendanceRecords.filter((r) => r.attendance_percentage < 80.0).length;
  const totalDispatches = dispatchLogs.length;

  // Compute Unassociated / Orphaned Trainees (Trainee who is not associated to any valid instructor or batch)
  const instructorIdSet = useMemo(() => new Set(instructors.map((i) => i.id)), [instructors]);

  const orphanTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const hasValidInstructor = t.instructor_id && instructorIdSet.has(t.instructor_id);
      const hasValidBatch = Boolean(t.batch && t.batch.trim().length > 0 && t.batch !== 'અનિર્ણિત');
      const hasValidTrade = Boolean(t.trade && t.trade.trim().length > 0 && t.trade !== 'અનિર્ણિત');

      // A trainee is orphaned / unassociated if they have no instructor OR no batch OR no trade
      return !hasValidInstructor || !hasValidBatch || !hasValidTrade;
    });
  }, [trainees, instructorIdSet]);

  // Handler to delete single orphan trainee
  const handleSingleDeleteOrphan = (t: Trainee) => {
    setConfirmDeleteModal({
      isOpen: true,
      traineeIds: [t.id],
      count: 1,
    });
  };

  // Handler to bulk delete selected orphans
  const handleBulkDeleteOrphans = () => {
    if (selectedOrphanIds.length === 0) return;
    setConfirmDeleteModal({
      isOpen: true,
      traineeIds: selectedOrphanIds,
      count: selectedOrphanIds.length,
    });
  };

  // Handler to execute confirmed deletion
  const executeConfirmedDeletion = () => {
    const ids = confirmDeleteModal.traineeIds;
    if (ids.length === 1 && onDeleteTrainee) {
      onDeleteTrainee(ids[0]);
    } else if (onBatchDeleteTrainees) {
      onBatchDeleteTrainees(ids);
    } else if (onDeleteTrainee) {
      ids.forEach((id) => onDeleteTrainee(id));
    }

    setSelectedOrphanIds((prev) => prev.filter((id) => !ids.includes(id)));
    setConfirmDeleteModal({ isOpen: false, traineeIds: [], count: 0 });
    setCleanupSuccessMessage(`${ids.length} બિન-સંકળાયેલ તાલીમાર્થીઓ સફળતાપૂર્વક હટાવી દેવામાં આવ્યા છે.`);
    setTimeout(() => setCleanupSuccessMessage(''), 4000);
  };

  // Filtered instructors list
  const filteredInstructors = useMemo(() => {
    return deduplicateInstructors(
      instructors.filter((inst) => {
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
      })
    );
  }, [instructors, searchQuery, statusFilter]);

  // Handle Approve (Usable for 1 year from approval date, lifetime for super admin)
  const handleApprove = (inst: Instructor) => {
    if (!onUpdateInstructor) return;
    const approvalDate = new Date();
    const oneYearLater = calculateOneYearFromApproval(approvalDate);
    const isSuperAdmin = isSuperAdminAccount(inst);

    const updated: Instructor = {
      ...inst,
      status: 'approved',
      approved_at: approvalDate.toISOString(),
      approved_by: 'tejassuthar21696@gmail.com',
      valid_until: isSuperAdmin ? undefined : oneYearLater,
      updated_at: new Date().toISOString(),
    };
    onUpdateInstructor(updated);
    setScreenshotActionMessage(
      isSuperAdmin
        ? `સુપર એડમિન "${inst.name}" ખાતું મંજૂર કરાયું (લાઈફટાઈમ એક્સેસ).`
        : `ઇન્સ્ટ્રક્ટર "${inst.name}" નું ખાતું સફળતાપૂર્વક મંજૂર કરવામાં આવ્યું. મંજૂરી તારીખથી ૧ વર્ષ માટે માન્ય (${formatValidityDate(oneYearLater)} સુધી).`
    );
    setTimeout(() => setScreenshotActionMessage(''), 6000);
  };

  // Handle Extend Validity (+1 Year from current expiration)
  const handleExtendValidity = (inst: Instructor) => {
    if (!onUpdateInstructor) return;
    if (isSuperAdminAccount(inst)) return;

    const baseDate =
      inst.valid_until && new Date(inst.valid_until).getTime() > Date.now()
        ? new Date(inst.valid_until)
        : new Date();
    const extended = calculateOneYearFromApproval(baseDate);

    const updated: Instructor = {
      ...inst,
      valid_until: extended,
      updated_at: new Date().toISOString(),
    };
    onUpdateInstructor(updated);
    setScreenshotActionMessage(
      `ઇન્સ્ટ્રક્ટર "${inst.name}" ની માન્યતા +૧ વર્ષ લંબાવાઈ: ${formatValidityDate(extended)} સુધી.`
    );
    setTimeout(() => setScreenshotActionMessage(''), 5000);
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

  // Handle Manual/Direct Attachment or Replacement of Payment Screenshot
  const handleUpdateInstructorScreenshot = (
    inst: Instructor,
    screenshotUrl: string,
    sampleUtr?: string
  ) => {
    if (!onUpdateInstructor) return;
    const updated: Instructor = {
      ...inst,
      payment_screenshot_url: screenshotUrl,
      payment_utr: inst.payment_utr || sampleUtr || `UPI${Date.now().toString().slice(-8)}`,
      payment_mobile: inst.payment_mobile || inst.phone,
      payment_amount: inst.payment_amount || adminSettings.fee_amount || 49,
      payment_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onUpdateInstructor(updated);
    setScreenshotActionMessage(`ઇન્સ્ટ્રક્ટર "${inst.name}" માટે ચૂકવણી સ્ક્રીનશોટ સફળતાપૂર્વક સાચવવામાં આવ્યો.`);
    setTimeout(() => setScreenshotActionMessage(''), 4000);
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
          approved_at:
            formStatus === 'approved'
              ? editingInstructor.approved_at || new Date().toISOString()
              : editingInstructor.approved_at,
          valid_until:
            formRole === 'super_admin' || cleanEmail === 'tejassuthar21696@gmail.com'
              ? undefined
              : formStatus === 'approved'
              ? editingInstructor.valid_until || calculateOneYearFromApproval(new Date())
              : editingInstructor.valid_until,
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
          approved_at: formStatus === 'approved' ? new Date().toISOString() : undefined,
          valid_until:
            formRole === 'super_admin' || cleanEmail === 'tejassuthar21696@gmail.com'
              ? undefined
              : formStatus === 'approved'
              ? calculateOneYearFromApproval(new Date())
              : undefined,
          email_verified: formEmailVerified,
          mobile_verified: formMobileVerified,
          created_at: new Date().toISOString(),
          header_config: {
            show_logo: true,
            institute_name_gu: formItiName.trim(),
            institute_name_en: 'INDUSTRIAL TRAINING INSTITUTE',
            department_subtitle: 'કૌશલ્ય વિકાસ અને વ્યાવસાયિક તાલીમ વિભાગ',
            address: formAddress.trim() || 'ગુજરાત',
            ref_prefix: formOutwardCode.trim() || 'આઈટીઆઈ/તાલીમ/૨૦૨૬',
          },
        };
        onAddInstructor(newInst);
        setNewlyAddedInstructor({
          instructor: newInst,
          plainPassword: formPassword,
        });
      }
    }

    setIsModalOpen(false);
  };

  // Prompt Delete Confirmation Modal (Prevents Super Admin self-deletion)
  const promptDelete = (inst: Instructor) => {
    if (inst.role === 'super_admin' || inst.email === 'tejassuthar21696@gmail.com') {
      alert('સુપર એડમિન એકાઉન્ટ ડિલીટ કરી શકાતું નથી.');
      return;
    }
    setDeleteTargetInstructor(inst);
  };

  // Confirm and Execute Instructor Deletion
  const handleConfirmDelete = () => {
    if (!deleteTargetInstructor) return;
    if (
      deleteTargetInstructor.role === 'super_admin' ||
      deleteTargetInstructor.email === 'tejassuthar21696@gmail.com'
    ) {
      setDeleteTargetInstructor(null);
      return;
    }
    const instructorName = deleteTargetInstructor.name;
    if (onDeleteInstructor) {
      onDeleteInstructor(deleteTargetInstructor.id);
    }
    setDeleteNotification(`ઇન્સ્ટ્રક્ટર "${instructorName}" નું ખાતું સફળતાપૂર્વક ડિલીટ કરવામાં આવ્યું.`);
    setTimeout(() => setDeleteNotification(''), 6000);
    setDeleteTargetInstructor(null);
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('upi-settings')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl shadow-xs transition-all active:scale-95"
            title="ઇન્સ્ટ્રક્ટર્સ માટે પેમેન્ટ QR કોડ ઉમેરો અને બદલો"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            <span>પેમેન્ટ QR કોડ ઉમેરો / સેટ કરો</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>નવા ઇન્સ્ટ્રક્ટર ઉમેરો (Add)</span>
          </button>
        </div>
      </div>

      {/* Success / Deletion Toast Notification */}
      {deleteNotification && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{deleteNotification}</span>
          </div>
          <button
            onClick={() => setDeleteNotification('')}
            className="text-rose-500 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* MOBILE SUPER ADMIN UTILITY DASHBOARD TILES (Touch-Friendly Quick Actions) */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>વહીવટી ટૂલકીટ (Admin Action Tiles)</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">વન-ટચ એક્સેસ</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Tile 1: Pending Approvals */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[92px] active:scale-95 shadow-2xs ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400'
                : 'bg-white text-slate-800 border-amber-200/80 hover:bg-amber-50/50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                activeTab === 'pending' ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}>
                <AlertCircle className="w-4 h-4" />
              </div>
              {pendingInstructors.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingInstructors.length}
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-xs leading-tight">પેન્ડિંગ મંજૂરી</div>
              <div className={`text-[10px] leading-tight mt-0.5 ${activeTab === 'pending' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                {pendingInstructors.length} ખાતા ચકાસણી
              </div>
            </div>
          </button>

          {/* Tile 2: All Instructors */}
          <button
            onClick={() => setActiveTab('all')}
            className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[92px] active:scale-95 shadow-2xs ${
              activeTab === 'all'
                ? 'bg-[#346739] text-[#f2edc2] border-[#264e2b] ring-2 ring-[#346739]'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                activeTab === 'all' ? 'bg-[#1b381e] text-[#f2edc2]' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{instructors.length}</span>
            </div>
            <div>
              <div className="font-bold text-xs leading-tight">ઇન્સ્ટ્રક્ટર્સ</div>
              <div className={`text-[10px] leading-tight mt-0.5 ${activeTab === 'all' ? 'text-emerald-100 font-medium' : 'text-slate-500'}`}>
                {approvedInstructors.length} સક્રિય સ્ટાફ
              </div>
            </div>
          </button>

          {/* Tile 3: All Trainees */}
          <button
            onClick={() => setActiveTab('all-students')}
            className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[92px] active:scale-95 shadow-2xs ${
              activeTab === 'all-students'
                ? 'bg-indigo-700 text-white border-indigo-800 ring-2 ring-indigo-500'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                activeTab === 'all-students' ? 'bg-indigo-950 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-indigo-600">{trainees.length}</span>
            </div>
            <div>
              <div className="font-bold text-xs leading-tight">રાજ્ય તાલીમાર્થીઓ</div>
              <div className={`text-[10px] leading-tight mt-0.5 ${activeTab === 'all-students' ? 'text-indigo-200 font-medium' : 'text-slate-500'}`}>
                તમામ ITI વિદ્યાર્થીઓ
              </div>
            </div>
          </button>

          {/* Tile 4: Orphan Trainee Cleanup */}
          <button
            onClick={() => setActiveTab('cleanup')}
            className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[92px] active:scale-95 shadow-2xs ${
              activeTab === 'cleanup'
                ? 'bg-rose-800 text-white border-rose-900 ring-2 ring-rose-500'
                : 'bg-white text-slate-800 border-rose-200 hover:bg-rose-50/50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                activeTab === 'cleanup' ? 'bg-rose-950 text-rose-200' : 'bg-rose-100 text-rose-800'
              }`}>
                <UserX className="w-4 h-4" />
              </div>
              {orphanTrainees.length > 0 ? (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {orphanTrainees.length}
                </span>
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div>
              <div className="font-bold text-xs leading-tight">ડેટા ક્લીનઅપ ટૂલ</div>
              <div className={`text-[10px] leading-tight mt-0.5 ${activeTab === 'cleanup' ? 'text-rose-200 font-medium' : 'text-rose-600'}`}>
                {orphanTrainees.length > 0 ? `${orphanTrainees.length} બિન-સંકળાયેલ` : 'સ્વચ્છ ડેટાબેઝ'}
              </div>
            </div>
          </button>

          {/* Tile 5: UPI & Fee Settings */}
          <button
            onClick={() => setActiveTab('upi-settings')}
            className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[92px] active:scale-95 shadow-2xs ${
              activeTab === 'upi-settings'
                ? 'bg-slate-900 text-amber-300 border-slate-950 ring-2 ring-amber-400'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                activeTab === 'upi-settings' ? 'bg-slate-800 text-amber-400' : 'bg-amber-100 text-amber-800'
              }`}>
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-emerald-600">₹{adminSettings.fee_amount || 49}</span>
            </div>
            <div>
              <div className="font-bold text-xs leading-tight">UPI અને QR સેટિંગ્સ</div>
              <div className={`text-[10px] leading-tight mt-0.5 ${activeTab === 'upi-settings' ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                QR વેરિફિકેશન
              </div>
            </div>
          </button>

          {/* Tile 6: Quick Add Instructor */}
          <button
            onClick={openAddModal}
            className="p-3 rounded-2xl text-left transition-all border border-dashed border-[#346739] bg-[#f2edc2]/30 hover:bg-[#f2edc2]/60 text-[#346739] flex flex-col justify-between min-h-[92px] active:scale-95 shadow-2xs"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-[#346739] text-[#f2edc2] flex items-center justify-center font-bold text-xs">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#346739]">+ ઉમેરો</span>
            </div>
            <div>
              <div className="font-bold text-xs leading-tight text-[#1b381e]">નવા ઇન્સ્ટ્રક્ટર</div>
              <div className="text-[10px] text-[#346739]/80 leading-tight mt-0.5">
                સીધા એન્ટ્રી કરો
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs (Desktop & Tablet Horizontal Navigation) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
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

        <button
          onClick={() => setActiveTab('all-students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all-students'
              ? 'bg-[#346739] text-[#f2edc2] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>સમગ્ર રાજ્યના તાલીમાર્થીઓ (All Trainees)</span>
          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-[10px] font-black">
            {trainees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cleanup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cleanup'
              ? 'bg-rose-800 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>બિન-સંકળાયેલ તાલીમાર્થી ક્લીનઅપ (Cleanup Tool)</span>
          {orphanTrainees.length > 0 && (
            <span className="bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full text-[10px] font-black">
              {orphanTrainees.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('upi-settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upi-settings'
              ? 'bg-[#346739] text-[#f2edc2] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-amber-500" />
          <span>UPI અને QR સેટિંગ્સ (QR Code Settings)</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {screenshotActionMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{screenshotActionMessage}</span>
            </div>
          )}

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

                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
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

                      {/* Payment Verification Status & Direct Visible Screenshot Block */}
                      <div className={`p-3 rounded-xl border text-xs mb-3 ${
                        inst.payment_screenshot_url
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50/70 border-amber-300 text-amber-950'
                      }`}>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-bold flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                            ₹{inst.payment_amount || adminSettings.fee_amount || 49} UPI પેમેન્ટ સ્ટેટસ
                          </span>
                          {inst.payment_screenshot_url ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              સ્ક્રીનશોટ પ્રાપ્ત થયેલ
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              બાકી (Pending Upload)
                            </span>
                          )}
                        </div>

                        {inst.payment_screenshot_url ? (
                          <div className="space-y-2.5">
                            <div className="p-2.5 bg-white/90 rounded-lg border border-emerald-200 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                              <div className="flex items-center justify-between gap-1">
                                <span>• UTR / UPI Ref:</span>
                                <div className="flex items-center gap-1">
                                  <strong className="font-mono text-slate-900 select-all">{inst.payment_utr || '—'}</strong>
                                  {inst.payment_utr && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(inst.payment_utr || '');
                                        setCopiedUtrTarget(inst.id);
                                        setTimeout(() => setCopiedUtrTarget(null), 2000);
                                      }}
                                      className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                                      title="Copy UTR Number"
                                    >
                                      {copiedUtrTarget === inst.id ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>• ચૂકવણી મોબાઈલ: <strong className="font-mono text-slate-900">{inst.payment_mobile || inst.phone}</strong></div>
                            </div>

                            {/* Prominent Directly Visible Payment Screenshot Card */}
                            <div className="rounded-xl border-2 border-emerald-300 bg-white overflow-hidden shadow-xs hover:border-emerald-500 transition-all">
                              <div className="bg-emerald-100/80 px-3 py-1.5 border-b border-emerald-200 flex items-center justify-between text-[11px] font-bold text-emerald-950">
                                <span className="flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                                  ચૂકવણી સ્ક્રીનશોટ (Payment Screenshot)
                                </span>
                                <span className="text-[10px] text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-300 font-semibold">
                                  રસીદ ચકાસો
                                </span>
                              </div>

                              <div
                                onClick={() => {
                                  setScreenshotZoom(1);
                                  setScreenshotRotate(0);
                                  setPreviewScreenshotInstructor(inst);
                                }}
                                className="p-2 flex items-center justify-center bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors group relative min-h-[140px]"
                                title="ક્લિક કરી મોટો ફોટો જુઓ (Click to Zoom)"
                              >
                                <img
                                  src={inst.payment_screenshot_url}
                                  alt={`ચૂકવણી રસીદ - ${inst.name}`}
                                  className="max-h-52 w-auto object-contain rounded-lg border border-slate-200 shadow-2xs group-hover:scale-[1.01] transition-transform"
                                />
                                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                  <span className="bg-slate-900/85 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>મોટો જુઓ (Full View)</span>
                                  </span>
                                </div>
                              </div>

                              {/* Action buttons under screenshot */}
                              <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setScreenshotZoom(1);
                                      setScreenshotRotate(0);
                                      setPreviewScreenshotInstructor(inst);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                    <span>મોટો જુઓ (Zoom)</span>
                                  </button>
                                  <a
                                    href={inst.payment_screenshot_url}
                                    download={`payment-receipt-${inst.name.replace(/\s+/g, '_')}.jpg`}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
                                    title="રસીદ ડાઉનલોડ કરો"
                                  >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    <span>ડાઉનલોડ</span>
                                  </a>
                                </div>

                                <label className="inline-flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 cursor-pointer transition-colors">
                                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                                  <span>બદલો</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const compressed = await compressImageFile(file, 1200, 0.82);
                                        handleUpdateInstructorScreenshot(inst, compressed);
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <div className="text-[11px] text-amber-800 bg-amber-100/60 p-2.5 rounded-lg border border-amber-300">
                              ઇન્સ્ટ્રક્ટરે રજીસ્ટ્રેશન સમયે ચૂકવણીનો સ્ક્રીનશોટ અપલોડ કરેલ નથી.
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-dashed border-amber-300 text-center space-y-2">
                              <p className="text-[11px] text-slate-600">
                                જો ઇન્સ્ટ્રક્ટરે WhatsApp અથવા SMS દ્વારા રસીદ મોકલેલ હોય, તો સુપર એડમિન સીધા અહીંથી ફોટો જોડી શકે છે:
                              </p>
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>રસીદનો સ્ક્રીનશોટ અપલોડ કરો (Attach Receipt)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const compressed = await compressImageFile(file, 1200, 0.82);
                                        handleUpdateInstructorScreenshot(inst, compressed);
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateInstructorScreenshot(inst, SAMPLE_UPI_RECEIPT_DATA_URL, '428910482910')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold border border-amber-300 transition-colors"
                                  title="ચકાસણી માટે નમૂના UPI રસીદ જોડો"
                                >
                                  <span>નમૂના રસીદ જોડો</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
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
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>એકાઉન્ટ મંજૂર (Approve)</span>
                        </button>

                        <button
                          onClick={() => handleReject(inst)}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>અસ્વીકાર</span>
                        </button>

                        <button
                          onClick={() => promptDelete(inst)}
                          title="પેન્ડિંગ રજીસ્ટ્રેશન ખાતું કાયમી ડિલીટ કરો (Delete Request)"
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ડિલીટ</span>
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
                    <th className="py-3 px-4">માન્યતા (1 Year Validity)</th>
                    <th className="py-3 px-4 text-right">ક્રિયાઓ (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstructors.map((inst) => {
                    const isApproved = inst.status === 'approved' || !inst.status;
                    const isPending = inst.status === 'pending';
                    const isSuperAdmin = isSuperAdminAccount(inst);
                    const expired = isAccountExpired(inst);

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
                        <td className="py-3 px-4">
                          {isSuperAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              લાઈફટાઈમ (Lifetime)
                            </span>
                          ) : isPending ? (
                            <span className="text-[11px] text-slate-400">મંજૂરીથી ૧ વર્ષ</span>
                          ) : expired ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                મુદત પૂર્ણ (Expired)
                              </span>
                              <div className="text-[10px] text-rose-600 mt-0.5 font-medium">
                                {formatValidityDate(inst.valid_until)}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                <Calendar className="w-3 h-3 text-emerald-600" />
                                {formatValidityDate(inst.valid_until)} સુધી
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                {getValidityRemainingDays(inst)} દિવસ બાકી
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Extend +1 Year for non-admin */}
                            {!isSuperAdmin && isApproved && (
                              <button
                                onClick={() => handleExtendValidity(inst)}
                                title="+૧ વર્ષ માન્યતા લંબાવો (Extend +1 Year)"
                                className="px-2 py-1 rounded-lg text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors shadow-2xs"
                              >
                                <Calendar className="w-3 h-3 text-emerald-600" />
                                <span>+૧ વર્ષ</span>
                              </button>
                            )}
                            {/* Payment Receipt */}
                            {inst.payment_screenshot_url && (
                              <button
                                onClick={() => {
                                  setScreenshotZoom(1);
                                  setScreenshotRotate(0);
                                  setPreviewScreenshotInstructor(inst);
                                }}
                                title="ચૂકવણી સ્ક્રીનશોટ જુઓ (View Receipt)"
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 flex items-center gap-1 transition-colors shadow-2xs"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                                <span>રસીદ</span>
                              </button>
                            )}

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
                                onClick={() => promptDelete(inst)}
                                title="ઇન્સ્ટ્રક્ટર ખાતું કાયમી ડિલીટ કરો (Delete Instructor Account)"
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-colors shadow-2xs"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>ડિલીટ</span>
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

      {/* TAB 3: ALL TRAINEES ACROSS INSTITUTES & TRADES (Super Admin Universal Student Visibility & Management) */}
      {activeTab === 'all-students' && (
        <div className="space-y-4">
          {/* Feedback banner */}
          {traineeActionFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{traineeActionFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setTraineeActionFeedback('')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Controls Bar: Search & Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="વિદ્યાર્થીનું નામ, રોલ નં, રજીસ્ટ્રેશન, ગામ શોધો..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#346739] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Filter by Instructor */}
              <span className="text-xs font-semibold text-slate-500">ઇન્સ્ટ્રક્ટર:</span>
              <select
                value={studentInstructorFilter}
                onChange={(e) => setStudentInstructorFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 max-w-[200px]"
              >
                <option value="ALL">તમામ ઇન્સ્ટ્રક્ટર (All)</option>
                {instructors
                  .filter((i) => i.role !== 'super_admin' && !i.is_guest)
                  .map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.trade || inst.iti_name})
                    </option>
                  ))}
              </select>

              {/* Filter by Trade */}
              <span className="text-xs font-semibold text-slate-500">ટ્રેડ:</span>
              <select
                value={studentTradeFilter}
                onChange={(e) => setStudentTradeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="ALL">તમામ ટ્રેડ (All Trades)</option>
                {Array.from(new Set(trainees.map((t) => t.trade).filter(Boolean))).map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>

              <span className="text-xs font-mono font-bold bg-[#346739] text-[#f2edc2] px-3 py-1 rounded-lg">
                {(() => {
                  const q = studentSearchQuery.toLowerCase();
                  return trainees.filter((t) => {
                    const matchesSearch =
                      !q ||
                      t.student_name.toLowerCase().includes(q) ||
                      t.surname.toLowerCase().includes(q) ||
                      (t.student_name_en && t.student_name_en.toLowerCase().includes(q)) ||
                      t.roll_no.includes(q) ||
                      t.enrollment_no.toLowerCase().includes(q) ||
                      (t.village && t.village.toLowerCase().includes(q));
                    const matchesTrade =
                      studentTradeFilter === 'ALL' || t.trade === studentTradeFilter;
                    const matchesInstructor =
                      studentInstructorFilter === 'ALL' || t.instructor_id === studentInstructorFilter;
                    return matchesSearch && matchesTrade && matchesInstructor;
                  }).length;
                })()}{' '}
                વિદ્યાર્થીઓ
              </span>
            </div>
          </div>

          {/* Trainees Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">રોલ નં / એનરોલમેન્ટ</th>
                    <th className="py-3 px-4">તાલીમાર્થીનું નામ (Trainee Name)</th>
                    <th className="py-3 px-4">ટ્રેડ અને બેચ</th>
                    <th className="py-3 px-4">યુનિટ</th>
                    <th className="py-3 px-4">સંબંધિત ઇન્સ્ટ્રક્ટર / સંસ્થા</th>
                    <th className="py-3 px-4">મોબાઈલ</th>
                    <th className="py-3 px-4">સરનામું</th>
                    <th className="py-3 px-4 text-right">ક્રિયાઓ (Admin Controls)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const q = studentSearchQuery.toLowerCase();
                    const filtered = trainees.filter((t) => {
                      const matchesSearch =
                        !q ||
                        t.student_name.toLowerCase().includes(q) ||
                        t.surname.toLowerCase().includes(q) ||
                        (t.student_name_en && t.student_name_en.toLowerCase().includes(q)) ||
                        t.roll_no.includes(q) ||
                        t.enrollment_no.toLowerCase().includes(q) ||
                        (t.village && t.village.toLowerCase().includes(q));
                      const matchesTrade =
                        studentTradeFilter === 'ALL' || t.trade === studentTradeFilter;
                      const matchesInstructor =
                        studentInstructorFilter === 'ALL' || t.instructor_id === studentInstructorFilter;
                      return matchesSearch && matchesTrade && matchesInstructor;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            કોઈ તાલીમાર્થી મળ્યા નથી.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((t) => {
                      const assignedInst = instructors.find((i) => i.id === t.instructor_id);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">
                              #{t.roll_no}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {t.enrollment_no}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {t.surname} {t.student_name} {t.father_name}
                            </div>
                            {t.student_name_en && (
                              <div className="text-[11px] text-slate-500 font-medium">
                                {t.student_name_en} {t.surname_en}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                              {t.trade}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">{t.batch}</div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700">{t.unit}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">
                              {assignedInst ? assignedInst.name : '—'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                              {assignedInst ? assignedInst.iti_name : 'ITI Gujarat'}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {t.mobile || t.parent_mobile || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={t.address}>
                            {t.village ? `${t.village}, ${t.district}` : t.address}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Trainee */}
                              <button
                                type="button"
                                onClick={() => openEditTrainee(t)}
                                title="વિદ્યાર્થી વિગત સુધારો (Admin Edit)"
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs flex items-center gap-1 border border-blue-200 transition-colors shadow-2xs"
                              >
                                <Edit2 className="w-3 h-3 text-blue-600" />
                                <span>એડિટ</span>
                              </button>
                              {/* Reassign Trainee */}
                              <button
                                type="button"
                                onClick={() => openReassignTrainee(t)}
                                title="ઇન્સ્ટ્રક્ટર અથવા યુનિટ બદલો (Reassign Trainee)"
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-xs flex items-center gap-1 border border-amber-300 transition-colors shadow-2xs"
                              >
                                <Layers className="w-3 h-3 text-amber-700" />
                                <span>રી-અસાઇન</span>
                              </button>
                              {/* Delete Trainee */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSingleTrainee(t)}
                                title="કાયમી ડિલીટ કરો"
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNASSOCIATED TRAINEE CLEANUP TOOL */}
      {activeTab === 'cleanup' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      બિન-સંકળાયેલ તાલીમાર્થી ક્લીનઅપ ટૂલ (Unassociated Trainee Cleanup Tool)
                    </h3>
                    <p className="text-xs text-slate-500">
                      જે તાલીમાર્થીઓ કોઈપણ માન્ય ઇન્સ્ટ્રક્ટર અથવા બેચ સાથે જોડાયેલા નથી તેમની ઓળખ કરી દૂર કરો
                    </p>
                  </div>
                </div>
              </div>

              {orphanTrainees.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedOrphanIds.length === orphanTrainees.length) {
                        setSelectedOrphanIds([]);
                      } else {
                        setSelectedOrphanIds(orphanTrainees.map((t) => t.id));
                      }
                    }}
                    className="px-3.5 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    {selectedOrphanIds.length === orphanTrainees.length
                      ? 'તમામ અનસિલેક્ટ કરો'
                      : `તમામ (${orphanTrainees.length}) પસંદ કરો`}
                  </button>

                  <button
                    type="button"
                    disabled={selectedOrphanIds.length === 0}
                    onClick={handleBulkDeleteOrphans}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>પસંદ કરેલ ડિલીટ કરો ({selectedOrphanIds.length})</span>
                  </button>
                </div>
              )}
            </div>

            {cleanupSuccessMessage && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cleanupSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Orphan Trainees List */}
          {orphanTrainees.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">
                ડેટાબેઝ એકદમ સ્વચ્છ છે! (No Unassociated Trainees Found)
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                રાજ્યના તમામ તાલીમાર્થીઓ યોગ્ય ઇન્સ્ટ્રક્ટર, ટ્રેડ અને બેચ સાથે જોડાયેલા છે. કોઈ અનાથ રેકોર્ડ ઉપલબ્ધ નથી.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  કુલ {orphanTrainees.length} બિન-સંકળાયેલ તાલીમાર્થીઓ મળ્યા
                </span>
                <span className="text-slate-500 text-[11px]">
                  આ તાલીમાર્થીઓનો કોઈ સક્રિય ઇન્સ્ટ્રક્ટર અથવા બેચ નિર્ધારિત નથી
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedOrphanIds.length === orphanTrainees.length && orphanTrainees.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrphanIds(orphanTrainees.map((t) => t.id));
                            } else {
                              setSelectedOrphanIds([]);
                            }
                          }}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                      </th>
                      <th className="py-3 px-4">રોલ નં. / નોંધણી નં.</th>
                      <th className="py-3 px-4">તાલીમાર્થીનું નામ</th>
                      <th className="py-3 px-4">ટ્રેડ અને બેચ વિગત</th>
                      <th className="py-3 px-4">અસાઇન કરેલ ઇન્સ્ટ્રક્ટર ID</th>
                      <th className="py-3 px-4">સમસ્યાનું કારણ</th>
                      <th className="py-3 px-4 text-right">ક્રિયા</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orphanTrainees.map((t) => {
                      const isSelected = selectedOrphanIds.includes(t.id);
                      const hasValidInstructor = t.instructor_id && instructorIdSet.has(t.instructor_id);
                      const hasValidBatch = Boolean(t.batch && t.batch.trim().length > 0 && t.batch !== 'અનિર્ણિત');
                      const hasValidTrade = Boolean(t.trade && t.trade.trim().length > 0 && t.trade !== 'અનિર્ણિત');

                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrphanIds((prev) => [...prev, t.id]);
                                } else {
                                  setSelectedOrphanIds((prev) => prev.filter((id) => id !== t.id));
                                }
                              }}
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-slate-900">{t.roll_no || '—'}</div>
                            <div className="text-[10px] text-slate-500">{t.enrollment_no || t.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {t.student_name} {t.surname}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {t.father_name && `પિતા: ${t.father_name}`}
                              {t.mobile && ` | મો: ${t.mobile}`}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-700">
                              {t.trade || <span className="text-rose-600 italic">ટ્રેડ નથી</span>}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {t.batch || <span className="text-rose-600 italic">બેચ નથી</span>}
                              {t.unit && ` (${t.unit})`}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {t.instructor_id ? (
                              <span className="text-slate-600">{t.instructor_id}</span>
                            ) : (
                              <span className="text-rose-600 italic">કોઈ ID નથી</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              {!hasValidInstructor && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded w-fit">
                                  ઇન્સ્ટ્રક્ટર અસ્તિત્વમાં નથી
                                </span>
                              )}
                              {!hasValidBatch && (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded w-fit">
                                  બેચ વગરનો રેકોર્ડ
                                </span>
                              )}
                              {!hasValidTrade && (
                                <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded w-fit">
                                  ટ્રેડ વગરનો રેકોર્ડ
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSingleDeleteOrphan(t)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs transition-colors border border-rose-200"
                            >
                              ડિલીટ
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: UPI & QR CODE SETTINGS */}
      {activeTab === 'upi-settings' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  UPI એકાઉન્ટ અને QR કોડ સેટિંગ્સ (Editable UPI Configuration)
                </h3>
                <p className="text-xs text-slate-500">
                  ઇન્સ્ટ્રક્ટર નોંધણી અને વેરિફિકેશન સમયે દેખાતો ₹{adminSettings.fee_amount || 49} નો UPI QR કોડ અને ખાતાની વિગતો અહીંથી બદલો
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form & Upload Column */}
            <div className="lg:col-span-7 space-y-5">
              {settingsSaveSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>પેમેન્ટ QR કોડ અને UPI સેટિંગ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા છે!</span>
                </div>
              )}

              {/* CARD 1: ADMIN PAYMENT QR CODE UPLOAD & MANAGEMENT */}
              <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/20 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <span>એડમિન દ્વારા પેમેન્ટ QR કોડ ઉમેરો (Admin Payment QR Code)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ઇન્સ્ટ્રક્ટર્સ ચૂકવણી માટે જે QR કોડ સ્કેન કરશે તે અહીંથી અપલોડ કરી બદલો
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    {settingsQrImageUrl === DEFAULT_ADMIN_QR_IMAGE_URL
                      ? 'ડિફોલ્ટ QR સક્રિય'
                      : 'કસ્ટમ QR સક્રિય'}
                  </span>
                </div>

                {qrUploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{qrUploadError}</span>
                  </div>
                )}

                {/* Upload Action Zone */}
                <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-5 text-center space-y-3 hover:bg-emerald-50/70 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                    <Upload className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      નવો પેમેન્ટ QR કોડ ઉમેરો (Upload or Enter Payment QR Code)
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Google Pay, PhonePe, Paytm અથવા બેંકનો સત્તાવાર QR કોડ ફોટો અપલોડ કરો અથવા ઈમેજ લિંક દાખલ કરો
                    </p>
                  </div>

                  {/* Option A: File Upload */}
                  <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingQr ? 'પ્રોસેસિંગ ચાલુ છે...' : 'QR ફાઇલ પસંદ કરો (Choose Image File)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingQr}
                        onChange={handleQrCodeUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleGenerateDynamicQr}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition-colors shadow-2xs"
                      title="UPI ID અને ફી રકમ પરથી આપમેળે QR બનાવો"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>UPI પરથી નવો QR બનાવો</span>
                    </button>

                    {settingsQrImageUrl !== DEFAULT_ADMIN_QR_IMAGE_URL && (
                      <button
                        type="button"
                        onClick={handleResetDefaultQr}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-500" />
                        <span>ડિફોલ્ટ QR</span>
                      </button>
                    )}

                    <a
                      href={settingsQrImageUrl}
                      download="Admin_Payment_QR_Code.jpg"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors shadow-2xs"
                    >
                      <Download className="w-3 h-3 text-slate-500" />
                      <span>ડાઉનલોડ</span>
                    </a>
                  </div>

                  {/* Option B: Enter Direct QR Image URL */}
                  <div className="pt-2 border-t border-emerald-200/60 max-w-md mx-auto">
                    <label className="block text-[11px] font-bold text-slate-700 text-left mb-1">
                      અથવા સીધી QR ઇમેજ URL લિંક દાખલ કરો (Direct Image URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://... અથવા data:image/png;base64,..."
                        value={settingsQrUrlInput}
                        onChange={(e) => setSettingsQrUrlInput(e.target.value)}
                        className="grow px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleApplyQrUrl}
                        disabled={!settingsQrUrlInput.trim()}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                      >
                        લાગુ કરો
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <span className="text-emerald-700 font-bold shrink-0">💡 નોંધ:</span>
                  <span>
                    સુપર એડમિન દ્વારા અહીં ઉમેરેલ QR કોડ જ તમામ ઇન્સ્ટ્રક્ટર્સને નોંધણી અને વાર્ષિક રિન્યુઅલ સમયે ₹{settingsFeeAmount} ચૂકવવા માટે દેખાશે.
                  </span>
                </div>
              </div>

              {/* CARD 2: UPI ACCOUNT & FEE CREDENTIALS */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>UPI એકાઉન્ટ માહિતી (Payment Gateway Credentials)</span>
                </h4>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (onUpdateAdminSettings) {
                      onUpdateAdminSettings({
                        upi_id: settingsUpiId.trim(),
                        payee_name: settingsPayeeName.trim(),
                        fee_amount: Number(settingsFeeAmount) || 49,
                        payment_instructions: settingsInstructions.trim(),
                        qr_enabled: true,
                        qr_image_url: settingsQrImageUrl,
                        updated_at: new Date().toISOString(),
                      });
                    }
                    setSettingsSaveSuccess(true);
                    setTimeout(() => setSettingsSaveSuccess(false), 3500);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      સુપર એડમિન UPI ID (VPA Address) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsUpiId}
                      onChange={(e) => setSettingsUpiId(e.target.value)}
                      placeholder="દા.ત. tejassuthar21696@okhdfcbank અથવા 9825012345@upi"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#346739] focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      આ UPI આઈડી પર ઇન્સ્ટ્રક્ટર દ્વારા ₹{settingsFeeAmount} ની વેરિફિકેશન ફી સીધી જમા થશે.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ખાતાધારક / પ્રાપ્તકર્તાનું નામ (Payee Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsPayeeName}
                      onChange={(e) => setSettingsPayeeName(e.target.value)}
                      placeholder="દા.ત. Tejas Suthar (Super Admin)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#346739] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        વેરિફિકેશન ફી રકમ (Fee Amount in ₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-bold text-slate-500">₹</span>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          required
                          value={settingsFeeAmount}
                          onChange={(e) => setSettingsFeeAmount(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-[#346739] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        ચલણ (Currency)
                      </label>
                      <input
                        type="text"
                        disabled
                        value="INR (ભારતીય રૂપિયો)"
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ચુકવણી સૂચના (Payment Note / Instructions)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsInstructions}
                      onChange={(e) => setSettingsInstructions(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#346739] focus:bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#346739] hover:bg-[#2b552f] text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>QR કોડ અને UPI સેટિંગ્સ સેવ કરો (Save & Apply Settings)</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Live QR Code Preview Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border-2 border-emerald-500/20 shadow-xs flex flex-col items-center justify-between">
              <div className="w-full text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  સક્રિય QR કોડ પૂર્વાવલોકન (Active QR Code for Instructors)
                </span>
                <UpiQrCode
                  upiId={settingsUpiId}
                  payeeName={settingsPayeeName}
                  amount={Number(settingsFeeAmount) || 49}
                  note={`Verification - ${settingsPayeeName}`}
                  size={210}
                  qrImageUrl={settingsQrImageUrl}
                  isAdminUploaded={Boolean(settingsQrImageUrl)}
                />
              </div>

              <div className="w-full mt-4 space-y-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 text-[11px] space-y-1">
                  <div>• રકમ: <strong className="text-emerald-700 font-bold">₹{settingsFeeAmount}.00</strong></div>
                  <div>• ખાતાધારક: <strong>{settingsPayeeName}</strong></div>
                  <div>• UPI ID: <strong className="font-mono text-slate-900">{settingsUpiId}</strong></div>
                  <div>• સ્થિતિ: <strong className="text-emerald-700">✓ એડમિન QR સક્રિય</strong></div>
                </div>

                <a
                  href={settingsQrImageUrl}
                  download={`Admin_Payment_QR_Code_₹${settingsFeeAmount}.jpg`}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>આ QR કોડ ડાઉનલોડ કરો (Download)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK / SINGLE DELETE MODAL */}
      {confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              તાલીમાર્થી રેકોર્ડ કાયમી ડિલીટ કરો?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              આપ પસંદ કરેલ <strong>{confirmDeleteModal.count}</strong> બિન-સંકળાયેલ તાલીમાર્થીઓને કાયમી ધોરણે સિસ્ટમમાંથી દૂર કરવા માંગો છો?
              આ ક્રિયા પૂર્વવત્ કરી શકાશે નહીં.
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal({ isOpen: false, traineeIds: [], count: 0 })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                રદ કરો (Cancel)
              </button>
              <button
                type="button"
                onClick={executeConfirmedDeletion}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                હા, કાયમી ડિલીટ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW PAYMENT SCREENSHOT MODAL */}
      {previewScreenshotInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 animate-in fade-in max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span>ચૂકવણી સ્ક્રીનશોટ ચકાસણી (Payment Proof)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewScreenshotInstructor.name} ({previewScreenshotInstructor.iti_name})
                  </p>
                </div>
                <button
                  onClick={() => setPreviewScreenshotInstructor(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">રજીસ્ટર્ડ મોબાઈલ</span>
                    <strong className="text-slate-900">{previewScreenshotInstructor.phone}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ચૂકવણી મોબાઈલ</span>
                    <strong className="text-slate-900">{previewScreenshotInstructor.payment_mobile || previewScreenshotInstructor.phone}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">UTR / Ref No</span>
                    <strong className="text-slate-900 font-mono select-all">{previewScreenshotInstructor.payment_utr || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">રકમ</span>
                    <strong className="text-emerald-700 font-bold">₹{previewScreenshotInstructor.payment_amount || adminSettings.fee_amount || 49}</strong>
                  </div>
                </div>

                {previewScreenshotInstructor.payment_screenshot_url ? (
                  <div className="space-y-2">
                    {/* Zoom & Rotate Tool Bar */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-600 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setScreenshotZoom((z) => Math.min(2.5, z + 0.25))}
                          className="p-1 bg-white hover:bg-slate-200 rounded border border-slate-200 text-slate-700"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setScreenshotZoom((z) => Math.max(0.75, z - 0.25))}
                          className="p-1 bg-white hover:bg-slate-200 rounded border border-slate-200 text-slate-700"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotZoom(1);
                            setScreenshotRotate(0);
                          }}
                          className="px-2 py-0.5 bg-white hover:bg-slate-200 rounded border border-slate-200 text-[10px] font-semibold text-slate-700"
                        >
                          રીસેટ ({Math.round(screenshotZoom * 100)}%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setScreenshotRotate((r) => (r + 90) % 360)}
                          className="p-1 bg-white hover:bg-slate-200 rounded border border-slate-200 text-slate-700"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {previewScreenshotInstructor.payment_utr && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(previewScreenshotInstructor.payment_utr || '');
                              setCopiedUtrTarget('modal');
                              setTimeout(() => setCopiedUtrTarget(null), 2000);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedUtrTarget === 'modal' ? 'UTR કોપી થયેલ!' : 'UTR કોપી'}</span>
                          </button>
                        )}
                        <a
                          href={previewScreenshotInstructor.payment_screenshot_url}
                          download={`payment-receipt-${previewScreenshotInstructor.name.replace(/\s+/g, '_')}.jpg`}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 font-semibold"
                          title="રસીદ ડાઉનલોડ કરો"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>ડાઉનલોડ</span>
                        </a>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-900/5 flex items-center justify-center overflow-auto max-h-[55vh]">
                      <img
                        src={previewScreenshotInstructor.payment_screenshot_url}
                        alt="Payment receipt proof"
                        style={{
                          transform: `scale(${screenshotZoom}) rotate(${screenshotRotate}deg)`,
                          transition: 'transform 0.2s ease-in-out',
                        }}
                        className="max-h-[50vh] object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    કોઈ સ્ક્રીનશોટ છબી ઉપલબ્ધ નથી
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setPreviewScreenshotInstructor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                બંધ કરો
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleReject(previewScreenshotInstructor);
                    setPreviewScreenshotInstructor(null);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition-colors"
                >
                  અસ્વીકાર (Reject)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(previewScreenshotInstructor);
                    setPreviewScreenshotInstructor(null);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>ચકાસાયેલ અને મંજૂર કરો (Verify & Approve)</span>
                </button>
              </div>
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
                    list="admin-desig-options"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                  <datalist id="admin-desig-options">
                    {STANDARD_DESIGNATIONS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const generated = generateRandomStrongPassword();
                        setFormPassword(generated);
                        setShowPassword(true);
                      }}
                      className="text-[10px] font-bold text-[#346739] hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                    >
                      <KeyRound className="w-3 h-3 text-emerald-600" />
                      <span>ઓટો-જનરેટ</span>
                    </button>
                    <span className="text-[10px] text-slate-500">NIST ધોરણ</span>
                  </div>
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
                  સંસ્થાનું નામ (ITI Institute Name) *
                </label>
                <input
                  type="text"
                  required
                  list="admin-iti-options"
                  value={formItiName}
                  onChange={(e) => setFormItiName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
                <datalist id="admin-iti-options">
                  {GUJARAT_ITIS.map((iti) => (
                    <option key={iti} value={iti} />
                  ))}
                </datalist>
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
                      list="admin-trade-options"
                      value={formTrade}
                      onChange={(e) => setFormTrade(e.target.value)}
                      placeholder="કોપા (COPA)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <datalist id="admin-trade-options">
                      {COMMON_TRADES.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">બેચ</label>
                    <input
                      type="text"
                      required
                      list="admin-batch-options"
                      value={formBatch}
                      onChange={(e) => setFormBatch(e.target.value)}
                      placeholder="૨૦૨૫–૨૦૨૬"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <datalist id="admin-batch-options">
                      {ACADEMIC_BATCHES.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">યુનિટ</label>
                    <input
                      type="text"
                      required
                      list="admin-unit-options"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="Unit A"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <datalist id="admin-unit-options">
                      {STANDARD_UNITS.map((u) => (
                        <option key={u} value={u} />
                      ))}
                    </datalist>
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
                  Portal Super Administrator Security
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
                <div className="font-semibold text-slate-900 text-xs">તેજસ સુથાર (Portal Super Admin)</div>
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
                    <KeyRound className="w-3 h-3 text-amber-700" />
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

      {/* INSTRUCTOR REMOVAL / DELETE CONFIRMATION MODAL */}
      {deleteTargetInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-center font-black text-slate-900 text-base mb-1">
              ઇન્સ્ટ્રક્ટર ખાતું ડિલીટ કરવું છે?
            </h3>
            <p className="text-center text-xs text-slate-500 mb-4">
              આ પ્રક્રિયા દ્વારા ઇન્સ્ટ્રક્ટરનું ખાતું કાયમી ધોરણે રદ થશે.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 mb-4">
              <div className="font-bold text-slate-900 text-sm">{deleteTargetInstructor.name}</div>
              <div className="text-[11px] text-slate-600">
                {deleteTargetInstructor.designation} • {deleteTargetInstructor.iti_name}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <span>ઈમેલ: <span className="font-mono text-slate-800">{deleteTargetInstructor.email}</span></span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>મોબાઈલ: <span className="font-mono text-blue-700 font-bold">{deleteTargetInstructor.phone}</span></span>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] mb-5 space-y-1">
              <div className="font-bold flex items-center gap-1 text-rose-900">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>કાયમી નિકાલની ચેતવણી (Permanent Removal)</span>
              </div>
              <div>
                આ ઇન્સ્ટ્રક્ટરનું લોગિન, પ્રોફાઇલ અને ક્લાઉડ ડેટાબેઝ રેકોર્ડ રદ થશે. તેઓ પોર્ટલ એક્સેસ કરી શકશે નહીં.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetInstructor(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                રદ કરો (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>હા, ખાતું ડિલીટ કરો</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEWLY ADDED INSTRUCTOR CREDENTIALS NOTIFICATION MODAL */}
      {newlyAddedInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-center font-black text-slate-900 text-base mb-1">
              નવા ઇન્સ્ટ્રક્ટર સફળતાપૂર્વક ઉમેરાયા!
            </h3>
            <p className="text-center text-xs text-slate-500 mb-4">
              ખાતું ક્લાઉડ ડેટાબેઝમાં સાચવી લેવાયું છે. ક્રેડેન્શિયલ્સ શેર કરો:
            </p>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 mb-4">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">ઇન્સ્ટ્રક્ટર:</span>
                <span className="font-bold text-slate-900">{newlyAddedInstructor.instructor.name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">સંસ્થા:</span>
                <span className="font-semibold text-slate-800">{newlyAddedInstructor.instructor.iti_name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">લોગિન ઈમેલ:</span>
                <span className="font-mono text-slate-900 font-bold">{newlyAddedInstructor.instructor.email}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">લોગિન મોબાઈલ:</span>
                <span className="font-mono text-blue-700 font-bold">{newlyAddedInstructor.instructor.phone}</span>
              </div>
              {newlyAddedInstructor.plainPassword && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">પાસવર્ડ:</span>
                  <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                    {newlyAddedInstructor.plainPassword}
                  </span>
                </div>
              )}
            </div>

            {/* Copy & WhatsApp buttons */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  const portalUrl = window.location.origin;
                  const text = `ITI Trainee Attendance Portal - લૉગિન ક્રેડેન્શિયલ્સ:\n\nઇન્સ્ટ્રક્ટર: ${newlyAddedInstructor.instructor.name}\nઈમેલ ID: ${newlyAddedInstructor.instructor.email}\nમોબાઈલ નંબર: ${newlyAddedInstructor.instructor.phone}\nપાસવર્ડ: ${newlyAddedInstructor.plainPassword || '(પહેલેથી સેટ કરેલ)'}\nપોર્ટલ લિંક: ${portalUrl}\n\nકૃપા કરીને આ ક્રેડેન્શિયલ્સ વડે પોર્ટલમાં લોગિન કરો.`;
                  navigator.clipboard.writeText(text);
                  setCopiedNewCredentials(true);
                  setTimeout(() => setCopiedNewCredentials(false), 3000);
                }}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedNewCredentials ? 'કોપી થઈ ગયું!' : 'ક્રેડેન્શિયલ્સ કોપી'}</span>
              </button>

              <a
                href={`https://wa.me/91${cleanPhoneNumber(newlyAddedInstructor.instructor.phone)}?text=${encodeURIComponent(
                  `નમસ્તે ${newlyAddedInstructor.instructor.name},\n\nઆપનું ITI Trainee Attendance Portal પર ખાતું સુપર એડમિન દ્વારા સફળતાપૂર્વક સક્રિય કરવામાં આવ્યું છે.\n\nલોગિન આઈડી (મોબાઈલ): ${newlyAddedInstructor.instructor.phone}\nલોગિન આઈડી (ઈમેલ): ${newlyAddedInstructor.instructor.email}\nપાસવર્ડ: ${newlyAddedInstructor.plainPassword || ''}\nપોર્ટલ લિંક: ${window.location.origin}\n\nકૃપા કરીને પોર્ટલમાં લોગિન કરી તાલીમાર્થીઓનું સંચાલન શરૂ કરો.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>વોટ્સએપ પર મોકલો</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setNewlyAddedInstructor(null)}
              className="w-full py-2.5 px-4 bg-[#346739] hover:bg-[#264e2b] text-[#f2edc2] font-bold rounded-xl text-xs transition-colors"
            >
              પૂર્ણ થયું (Done)
            </button>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: EDIT TRAINEE MODAL */}
      {editingTrainee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                  <span>તાલીમાર્થી વિગતો સુધારો (Admin Edit Student)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  #{editingTrainee.roll_no} • {editingTrainee.enrollment_no}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTrainee(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTraineeSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">અટક (ગુજરાતી) *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.surname || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, surname: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">વિદ્યાર્થીનું નામ (ગુજરાતી) *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.student_name || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, student_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">પિતાનું નામ (ગુજરાતી) *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.father_name || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, father_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">દાદાનું નામ (ગુજરાતી)</label>
                  <input
                    type="text"
                    value={editTraineeForm.grandfather_name || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, grandfather_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Surname (English) *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.surname_en || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, surname_en: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.student_name_en || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, student_name_en: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Father Name (English)</label>
                  <input
                    type="text"
                    value={editTraineeForm.father_name_en || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, father_name_en: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">રોલ નંબર *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.roll_no || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, roll_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">નોંધણી ક્રમાંક (Enrollment) *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.enrollment_no || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, enrollment_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ટ્રેડ *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.trade || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, trade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">બેચ *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.batch || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, batch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">યુનિટ *</label>
                  <input
                    type="text"
                    required
                    value={editTraineeForm.unit || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">તાલીમાર્થી મોબાઈલ નંબર</label>
                  <input
                    type="tel"
                    value={editTraineeForm.mobile || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">વાલીનો મોબાઈલ નંબર</label>
                  <input
                    type="tel"
                    value={editTraineeForm.parent_mobile || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, parent_mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">સરનામું</label>
                <input
                  type="text"
                  value={editTraineeForm.address || ''}
                  onChange={(e) => setEditTraineeForm({ ...editTraineeForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ગામ / શહેર</label>
                  <input
                    type="text"
                    value={editTraineeForm.village || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, village: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">તાલુકો</label>
                  <input
                    type="text"
                    value={editTraineeForm.taluka || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, taluka: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">જિલ્લો</label>
                  <input
                    type="text"
                    value={editTraineeForm.district || ''}
                    onChange={(e) => setEditTraineeForm({ ...editTraineeForm, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTrainee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#346739] hover:bg-[#28522c] text-white font-bold rounded-xl shadow-xs"
                >
                  સુધારો સાચવો (Save Changes)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: REASSIGN TRAINEE MODAL */}
      {reassigningTrainee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-700" />
                  <span>ઇન્સ્ટ્રક્ટર / યુનિટ પુનઃ ફાળવણી (Reassign)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {reassigningTrainee.student_name} {reassigningTrainee.surname} (#{reassigningTrainee.roll_no})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReassigningTrainee(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReassignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  નવા ઇન્સ્ટ્રક્ટર પસંદ કરો (Target Instructor) *
                </label>
                <select
                  required
                  value={reassignTargetInstructorId}
                  onChange={(e) => {
                    const instId = e.target.value;
                    setReassignTargetInstructorId(instId);
                    const target = instructors.find((i) => i.id === instId);
                    if (target) {
                      setReassignTargetTrade(target.trade || reassigningTrainee.trade);
                      setReassignTargetBatch(target.batch || reassigningTrainee.batch);
                      setReassignTargetUnit(target.unit || 'Unit A');
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="">ઇન્સ્ટ્રક્ટર પસંદ કરો...</option>
                  {instructors
                    .filter((i) => i.role !== 'super_admin' && !i.is_guest)
                    .map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.trade} - {inst.iti_name})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ટ્રેડ *</label>
                <input
                  type="text"
                  required
                  value={reassignTargetTrade}
                  onChange={(e) => setReassignTargetTrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">બેચ *</label>
                  <input
                    type="text"
                    required
                    value={reassignTargetBatch}
                    onChange={(e) => setReassignTargetBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">યુનિટ *</label>
                  <input
                    type="text"
                    required
                    value={reassignTargetUnit}
                    onChange={(e) => setReassignTargetUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReassigningTrainee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  પુનઃ ફાળવણી કન્ફર્મ કરો (Confirm Reassign)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE PERSISTENT BOTTOM NAVIGATION BAR FOR SUPER ADMIN */}
      <nav
        aria-label="Super Admin Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg print:hidden"
      >
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-h-[48px] min-w-[56px] ${
            activeTab === 'pending'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">મંજૂરીઓ</span>
          {pendingInstructors.length > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
              {pendingInstructors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] min-w-[56px] ${
            activeTab === 'all'
              ? 'text-[#346739] font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">ઇન્સ્ટ્રક્ટર્સ</span>
        </button>

        <button
          onClick={() => setActiveTab('all-students')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] min-w-[56px] ${
            activeTab === 'all-students'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">વિદ્યાર્થીઓ</span>
        </button>

        <button
          onClick={() => setActiveTab('cleanup')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-h-[48px] min-w-[56px] ${
            activeTab === 'cleanup'
              ? 'text-rose-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserX className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">ક્લીનઅપ</span>
          {orphanTrainees.length > 0 && (
            <span className="absolute top-0.5 right-2 w-3.5 h-3.5 bg-rose-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center ring-1 ring-white">
              !
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('upi-settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] min-w-[56px] ${
            activeTab === 'upi-settings'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">UPI / QR</span>
        </button>
      </nav>
    </div>
  );
}
