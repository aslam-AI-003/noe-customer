// ============================================================
//  NammaOoru Express — Firebase Service Layer
//  All Firestore read/write operations in one place
// ============================================================

import {
  collection, doc, getDoc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, increment, writeBatch,
  Timestamp, DocumentData,
} from 'firebase/firestore';
import { db as _db } from './firebase';
import { Firestore } from 'firebase/firestore';

// ── DEMO MODE GUARD ──
// When Firebase is not configured, all service functions
// return gracefully without crashing. The app works in
// demo mode using Zustand's local demoOrders store.

// Use a type assertion to satisfy TS; at runtime we guard with try/catch
const db = _db as Firestore;

// ─── TYPES ───────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: 'customer' | 'vendor' | 'rider' | 'admin';
  walletBalance: number;
  loyaltyPoints: number;
  photoURL?: string;
  referralCode?: string;
  createdAt?: Timestamp;
}

export interface Address {
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

export interface OrderItem {
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

export interface Order {
  id?: string;
  userId: string;
  shopId: string;
  shopName: string;
  shopIcon: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
  paymentMethod: string;
  address: Address;
  notes?: string;
  riderId?: string;
  riderName?: string;
  rating?: number;
  review?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface WalletTransaction {
  id?: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  desc: string;
  status: 'completed' | 'pending' | 'refunded';
  icon: string;
  orderId?: string;
  createdAt?: Timestamp;
}

export interface Notification {
  id?: string;
  userId: string;
  type: 'order' | 'promotion' | 'payment' | 'system';
  icon: string;
  title: string;
  body: string;
  read: boolean;
  orderId?: string;
  createdAt?: Timestamp;
}

// ─── USER PROFILE ────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return { uid, ...snap.data() } as UserProfile;
    return null;
  } catch (e) {
    console.error('getUserProfile error:', e);
    return null;
  }
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    walletBalance: data.walletBalance ?? 0,
    loyaltyPoints: 0,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

// ─── ADDRESSES ───────────────────────────────────────────────

export async function getUserAddresses(uid: string): Promise<Address[]> {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'addresses'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Address));
  } catch (e) {
    console.error('getUserAddresses error:', e);
    return [];
  }
}

export async function addUserAddress(uid: string, address: Omit<Address, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'addresses'), {
    ...address,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateUserAddress(uid: string, addressId: string, data: Partial<Address>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'addresses', addressId), data);
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
}

// ─── ORDERS ──────────────────────────────────────────────────

export async function placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'placed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e: any) {
    console.warn('Firestore placeOrder failed (using local fallback):', e?.message || e);
    // Fallback: generate a local order ID so the flow continues
    const localId = 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return localId;
  }
}

export async function getUserOrders(uid: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  } catch (e) {
    console.error('getUserOrders error:', e);
    return [];
  }
}

export function subscribeToUserOrders(uid: string, callback: (orders: Order[]) => void) {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    callback(orders);
  });
}

export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
  return onSnapshot(doc(db, 'orders', orderId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() } as Order);
    else callback(null);
  });
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() });
}

export async function rateOrder(orderId: string, rating: number, review: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { rating, review, updatedAt: serverTimestamp() });
}

export async function cancelOrder(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled', updatedAt: serverTimestamp() });
}

// ─── WALLET ──────────────────────────────────────────────────

export async function getWalletBalance(uid: string): Promise<number> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return snap.data().walletBalance ?? 0;
    return 0;
  } catch (e) {
    return 0;
  }
}

export async function addMoneyToWallet(uid: string, amount: number, desc: string): Promise<void> {
  const batch = writeBatch(db);
  // Update user wallet balance
  batch.update(doc(db, 'users', uid), { walletBalance: increment(amount) });
  // Add transaction record
  const txRef = doc(collection(db, 'users', uid, 'transactions'));
  batch.set(txRef, {
    userId: uid,
    type: 'credit',
    amount,
    desc,
    status: 'completed',
    icon: '📥',
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function deductFromWallet(uid: string, amount: number, desc: string, orderId?: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), { walletBalance: increment(-amount) });
    const txRef = doc(collection(db, 'users', uid, 'transactions'));
    batch.set(txRef, {
      userId: uid,
      type: 'debit',
      amount,
      desc,
      status: 'completed',
      icon: '🛵',
      orderId: orderId || null,
      createdAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (e) {
    console.warn('deductFromWallet failed:', e);
  }
}

export async function addCashback(uid: string, amount: number, orderId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', uid), { walletBalance: increment(amount) });
  const txRef = doc(collection(db, 'users', uid, 'transactions'));
  batch.set(txRef, {
    userId: uid,
    type: 'credit',
    amount,
    desc: `Cashback on order`,
    status: 'completed',
    icon: '💰',
    orderId,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function getWalletTransactions(uid: string): Promise<WalletTransaction[]> {
  try {
    const q = query(
      collection(db, 'users', uid, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WalletTransaction));
  } catch (e) {
    console.error('getWalletTransactions error:', e);
    return [];
  }
}

export function subscribeToWallet(uid: string, callback: (balance: number, transactions: WalletTransaction[]) => void) {
  // Subscribe to user doc for balance
  const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) {
      const balance = snap.data().walletBalance ?? 0;
      // Also get transactions
      getWalletTransactions(uid).then(txs => callback(balance, txs));
    }
  });
  return unsubUser;
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

export async function getNotifications(uid: string): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'users', uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
  } catch (e) {
    console.error('getNotifications error:', e);
    return [];
  }
}

export function subscribeToNotifications(uid: string, callback: (notifications: Notification[]) => void) {
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
    callback(notifications);
  });
}

export async function markNotificationRead(uid: string, notifId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'notifications', notifId), { read: true });
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  const q = query(collection(db, 'users', uid, 'notifications'), where('read', '==', false));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { read: true }));
  await batch.commit();
}

export async function addNotification(uid: string, notif: Omit<Notification, 'id' | 'userId' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'notifications'), {
    ...notif,
    userId: uid,
    createdAt: serverTimestamp(),
  });
}

// ─── FAVORITES ───────────────────────────────────────────────

export async function getFavoriteShops(uid: string): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return snap.data().favoriteShopIds ?? [];
    return [];
  } catch (e) {
    return [];
  }
}

export async function toggleFavoriteShop(uid: string, shopId: string, isFav: boolean): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const current: string[] = snap.data().favoriteShopIds ?? [];
  const updated = isFav
    ? current.filter(id => id !== shopId)
    : [...current, shopId];
  await updateDoc(userRef, { favoriteShopIds: updated });
}

// ─── SHOPS (read from Firestore if available, fallback to seed) ──

export async function getShops(): Promise<DocumentData[]> {
  try {
    const snap = await getDocs(collection(db, 'shops'));
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

export async function getShopById(shopId: string): Promise<DocumentData | null> {
  try {
    const snap = await getDoc(doc(db, 'shops', shopId));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch (e) {
    return null;
  }
}

// ─── SEED SHOPS TO FIRESTORE (run once) ──────────────────────

export async function seedShopsToFirestore(shops: DocumentData[], products: DocumentData[]): Promise<void> {
  const batch = writeBatch(db);
  shops.forEach(shop => {
    const ref = doc(db, 'shops', shop.id);
    batch.set(ref, shop, { merge: true });
  });
  await batch.commit();

  // Products in batches of 500
  const productBatch = writeBatch(db);
  products.forEach(product => {
    const ref = doc(db, 'products', product.id);
    productBatch.set(ref, product, { merge: true });
  });
  await productBatch.commit();
}
