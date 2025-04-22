// src/app/customer/payment/return/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PaymentDetails {
  event_type: string;
  tx_ref: string;
  status: string;
  reference: string;
  currency: string;
  amount: number;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  authorization: {
    channel: string;
    completed_at: string;
  };
}

export default function PaymentReturn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');
  const status = searchParams.get('status');
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!tx_ref) {
        setIsLoading(false);
        setMessage('No transaction reference found.');
        return;
      }

      try {
        const response = await fetch(`/api/verify-payment/${tx_ref}`);
        const result = await response.json();

        if (result.success && result.payment) {
          setPaymentDetails(result.payment);
          
          // Set appropriate message based on verification result
          if (result.payment.status === 'success') {
            setMessage('Payment verified successfully! Thank you for your payment.');
          } else {
            setMessage(`Payment status: ${result.payment.status}. Please contact support if you have any questions.`);
          }
        } else {
          setVerificationError(result.message || 'Could not verify payment status');
          
          // Fall back to status from URL parameters
          if (status === 'failed') {
            setMessage('Payment was unsuccessful. Please try again.');
          } else if (status === 'successful') {
            setMessage('Payment completed successfully! Thank you for your payment.');
          } else {
            setMessage('Payment status unknown. Please contact support if you have any questions.');
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationError('Failed to verify payment status');
        
        // Fall back to status from URL parameters
        if (status === 'failed') {
          setMessage('Payment was unsuccessful. Please try again.');
        } else if (status === 'successful') {
          setMessage('Payment completed successfully! Thank you for your payment.');
        } else {
          setMessage('Payment status unknown. Please contact support if you have any questions.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [tx_ref, status]);

  const handleGoHome = () => {
    router.push('/'); // Navigate to home page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-medium mb-4">Verifying payment status...</div>
        </div>
      </div>
    );
  }

  const isSuccessful = paymentDetails?.status === 'success' || status === 'successful';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Payment {isSuccessful ? 'Successful' : 'Failed'}
        </h1>
        
        <div className={`p-4 mb-6 rounded-md ${
          isSuccessful ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <p className="text-center">{message}</p>
          
          {verificationError && (
            <p className="mt-2 text-center text-sm text-red-600">
              {verificationError}
            </p>
          )}
          
          {tx_ref && (
            <p className="mt-2 text-center text-sm">
              Transaction Reference: <span className="font-mono">{tx_ref}</span>
            </p>
          )}
        </div>
        
        {paymentDetails && (
          <div className="mb-6 border border-gray-200 rounded-md p-4">
            <h2 className="font-semibold text-lg mb-2">Payment Details</h2>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Amount:</div>
              <div>{paymentDetails.amount} {paymentDetails.currency}</div>
              
              <div className="font-medium">Reference:</div>
              <div className="font-mono">{paymentDetails.reference}</div>
              
              <div className="font-medium">Customer:</div>
              <div>{paymentDetails.customer.first_name} {paymentDetails.customer.last_name}</div>
              
              <div className="font-medium">Email:</div>
              <div>{paymentDetails.customer.email}</div>
              
              <div className="font-medium">Payment Method:</div>
              <div>{paymentDetails.authorization.channel}</div>
              
              <div className="font-medium">Date:</div>
              <div>{new Date(paymentDetails.authorization.completed_at).toLocaleDateString()}</div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button 
            onClick={handleGoHome}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Home
          </button>
          
          {!isSuccessful && (
            <Link href="/customer/payment" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center">
              Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}