// src/components/PaymentForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentSuccess from './PaymentSuccess';
import { motion } from 'framer-motion';
import { PaymentStatus } from '@/types';

export default function PaymentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    amount: '',
  });

  useEffect(() => {
    if (txRef) {
      verifyPayment(txRef);
    }
  }, [txRef]);

  const verifyPayment = async (txRef: string) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/verify-payment?tx_ref=${txRef}`);
      const result = await response.json();
      
      if (result.success) {
        setPaymentStatus(result.paymentData);
        setSuccess(true);
      } else {
        setError(result.message || 'Payment verification failed');
      }
    } catch (err) {
      setError('An error occurred while verifying your payment');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.amount) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(Number(formData.amount))) {
      setError('Amount must be a valid number');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          amount: formData.amount
        })
      });

      const result = await response.json();
      
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.message || 'Payment initiation failed');
      }
    } catch (err) {
      setError('An error occurred while processing your payment');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && paymentStatus) {
    return <PaymentSuccess paymentData={paymentStatus} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Payment Details</h2>
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-md"
        >
          {error}
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="amount">
            Amount (MWK)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } flex items-center justify-center gap-2`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Pay Now
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}