import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Instructor, Trainee, AttendanceRecord, LetterTemplate, DispatchLog, SuperAdminSettings } from '../types';
import {
  INITIAL_INSTRUCTORS,
  INITIAL_TRAINEES,
  INITIAL_ATTENDANCE,
  INITIAL_TEMPLATES,
  INITIAL_DISPATCH_LOGS,
} from '../data/initialData';
import {
  DEMO_GUEST_INSTRUCTOR,
  DEMO_SAMPLE_TRAINEES,
  DEMO_SAMPLE_ATTENDANCE,
  DEMO_SAMPLE_TEMPLATES,
  DEMO_SAMPLE_DISPATCH_LOGS,
} from '../data/demoData';
import { ensureInstructorValidity } from '../utils/validityHelper';
import { DEFAULT_ADMIN_QR_IMAGE_URL } from '../utils/imageCompressor';

const COLLECTION_INSTRUCTORS = 'instructors';
const COLLECTION_TRAINEES = 'trainees';
const COLLECTION_ATTENDANCE = 'attendance_records';
const COLLECTION_TEMPLATES = 'letter_templates';
const COLLECTION_DISPATCH = 'dispatch_logs';

const COLLECTION_SETTINGS = 'system_settings';

const CACHE_KEYS = {
  INSTRUCTORS: 'iti_cache_instructors',
  TRAINEES: 'iti_cache_trainees',
  ATTENDANCE: 'iti_cache_attendance',
  TEMPLATES: 'iti_cache_templates',
  DISPATCH: 'iti_cache_dispatch',
  SETTINGS: 'iti_cache_admin_settings',
};

/**
 * Timeout wrapper to prevent Firestore network requests from hanging indefinitely
 */
async function runWithTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore connection timeout')), timeoutMs)
    ),
  ]);
}

function migrateAttendanceRecordsTo2026(records: AttendanceRecord[]): AttendanceRecord[] {
  if (!Array.isArray(records)) return [];
  let changed = false;
  const migrated = records.map((rec) => {
    let recChanged = false;
    let newMonthYear = rec.month_year;
    let newContinuousAbsent = rec.continuous_absent_since;
    let newAbsentFrom = rec.absent_from_date;
    let newAbsentTo = rec.absent_to_date;
    let newUpdated = rec.updated_at;

    if (newMonthYear && newMonthYear.includes('2025')) {
      newMonthYear = newMonthYear.replace('2025', '2026');
      recChanged = true;
    }
    if (newContinuousAbsent && (newContinuousAbsent.includes('2025') || newContinuousAbsent.includes('૨૦૨૫'))) {
      newContinuousAbsent = newContinuousAbsent.replace(/2025/g, '2026').replace(/૨૦૨૫/g, '૨૦૨૬');
      recChanged = true;
    }
    if (newAbsentFrom && (newAbsentFrom.includes('2025') || newAbsentFrom.includes('૨૦૨૫'))) {
      newAbsentFrom = newAbsentFrom.replace(/2025/g, '2026').replace(/૨૦૨૫/g, '૨૦૨૬');
      recChanged = true;
    }
    if (newAbsentTo && (newAbsentTo.includes('2025') || newAbsentTo.includes('૨૦૨૫'))) {
      newAbsentTo = newAbsentTo.replace(/2025/g, '2026').replace(/૨૦૨૫/g, '૨૦૨૬');
      recChanged = true;
    }
    if (newUpdated && newUpdated.includes('2025')) {
      newUpdated = newUpdated.replace('2025', '2026');
      recChanged = true;
    }

    if (recChanged) {
      changed = true;
      return {
        ...rec,
        month_year: newMonthYear,
        continuous_absent_since: newContinuousAbsent,
        absent_from_date: newAbsentFrom,
        absent_to_date: newAbsentTo,
        updated_at: newUpdated,
      };
    }
    return rec;
  });

  if (changed) {
    try {
      localStorage.setItem(CACHE_KEYS.ATTENDANCE, JSON.stringify(migrated));
    } catch {
      // Ignore
    }
  }
  return migrated;
}

