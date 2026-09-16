import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress excessive transport retry logs in offline or sandboxed iframe environments
try {
  setLogLevel('error');
} catch {
  // Ignore if already set
}

// Initialize Firebase App singleton
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore targeting the specific provisioned database with long polling for reliable connectivity
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    firebaseApp,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  firestoreDb = firebaseConfig.firestoreDatabaseId
    ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
    : getFirestore(firebaseApp);
}

export const db: Firestore = firestoreDb;

