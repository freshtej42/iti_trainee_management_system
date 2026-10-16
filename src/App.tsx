import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Instructor,
  Trainee,
  AttendanceRecord,
  LetterTemplate,
  DispatchLog,
  SuperAdminSettings,
} from './types';
import {
  INITIAL_INSTRUCTORS,
  INITIAL_TRAINEES,
  INITIAL_ATTENDANCE,
  INITIAL_TEMPLATES,
  INITIAL_DISPATCH_LOGS,
} from './data/initialData';
import {
  seedFirestoreIfEmpty,
  fetchInstructors,
  fetchTrainees,
  fetchAttendance,
  fetchTemplates,
  fetchDispatchLogs,
  saveTemplateToCloud,
  saveDispatchLogToCloud,
  saveBatchDispatchLogsToCloud,
  deleteDispatchLogFromCloud,
  deleteBatchDispatchLogsFromCloud,
  subscribeToDispatchLogs,
  saveInstructorToCloud,
  saveTraineeToCloud,
  deleteTraineeFromCloud,
  saveBatchTraineesToCloud,
  deleteInstructorFromCloud,
  deleteTemplateFromCloud,
  fetchAdminSettings,
  saveAdminSettingsToCloud,
  deleteBatchTraineesFromCloud,
  DEFAULT_ADMIN_SETTINGS,
  deduplicateInstructors,
} from './services/dataService';

