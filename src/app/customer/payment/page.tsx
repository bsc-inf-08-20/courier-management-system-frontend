// src/app/payment/page.tsx
import PaymentForm from "@/components/payment/PaymentForm";

export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Make a Payment</h1>
      <div className="mt-8">
        <PaymentForm />
      </div>
    </div>
  );
}