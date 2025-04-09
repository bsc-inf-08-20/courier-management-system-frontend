// PacketsToBeDelivered.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Packet, Agent } from "@/types/types";
import { AgentActionsDropdown } from "@/components/admin/AgentActionsDropdown";

interface PacketsToBeDeliveredProps {
  packets: Packet[];
  adminCity: string;
  onUnassignAgent: (packetId: number) => Promise<void>;
  onReassignAgent: (packetId: number, agentId: number) => Promise<void>;
  onConfirmDelivery: (packetId: number) => Promise<void>;
  setReassignPacketId: (packetId: number | null) => void;
  setConfirmDeliveryId: (packetId: number | null) => void;
  setAgentToRemove: (packetId: number | null) => void;
}

const PacketsToBeDelivered: React.FC<PacketsToBeDeliveredProps> = ({
  packets,
  adminCity,
  onUnassignAgent,
  onReassignAgent,
  onConfirmDelivery,
  setReassignPacketId,
  setConfirmDeliveryId,
  setAgentToRemove,
}) => {
  const filteredPackets = packets.filter(
    (packet) =>
      packet.status === "out_for_delivery" &&
      packet.assigned_delivery_agent?.city === adminCity
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      out_for_delivery: { text: "Out for Delivery", color: "bg-blue-100 text-blue-800" },
    };
    const statusInfo = statusMap[status] || { text: status, color: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>{statusInfo.text}</span>;
  };

  return (
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
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPackets.map((packet) => (
          <TableRow key={`packet-${packet.id}`} className="hover:bg-gray-100">
            <TableCell>{packet.id}</TableCell>
            <TableCell>{packet.description}</TableCell>
            <TableCell>{packet.weight} kg</TableCell>
            <TableCell>{packet.origin_address}</TableCell>
            <TableCell>{packet.destination_address}</TableCell>
            <TableCell>
              {getStatusBadge(packet.status)}
              {packet.out_for_delivery_at && (
                <div className="text-xs text-gray-500 mt-1">
                  Out for delivery at: {new Date(packet.out_for_delivery_at).toLocaleString()}
                </div>
              )}
            </TableCell>
            <TableCell>
              {packet.assigned_delivery_agent ? (
                <div>
                  <p className="font-medium">{packet.assigned_delivery_agent.name}</p>
                  <p className="text-sm text-gray-600">{packet.assigned_delivery_agent.phone_number}</p>
                  <p className="text-xs text-gray-500">{packet.assigned_delivery_agent.city}</p>
                </div>
              ) : (
                "No agent assigned"
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <AgentActionsDropdown
                  onRemove={() => setAgentToRemove(packet.id)}
                  onReassign={() => setReassignPacketId(packet.id)}
                />
                <Button size="sm" onClick={() => setConfirmDeliveryId(packet.id)}>
                  Confirm Delivery
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PacketsToBeDelivered;