"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/customer/auth");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Book a Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Schedule a new pickup and delivery.</p>
              <Button asChild>
                <Link href="/customer/booking">Book Now</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span>Booking #12345 - In Transit</span>
                  <Button variant="link" asChild>
                    <Link href="/customer/tracking">Track</Link>
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span>Booking #12346 - Pending</span>
                  <Button variant="link" asChild>
                    <Link href="/customer/tracking">Track</Link>
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}