// ==========================================
// Namma Ooru Express - Type Definitions
// ==========================================

// User Roles
export type UserRole = 'customer' | 'shop_owner' | 'delivery_partner' | 'admin' | 'super_admin';

// User Status
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

// Base User
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  language: 'ta' | 'en';
  darkMode: boolean;
}

// Customer
export interface Customer extends User {
  role: 'customer';
  addresses: Address[];
  defaultAddress?: Address;
  wallet: Wallet;
  loyaltyPoints: number;
  referralCode: string;
  referredBy?: string;
  favoriteShops: string[];
  orderCount: number;
}

// Shop Owner
export interface ShopOwner extends User {
  role: 'shop_owner';
  shopId: string;
}

// Shop
export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  images: string[];
  category: ShopCategory;
  subcategories: string[];
  address: Address;
  location: GeoPoint;
  phone: string;
  email: string;
  gstNumber?: string;
  isKycVerified: boolean;
  isApproved: boolean;
  isOpen: boolean;
  isHolidayMode: boolean;
  timing: ShopTiming;
  rating: number;
  totalRatings: number;
  totalOrders: number;
  deliveryRadius: number; // in km
  minimumOrder: number;
  deliveryCharges: DeliveryCharges;
  commission: number; // percentage
  wallet: Wallet;
  createdAt: string;
  updatedAt: string;
  zone: string;
  city: string;
  state: string;
}

// Shop Categories
export type ShopCategory =
  | 'groceries'
  | 'vegetables'
  | 'fruits'
  | 'meat'
  | 'chicken'
  | 'fish'
  | 'medicines'
  | 'bakery'
  | 'restaurants'
  | 'tea_shops'
  | 'snacks'
  | 'stationery'
  | 'pet_shop'
  | 'flower_shop'
  | 'electronics'
  | 'courier'
  | 'documents'
  | 'water_can'
  | 'gas_cylinder'
  | 'milk'
  | 'cake'
  | 'custom_parcel';

// Shop Timing
export interface ShopTiming {
  monday: DayTiming;
  tuesday: DayTiming;
  wednesday: DayTiming;
  thursday: DayTiming;
  friday: DayTiming;
  saturday: DayTiming;
  sunday: DayTiming;
}

export interface DayTiming {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

// Product
export interface Product {
  id: string;
  shopId: string;
  name: string;
  nameTamil?: string;
  description: string;
  images: string[];
  category: string;
  subcategory?: string;
  price: number;
  discountPrice?: number;
  unit: string;
  stock: number;
  isAvailable: boolean;
  isVeg?: boolean;
  barcode?: string;
  tags: string[];
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

// Delivery Partner
export interface DeliveryPartner extends User {
  role: 'delivery_partner';
  vehicleType: VehicleType;
  vehicleNumber: string;
  drivingLicense: string;
  aadhaarNumber: string;
  isOnline: boolean;
  isApproved: boolean;
  isVerified: boolean;
  currentLocation?: GeoPoint;
  currentOrderId?: string;
  wallet: Wallet;
  earnings: Earnings;
  rating: number;
  totalDeliveries: number;
  totalRatings: number;
  zone: string;
  city: string;
}

export type VehicleType = 'bike' | 'cycle' | 'auto' | 'walking';

// Earnings
export interface Earnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  incentives: number;
  bonus: number;
}

// Order
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupAddress: Address;
  deliveryAddress: Address;
  pickupOtp: string;
  deliveryOtp: string;
  estimatedDeliveryTime: number; // in minutes
  actualDeliveryTime?: number;
  distance: number; // in km
  notes?: string;
  rating?: number;
  review?: string;
  cancelReason?: string;
  cancelledBy?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'rider_assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

// Address
export interface Address {
  id: string;
  label: string; // Home, Office, etc.
  fullAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  location: GeoPoint;
}

// Geo Point
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// Wallet
export interface Wallet {
  balance: number;
  transactions: Transaction[];
}

// Transaction
export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

// Delivery Charges
export interface DeliveryCharges {
  baseCharge: number;
  perKmCharge: number;
  peakHourMultiplier: number;
  rainMultiplier: number;
  festivalMultiplier: number;
  surgeMultiplier: number;
  freeDeliveryAbove?: number;
}

// Coupon
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  applicableShops?: string[];
  applicableCategories?: ShopCategory[];
}

// Banner
export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
  startDate: string;
  endDate: string;
}

// Review
export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  shopId?: string;
  deliveryPartnerId?: string;
  rating: number;
  review: string;
  images?: string[];
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'promotion' | 'system' | 'payment' | 'delivery';
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// Support Ticket
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  subject: string;
  description: string;
  category: 'order' | 'payment' | 'delivery' | 'account' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachments?: string[];
  timestamp: string;
}

// Zone & City Management
export interface Zone {
  id: string;
  name: string;
  city: string;
  state: string;
  boundaries: GeoPoint[];
  isActive: boolean;
  deliveryCharges: DeliveryCharges;
}

export interface City {
  id: string;
  name: string;
  state: string;
  zones: string[];
  isActive: boolean;
}

// Analytics
export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCommission: number;
  totalShops: number;
  totalCustomers: number;
  totalDeliveryPartners: number;
  activeRiders: number;
  avgDeliveryTime: number;
}

// Cart
export interface CartItem {
  product: Product;
  quantity: number;
  shopId: string;
  shopName: string;
}

export interface Cart {
  items: CartItem[];
  shopId: string;
  shopName: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}
