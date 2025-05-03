// src/app/customer/payment/page.tsx
import { Suspense } from 'react';
import PaymentForm from '@/components/payment/PaymentForm';

export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Make a Payment</h1>
      <Suspense fallback={<div>Loading payment form...</div>}>
        <PaymentForm />
      </Suspense>
    </div>
  );
}