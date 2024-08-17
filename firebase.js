// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXM-28BpQ3MTZ0lZ_oKor0EaiiHqoawhc",
  authDomain: "inventory-management-48f3e.firebaseapp.com",
  projectId: "inventory-management-48f3e",
  storageBucket: "inventory-management-48f3e.appspot.com", // Add this line
  messagingSenderId: "833901875168",
  appId: "1:833901875168:web:1ff87f5008854cff386585",
  measurementId: "G-EG98R0F3CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, firestore, storage }; // Export Firebase Storage