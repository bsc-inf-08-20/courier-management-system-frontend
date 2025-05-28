import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Packet } from "@/types/types";

interface Props {
  packets: Packet[];
  onConfirmPickup: (packetId: number) => void;
}

export default function AwaitingPickupTable({ packets, onConfirmPickup }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Packet ID</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Weight</TableHead>
          <TableHead>Origin</TableHead>
          <TableHead>Sender Details</TableHead>
          <TableHead>Receiver Details</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packets.map((packet) => (
          <TableRow key={packet.id}>
            <TableCell>{packet.id}</TableCell>
            <TableCell>{packet.description}</TableCell>
            <TableCell>{packet.category}</TableCell>
            <TableCell>{packet.weight} kg</TableCell>
            <TableCell>{packet.origin_address}</TableCell>
            <TableCell>
              {typeof packet.sender === 'string' ? JSON.parse(packet.sender).name : packet.sender.name}<br />
              {typeof packet.sender === 'string' ? JSON.parse(packet.sender).email : packet.sender.email}<br />
              {typeof packet.sender === 'string' ? JSON.parse(packet.sender).phone_number : packet.sender.phone_number}
            </TableCell>
            <TableCell>
              {typeof packet.receiver === 'string' ? JSON.parse(packet.receiver).name : packet.receiver.name}<br />
              {typeof packet.receiver === 'string' ? JSON.parse(packet.receiver).email : packet.receiver.email}<br />
              {typeof packet.receiver === 'string' ? JSON.parse(packet.receiver).phone_number : packet.receiver.phone_number}
            </TableCell>
            <TableCell>
              <Button onClick={() => onConfirmPickup(packet.id)}>
                Confirm Pickup
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}