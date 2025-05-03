// src/app/customer/payment/return/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentSuccess from '@/components/payment/PaymentSuccess';

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (txRef) {
      fetch(`/api/verify-payment?tx_ref=${txRef}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setPaymentData(data.paymentData);
        });
    }
  }, [txRef]);

  if (!paymentData) return <div>Loading...</div>;

  return <PaymentSuccess paymentData={paymentData} />;
}
