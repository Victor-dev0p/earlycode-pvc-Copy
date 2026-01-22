'use client';

import { useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function PaymentModal({ course, amount, onClose, onPaymentComplete }) {
  const [loading, setLoading] = useState(false);

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOXDEMOKEY-X',
    tx_ref: `COURSE_${Date.now()}`,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : '',
      name: typeof window !== 'undefined' ? sessionStorage.getItem('userEmail')?.split('@')[0] : '',
    },
    customizations: {
      title: 'PVC Course Selection',
      description: `Payment for ${course.courseName}`,
      logo: 'https://yourdomain.com/logo.png', // Replace with your logo URL
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePayment = () => {
    setLoading(true);
    
    handleFlutterPayment({
      callback: (response) => {
        console.log('Payment response:', response);
        
        if (response.status === 'successful') {
          // Payment successful
          onPaymentComplete(response.transaction_id);
          closePaymentModal();
        } else {
          // Payment failed or cancelled
          alert('Payment was not completed. Please try again.');
        }
        
        setLoading(false);
      },
      onClose: () => {
        setLoading(false);
        console.log('Payment modal closed');
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-yellow-400 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">Complete Payment</h3>
              <p className="text-blue-50 text-sm">Additional Course Fee</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Course Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Course</p>
            <p className="font-bold text-gray-800">{course.courseName || course.title}</p>
          </div>

          {/* Amount */}
          <div className="bg-yellow-50 rounded-xl p-6 mb-6 border-2 border-yellow-200 text-center">
            <p className="text-sm text-yellow-700 mb-2">Amount to Pay</p>
            <p className="text-4xl sm:text-5xl font-bold text-yellow-600">₦{amount.toLocaleString()}</p>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Note:</strong> This is a one-time fee for selecting an additional course. 
              You'll need to pass an interview for this course before you can start teaching it.
            </p>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Pay ₦{amount.toLocaleString()}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Secure payment powered by Flutterwave
          </p>
        </div>
      </div>
    </div>
  );
}