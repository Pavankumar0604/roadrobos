import React, { useEffect, useState } from 'react';
import { XIcon, ShieldCheckIcon } from './icons/Icons';
import { RAZORPAY_KEY_ID } from '../constants';

// Assuming loadRazorpayScript is globally available or imported from index.tsx
declare global {
  interface Window {
    Razorpay: any;
    loadRazorpayScript: (src: string) => Promise<unknown>;
  }
}

interface PaymentModalProps {
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const displayRazorpay = async () => {
    setLoading(true);

    // 1. Load Razorpay script
    const res = await window.loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Are you connected to the internet?');
      setLoading(false);
      return;
    }

    // 2. Create Order (Mocking server behavior)
    // In a real app, this fetch would go to your backend
    // const orderResponse = await fetch('/api/order', ...);

    // Mocking the order data for frontend testing
    const mockOrderId = `order_${Date.now()}`;
    const orderData = {
      id: mockOrderId,
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: 'INR'
    };

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'RoAd RoBos',
      description: 'Bike Rental Payment',
      // order_id: orderData.id, // Note: In test mode, Razorpay might complain about invalid order_id if it's not from their server. 
      // For pure frontend testing without backend, we might need to remove order_id or use a valid test order ID if strict.
      // However, for test mode, usually passing a random string works or omitting it. 
      // Let's try omitting order_id for pure client-side test if the mock ID fails, 
      // but standard integration requires it. 
      // actually, for client-side testing without generating an order on razorpay, 
      // we can't pass a fake order_id. We should omit it for "Test" mode if we aren't hitting Razorpay API to create order.
      // order_id: orderData.id, // Commented out for client-only test. Uncomment if you have a real backend generating orders.

      handler: async function (response: any) {
        // 4. Handle success and verify payment (Mocking server verification)
        console.log('Payment successful:', response);

        // Mock verification
        // const verificationResponse = await fetch('/api/verify', ...);

        // Simulate success
        setTimeout(() => {
          onSuccess();
        }, 1000);
      },
      prefill: {
        name: 'Customer Name', // Replace with actual user data
        email: 'customer@example.com', // Replace with actual user data
        contact: '9999999999', // Replace with actual user data
      },
      theme: {
        color: '#F97316', // Tailwind orange-600
      },
    };

    try {
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not found on window object.");
      }
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
        console.error(response.error);
      });
      paymentObject.open();
    } catch (error: any) {
      console.error("Razorpay Error:", error);
      alert(`Payment initialization failed: ${error.message}`);
    } finally {
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
        className="bg-white rounded-xl shadow-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="https://listingprowp.com/wp-content/uploads/2020/09/RAZORPAY_DetailsPage.png" alt="Razorpay Logo" className="h-6" />
            <h2 className="text-lg font-semibold text-primary">Checkout</h2>
          </div>
          <button onClick={onClose} aria-label="Close payment modal">
            <XIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600">Total Amount</p>
          <p className="text-3xl font-bold text-primary mt-2 mb-6">₹{amount.toFixed(2)}</p>

          <button
            onClick={displayRazorpay}
            disabled={loading}
            className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay with Razorpay'}
          </button>

        </div>

        <div className="p-4 bg-gray-50/70 rounded-b-xl text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-secondary" />
          <span>Secure Payments by Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;