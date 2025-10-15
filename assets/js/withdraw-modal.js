// Withdraw Modal System - Firebase Module Version
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { auth, database } from "./firebase.js";

(function() {
    // Create modal HTML
    const modalHTML = `
        <div class="withdraw-modal" id="withdrawModal">
            <div class="withdraw-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Request Withdrawal</h2>
                    <button class="modal-close-btn" id="withdrawCloseBtn">✕</button>
                </div>

                <div class="error-message" id="errorMessage"></div>
                <div class="success-message" id="successMessage"></div>

                <form id="withdrawForm">
                    <div class="form-group">
                        <label class="form-label">Available Balance</label>
                        <div class="amount-info">
                            <div class="info-row">
                                <span class="info-label">Total Available:</span>
                                <span class="info-value" id="availableBalance">Loading...</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Withdrawal Amount</label>
                        <input 
                            type="number" 
                            class="form-input" 
                            id="withdrawAmount" 
                            placeholder="Enter amount" 
                            step="0.01"
                            min="10"
                            required
                        >
                    </div>

                    <div class="fee-warning" id="feeWarning">
                        <strong>Processing Fee:</strong> <span id="feeAmount">$0.00</span> (2.5%)
                    </div>

                    <div class="form-group">
                        <label class="form-label">Withdrawal Method</label>
                        <select class="form-select" id="withdrawMethod" required>
                            <option value="">Select withdrawal method</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="crypto">Cryptocurrency</option>
                            <option value="wallet">E-Wallet</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bank Account / Wallet Address</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            id="withdrawAccount" 
                            placeholder="Enter account details"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes (Optional)</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            id="withdrawNotes" 
                            placeholder="Any additional information..."
                        >
                    </div>

                    <div class="button-group">
                        <button type="button" class="btn btn-cancel" id="withdrawCancelBtn">Cancel</button>
                        <button type="submit" class="btn btn-withdraw" id="submitWithdrawBtn">Request Withdrawal</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Create modal CSS
    const modalCSS = `
        .withdraw-modal {
            display: none;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }

        .withdraw-modal.active {
            display: flex;
            align-items: flex-end;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }

        .withdraw-modal-content {
            width: 100%;
            background: white;
            border-radius: 20px 20px 0 0;
            padding: 24px;
            animation: slideUp 0.4s ease;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
        }

        .modal-title {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
        }

        .modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            color: #64748b;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: background 0.3s ease;
        }

        .modal-close-btn:hover {
            background: #f1f5f9;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
        }

        .form-input,
        .form-select {
            width: 100%;
            padding: 12px 14px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-input::placeholder {
            color: #cbd5e1;
        }

        .amount-info {
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #166534;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
        }

        .info-label {
            font-weight: 500;
        }

        .info-value {
            font-weight: 700;
            color: #15803d;
        }

        .fee-warning {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #92400e;
            display: none;
        }

        .fee-warning.show {
            display: block;
        }

        .error-message {
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            color: #991b1b;
            font-size: 14px;
            display: none;
        }

        .error-message.show {
            display: block;
        }

        .success-message {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            color: #166534;
            font-size: 14px;
            display: none;
        }

        .success-message.show {
            display: block;
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 28px;
        }

        .btn {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-cancel {
            background: #f1f5f9;
            color: #475569;
        }

        .btn-cancel:active {
            background: #e2e8f0;
        }

        .btn-withdraw {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-withdraw:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .btn-withdraw:active:not(:disabled) {
            transform: translateY(0);
        }

        .btn-withdraw:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (min-width: 769px) {
            .withdraw-modal {
                display: none !important;
            }
        }
    `;

    // Initialize when DOM is ready
    function init() {
        // Inject CSS
        const styleSheet = document.createElement('style');
        styleSheet.textContent = modalCSS;
        document.head.appendChild(styleSheet);

        // Inject HTML
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get elements
        const withdrawModal = document.getElementById('withdrawModal');
        const withdrawForm = document.getElementById('withdrawForm');
        const withdrawCloseBtn = document.getElementById('withdrawCloseBtn');
        const withdrawCancelBtn = document.getElementById('withdrawCancelBtn');
        const withdrawAmount = document.getElementById('withdrawAmount');
        const feeWarning = document.getElementById('feeWarning');
        const feeAmount = document.getElementById('feeAmount');
        const availableBalance = document.getElementById('availableBalance');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const submitWithdrawBtn = document.getElementById('submitWithdrawBtn');

        let userData = null;

        // Load user balance from Firebase Realtime Database
        async function loadUserBalance() {
            try {
                // Get current user
                const user = auth.currentUser;
                if (!user) {
                    availableBalance.textContent = '$0.00';
                    errorMessage.textContent = 'Please log in to view your balance';
                    errorMessage.classList.add('show');
                    return;
                }

                // Fetch user data
                const userRef = ref(database, 'users/' + user.uid);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    userData = snapshot.val();
                    const balance = userData.available || 0;
                    availableBalance.textContent = `$${balance.toFixed(2)}`;
                    errorMessage.classList.remove('show');
                } else {
                    availableBalance.textContent = '$0.00';
                    errorMessage.textContent = 'User data not found';
                    errorMessage.classList.add('show');
                }
            } catch (error) {
                console.error('Error loading balance:', error);
                availableBalance.textContent = '$0.00';
                errorMessage.textContent = `Error loading balance: ${error.message}`;
                errorMessage.classList.add('show');
            }
        }

        // Public function to open modal
        window.openWithdrawModal = async function() {
            if (window.innerWidth <= 768) {
                withdrawModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Load fresh balance every time modal opens
                availableBalance.textContent = 'Loading...';
                await loadUserBalance();
            }
        };

        // Close modal function
        function closeWithdrawModal() {
            withdrawModal.classList.remove('active');
            document.body.style.overflow = '';
            withdrawForm.reset();
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');
            feeWarning.classList.remove('show');
        }

        // Close button listeners
        withdrawCloseBtn.addEventListener('click', closeWithdrawModal);
        withdrawCancelBtn.addEventListener('click', closeWithdrawModal);

        // Close when clicking outside
        withdrawModal.addEventListener('click', (e) => {
            if (e.target === withdrawModal) {
                closeWithdrawModal();
            }
        });

        // Calculate fees
        withdrawAmount.addEventListener('input', () => {
            const amount = parseFloat(withdrawAmount.value) || 0;
            if (amount > 0) {
                const fee = amount * 0.025;
                feeAmount.textContent = `$${fee.toFixed(2)}`;
                feeWarning.classList.add('show');
            } else {
                feeWarning.classList.remove('show');
            }
        });

        // Listen for iframe messages
        window.addEventListener('message', (event) => {
            if (event.data.type === 'OPEN_WITHDRAW_MODAL') {
                window.openWithdrawModal();
            }
        });

        // Form submission
        withdrawForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const amount = parseFloat(withdrawAmount.value);
            const method = document.getElementById('withdrawMethod').value;
            const account = document.getElementById('withdrawAccount').value;
            const notes = document.getElementById('withdrawNotes').value;

            // Clear previous messages
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');

            // Validation
            if (amount < 10) {
                errorMessage.textContent = 'Minimum withdrawal amount is $10';
                errorMessage.classList.add('show');
                return;
            }

            if (!userData || amount > (userData.available || 0)) {
                errorMessage.textContent = 'Insufficient balance';
                errorMessage.classList.add('show');
                return;
            }

            if (!method || !account) {
                errorMessage.textContent = 'Please fill in all required fields';
                errorMessage.classList.add('show');
                return;
            }

            submitWithdrawBtn.disabled = true;
            submitWithdrawBtn.textContent = 'Processing...';

            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('User not authenticated');
                }

                // Create withdrawal request
                const withdrawalData = {
                    userId: user.uid,
                    userName: userData.name || 'User',
                    userEmail: user.email || '',
                    amount: amount,
                    fee: amount * 0.025,
                    method: method,
                    btcAddress: account,
                    notes: notes,
                    status: 'pending',
                    requestDate: new Date().toISOString()
                };

                // Add to pendingWithdrawals in Realtime Database (for admin to see)
                const withdrawalsRef = ref(database, 'pendingWithdrawals');
                const newWithdrawalRef = push(withdrawalsRef);
                await set(newWithdrawalRef, withdrawalData);

                // Update user's available and totalBalance
                const userRef = ref(database, 'users/' + user.uid);
                const userSnapshot = await get(userRef);
                const currentAvailable = userSnapshot.val().available || 0;
                const currentTotalBalance = userSnapshot.val().totalBalance || 0;
                
                await update(userRef, {
                    available: Math.max(0, currentAvailable - amount),
                    totalBalance: Math.max(0, currentTotalBalance - amount)
                });

                successMessage.textContent = 'Withdrawal request submitted successfully!';
                successMessage.classList.add('show');
                errorMessage.classList.remove('show');

                // Reload balance
                await loadUserBalance();

                setTimeout(() => {
                    closeWithdrawModal();
                }, 2000);

            } catch (error) {
                console.error('Withdrawal error:', error);
                errorMessage.textContent = error.message || 'An error occurred while processing your request';
                errorMessage.classList.add('show');
            } finally {
                submitWithdrawBtn.disabled = false;
                submitWithdrawBtn.textContent = 'Request Withdrawal';
            }
        });
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
