import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebaseconfig";

let Auth: ReturnType<typeof getAuth> | null = null;
let GoogleProvide: GoogleAuthProvider | null = null;

if (typeof window !== "undefined") {
	const app = initializeApp(firebaseConfig);
	Auth = getAuth(app);
	GoogleProvide = new GoogleAuthProvider();
}

export { Auth, GoogleProvide };