function migrateDispatchLogsTo2026(logs: DispatchLog[]): DispatchLog[] {
  if (!Array.isArray(logs)) return [];
  let changed = false;
  const migrated = logs.map((log) => {
    let logChanged = false;
    let monthYear = log.month_year;
    let issueDate = log.issue_date;
    let issuedDate = log.issued_date;
    let refNum = log.ref_number;
    let outwardNum = log.outward_number;
    let createdAt = log.created_at;

    if (monthYear && monthYear.includes('2025')) {
      monthYear = monthYear.replace('2025', '2026');
      logChanged = true;
    }
    if (issueDate && issueDate.includes('2025')) {
      issueDate = issueDate.replace('2025', '2026');
      logChanged = true;
    }
    if (issuedDate && issuedDate.includes('2025')) {
      issuedDate = issuedDate.replace('2025', '2026');
      logChanged = true;
    }
    if (refNum && refNum.includes('2025')) {
      refNum = refNum.replace('2025', '2026');
      logChanged = true;
    }
    if (outwardNum && outwardNum.includes('2025')) {
      outwardNum = outwardNum.replace('2025', '2026');
      logChanged = true;
    }
    if (createdAt && createdAt.includes('2025')) {
      createdAt = createdAt.replace('2025', '2026');
      logChanged = true;
    }

    if (logChanged) {
      changed = true;
      return {
        ...log,
        month_year: monthYear,
        issue_date: issueDate,
        issued_date: issuedDate,
        ref_number: refNum,
        outward_number: outwardNum,
        created_at: createdAt,
      };
    }
    return log;
  });

  if (changed) {
    try {
      localStorage.setItem(CACHE_KEYS.DISPATCH, JSON.stringify(migrated));
    } catch {
      // Ignore
    }
  }
  return migrated;
}

function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === CACHE_KEYS.INSTRUCTORS && Array.isArray(parsed)) {
      return deduplicateInstructors(parsed as Instructor[]) as unknown as T;
    }
    if (key === CACHE_KEYS.ATTENDANCE && Array.isArray(parsed)) {
      return migrateAttendanceRecordsTo2026(parsed as AttendanceRecord[]) as unknown as T;
    }
    if (key === CACHE_KEYS.DISPATCH && Array.isArray(parsed)) {
      return migrateDispatchLogsTo2026(parsed as DispatchLog[]) as unknown as T;
    }
    return (Array.isArray(parsed) && parsed.length > 0 ? (parsed as unknown as T) : fallback);
  } catch {
    return fallback;
  }
}

function setLocalCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Checks whether Firestore has data. If empty, seeds with initial Shankheshwar ITI demo data.
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const snap = await runWithTimeout(getDocs(collection(db, COLLECTION_INSTRUCTORS)), 3000);
    if (!snap.empty) {
      return false; // Already seeded
    }

    console.log('Seeding initial ITI dataset to Cloud Firestore...');
    const batch = writeBatch(db);

    // 1. Instructors
    for (const inst of INITIAL_INSTRUCTORS) {
      const ref = doc(db, COLLECTION_INSTRUCTORS, inst.id);
      batch.set(ref, inst);
    }

    // 2. Trainees
    for (const trainee of INITIAL_TRAINEES) {
      const ref = doc(db, COLLECTION_TRAINEES, trainee.id);
      batch.set(ref, trainee);
    }

    // 3. Attendance Records
    for (const att of INITIAL_ATTENDANCE) {
      const ref = doc(db, COLLECTION_ATTENDANCE, att.id);
      batch.set(ref, att);
    }

    // 4. Templates
    for (const tmpl of INITIAL_TEMPLATES) {
      const ref = doc(db, COLLECTION_TEMPLATES, tmpl.id);
      batch.set(ref, tmpl);
    }

    // 5. Initial Dispatch Logs
    for (const disp of INITIAL_DISPATCH_LOGS) {
      const ref = doc(db, COLLECTION_DISPATCH, disp.id);
      batch.set(ref, disp);
    }

    await runWithTimeout(batch.commit(), 4000);
    console.log('Firestore seeding completed successfully.');
    return true;
  } catch (error) {
    // Graceful offline fallback
    return false;
  }
}

