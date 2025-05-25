// VehiclesList.tsx
import React, { useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Truck } from "lucide-react";
import { toast } from "sonner";
import {Vehicle } from "@/types/types";

interface VehiclesListProps {
  vehicles: Vehicle[];
  setVehicles: Dispatch<SetStateAction<Vehicle[]>>;
  adminCity: string;
}

const VehiclesList: React.FC<VehiclesListProps> = ({ vehicles, setVehicles, adminCity }) => {
  const [expandedVehicle, setExpandedVehicle] = useState<number | null>(null);

  const toggleExpandVehicle = (id: number) => {
    setExpandedVehicle(expandedVehicle === id ? null : id);
  };

  const handleDispatchVehicle = async (vehicleId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/packets/dispatch-vehicle/${vehicleId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to dispatch vehicle");
      }

      toast.success("Vehicle dispatched successfully");
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleUnassignPacket = async (packetId: number, vehicleId: number) => {
    const token = localStorage.getItem("token");
    console.log(vehicleId);
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/packets/unassign-from-vehicle`, {
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

      // Refresh vehicles list
      const vehicleRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/packets/available-vehicles?city=${adminCity}`, {
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

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Available Vehicles</h3>
      {vehicles.length === 0 ? (
        <p>No vehicles available in {adminCity}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Current Load</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <React.Fragment key={`vehicle-${vehicle.id}`}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <Truck className="mr-2 h-4 w-4" />
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.capacity} kg</TableCell>
                    <TableCell>{vehicle.current_load} kg</TableCell>
                    <TableCell>{vehicle.destination_city || "Not set"}</TableCell>
                    <TableCell>
                      {vehicle.assigned_packets.length > 0 && (
                        <Button onClick={() => handleDispatchVehicle(vehicle.id)}>
                          Dispatch Vehicle
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpandVehicle(vehicle.id)}
                      >
                        {expandedVehicle === vehicle.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedVehicle === vehicle.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50 p-4">
                        <h4 className="font-medium mb-2">Assigned Packets</h4>
                        {vehicle.assigned_packets.length === 0 ? (
                          <p>No packets assigned</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {vehicle.assigned_packets.map((packet) => (
                                <TableRow key={`packet-${packet.id}`}>
                                  <TableCell>{packet.id}</TableCell>
                                  <TableCell>{packet.description}</TableCell>
                                  <TableCell>{packet.weight} kg</TableCell>
                                  <TableCell>{packet.destination_address}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUnassignPacket(packet.id, vehicle.id)}
                                    >
                                      Unassign
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VehiclesList;