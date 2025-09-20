console.log("[v0] Initializing Firebase configuration...")

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error(`[v0] Missing Firebase environment variables: ${JSON.stringify(missingEnvVars)}`)
  console.error("[v0] Please check your .env.local file and ensure all required variables are set")
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
}

const isFirebaseConfigured = missingEnvVars.length === 0

console.log("[v0] Firebase configuration:", {
  apiKey: firebaseConfig.apiKey ? "✓ Set" : "✗ Missing",
  authDomain: firebaseConfig.authDomain ? "✓ Set" : "✗ Missing",
  projectId: firebaseConfig.projectId ? "✓ Set" : "✗ Missing",
  storageBucket: firebaseConfig.messagingSenderId ? "✓ Set" : "✗ Missing",
})

export { isFirebaseConfigured }

let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null

export let auth: any = null
export let db: any = null

export const getFirebaseApp = async () => {
  console.log("[v0] Getting Firebase app...")

  if (!firebaseApp) {
    const { initializeApp, getApps } = await import("firebase/app")
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    console.log("[v0] Firebase app initialized successfully")
  }

  return firebaseApp
}

export const getAuth = async () => {
  console.log("[v0] Getting Firebase auth...")

  if (!firebaseAuth) {
    const app = await getFirebaseApp()
    const { getAuth: getFirebaseAuth } = await import("firebase/auth")
    firebaseAuth = getFirebaseAuth(app)
    auth = firebaseAuth
    console.log("[v0] Firebase auth initialized successfully")
  }

  return firebaseAuth
}

export const getFirestore = async () => {
  console.log("[v0] Getting Firestore...")

  if (!firebaseDb) {
    const app = await getFirebaseApp()
    const { getFirestore: getFirebaseFirestore } = await import("firebase/firestore")
    firebaseDb = getFirebaseFirestore(app)
    db = firebaseDb
    console.log("[v0] Firestore initialized successfully")
  }

  return firebaseDb
}

if (isFirebaseConfigured) {
  getAuth().catch(console.error)
  getFirestore().catch(console.error)
}

export default null
