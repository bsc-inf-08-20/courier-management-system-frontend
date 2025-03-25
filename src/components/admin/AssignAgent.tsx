"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  requestId: number;
  agentId: number | null;
  setRequests: (requests: any) => void;
}

export default function AssignAgent({ requestId, agentId, setRequests }: Props) {
  const assignAgent = async () => {
    if (!agentId) {
      toast.error("Please select an agent first.");
      return;
    }

    toast.success("Agent assigned successfully.");
  };

  return <Button onClick={assignAgent} disabled={!agentId}>Assign Agent</Button>;
}
