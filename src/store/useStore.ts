import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n';
import type { Order, WalletTransaction, Notification, Address as FirebaseAddress } from '@/lib/firebaseService';

// Cart Item
export interface CartItem {
  productId: string;
  shopId: string;
  name: string;
  nameTamil: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: string;
  isVeg: boolean;
}

// Address (re-export for compatibility)
export interface UserAddress {
  id: string;
  label: string;
  fullAddress: string;
  landmark?: string;
  lat: number;
  lng: number;
  pincode: string;
  city: string;
  isDefault?: boolean;
}

// Rider Registration
export interface RiderRegistration {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  vehicleType: 'Bike' | 'Cycle' | 'Auto' | 'Walking';
  aadhaarNumber: string;
  licenseNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  riderId?: string; // Generated on approval (NOE-R-XXXXX)
  password?: string; // Generated on approval
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  // Live fields
  isOnline?: boolean;
  currentLat?: number;
  currentLng?: number;
  totalDeliveries?: number;
  totalEarnings?: number;
}

// Vendor Product (added by vendor from their dashboard)
export interface VendorProduct {
  id: string;
  shopId: string;
  name: string;
  nameTamil: string;
  price: number;
  discountPrice?: number;
  unit: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  image?: string;
  description?: string;
}

// Vendor Registration
export interface VendorRegistration {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  category: string;
  address: string;
  city: string;
  pincode: string;
  gstNumber?: string;
  fssaiNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  shopId?: string; // Generated on approval (NOE-SHOP-XXXXX)
  password?: string; // Generated on approval (auto)
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

// Shop Review (submitted by customers after delivery)
export interface ShopReview {
  id: string;
  shopId: string;
  orderId: string;
  customerName: string;
  rating: number; // 1-5
  review: string;
  tags?: string[];
  createdAt: string; // ISO string
}

// Demo Order (local state for full flow testing)
export interface DemoOrder {
  id: string;
  userId: string;
  shopId: string;
  shopName: string;
  shopIcon: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  paymentMethod: string;
  address: UserAddress;
  notes?: string;
  riderId?: string;
  riderName?: string;
  customerName: string;
  customerPhone: string;
  rating?: number;
  review?: string;
  createdAt: string; // ISO string
  updatedAt: string;
}

// Store State
interface StoreState {
  // Auth
  isAuthenticated: boolean;
  user: {
    uid: string;
    displayName: string;
    phone: string;
    email?: string;
    photoURL?: string;
    role: 'customer' | 'vendor' | 'rider' | 'admin';
  } | null;

  // Language
  language: Locale;
  setLanguage: (lang: Locale) => void;

  // Location
  currentLocation: { lat: number; lng: number; address: string } | null;
  setLocation: (loc: { lat: number; lng: number; address: string }) => void;

  // Service Area (Thanjavur-Kumbakonam corridor)
  selectedAreaId: string; // area id from serviceAreas.ts
  setSelectedArea: (areaId: string) => void;

  // Cart
  cart: CartItem[];
  cartShopId: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Addresses
  addresses: UserAddress[];
  selectedAddressId: string | null;
  addAddress: (address: UserAddress) => void;
  setSelectedAddress: (id: string) => void;
  setAddresses: (addresses: UserAddress[]) => void;

  // Wallet
  walletBalance: number;
  setWalletBalance: (balance: number) => void;

  // Wallet Transactions (live from Firestore)
  walletTransactions: WalletTransaction[];
  setWalletTransactions: (txs: WalletTransaction[]) => void;

  // Orders (live from Firestore)
  orders: Order[];
  setOrders: (orders: Order[]) => void;

  // ── DEMO ORDERS (local, persisted, shared across roles) ──
  demoOrders: DemoOrder[];
  addDemoOrder: (order: DemoOrder) => void;
  updateDemoOrderStatus: (orderId: string, status: DemoOrder['status'], extra?: Partial<DemoOrder>) => void;
  getDemoOrdersByShop: (shopId: string) => DemoOrder[];
  getDemoOrdersByUser: (userId: string) => DemoOrder[];
  getDemoOrdersByRider: (riderId: string) => DemoOrder[];
  getPendingDemoOrders: () => DemoOrder[];

  // ── SHOP REVIEWS (submitted by customers) ──
  shopReviews: ShopReview[];
  addShopReview: (review: ShopReview) => void;
  getShopReviews: (shopId: string) => ShopReview[];

  // Favorites
  favoriteShopIds: string[];
  toggleFavorite: (shopId: string) => void;
  setFavoriteShopIds: (ids: string[]) => void;

  // Notifications (live from Firestore)
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;

