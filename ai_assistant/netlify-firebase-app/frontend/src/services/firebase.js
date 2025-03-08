import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4aGdKNbtnz0W-mhm2rjP3wyCXTngC9EY",
  authDomain: "memory-chatbot-62820.firebaseapp.com",
  projectId: "memory-chatbot-62820",
  storageBucket: "memory-chatbot-62820.firebasestorage.app",
  messagingSenderId: "120448803981",
  appId: "1:120448803981:web:aca56946cdc5289ab96ec4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, db, functions };
