// InTransitTable.tsx
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

interface InTransitTableProps {
  packets: Packet[];
  loading: boolean;
}

const InTransitTable: React.FC<InTransitTableProps> = ({
  packets,
  loading,
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      {loading && packets.length === 0 ? (
        <p className="text-center py-6">Loading in-transit packets...</p>
      ) : packets.length === 0 ? (
        <p className="text-center py-6">No packets in transit</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Dispatched At</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>License Plate</TableHead>{" "}
                {/* Add License Plate column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {packets.map((packet) => (
                <TableRow
                  key={`in-transit-${packet.id}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell>{packet.id}</TableCell>
                  <TableCell>{packet.description || "N/A"}</TableCell>
                  <TableCell>{packet.weight || 0} kg</TableCell>
                  <TableCell>{packet.origin_city || "N/A"}</TableCell>
                  <TableCell>{packet.destination_hub || "N/A"}</TableCell>
                  <TableCell>{formatDate(packet.dispatched_at)}</TableCell>
                  <TableCell>
                    {packet.assigned_vehicle
                      ? `${packet.assigned_vehicle.make} ${packet.assigned_vehicle.model}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {packet.assigned_vehicle?.license_plate || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default InTransitTable;
