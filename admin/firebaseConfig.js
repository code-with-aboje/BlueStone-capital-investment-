const firebaseConfig = {
            apiKey: "AIzaSyBSITcz0wWrZuVsSe0njOwB5K_iKuTwjxg",
            authDomain: "crestpoint-bb103.firebaseapp.com",
            projectId: "crestpoint-bb103",
            storageBucket: "crestpoint-bb103.firebasestorage.app",
            messagingSenderId: "249520798719",
            appId: "1:249520798719:web:2d83f3cef937c9dc1405ca"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);
