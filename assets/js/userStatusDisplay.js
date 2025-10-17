// userStatusDisplay.js - Firebase Real-time Database ban/suspension checking

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get, set, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import firebase from './firebase.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

(function() {
  const style = `
    :root {
      --green: #00c06b;
      --red: #ff4444;
      --orange: #f5a623;
      --gray-1: #fafafa;
      --gray-2: #eaeaea;
    }

    .status-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .status-modal.active { display: flex; animation: fadeIn 0.3s ease-out; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .status-card {
      background: #fff;
      border-radius: 20px;
      padding: 32px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      animation: slideIn 0.4s ease-out;
    }

    @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      animation: bounce 0.6s ease-out;
    }

    @keyframes bounce { 0% { transform: scale(0); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

    .icon-wrapper.banned { background: rgba(255,68,68,0.15); color: var(--red); }
    .icon-wrapper.suspended { background: rgba(245,166,35,0.15); color: var(--orange); }
    .icon-wrapper.active { background: rgba(0,192,107,0.15); color: var(--green); }

    .status-title {
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }

    .status-title.banned { color: var(--red); }
    .status-title.suspended { color: var(--orange); }
    .status-title.active { color: var(--green); }

    .status-subtitle {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-bottom: 24px;
    }

    .info-section {
      background: var(--gray-1);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }

    .info-row:not(:last-child) { border-bottom: 1px solid var(--gray-2); }

    .info-label { color: #666; font-weight: 500; }
    .info-value { font-weight: 600; }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.banned { background: rgba(255,68,68,0.2); color: var(--red); }
    .badge.suspended { background: rgba(245,166,35,0.2); color: var(--orange); }
    .badge.active { background: rgba(0,192,107,0.2); color: var(--green); }

    .alert-box {
      background: rgba(255,68,68,0.1);
      border-left: 4px solid var(--red);
      padding: 12px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
    }

    .alert-box.warning {
      background: rgba(245,166,35,0.1);
      border-left-color: var(--orange);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--gray-2);
      border-radius: 4px;
      overflow: hidden;
      margin: 12px 0;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--orange), var(--red));
      animation: fillProgress 1s ease-out;
    }

    @keyframes fillProgress { from { width: 0; } to { width: 100%; } }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: var(--green);
      color: #fff;
    }

    .btn-primary:hover {
      background: #00a35e;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,192,107,0.3);
    }

    .btn-secondary {
      background: var(--gray-1);
      color: #000;
      border: 1px solid var(--gray-2);
    }

    .btn-secondary:hover {
      background: var(--gray-2);
      transform: translateY(-2px);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    @media (max-width: 640px) {
      .status-card {
        padding: 20px;
        border-radius: 16px;
      }

      .icon-wrapper {
        width: 64px;
        height: 64px;
        font-size: 32px;
        margin-bottom: 16px;
      }

      .status-title {
        font-size: 20px;
        margin-bottom: 6px;
      }

      .status-subtitle {
        font-size: 12px;
        margin-bottom: 16px;
      }

      .info-section {
        padding: 12px;
        font-size: 12px;
        margin-bottom: 12px;
      }

      .info-row { padding: 8px 0; }
      .actions { gap: 8px; margin-top: 16px; }
      .btn { padding: 10px; font-size: 12px; }
      .alert-box { padding: 10px; font-size: 12px; margin: 16px 0; }
    }
  `;

  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = style;
    document.head.appendChild(styleEl);
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getTimeRemaining(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  }

  function renderBanned(data) {
    return `
      <div class="icon-wrapper banned">🚫</div>
      <h1 class="status-title banned">Account Banned</h1>
      <p class="status-subtitle">Your account has been permanently banned</p>
      <div class="alert-box"><strong>Reason:</strong> ${data.reason}</div>
      <div class="info-section">
        <div class="info-row"><span class="info-label">Account</span><span class="badge banned">BANNED</span></div>
        <div class="info-row"><span class="info-label">Ban Date</span><span class="info-value">${formatDate(data.bannedDate)}</span></div>
        <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.email}</span></div>
      </div>
      ${data.canAppeal ? `
        <div class="alert-box warning">You can submit an appeal within 30 days of the ban date.</div>
        <div class="actions">
          <button class="btn btn-primary" onclick="window.UserStatus.submitAppeal()">Submit Appeal</button>
          <button class="btn btn-secondary" onclick="window.UserStatus.contactSupport()">Contact Support</button>
        </div>
      ` : `
        <div class="actions">
          <button class="btn btn-secondary" onclick="window.UserStatus.contactSupport()">Contact Support</button>
        </div>
      `}
    `;
  }

  function renderSuspended(data) {
    const timeLeft = getTimeRemaining(data.suspendedUntil);
    const progressPercent = timeLeft ? Math.max(0, 100 - ((timeLeft.days / 7) * 100)) : 100;
    return `
      <div class="icon-wrapper suspended">⏸</div>
      <h1 class="status-title suspended">Account Suspended</h1>
      <p class="status-subtitle">Your account is temporarily restricted</p>
      <div class="alert-box warning"><strong>Reason:</strong> ${data.reason}</div>
      <div class="info-section">
        <div class="info-row"><span class="info-label">Status</span><span class="badge suspended">SUSPENDED</span></div>
        <div class="info-row"><span class="info-label">Suspended Until</span><span class="info-value">${formatDate(data.suspendedUntil)}</span></div>
        ${timeLeft ? `<div class="info-row"><span class="info-label">Time Remaining</span><span class="info-value">${timeLeft.days}d ${timeLeft.hours}h</span></div>` : ''}
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${progressPercent}%"></div></div>
      <div class="actions">
        <button class="btn btn-secondary" onclick="window.UserStatus.contactSupport()">Contact Support</button>
      </div>
    `;
  }

  function renderActive(data) {
    return `
      <div class="icon-wrapper active">✓</div>
      <h1 class="status-title active">Account Active</h1>
      <p class="status-subtitle">Your account is in good standing</p>
      <div class="info-section">
        <div class="info-row"><span class="info-label">Status</span><span class="badge active">ACTIVE</span></div>
        <div class="info-row"><span class="info-label">Name</span><span class="info-value">${data.name}</span></div>
        <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.email}</span></div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" onclick="window.UserStatus.goHome()">Go to Dashboard</button>
      </div>
    `;
  }

  // Create default user data if doesn't exist
  async function createUserIfNotExists(userId, userData) {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        const defaultData = {
          id: userId,
          name: userData.name || 'User',
          email: userData.email || '',
          status: 'active',
          createdAt: new Date().toISOString(),
          ...userData
        };
        await set(userRef, defaultData);
        console.log('User created:', userId);
      }
      return snapshot.val() || await get(userRef).then(s => s.val());
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user status from Firebase
  async function getUserStatus(userId) {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      return snapshot.val();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Ban user
  async function banUser(userId, reason) {
    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        status: 'banned',
        reason: reason,
        bannedDate: new Date().toISOString(),
        actionBy: 'admin',
        canAppeal: true
      });
      console.log('User banned:', userId);
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  // Suspend user
  async function suspendUser(userId, reason, days = 7) {
    try {
      const suspendedUntil = new Date(Date.now() + days * 86400000).toISOString();
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        status: 'suspended',
        reason: reason,
        suspendedUntil: suspendedUntil,
        actionBy: 'admin'
      });
      console.log('User suspended:', userId);
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  window.UserStatus = {
    currentUser: null,
    userData: null,

    async init(userId) {
      injectStyles();
      this.currentUser = userId;

      try {
        // Create user if doesn't exist
        await createUserIfNotExists(userId, {
          name: 'User ' + userId.substring(0, 5),
          email: userId + '@example.com'
        });

        // Get user status
        this.userData = await getUserStatus(userId);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    },

    async show() {
      if (!this.userData) {
        console.error('User data not initialized');
        return;
      }

      let modal = document.getElementById('statusModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'statusModal';
        modal.className = 'status-modal';
        document.body.appendChild(modal);
      }

      const content = this.userData.status === 'banned' ? renderBanned(this.userData)
                    : this.userData.status === 'suspended' ? renderSuspended(this.userData)
                    : renderActive(this.userData);

      modal.innerHTML = `<div class="status-card">${content}</div>`;
      modal.classList.add('active');
    },

    hide() {
      const modal = document.getElementById('statusModal');
      if (modal) modal.classList.remove('active');
    },

    async refresh() {
      if (!this.currentUser) return;
      this.userData = await getUserStatus(this.currentUser);
      if (document.getElementById('statusModal')?.classList.contains('active')) {
        this.show();
      }
    },

    async ban(reason) {
      if (!this.currentUser) return;
      await banUser(this.currentUser, reason);
      await this.refresh();
    },

    async suspend(reason, days) {
      if (!this.currentUser) return;
      await suspendUser(this.currentUser, reason, days);
      await this.refresh();
    },

    submitAppeal() {
      alert('Appeal form would open here');
    },

    contactSupport() {
      alert('Support contact form would open here');
    },

    goHome() {
      window.location.href = '/dashboard';
    }
  };

  // Check auth state and initialize
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('User authenticated:', user.uid);
      await window.UserStatus.init(user.uid);
    }
  });
})();
