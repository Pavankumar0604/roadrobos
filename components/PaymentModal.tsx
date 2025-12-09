import React, { useEffect, useState } from 'react';
import { XIcon, ShieldCheckIcon } from './icons/Icons';
import { RAZORPAY_KEY_ID } from '../constants';
import { paymentAPI } from '../src/api';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
    loadRazorpayScript: (src: string) => Promise<unknown>;
  }
}

interface PaymentModalProps {
  amount: number;
  bookingId?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * RAZORPAY LIVE MODE - Payment Modal Component
 * This component handles the complete payment flow for live mode:
 * 1. Creates order on backend with Razorpay API
 * 2. Initializes Razorpay checkout
 * 3. Handles payment success/failure
 * 4. Verifies payment signature on backend
 * 5. Shows success modal with transaction ID
 */
const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  bookingId,
  userId,
  customerName = 'Customer',
  customerEmail = 'customer@example.com',
  customerPhone = '9999999999',
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const displayRazorpay = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Load Razorpay SDK
      const scriptLoaded = await window.loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Step 2: Create Order on Backend (LIVE MODE)
      console.log('[RAZORPAY LIVE] Creating order...', { amount, bookingId, userId });

      const orderResponse = await paymentAPI.createOrder({
        amount,
        currency: 'INR',
        bookingId,
        userId,
        customerName,
      });

      if (!orderResponse.success || !orderResponse.order_id) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      console.log('[RAZORPAY LIVE] Order created:', orderResponse.order_id);

      // Step 3: Initialize Razorpay Checkout
      const options = {
        key: orderResponse.key || RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'RoAd RoBos',
        description: 'Bike Rental Payment',
        order_id: orderResponse.order_id,

        // Payment success handler
        handler: async function (response: any) {
          console.log('[RAZ ORPAY LIVE] Payment successful, verifying...', response);

          try {
            // Step 4: Verify Payment on Backend
            const verificationResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId,
            });

            if (verificationResponse.success) {
              console.log('[RAZORPAY LIVE] Payment verified successfully');
              onSuccess(); // Proceed directly to booking confirmation
              setLoading(false);
            } else {
              throw new Error(verificationResponse.message || 'Payment verification failed');
            }
          } catch (verifyError: any) {
            console.error('[RAZORPAY LIVE] Verification error:', verifyError);
            setError(`Payment verification failed: ${verifyError.message}`);
            setLoading(false);
          }
        },

        // Prefill customer data
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },

        // Theme customization
        theme: {
          color: '#084C3E', // Primary brand color
        },

        // Modal configuration
        modal: {
          ondismiss: function () {
            console.log('[RAZORPAY LIVE] Payment cancelled by user');
            setLoading(false);
          }
        },
      };

      // Open Razorpay checkout
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const paymentObject = new window.Razorpay(options);

      // Payment failure handler
      paymentObject.on('payment.failed', function (response: any) {
        console.error('[RAZORPAY LIVE] Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setLoading(false);
      });

      paymentObject.open();

    } catch (error: any) {
      console.error('[RAZORPAY LIVE] Error:', error);
      setError(error.message || 'An error occurred during payment');
      setLoading(false);
    }
  };



  return (
    <div
      className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-2">
            <img
              src="https://listingprowp.com/wp-content/uploads/2020/09/RAZORPAY_DetailsPage.png"
              alt="Razorpay Logo"
              className="h-6"
            />
            <h2 className="text-lg font-semibold text-primary">Secure Checkout</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close payment modal"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-600 text-sm mb-1">Total Amount</p>
          <p className="text-4xl font-bold text-primary mb-6">₹{amount.toFixed(2)}</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Payment Error</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={displayRazorpay}
            disabled={loading}
            className="w-full bg-gradient-to-r from-secondary to-primary text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Pay Securely with Razorpay</span>
              </>
            )}
          </button>

          {/* Payment Info */}
          {bookingId && (
            <p className="mt-4 text-xs text-gray-500">
              Booking ID: <span className="font-mono font-semibold">{bookingId}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-xl text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
            <span>256-bit SSL Encrypted</span>
            <span className="text-gray-400">|</span>
            <span>Powered by Razorpay</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;