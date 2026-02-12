/**
 * Promotional Campaign Configuration
 *
 * This file contains all active promotional campaigns.
 * Promos are automatically enabled/disabled based on date ranges.
 */

export interface DeliveryPromo {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  discountType: "percentage" | "fixed";
  discountValue: number; // percentage (0-100) or fixed amount in Naira
  minOrderValue?: number; // Minimum order value to qualify (optional)
  maxDiscount?: number; // Maximum discount cap for percentage discounts (optional)
  active: boolean;
}

export interface PromoConfig {
  deliveryPromos: DeliveryPromo[];
}

// ============================================
// PROMO CONFIGURATION - EDIT HERE
// ============================================

export const promoConfig: PromoConfig = {
  deliveryPromos: [
    {
      id: "feb-april-2026-free-delivery",
      name: "Free Delivery Promo",
      description: "Enjoy FREE delivery on all orders until April 30th!",
      startDate: new Date("2026-02-12T00:00:00"),
      endDate: new Date("2026-04-30T23:59:59"),
      discountType: "percentage",
      discountValue: 100, // 100% off = FREE delivery
      minOrderValue: 0, // No minimum
      maxDiscount: undefined, // No cap - completely free
      active: true,
    },
    // Add more promos here as needed
    // {
    //   id: "another-promo",
    //   name: "Another Promo",
    //   startDate: new Date("2026-04-01T00:00:00"),
    //   endDate: new Date("2026-04-30T23:59:59"),
    //   discountType: "fixed",
    //   discountValue: 500, // ₦500 off
    //   active: true,
    // },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a promo is currently active based on date and active flag
 */
export function isPromoActive(promo: DeliveryPromo): boolean {
  if (!promo.active) return false;

  const now = new Date();
  return now >= promo.startDate && now <= promo.endDate;
}

/**
 * Get the currently active delivery promo (if any)
 */
export function getActiveDeliveryPromo(): DeliveryPromo | null {
  const activePromo = promoConfig.deliveryPromos.find((promo) =>
    isPromoActive(promo),
  );
  return activePromo || null;
}

/**
 * Calculate discounted delivery charge
 */
export function calculateDiscountedDelivery(
  originalCharge: number,
  orderTotal?: number,
): {
  originalCharge: number;
  discountedCharge: number;
  discountAmount: number;
  hasDiscount: boolean;
  promo: DeliveryPromo | null;
} {
  const promo = getActiveDeliveryPromo();

  // No active promo
  if (!promo) {
    return {
      originalCharge,
      discountedCharge: originalCharge,
      discountAmount: 0,
      hasDiscount: false,
      promo: null,
    };
  }

  // Check minimum order value
  if (promo.minOrderValue && orderTotal && orderTotal < promo.minOrderValue) {
    return {
      originalCharge,
      discountedCharge: originalCharge,
      discountAmount: 0,
      hasDiscount: false,
      promo: null,
    };
  }

  let discountAmount = 0;

  if (promo.discountType === "percentage") {
    discountAmount = (originalCharge * promo.discountValue) / 100;
    // Apply max discount cap if set
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }
  } else {
    // Fixed discount
    discountAmount = Math.min(promo.discountValue, originalCharge);
  }

  const discountedCharge = Math.max(0, originalCharge - discountAmount);

  return {
    originalCharge,
    discountedCharge,
    discountAmount,
    hasDiscount: discountAmount > 0,
    promo,
  };
}

/**
 * Format remaining time for promo
 */
export function getPromoRemainingTime(promo: DeliveryPromo): string {
  const now = new Date();
  const diff = promo.endDate.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} left`;
  }
  return `${hours} hour${hours > 1 ? "s" : ""} left`;
}
