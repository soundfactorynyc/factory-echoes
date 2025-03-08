import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA4aGdKNbtnz0W-mhm2rjP3wyCXTngC9EY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "memory-chatbot-62820.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "memory-chatbot-62820",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "memory-chatbot-62820.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "120448803981",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:120448803981:web:aca56946cdc5289ab96ec4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, db, functions };
