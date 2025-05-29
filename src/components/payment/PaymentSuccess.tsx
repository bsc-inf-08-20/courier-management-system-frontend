// src/components/PaymentSuccess.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PaymentStatus } from "@/types";

interface PaymentSuccessProps {
  paymentData: PaymentStatus;
}

export default function PaymentSuccess({ paymentData }: PaymentSuccessProps) {
  const handlePrintReceipt = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md print:shadow-none print:mt-0"
    >
      {/* Header with success icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600">
          Your payment of{" "}
          <span className="font-semibold">
            {paymentData.amount} {paymentData.currency}
          </span>{" "}
          has been processed successfully.
        </p>
      </motion.div>

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200"
      >
        <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">
          Transaction Details
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Reference Number:</span>
            <span className="font-medium text-gray-800">
              {paymentData.reference}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium text-gray-800 break-all">
              {paymentData.tx_ref}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-medium text-gray-800">
              {formatDate(paymentData.created_at)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600 capitalize">
              {paymentData.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium text-gray-800 capitalize">
              {paymentData.authorization.channel || "Unknown"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Fee:</span>
            <span className="font-medium text-gray-800">
              {paymentData.charges} {paymentData.currency}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Customer Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-200"
      >
        <h3 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">
          Customer Information
        </h3>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Name:</span>{" "}
            {paymentData.customer.first_name} {paymentData.customer.last_name}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span>{" "}
            {paymentData.customer.email}
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row justify-center gap-4 mt-6 print:hidden"
      >
        <button
          onClick={handlePrintReceipt}
          className="px-6 py-2 bg-gray-100 border border-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
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
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Receipt
        </button>
        <Link
          href="/customer/tracking"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
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
              d="M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 012-2h14a2 2 0 012 2v9.382a2 2 0 01-0.553 1.894L15 20m-6 0V10m6 10V10"
            />
          </svg>
          Track Package
        </Link>
      </motion.div>

      {/* Print-only receipt styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:shadow-none,
          .print\:shadow-none * {
            visibility: visible;
          }
          .print\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            box-shadow: none;
            margin: 0;
            padding: 20px;
          }
          .print\:mt-0 {
            margin-top: 0;
          }
        }
      `}</style>
    </motion.div>
  );
}
