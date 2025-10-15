// Withdraw Modal System - Crest Point
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

(function() {
    const modalHTML = `
        <div class="withdraw-modal" id="withdrawModal">
            <div class="withdraw-modal-content">
                <div class="modal-header">
                    <h2>Request Withdrawal</h2>
                    <button class="modal-close" id="withdrawCloseBtn">✕</button>
                </div>

                <div class="alert alert-error" id="errorMsg"></div>
                <div class="alert alert-success" id="successMsg"></div>

                <form id="withdrawForm">
                    <div class="form-group">
                        <label>Available Balance</label>
                        <div class="amount-box">
                            <span id="availBalance">Loading...</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Withdrawal Amount</label>
                        <input 
                            type="number" 
                            id="withdrawAmount" 
                            class="form-input" 
                            placeholder="Enter amount" 
                            step="0.01"
                            min="10"
                            required
                        >
                    </div>

                    <div class="fee-box" id="feeBox">
                        <strong>Processing Fee:</strong> <span id="feeAmount">$0.00</span> (2.5%)
                    </div>

                    <div class="form-group">
                        <label>Withdrawal Method</label>
                        <select id="withdrawMethod" class="form-input" required>
                            <option value="">Select method</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="crypto">Cryptocurrency</option>
                            <option value="wallet">E-Wallet</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Bank Account / Wallet Address</label>
                        <input 
                            type="text" 
                            id="withdrawAccount" 
                            class="form-input" 
                            placeholder="Enter account details"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Notes (Optional)</label>
                        <input 
                            type="text" 
                            id="withdrawNotes" 
                            class="form-input" 
                            placeholder="Additional info..."
                        >
                    </div>

                    <div class="button-group">
                        <button type="button" class="btn btn-cancel" id="withdrawCancelBtn">Cancel</button>
                        <button type="submit" class="btn btn-submit">Request Withdrawal</button>
                    </div>
                </form>
            </div>
        </div>
    `;

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
            background: #fff;
            border-radius: 20px 20px 0 0;
            padding: 24px;
            animation: slideUp 0.4s ease;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .modal-header h2 {
            font-size: 20px;
            font-weight: 700;
        }

        .modal-close {
            background: #f0fdf4;
            border: 0;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 20px;
            transition: 0.2s;
        }

        .modal-close:hover {
            background: #e5e7eb;
        }

        .form-group {
            margin-bottom: 18px;
        }

        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
            color: #333;
        }

        .form-input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            transition: 0.2s;
        }

        .form-input:focus {
            outline: 0;
            border-color: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
        }

        .amount-box {
            background: #f0fdf4;
            border: 1px solid #dcfce7;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            color: #15803d;
            font-size: 16px;
        }

        .fee-box {
            background: #fef3c7;
            border: 1px solid #fde68a;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            color: #92400e;
            margin-bottom: 18px;
            display: none;
        }

        .fee-box.show {
            display: block;
        }

        .alert {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 13px;
            display: none;
        }

        .alert.show {
            display: block;
        }

        .alert-error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
        }

        .alert-success {
            background: #f0fdf4;
            border: 1px solid #86efac;
            color: #166534;
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }

        .btn {
            flex: 1;
            padding: 12px;
            border: 0;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
        }

        .btn-cancel {
            background: #f1f5f9;
            color: #475569;
        }

        .btn-submit {
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
            transform: translateY(-1px);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (min-width: 769px) {
            .withdraw-modal {
                display: none !important;
            }
        }
    `;

    function init() {
        const style = document.createElement('style');
        style.textContent = modalCSS;
        document.head.appendChild(style);

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('withdrawModal');
        const form = document.getElementById('withdrawForm');
        const closeBtn = document.getElementById('withdrawCloseBtn');
        const cancelBtn = document.getElementById('withdrawCancelBtn');
        const amountInput = document.getElementById('withdrawAmount');
        const feeBox = document.getElementById('feeBox');
        const feeAmount = document.getElementById('feeAmount');
        const availBalance = document.getElementById('availBalance');
        const errorMsg = document.getElementById('errorMsg');
        const successMsg = document.getElementById('successMsg');
        const submitBtn = form.querySelector('button[type="submit"]');

        let userData = null;

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            form.reset();
            errorMsg.classList.remove('show');
            successMsg.classList.remove('show');
            feeBox.classList.remove('show');
        };

        const loadBalance = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    availBalance.textContent = '$0.00';
                    errorMsg.textContent = 'Please log in';
                    errorMsg.classList.add('show');
                    return;
                }

                const snap = await get(ref(database, `users/${user.uid}`));
                if (snap.exists()) {
                    userData = snap.val();
                    const bal = userData.wallet?.usdBalance || 0;
                    availBalance.textContent = `$${bal.toFixed(2)}`;
                    errorMsg.classList.remove('show');
                } else {
                    availBalance.textContent = '$0.00';
                }
            } catch (err) {
                console.error('Error:', err);
                errorMsg.textContent = 'Failed to load balance';
                errorMsg.classList.add('show');
            }
        };

        window.openWithdrawModal = async () => {
            if (window.innerWidth <= 768) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                availBalance.textContent = 'Loading...';
                await loadBalance();
            }
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        amountInput.addEventListener('input', () => {
            const amt = parseFloat(amountInput.value) || 0;
            if (amt > 0) {
                feeAmount.textContent = `$${(amt * 0.025).toFixed(2)}`;
                feeBox.classList.add('show');
            } else {
                feeBox.classList.remove('show');
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const amount = parseFloat(amountInput.value);
            const method = document.getElementById('withdrawMethod').value;
            const account = document.getElementById('withdrawAccount').value;
            const notes = document.getElementById('withdrawNotes').value;

            errorMsg.classList.remove('show');
            successMsg.classList.remove('show');

            if (amount < 10) {
                errorMsg.textContent = 'Minimum withdrawal is $10';
                errorMsg.classList.add('show');
                return;
            }

            if (!userData || amount > (userData.wallet?.usdBalance || 0)) {
                errorMsg.textContent = 'Insufficient balance';
                errorMsg.classList.add('show');
                return;
            }

            if (!method || !account) {
                errorMsg.textContent = 'Please fill all required fields';
                errorMsg.classList.add('show');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            try {
                const user = auth.currentUser;
                if (!user) throw new Error('Not authenticated');

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

                const newWithdrawal = push(ref(database, 'pendingWithdrawals'));
                await set(newWithdrawal, withdrawalData);

                // Deduct from user balance
                const snap = await get(ref(database, `users/${user.uid}`));
                const userData = snap.val();
                const available = (userData.available || 0) - amount;
                const totalBalance = (userData.totalBalance || 0) - amount;

                await update(ref(database, `users/${user.uid}`), {
                    'available': Math.max(0, available),
                    'totalBalance': Math.max(0, totalBalance)
                });

                successMsg.textContent = 'Withdrawal request submitted!';
                successMsg.classList.add('show');

                await loadBalance();

                setTimeout(closeModal, 2000);

            } catch (err) {
                console.error('Error:', err);
                errorMsg.textContent = err.message || 'Request failed';
                errorMsg.classList.add('show');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Request Withdrawal';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
