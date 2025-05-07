"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="relative w-48 h-24 mx-auto mb-8">
          <Image
            src="/truck.svg"
            alt="Company Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-700">
            Something went wrong!
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>

        <Button onClick={reset} className="px-6 mt-4">
          Try Again
        </Button>
      </div>
    </div>
  );
}
