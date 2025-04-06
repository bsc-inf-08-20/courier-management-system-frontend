// PacketsTable.tsx
import React, { useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Packet, Vehicle } from "@/types/types";

interface PacketsTableProps {
  packets: Packet[];
  setPackets: Dispatch<SetStateAction<Packet[]>>;
  vehicles: Vehicle[];
  setVehicles: Dispatch<SetStateAction<Vehicle[]>>;
  adminCity: string;
  loading: boolean;
}

const PacketsTable: React.FC<PacketsTableProps> = ({
  packets,
  setPackets,
  vehicles,
  setVehicles,
  adminCity,
  loading,
}) => {
  const [selectedPackets, setSelectedPackets] = useState<number[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [assigningPackets, setAssigningPackets] = useState<number[]>([]);

  const togglePacketSelection = (id: number) => {
    setSelectedPackets((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      at_origin_hub: { text: "Ready for Dispatch", color: "bg-amber-100 text-amber-800" },
    };
    const statusInfo = statusMap[status] || { text: status, color: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  const handleAssignPackets = (packetIds: number[]) => {
    setAssigningPackets(packetIds);
    setShowAssignDialog(true);
  };

  const handleUnassignPacket = async (packetId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/packets/unassign-from-vehicle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packetId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unassign packet");
      }

      const updatedPacket = await response.json();
      setPackets((prev) =>
        prev.map((p) => (p.id === updatedPacket.id ? updatedPacket : p))
      );

      // Refresh vehicles
      const vehicleRes = await fetch(`http://localhost:3001/packets/available-vehicles?city=${adminCity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!vehicleRes.ok) throw new Error("Failed to fetch updated vehicles");
      const updatedVehicles = await vehicleRes.json();
      setVehicles(updatedVehicles);

      toast.success("Packet unassigned successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const confirmAssignPackets = async () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      const endpoint = assigningPackets.length === 1
        ? "http://localhost:3001/packets/assign-to-vehicle"
        : "http://localhost:3001/packets/assign-multiple-to-vehicle";

      const body = assigningPackets.length === 1
        ? { packetId: assigningPackets[0], vehicleId: selectedVehicle }
        : { packetIds: assigningPackets, vehicleId: selectedVehicle };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign packets");
      }

      const updatedData = await response.json();
      const updatedPackets = Array.isArray(updatedData) ? updatedData : [updatedData];

      setPackets((prev) =>
        prev.map((p) => {
          const updatedPacket = updatedPackets.find((up: Packet) => up.id === p.id);
          return updatedPacket || p;
        })
      );

      const vehicleRes = await fetch(`http://localhost:3001/packets/available-vehicles?city=${adminCity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!vehicleRes.ok) throw new Error("Failed to fetch updated vehicles");
      const updatedVehicles = await vehicleRes.json();
      setVehicles(updatedVehicles);

      toast.success("Packets assigned successfully");
      setSelectedPackets([]);
      setSelectedVehicle(null);
      setAssigningPackets([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setShowAssignDialog(false);
    }
  };

  const totalSelectedWeight = selectedPackets.reduce((sum, pid) => {
    const packet = packets.find((p) => p.id === pid);
    return sum + (packet?.weight || 0);
  }, 0);

  return (
    <>
      {loading && packets.length === 0 ? (
        <p className="text-center py-6">Loading packets...</p>
      ) : packets.length === 0 ? (
        <p className="text-center py-6">No packets ready for dispatch</p>
      ) : (
        <>
          {selectedPackets.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md flex justify-between items-center">
              <span>{selectedPackets.length} packet(s) selected (Total Weight: {totalSelectedWeight} kg)</span>
              <Button onClick={() => handleAssignPackets(selectedPackets)} disabled={loading}>
                Assign to Vehicle
              </Button>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Vehicle</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packets.map((packet) => (
                  <TableRow key={`packet-${packet.id}`}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedPackets.includes(packet.id)}
                        onChange={() => togglePacketSelection(packet.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading || !!packet.assigned_vehicle}
                      />
                    </TableCell>
                    <TableCell>{packet.id}</TableCell>
                    <TableCell>{packet.description || "N/A"}</TableCell>
                    <TableCell>{packet.weight || 0} kg</TableCell>
                    <TableCell>{packet.category || "N/A"}</TableCell>
                    <TableCell>{packet.origin_address || "N/A"}</TableCell>
                    <TableCell>{packet.destination_address || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(packet.status || "")}</TableCell>
                    <TableCell>
                      {packet.assigned_vehicle
                        ? `${packet.assigned_vehicle.make} ${packet.assigned_vehicle.model}`
                        : "Not assigned"}
                    </TableCell>
                    <TableCell>
                      {packet.assigned_vehicle ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignPacket(packet.id)}
                          disabled={loading}
                        >
                          Unassign
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignPackets([packet.id])}
                          disabled={loading}
                        >
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Packets to Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                Assigning {assigningPackets.length} packet(s) with total weight:{" "}
                {assigningPackets.reduce((sum, pid) => {
                  const packet = packets.find((p) => p.id === pid);
                  return sum + (packet?.weight || 0);
                }, 0)} kg
              </p>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Select Vehicle</h4>
                <div className="grid grid-cols-1 gap-3">
                  {vehicles.map((vehicle) => {
                    const packetDestination = packets
                      .find((p) => p.id === assigningPackets[0])
                      ?.destination_address.split(',')
                      .pop()
                      ?.trim();
                    const totalWeight = assigningPackets.reduce((sum, pid) => {
                      const packet = packets.find((p) => p.id === pid);
                      return sum + (packet?.weight || 0);
                    }, 0);
                    const newLoad = vehicle.current_load + totalWeight;
                    const canAssign =
                      (!vehicle.destination_city || vehicle.destination_city === packetDestination) &&
                      newLoad <= vehicle.capacity;

                    return (
                      <div
                        key={`vehicle-${vehicle.id}`}
                        className={`border p-3 rounded-md cursor-pointer flex justify-between items-center ${
                          selectedVehicle === vehicle.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        } ${!canAssign ? "border-red-500 bg-red-50" : ""}`}
                        onClick={() => canAssign && setSelectedVehicle(vehicle.id)}
                      >
                        <div>
                          <p className="font-medium">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </p>
                          <p className="text-sm text-gray-600">
                            Capacity: {vehicle.capacity} kg, Current Load: {vehicle.current_load} kg
                          </p>
                          <p className="text-sm text-gray-600">
                            Destination: {vehicle.destination_city || "Not set"}
                          </p>
                        </div>
                        {!canAssign && (
                          <span className="text-red-600 text-sm">
                            {newLoad > vehicle.capacity
                              ? "Weight exceeds capacity"
                              : "Destination mismatch"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAssignPackets} disabled={!selectedVehicle}>
              Assign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PacketsTable;