// src/app/customer/payment/return/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { PaymentStatus } from '@/types';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import { useSearchParams } from 'next/navigation';

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (txRef) {
      verifyPayment(txRef);
    } else {
      setError('No transaction reference found');
      setLoading(false);
    }
  }, [txRef]);

  const verifyPayment = async (txRef: string) => {
    try {
      const response = await fetch(`/api/verify-payment?tx_ref=${txRef}`);
      const result = await response.json();
      
      if (result.success) {
        setPaymentData(result.paymentData);
      } else {
        setError(result.message || 'Payment verification failed');
      }
    } catch (err) {
      setError('An error occurred while verifying your payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Verifying payment...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Payment Verification Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Payment Status</h2>
        <p>No payment data available</p>
      </div>
    );
  }

  return <PaymentSuccess paymentData={paymentData} />;
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading payment details...</div>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
