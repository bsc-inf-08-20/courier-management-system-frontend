"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusDistributionChart from "@/components/admin/charts/StatusDistributionChart";
import CategoryDistributionChart from "@/components/admin/charts/CategoryDistributionChart";
import DeliveryTypeChart from "@/components/admin/charts/DeliveryTypeChart";
import WeightDistributionChart from "@/components/admin/charts/WeightDistributionChart";
import { Packet } from "@/types/types";

export default function AdminOverviewPage() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminCity, setAdminCity] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const adminRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const adminData = await adminRes.json();
        setAdminCity(adminData.city);

        const packetsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/packets?city=${adminData.city}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const packetsData = await packetsRes.json();
        setPackets(Array.isArray(packetsData) ? packetsData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatistics = () => {
    const total = packets.length;
    const delivered = packets.filter((p) => p.status === "delivered").length;
    const pending = packets.filter((p) => p.status === "pending").length;
    const inTransit = packets.filter(
      (p) =>
        p.status === "collected" ||
        p.status === "at_origin_hub" ||
        p.status === "out_for_delivery"
    ).length;

    return { total, delivered, pending, inTransit };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const stats = getStatistics();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview ({adminCity})</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.delivered}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inTransit}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart packets={packets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart packets={packets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DeliveryTypeChart packets={packets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightDistributionChart packets={packets} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
