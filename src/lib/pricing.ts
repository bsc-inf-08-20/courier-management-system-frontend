// src/lib/pricing.ts
export const calculateDeliveryFee = (
  originCity: string,
  destinationCity: string,
  deliveryType: string,
  weight: number
): number => {
  // Base prices for hub-to-hub
  const basePrices: Record<string, number> = {
    'Lilongwe-Mzuzu': 9000,
    'Lilongwe-Blantyre': 6000,
    'Blantyre-Mzuzu': 15000,
    'Mzuzu-Lilongwe': 9000,
    'Blantyre-Lilongwe': 6000,
    'Mzuzu-Blantyre': 15000,
  };

  // For same city pickup
  if (originCity === destinationCity) {
    return 7000; // Base pickup fee
  }

  // Calculate base price
  const routeKey = `${originCity}-${destinationCity}`;
  let price = basePrices[routeKey] || 15000; // Default to highest price if route not found

  // Add home delivery fee
  if (deliveryType === 'delivery') {
    price += 7000;
  }

  // Add weight-based fee (500 MWK per kg)
  const weightFee = Math.max(1, Math.ceil(weight)) * 500;
  price += weightFee;

  return price;
};