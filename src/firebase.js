// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAukKieIaGmU7mWUris6HypZUrZ2vZIX6A",
  authDomain: "crypto-tip-6fa59.firebaseapp.com",
  projectId: "crypto-tip-6fa59",
  storageBucket: "crypto-tip-6fa59.firebasestorage.app",
  messagingSenderId: "480129331760",
  appId: "1:480129331760:web:fbfab14384735e1375f3f5",
  measurementId: "G-7CEF6ZWG01",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { db };
