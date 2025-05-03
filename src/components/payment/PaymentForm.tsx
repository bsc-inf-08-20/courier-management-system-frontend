// src/components/PaymentForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface PaymentStatus {
  tx_ref: string;
  currency: string;
  amount: number;
  status: string;
  created_at: string;
  // Add other fields you expect from the payment response
  customer?: {
    email: string;
    first_name: string;
    last_name: string;
  };
  authorization?: {
    channel: string;
    completed_at: string;
  };
}

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
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Payment Successful</h2>
        
        <div className="mb-4 p-4 bg-green-100 rounded-md">
          <p className="text-green-700 font-medium">Thank you for your payment!</p>
        </div>
        
        <div className="space-y-3">
          <p><span className="font-medium">Transaction Reference:</span> {paymentStatus.tx_ref}</p>
          <p><span className="font-medium">Amount:</span> {paymentStatus.amount} {paymentStatus.currency}</p>
          <p><span className="font-medium">Status:</span> {paymentStatus.status}</p>
          <p><span className="font-medium">Date:</span> {new Date(paymentStatus.created_at).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Payment Details</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}