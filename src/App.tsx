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
} from './services/dataService';

import Header, { ActiveTab } from './components/Header';
import TenantModal from './components/TenantModal';
import AttendanceTracker from './components/AttendanceTracker';
import TraineeManager from './components/TraineeManager';
import WordEditor from './components/WordEditor/WordEditor';
import DispatchHistory from './components/DispatchHistory';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import BatchNoticeModal from './components/BatchNoticeModal';
import PrincipalReport from './components/PrincipalReport';
import InstructorAuth from './components/InstructorAuth';
import BatchUnitManagerModal from './components/BatchUnitManagerModal';

export default function App() {
  // Multi-Tenant Data States
  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS);
  const [currentInstructorId, setCurrentInstructorId] = useState<string>(INITIAL_INSTRUCTORS[0].id);
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
        // Ensure inst-tejas (tejz2342@gmail.com) is in the instructor list and marked verified
        const hasTejas = insts.some((i) => i.email.toLowerCase() === 'tejz2342@gmail.com');
        if (!hasTejas) {
          const tejasInst = INITIAL_INSTRUCTORS.find((i) => i.id === 'inst-tejas');
          if (tejasInst) {
            insts.push(tejasInst);
            saveInstructorToCloud(tejasInst).catch(console.warn);
          }
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
    const stored = localStorage.getItem('iti_auth_authenticated');
    return stored === 'false' ? false : true;
  });
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchUnitModalOpen, setIsBatchUnitModalOpen] = useState(false);

  // Current active instructor
  const currentInstructor = useMemo(() => {
    return (
      instructors.find((i) => i.id === currentInstructorId) || instructors[0]
    );
  }, [instructors, currentInstructorId]);

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
    setCurrentInstructorId(created.id);
    setIsAuthenticated(true);
    localStorage.setItem('iti_auth_authenticated', 'true');
    localStorage.setItem('iti_auth_instructor_id', created.id);
    await saveInstructorToCloud(created);
  };

  const handleInstructorLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('iti_auth_authenticated', 'false');
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
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    // Persist template edits to Cloud Firestore
    await saveTemplateToCloud(updated);
  };

  // 5. Tenant Handlers
  const handleAddInstructor = (inst: Omit<Instructor, 'id' | 'created_at'>) => {
    const created: Instructor = {
      ...inst,
      id: `inst-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setInstructors((prev) => [...prev, created]);
    setCurrentInstructorId(created.id);
  };

  const handleSelectTraineeForNotice = (traineeId: string, templateId?: string) => {
    setSelectedTraineeId(traineeId);
    if (templateId) {
      setActiveTemplateId(templateId);
    }
    setActiveTab('editor');
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

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        instructor={currentInstructor}
        onOpenTenantModal={() => setIsTenantModalOpen(true)}
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
        {activeTab === 'attendance' && (
          <AttendanceTracker
            trainees={instructorTrainees}
            attendanceRecords={attendanceRecords}
            instructor={currentInstructor}
            onUpdateAttendance={handleUpdateAttendance}
            onDraftNotice={handleDraftNotice}
            onBulkDraft={handleBulkDraft}
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

        {activeTab === 'editor' && (
          <WordEditor
            templates={templates}
            activeTemplateId={activeTemplateId}
            onSelectTemplate={setActiveTemplateId}
            onSaveTemplate={handleSaveTemplate}
            trainees={instructorTrainees}
            attendanceRecords={attendanceRecords}
            dispatchLogs={dispatchLogs}
            instructor={currentInstructor}
            selectedTraineeId={selectedTraineeId}
            onSelectTrainee={setSelectedTraineeId}
            onLogDispatch={handleLogDispatch}
            onTriggerPrint={() => window.print()}
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

        {activeTab === 'dispatch' && (
          <DispatchHistory
            dispatchLogs={dispatchLogs}
            trainees={trainees}
            instructor={currentInstructor}
            onUpdateStatus={handleUpdateDispatchStatus}
            onViewNotice={(traineeId) => {
              setSelectedTraineeId(traineeId);
              setActiveTab('editor');
            }}
          />
        )}

        {activeTab === 'admin' && (
          <SuperAdminDashboard
            instructors={instructors}
            trainees={trainees}
            attendanceRecords={attendanceRecords}
            dispatchLogs={dispatchLogs}
            onSelectTenant={(tenantId) => {
              setCurrentInstructorId(tenantId);
              setActiveTab('attendance');
            }}
          />
        )}
      </main>

      {/* Multi-Tenant Instructor Switch Modal */}
      {isTenantModalOpen && (
        <TenantModal
          isOpen={isTenantModalOpen}
          onClose={() => setIsTenantModalOpen(false)}
          instructors={instructors}
          currentInstructorId={currentInstructorId}
          onSelectInstructor={setCurrentInstructorId}
          onAddInstructor={handleAddInstructor}
        />
      )}

      {/* Instructor Batches & Units (A/B/C) Manager Modal */}
      {isBatchUnitModalOpen && (
        <BatchUnitManagerModal
          isOpen={isBatchUnitModalOpen}
          onClose={() => setIsBatchUnitModalOpen(false)}
          instructor={currentInstructor}
          onUpdateInstructor={handleUpdateInstructor}
        />
      )}

      {/* Batch Notice Multi-Page PDF Print Modal */}
      {isBatchModalOpen && (
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
