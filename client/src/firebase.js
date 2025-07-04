// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// ✅ Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDgscYVCC80jW7ge8cOrCRioN5_99XquwM",
  authDomain: "doc-sign-719fe.firebaseapp.com",
  projectId: "doc-sign-719fe",
  storageBucket: "doc-sign-719fe.appspot.com",
  messagingSenderId: "796948049207",
  appId: "1:796948049207:web:7651db6c4e81313f24feb2",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
