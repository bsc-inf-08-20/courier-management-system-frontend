'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AgentMap from '@/components/agent_map/agentMap';

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState('');
  const [parcel, setParcel] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchParcel = async () => {
    if (!trackingId) return;

    try {
      const token = localStorage.getItem('token'); // Get token from storage
      const res = await fetch(`http://localhost:3001/packets/track/${trackingId}/status`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Parcel not found');
      const data = await res.json();
      setParcel(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch parcel');
      setParcel(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="mb-4">
        <CardContent className="space-y-4 pt-4">
          <Input
            placeholder="Enter Tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <Button onClick={fetchParcel}>Track Parcel</Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {parcel && (
        <div>
          <p className="mb-2 text-lg font-medium">
            Customer: {parcel.customerName}
          </p>
          <AgentMap destination={{ lat: parcel.lat, lng: parcel.lng }} />
        </div>
      )}
    </div>
  );
}