import Header, { ActiveTab } from './components/Header';
import InstructorProfileModal from './components/InstructorProfileModal';
import AttendanceTracker from './components/AttendanceTracker';
import TraineeManager from './components/TraineeManager';
import { PaymentVerificationModal } from './components/PaymentVerificationModal';
import DispatchHistory from './components/DispatchHistory';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import BatchNoticeModal from './components/BatchNoticeModal';
import InstructorAuth from './components/InstructorAuth';
import BatchUnitManagerModal from './components/BatchUnitManagerModal';
import { isStudentAssignedToInstructor } from './utils/academicHelpers';
import AcademicHierarchyManager from './components/AcademicHierarchyManager';
import TemplateStudio from './components/TemplateStudio';
import ReportGenerator from './components/ReportGenerator';
import { HeaderConfig } from './types';
import { Calendar, Eye, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { isAccountExpired, formatValidityDate } from './utils/validityHelper';

export default function App() {
  // Multi-Tenant Data States
  const [instructors, setInstructors] = useState<Instructor[]>(() =>
    deduplicateInstructors(INITIAL_INSTRUCTORS)
  );
  const [currentInstructorId, setCurrentInstructorId] = useState<string>(() => {
    const storedAuth = localStorage.getItem('iti_auth_authenticated');
    const storedId = localStorage.getItem('iti_auth_instructor_id');
    if (storedAuth === 'true' && storedId) return storedId;
    return '';
  });
  const [trainees, setTrainees] = useState<Trainee[]>(INITIAL_TRAINEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [templates, setTemplates] = useState<LetterTemplate[]>(INITIAL_TEMPLATES);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>(INITIAL_DISPATCH_LOGS);
  const [adminSettings, setAdminSettings] = useState<SuperAdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Load from Firestore on mount
  const syncFromCloud = useCallback(async () => {
    try {
      await seedFirestoreIfEmpty();

      const [insts, trns, atts, tmpls, logs, settings] = await Promise.all([
        fetchInstructors(),
        fetchTrainees(),
        fetchAttendance(),
        fetchTemplates(),
        fetchDispatchLogs(),
        fetchAdminSettings(),
      ]);

      if (settings) {
        setAdminSettings(settings);
      }

      if (insts && insts.length > 0) {
        // Ensure Super Admin Tejas Suthar (tejassuthar21696@gmail.com) is in the instructor list and marked approved
        const superAdminInst = INITIAL_INSTRUCTORS.find((i) => i.role === 'super_admin') || INITIAL_INSTRUCTORS[0];
        const hasSuperAdmin = insts.some(
          (i) =>
            i.role === 'super_admin' ||
            (i.email && i.email.toLowerCase() === 'tejassuthar21696@gmail.com') ||
            (i.phone && i.phone === '9825012345')
        );

        const listToSet = !hasSuperAdmin && superAdminInst ? [superAdminInst, ...insts] : insts;
        if (!hasSuperAdmin && superAdminInst) {
          saveInstructorToCloud(superAdminInst).catch(console.warn);
        }
        setInstructors(deduplicateInstructors(listToSet));
      }
      if (trns && trns.length > 0) setTrainees(trns);
      if (atts && atts.length > 0) setAttendanceRecords(atts);
      if (tmpls && tmpls.length > 0) setTemplates(tmpls);
      if (logs && logs.length > 0) setDispatchLogs(logs);
    } catch (err) {
      console.warn('Firestore initial sync encountered error, running with cached data:', err);
    }
  }, []);

  useEffect(() => {
    syncFromCloud();

    // Listen for real-time dispatch updates
    const unsubscribe = subscribeToDispatchLogs((cloudLogs) => {
      if (cloudLogs && cloudLogs.length > 0) {
        setDispatchLogs(cloudLogs);
      }
    });

    return () => unsubscribe();
  }, [syncFromCloud]);

  // UI Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');
  const [activeTemplateId, setActiveTemplateId] = useState<string>(INITIAL_TEMPLATES[0].id);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(INITIAL_TRAINEES[0].id);

  // Modals & Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem('iti_auth_authenticated');
    const storedId = localStorage.getItem('iti_auth_instructor_id');
    return storedAuth === 'true' && Boolean(storedId);
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchUnitModalOpen, setIsBatchUnitModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Current active instructor
  const currentInstructor = useMemo(() => {
    return (
      instructors.find((i) => i.id === currentInstructorId) || instructors[0]
    );
  }, [instructors, currentInstructorId]);

  const isSuperAdmin = currentInstructor.role === 'super_admin';
  const isGuest = Boolean(
    currentInstructor.is_guest ||
    currentInstructor.role === 'guest' ||
    currentInstructor.id === 'guest-demo-instructor'
  );

  const [guestActionBlockedNotice, setGuestActionBlockedNotice] = useState<string | null>(null);

  const notifyGuestBlocked = (actionMsg?: string) => {
    setGuestActionBlockedNotice(
      actionMsg ||
        'આ ડેમો એકાઉન્ટ (Guest Mode) છે. પોર્ટલની સુવિધાઓ ચકાસવા માટે ડેમો ડેટા સુરક્ષિત રાખવામાં આવ્યો છે. ગેસ્ટ યુઝર ડેટાબેઝમાં રેકોર્ડ ઉમેરી, સુધારી કે ડિલીટ કરી શકતા નથી.'
    );
  };

  // Strict role isolation: Super Admin is locked to 'admin' console; Instructors never access 'admin'
  useEffect(() => {
    if (isSuperAdmin && activeTab !== 'admin') {
      setActiveTab('admin');
    } else if (!isSuperAdmin && activeTab === 'admin') {
      setActiveTab('attendance');
    } else if (activeTab === 'principal-report') {
      const prinTmpl = templates.find(
        (t) =>
          t.notice_type === 'Report' ||
          /આચાર્ય|principal|અહેવાલ/i.test(t.template_name || '')
      );
      if (prinTmpl) {
        setActiveTemplateId(prinTmpl.id);
      }
      setActiveTab('report');
    }
  }, [isSuperAdmin, activeTab, templates]);

  // Current instructor's isolated trainees:
  // - Super Admin can view all students across all trades and institutes.
  // - Instructors can view ONLY students assigned to them matching trade, batch, and unit.
  const instructorTrainees = useMemo(() => {
    if (isSuperAdmin || currentInstructor.role === 'super_admin') {
      return trainees;
    }
    return trainees.filter((t) => isStudentAssignedToInstructor(t, currentInstructor));
  }, [trainees, currentInstructor, isSuperAdmin]);

  const [traineeFilterPreset, setTraineeFilterPreset] = useState<{
    trade?: string;
    batch?: string;
    unit?: string;
  } | null>(null);

  // Low attendance count for current instructor (<80%)
  const lowAttendanceCount = useMemo(() => {
    const traineeIds = new Set(instructorTrainees.map((t) => t.id));
    return attendanceRecords.filter(
      (r) => traineeIds.has(r.trainee_id) && r.attendance_percentage < 80.0
    ).length;
  }, [attendanceRecords, instructorTrainees]);

  // --- Auth Handlers ---
  const handleInstructorLogin = (inst: Instructor) => {
    setCurrentInstructorId(inst.id);
    setIsAuthenticated(true);
    localStorage.setItem('iti_auth_authenticated', 'true');
    localStorage.setItem('iti_auth_instructor_id', inst.id);
    if (inst.role === 'super_admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('attendance');
    }
  };

  const handleVerifyInstructorEmail = async (instructorId: string) => {
    setInstructors((prev) =>
      prev.map((inst) => (inst.id === instructorId ? { ...inst, email_verified: true } : inst))
    );
    const target = instructors.find((i) => i.id === instructorId);
    if (target) {
      await saveInstructorToCloud({ ...target, email_verified: true });
    }
  };

  const handleInstructorRegister = async (newInst: Omit<Instructor, 'id' | 'created_at'> & { id?: string }) => {
    const created: Instructor = {
      ...newInst,
      id: newInst.id || `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      batches: newInst.batches || [newInst.batch || '૨૦૨૫–૨૦૨૬'],
      units: newInst.units || ['Unit A', 'Unit B', 'Unit C'],
      created_at: new Date().toISOString(),
    };
    setInstructors((prev) => deduplicateInstructors([created, ...prev]));
    // Save to Cloud Firestore so Super Admin sees it in pending approvals
    await saveInstructorToCloud(created);
  };

  const handleInstructorLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('iti_auth_authenticated', 'false');
    localStorage.removeItem('iti_auth_instructor_id');
    setCurrentInstructorId('');
  };

  const handleUpdateInstructor = async (updated: Instructor) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં પ્રોફાઇલ વિગતો સાચવી શકાતી નથી (Profile changes cannot be saved in Demo Mode).');
      return;
    }
    setInstructors((prev) => {
      const exists = prev.some(
        (i) => i.id === updated.id || (i.email && i.email === updated.email) || (i.phone && i.phone === updated.phone)
      );
      if (!exists) {
        return deduplicateInstructors([updated, ...prev]);
      }
      return deduplicateInstructors(
        prev.map((i) =>
          i.id === updated.id || (i.email && i.email === updated.email) || (i.phone && i.phone === updated.phone)
            ? { ...i, ...updated, id: i.id }
            : i
        )
      );
    });
    await saveInstructorToCloud(updated);
  };

  // 1. Trainee Handlers
  const handleAddTrainee = async (newTrainee: Omit<Trainee, 'id' | 'created_at'>) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં નવા તાલીમાર્થી ઉમેરી શકાતા નથી (Adding trainees is disabled in Demo Mode).');
      return;
    }
    const created: Trainee = {
      ...newTrainee,
      id: `trainee-${Date.now()}`,
      instructor_id: currentInstructorId || newTrainee.instructor_id,
      trade: newTrainee.trade || currentInstructor.trade,
      batch: newTrainee.batch || currentInstructor.batch,
      unit: newTrainee.unit || currentInstructor.unit || 'Unit A',
      created_at: new Date().toISOString(),
    };
    setTrainees((prev) => [created, ...prev]);
    await saveTraineeToCloud(created);
  };

  const handleUpdateTrainee = async (updated: Trainee) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં તાલીમાર્થીની વિગતો બદલી શકાતી નથી (Updating trainees is disabled in Demo Mode).');
      return;
    }
    setTrainees((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    await saveTraineeToCloud(updated);
  };

  const handleDeleteTrainee = async (id: string) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં તાલીમાર્થી ડિલીટ કરી શકાતા નથી (Deleting trainees is disabled in Demo Mode).');
      return;
    }
    setTrainees((prev) => prev.filter((t) => t.id !== id));
    await deleteTraineeFromCloud(id);
  };

  const handleBatchDeleteTrainees = async (ids: string[]) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં રેકોર્ડ્સ ડિલીટ કરી શકાતા નથી (Deleting trainees is disabled in Demo Mode).');
      return;
    }
    setTrainees((prev) => prev.filter((t) => !ids.includes(t.id)));
    await deleteBatchTraineesFromCloud(ids);
  };

  const handleUpdateAdminSettings = async (settings: SuperAdminSettings) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં એડમિન સેટિંગ્સ બદલી શકાતા નથી.');
      return;
    }
    setAdminSettings(settings);
    await saveAdminSettingsToCloud(settings);
  };

  const handleAssignTraineesToUnit = async (
    traineeIds: string[],
    trade: string,
    batch: string,
    unit: string
  ) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં યુનિટ ફાળવણી બદલી શકાતી નથી.');
      return;
    }
    const updated = trainees.map((t) => {
      if (traineeIds.includes(t.id)) {
        return {
          ...t,
          trade,
          batch,
          unit,
          instructor_id: currentInstructorId || t.instructor_id,
        };
      }
      return t;
    });
    setTrainees(updated);
    for (const tid of traineeIds) {
      const t = updated.find((item) => item.id === tid);
      if (t) await saveTraineeToCloud(t);
    }
  };

  const handleImportTrainees = async (
    newTrainees: Trainee[],
    newAttendance: AttendanceRecord[]
  ) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં એક્સેલ ફાઈલ ઈમ્પોર્ટ અક્ષમ છે (Excel Import is disabled in Demo Mode).');
      return;
    }
    // Automatically tag imported students to current instructor profile and active trade/batch/unit if missing
    const taggedTrainees = newTrainees.map((t) => ({
      ...t,
      instructor_id: currentInstructorId || t.instructor_id,
      trade: t.trade || currentInstructor.trade,
      batch: t.batch || currentInstructor.batch,
      unit: t.unit || currentInstructor.unit || 'Unit A',
    }));

    setTrainees((prev) => [...taggedTrainees, ...prev]);
    if (newAttendance && newAttendance.length > 0) {
      const taggedAttendance = newAttendance.map((a) => ({
        ...a,
        instructor_id: currentInstructorId || a.instructor_id,
      }));
      setAttendanceRecords((prev) => [...taggedAttendance, ...prev]);
      await saveBatchTraineesToCloud(taggedTrainees, taggedAttendance);
    } else {
      await saveBatchTraineesToCloud(taggedTrainees, []);
    }
  };

  // 2. Attendance Handlers
  const handleUpdateAttendance = (records: AttendanceRecord[]) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં હાજરી રેકોર્ડ ડેટાબેઝમાં સાચવી શકાતો નથી (Saving attendance is disabled in Demo Mode).');
      return;
    }
    setAttendanceRecords((prev) => {
      const recordMap = new Map<string, AttendanceRecord>();
      prev.forEach((r) => recordMap.set(r.id, r));
      records.forEach((r) => recordMap.set(r.id, r));
      return Array.from(recordMap.values());
    });
  };

  const handleDraftNotice = (trainee: Trainee, record: AttendanceRecord) => {
    setSelectedTraineeId(trainee.id);
    setActiveTab('editor');
  };

  const handleBulkDraft = (flaggedList: { trainee: Trainee; record: AttendanceRecord }[]) => {
    setIsBatchModalOpen(true);
  };

  // 3. Dispatch Handlers
  const handleLogDispatch = async (newLog: Omit<DispatchLog, 'id' | 'created_at'>) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં જાવક રજિસ્ટરમાં નવી નોંધ ઉમેરી શકાતી નથી (Adding dispatch logs is disabled in Demo Mode).');
      return;
    }
    const created: DispatchLog = {
      ...newLog,
      id: `disp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setDispatchLogs((prev) => [created, ...prev]);
    // Persist to Cloud Firestore
    await saveDispatchLogToCloud(created);
  };

  const handleBatchLogDispatch = async (logs: Omit<DispatchLog, 'id' | 'created_at'>[]) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં જાવક રજિસ્ટરમાં બેચ નોંધ ઉમેરી શકાતી નથી (Batch dispatch logs disabled in Demo Mode).');
      return;
    }
    const createdLogs: DispatchLog[] = logs.map((l, idx) => ({
      ...l,
      id: `disp-batch-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
    }));
    setDispatchLogs((prev) => [...createdLogs, ...prev]);
    // Persist batch to Cloud Firestore
    await saveBatchDispatchLogsToCloud(createdLogs);
  };

  const handleUpdateDispatchStatus = async (logId: string, newStatus: DispatchLog['status']) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં રવાનગી સ્ટેટસ બદલી શકાતું નથી (Updating dispatch status is disabled in Demo Mode).');
      return;
    }
    setDispatchLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: newStatus } : l))
    );
    const existing = dispatchLogs.find((l) => l.id === logId);
    if (existing) {
      await saveDispatchLogToCloud({ ...existing, status: newStatus });
    }
  };

  const handleUpdateDispatchLog = async (updatedLog: DispatchLog) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં જાવક નોંધ સુધારી શકાતી નથી (Editing dispatch logs is disabled in Demo Mode).');
      return;
    }
    setDispatchLogs((prev) =>
      prev.map((l) => (l.id === updatedLog.id ? updatedLog : l))
    );
    await saveDispatchLogToCloud(updatedLog);
  };

  const handleDeleteDispatchLog = async (logId: string) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં જાવક નોંધ ડિલીટ કરી શકાતી નથી (Deleting dispatch logs is disabled in Demo Mode).');
      return;
    }
    setDispatchLogs((prev) => prev.filter((l) => l.id !== logId));
    await deleteDispatchLogFromCloud(logId);
  };

  const handleBatchDeleteDispatchLogs = async (logIds: string[]) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં જાવક નોંધ ડિલીટ કરી શકાતી નથી (Deleting dispatch logs is disabled in Demo Mode).');
      return;
    }
    setDispatchLogs((prev) => prev.filter((l) => !logIds.includes(l.id)));
    await deleteBatchDispatchLogsFromCloud(logIds);
  };

  const handleCreateDispatchLog = async (newLog: Omit<DispatchLog, 'id' | 'created_at'>) => {
    await handleLogDispatch(newLog);
  };

  // 4. Template Handlers
  const handleSaveTemplate = async (updated: LetterTemplate) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં ટેમ્પલેટ સેવ કરી શકાતી નથી (Saving templates is disabled in Demo Mode).');
      return;
    }
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === updated.id);
      if (exists) {
        return prev.map((t) => (t.id === updated.id ? updated : t));
      }
      return [updated, ...prev];
    });
    await saveTemplateToCloud(updated);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં ટેમ્પલેટ ડિલીટ કરી શકાતી નથી (Deleting templates is disabled in Demo Mode).');
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    await deleteTemplateFromCloud(templateId);
  };

  const handleUpdateInstructorHeader = async (headerConfig: HeaderConfig) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં લેટરહેડ સેટિંગ્સ સાચવી શકાતા નથી (Updating letterhead is disabled in Demo Mode).');
      return;
    }
    const updated: Instructor = {
      ...currentInstructor,
      header_config: headerConfig,
      letterhead_html: headerConfig.letterhead_html ?? currentInstructor.letterhead_html,
    };
    await handleUpdateInstructor(updated);
  };

  // 5. Tenant Handlers
  const handleAddInstructor = async (inst: Omit<Instructor, 'id' | 'created_at'> | Instructor) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં ઇન્સ્ટ્રક્ટર ખાતું ઉમેરી શકાતું નથી.');
      return;
    }
    const created: Instructor = {
      ...inst,
      id: 'id' in inst && inst.id ? inst.id : `inst-${Date.now()}`,
      batches: inst.batches || [inst.batch || '૨૦૨૫–૨૦૨૬'],
      units: inst.units || [inst.unit || 'Unit A'],
      trades: inst.trades || [inst.trade || 'કોપા (COPA)'],
      academic_hierarchy: inst.academic_hierarchy || [
        {
          id: `tr-${Date.now()}`,
          name: inst.trade || 'કોપા (COPA)',
          batches: [
            {
              id: `b-${Date.now()}`,
              name: inst.batch || '૨૦૨૫–૨૦૨૬',
              units: [{ id: `u-${Date.now()}`, name: inst.unit || 'Unit A' }],
            },
          ],
        },
      ],
      created_at: new Date().toISOString(),
    };
    setInstructors((prev) => [created, ...prev]);
    await saveInstructorToCloud(created);
  };

  const handleDeleteInstructor = async (id: string) => {
    if (isGuest) {
      notifyGuestBlocked('ડેમો મોડમાં ઇન્સ્ટ્રક્ટર ખાતું ડિલીટ કરી શકાતું નથી.');
      return;
    }
    setInstructors((prev) => prev.filter((i) => i.id !== id));
    await deleteInstructorFromCloud(id);
    if (currentInstructorId === id) {
      const remaining = instructors.filter((i) => i.id !== id);
      if (remaining.length > 0) {
        setCurrentInstructorId(remaining[0].id);
      }
    }
  };

  const handleSelectTraineeForNotice = (traineeId: string, templateId?: string) => {
    setSelectedTraineeId(traineeId);
    if (templateId) {
      setActiveTemplateId(templateId);
    }
    setActiveTab('report');
  };

  // If instructor is logged out or visiting auth screen
  if (!isAuthenticated) {
    return (
      <InstructorAuth
        instructors={instructors}
        adminSettings={adminSettings}
        onLogin={handleInstructorLogin}
        onRegister={handleInstructorRegister}
        onVerifyEmail={handleVerifyInstructorEmail}
        onUpdateInstructor={handleUpdateInstructor}
      />
    );
  }

  // Check if current user's account is pending approval (non-super-admin)
  const isSuperAdminUser =
    currentInstructor.role === 'super_admin' ||
    currentInstructor.email === 'tejassuthar21696@gmail.com';

  if (!isGuest && currentInstructor.status === 'pending' && !isSuperAdminUser) {
    return (
      <div className="min-h-screen bg-[#f7f9f6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <span className="text-2xl font-black">⏳</span>
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">
              ખાતું મંજૂરી માટે પેન્ડિંગ છે (Pending Super Admin Approval)
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              નમસ્તે <strong>{currentInstructor.name}</strong>, આપનું ઇન્સ્ટ્રક્ટર રજીસ્ટ્રેશન પ્રાપ્ત થયું છે. સુપર એડમિન (<strong>tejassuthar21696@gmail.com</strong>) દ્વારા આપના એકાઉન્ટનું વેરિફિકેશન પ્રક્રિયામાં છે.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs space-y-1.5 text-amber-950">
            <div>• રજીસ્ટર્ડ મોબાઈલ: <strong>{currentInstructor.phone}</strong></div>
            <div>• ઈમેલ આઈડી: <strong>{currentInstructor.email}</strong></div>
            <div>• સંસ્થા: <strong>{currentInstructor.iti_name}</strong></div>
            {currentInstructor.payment_utr && (
              <div>• સબમિટ કરેલ UTR / Ref ID: <strong className="font-mono text-slate-900">{currentInstructor.payment_utr}</strong></div>
            )}
            <div className="pt-2 border-t border-amber-200">
              {currentInstructor.payment_screenshot_url ? (
                <div className="space-y-2">
                  <div className="text-emerald-800 font-bold flex items-center justify-between">
                    <span>✓ ₹{currentInstructor.payment_amount || adminSettings.fee_amount || 9} ચૂકવણી સ્ક્રીનશોટ મોકલાયો છે</span>
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="text-xs underline hover:text-emerald-950 font-bold"
                    >
                      વિગતો / બદલો
                    </button>
                  </div>
                  <div className="flex justify-center bg-white p-1 rounded-xl border border-emerald-200">
                    <img
                      src={currentInstructor.payment_screenshot_url}
                      alt="ચૂકવણી રસીદ"
                      className="max-h-36 rounded-lg object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setIsPaymentModalOpen(true)}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-rose-800 font-bold flex items-center justify-between">
                  <span>⚠️ ₹{adminSettings.fee_amount || 9} ચૂકવણી અને સ્ક્રીનશોટ બાકી છે</span>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-2.5 py-1 bg-[#346739] text-white rounded-lg text-[11px] font-bold shadow-2xs hover:bg-[#2b552f]"
                  >
                    હવે ચૂકવો (Pay ₹{adminSettings.fee_amount || 9})
                  </button>
                </div>
              )}
            </div>
            <div className="text-[11px] text-amber-800 pt-1">
              સુપર એડમિન આપના મોબાઈલ નંબર પર સંપર્ક કરી એકાઉન્ટ મંજૂર કરશે.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleInstructorLogout}
              className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-xs"
            >
              લોગ આઉટ કરો (Log Out)
            </button>
            <button
              onClick={syncFromCloud}
              className="px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              સ્ટેટસ રિફ્રેશ કરો
            </button>
          </div>

          {/* Payment Modal for Pending Instructor */}
          {isPaymentModalOpen && (
            <PaymentVerificationModal
              instructor={currentInstructor}
              adminSettings={adminSettings}
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              onSubmitPayment={async (details) => {
                const updated: Instructor = {
                  ...currentInstructor,
                  ...details,
                  payment_submitted_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                await handleUpdateInstructor(updated);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // Check if current user's account validity has expired (usable for 1 year from approval date, lifetime for admin)
  if (!isGuest && !isSuperAdminUser && isAccountExpired(currentInstructor)) {
    return (
      <div className="min-h-screen bg-[#f7f9f6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-8 h-8 text-rose-600" />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">
              વાર્ષિક મુદત પૂર્ણ થયેલ છે (1-Year Validity Expired)
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              નમસ્તે <strong>{currentInstructor.name}</strong>, આપના એકાઉન્ટની ૧ વર્ષની વાર્ષિક માન્યતા મુદત પૂર્ણ થઈ ગઈ છે. મંજૂરી તારીખથી ૧ વર્ષ પૂર્ણ થતાં પોર્ટલનો ઉપયોગ ચાલુ રાખવા માટે રીન્યુઅલ જરૂરી છે.
            </p>
          </div>

          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-left text-xs space-y-1.5 text-rose-950">
            <div>• સંસ્થા: <strong>{currentInstructor.iti_name}</strong></div>
            <div>• મંજૂરી તારીખ (Approval Date): <strong>{formatValidityDate(currentInstructor.approved_at)}</strong></div>
            <div>• માન્યતા અંતિમ તારીખ (Expiry Date): <strong className="text-rose-700">{formatValidityDate(currentInstructor.valid_until)}</strong></div>
            <div className="pt-2 border-t border-rose-200 text-rose-800">
              વાર્ષિક રીન્યુઅલ માટે ₹{adminSettings.fee_amount || 9} ચૂકવણી કરી સ્ક્રીનશોટ મોકલો અથવા સુપર એડમિનનો સંપર્ક કરો.
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-[#346739] hover:bg-[#2b552f] text-white rounded-xl transition-colors shadow-xs"
            >
              ₹{adminSettings.fee_amount || 9} ચૂકવી રીન્યુ કરો
            </button>
            <button
              onClick={handleInstructorLogout}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-xs"
            >
              લોગ આઉટ કરો (Log Out)
            </button>
          </div>
        </div>

        {isPaymentModalOpen && (
          <PaymentVerificationModal
            instructor={currentInstructor}
            adminSettings={adminSettings}
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSubmitPayment={async (details) => {
              const updated: Instructor = {
                ...currentInstructor,
                ...details,
                payment_submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              await handleUpdateInstructor(updated);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        instructor={currentInstructor}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenBatchUnitModal={() => setIsBatchUnitModalOpen(true)}
        onLogout={handleInstructorLogout}
        lowAttendanceCount={lowAttendanceCount}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
      />

      {/* Read-Only Guest Mode Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-[#1b381e] text-white px-3 sm:px-6 py-2.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs border-b border-amber-400/40">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 font-black text-[11px] tracking-wide flex items-center gap-1.5 uppercase shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-amber-200" /> ગેસ્ટ ડેમો મોડ (View-Only)
            </span>
            <span className="text-[11px] sm:text-xs text-amber-50">
              આપ અતિથિ તરીકે પોર્ટલની સુવિધાઓ નિહાળી રહ્યા છો. ડેટા સુરક્ષા માટે રેકોર્ડ્સ એડિટ, ડિલીટ કે અપડેટ અક્ષમ છે.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleInstructorLogout}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black shadow-xs transition-transform active:scale-95 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-slate-900" />
              <span>ખાતું રજીસ્ટર કરો (Register)</span>
            </button>
            <button
              onClick={handleInstructorLogout}
              className="px-2.5 py-1 bg-black/30 hover:bg-black/40 text-white rounded-lg text-xs font-semibold"
            >
              બહાર નીકળો (Logout)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 py-3 sm:py-6 pb-24 md:pb-6 overflow-x-hidden">
        {isSuperAdmin ? (
          /* Super Admin Console: Pure administrative jurisdiction (verification, approvals, audit, directory) */
          <SuperAdminDashboard
            instructors={instructors}
            trainees={trainees}
            attendanceRecords={attendanceRecords}
            dispatchLogs={dispatchLogs}
            adminSettings={adminSettings}
            onAddInstructor={handleAddInstructor}
            onUpdateInstructor={handleUpdateInstructor}
            onDeleteInstructor={handleDeleteInstructor}
            onDeleteTrainee={handleDeleteTrainee}
            onBatchDeleteTrainees={handleBatchDeleteTrainees}
            onUpdateAdminSettings={handleUpdateAdminSettings}
          />
        ) : (
          /* Instructor Classroom Management Tools */
          <>
            {activeTab === 'hierarchy' && (
              <AcademicHierarchyManager
                instructor={currentInstructor}
                trainees={instructorTrainees}
                allTrainees={trainees}
                onUpdateInstructor={handleUpdateInstructor}
                onAssignTraineesToUnit={handleAssignTraineesToUnit}
                onNavigateToTrainees={(trade, batch, unit) => {
                  setTraineeFilterPreset({ trade, batch, unit });
                  setActiveTab('trainees');
                }}
              />
            )}

            {activeTab === 'trainees' && (
              <TraineeManager
                trainees={instructorTrainees}
                instructor={currentInstructor}
                initialTradeFilter={traineeFilterPreset?.trade}
                initialBatchFilter={traineeFilterPreset?.batch}
                initialUnitFilter={traineeFilterPreset?.unit}
                onAddTrainee={handleAddTrainee}
                onUpdateTrainee={handleUpdateTrainee}
                onDeleteTrainee={handleDeleteTrainee}
                onImportTrainees={handleImportTrainees}
                onOpenBatchUnitModal={() => setIsBatchUnitModalOpen(true)}
              />
            )}

            {activeTab === 'templates' && (
              <TemplateStudio
                instructor={currentInstructor}
                templates={templates}
                trainees={instructorTrainees}
                attendanceRecords={attendanceRecords}
                dispatchLogs={dispatchLogs}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onUpdateInstructorHeader={handleUpdateInstructorHeader}
                onUseTemplateForReport={(tmpl) => {
                  setActiveTemplateId(tmpl.id);
                  setActiveTab('report');
                }}
              />
            )}

            {activeTab === 'report' && (
              <ReportGenerator
                instructor={currentInstructor}
                trainees={instructorTrainees}
                attendanceRecords={attendanceRecords}
                templates={templates}
                dispatchLogs={dispatchLogs}
                onBatchLogDispatch={handleBatchLogDispatch}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceTracker
                trainees={instructorTrainees}
                attendanceRecords={attendanceRecords}
                instructor={currentInstructor}
                onUpdateAttendance={handleUpdateAttendance}
                onDraftNotice={(trainee) => {
                  setSelectedTraineeId(trainee.id);
                  setActiveTab('report');
                }}
                onBulkDraft={() => {
                  setActiveTab('report');
                }}
              />
            )}

            {activeTab === 'dispatch' && (
              <DispatchHistory
                dispatchLogs={dispatchLogs}
                trainees={trainees}
                instructor={currentInstructor}
                onUpdateStatus={handleUpdateDispatchStatus}
                onUpdateDispatchLog={handleUpdateDispatchLog}
                onDeleteDispatchLog={handleDeleteDispatchLog}
                onBatchDeleteDispatchLogs={handleBatchDeleteDispatchLogs}
                onCreateDispatchLog={handleCreateDispatchLog}
                onViewNotice={(traineeId) => {
                  setSelectedTraineeId(traineeId);
                  setActiveTab('report');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Instructor Profile Modal */}
      {isProfileModalOpen && (
        <InstructorProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          instructor={currentInstructor}
          allInstructors={instructors}
          onUpdateInstructor={handleUpdateInstructor}
          onLogout={handleInstructorLogout}
        />
      )}

      {/* Instructor Batches & Units (A/B/C) Manager Modal (Instructors Only) */}
      {isBatchUnitModalOpen && !isSuperAdmin && (
        <BatchUnitManagerModal
          isOpen={isBatchUnitModalOpen}
          onClose={() => setIsBatchUnitModalOpen(false)}
          instructor={currentInstructor}
          onUpdateInstructor={handleUpdateInstructor}
        />
      )}

      {/* Batch Notice Multi-Page PDF Print Modal (Instructors Only) */}
      {isBatchModalOpen && !isSuperAdmin && (
        <BatchNoticeModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          trainees={instructorTrainees}
          attendanceRecords={attendanceRecords}
          templates={templates}
          instructor={currentInstructor}
          dispatchLogs={dispatchLogs}
          onBatchLogDispatch={handleBatchLogDispatch}
        />
      )}

      {/* Guest Mode Action Blocked Modal Dialog */}
      {guestActionBlockedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 relative animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-base font-black text-slate-900 text-center">
              ડેમો મોડ પ્રતિબંધિત (View-Only Demo Restriction)
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              {guestActionBlockedNotice}
            </p>
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-950">
                <span>✨ ડેમો મોડમાં ઉપલબ્ધ સુવિધાઓ:</span>
              </div>
              <div>• તાલીમાર્થીઓની વિગતો અને બેચ/યુનિટ ફિલ્ટર ચકાસવા</div>
              <div>• માસિક હાજરી ટ્રેકર અને ઓછી હાજરી (&lt;૮૦%) ચેતવણીઓ</div>
              <div>• નોટિસ/અહેવાલ જનરેટર અને A4 પ્રિન્ટ / PDF ડાઉનલોડ પ્રિવ્યૂ</div>
              <div>• જાવક રજિસ્ટર (આઉટવર્ડ બુક) અને રવાનગી વિગતો</div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setGuestActionBlockedNotice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                સમજાઈ ગયું (Close)
              </button>
              <button
                onClick={() => {
                  setGuestActionBlockedNotice(null);
                  handleInstructorLogout();
                }}
                className="px-4 py-2 bg-[#346739] hover:bg-[#2b552f] text-[#f2edc2] font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>નવું ખાતું બનાવો (Register)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
