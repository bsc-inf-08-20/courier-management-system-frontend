'use client'
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Truck, Package, MapPin } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Tracking() {
  // State for tracking ID and result
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<{
    id: string;
    statuses: { status: string; timestamp: string; details?: string }[];
  } | null>(null);
  const [error, setError] = useState("");

  // Mock data for demonstration (replace with API call later)
  const mockTrackingData = {
    id: "12345",
    statuses: [
      { status: "Pending Pick-Up", timestamp: "2025-03-04 08:00 AM" },
      { status: "Picked Up", timestamp: "2025-03-04 09:30 AM", details: "Agent: John" },
      { status: "In Transit", timestamp: "2025-03-04 10:00 AM" },
      { status: "Out for Delivery", timestamp: "2025-03-04 02:00 PM", details: "Agent: Mary" },
      { status: "Delivered", timestamp: "2025-03-04 03:15 PM" },
    ],
  };

  // Handle tracking
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (trackingId === "12345") {
      setTrackingResult(mockTrackingData);
    } else {
      setTrackingResult(null);
      setError("No package found with this ID.");
    }
  };

  const handleRefresh = () => {
    if (trackingId === "12345") {
      setTrackingResult({ ...mockTrackingData, statuses: [...mockTrackingData.statuses] }); // Simulate refresh
    }
  };

 return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Track My Package</h2>
        <form onSubmit={handleTrack} className="flex space-x-4 mb-8">
          <Input
            placeholder="Enter Booking ID (e.g., 12345)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Track</Button>
        </form>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {trackingResult && (
          <Card>
            <CardHeader>
              <CardTitle>Booking #{trackingResult.id}</CardTitle>
              <Button variant="outline" onClick={handleRefresh} className="mt-2">Refresh Status</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingResult.statuses.map((status, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="mt-1">
                      {status.status === "Pending Pick-Up" && <Package className="h-5 w-5 text-gray-500" />}
                      {status.status === "Picked Up" && <Truck className="h-5 w-5 text-blue-500" />}
                      {status.status === "In Transit" && <MapPin className="h-5 w-5 text-orange-500" />}
                      {status.status === "Out for Delivery" && <Truck className="h-5 w-5 text-purple-500" />}
                      {status.status === "Delivered" && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                    <div>
                      <p className="font-semibold">{status.status}</p>
                      <p className="text-sm text-gray-600">{status.timestamp}</p>
                      {status.details && <p className="text-sm text-gray-500">{status.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}