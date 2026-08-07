/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NOX ORDER SERVICE — Real Firestore Order Operations
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Customer App Operations:
 * - Place order (create)
 * - Track order (real-time listener)
 * - Cancel order
 * - Rate order
 * - Get order history
 */

import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { generateOrderId, generateDeliveryOTP, getAreaCode } from './noxIdGenerator';
import type { NoxOrder, NoxOrderStatus, CreateNoxOrderInput } from '@/types/noxOrder';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: Check Firebase
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDb() {
  if (!db) {
    console.warn('⚠️ Firebase not initialized. Order will be stored locally.');
    return null;
  }
  return db;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLACE ORDER — Customer creates a new order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function placeOrder(input: CreateNoxOrderInput): Promise<NoxOrder | null> {
  const firestore = getDb();
  
  // Generate unique NOX Order ID
  const orderId = await generateOrderId(input.shopCode);
  const deliveryOTP = generateDeliveryOTP();
  
  const order: NoxOrder = {
    // IDs
    orderId,
    shopId: input.shopId,
    shopCode: input.shopCode,
    customerId: input.customerId,
    riderId: null,

    // Names
    shopName: input.shopName,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    riderName: null,
    riderPhone: null,

    // Items
    items: input.items,
    itemCount: input.items.reduce((sum, item) => sum + item.quantity, 0),

    // Pricing
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    platformFee: input.platformFee,
    discount: input.discount,
    couponCode: input.couponCode,
    total: input.total,

    // Status
    status: 'placed',
    timeline: [{
      status: 'placed',
      timestamp: new Date().toISOString(),
      note: 'Order placed by customer',
      updatedBy: input.customerId,
    }],

    // Payment
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === 'COD' ? 'pending' : 'pending',
    paymentId: null,

    // Delivery
    deliveryOTP,
    deliveryAddress: input.deliveryAddress,
    deliveryLandmark: input.deliveryLandmark,
    customerLocation: input.customerLocation,
    shopLocation: input.shopLocation,
    riderLocation: null,
    estimatedDelivery: input.estimatedDelivery,
    distance: input.distance,

    // Area
    area: input.area,
    areaCode: input.areaCode,

    // Notes
    customerNote: input.customerNote,
    cancelReason: null,
    cancelledBy: null,

    // Timestamps
    createdAt: serverTimestamp(),
    acceptedAt: null,
    preparedAt: null,
    pickedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    updatedAt: serverTimestamp(),

    // Rating
    rating: null,
    review: null,
    riderRating: null,
  };

  if (!firestore) {
    // Demo mode — store locally
    console.log('📦 [DEMO] Order created:', orderId);
    // Replace serverTimestamp with actual dates for local storage
    order.createdAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    return order;
  }

  try {
    // Write to Firestore with orderId as document ID
    await setDoc(doc(firestore, 'orders', orderId), order);
    console.log('✅ Order placed in Firestore:', orderId);
    return order;
  } catch (error) {
    console.error('❌ Error placing order:', error);
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET ORDER — Fetch single order by ID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getOrder(orderId: string): Promise<NoxOrder | null> {
  const firestore = getDb();
  if (!firestore) return null;

  try {
    const docSnap = await getDoc(doc(firestore, 'orders', orderId));
    if (!docSnap.exists()) return null;
    return docSnap.data() as NoxOrder;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET CUSTOMER ORDERS — Order history for a customer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getCustomerOrders(customerId: string): Promise<NoxOrder[]> {
  const firestore = getDb();
  if (!firestore) return [];

  try {
    const q = query(
      collection(firestore, 'orders'),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as NoxOrder);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRACK ORDER — Real-time listener for single order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function trackOrder(orderId: string, callback: (order: NoxOrder | null) => void): () => void {
  const firestore = getDb();
  if (!firestore) return () => {};

  const orderRef = doc(firestore, 'orders', orderId);
  return onSnapshot(orderRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as NoxOrder);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Track order error:', error);
    callback(null);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTEN CUSTOMER ORDERS — Real-time list of all customer orders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function listenCustomerOrders(customerId: string, callback: (orders: NoxOrder[]) => void): () => void {
  const firestore = getDb();
  if (!firestore) return () => {};

  const q = query(
    collection(firestore, 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => doc.data() as NoxOrder);
    callback(orders);
  }, (error) => {
    console.error('Listen customer orders error:', error);
    callback([]);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CANCEL ORDER — Customer cancels their order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function cancelOrder(orderId: string, customerId: string, reason: string): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) return false;
    
    const order = orderSnap.data() as NoxOrder;
    
    // Can only cancel if status is 'placed' or 'accepted'
    if (!['placed', 'accepted'].includes(order.status)) {
      console.warn('Cannot cancel order in status:', order.status);
      return false;
    }

    const updatedTimeline = [...order.timeline, {
      status: 'cancelled' as NoxOrderStatus,
      timestamp: new Date().toISOString(),
      note: reason,
      updatedBy: customerId,
    }];

    await updateDoc(orderRef, {
      status: 'cancelled',
      cancelReason: reason,
      cancelledBy: customerId,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: updatedTimeline,
    });

    console.log('✅ Order cancelled:', orderId);
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RATE ORDER — Customer rates after delivery
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function rateOrder(
  orderId: string,
  rating: number,
  review: string,
  riderRating?: number
): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    await updateDoc(doc(firestore, 'orders', orderId), {
      rating,
      review,
      riderRating: riderRating || null,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error rating order:', error);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET ACTIVE ORDERS — Orders that are not yet delivered/cancelled
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getActiveOrders(customerId: string): Promise<NoxOrder[]> {
  const firestore = getDb();
  if (!firestore) return [];

  try {
    const q = query(
      collection(firestore, 'orders'),
      where('customerId', '==', customerId),
      where('status', 'in', ['placed', 'accepted', 'preparing', 'ready', 'rider_assigned', 'picked_up', 'in_transit']),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as NoxOrder);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return [];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTEN ACTIVE ORDERS — Real-time active orders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function listenActiveOrders(customerId: string, callback: (orders: NoxOrder[]) => void): () => void {
  const firestore = getDb();
  if (!firestore) return () => {};

  const q = query(
    collection(firestore, 'orders'),
    where('customerId', '==', customerId),
    where('status', 'in', ['placed', 'accepted', 'preparing', 'ready', 'rider_assigned', 'picked_up', 'in_transit'])
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => doc.data() as NoxOrder);
    callback(orders);
  }, (error) => {
    console.error('Listen active orders error:', error);
    callback([]);
  });
}
