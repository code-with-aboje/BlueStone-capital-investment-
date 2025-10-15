// firebaseConfig.js
// Firebase Configuration Keys Only - Import this in any HTML page

// Firebase Configuration Object
const firebaseConfig = {
    apiKey: "AIzaSyBsOwXNtfaWwEh3qaM0suXafOg6CYLzDC8",
    authDomain: "uamtv-c031c.firebaseapp.com",
    databaseURL: "https://uamtv-c031c-default-rtdb.firebaseio.com",
    projectId: "uamtv-c031c",
    storageBucket: "uamtv-c031c.firebasestorage.app",
    messagingSenderId: "9790917697",
    appId: "1:9790917697:web:275c8347b7688e0ac38ac0",
    measurementId: "G-RSXW1XBVQZ"
};

// Export only the configuration
export default firebaseConfig;

/* 
USAGE in HTML files:

<script type="module">
    // Import the config
    import firebaseConfig from './firebaseConfig.js';
    
    // Import Firebase SDK modules directly in your HTML
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { 
        getAuth, 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword, 
        onAuthStateChanged 
    } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
    import { 
        getDatabase, 
        ref, 
        set, 
        get, 
        onValue 
    } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
    
    // Initialize Firebase with imported config
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);
    
    // Use Firebase services...
</script>
*/