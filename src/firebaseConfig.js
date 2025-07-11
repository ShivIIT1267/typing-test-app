// Import required functions from the modular Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "trimurthy-real-estate.firebaseapp.com",
  projectId: "trimurthy-real-estate",
  storageBucket: "trimurthy-real-estate.appspot.com",
  messagingSenderId: "91458395913",
  appId: "1:91458395913:web:a9fe50305e061e5e303dd8",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export services for use in other parts of the app
export { auth, db };
