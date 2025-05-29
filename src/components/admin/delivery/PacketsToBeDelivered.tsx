import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Packet } from "@/types/types";
import { AgentActionsDropdown } from "@/components/admin/AgentActionsDropdown";

interface PacketsToBeDeliveredProps {
  packets: Packet[];
  adminCity: string;
  onUnassignAgent: (packetId: number) => Promise<void>;
  onReassignAgent: (packetId: number, agentId: number) => Promise<void>;
  setReassignPacketId: (packetId: number | null) => void;
  setAgentToRemove: (packetId: number | null) => void;
}

const PacketsToBeDelivered: React.FC<PacketsToBeDeliveredProps> = ({
  packets,
  setReassignPacketId,
  setAgentToRemove,
}) => {
  const getStatusBadge = (status: string, deliveredAt?: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      at_destination_hub: {
        text: "At Destination Hub",
        color: "bg-yellow-100 text-yellow-800",
      },
      out_for_delivery: {
        text: "Out for Delivery",
        color: "bg-blue-100 text-blue-800",
      },
      delivered: {
        text: "Delivered",
        color: "bg-green-100 text-green-800",
      },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <div className="space-y-1">
        <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        {status === "delivered" && deliveredAt && (
          <div className="text-xs text-gray-500">
            Delivered at: {new Date(deliveredAt).toLocaleString()}
          </div>
        )}
        {status === "out_for_delivery" && (
          <div className="text-xs text-gray-500">
            Next stage: Delivered
          </div>
        )}
      </div>
    );
  };

  // Sort packets to show delivered ones at the bottom
  const sortedPackets = [...packets].sort((a, b) => {
    if (a.status === "delivered" && b.status !== "delivered") return 1;
    if (a.status !== "delivered" && b.status === "delivered") return -1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPackets.map((packet) => (
            <TableRow 
              key={packet.id}
              className={packet.status === "delivered" ? "bg-gray-50" : ""}
            >
              <TableCell>{packet.id}</TableCell>
              <TableCell>{packet.description}</TableCell>
              <TableCell>{packet.destination_address}</TableCell>
              <TableCell>{packet.receiver.name}</TableCell>
              <TableCell>{packet.receiver.phone_number}</TableCell>
              <TableCell>
                {getStatusBadge(packet.status, packet.delivered_at?.toString())}
              </TableCell>
              <TableCell>
                {packet.assigned_delivery_agent ? (
                  <div>
                    <p className="font-medium">
                      {packet.assigned_delivery_agent.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {packet.assigned_delivery_agent.phone_number}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                {packet.status !== "delivered" && (
                  <AgentActionsDropdown
                    packet={packet}
                    onRemove={() => setAgentToRemove(packet.id)}
                    onReassign={() => setReassignPacketId(packet.id)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add a summary section for delivered packets */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Packets</p>
            <p className="text-lg font-semibold">{packets.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-lg font-semibold text-green-600">
              {packets.filter(p => p.status === "delivered").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Out for Delivery</p>
            <p className="text-lg font-semibold text-blue-600">
              {packets.filter(p => p.status === "out_for_delivery").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">At Destination Hub</p>
            <p className="text-lg font-semibold text-yellow-600">
              {packets.filter(p => p.status === "at_destination_hub").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacketsToBeDelivered;