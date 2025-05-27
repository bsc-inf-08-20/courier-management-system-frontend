import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pricing: {
    basePrice: number;
    weightFee: number;
    totalPrice: number;
  };
  packageDetails: {
    origin: string;
    destination: string;
    weight: number;
    deliveryType: string;
  };
}

const PricingDialog: React.FC<PricingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pricing = { basePrice: 0, weightFee: 0, totalPrice: 0 },
  packageDetails,
}) => {

  if (!pricing) return null; // Add early return for null pricing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delivery Price Calculation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Route Details</h3>
            <p>From: {packageDetails.origin}</p>
            <p>To: {packageDetails.destination}</p>
            <p>Weight: {packageDetails.weight} kg</p>
            <p>Delivery Type: {packageDetails.deliveryType}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span>MWK {pricing.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight Fee:</span>
                <span>MWK {pricing.weightFee.toLocaleString()}</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>MWK {pricing.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>
              Mark as Paid
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;