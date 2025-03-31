"use client";

import React, { useEffect, useState } from "react";
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
import { ChevronDown, ChevronUp, Truck, User } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Customer {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  city: string;
}

interface Packet {
  id: number;
  description: string;
  status: string;
  weight: number;
  category: string;
  origin_address: string;
  destination_address: string;
  collected_at?: string;
  dispatched_at?: string;
  assigned_driver?: Driver | null;
  assigned_vehicle?: Vehicle | null;
}

interface PickupRequest {
  id: number;
  pickup_address: string;
  destination_address: string;
  status: string;
  created_at: string;
  customer: Customer;
  packet: Packet;
}

interface Driver {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  city: string;
  role: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: string;
  capacity: number;
  is_active: boolean;
  is_in_maintenance: boolean;
  assigned_driver?: Driver | null;
}

const DispatchPacketsPage = () => {
  const [packets, setPackets] = useState<PickupRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adminCity, setAdminCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ready-for-dispatch");

  const [selectedPackets, setSelectedPackets] = useState<number[]>([]);
  const [expandedPacket, setExpandedPacket] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const [inTransitPackets, setInTransitPackets] = useState<PickupRequest[]>([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch admin data first to get city
        const adminRes = await fetch("http://localhost:3001/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const adminData = await adminRes.json();
        setAdminCity(adminData.city);

        // Fetch all data in parallel
        const [driversRes, vehiclesRes, readyPacketsRes, inTransitRes] =
          await Promise.all([
            fetch(
              `http://localhost:3001/users/drivers?city=${adminData.city}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(`http://localhost:3001/vehicles?city=${adminData.city}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(
              `http://localhost:3001/pickup/requests?status=at_origin_hub&city=${adminData.city}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            fetch(
              `http://localhost:3001/pickup/requests?status=in_transit&origin=${adminData.city}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
          ]);

        // Ensure responses are arrays
        const driversData = await driversRes.json();
        const vehiclesData = await vehiclesRes.json();
        const readyPacketsData = await readyPacketsRes.json();
        const inTransitData = await inTransitRes.json();

        setDrivers(Array.isArray(driversData) ? driversData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setPackets(Array.isArray(readyPacketsData) ? readyPacketsData : []);
        setInTransitPackets(Array.isArray(inTransitData) ? inTransitData : []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load data");
        // Reset to empty arrays on error
        setPackets([]);
        setInTransitPackets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePacketSelection = (id: number) => {
    setSelectedPackets((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleExpandPacket = (id: number) => {
    setExpandedPacket(expandedPacket === id ? null : id);
    if (expandedPacket !== id) {
      setSelectedDriver(null);
      setSelectedVehicle(null);
    }
  };

  const validateDispatch = () => {
    if (!selectedDriver) {
      toast.error("Please select a driver");
      return false;
    }
    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return false;
    }

    const totalWeight = selectedPackets.reduce((sum, pid) => {
      const packet = packets.find((p) => p.id === pid);
      return sum + (packet?.packet.weight || 0);
    }, 0);

    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    if (vehicle && totalWeight > vehicle.capacity) {
      toast.error(
        `Total weight (${totalWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`
      );
      return false;
    }

    return true;
  };

  const handleDispatchConfirmation = () => {
    if (validateDispatch()) setShowConfirmationDialog(true);
  };

  const dispatchPackets = async () => {
    if (!validateDispatch()) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:3001/packets/dispatch-batch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            packetIds: selectedPackets,
            driverId: selectedDriver,
            vehicleId: selectedVehicle,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to dispatch packets");

      toast.success("Packets dispatched successfully");

      // Update local state
      const updatedPackets = packets.filter(
        (p) => !selectedPackets.includes(p.id)
      );
      setPackets(updatedPackets);
      setSelectedPackets([]);
      setSelectedDriver(null);
      setSelectedVehicle(null);
      setExpandedPacket(null);

      // Refresh in-transit packets
      const inTransitRes = await fetch(
        `http://localhost:3001/pickup/requests?status=in_transit&origin=${adminCity}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const inTransitData = await inTransitRes.json();
      setInTransitPackets(Array.isArray(inTransitData) ? inTransitData : []);
    } catch (error) {
      console.error("Dispatch error:", error);
      toast.error("Failed to dispatch packets");
    } finally {
      setLoading(false);
      setShowConfirmationDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      at_origin_hub: {
        text: "Ready for Dispatch",
        color: "bg-amber-100 text-amber-800",
      },
      in_transit: { text: "In Transit", color: "bg-blue-100 text-blue-800" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    if (typeof window === "undefined") return dateString;
    return new Date(dateString).toLocaleString();
  };

  if (loading && packets.length === 0 && inTransitPackets.length === 0) {
    return <div className="p-6 text-center">Loading dispatch data...</div>;
  }

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Inter-hub Dispatching ({adminCity || "Loading..."})
      </h2>

      <Tabs defaultValue="ready-for-dispatch" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="ready-for-dispatch" className="flex-1">
            Ready for Dispatch
          </TabsTrigger>
          <TabsTrigger value="in-transit" className="flex-1">
            In Transit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ready-for-dispatch">
          {!Array.isArray(packets) || packets.length === 0 ? (
            <p className="text-center py-6">No packets ready for dispatch</p>
          ) : (
            <>
              {selectedPackets.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md flex justify-between items-center">
                  <span>{selectedPackets.length} packet(s) selected</span>
                  <Button
                    onClick={() => setExpandedPacket(selectedPackets[0])}
                    disabled={loading}
                  >
                    Assign Driver & Vehicle
                  </Button>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packets.map((packet) => (
                      <React.Fragment key={`packet-${packet.id}`}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedPackets.includes(packet.id)}
                              onChange={() => togglePacketSelection(packet.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={loading}
                            />
                          </TableCell>
                          <TableCell>{packet.packet.description}</TableCell>
                          <TableCell>{packet.packet.weight} kg</TableCell>
                          <TableCell>{packet.packet.origin_address}</TableCell>
                          <TableCell>
                            {packet.packet.destination_address}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(packet.packet.status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleExpandPacket(packet.id)}
                              disabled={loading}
                            >
                              {expandedPacket === packet.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {expandedPacket === packet.id && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 p-4">
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    Select Driver
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {drivers.length > 0 ? (
                                      drivers.map((driver) => (
                                        <div
                                          key={`driver-${driver.user_id}`}
                                          className={`border p-3 rounded-md cursor-pointer ${
                                            selectedDriver === driver.user_id
                                              ? "border-blue-500 bg-blue-50"
                                              : "hover:bg-gray-50"
                                          }`}
                                          onClick={() =>
                                            setSelectedDriver(driver.user_id)
                                          }
                                        >
                                          <p className="font-medium">
                                            {driver.name}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {driver.phone_number}
                                          </p>
                                        </div>
                                      ))
                                    ) : (
                                      <p>No drivers available in {adminCity}</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <Truck className="mr-2 h-4 w-4" />
                                    Select Vehicle
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {vehicles.length > 0 ? (
                                      vehicles
                                        .filter(
                                          (v) =>
                                            v.is_active && !v.is_in_maintenance
                                        )
                                        .map((vehicle) => (
                                          <div
                                            key={`vehicle-${vehicle.id}`}
                                            className={`border p-3 rounded-md cursor-pointer ${
                                              selectedVehicle === vehicle.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "hover:bg-gray-50"
                                            }`}
                                            onClick={() =>
                                              setSelectedVehicle(vehicle.id)
                                            }
                                          >
                                            <p className="font-medium">
                                              {vehicle.make} {vehicle.model} (
                                              {vehicle.year})
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              License: {vehicle.license_plate}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Capacity: {vehicle.capacity} kg
                                            </p>
                                          </div>
                                        ))
                                    ) : (
                                      <p>
                                        No vehicles available in {adminCity}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <Button
                                    onClick={handleDispatchConfirmation}
                                    disabled={
                                      !selectedDriver ||
                                      !selectedVehicle ||
                                      selectedPackets.length === 0 ||
                                      loading
                                    }
                                  >
                                    {loading
                                      ? "Processing..."
                                      : "Dispatch Selected Packets"}
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="in-transit">
          {!Array.isArray(inTransitPackets) || inTransitPackets.length === 0 ? (
            <p className="text-center py-6">No packets in transit</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Dispatched At</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inTransitPackets.map((packet) => (
                    <TableRow
                      key={`in-transit-${packet.id}`}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>{packet.packet.description}</TableCell>
                      <TableCell>{packet.packet.weight} kg</TableCell>
                      <TableCell>{packet.packet.origin_address}</TableCell>
                      <TableCell>{packet.packet.destination_address}</TableCell>
                      <TableCell>
                        {formatDate(packet.packet.dispatched_at)}
                      </TableCell>
                      <TableCell>
                        {packet.packet.assigned_driver?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {packet.packet.assigned_vehicle
                          ? `${packet.packet.assigned_vehicle.make} ${packet.packet.assigned_vehicle.model}`
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Dispatch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dispatch {selectedPackets.length}{" "}
              packet(s) with the selected driver and vehicle?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={dispatchPackets} disabled={loading}>
              {loading ? "Processing..." : "Confirm Dispatch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DispatchPacketsPage;
