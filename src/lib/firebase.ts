
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBU_Q2F0zIMTrIyh5nXERtU3fEtlSX4SH0",
    authDomain: "mystical-slate-448113-c6.firebaseapp.com",
    projectId: "mystical-slate-448113-c6",
    storageBucket: "mystical-slate-448113-c6.firebasestorage.app",
    messagingSenderId: "681914071632",
    appId: "1:681914071632:web:35d31b8d1dafb51d51ef55",
    measurementId: "G-HQSH8R6RF9"

};

// Check if all required environment variables are present
const firebaseConfigValues = Object.values(firebaseConfig);
const areConfigValuesPresent = firebaseConfigValues.every(value => value);

let app;
let auth;

if (areConfigValuesPresent) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
  console.warn("Firebase config is missing. Please check your .env file.");
  // Provide dummy instances if config is not set
  app = undefined;
  auth = undefined;
}


export { app, auth };
