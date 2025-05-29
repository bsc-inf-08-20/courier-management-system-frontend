// src/lib/pricing.ts
export const calculateDeliveryFee = (
  originCity: string,
  destinationCity: string,
  deliveryType: string,
  weight: number
): number => {
  // Base prices for hub-to-hub
  const basePrices: Record<string, number> = {
    'Lilongwe-Mzuzu': 5000,
    'Lilongwe-Blantyre': 3000,
    'Blantyre-Mzuzu': 7000,
    'Mzuzu-Lilongwe': 7000,
    'Blantyre-Lilongwe': 3000,
    'Mzuzu-Blantyre': 7000,
    'Zomba-Lilongwe': 3000,
    'Zomba-Blantyre': 1000
  };

  // For same city pickup
  if (originCity === destinationCity) {
    return 2000; // Base pickup fee
  }

  // Calculate base price
  const routeKey = `${originCity}-${destinationCity}`;
  let price = basePrices[routeKey] || 15000; // Default to highest price if route not found

  // Add home delivery fee
  if (deliveryType === 'delivery') {
    price += 7000;
  }

  // Add weight-based fee (500 MWK per kg)
  const weightFee = Math.max(1, Math.ceil(weight)) * 200;
  price += weightFee;

  return price;
};

export const calculateHubDeliveryFee = (
  originCity: string,
  destinationCity: string,
  deliveryType: string,
  weight: number
): number => {
  // Base prices for hub-to-hub
  const basePrices: Record<string, number> = {
    'Lilongwe-Mzuzu': 9000,
    'Lilongwe-Blantyre': 6000,
    'Lilongwe-Zomba': 5500,
    'Blantyre-Mzuzu': 15000,
    'Blantyre-Lilongwe': 6000,
    'Blantyre-Zomba': 2000,
    'Mzuzu-Lilongwe': 9000,
    'Mzuzu-Blantyre': 15000,
    'Mzuzu-Zomba': 15500,
    'Zomba-Lilongwe': 5500,
    'Zomba-Blantyre': 2000,
    'Zomba-Mzuzu': 15500
  };

  // For same city pickup
  if (originCity === destinationCity) {
    return 2000; // Base pickup fee
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