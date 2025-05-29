"use client";

import AgentTrackingView from "@/components/tracking/AgentTrackingView";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export default function AgentTrackingPage() {
  const { decodedToken, isLoading } = useAuth("AGENT");
  const [tab, setTab] = useState<"collect" | "deliver">("collect");

  // Convert agentId to number explicitly
  const agentId = decodedToken?.user_id ? Number(decodedToken.user_id) : undefined;

  useEffect(() => {
    if (decodedToken) {
      console.log("Decoded Token:", decodedToken);
      console.log("Agent ID:", decodedToken.user_id);
    }
  }, [decodedToken]);

  if (isLoading || !decodedToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <svg
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Agent Dashboard
          </h2>
          <p className="text-gray-500">Preparing your tracking interface...</p>
        </div>
      </div>
    );
  }

  if (!agentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: Unable to retrieve agent information</p>
        </div>
      </div>
    );
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
              mode="collect"
            />
          )}
          {tab === "deliver" && (
            <AgentTrackingView
              agentId={agentId}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
              mode="deliver"
            />
          )}
        </div>
      </div>
    </div>
  );
}
