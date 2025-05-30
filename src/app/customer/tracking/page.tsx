"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Truck,
  MapPin,
  Package,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { JSX, useState } from "react";
import { motion } from "framer-motion";

interface StatusItem {
  status: "at_origin_hub" | "in_transit" | "at_destination_hub" | "delivered";
  timestamp: string | null;
}
interface TrackingData {
  trackingId: string;
  status: "at_origin_hub" | "in_transit" | "at_destination_hub" | "delivered";
  sender: {
    name: string;
    email: string;
    phone_number: string;
  };
  receiver: {
    name: string;
    email: string;
    phone_number: string;
  };
  origin_city: string;
  destination_address: string;
  statuses: StatusItem[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Pick-Up",
  collected: "Collected",
  at_origin_hub: "At Origin Hub",
  in_transit: "In Transit",
  at_destination_hub: "At Destination Hub",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  received: "Received",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Package className="h-6 w-6 text-gray-400" />,
  collected: <Truck className="h-6 w-6 text-blue-400" />,
  at_origin_hub: <Package className="h-6 w-6 text-blue-500" />,
  in_transit: <Truck className="h-6 w-6 text-orange-500" />,
  at_destination_hub: <MapPin className="h-6 w-6 text-purple-600" />,
  out_for_delivery: <Truck className="h-6 w-6 text-yellow-500" />,
  delivered: <CheckCircle className="h-6 w-6 text-green-600" />,
  received: <CheckCircle className="h-6 w-6 text-green-800" />,
};

const PROGRESS_PERCENT = (currentStatus: StatusItem["status"]) => {
  const idx = STATUS_ORDER.indexOf(currentStatus);
  return idx >= 0 ? Math.round(((idx + 1) / STATUS_ORDER.length) * 100) : 0;
};

const STATUS_ORDER: StatusItem["status"][] = [
  "at_origin_hub",
  "in_transit",
  "at_destination_hub",
  "delivered",
];

function formatTimestamp(ts: string | null) {
  if (!ts) return "N/A";
  const date = new Date(ts);
  return date.toLocaleString();
}

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch tracking info from backend
  const fetchTracking = async (id: string) => {
    setError("");
    setTrackingResult(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/track/${id}`
      );
      if (!res.ok) {
        setError("No package found with this Tracking ID.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      // Compose statuses array in order, filling with null timestamps if missing
      const statusTimestamps: Partial<Record<StatusItem["status"], string>> = {
        at_origin_hub: data.origin_hub_confirmed_at,
        in_transit: data.dispatched_at,
        at_destination_hub: data.destination_hub_confirmed_at,
        delivered: data.delivered_at,
      };
      let latestStatus: StatusItem["status"] = "at_origin_hub";
      for (const status of STATUS_ORDER) {
        if (data.status === status) {
          latestStatus = status;
          console.log(latestStatus);
          break;
        }
      }
      const statuses: StatusItem[] = STATUS_ORDER.map((status) => ({
        status,
        timestamp: statusTimestamps[status] || null,
      }));

      setTrackingResult({
        trackingId: data.trackingId,
        status: data.status,
        sender: data.sender,
        receiver: data.receiver,
        origin_city: data.origin_city,
        destination_address: data.destination_address,
        statuses,
      });
    } catch (err) {
      console.log("Error fetching tracking info:", err);
      setError("Could not fetch tracking info. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError("Please enter a Tracking ID.");
      return;
    }
    fetchTracking(trackingId.trim());
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-white flex flex-col">
      <main className="flex-grow max-w-2xl mx-auto px-6 py-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-blue-900 mb-8"
        >
          Track Your Package
        </motion.h2>
        <form
          onSubmit={handleTrack}
          className="flex gap-3 mb-8 max-w-lg mx-auto"
        >
          <Input
            placeholder="Tracking ID (e.g., TRK-XXXXXX)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="text-lg"
          />
          <Button
            type="submit"
            disabled={loading || !trackingId.trim()}
            className="text-lg"
          >
            {loading ? "Tracking..." : "Track"}
          </Button>
        </form>
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {trackingResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg px-8 py-8 w-full max-w-2xl mx-auto"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-700 mb-1">
                  {trackingResult.trackingId}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    <span className="font-semibold">From:</span>{" "}
                    {trackingResult.origin_city}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    <span className="font-semibold">To:</span>{" "}
                    {trackingResult.destination_address}
                  </span>
                </div>
              </div>
              <div>
                <span
                  className={
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold " +
                    (trackingResult.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : trackingResult.status === "at_destination_hub"
                      ? "bg-purple-100 text-purple-800"
                      : trackingResult.status === "in_transit"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800")
                  }
                >
                  {STATUS_ICONS[trackingResult.status as StatusItem["status"]]}
                  {STATUS_LABELS[trackingResult.status as StatusItem["status"]]}
                </span>
              </div>
            </div>
            <div className="mb-8">
              <div className="mb-4 font-semibold text-gray-600">Progress</div>
              <div className="flex flex-row items-center justify-between gap-2 mb-3">
                {STATUS_ORDER.map((status, idx) => {
                  const isCompleted =
                    STATUS_ORDER.indexOf(trackingResult.status) > idx;
                  const isCurrent = trackingResult.status === status;
                  return (
                    <div
                      key={status}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={
                          "rounded-full p-2 border-2 mb-2 transition-colors " +
                          (isCompleted || isCurrent
                            ? "border-green-500 bg-green-100"
                            : "border-gray-300 bg-white")
                        }
                      >
                        {STATUS_ICONS[status]}
                      </div>
                      <span
                        className={
                          "text-xs font-medium transition-colors " +
                          (isCompleted || isCurrent
                            ? "text-green-700"
                            : "text-gray-400")
                        }
                      >
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {trackingResult.statuses.find(
                          (s) => s.status === status
                        )?.timestamp
                          ? formatTimestamp(
                              trackingResult.statuses.find(
                                (s) => s.status === status
                              )?.timestamp || ""
                            )
                          : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full">
  <div
    className={
      "h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400"
    }
    style={{
      width: PROGRESS_PERCENT(trackingResult.status) + "%",
    }}
  ></div>
</div>
            </div>
            {/* Sender/Receiver Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="border rounded-lg p-4 bg-blue-50/70">
                <div className="flex items-center gap-2 mb-2">
                  <UserRound className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Sender</span>
                </div>
                <div className="text-sm text-gray-800">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {trackingResult.sender.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {trackingResult.sender.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {trackingResult.sender.phone_number}
                  </p>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-purple-50/70">
                <div className="flex items-center gap-2 mb-2">
                  <UserRound className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">
                    Receiver
                  </span>
                </div>
                <div className="text-sm text-gray-800">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {trackingResult.receiver.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {trackingResult.receiver.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {trackingResult.receiver.phone_number}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center text-xs text-gray-400">
              Use your Tracking ID to check real-time status of your package.
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
