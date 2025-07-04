import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC9_b5zObiw3aOzTUSbIS6qoswbHzilrQw",
  authDomain: "game-hub-972b7.firebaseapp.com",
  projectId: "game-hub-972b7",
  storageBucket: "game-hub-972b7.firebasestorage.app",
  messagingSenderId: "478402252182",
  appId: "1:478402252182:web:31f8d598cf56f7e2cea1b7",
  measurementId: "G-R3420CS8CX",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication 
export const auth = getAuth(app)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Analytics
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export default app
