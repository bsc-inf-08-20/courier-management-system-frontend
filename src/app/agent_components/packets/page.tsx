"use client";
import AgentTrackingView from "@/components/tracking/AgentTrackingView";
import { useAgentAuth } from "@/hooks/agentAuth";

export default function AgentTrackingPage() {
  const { decodedToken } = useAgentAuth("AGENT");
  const agentId = decodedToken?.user_id;

  if (!agentId) {
    return <div>Loading...</div>;
  }

  console.log("[Debug] Rendering AgentTrackingPage for agent:", agentId, decodedToken);

  return (
    <div className="min-h-screen">
      <AgentTrackingView 
        agentId={agentId}
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        arrivalThresholdMeters={100}
      />
    </div>
  );
}