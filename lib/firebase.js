import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV1AhhjueVqy0dOmkt53uBkCNtsVC4lTc",
  authDomain: "crestpoint-capital.firebaseapp.com",
  projectId: "crestpoint-capital",
  storageBucket: "crestpoint-capital.firebasestorage.app",
  messagingSenderId: "204055812881",
  appId: "1:204055812881:web:5a9d07c515c484229bcab0",
  databaseURL: "https://crestpoint-capital-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const database = getDatabase(app);
