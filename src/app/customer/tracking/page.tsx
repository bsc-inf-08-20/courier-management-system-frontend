"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Truck, Package, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StatusItem {
  status: "Pending Pick-Up" | "Picked Up" | "In Transit" | "Out for Delivery" | "Delivered";
  timestamp: string;
}

interface TrackingData {
  id: string;
  statuses: StatusItem[];
}

export default function Tracking() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mockData: TrackingData = {
    id: "12345",
    statuses: [
      { status: "Pending Pick-Up", timestamp: "2025-03-04 08:00 AM" },
      { status: "Picked Up", timestamp: "2025-03-04 09:30 AM" },
      { status: "In Transit", timestamp: "2025-03-04 10:00 AM" },
      { status: "Out for Delivery", timestamp: "2025-03-04 02:00 PM" },
      { status: "Delivered", timestamp: "2025-03-04 03:15 PM" },
    ],
  };

  useEffect(() => {
    if (!isAuthenticated) router.push("/customer/auth");
  }, [isAuthenticated, router]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (trackingId === "12345") {
        setTrackingResult(mockData);
        setError("");
      } else {
        setTrackingResult(null);
        setError("No package found with this ID.");
      }
      setLoading(false);
    }, 1000);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-2xl mx-auto px-6 py-8">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-gray-800 mb-6"
        >
          Track Your Package
        </motion.h2>
        <form onSubmit={handleTrack} className="flex gap-4 mb-8">
          <Input
            placeholder="Booking ID (e.g., 12345)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Tracking..." : "Track"}
          </Button>
        </form>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {trackingResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold mb-4">
              Booking #{trackingResult.id}
            </h3>
            <div className="space-y-4">
              {trackingResult.statuses.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  {s.status === "Delivered" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : s.status === "Picked Up" ? (
                    <Truck className="h-5 w-5 text-blue-600" />
                  ) : s.status === "In Transit" ? (
                    <MapPin className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Package className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium">{s.status}</p>
                    <p className="text-sm text-gray-500">{s.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}