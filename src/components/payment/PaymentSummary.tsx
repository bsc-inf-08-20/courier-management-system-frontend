import { motion } from 'framer-motion';

type PackageCategory = 'ELECTRONICS' | 'CLOTHING' | 'DOCUMENTS' | 'OTHER' | 'SMALL' | 'MEDIUM' | 'LARGE';

interface PaymentSummaryProps {
  origin: Location;
  destination: Location;
  packageCategory: PackageCategory;
  isHomeDelivery: boolean;
  amount: number;
  packageWeight: string;
}

type Location = 'Lilongwe' | 'Blantyre' | 'Mzuzu';

const LOCATION_PRICING: Record<Location, Partial<Record<Location, number>>> = {
  "Lilongwe": {
    "Mzuzu": 9000,
    "Blantyre": 6000
  },
  "Blantyre": {
    "Mzuzu": 15000,
    "Lilongwe": 6000
  },
  "Mzuzu": {
    "Lilongwe": 9000,
    "Blantyre": 15000
  },
  
};

const PACKAGE_CATEGORY_PRICES: Record<PackageCategory, number> = {
  "ELECTRONICS": 5000,
  "CLOTHING": 3000,
  "DOCUMENTS": 2000,
  "OTHER": 3000,
  "SMALL": 2000,
  "MEDIUM": 3000,
  "LARGE": 4000
};

export function PaymentSummary({
  origin,
  destination,
  packageCategory,
  isHomeDelivery,
  amount,
  packageWeight
}: PaymentSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200"
    >
      <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">
        Payment Summary
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Base Pickup Fee:</span>
          <span className="font-medium text-gray-800">MWK 7,000</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Route Fee ({origin} to {destination}):</span>
          <span className="font-medium text-gray-800">
            MWK {LOCATION_PRICING[origin]?.[destination] || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Package Category ({packageCategory}):</span>
          <span className="font-medium text-gray-800">
            MWK {PACKAGE_CATEGORY_PRICES[packageCategory] || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Package Weight:</span>
          <span className="font-medium text-gray-800">{packageWeight} kg</span>
        </div>

        {isHomeDelivery && (
          <div className="flex justify-between">
            <span className="text-gray-600">Home Delivery Fee:</span>
            <span className="font-medium text-gray-800">MWK 7,000</span>
          </div>
        )}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-800">Total Amount:</span>
            <span className="text-blue-600">MWK {amount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}