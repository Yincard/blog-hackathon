// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXM-28BpQ3MTZ0lZ_oKor0EaiiHqoawhc",
  authDomain: "inventory-management-48f3e.firebaseapp.com",
  projectId: "inventory-management-48f3e",
  storageBucket: "inventory-management-48f3e.appspot.com",
  messagingSenderId: "833901875168",
  appId: "1:833901875168:web:1ff87f5008854cff386585",
  measurementId: "G-EG98R0F3CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Token verification function
export async function verifyAuthToken(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return !!decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

// Export Firebase services and functions
export { auth, firestore, storage };