function sanitizeInstructorDepartmentBranding(inst: Instructor): Instructor {
  let updated = { ...inst };
  if (
    updated.role === 'super_admin' ||
    updated.id === 'super-admin-tejas' ||
    (updated.iti_name && /રોજગાર અને તાલીમ|Directorate of Employment/i.test(updated.iti_name))
  ) {
    if (updated.iti_name && /રોજગાર અને તાલીમ|Directorate of Employment/i.test(updated.iti_name)) {
      updated.iti_name = 'ITI તાલીમાર્થી હાજરી અને નોટિસ પોર્ટલ (Admin Console)';
    }
    if (updated.designation && /Directorate/i.test(updated.designation)) {
      updated.designation = 'સુપર એડમિનિસ્ટ્રેટર (Portal Super Admin)';
    }
    if (updated.unit === 'DET Gujarat') {
      updated.unit = 'Admin Unit';
      updated.units = ['Admin Unit'];
    }
  }
  if (updated.header_config) {
    const hc = { ...updated.header_config };
    if (hc.institute_name_gu && /રોજગાર અને તાલીમ નિયામક/i.test(hc.institute_name_gu)) {
      hc.institute_name_gu = 'ITI તાલીમાર્થી હાજરી અને નોટિસ પોર્ટલ';
    }
    if (hc.institute_name_en && /DIRECTORATE OF EMPLOYMENT/i.test(hc.institute_name_en)) {
      hc.institute_name_en = 'ITI TRAINEE ATTENDANCE & NOTICE PORTAL';
    }
    if (hc.department_subtitle && /રોજગાર અને તાલીમ નિયામક|Directorate of Employment/i.test(hc.department_subtitle)) {
      hc.department_subtitle = 'કૌશલ્ય વિકાસ અને વ્યાવસાયિક તાલીમ વિભાગ';
    }
    updated.header_config = hc;
  }
  return updated;
}

/**
 * Deduplicates an array of instructors by id, preserving the latest/updated record.
 */