  // ── VENDOR REGISTRATIONS ──
  vendorRegistrations: VendorRegistration[];
  addVendorRegistration: (reg: VendorRegistration) => void;
  approveVendor: (regId: string) => void;
  rejectVendor: (regId: string, reason: string) => void;
  getApprovedVendors: () => VendorRegistration[];
  getPendingVendors: () => VendorRegistration[];
  getVendorByCredentials: (phone: string, password: string) => VendorRegistration | null;

  // ── VENDOR PRODUCTS ──
  vendorProducts: VendorProduct[];
  addVendorProduct: (product: VendorProduct) => void;
  updateVendorProduct: (productId: string, updates: Partial<VendorProduct>) => void;
  deleteVendorProduct: (productId: string) => void;
  getProductsByShop: (shopId: string) => VendorProduct[];

  // ── RIDER REGISTRATIONS ──
  riderRegistrations: RiderRegistration[];
  addRiderRegistration: (reg: RiderRegistration) => void;
  approveRider: (regId: string) => void;
  rejectRider: (regId: string, reason: string) => void;
  getApprovedRiders: () => RiderRegistration[];
  getPendingRiders: () => RiderRegistration[];
  getOnlineRiders: () => RiderRegistration[];
  setRiderOnline: (riderId: string, online: boolean) => void;

  // Auth actions
  setUser: (user: StoreState['user']) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      user: null,

      // Language
      language: 'en' as Locale,
      setLanguage: (lang) => set({ language: lang }),

      // Location
      currentLocation: null,
      setLocation: (loc) => set({ currentLocation: loc }),

      // Service Area
      selectedAreaId: 'thanjavur',
      setSelectedArea: (areaId) => set({ selectedAreaId: areaId }),

