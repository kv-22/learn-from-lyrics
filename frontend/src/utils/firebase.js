import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqBaUqF_DT125ZKu5sqE7SmYsJ2qE8tHY",
  authDomain: "songtranslator-91f75.firebaseapp.com",
  databaseURL: "https://songtranslator-91f75-default-rtdb.firebaseio.com",
  projectId: "songtranslator-91f75",
  storageBucket: "songtranslator-91f75.firebasestorage.app",
  messagingSenderId: "317917056626",
  appId: "1:317917056626:web:a0203d77d2943665c6fceb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

// Initialize Auth
const auth = getAuth(app);

export { app, db, auth }