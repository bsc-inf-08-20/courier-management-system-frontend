"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AssignAgent from "./AssignAgent";

interface Agent {
  user_id: number;
  name: string;
}

interface Props {
  requestId: number;
  setRequests: (requests: any) => void;
}

export default function AgentList({ requestId, setRequests }: Props) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3001/users/role/agent", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAgents(data))
      .catch((err) => console.error("Failed to fetch agents", err));
  }, []);

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {agents.map((agent) => (
        <Button key={agent.user_id} variant={selectedAgent === agent.user_id ? "default" : "outline"} onClick={() => setSelectedAgent(agent.user_id)}>
          {agent.name}
        </Button>
      ))}
      <AssignAgent requestId={requestId} agentId={selectedAgent} setRequests={setRequests} />
    </div>
  );
}
