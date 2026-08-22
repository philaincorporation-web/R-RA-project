interface EstimateInput {
  basePrice: number;
  adults: number;
  children: number;
  optionsPrice?: number;
}

const CHILD_DISCOUNT = 0.5;

/**
 * Estimation simple du total d'une réservation.
 * Les adultes paient le tarif plein, les enfants bénéficient d'une
 * réduction, et les options additionnelles s'ajoutent au total.
 */
export function estimateTotal({ basePrice, adults, children, optionsPrice = 0 }: EstimateInput): number {
  const adultsTotal = basePrice * Math.max(adults, 0);
  const childrenTotal = basePrice * CHILD_DISCOUNT * Math.max(children, 0);
  return Math.round(adultsTotal + childrenTotal + optionsPrice);
}
