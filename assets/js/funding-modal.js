// Funding Modal System - Firebase Module Version
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { auth, database } from "./lib/firebase.js";

(function() {
    // Create modal HTML
    const modalHTML = `
        <div class="funding-modal" id="fundingModal">
            <div class="funding-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Fund Your Account</h2>
                    <button class="modal-close-btn" id="fundingCloseBtn">✕</button>
                </div>

                <div class="error-message" id="fundingErrorMessage"></div>
                <div class="success-message" id="fundingSuccessMessage"></div>

                <form id="fundingForm">
                    <div class="form-group">
                        <label class="form-label">Current Balance</label>
                        <div class="amount-info">
                            <div class="info-row">
                                <span class="info-label">Available:</span>
                                <span class="info-value" id="currentBalance">Loading...</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Funding Amount</label>
                        <input 
                            type="number" 
                            class="form-input" 
                            id="fundingAmount" 
                            placeholder="Enter amount to add" 
                            step="0.01"
                            min="50"
                            required
                        >
                        <small class="form-hint">Minimum funding amount is $50</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Payment Method</label>
                        <select class="form-select" id="paymentMethod" required>
                            <option value="">Select payment method</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="crypto">Cryptocurrency</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>

                    <div class="payment-details" id="paymentDetails" style="display: none;">
                        <div class="details-card">
                            <div class="details-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="details-content" id="paymentDetailsContent"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Transaction Reference (Optional)</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            id="transactionRef" 
                            placeholder="Enter transaction reference or receipt number"
                        >
                    </div>

                    <div class="button-group">
                        <button type="button" class="btn btn-cancel" id="fundingCancelBtn">Cancel</button>
                        <button type="submit" class="btn btn-fund" id="submitFundingBtn">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Create modal CSS
    const modalCSS = `
        .funding-modal {
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

        .funding-modal.active {
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

        .funding-modal-content {
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

        .form-hint {
            display: block;
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
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

        .payment-details {
            margin-bottom: 20px;
        }

        .details-card {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 14px;
            display: flex;
            gap: 12px;
        }

        .details-icon {
            color: #3b82f6;
            font-size: 20px;
            flex-shrink: 0;
        }

        .details-content {
            font-size: 13px;
            color: #1e40af;
            line-height: 1.6;
        }

        .details-content strong {
            display: block;
            margin-bottom: 4px;
            color: #1e3a8a;
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

        .btn-fund {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-fund:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .btn-fund:active:not(:disabled) {
            transform: translateY(0);
        }

        .btn-fund:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (min-width: 769px) {
            .funding-modal {
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
        const fundingModal = document.getElementById('fundingModal');
        const fundingForm = document.getElementById('fundingForm');
        const fundingCloseBtn = document.getElementById('fundingCloseBtn');
        const fundingCancelBtn = document.getElementById('fundingCancelBtn');
        const fundingAmount = document.getElementById('fundingAmount');
        const paymentMethod = document.getElementById('paymentMethod');
        const paymentDetails = document.getElementById('paymentDetails');
        const paymentDetailsContent = document.getElementById('paymentDetailsContent');
        const currentBalance = document.getElementById('currentBalance');
        const errorMessage = document.getElementById('fundingErrorMessage');
        const successMessage = document.getElementById('fundingSuccessMessage');
        const submitFundingBtn = document.getElementById('submitFundingBtn');

        let userData = null;

        // Payment method details
        const paymentInstructions = {
            bank: {
                title: 'Bank Transfer Instructions',
                content: `
                    <strong>Bank Transfer Details:</strong>
                    Bank Name: BluStone Bank<br>
                    Account Number: 1234567890<br>
                    Account Name: BluStone Investment<br>
                    Routing Number: 123456789<br><br>
                    Please include your transaction reference after transfer.
                `
            },
            crypto: {
                title: 'Cryptocurrency Payment',
                content: `
                    <strong>Crypto Wallet Address:</strong>
                    Bitcoin (BTC): bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh<br>
                    Ethereum (ETH): 0x71C7656EC7ab88b098defB751B7401B5f6d8976F<br>
                    USDT (TRC20): THXmJFkZPwKYXyq8FMWFkMZMJ5qTkFSYb9<br><br>
                    Send exact amount and provide transaction hash.
                `
            },
            card: {
                title: 'Card Payment',
                content: `
                    <strong>Card Payment Processing:</strong>
                    Your card payment will be processed securely.<br>
                    Processing time: Instant<br>
                    A small verification charge may appear temporarily.<br><br>
                    Click Submit to proceed to payment gateway.
                `
            },
            paypal: {
                title: 'PayPal Payment',
                content: `
                    <strong>PayPal Payment:</strong>
                    Email: payments@blustone.com<br>
                    Please send as "Friends & Family" to avoid fees.<br>
                    Include your account email in the note.<br><br>
                    Processing time: 1-2 hours
                `
            }
        };

        // Load user balance
        async function loadUserBalance() {
            try {
                const user = auth.currentUser;
                if (!user) {
                    currentBalance.textContent = '$0.00';
                    errorMessage.textContent = 'Please log in to fund your account';
                    errorMessage.classList.add('show');
                    return;
                }

                const userRef = ref(database, 'users/' + user.uid);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    userData = snapshot.val();
                    const balance = userData.available || 0;
                    currentBalance.textContent = `$${balance.toFixed(2)}`;
                    errorMessage.classList.remove('show');
                } else {
                    currentBalance.textContent = '$0.00';
                    errorMessage.textContent = 'User data not found';
                    errorMessage.classList.add('show');
                }
            } catch (error) {
                console.error('Error loading balance:', error);
                currentBalance.textContent = '$0.00';
                errorMessage.textContent = `Error loading balance: ${error.message}`;
                errorMessage.classList.add('show');
            }
        }

        // Public function to open modal
        window.openFundingModal = async function() {
            if (window.innerWidth <= 768) {
                fundingModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                currentBalance.textContent = 'Loading...';
                await loadUserBalance();
            }
        };

        // Close modal function
        function closeFundingModal() {
            fundingModal.classList.remove('active');
            document.body.style.overflow = '';
            fundingForm.reset();
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');
            paymentDetails.style.display = 'none';
        }

        // Close button listeners
        fundingCloseBtn.addEventListener('click', closeFundingModal);
        fundingCancelBtn.addEventListener('click', closeFundingModal);

        // Close when clicking outside
        fundingModal.addEventListener('click', (e) => {
            if (e.target === fundingModal) {
                closeFundingModal();
            }
        });

        // Show payment details based on method
        paymentMethod.addEventListener('change', () => {
            const method = paymentMethod.value;
            if (method && paymentInstructions[method]) {
                paymentDetailsContent.innerHTML = paymentInstructions[method].content;
                paymentDetails.style.display = 'block';
            } else {
                paymentDetails.style.display = 'none';
            }
        });

        // Listen for iframe messages
        window.addEventListener('message', (event) => {
            if (event.data.type === 'OPEN_FUNDING_MODAL') {
                window.openFundingModal();
            }
        });

        // Form submission
        fundingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const amount = parseFloat(fundingAmount.value);
            const method = paymentMethod.value;
            const transactionRef = document.getElementById('transactionRef').value;

            // Clear previous messages
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');

            // Validation
            if (amount < 50) {
                errorMessage.textContent = 'Minimum funding amount is $50';
                errorMessage.classList.add('show');
                return;
            }

            if (!method) {
                errorMessage.textContent = 'Please select a payment method';
                errorMessage.classList.add('show');
                return;
            }

            submitFundingBtn.disabled = true;
            submitFundingBtn.textContent = 'Processing...';

            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('User not authenticated');
                }

                // Create funding request
                const fundingData = {
                    userId: user.uid,
                    amount: amount,
                    method: method,
                    transactionRef: transactionRef || 'N/A',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    userEmail: user.email || ''
                };

                // Add to funding requests in Realtime Database
                const fundingRef = ref(database, 'fundingRequests');
                const newFundingRef = push(fundingRef);
                await set(newFundingRef, fundingData);

                successMessage.textContent = 'Funding request submitted successfully! Your account will be credited once payment is verified.';
                successMessage.classList.add('show');
                errorMessage.classList.remove('show');

                setTimeout(() => {
                    closeFundingModal();
                }, 3000);

            } catch (error) {
                console.error('Funding error:', error);
                errorMessage.textContent = error.message || 'An error occurred while processing your request';
                errorMessage.classList.add('show');
            } finally {
                submitFundingBtn.disabled = false;
                submitFundingBtn.textContent = 'Submit Request';
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
