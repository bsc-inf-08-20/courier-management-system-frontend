import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    packetId: number;
    description: string;
    weight: number;
    category: string;
    sender: {
      name: string;
      email: string;
      phone_number: string;
    };
    receiver: {
      name: string;
      email: string;
      phone_number: string;
    };
    origin_address: string;
    destination_address: string;
    delivery_type: string;
    created_at: string;
    price: {
      basePrice: number;
      weightFee: number;
      totalPrice: number;
    };
  };
}

const Receipt: React.FC<ReceiptProps> = ({ isOpen, onClose, receiptData }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Add early return if receiptData is null
  if (!receiptData) return null;

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Print Receipt</title>');
    // Add styling
    printWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .receipt { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 15px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .price-breakdown { border-top: 1px solid #ccc; margin-top: 20px; padding-top: 20px; }
        .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write(content.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    printWindow.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

   return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Courier Receipt</DialogTitle>
        </DialogHeader>
        <div ref={receiptRef} className="p-6">
          <div className="header">
            <h2 className="text-2xl font-bold mb-2">Courier System</h2>
            <p className="text-sm text-gray-500">
              Receipt Date: {new Date().toLocaleDateString()}
            </p>
              <p className="text-sm text-gray-500">
              Packet ID: {receiptData?.packetId || 'N/A'}
            </p>
          </div>

          {/* Add null checks for nested objects */}
          <div className="grid">
            <div className="section">
              <h3 className="font-bold mb-2">Sender Information</h3>
              <p>Name: {receiptData?.sender?.name || 'N/A'}</p>
              <p>Email: {receiptData?.sender?.email || 'N/A'}</p>
              <p>Phone: {receiptData?.sender?.phone_number || 'N/A'}</p>
            </div>

            <div className="section">
              <h3 className="font-bold mb-2">Receiver Information</h3>
              <p>Name: {receiptData?.receiver?.name || 'N/A'}</p>
              <p>Email: {receiptData?.receiver?.email || 'N/A'}</p>
              <p>Phone: {receiptData?.receiver?.phone_number || 'N/A'}</p>
            </div>
          </div>

          <div className="section mt-4">
            <h3 className="font-bold mb-2">Package Details</h3>
            <p>Description: {receiptData?.description || 'N/A'}</p>
            <p>Category: {receiptData?.category || 'N/A'}</p>
            <p>Weight: {receiptData?.weight || 0} kg</p>
            <p>Delivery Type: {receiptData?.delivery_type || 'N/A'}</p>
            <p>From: {receiptData?.origin_address || 'N/A'}</p>
            <p>To: {receiptData?.destination_address || 'N/A'}</p>
          </div>

          <div className="price-breakdown">
            <h3 className="font-bold mb-2">Price Breakdown</h3>
            <p>Base Price: MWK {receiptData?.price?.basePrice?.toLocaleString() || '0'}</p>
            <p>Weight Fee: MWK {receiptData?.price?.weightFee?.toLocaleString() || '0'}</p>
            <div className="total">
              Total Amount: MWK {receiptData?.price?.totalPrice?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button onClick={handlePrint}>Print Receipt</Button>
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Receipt;