export function deduplicateInstructors(instructors: Instructor[]): Instructor[] {
  if (!Array.isArray(instructors)) return [];
  const map = new Map<string, Instructor>();
  for (const rawInst of instructors) {
    if (!rawInst || !rawInst.id) continue;
    const inst = sanitizeInstructorDepartmentBranding(rawInst);
    if (!map.has(inst.id)) {
      map.set(inst.id, inst);
    } else {
      const existing = map.get(inst.id)!;
      const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
      const newTime = new Date(inst.updated_at || inst.created_at || 0).getTime();
      if (newTime >= existingTime) {
        map.set(inst.id, inst);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Fetch all instructors from Firestore (fallback to cached/initial data if offline)
 */
export async function fetchInstructors(): Promise<Instructor[]> {
  try {
    const snap = await runWithTimeout(getDocs(collection(db, COLLECTION_INSTRUCTORS)), 3000);
    if (!snap.empty) {
      const docs = snap.docs.map((d) => d.data() as Instructor);
      const uniqueDocs = deduplicateInstructors(docs).map(ensureInstructorValidity);
      setLocalCache(CACHE_KEYS.INSTRUCTORS, uniqueDocs);
      return uniqueDocs;
    }
    const cached = getLocalCache<Instructor[]>(CACHE_KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
    const uniqueCached = deduplicateInstructors(cached).map(ensureInstructorValidity);
    setLocalCache(CACHE_KEYS.INSTRUCTORS, uniqueCached);
    return uniqueCached;
  } catch {
    const cached = getLocalCache<Instructor[]>(CACHE_KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
    return deduplicateInstructors(cached).map(ensureInstructorValidity);
  }
}

/**
 * Fetch trainees from Firestore or isolated demo store based on active identity.
 * - If demo guest: strictly returns isolated DEMO_SAMPLE_TRAINEES.
 * - If regular instructor: strictly returns trainees assigned to this instructor.
 * - If admin / global: returns all production trainees.
 */
export async function fetchTrainees(instructorId?: string, isGuest?: boolean): Promise<Trainee[]> {
  if (isGuest || instructorId === 'guest-demo-instructor') {
    return [...DEMO_SAMPLE_TRAINEES];
  }

  const cacheKey = instructorId ? `${CACHE_KEYS.TRAINEES}_${instructorId}` : CACHE_KEYS.TRAINEES;

  try {
    const snap = await runWithTimeout(getDocs(collection(db, COLLECTION_TRAINEES)), 3000);
    if (!snap.empty) {
      const allDocs = snap.docs
        .map((d) => d.data() as Trainee)
        .filter((t) => !t.id.startsWith('demo-') && t.instructor_id !== 'guest-demo-instructor');

      if (instructorId) {
        const scoped = allDocs.filter((t) => t.instructor_id === instructorId);
        setLocalCache(cacheKey, scoped);
        return scoped;
      }

      setLocalCache(cacheKey, allDocs);
      return allDocs;
    }
  } catch {
    // Offline fallback
  }

  const cached = getLocalCache<Trainee[]>(cacheKey, INITIAL_TRAINEES);
  const cleanCached = cached.filter((t) => !t.id.startsWith('demo-') && t.instructor_id !== 'guest-demo-instructor');
  if (instructorId) {
    return cleanCached.filter((t) => t.instructor_id === instructorId);
  }
  return cleanCached;
}

function deduplicateAttendanceRecords(records: AttendanceRecord[]): AttendanceRecord[] {
  const map = new Map<string, AttendanceRecord>();
  for (const rec of records || []) {
    if (!rec.trainee_id || !rec.month_year) continue;
    const key = `${rec.trainee_id}_${rec.month_year.trim().toLowerCase()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, rec);
    } else {
      const tNew = rec.updated_at ? new Date(rec.updated_at).getTime() : 0;
      const tOld = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
      if (tNew >= tOld) {
        map.set(key, rec);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Fetch attendance records from Firestore or isolated demo store.
 */
export async function fetchAttendance(instructorId?: string, isGuest?: boolean): Promise<AttendanceRecord[]> {
  if (isGuest || instructorId === 'guest-demo-instructor') {
    return [...DEMO_SAMPLE_ATTENDANCE];
  }

  const cacheKey = instructorId ? `${CACHE_KEYS.ATTENDANCE}_${instructorId}` : CACHE_KEYS.ATTENDANCE;

  try {
    const snap = await runWithTimeout(getDocs(collection(db, COLLECTION_ATTENDANCE)), 3000);
    if (!snap.empty) {
      const docs = snap.docs
        .map((d) => d.data() as AttendanceRecord)
        .filter((a) => !a.id.startsWith('demo-') && !a.id.startsWith('att-demo-') && a.instructor_id !== 'guest-demo-instructor');
      const migratedDocs = deduplicateAttendanceRecords(migrateAttendanceRecordsTo2026(docs));

      if (instructorId) {
        const scoped = migratedDocs.filter((a) => a.instructor_id === instructorId);
        setLocalCache(cacheKey, scoped);
        return scoped;
      }

      setLocalCache(cacheKey, migratedDocs);
      return migratedDocs;
    }
  } catch {
    // Offline fallback
  }

  const cached = getLocalCache<AttendanceRecord[]>(cacheKey, INITIAL_ATTENDANCE);
  const cleanCached = deduplicateAttendanceRecords(
    cached.filter((a) => !a.id.startsWith('demo-') && !a.id.startsWith('att-demo-') && a.instructor_id !== 'guest-demo-instructor')
  );
  if (instructorId) {
    return cleanCached.filter((a) => a.instructor_id === instructorId);
  }
  return cleanCached;
}

/**
 * Fetch templates from Firestore or isolated demo store.
 */
export async function fetchTemplates(instructorId?: string, isGuest?: boolean): Promise<LetterTemplate[]> {
  if (isGuest || instructorId === 'guest-demo-instructor') {
    return [...DEMO_SAMPLE_TEMPLATES];
  }

  try {
    const snap = await runWithTimeout(getDocs(collection(db, COLLECTION_TEMPLATES)), 3000);
    if (!snap.empty) {
      const docs = snap.docs
        .map((d) => d.data() as LetterTemplate)
        .filter((t) => !t.id.startsWith('demo-') && t.instructor_id !== 'guest-demo-instructor');

      if (instructorId) {
        const scoped = docs.filter((t) => t.instructor_id === 'global' || t.instructor_id === instructorId);
        setLocalCache(CACHE_KEYS.TEMPLATES, scoped);
        return scoped;
      }

      setLocalCache(CACHE_KEYS.TEMPLATES, docs);
      return docs;
    }
  } catch {
    // Offline fallback
  }

  const cached = getLocalCache<LetterTemplate[]>(CACHE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  const cleanCached = cached.filter((t) => !t.id.startsWith('demo-') && t.instructor_id !== 'guest-demo-instructor');
  if (instructorId) {
    return cleanCached.filter((t) => t.instructor_id === 'global' || t.instructor_id === instructorId);
  }
  return cleanCached;
}

/**
 * Fetch dispatch logs from Firestore or isolated demo store.
 */
export async function fetchDispatchLogs(instructorId?: string, isGuest?: boolean): Promise<DispatchLog[]> {
  if (isGuest || instructorId === 'guest-demo-instructor') {
    return [...DEMO_SAMPLE_DISPATCH_LOGS];
  }

  const cacheKey = instructorId ? `${CACHE_KEYS.DISPATCH}_${instructorId}` : CACHE_KEYS.DISPATCH;

  try {
    const snap = await runWithTimeout(getDocs(collection(db, COLLECTION_DISPATCH)), 3000);
    if (!snap.empty) {
      const docs = snap.docs
        .map((d) => d.data() as DispatchLog)
        .filter((d) => !d.id.startsWith('disp-demo-') && d.instructor_id !== 'guest-demo-instructor');
      const migratedDocs = migrateDispatchLogsTo2026(docs);

      if (instructorId) {
        const scoped = migratedDocs.filter((d) => d.instructor_id === instructorId);
        setLocalCache(cacheKey, scoped);
        return scoped;
      }

      setLocalCache(cacheKey, migratedDocs);
      return migratedDocs;
    }
  } catch {
    // Offline fallback
  }

  const cached = getLocalCache<DispatchLog[]>(cacheKey, INITIAL_DISPATCH_LOGS);
  const cleanCached = cached.filter((d) => !d.id.startsWith('disp-demo-') && d.instructor_id !== 'guest-demo-instructor');
  if (instructorId) {
    return cleanCached.filter((d) => d.instructor_id === instructorId);
  }
  return cleanCached;
}

/**
 * Save or update a single template in Firestore and local cache
 */
export async function saveTemplateToCloud(template: LetterTemplate): Promise<void> {
  if (template.instructor_id === 'guest-demo-instructor' || template.id.startsWith('preset-')) {
    return; // Do not overwrite demo or preset templates in cloud
  }
  // Update local cache first
  const current = getLocalCache<LetterTemplate[]>(CACHE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  const updated = current.some((t) => t.id === template.id)
    ? current.map((t) => (t.id === template.id ? template : t))
    : [...current, template];
  setLocalCache(CACHE_KEYS.TEMPLATES, updated);

  try {
    const ref = doc(db, COLLECTION_TEMPLATES, template.id);
    await setDoc(ref, template, { merge: true });
  } catch {
    // Handled locally
  }
}

/**
 * Save or record a dispatch log to Firestore and local cache
 */
export async function saveDispatchLogToCloud(log: DispatchLog): Promise<void> {
  if (log.id.startsWith('disp-demo-') || log.instructor_id === 'guest-demo-instructor') {
    return; // Strictly read-only for demo dispatches
  }
  const current = getLocalCache<DispatchLog[]>(CACHE_KEYS.DISPATCH, INITIAL_DISPATCH_LOGS);
  const updated = [log, ...current.filter((l) => l.id !== log.id)];
  setLocalCache(CACHE_KEYS.DISPATCH, updated);

  try {
    const ref = doc(db, COLLECTION_DISPATCH, log.id);
    await setDoc(ref, log, { merge: true });
  } catch {
    // Handled locally
  }
}

/**
 * Save batch dispatch logs to Firestore and local cache
 */
export async function saveBatchDispatchLogsToCloud(logs: DispatchLog[]): Promise<void> {
  const safeLogs = logs.filter(
    (l) => !l.id.startsWith('disp-demo-') && l.instructor_id !== 'guest-demo-instructor'
  );
  if (safeLogs.length === 0) return;
  const current = getLocalCache<DispatchLog[]>(CACHE_KEYS.DISPATCH, INITIAL_DISPATCH_LOGS);
  const logMap = new Map(current.map((l) => [l.id, l]));
  safeLogs.forEach((l) => logMap.set(l.id, l));
  setLocalCache(CACHE_KEYS.DISPATCH, Array.from(logMap.values()));

  try {
    const batch = writeBatch(db);
    for (const log of safeLogs) {
      const ref = doc(db, COLLECTION_DISPATCH, log.id);
      batch.set(ref, log, { merge: true });
    }
    await batch.commit();
  } catch {
    // Handled locally
  }
}

/**
 * Delete a dispatch log from Firestore and local cache
 */
export async function deleteDispatchLogFromCloud(logId: string): Promise<void> {
  if (logId.startsWith('disp-demo-')) {
    return;
  }
  const current = getLocalCache<DispatchLog[]>(CACHE_KEYS.DISPATCH, INITIAL_DISPATCH_LOGS);
  const updated = current.filter((l) => l.id !== logId);
  setLocalCache(CACHE_KEYS.DISPATCH, updated);

  try {
    const ref = doc(db, COLLECTION_DISPATCH, logId);
    await deleteDoc(ref);
  } catch {
    // Handled locally
  }
}

/**
 * Delete multiple dispatch logs from Firestore and local cache
 */
export async function deleteBatchDispatchLogsFromCloud(logIds: string[]): Promise<void> {
  const filteredIds = logIds.filter((id) => !id.startsWith('disp-demo-'));
  if (filteredIds.length === 0) return;
  const current = getLocalCache<DispatchLog[]>(CACHE_KEYS.DISPATCH, INITIAL_DISPATCH_LOGS);
  const updated = current.filter((l) => !filteredIds.includes(l.id));
  setLocalCache(CACHE_KEYS.DISPATCH, updated);

  try {
    const batch = writeBatch(db);
    for (const id of logIds) {
      const ref = doc(db, COLLECTION_DISPATCH, id);
      batch.delete(ref);
    }
    await batch.commit();
  } catch {
    // Handled locally
  }
}

/**
 * Real-time listener for dispatch logs with resilient error handling
 */
export function subscribeToDispatchLogs(callback: (logs: DispatchLog[]) => void) {
  try {
    const q = query(collection(db, COLLECTION_DISPATCH), orderBy('created_at', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const logs = snap.docs.map((d) => d.data() as DispatchLog);
        if (logs.length > 0) {
          setLocalCache(CACHE_KEYS.DISPATCH, logs);
        }
        callback(logs);
      },
      () => {
        // Silently operate with offline cached dispatch records
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Save or update instructor in Firestore and local cache
 */
export async function saveInstructorToCloud(instructor: Instructor): Promise<void> {
  if (instructor.id === 'guest-demo-instructor' || instructor.role === 'guest' || instructor.is_guest) {
    return; // Strictly read-only for demo guest
  }
  const current = getLocalCache<Instructor[]>(CACHE_KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
  const updated = current.some((i) => i.id === instructor.id)
    ? current.map((i) => (i.id === instructor.id ? instructor : i))
    : [...current, instructor];
  setLocalCache(CACHE_KEYS.INSTRUCTORS, updated);

  try {
    const ref = doc(db, COLLECTION_INSTRUCTORS, instructor.id);
    await setDoc(ref, instructor, { merge: true });
  } catch {
    // Handled locally
  }
}

/**
 * Save or update a trainee in Firestore and local cache
 */
export async function saveTraineeToCloud(trainee: Trainee): Promise<void> {
  if (trainee.id.startsWith('demo-') || trainee.instructor_id === 'guest-demo-instructor') {
    return; // Strictly read-only for demo records
  }
  const current = getLocalCache<Trainee[]>(CACHE_KEYS.TRAINEES, INITIAL_TRAINEES);
  const updated = current.some((t) => t.id === trainee.id)
    ? current.map((t) => (t.id === trainee.id ? trainee : t))
    : [...current, trainee];
  setLocalCache(CACHE_KEYS.TRAINEES, updated);

  try {
    const ref = doc(db, COLLECTION_TRAINEES, trainee.id);
    await setDoc(ref, trainee, { merge: true });
  } catch {
    // Handled locally
  }
}

/**
 * Delete a trainee from Firestore and local cache
 */
export async function deleteTraineeFromCloud(traineeId: string): Promise<void> {
  if (traineeId.startsWith('demo-')) {
    return; // Never delete demo trainee
  }
  const current = getLocalCache<Trainee[]>(CACHE_KEYS.TRAINEES, INITIAL_TRAINEES);
  const updated = current.filter((t) => t.id !== traineeId);
  setLocalCache(CACHE_KEYS.TRAINEES, updated);

  try {
    const ref = doc(db, COLLECTION_TRAINEES, traineeId);
    await deleteDoc(ref);
  } catch {
    // Handled locally
  }
}

/**
 * Delete an instructor from Firestore and local cache
 */
export async function deleteInstructorFromCloud(instructorId: string): Promise<void> {
  const current = getLocalCache<Instructor[]>(CACHE_KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
  const updated = current.filter((i) => i.id !== instructorId);
  setLocalCache(CACHE_KEYS.INSTRUCTORS, updated);

  try {
    const ref = doc(db, COLLECTION_INSTRUCTORS, instructorId);
    await deleteDoc(ref);
  } catch {
    // Handled locally
  }
}

/**
 * Delete a template from Firestore and local cache
 */
export async function deleteTemplateFromCloud(templateId: string): Promise<void> {
  const current = getLocalCache<LetterTemplate[]>(CACHE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  const updated = current.filter((t) => t.id !== templateId);
  setLocalCache(CACHE_KEYS.TEMPLATES, updated);

  try {
    const ref = doc(db, COLLECTION_TEMPLATES, templateId);
    await deleteDoc(ref);
  } catch {
    // Handled locally
  }
}

/**
 * Save single attendance record to Firestore and local cache
 */
export async function saveAttendanceToCloud(record: AttendanceRecord): Promise<void> {
  if (record.id.startsWith('att-demo-') || record.instructor_id === 'guest-demo-instructor') {
    return; // Strictly read-only for demo records
  }
  await saveBatchAttendanceToCloud([record], record.instructor_id);
}

/**
 * Save a batch of attendance records to Firestore and local cache, deduplicating by trainee_id + month_year
 */
export async function saveBatchAttendanceToCloud(
  records: AttendanceRecord[],
  instructorId?: string
): Promise<void> {
  const safeRecords = (records || []).filter(
    (r) => !r.id.startsWith('demo-') && !r.id.startsWith('att-demo-') && r.instructor_id !== 'guest-demo-instructor'
  );
  if (safeRecords.length === 0) return;

  const currentGlobal = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  const mergedGlobal = deduplicateAttendanceRecords([...currentGlobal, ...safeRecords]);
  setLocalCache(CACHE_KEYS.ATTENDANCE, mergedGlobal);

  const effInstId = instructorId || safeRecords[0]?.instructor_id;
  if (effInstId) {
    const scopedKey = `${CACHE_KEYS.ATTENDANCE}_${effInstId}`;
    const currentScoped = getLocalCache<AttendanceRecord[]>(scopedKey, []);
    const mergedScoped = deduplicateAttendanceRecords([...currentScoped, ...safeRecords]).filter(
      (a) => a.instructor_id === effInstId
    );
    setLocalCache(scopedKey, mergedScoped);
  }

  try {
    const batch = writeBatch(db);
    for (const rec of safeRecords) {
      const ref = doc(db, COLLECTION_ATTENDANCE, rec.id);
      batch.set(ref, rec, { merge: true });
    }
    await batch.commit();
  } catch {
    // Handled locally
  }
}

/**
 * Save batch trainees and their initial attendance records to Firestore and local cache
 */
export async function saveBatchTraineesToCloud(
  trainees: Trainee[],
  attendanceList?: AttendanceRecord[]
): Promise<void> {
  const safeTrainees = trainees.filter(
    (t) => !t.id.startsWith('demo-') && t.instructor_id !== 'guest-demo-instructor'
  );
  if (safeTrainees.length === 0) return;

  const currentTrainees = getLocalCache<Trainee[]>(CACHE_KEYS.TRAINEES, INITIAL_TRAINEES);
  const traineeMap = new Map(currentTrainees.map((t) => [t.id, t]));
  safeTrainees.forEach((t) => traineeMap.set(t.id, t));
  setLocalCache(CACHE_KEYS.TRAINEES, Array.from(traineeMap.values()));

  const safeAttendance = (attendanceList || []).filter(
    (a) => !a.id.startsWith('att-demo-') && a.instructor_id !== 'guest-demo-instructor'
  );
  if (safeAttendance.length > 0) {
    const currentAtt = getLocalCache<AttendanceRecord[]>(CACHE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const attMap = new Map(currentAtt.map((a) => [a.id, a]));
    safeAttendance.forEach((a) => attMap.set(a.id, a));
    setLocalCache(CACHE_KEYS.ATTENDANCE, Array.from(attMap.values()));
  }

  try {
    const batch = writeBatch(db);
    for (const t of safeTrainees) {
      const tRef = doc(db, COLLECTION_TRAINEES, t.id);
      batch.set(tRef, t, { merge: true });
    }
    if (safeAttendance.length > 0) {
      for (const a of safeAttendance) {
        const aRef = doc(db, COLLECTION_ATTENDANCE, a.id);
        batch.set(aRef, a, { merge: true });
      }
    }
    await batch.commit();
  } catch {
    // Handled locally
  }
}

/**
 * Delete a batch of trainees from Firestore and local cache
 */
export async function deleteBatchTraineesFromCloud(traineeIds: string[]): Promise<void> {
  const safeIds = traineeIds.filter((id) => !id.startsWith('demo-'));
  if (safeIds.length === 0) return;
  const current = getLocalCache<Trainee[]>(CACHE_KEYS.TRAINEES, INITIAL_TRAINEES);
  const updated = current.filter((t) => !safeIds.includes(t.id));
  setLocalCache(CACHE_KEYS.TRAINEES, updated);

  try {
    const batch = writeBatch(db);
    for (const id of safeIds) {
      const ref = doc(db, COLLECTION_TRAINEES, id);
      batch.delete(ref);
    }
    await batch.commit();
  } catch {
    // Handled locally
  }
}

export const DEFAULT_ADMIN_SETTINGS: SuperAdminSettings = {
  upi_id: 'tejassuthar21696@okhdfcbank',
  payee_name: 'Tejas Suthar (Super Admin)',
  fee_amount: 49,
  payment_instructions: 'Pay ₹49 for ITI Trainee Portal Account Verification & Activation',
  qr_enabled: true,
  qr_image_url: DEFAULT_ADMIN_QR_IMAGE_URL,
};

/**
 * Fetch Super Admin settings (UPI ID, fee amount, etc.)
 */
export async function fetchAdminSettings(): Promise<SuperAdminSettings> {
  const sanitizeSettings = (s: SuperAdminSettings): SuperAdminSettings => {
    const merged = { ...DEFAULT_ADMIN_SETTINGS, ...s };
    if (
      merged.qr_image_url &&
      /DIRECTORATE OF EMPLOYMENT|રોજગાર અને તાલીમ નિયામક/i.test(merged.qr_image_url)
    ) {
      merged.qr_image_url = DEFAULT_ADMIN_QR_IMAGE_URL;
    }
    return merged;
  };

  try {
    const snap = await runWithTimeout(getDocs(collection(db, COLLECTION_SETTINGS)), 2500);
    if (!snap.empty) {
      const docData = sanitizeSettings(snap.docs[0].data() as SuperAdminSettings);
      setLocalCache(CACHE_KEYS.SETTINGS, docData);
      return docData;
    }
  } catch {
    // Fall back to local cache or defaults
  }
  return sanitizeSettings(getLocalCache<SuperAdminSettings>(CACHE_KEYS.SETTINGS, DEFAULT_ADMIN_SETTINGS));
}

/**
 * Save Super Admin settings to Firestore and local cache
 */
export async function saveAdminSettingsToCloud(settings: SuperAdminSettings): Promise<void> {
  setLocalCache(CACHE_KEYS.SETTINGS, settings);
  try {
    const ref = doc(db, COLLECTION_SETTINGS, 'global_config');
    await setDoc(ref, settings, { merge: true });
  } catch {
    // Handled locally
  }
}

