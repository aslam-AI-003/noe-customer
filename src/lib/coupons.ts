// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COUPON SYSTEM — Validation + Discount Calculation
// Supports: percentage, flat, free-delivery, cashback
// Rules: min order, max discount, expiry, usage limit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'flat' | 'free-delivery' | 'cashback';
  value: number; // percentage or flat amount
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string; // ISO date
  shopId?: string; // If shop-specific
  firstOrderOnly?: boolean;
  category?: string; // If category-specific
}

export interface CouponResult {
  valid: boolean;
  discount: number;
  message: string;
  coupon?: Coupon;
}

// ━━━ ALL AVAILABLE COUPONS ━━━
export const ALL_COUPONS: Coupon[] = [
  // Welcome offers
  {
    id: 'c1', code: 'WELCOME50', description: '50% off on your first order!',
    type: 'percentage', value: 50, minOrderAmount: 100, maxDiscount: 100,
    usageLimit: 1, usedCount: 0, isActive: true, firstOrderOnly: true,
  },
  {
    id: 'c2', code: 'FIRST50', description: '50% off — first order special',
    type: 'percentage', value: 50, minOrderAmount: 100, maxDiscount: 100,
    usageLimit: 1, usedCount: 0, isActive: true, firstOrderOnly: true,
  },
  // Regular offers
  {
    id: 'c3', code: 'NOE30', description: '₹30 off on orders above ₹200',
    type: 'flat', value: 30, minOrderAmount: 200, maxDiscount: 30,
    usageLimit: 5, usedCount: 0, isActive: true,
  },
  {
    id: 'c4', code: 'FREEDEL', description: 'Free delivery on orders above ₹199',
    type: 'free-delivery', value: 50, minOrderAmount: 199, maxDiscount: 50,
    usageLimit: 10, usedCount: 0, isActive: true,
  },
  {
    id: 'c5', code: 'SAVE20', description: '20% off — Max ₹80 savings',
    type: 'percentage', value: 20, minOrderAmount: 150, maxDiscount: 80,
    usageLimit: 3, usedCount: 0, isActive: true,
  },
  {
    id: 'c6', code: 'WALLET100', description: '₹100 cashback on wallet payment',
    type: 'cashback', value: 100, minOrderAmount: 300, maxDiscount: 100,
    usageLimit: 2, usedCount: 0, isActive: true,
  },
  {
    id: 'c7', code: 'THANJAVUR10', description: '10% off for Thanjavur orders',
    type: 'percentage', value: 10, minOrderAmount: 0, maxDiscount: 50,
    usageLimit: 100, usedCount: 0, isActive: true,
  },
  {
    id: 'c8', code: 'WEEKEND25', description: '25% off — weekend special!',
    type: 'percentage', value: 25, minOrderAmount: 200, maxDiscount: 75,
    usageLimit: 50, usedCount: 0, isActive: true,
  },
  // Expired/inactive
  {
    id: 'c9', code: 'EXPIRED10', description: 'This coupon has expired',
    type: 'flat', value: 10, minOrderAmount: 50, maxDiscount: 10,
    usageLimit: 1, usedCount: 1, isActive: false,
  },
];

// ━━━ VALIDATE COUPON ━━━
export function validateCoupon(
  code: string,
  subtotal: number,
  options?: {
    isFirstOrder?: boolean;
    paymentMethod?: string;
    shopId?: string;
  }
): CouponResult {
  const normalizedCode = code.trim().toUpperCase();

  // Find coupon
  const coupon = ALL_COUPONS.find(c => c.code === normalizedCode);

  if (!coupon) {
    return { valid: false, discount: 0, message: '❌ Invalid coupon code' };
  }

  // Check if active
  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: '⏰ This coupon has expired' };
  }

  // Check usage limit
  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: '🚫 Coupon usage limit reached' };
  }

  // Check expiry
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discount: 0, message: '⏰ This coupon has expired' };
  }

  // Check minimum order
  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false, discount: 0,
      message: `📦 Min. order ₹${coupon.minOrderAmount} required (₹${coupon.minOrderAmount - subtotal} more needed)`,
    };
  }

  // Check first order only
  if (coupon.firstOrderOnly && !options?.isFirstOrder) {
    return { valid: false, discount: 0, message: '🆕 This coupon is for first orders only' };
  }

  // Check shop-specific
  if (coupon.shopId && coupon.shopId !== options?.shopId) {
    return { valid: false, discount: 0, message: '🏪 This coupon is for a specific shop only' };
  }

  // ━━━ CALCULATE DISCOUNT ━━━
  let discount = 0;

  switch (coupon.type) {
    case 'percentage':
      discount = Math.round((subtotal * coupon.value) / 100);
      discount = Math.min(discount, coupon.maxDiscount);
      break;

    case 'flat':
      discount = coupon.value;
      break;

    case 'free-delivery':
      discount = coupon.value; // delivery charge amount
      break;

    case 'cashback':
      // Cashback doesn't reduce order total, just wallet credit after delivery
      discount = 0; // actual cashback happens post-delivery
      return {
        valid: true, discount: 0, coupon,
        message: `💰 ₹${coupon.value} cashback will be credited after delivery!`,
      };
  }

  return {
    valid: true,
    discount,
    coupon,
    message: coupon.type === 'free-delivery'
      ? `🚴 Free delivery applied! You save ₹${discount}`
      : `🎉 ₹${discount} off applied! (${coupon.description})`,
  };
}

// Get best coupon suggestion for given subtotal
export function getBestCouponSuggestion(subtotal: number): Coupon | null {
  const validCoupons = ALL_COUPONS
    .filter(c => c.isActive && subtotal >= c.minOrderAmount && c.usedCount < c.usageLimit)
    .map(c => {
      let savings = 0;
      if (c.type === 'percentage') savings = Math.min(Math.round((subtotal * c.value) / 100), c.maxDiscount);
      else if (c.type === 'flat') savings = c.value;
      else if (c.type === 'free-delivery') savings = c.value;
      return { coupon: c, savings };
    })
    .sort((a, b) => b.savings - a.savings);

  return validCoupons.length > 0 ? validCoupons[0].coupon : null;
}
