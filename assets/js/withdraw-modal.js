// Withdraw Modal System - Works on Desktop & Mobile with Firebase
(function() {
    // Create modal HTML
    const modalHTML = `
        <div class="withdraw-modal" id="withdrawModal">
            <div class="withdraw-modal-overlay"></div>
            <div class="withdraw-modal-container">
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
                                    <span class="info-value" id="availableBalance">$0.00</span>
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
        </div>
    `;

    // Create modal CSS
    const modalCSS = `
        .withdraw-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
        }

        .withdraw-modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .withdraw-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }

        .withdraw-modal-container {
            position: relative;
            z-index: 10001;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
            .withdraw-modal.active {
                align-items: flex-end;
            }

            .withdraw-modal-container {
                width: 100vw;
                max-height: 90vh;
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
        }

        /* Desktop Styles */
        @media (min-width: 769px) {
            .withdraw-modal-container {
                width: 100%;
                max-width: 500px;
            }

            .withdraw-modal-content {
                width: 100%;
                background: white;
                border-radius: 12px;
                padding: 32px;
                animation: popIn 0.3s ease;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                max-height: 90vh;
                overflow-y: auto;
            }
        }

        @keyframes slideUp {
            from {
                transform: translateY(100%);
            }
            to {
                transform: translateY(0);
            }
        }

        @keyframes popIn {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
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
    `;

    // Initialize when DOM is ready
    function init() {
        console.log('Initializing withdraw modal...');
        
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

        let currentUser = null;
        let userData = null;

        // Public function to open modal
        window.openWithdrawModal = function() {
            console.log('Opening withdraw modal');
            withdrawModal.classList.add('active');
            document.body.style.overflow = 'hidden';
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

        // Close when clicking on overlay
        withdrawModal.addEventListener('click', (e) => {
            if (e.target === withdrawModal || e.target.classList.contains('withdraw-modal-overlay')) {
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

        // Update balance from window.userData
        function updateBalance() {
            if (window.userData) {
                userData = window.userData;
                availableBalance.textContent = `$${(userData.available || 0).toFixed(2)}`;
                console.log('Balance updated:', userData.available);
            }
        }

        updateBalance();

        // Form submission
        withdrawForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!userData) {
                errorMessage.textContent = 'User data not loaded. Please refresh the page.';
                errorMessage.classList.add('show');
                return;
            }

            const amount = parseFloat(withdrawAmount.value);
            const method = document.getElementById('withdrawMethod').value;
            const account = document.getElementById('withdrawAccount').value;
            const notes = document.getElementById('withdrawNotes').value;

            // Validation
            if (amount < 10) {
                errorMessage.textContent = 'Minimum withdrawal amount is $10';
                errorMessage.classList.add('show');
                return;
            }

            if (amount > (userData.available || 0)) {
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
                // Import Firebase functions from your lib
                const { auth, database } = await import('../../lib/firebase.js');
                const { ref, push, update } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

                currentUser = auth.currentUser;

                if (!currentUser) {
                    errorMessage.textContent = 'User not authenticated';
                    errorMessage.classList.add('show');
                    submitWithdrawBtn.disabled = false;
                    submitWithdrawBtn.textContent = 'Request Withdrawal';
                    return;
                }

                const withdrawalData = {
                    userId: currentUser.uid,
                    amount: amount,
                    method: method,
                    account: account,
                    notes: notes,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };

                // Save withdrawal request
                const withdrawRef = ref(database, `withdrawals/${currentUser.uid}`);
                await push(withdrawRef, withdrawalData);

                // Deduct from available balance
                const newAvailable = (userData.available || 0) - amount;
                const userRef = ref(database, `users/${currentUser.uid}`);
                
                await update(userRef, {
                    available: newAvailable,
                    updatedAt: new Date().toISOString()
                });

                // Update local userData
                userData.available = newAvailable;
                window.userData.available = newAvailable;
                availableBalance.textContent = `$${newAvailable.toFixed(2)}`;

                successMessage.textContent = 'Withdrawal request submitted successfully! Balance updated.';
                successMessage.classList.add('show');
                errorMessage.classList.remove('show');

                setTimeout(() => {
                    closeWithdrawModal();
                    // Reload page if in iframe
                    if (window.parent !== window) {
                        window.parent.location.reload();
                    } else {
                        location.reload();
                    }
                }, 2000);
            } catch (error) {
                console.error('Withdrawal error:', error);
                errorMessage.textContent = error.message || 'An error occurred';
                errorMessage.classList.add('show');
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
