/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NOX ORDER TYPES — Complete Order Data Model
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Order Status Flow
export type NoxOrderStatus =
  | 'placed'           // Customer placed the order
  | 'accepted'         // Vendor accepted
  | 'preparing'        // Vendor is preparing
  | 'ready'            // Ready for pickup
  | 'rider_assigned'   // Rider assigned but not yet picked up
  | 'picked_up'        // Rider picked up from shop
  | 'in_transit'       // On the way to customer
  | 'delivered'        // Successfully delivered (OTP verified)
  | 'cancelled'        // Cancelled by any party
  | 'refunded';        // Money refunded

// Payment
export type NoxPaymentMethod = 'COD' | 'UPI' | 'card' | 'wallet';
export type NoxPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Order Item
export interface NoxOrderItem {
  productId: string;
  name: string;
  nameTamil?: string;
  image?: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;  // price × quantity
}

// Timeline Event
export interface NoxOrderTimeline {
  status: NoxOrderStatus;
  timestamp: any; // Firestore Timestamp
  note?: string;
  updatedBy?: string; // Who made this change (vendorId/riderId/system)
}

// Main NOX Order Document
export interface NoxOrder {
  // ─── IDs ───
  orderId: string;           // NOX-SRV-20260807-2045-001
  shopId: string;            // NOX-SRV-TJ-001
  shopCode: string;          // SRV (3-letter code for quick reference)
  customerId: string;        // NOX-C-9876543210-TJ
  riderId: string | null;    // NOX-R-Muthu-TJ-001 (null until assigned)

  // ─── Names (for display without extra queries) ───
  shopName: string;
  customerName: string;
  customerPhone: string;
  riderName: string | null;
  riderPhone: string | null;

  // ─── Order Content ───
  items: NoxOrderItem[];
  itemCount: number;         // Total items for quick display

  // ─── Pricing ───
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  couponCode: string | null;
  total: number;

  // ─── Status ───
  status: NoxOrderStatus;
  timeline: NoxOrderTimeline[];

  // ─── Payment ───
  paymentMethod: NoxPaymentMethod;
  paymentStatus: NoxPaymentStatus;
  paymentId: string | null;  // Razorpay/UPI transaction ID

  // ─── Delivery ───
  deliveryOTP: string;       // 4-digit OTP for delivery verification
  deliveryAddress: string;
  deliveryLandmark?: string;
  customerLocation: { lat: number; lng: number } | null;
  shopLocation: { lat: number; lng: number } | null;
  riderLocation: { lat: number; lng: number } | null;
  estimatedDelivery: string; // "20 mins"
  distance: number;          // in km

  // ─── Area & Filtering ───
  area: string;              // "Thanjavur"
  areaCode: string;          // "TJ"

  // ─── Notes ───
  customerNote: string | null;
  cancelReason: string | null;
  cancelledBy: string | null; // customerId/vendorId/riderId/admin

  // ─── Timestamps ───
  createdAt: any;            // Firestore serverTimestamp
  acceptedAt: any | null;
  preparedAt: any | null;
  pickedAt: any | null;
  deliveredAt: any | null;
  cancelledAt: any | null;
  updatedAt: any;

  // ─── Rating ───
  rating: number | null;
  review: string | null;
  riderRating: number | null;
}

// ─── Input for creating a new order ───
export interface CreateNoxOrderInput {
  shopId: string;
  shopCode: string;
  shopName: string;
  shopLocation: { lat: number; lng: number } | null;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerLocation: { lat: number; lng: number } | null;
  items: NoxOrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  couponCode: string | null;
  total: number;
  paymentMethod: NoxPaymentMethod;
  deliveryAddress: string;
  deliveryLandmark?: string;
  area: string;
  areaCode: string;
  customerNote: string | null;
  estimatedDelivery: string;
  distance: number;
}
