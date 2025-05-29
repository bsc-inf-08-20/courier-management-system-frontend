"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import PaymentSuccess from "./PaymentSuccess";
import { PaymentStatus } from "@/types";
import { User, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function PaymentForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, ] = useState(false);
  const [paymentStatus, ] = useState<PaymentStatus | null>(
    null
  );

  useEffect(() => {
    // Auto-fill form from URL params
    const name = searchParams.get("name") || "";
    setFormData({
      firstName: name.split(" ")[0] || "",
      lastName: name.split(" ").slice(1).join(" ") || "",
      email: searchParams.get("email") || "",
      amount: searchParams.get("amount") || "",
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          booking_id: searchParams.get("booking_id"),
        }),
      });

      const result = await response.json();

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.message || "Payment initiation failed");
      }
    } catch (err) {
      setError("An error occurred while processing your payment");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && paymentStatus) {
    return <PaymentSuccess paymentData={paymentStatus} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header Card */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Payment Details
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your payment to confirm your booking
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/90">Base Pickup Fee</span>
                <span className="font-medium">
                  {searchParams.get("baseFee")} MWK
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90 flex-shrink">
                  Route Fee ({searchParams.get("origin")} →{" "}
                  {searchParams.get("destination")})
                </span>
                <span className="font-medium">
                  {searchParams.get("routeFee")} MWK
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">
                  Weight Fee ({searchParams.get("weight")} kg)
                </span>
                <span className="font-medium">
                  {searchParams.get("weightFee")} MWK
                </span>
              </div>
              {searchParams.get("delivery_type") === "delivery" && (
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Home Delivery Fee</span>
                  <span className="font-medium">
                    {searchParams.get("homeDeliveryFee")} MWK
                  </span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-white/20 flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {searchParams.get("amount")} MWK
                </span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start"
              >
                <div className="mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="pl-10 block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="pl-10 block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (MWK)
                </label>
                <div className="relative">
                  {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div> */}
                  <input
                    type="text"
                    id="amount"
                    value={formData.amount}
                    className="pl-10 block w-full bg-gray-50 shadow-sm border-gray-300 rounded-md text-gray-700 font-medium p-3"
                    required
                    disabled={true}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-md shadow-sm text-white font-medium transition-all duration-200 ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Security Note */}
            <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Your payment information is secure</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Courier Management Information System</p>
        </div>
      </motion.div>
    </div>
  );
}
