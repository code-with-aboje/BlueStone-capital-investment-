import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSITcz0wWrZuVsSe0njOwB5K_iKuTwjxg",
  authDomain: "crestpoint-bb103.firebaseapp.com",
  projectId: "crestpoint-bb103",
  storageBucket: "crestpoint-bb103.firebasestorage.app",
  messagingSenderId: "249520798719",
  appId: "1:249520798719:web:2d83f3cef937c9dc1405ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const database = getDatabase(app);
