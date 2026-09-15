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
import { Instructor, Trainee, AttendanceRecord, LetterTemplate, DispatchLog } from '../types';
import {
  INITIAL_INSTRUCTORS,
  INITIAL_TRAINEES,
  INITIAL_ATTENDANCE,
  INITIAL_TEMPLATES,
  INITIAL_DISPATCH_LOGS,
} from '../data/initialData';

const COLLECTION_INSTRUCTORS = 'instructors';
const COLLECTION_TRAINEES = 'trainees';
const COLLECTION_ATTENDANCE = 'attendance_records';
const COLLECTION_TEMPLATES = 'letter_templates';
const COLLECTION_DISPATCH = 'dispatch_logs';

/**
 * Checks whether Firestore has data. If empty, seeds with initial Shankheshwar ITI demo data.
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_INSTRUCTORS));
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

    await batch.commit();
    console.log('Firestore seeding completed successfully.');
    return true;
  } catch (error) {
    console.error('Error seeding Firestore data:', error);
    return false;
  }
}

/**
 * Fetch all instructors from Firestore (fallback to initial data if offline)
 */
export async function fetchInstructors(): Promise<Instructor[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_INSTRUCTORS));
    if (snap.empty) return INITIAL_INSTRUCTORS;
    return snap.docs.map((d) => d.data() as Instructor);
  } catch (err) {
    console.warn('Firestore fetchInstructors failed, using local fallback:', err);
    return INITIAL_INSTRUCTORS;
  }
}

/**
 * Fetch all trainees from Firestore
 */
export async function fetchTrainees(): Promise<Trainee[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_TRAINEES));
    if (snap.empty) return INITIAL_TRAINEES;
    return snap.docs.map((d) => d.data() as Trainee);
  } catch (err) {
    console.warn('Firestore fetchTrainees failed, using local fallback:', err);
    return INITIAL_TRAINEES;
  }
}

/**
 * Fetch all attendance records from Firestore
 */
export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_ATTENDANCE));
    if (snap.empty) return INITIAL_ATTENDANCE;
    return snap.docs.map((d) => d.data() as AttendanceRecord);
  } catch (err) {
    console.warn('Firestore fetchAttendance failed, using local fallback:', err);
    return INITIAL_ATTENDANCE;
  }
}

/**
 * Fetch all templates from Firestore
 */
export async function fetchTemplates(): Promise<LetterTemplate[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_TEMPLATES));
    if (snap.empty) return INITIAL_TEMPLATES;
    return snap.docs.map((d) => d.data() as LetterTemplate);
  } catch (err) {
    console.warn('Firestore fetchTemplates failed, using local fallback:', err);
    return INITIAL_TEMPLATES;
  }
}

/**
 * Fetch all dispatch logs from Firestore
 */
export async function fetchDispatchLogs(): Promise<DispatchLog[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_DISPATCH));
    if (snap.empty) return INITIAL_DISPATCH_LOGS;
    return snap.docs.map((d) => d.data() as DispatchLog);
  } catch (err) {
    console.warn('Firestore fetchDispatchLogs failed, using local fallback:', err);
    return INITIAL_DISPATCH_LOGS;
  }
}

/**
 * Save or update a single template in Firestore
 */
export async function saveTemplateToCloud(template: LetterTemplate): Promise<void> {
  try {
    const ref = doc(db, COLLECTION_TEMPLATES, template.id);
    await setDoc(ref, template, { merge: true });
  } catch (err) {
    console.error('Failed to save template to Firestore:', err);
  }
}

/**
 * Save or record a dispatch log to Firestore
 */
export async function saveDispatchLogToCloud(log: DispatchLog): Promise<void> {
  try {
    const ref = doc(db, COLLECTION_DISPATCH, log.id);
    await setDoc(ref, log, { merge: true });
  } catch (err) {
    console.error('Failed to record dispatch log to Firestore:', err);
  }
}

/**
 * Save batch dispatch logs to Firestore
 */
export async function saveBatchDispatchLogsToCloud(logs: DispatchLog[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const log of logs) {
      const ref = doc(db, COLLECTION_DISPATCH, log.id);
      batch.set(ref, log, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Failed to save batch dispatch logs to Firestore:', err);
  }
}

/**
 * Real-time listener for dispatch logs
 */
export function subscribeToDispatchLogs(callback: (logs: DispatchLog[]) => void) {
  const q = query(collection(db, COLLECTION_DISPATCH), orderBy('created_at', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const logs = snap.docs.map((d) => d.data() as DispatchLog);
      callback(logs);
    },
    (error) => {
      console.warn('Dispatch logs snapshot listener error:', error);
    }
  );
}

/**
 * Save or update instructor in Firestore
 */
export async function saveInstructorToCloud(instructor: Instructor): Promise<void> {
  try {
    const ref = doc(db, COLLECTION_INSTRUCTORS, instructor.id);
    await setDoc(ref, instructor, { merge: true });
  } catch (err) {
    console.error('Failed to save instructor to Firestore:', err);
  }
}

/**
 * Save or update a trainee in Firestore
 */
export async function saveTraineeToCloud(trainee: Trainee): Promise<void> {
  try {
    const ref = doc(db, COLLECTION_TRAINEES, trainee.id);
    await setDoc(ref, trainee, { merge: true });
  } catch (err) {
    console.error('Failed to save trainee to Firestore:', err);
  }
}

/**
 * Delete a trainee from Firestore
 */
export async function deleteTraineeFromCloud(traineeId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTION_TRAINEES, traineeId);
    await deleteDoc(ref);
  } catch (err) {
    console.error('Failed to delete trainee from Firestore:', err);
  }
}

/**
 * Save single attendance record to Firestore
 */
export async function saveAttendanceToCloud(record: AttendanceRecord): Promise<void> {
  try {
    const ref = doc(db, COLLECTION_ATTENDANCE, record.id);
    await setDoc(ref, record, { merge: true });
  } catch (err) {
    console.error('Failed to save attendance record to Firestore:', err);
  }
}

/**
 * Save batch trainees and their initial attendance records to Firestore
 */
export async function saveBatchTraineesToCloud(
  trainees: Trainee[],
  attendanceList?: AttendanceRecord[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const t of trainees) {
      const tRef = doc(db, COLLECTION_TRAINEES, t.id);
      batch.set(tRef, t, { merge: true });
    }
    if (attendanceList && attendanceList.length > 0) {
      for (const a of attendanceList) {
        const aRef = doc(db, COLLECTION_ATTENDANCE, a.id);
        batch.set(aRef, a, { merge: true });
      }
    }
    await batch.commit();
  } catch (err) {
    console.error('Failed to save batch trainees to Firestore:', err);
  }
}

