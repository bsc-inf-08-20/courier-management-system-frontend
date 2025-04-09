// DispatchPacketsPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VehiclesList from "@/components/admin/dispatch/VehiclesList";
import PacketsTable from "@/components/admin/dispatch/PacketsTable";
import InTransitTable from "@/components/admin/dispatch/InTransitTable";
import { toast } from "sonner";
import { Packet, Vehicle } from "@/types/types"; // Import shared types

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

const DispatchPacketsPage = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adminCity, setAdminCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [, setActiveTab] = useState<string>("ready-for-dispatch");
  const [hasMounted, setHasMounted] = useState(false);
  const [inTransitPackets, setInTransitPackets] = useState<Packet[]>([]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      toast.error("Please log in first");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const adminRes = await fetch("http://localhost:3001/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!adminRes.ok) throw new Error("Failed to fetch admin data");
        const adminData = await adminRes.json();
        setAdminCity(adminData.city || "");

        const [vehiclesRes, readyPacketsRes, inTransitRes] = await Promise.all([
          fetch(`http://localhost:3001/packets/available-vehicles?city=${adminData.city}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/packets/at-origin-hub?city=${adminData.city}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/packets/in-transit?origin=${adminData.city}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!vehiclesRes.ok) throw new Error("Failed to fetch vehicles");
        if (!readyPacketsRes.ok) throw new Error("Failed to fetch ready packets");
        if (!inTransitRes.ok) throw new Error("Failed to fetch in-transit packets");

        const vehiclesData = await vehiclesRes.json();
        const readyPacketsData = await readyPacketsRes.json();
        const inTransitData = await inTransitRes.json();

        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setPackets(Array.isArray(readyPacketsData) ? readyPacketsData : []);

        // Handle in-transit packets
        const inTransitArray = Array.isArray(inTransitData)
          ? inTransitData
          : Array.isArray(inTransitData?.data)
          ? inTransitData.data
          : [];
        setInTransitPackets(inTransitArray);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasMounted]);

  if (!hasMounted) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Inter-hub Dispatching ({adminCity || "Loading..."})
      </h2>

      <VehiclesList vehicles={vehicles} setVehicles={setVehicles} adminCity={adminCity} />

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
          <PacketsTable
            packets={packets}
            setPackets={setPackets}
            vehicles={vehicles}
            setVehicles={setVehicles}
            adminCity={adminCity}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="in-transit">
          <InTransitTable packets={inTransitPackets} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchPacketsPage;