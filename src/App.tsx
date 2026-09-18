import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Instructor,
  Trainee,
  AttendanceRecord,
  LetterTemplate,
  DispatchLog,
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
  subscribeToDispatchLogs,
  saveInstructorToCloud,
  saveTraineeToCloud,
  deleteTraineeFromCloud,
  saveBatchTraineesToCloud,
  deleteInstructorFromCloud,
  deleteTemplateFromCloud,
} from './services/dataService';

import Header, { ActiveTab } from './components/Header';
import InstructorProfileModal from './components/InstructorProfileModal';
import AttendanceTracker from './components/AttendanceTracker';
import TraineeManager from './components/TraineeManager';
import DispatchHistory from './components/DispatchHistory';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import BatchNoticeModal from './components/BatchNoticeModal';
import PrincipalReport from './components/PrincipalReport';
import InstructorAuth from './components/InstructorAuth';
import BatchUnitManagerModal from './components/BatchUnitManagerModal';
import AcademicHierarchyManager from './components/AcademicHierarchyManager';
import TemplateStudio from './components/TemplateStudio';
import ReportGenerator from './components/ReportGenerator';
import { HeaderConfig } from './types';

export default function App() {
  // Multi-Tenant Data States
  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS);
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

  // Cloud sync status indicator
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');

  // Load from Firestore on mount
  const syncFromCloud = useCallback(async () => {
    try {
      setCloudSyncStatus('syncing');
      await seedFirestoreIfEmpty();

      const [insts, trns, atts, tmpls, logs] = await Promise.all([
        fetchInstructors(),
        fetchTrainees(),
        fetchAttendance(),
        fetchTemplates(),
        fetchDispatchLogs(),
      ]);

      if (insts && insts.length > 0) {
        // Ensure Super Admin Tejas Suthar (tejassuthar21696@gmail.com) is in the instructor list and marked approved
        const superAdminInst = INITIAL_INSTRUCTORS.find((i) => i.role === 'super_admin') || INITIAL_INSTRUCTORS[0];
        const hasSuperAdmin = insts.some(
          (i) =>
            i.role === 'super_admin' ||
            (i.email && i.email.toLowerCase() === 'tejassuthar21696@gmail.com') ||
            (i.phone && i.phone === '9825012345')
        );

        if (!hasSuperAdmin && superAdminInst) {
          insts.unshift(superAdminInst);
          saveInstructorToCloud(superAdminInst).catch(console.warn);
        }
        setInstructors(insts);
      }
      if (trns && trns.length > 0) setTrainees(trns);
      if (atts && atts.length > 0) setAttendanceRecords(atts);
      if (tmpls && tmpls.length > 0) setTemplates(tmpls);
      if (logs && logs.length > 0) setDispatchLogs(logs);

      setCloudSyncStatus('connected');
    } catch (err) {
      console.warn('Firestore initial sync encountered error, running with cached data:', err);
      setCloudSyncStatus('connected');
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
  const [imeLanguage, setImeLanguage] = useState<'Gujarati' | 'Hindi' | 'English'>('Gujarati');
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

  // Current active instructor
  const currentInstructor = useMemo(() => {
    return (
      instructors.find((i) => i.id === currentInstructorId) || instructors[0]
    );
  }, [instructors, currentInstructorId]);

  const isSuperAdmin = currentInstructor.role === 'super_admin';

  // Strict role isolation: Super Admin is locked to 'admin' console; Instructors never access 'admin'
  useEffect(() => {
    if (isSuperAdmin && activeTab !== 'admin') {
      setActiveTab('admin');
    } else if (!isSuperAdmin && activeTab === 'admin') {
      setActiveTab('attendance');
    }
  }, [isSuperAdmin, activeTab]);

  // Current instructor's isolated trainees (or shared for inst-tejas)
  const instructorTrainees = useMemo(() => {
    const list = trainees.filter((t) => t.instructor_id === currentInstructorId);
    if (list.length > 0) return list;
    // Fallback: If this is inst-tejas or newly created instructor, provide trainees access
    if (currentInstructorId === 'inst-tejas' || trainees.length <= 15) {
      return trainees;
    }
    return list;
  }, [trainees, currentInstructorId]);

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

  const handleInstructorRegister = async (newInst: Omit<Instructor, 'id' | 'created_at'>) => {
    const created: Instructor = {
      ...newInst,
      id: `inst-${Date.now()}`,
      batches: newInst.batches || [newInst.batch || '૨૦૨૫–૨૦૨૬'],
      units: newInst.units || ['Unit A', 'Unit B', 'Unit C'],
      created_at: new Date().toISOString(),
    };
    setInstructors((prev) => [created, ...prev]);
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
    setInstructors((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    await saveInstructorToCloud(updated);
  };

  // 1. Trainee Handlers
  const handleAddTrainee = async (newTrainee: Omit<Trainee, 'id' | 'created_at'>) => {
    const created: Trainee = {
      ...newTrainee,
      id: `trainee-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setTrainees((prev) => [created, ...prev]);
    await saveTraineeToCloud(created);
  };

  const handleUpdateTrainee = async (updated: Trainee) => {
    setTrainees((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    await saveTraineeToCloud(updated);
  };

  const handleDeleteTrainee = async (id: string) => {
    setTrainees((prev) => prev.filter((t) => t.id !== id));
    await deleteTraineeFromCloud(id);
  };

  const handleImportTrainees = async (
    newTrainees: Trainee[],
    newAttendance: AttendanceRecord[]
  ) => {
    setTrainees((prev) => [...newTrainees, ...prev]);
    if (newAttendance && newAttendance.length > 0) {
      setAttendanceRecords((prev) => [...newAttendance, ...prev]);
    }
    await saveBatchTraineesToCloud(newTrainees, newAttendance);
  };

  // 2. Attendance Handlers
  const handleUpdateAttendance = (records: AttendanceRecord[]) => {
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
    setDispatchLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: newStatus } : l))
    );
    const existing = dispatchLogs.find((l) => l.id === logId);
    if (existing) {
      await saveDispatchLogToCloud({ ...existing, status: newStatus });
    }
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
    await saveTemplateToCloud(updated);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    await deleteTemplateFromCloud(templateId);
  };

  const handleUpdateInstructorHeader = async (headerConfig: HeaderConfig) => {
    const updated: Instructor = {
      ...currentInstructor,
      header_config: headerConfig,
    };
    await handleUpdateInstructor(updated);
  };

  // 5. Tenant Handlers
  const handleAddInstructor = async (inst: Omit<Instructor, 'id' | 'created_at'> | Instructor) => {
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
        onLogin={handleInstructorLogin}
        onRegister={handleInstructorRegister}
        onVerifyEmail={handleVerifyInstructorEmail}
      />
    );
  }

  // Check if current user's account is pending approval (non-super-admin)
  const isSuperAdminUser =
    currentInstructor.role === 'super_admin' ||
    currentInstructor.email === 'tejassuthar21696@gmail.com';

  if (currentInstructor.status === 'pending' && !isSuperAdminUser) {
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
        </div>
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
        imeLanguage={imeLanguage}
        onImeLanguageChange={setImeLanguage}
        lowAttendanceCount={lowAttendanceCount}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        cloudSyncStatus={cloudSyncStatus}
        onSyncCloud={syncFromCloud}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 py-3 sm:py-6 pb-24 md:pb-6 overflow-x-hidden">
        {isSuperAdmin ? (
          /* Super Admin Console: Pure administrative jurisdiction (verification, approvals, audit, directory) */
          <SuperAdminDashboard
            instructors={instructors}
            trainees={trainees}
            attendanceRecords={attendanceRecords}
            dispatchLogs={dispatchLogs}
            onAddInstructor={handleAddInstructor}
            onUpdateInstructor={handleUpdateInstructor}
            onDeleteInstructor={handleDeleteInstructor}
          />
        ) : (
          /* Instructor Classroom Management Tools */
          <>
            {activeTab === 'hierarchy' && (
              <AcademicHierarchyManager
                instructor={currentInstructor}
                trainees={instructorTrainees}
                onUpdateInstructor={handleUpdateInstructor}
                onNavigateToTrainees={(trade, batch, unit) => {
                  setActiveTab('trainees');
                }}
              />
            )}

            {activeTab === 'trainees' && (
              <TraineeManager
                trainees={instructorTrainees}
                instructor={currentInstructor}
                imeLanguage={imeLanguage}
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

            {activeTab === 'principal-report' && (
              <PrincipalReport
                instructor={currentInstructor}
                trainees={instructorTrainees}
                attendanceRecords={attendanceRecords}
                dispatchLogs={dispatchLogs}
                onOpenBatchModal={() => setIsBatchModalOpen(true)}
                onSelectTraineeForNotice={handleSelectTraineeForNotice}
              />
            )}

            {activeTab === 'dispatch' && (
              <DispatchHistory
                dispatchLogs={dispatchLogs}
                trainees={trainees}
                instructor={currentInstructor}
                onUpdateStatus={handleUpdateDispatchStatus}
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
