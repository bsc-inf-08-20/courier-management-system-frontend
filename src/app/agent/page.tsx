'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Pickup {
  id: string;
  date: string;
  time: string;
  customerName: string;
  status: 'Complete' | 'Pending' | 'DeliveredToCustomer';
}

// Fetch data from the API
async function fetchData<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

export default function AgentDashboard() {
  const [searchQuery] = useState('');
  const [pickups, setPickups] = useState<Pickup[]>([]);

  useEffect(() => {
    const loadPickups = async () => setPickups(await fetchData<Pickup>('/api/pickups'));
    loadPickups();
  }, []);

  const filteredData = pickups.filter((item) => item.id.includes(searchQuery));
  const completedPickups = pickups.filter((p) => p.status === 'Complete');
  const deliveredPickups = pickups.filter((p) => p.status === 'DeliveredToCustomer');

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="p-4 border rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Today&apos;s Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-grey">
            <CardContent className="p-4 text-lg font-medium">
              Number of Parcel Picked: {pickups.length}
            </CardContent>
          </Card>
          <Card className="bg-white-100">
            <CardContent className="p-4 text-lg font-medium">
              Customers Served: {completedPickups.length}
            </CardContent>
          </Card>
          <Card className="bg-white-100">
            <CardContent className="p-4 text-lg font-medium">
              Parcels Delivered: {deliveredPickups.length}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pickups & Deliveries Table */}
      <div className="p-4 border rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Recent Pickups & Deliveries (Last 24 Hours)</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numbers</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Goods ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell
                    className={
                      item.status === 'Complete'
                        ? 'text-green-600'
                        : item.status === 'DeliveredToCustomer'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }
                  >
                    {item.status}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
