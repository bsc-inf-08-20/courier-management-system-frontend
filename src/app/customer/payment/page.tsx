export default function PaymentPage() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Make a Payment</h1>
        
        {/* Import the form component - no need for 'use client' here since this is a server component */}
        <div className="mt-8">
          {/* ts-expect-error Server Component */}
          <PaymentForm />
        </div>
      </div>
    );
  }
  
  import PaymentForm from "@/components/payment/PaymentForm";