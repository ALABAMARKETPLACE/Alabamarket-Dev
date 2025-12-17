import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebaseconfig";

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const Auth = getAuth(app);
const GoogleProvide = new GoogleAuthProvider();
export { Auth, GoogleProvide };
