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
  DEMO_GUEST_INSTRUCTOR,
  DEMO_SAMPLE_TRAINEES,
  DEMO_SAMPLE_ATTENDANCE,
  DEMO_SAMPLE_TEMPLATES,
  DEMO_SAMPLE_DISPATCH_LOGS,
} from './data/demoData';
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
  saveBatchAttendanceToCloud,
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
import UserGuideView from './components/UserGuideView';
import LandingPageView from './components/LandingPageView';
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

  // Load instructors and global settings from Firestore on mount
  const syncFromCloud = useCallback(async () => {
    try {
      await seedFirestoreIfEmpty();

      const [insts, settings] = await Promise.all([
        fetchInstructors(),
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
    } catch (err) {
      console.warn('Firestore initial sync encountered error, running with cached data:', err);
    }
  }, []);

  useEffect(() => {
    syncFromCloud();
  }, [syncFromCloud]);

  // UI Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');
  const [activeTemplateId, setActiveTemplateId] = useState<string>(INITIAL_TEMPLATES[0].id);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(INITIAL_TRAINEES[0].id);

  // Unauthenticated Public Landing Page vs Auth Form
  const [unauthView, setUnauthView] = useState<'landing' | 'auth'>('landing');
  const [unauthAuthMode, setUnauthAuthMode] = useState<'login' | 'register'>('login');

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

  const [demoInstructor, setDemoInstructor] = useState<Instructor>(() => ({
    ...DEMO_GUEST_INSTRUCTOR,
  }));

  // Current active instructor
  const currentInstructor = useMemo(() => {
    if (currentInstructorId === 'guest-demo-instructor') {
      return demoInstructor;
    }
    return (
      instructors.find((i) => i.id === currentInstructorId) || instructors[0]
    );
  }, [instructors, currentInstructorId, demoInstructor]);

  const isSuperAdmin = currentInstructor.role === 'super_admin';
  const isGuest = Boolean(
    currentInstructor.is_guest ||
    currentInstructor.role === 'guest' ||
    currentInstructor.id === 'guest-demo-instructor'
  );

  // Active tenant and demo account isolation loader
  useEffect(() => {
    if (!currentInstructorId && !isAuthenticated) {
      return;
    }

    if (isGuest) {
      // Demo Account is strictly loaded with isolated static demo data
      setTrainees([...DEMO_SAMPLE_TRAINEES]);
      setAttendanceRecords([...DEMO_SAMPLE_ATTENDANCE]);
      setTemplates([...DEMO_SAMPLE_TEMPLATES]);
      setDispatchLogs([...DEMO_SAMPLE_DISPATCH_LOGS]);
    } else if (isSuperAdmin) {
      // Super Admin loads all production records across all instructors
      fetchTrainees().then((t) => t && setTrainees(t));
      fetchAttendance().then((a) => a && setAttendanceRecords(a));
      fetchTemplates().then((tm) => tm && setTemplates(tm));
      fetchDispatchLogs().then((l) => l && setDispatchLogs(l));
    } else {
      // Regular instructor strictly queries records scoped to their ID
      fetchTrainees(currentInstructorId).then((t) => t && setTrainees(t));
      fetchAttendance(currentInstructorId).then((a) => a && setAttendanceRecords(a));
      fetchTemplates(currentInstructorId).then((tm) => tm && setTemplates(tm));
      fetchDispatchLogs(currentInstructorId).then((l) => l && setDispatchLogs(l));
    }
  }, [currentInstructorId, isAuthenticated, isGuest, isSuperAdmin]);

  // Real-time dispatch logs listener scoped by tenancy
  useEffect(() => {
    if (!isAuthenticated || isGuest) return;

    const unsubscribe = subscribeToDispatchLogs((cloudLogs) => {
      if (cloudLogs && cloudLogs.length > 0) {
        if (isSuperAdmin) {
          setDispatchLogs(cloudLogs.filter((d) => !d.id.startsWith('disp-demo-')));
        } else if (currentInstructorId) {
          setDispatchLogs(cloudLogs.filter((d) => d.instructor_id === currentInstructorId));
        }
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, isGuest, isSuperAdmin, currentInstructorId]);

  // Strict role isolation: Super Admin is locked to 'admin', 'guide' or 'home' console; Instructors never access 'admin'
  useEffect(() => {
    if (isSuperAdmin && activeTab !== 'admin' && activeTab !== 'guide' && activeTab !== 'home') {
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

  // Ensure selectedTraineeId remains valid within current tenant's trainees
  useEffect(() => {
    if (instructorTrainees.length > 0) {
      const exists = instructorTrainees.some((t) => t.id === selectedTraineeId);
      if (!exists) {
        setSelectedTraineeId(instructorTrainees[0].id);
      }
    }
  }, [instructorTrainees, selectedTraineeId]);

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
    if (inst.id === 'guest-demo-instructor' || inst.role === 'guest' || inst.is_guest) {
      setDemoInstructor({ ...DEMO_GUEST_INSTRUCTOR });
    }
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
    setTrainees([]);
    setAttendanceRecords([]);
    setDispatchLogs([]);
    setUnauthView('landing');
    setUnauthAuthMode('login');
  };

  const handleUpdateInstructor = async (updated: Instructor) => {
    if (isGuest || updated.id === 'guest-demo-instructor') {
      setDemoInstructor((prev) => ({ ...prev, ...updated, id: 'guest-demo-instructor' }));
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
    const created: Trainee = {
      ...newTrainee,
      id: isGuest ? `demo-tr-${Date.now()}` : `trainee-${Date.now()}`,
      instructor_id: currentInstructorId || newTrainee.instructor_id,
      trade: newTrainee.trade || currentInstructor.trade,
      batch: newTrainee.batch || currentInstructor.batch,
      unit: newTrainee.unit || currentInstructor.unit || 'Unit A',
      created_at: new Date().toISOString(),
    };
    setTrainees((prev) => [created, ...prev]);
    if (!isGuest) {
      await saveTraineeToCloud(created);
    }
  };

  const handleUpdateTrainee = async (updated: Trainee) => {
    if (!isSuperAdmin && !isGuest && updated.instructor_id !== currentInstructorId) {
      console.warn('Unauthorized update attempt on trainee owned by another instructor');
      return;
    }
    setTrainees((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (!isGuest) {
      await saveTraineeToCloud(updated);
    }
  };

  const handleDeleteTrainee = async (id: string) => {
    const target = trainees.find((t) => t.id === id);
    if (!isSuperAdmin && !isGuest && target && target.instructor_id !== currentInstructorId) {
      console.warn('Unauthorized delete attempt on trainee owned by another instructor');
      return;
    }
    setTrainees((prev) => prev.filter((t) => t.id !== id));
    if (!isGuest) {
      await deleteTraineeFromCloud(id);
    }
  };

  const handleBatchDeleteTrainees = async (ids: string[]) => {
    const idsToDelete = isSuperAdmin || isGuest
      ? ids
      : ids.filter((id) => {
          const t = trainees.find((item) => item.id === id);
          return t && t.instructor_id === currentInstructorId;
        });

    setTrainees((prev) => prev.filter((t) => !idsToDelete.includes(t.id)));
    if (!isGuest) {
      await deleteBatchTraineesFromCloud(idsToDelete);
    }
  };

  const handleUpdateAdminSettings = async (settings: SuperAdminSettings) => {
    setAdminSettings(settings);
    if (!isGuest) {
      await saveAdminSettingsToCloud(settings);
    }
  };

  const handleAssignTraineesToUnit = async (
    traineeIds: string[],
    trade: string,
    batch: string,
    unit: string
  ) => {
    const allowedTraineeIds = isSuperAdmin || isGuest
      ? traineeIds
      : traineeIds.filter((tid) => {
          const t = trainees.find((item) => item.id === tid);
          return t && t.instructor_id === currentInstructorId;
        });

    if (allowedTraineeIds.length === 0) return;

    const updated = trainees.map((t) => {
      if (allowedTraineeIds.includes(t.id)) {
        return {
          ...t,
          trade,
          batch,
          unit,
          instructor_id: isSuperAdmin ? t.instructor_id : currentInstructorId,
        };
      }
      return t;
    });
    setTrainees(updated);
    if (!isGuest) {
      for (const tid of allowedTraineeIds) {
        const t = updated.find((item) => item.id === tid);
        if (t) await saveTraineeToCloud(t);
      }
    }
  };

  const handleImportTrainees = async (
    newTrainees: Trainee[],
    newAttendance: AttendanceRecord[]
  ) => {
    const taggedTrainees = newTrainees.map((t, idx) => ({
      ...t,
      id: isGuest && !t.id.startsWith('demo-') ? `demo-tr-imp-${Date.now()}-${idx}` : t.id,
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
      if (!isGuest) {
        await saveBatchTraineesToCloud(taggedTrainees, taggedAttendance);
      }
    } else if (!isGuest) {
      await saveBatchTraineesToCloud(taggedTrainees, []);
    }
  };

  // 2. Attendance Handlers
  const handleUpdateAttendance = (records: AttendanceRecord[]) => {
    setAttendanceRecords((prev) => {
      const recordMap = new Map<string, AttendanceRecord>();
      prev.forEach((r) => recordMap.set(`${r.trainee_id}_${(r.month_year || '').trim().toLowerCase()}`, r));
      records.forEach((r) => recordMap.set(`${r.trainee_id}_${(r.month_year || '').trim().toLowerCase()}`, r));
      return Array.from(recordMap.values());
    });
    if (!isGuest) {
      saveBatchAttendanceToCloud(records, currentInstructorId).catch(console.warn);
    }
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
    const created: DispatchLog = {
      ...newLog,
      id: isGuest ? `disp-demo-${Date.now()}` : `disp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setDispatchLogs((prev) => [created, ...prev]);
    if (!isGuest) {
      await saveDispatchLogToCloud(created);
    }
  };

  const handleBatchLogDispatch = async (logs: Omit<DispatchLog, 'id' | 'created_at'>[]) => {
    const createdLogs: DispatchLog[] = logs.map((l, idx) => ({
      ...l,
      id: isGuest ? `disp-demo-batch-${Date.now()}-${idx}` : `disp-batch-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
    }));
    setDispatchLogs((prev) => [...createdLogs, ...prev]);
    if (!isGuest) {
      await saveBatchDispatchLogsToCloud(createdLogs);
    }
  };

  const handleUpdateDispatchStatus = async (logId: string, newStatus: DispatchLog['status']) => {
    setDispatchLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: newStatus } : l))
    );
    if (!isGuest) {
      const existing = dispatchLogs.find((l) => l.id === logId);
      if (existing) {
        await saveDispatchLogToCloud({ ...existing, status: newStatus });
      }
    }
  };

  const handleUpdateDispatchLog = async (updatedLog: DispatchLog) => {
    setDispatchLogs((prev) =>
      prev.map((l) => (l.id === updatedLog.id ? updatedLog : l))
    );
    if (!isGuest) {
      await saveDispatchLogToCloud(updatedLog);
    }
  };

  const handleDeleteDispatchLog = async (logId: string) => {
    setDispatchLogs((prev) => prev.filter((l) => l.id !== logId));
    if (!isGuest) {
      await deleteDispatchLogFromCloud(logId);
    }
  };

  const handleBatchDeleteDispatchLogs = async (logIds: string[]) => {
    setDispatchLogs((prev) => prev.filter((l) => !logIds.includes(l.id)));
    if (!isGuest) {
      await deleteBatchDispatchLogsFromCloud(logIds);
    }
  };

  const handleCreateDispatchLog = async (newLog: Omit<DispatchLog, 'id' | 'created_at'>) => {
    await handleLogDispatch(newLog);
  };

  // 4. Template Handlers
  const handleSaveTemplate = async (updated: LetterTemplate) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === updated.id);
      if (exists) {
        return prev.map((t) => (t.id === updated.id ? updated : t));
      }
      return [updated, ...prev];
    });
    if (!isGuest) {
      await saveTemplateToCloud(updated);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (!isGuest) {
      await deleteTemplateFromCloud(templateId);
    }
  };

  const handleUpdateInstructorHeader = async (headerConfig: HeaderConfig) => {
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
      return;
    }
    const created: Instructor = {
      ...inst,
      id: 'id' in inst && inst.id ? inst.id : `inst-${Date.now()}`,
      batches: inst.batches || [inst.batch || '84'],
      units: inst.units || [inst.unit || 'Unit A'],
      trades: inst.trades || [inst.trade || 'કોપા (COPA)'],
      academic_hierarchy: inst.academic_hierarchy || [
        {
          id: `tr-${Date.now()}`,
          name: inst.trade || 'કોપા (COPA)',
          batches: [
            {
              id: `b-${Date.now()}`,
              name: inst.batch || '84',
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

  // If instructor is logged out or visiting landing page / auth screen
  if (!isAuthenticated) {
    if (unauthView === 'landing') {
      return (
        <LandingPageView
          onNavigateToAuth={(mode = 'login') => {
            setUnauthAuthMode(mode);
            setUnauthView('auth');
          }}
          onLaunchDemo={() => {
            handleInstructorLogin(DEMO_GUEST_INSTRUCTOR);
          }}
          isAuthenticated={false}
        />
      );
    }

    return (
      <InstructorAuth
        instructors={instructors}
        adminSettings={adminSettings}
        onLogin={handleInstructorLogin}
        onRegister={handleInstructorRegister}
        onVerifyEmail={handleVerifyInstructorEmail}
        onUpdateInstructor={handleUpdateInstructor}
        onBackToHome={() => setUnauthView('landing')}
        initialAuthMode={unauthAuthMode}
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
                    <span>✓ ₹{currentInstructor.payment_amount || adminSettings.fee_amount || 49} ચૂકવણી સ્ક્રીનશોટ મોકલાયો છે</span>
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
                  <span>⚠️ ₹{adminSettings.fee_amount || 49} ચૂકવણી અને સ્ક્રીનશોટ બાકી છે</span>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-2.5 py-1 bg-[#346739] text-white rounded-lg text-[11px] font-bold shadow-2xs hover:bg-[#2b552f]"
                  >
                    હવે ચૂકવો (Pay ₹{adminSettings.fee_amount || 49})
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
              વાર્ષિક રીન્યુઅલ માટે ₹{adminSettings.fee_amount || 49} ચૂકવણી કરી સ્ક્રીનશોટ મોકલો અથવા સુપર એડમિનનો સંપર્ક કરો.
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-[#346739] hover:bg-[#2b552f] text-white rounded-xl transition-colors shadow-xs"
            >
              ₹{adminSettings.fee_amount || 49} ચૂકવી રીન્યુ કરો
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

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto overflow-x-hidden ${activeTab === 'home' ? 'p-0' : 'max-w-7xl px-2 sm:px-6 py-3 sm:py-6 pb-24 md:pb-6'}`}>
        {activeTab === 'home' ? (
          <LandingPageView
            onNavigateToAuth={() => {}}
            onLaunchDemo={() => {}}
            onNavigateToTab={(tab) => setActiveTab(tab as ActiveTab)}
            isAuthenticated={true}
            currentInstructorName={currentInstructor.name}
            currentInstructorTrade={currentInstructor.trade}
          />
        ) : activeTab === 'guide' ? (
          <UserGuideView />
        ) : isSuperAdmin ? (
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
            onUpdateTrainee={handleUpdateTrainee}
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
    </div>
  );
}
