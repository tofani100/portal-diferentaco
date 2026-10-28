import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEsjRToAtEX3wXBFr5QvgPgib9IG7bMEY",
  authDomain: "playcomunique-site.firebaseapp.com",
  projectId: "playcomunique-site",
  storageBucket: "playcomunique-site.firebasestorage.app",
  messagingSenderId: "459448463252",
  appId: "1:459448463252:web:f554ef20b9ccf3d1f2e981"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
