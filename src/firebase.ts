import { initializeApp } from 'firebase/app';
import { initializeFirestore, Firestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);

const dbId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

// Configure Firestore with auto-detect long polling so it smoothly selects the optimal transport
// (WebChannel/Streaming by default, falling back to Long-Polling if proxies/iframes require it)
export const db: Firestore = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true
  },
  dbId
);

export const auth = getAuth(app);

// Test connection gracefully
async function testConnection() {
  try {
    await getDoc(doc(db, 'system', 'config'));
    console.log('Firestore connection verified');
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('Firestore operating in offline/cache mode until connection is established.');
    } else {
      console.warn('Firestore connection check notice:', error?.message || error);
    }
  }
}

// Run test connection without blocking initial load
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 500);
}

