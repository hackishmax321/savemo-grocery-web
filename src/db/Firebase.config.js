import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFdTwpg8c0BqyqFCtrTzAuJfX5yfu3FCA",
  authDomain: "vehicle-access-app.firebaseapp.com",
  projectId: "vehicle-access-app",
  storageBucket: "vehicle-access-app.firebasestorage.app",
  messagingSenderId: "351457007443",
  appId: "1:351457007443:web:e750e11193fed7391fb3a6",
  measurementId: "G-3WRK6184ZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
export default app;