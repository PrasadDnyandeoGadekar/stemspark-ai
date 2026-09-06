import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkD0B5yqmhM-oxxDPUSc3h-RFGaeUVDuQ",
  authDomain: "stemspark-ai.firebaseapp.com",
  projectId: "stemspark-ai",
  storageBucket: "stemspark-ai.firebasestorage.app",
  messagingSenderId: "437914620679",
  appId: "1:437914620679:web:7150744532b66044712ba2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Database
export const auth = getAuth(app);
export const db = getFirestore(app);