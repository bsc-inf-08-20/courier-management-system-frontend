import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Packet } from "@/types/types";

interface Props {
  packets: Packet[];
}

export default function PickedUpTable({ packets }: Props) {
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
          <TableHead>Picked Up At</TableHead>
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
              {packet.sender.name}<br />
              {packet.sender.email}<br />
              {packet.sender.phone_number}
            </TableCell>
            <TableCell>
              {packet.receiver.name}<br />
              {packet.receiver.email}<br />
              {packet.receiver.phone_number}
            </TableCell>
            <TableCell>
              {packet.delivered_at && new Date(packet.delivered_at).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}