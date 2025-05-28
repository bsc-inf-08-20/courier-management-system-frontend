// PacketsToBePickedUp.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Packet, Agent } from "@/types/types";

interface PacketsToBePickedUpProps {
  packets: Packet[];
  agents: Agent[];
  adminCity: string;
  onAssignAgent: (packetId: number, agentId: number) => Promise<void>;
}

const PacketsToBePickedUp: React.FC<PacketsToBePickedUpProps> = ({
  packets,
  agents,
  adminCity,
  onAssignAgent,
}) => {
  const [expandedPacket, setExpandedPacket] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<{
    [key: number]: number | null;
  }>({});

  const filteredPackets = packets.filter(
    (packet) =>
      packet.status === "at_destination_hub" &&
      !packet.assigned_delivery_agent &&
      packet.destination_address.includes(adminCity)
  );

  const assignAgent = async (packetId: number) => {
    const agentId = assignments[packetId];
    if (!agentId) {
      toast.error("Please select an agent first.");
      return;
    }
    await onAssignAgent(packetId, agentId);
    setExpandedPacket(null);
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPackets.map((packet) => (
            <React.Fragment key={`packet-${packet.id}`}>
              <TableRow
                className="cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  setExpandedPacket(
                    expandedPacket === packet.id ? null : packet.id
                  )
                }
              >
                <TableCell>{packet.id}</TableCell>
                <TableCell>{packet.description}</TableCell>
                <TableCell>{packet.weight} kg</TableCell>
                <TableCell>{packet.origin_city}</TableCell>
                <TableCell>{packet.destination_address}</TableCell>
                <TableCell>At Destination Hub</TableCell>
                <TableCell>
                  <div className="flex justify-between">
                    <span>Click to assign agent</span>
                    {expandedPacket === packet.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedPacket === packet.id && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-gray-50">
                    <div className="flex flex-wrap justify-center gap-4 p-4">
                      {agents.filter((a) => a.city === adminCity).length > 0 ? (
                        agents
                          .filter((a) => a.city === adminCity)
                          .map((agent) => (
                            <div
                              key={agent.user_id}
                              className="flex items-center gap-3 border p-2 rounded-lg shadow-sm w-full sm:w-2/4"
                            >
                              <div className="flex-1">
                                <p className="font-semibold">{agent.name}</p>
                                <p className="text-sm text-gray-500">
                                  {agent.phone_number}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setAssignments({
                                    ...assignments,
                                    [packet.id]: agent.user_id,
                                  })
                                }
                                variant={
                                  assignments[packet.id] === agent.user_id
                                    ? "default"
                                    : "outline"
                                }
                              >
                                Select
                              </Button>
                            </div>
                          ))
                      ) : (
                        <p>No available agents in {adminCity}</p>
                      )}
                    </div>
                    <div className="p-4 flex justify-center">
                      <Button
                        onClick={() => assignAgent(packet.id)}
                        disabled={!assignments[packet.id]}
                      >
                        Assign Agent
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PacketsToBePickedUp;
