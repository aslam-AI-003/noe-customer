/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FIRESTORE SERVICE — Real-time CRUD for all collections
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Collections:
 * - vendors/       → Shop registrations
 * - riders/        → Rider registrations
 * - products/      → Vendor products
 * - orders/        → Customer orders
 * - users/         → User profiles
 */

import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc,
  deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp,
  Timestamp, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { VendorRegistration, RiderRegistration, VendorProduct, DemoOrder } from '@/store/useStore';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: Check if Firebase is available
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDb() {
  if (!db) {
    console.warn('⚠️ Firebase not initialized. Running in demo mode.');
    return null;
  }
  return db;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VENDOR SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const vendorService = {
  // Add new vendor registration
  async create(vendor: Omit<VendorRegistration, 'id'>): Promise<string | null> {
    const firestore = getDb();
    if (!firestore) return null;
    const docRef = await addDoc(collection(firestore, 'vendors'), {
      ...vendor,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get all vendors
  async getAll(): Promise<VendorRegistration[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const snapshot = await getDocs(query(collection(firestore, 'vendors'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorRegistration));
  },

  // Get pending vendors
  async getPending(): Promise<VendorRegistration[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const q = query(collection(firestore, 'vendors'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorRegistration));
  },

  // Get approved vendors
  async getApproved(): Promise<VendorRegistration[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const q = query(collection(firestore, 'vendors'), where('status', '==', 'approved'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorRegistration));
  },

  // Update vendor (approve/reject)
  async update(vendorId: string, updates: Partial<VendorRegistration>): Promise<void> {
    const firestore = getDb();
    if (!firestore) return;
    await updateDoc(doc(firestore, 'vendors', vendorId), updates);
  },

  // Real-time listener for all vendors
  onAll(callback: (vendors: VendorRegistration[]) => void) {
    const firestore = getDb();
    if (!firestore) return () => {};
    const q = query(collection(firestore, 'vendors'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const vendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorRegistration));
      callback(vendors);
    });
  },

  // Find vendor by credentials (for login)
  async findByCredentials(phone: string, password: string): Promise<VendorRegistration | null> {
    const firestore = getDb();
    if (!firestore) return null;
    const q = query(
      collection(firestore, 'vendors'),
      where('status', '==', 'approved'),
      where('phone', '==', phone),
      where('password', '==', password)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as VendorRegistration;
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const riderService = {
  async create(rider: Omit<RiderRegistration, 'id'>): Promise<string | null> {
    const firestore = getDb();
    if (!firestore) return null;
    const docRef = await addDoc(collection(firestore, 'riders'), {
      ...rider,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAll(): Promise<RiderRegistration[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const snapshot = await getDocs(query(collection(firestore, 'riders'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RiderRegistration));
  },

  async update(riderId: string, updates: Partial<RiderRegistration>): Promise<void> {
    const firestore = getDb();
    if (!firestore) return;
    await updateDoc(doc(firestore, 'riders', riderId), updates);
  },

  async getOnlineRiders(): Promise<RiderRegistration[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const q = query(
      collection(firestore, 'riders'),
      where('status', '==', 'approved'),
      where('isOnline', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RiderRegistration));
  },

  async findByCredentials(phone: string, password: string): Promise<RiderRegistration | null> {
    const firestore = getDb();
    if (!firestore) return null;
    const q = query(
      collection(firestore, 'riders'),
      where('status', '==', 'approved'),
      where('phone', '==', phone),
      where('password', '==', password)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as RiderRegistration;
  },

  onAll(callback: (riders: RiderRegistration[]) => void) {
    const firestore = getDb();
    if (!firestore) return () => {};
    const q = query(collection(firestore, 'riders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const riders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RiderRegistration));
      callback(riders);
    });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCT SERVICE (Vendor Menu Items)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const productService = {
  async create(product: Omit<VendorProduct, 'id'>): Promise<string | null> {
    const firestore = getDb();
    if (!firestore) return null;
    const docRef = await addDoc(collection(firestore, 'products'), product);
    return docRef.id;
  },

  async getByShop(shopId: string): Promise<VendorProduct[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const q = query(collection(firestore, 'products'), where('shopId', '==', shopId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorProduct));
  },

  async update(productId: string, updates: Partial<VendorProduct>): Promise<void> {
    const firestore = getDb();
    if (!firestore) return;
    await updateDoc(doc(firestore, 'products', productId), updates);
  },

  async delete(productId: string): Promise<void> {
    const firestore = getDb();
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'products', productId));
  },

  // Real-time listener for a shop's products
  onShopProducts(shopId: string, callback: (products: VendorProduct[]) => void) {
    const firestore = getDb();
    if (!firestore) return () => {};
    const q = query(collection(firestore, 'products'), where('shopId', '==', shopId));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorProduct));
      callback(products);
    });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const orderService = {
  async create(order: Omit<DemoOrder, 'id'>): Promise<string | null> {
    const firestore = getDb();
    if (!firestore) return null;
    const docRef = await addDoc(collection(firestore, 'orders'), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getByUser(userId: string): Promise<DemoOrder[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const q = query(
      collection(firestore, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DemoOrder));
  },

  async getByShop(shopId: string): Promise<DemoOrder[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const q = query(
      collection(firestore, 'orders'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DemoOrder));
  },

  async getByRider(riderId: string): Promise<DemoOrder[]> {
    const firestore = getDb();
    if (!firestore) return [];
    const q = query(
      collection(firestore, 'orders'),
      where('riderId', '==', riderId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DemoOrder));
  },

  async updateStatus(orderId: string, status: string, extra?: Record<string, any>): Promise<void> {
    const firestore = getDb();
    if (!firestore) return;
    await updateDoc(doc(firestore, 'orders', orderId), {
      status,
      ...extra,
      updatedAt: serverTimestamp(),
    });
  },

  // Real-time listener for shop orders
  onShopOrders(shopId: string, callback: (orders: DemoOrder[]) => void) {
    const firestore = getDb();
    if (!firestore) return () => {};
    const q = query(
      collection(firestore, 'orders'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DemoOrder));
      callback(orders);
    });
  },

  // Real-time listener for rider orders
  onRiderOrders(riderId: string, callback: (orders: DemoOrder[]) => void) {
    const firestore = getDb();
    if (!firestore) return () => {};
    const q = query(
      collection(firestore, 'orders'),
      where('riderId', '==', riderId)
    );
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DemoOrder));
      callback(orders);
    });
  },

  // Real-time all orders (for admin)
  onAll(callback: (orders: DemoOrder[]) => void) {
    const firestore = getDb();
    if (!firestore) return () => {};
    const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DemoOrder));
      callback(orders);
    });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface FirestoreUser {
  uid: string;
  displayName: string;
  phone: string;
  email?: string;
  photoURL?: string;
  role: 'customer' | 'vendor' | 'rider' | 'admin';
  createdAt?: any;
}

export const userService = {
  async createOrUpdate(user: FirestoreUser): Promise<void> {
    const firestore = getDb();
    if (!firestore) return;
    await setDoc(doc(firestore, 'users', user.uid), {
      ...user,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  async get(uid: string): Promise<FirestoreUser | null> {
    const firestore = getDb();
    if (!firestore) return null;
    const docSnap = await getDoc(doc(firestore, 'users', uid));
    if (!docSnap.exists()) return null;
    return { uid: docSnap.id, ...docSnap.data() } as FirestoreUser;
  },
};
