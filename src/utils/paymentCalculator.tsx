// src/utils/pricingCalculator.ts
export const BASE_PICKUP_FEE = 2500;
export const HOME_DELIVERY_FEE = 2500;

const ROUTE_PRICES: Record<string, Record<string, number>> = {
  Lilongwe: {
    Mzuzu: 1000,
    Blantyre: 1000,
  },
  Blantyre: {
    Mzuzu: 2000,
    Lilongwe: 1000,
  },
  Mzuzu: {
    Lilongwe: 1000,
    Blantyre: 1300,
  },
  Zomba: {
    Lilongwe: 800,
    Blantyre: 800,
    Mzuzu: 800,
  },
};

const WEIGHT_MULTIPLIER = 500; // 500 MWK per kg

export function calculateDeliveryFee(
  origin: string,
  destination: string,
  category: string, // Keep parameter for compatibility
  isHomeDelivery: boolean,
  weight: number
): number {
  let total = BASE_PICKUP_FEE;

  // Add route fee
  if (ROUTE_PRICES[origin]?.[destination]) {
    total += ROUTE_PRICES[origin][destination];
  }

  // Add weight fee
  total += Math.max(1, Math.ceil(weight)) * WEIGHT_MULTIPLIER;

  // Add home delivery fee if needed
  if (isHomeDelivery) {
    total += HOME_DELIVERY_FEE;
  }

  return total;
}

export function getFeeBreakdown(
  origin: string,
  destination: string,
  category: string, // Keep parameter for compatibility
  isHomeDelivery: boolean,
  weight: number
) {
  const weightFee = Math.max(1, Math.ceil(weight)) * WEIGHT_MULTIPLIER;
  const routeFee = ROUTE_PRICES[origin]?.[destination] || 0;

  return {
    baseFee: BASE_PICKUP_FEE,
    routeFee,
    weightFee,
    homeDeliveryFee: isHomeDelivery ? HOME_DELIVERY_FEE : 0,
    total:
      BASE_PICKUP_FEE +
      routeFee +
      weightFee +
      (isHomeDelivery ? HOME_DELIVERY_FEE : 0),
  };
}
