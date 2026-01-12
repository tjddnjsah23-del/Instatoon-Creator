import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCXJq8jJvCQgQqFGqlwTsHPtKbseRw4nGE",
  authDomain: "instar-canvas.firebaseapp.com",
  projectId: "instar-canvas",
  storageBucket: "instar-canvas.firebasestorage.app",
  messagingSenderId: "827588427286",
  appId: "1:827588427286:web:f43f77b63a795f54213f37"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
