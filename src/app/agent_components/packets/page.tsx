import PacketTrackingMap from "@/components/packet/PacketTrackingMap";

export default function TrackingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Courier Tracking System</h1>
      
      <PacketTrackingMap
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        backendUrl={process.env.NEXT_PUBLIC_API_URL || ''}
        userId={123} // This should come from your auth system
      />
    </div>
  );
}