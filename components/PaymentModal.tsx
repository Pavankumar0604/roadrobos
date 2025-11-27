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

    // 2. Create Order on Server
    const orderResponse = await fetch('http://localhost:3000/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in Rupees (server converts to paise)
        currency: 'INR',
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      let errorMessage = 'Unknown error';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || `Server Error (${orderResponse.status})`;
      }
      alert(`Error creating order: ${errorMessage}`);
      setLoading(false);
      return;
    }

    const orderData = await orderResponse.json();

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'RoAd RoBos',
      description: 'Bike Rental Payment',
      order_id: orderData.id,
      handler: async function (response: any) {
        // 4. Handle success and verify payment on server
        const verificationResponse = await fetch('http://localhost:3000/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verificationData = await verificationResponse.json();

        if (verificationData.status === 'success') {
          onSuccess();
        } else {
          alert('Payment verification failed. Please contact support.');
        }
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

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
      alert(`Payment failed: ${response.error.description}`);
      console.error(response.error);
    });
    paymentObject.open();
    setLoading(false);
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
                <img src="https://listingprowp.com/wp-content/uploads/2020/09/RAZORPAY_DetailsPage.png" alt="Razorpay Logo" className="h-6"/>
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