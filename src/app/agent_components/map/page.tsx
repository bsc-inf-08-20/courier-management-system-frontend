"use client";
import AgentTrackingView from "@/components/tracking/AgentTrackingView";
import { useAgentAuth } from "@/hooks/agentAuth";
import { useState } from "react";

export default function AgentTrackingPage() {
  const { decodedToken } = useAgentAuth("AGENT");
  const agentId = decodedToken?.user_id;
  const [tab, setTab] = useState<"collect" | "deliver">("collect");

  if (!agentId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-2 font-semibold border-b-2 transition ${
              tab === "collect"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setTab("collect")}
          >
            Collect Packet
          </button>
          <button
            className={`ml-4 px-6 py-2 font-semibold border-b-2 transition ${
              tab === "deliver"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-600"
            }`}
            onClick={() => setTab("deliver")}
          >
            Deliver Packet
          </button>
        </div>
        <div>
          {tab === "collect" && (
            <AgentTrackingView
              agentId={agentId}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
              arrivalThresholdMeters={100}
              mode="collect"
            />
          )}
          {tab === "deliver" && (
            <AgentTrackingView
              agentId={agentId}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
              arrivalThresholdMeters={100}
              mode="deliver"
            />
          )}
        </div>
      </div>
    </div>
  );
}