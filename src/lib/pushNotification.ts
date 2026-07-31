// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUSH NOTIFICATIONS — Web Push API
// Works on: Chrome, Firefox, Edge, Samsung Internet
// Uses Service Worker for background notifications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Check if push is supported
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch {
    return 'denied';
  }
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('✅ Service Worker registered:', registration.scope);
    return registration;
  } catch (err) {
    console.error('❌ Service Worker registration failed:', err);
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEND LOCAL NOTIFICATION (immediate, no server needed)
// Perfect for: order updates, rider alerts, status changes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  vibrate?: number[];
}

// Send notification via Service Worker (works in background!)
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  if (Notification.permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Using 'as any' because vibrate/renotify are supported by browsers but not in TS types
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: payload.tag || 'noe-' + Date.now(),
      data: { url: payload.url || '/' },
      vibrate: payload.vibrate || [200, 100, 200],
      renotify: true,
    } as NotificationOptions & { vibrate?: number[]; renotify?: boolean });

    return true;
  } catch (err) {
    console.error('Notification failed:', err);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRE-BUILT NOTIFICATION TEMPLATES
// Call these on order status changes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NOTIFICATIONS = {
  // Customer notifications
  orderPlaced: (orderId: string) => sendNotification({
    title: '✅ Order Placed!',
    body: `Your order #${orderId} has been placed. Shop will confirm shortly.`,
    tag: 'order-placed',
    url: '/orders',
  }),

  orderConfirmed: (orderId: string, shopName: string) => sendNotification({
    title: '👨‍🍳 Order Confirmed!',
    body: `${shopName} is preparing your order #${orderId}`,
    tag: 'order-confirmed',
    url: '/orders',
  }),

  orderReady: (orderId: string) => sendNotification({
    title: '📦 Order Ready!',
    body: `Order #${orderId} is packed & ready. Rider on the way to pick up!`,
    tag: 'order-ready',
    url: '/track',
  }),

  orderPickedUp: (orderId: string, riderName: string) => sendNotification({
    title: '🛵 Picked Up!',
    body: `${riderName} picked up your order #${orderId}. Coming to you!`,
    tag: 'order-pickup',
    url: '/track',
    vibrate: [200, 100, 200, 100, 200],
  }),

  orderOnTheWay: (orderId: string) => sendNotification({
    title: '🚴 On The Way!',
    body: `Your order #${orderId} is out for delivery. Track it live!`,
    tag: 'order-otw',
    url: '/track',
    vibrate: [300, 100, 300],
  }),

  orderDelivered: (orderId: string) => sendNotification({
    title: '🎉 Delivered!',
    body: `Order #${orderId} delivered. Enjoy! Rate your experience ⭐`,
    tag: 'order-delivered',
    url: '/orders',
    vibrate: [100, 50, 100, 50, 300],
  }),

  // Vendor notifications
  newOrderForShop: (orderId: string, customerName: string) => sendNotification({
    title: '🔔 New Order!',
    body: `New order #${orderId} from ${customerName}. Accept now!`,
    tag: 'new-order',
    url: '/dashboard/shop/orders',
    vibrate: [500, 200, 500],
  }),

  // Rider notifications
  newDeliveryForRider: (orderId: string, shopName: string) => sendNotification({
    title: '📦 New Delivery!',
    body: `Pickup from ${shopName} — Order #${orderId}. Go now!`,
    tag: 'new-delivery',
    url: '/dashboard/rider',
    vibrate: [500, 200, 500, 200, 500],
  }),

  // Promo notifications
  specialOffer: (message: string) => sendNotification({
    title: '🎁 Special Offer!',
    body: message,
    tag: 'promo',
    url: '/offers',
  }),

  walletCredited: (amount: number) => sendNotification({
    title: '💰 Wallet Credited!',
    body: `₹${amount} added to your NOE wallet. Order now!`,
    tag: 'wallet',
    url: '/wallet',
  }),
};
