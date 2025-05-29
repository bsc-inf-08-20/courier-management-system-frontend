"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

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
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700">
            Page Not Found
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
            been moved or deleted.
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="px-6"
          >
            Go Back
          </Button>
          <Link href="/">
            <Button className="px-6">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
