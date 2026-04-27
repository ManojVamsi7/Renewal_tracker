import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCmudmc9coZJn2LHB75Z-oVMEzJFTfQUyM",
  authDomain: "renewal-portal-e3392.firebaseapp.com",
  projectId: "renewal-portal-e3392",
  storageBucket: "renewal-portal-e3392.firebasestorage.app",
  messagingSenderId: "56130574146",
  appId: "1:56130574146:web:08617956b6d984d2e35adb",
  measurementId: "G-M6G48T6XVL",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