      // Cart
      cart: [],
      cartShopId: null,
      addToCart: (item) => {
        const { cart, cartShopId } = get();
        if (cartShopId && cartShopId !== item.shopId) {
          set({ cart: [{ ...item, quantity: 1 }], cartShopId: item.shopId });
          return;
        }
        const existingIndex = cart.findIndex(i => i.productId === item.productId);
        if (existingIndex >= 0) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += 1;
          set({ cart: newCart });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }], cartShopId: item.shopId });
        }
      },
      removeFromCart: (productId) => {
        const { cart } = get();
        const newCart = cart.filter(i => i.productId !== productId);
        set({ cart: newCart, cartShopId: newCart.length > 0 ? get().cartShopId : null });
      },
      updateQuantity: (productId, quantity) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        const newCart = cart.map(i => i.productId === productId ? { ...i, quantity } : i);
        set({ cart: newCart });
      },
      clearCart: () => set({ cart: [], cartShopId: null }),
      getCartTotal: () => {
        return get().cart.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },
      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Addresses
      addresses: [],
      selectedAddressId: null,
      addAddress: (address) => set({ addresses: [...get().addresses, address] }),
      setSelectedAddress: (id) => set({ selectedAddressId: id }),
      setAddresses: (addresses) => set({ addresses }),

      // Wallet
      walletBalance: 0,
      setWalletBalance: (balance) => set({ walletBalance: balance }),

      // Wallet Transactions
      walletTransactions: [],
      setWalletTransactions: (txs) => set({ walletTransactions: txs }),

      // Orders
      orders: [],
      setOrders: (orders) => set({ orders }),

      // ── DEMO ORDERS ──
      demoOrders: [],
      addDemoOrder: (order) => set({ demoOrders: [order, ...get().demoOrders] }),
      updateDemoOrderStatus: (orderId, status, extra) => {
        const updated = get().demoOrders.map(o =>
          o.id === orderId ? { ...o, ...extra, status, updatedAt: new Date().toISOString() } : o
        );
        set({ demoOrders: updated });
      },
      getDemoOrdersByShop: (shopId) => get().demoOrders.filter(o => o.shopId === shopId),
      getDemoOrdersByUser: (userId) => get().demoOrders.filter(o => o.userId === userId),
      getDemoOrdersByRider: (riderId) => get().demoOrders.filter(o => o.riderId === riderId),
      getPendingDemoOrders: () => get().demoOrders.filter(o => 
        ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)
      ),

      // ── SHOP REVIEWS ──
      shopReviews: [],
      addShopReview: (review) => set({ shopReviews: [review, ...get().shopReviews] }),
      getShopReviews: (shopId) => get().shopReviews.filter(r => r.shopId === shopId),

      // Favorites
      favoriteShopIds: [],
      toggleFavorite: (shopId) => {
        const { favoriteShopIds } = get();
        if (favoriteShopIds.includes(shopId)) {
          set({ favoriteShopIds: favoriteShopIds.filter(id => id !== shopId) });
        } else {
          set({ favoriteShopIds: [...favoriteShopIds, shopId] });
        }
      },
      setFavoriteShopIds: (ids) => set({ favoriteShopIds: ids }),

      // Notifications
      notifications: [],
      setNotifications: (notifications) => {
        const unread = notifications.filter(n => !n.read).length;
        set({ notifications, unreadNotificationCount: unread });
      },
      unreadNotificationCount: 0,
      setUnreadNotificationCount: (count) => set({ unreadNotificationCount: count }),

      // ── VENDOR REGISTRATIONS ──
      vendorRegistrations: [],
      addVendorRegistration: (reg) => set({ vendorRegistrations: [...get().vendorRegistrations, reg] }),
      approveVendor: (regId) => {
        const updated = get().vendorRegistrations.map(r => {
          if (r.id !== regId) return r;
          const shopId = 'NOE-' + Date.now().toString(36).toUpperCase().slice(-5);
          const password = shopId; // password = shopId for simplicity
          return { ...r, status: 'approved' as const, shopId, password, approvedAt: new Date().toISOString() };
        });
        set({ vendorRegistrations: updated });
      },
      rejectVendor: (regId, reason) => {
        const updated = get().vendorRegistrations.map(r =>
          r.id === regId ? { ...r, status: 'rejected' as const, rejectionReason: reason, rejectedAt: new Date().toISOString() } : r
        );
        set({ vendorRegistrations: updated });
      },
      getApprovedVendors: () => get().vendorRegistrations.filter(r => r.status === 'approved'),
      getPendingVendors: () => get().vendorRegistrations.filter(r => r.status === 'pending'),
      getVendorByCredentials: (phone, password) => {
        return get().vendorRegistrations.find(r => r.status === 'approved' && r.phone === phone && r.password === password) || null;
      },

      // ── VENDOR PRODUCTS ──
      vendorProducts: [],
      addVendorProduct: (product) => set({ vendorProducts: [...get().vendorProducts, product] }),
      updateVendorProduct: (productId, updates) => {
        const updated = get().vendorProducts.map(p => p.id === productId ? { ...p, ...updates } : p);
        set({ vendorProducts: updated });
      },
      deleteVendorProduct: (productId) => {
        set({ vendorProducts: get().vendorProducts.filter(p => p.id !== productId) });
      },
      getProductsByShop: (shopId) => get().vendorProducts.filter(p => p.shopId === shopId),

      // ── RIDER REGISTRATIONS ──
      riderRegistrations: [],
      addRiderRegistration: (reg) => set({ riderRegistrations: [...get().riderRegistrations, reg] }),
      approveRider: (regId) => {
        const updated = get().riderRegistrations.map(r => {
          if (r.id !== regId) return r;
          const riderId = 'NOE-R-' + Date.now().toString(36).toUpperCase().slice(-4);
          const password = riderId;
          return { ...r, status: 'approved' as const, riderId, password, approvedAt: new Date().toISOString(), isOnline: false, totalDeliveries: 0, totalEarnings: 0 };
        });
        set({ riderRegistrations: updated });
      },
      rejectRider: (regId, reason) => {
        const updated = get().riderRegistrations.map(r =>
          r.id === regId ? { ...r, status: 'rejected' as const, rejectionReason: reason, rejectedAt: new Date().toISOString() } : r
        );
        set({ riderRegistrations: updated });
      },
      getApprovedRiders: () => get().riderRegistrations.filter(r => r.status === 'approved'),
      getPendingRiders: () => get().riderRegistrations.filter(r => r.status === 'pending'),
      getOnlineRiders: () => get().riderRegistrations.filter(r => r.status === 'approved' && r.isOnline),
      setRiderOnline: (riderId, online) => {
        const updated = get().riderRegistrations.map(r =>
          r.riderId === riderId ? { ...r, isOnline: online } : r
        );
        set({ riderRegistrations: updated });
      },

      // Auth actions
      setUser: (user) => set({ isAuthenticated: !!user, user }),
      logout: () => set({
        isAuthenticated: false,
        user: null,
        cart: [],
        cartShopId: null,
        orders: [],
        walletBalance: 0,
        walletTransactions: [],
        notifications: [],
        unreadNotificationCount: 0,
        addresses: [],
        selectedAddressId: null,
        favoriteShopIds: [],
      }),
    }),
    {
      name: 'noe-store',
      partialize: (state) => ({
        language: state.language,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        cart: state.cart,
        cartShopId: state.cartShopId,
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
        selectedAreaId: state.selectedAreaId,
        favoriteShopIds: state.favoriteShopIds,
        currentLocation: state.currentLocation,
        demoOrders: state.demoOrders,
        walletBalance: state.walletBalance,
        vendorRegistrations: state.vendorRegistrations,
        vendorProducts: state.vendorProducts,
        riderRegistrations: state.riderRegistrations,
        shopReviews: state.shopReviews,
      }),
    }
  )
);
