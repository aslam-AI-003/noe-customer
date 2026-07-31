// App Constants
export const APP_NAME = 'Namma Ooru Express';
export const APP_TAGLINE = 'Neenga Sollunga... Naanga Deliver Pannuvom!';
export const APP_DESCRIPTION = 'Hyperlocal Delivery Platform - Fast, Safe, Trusted';
export const SUPPORT_PHONE = '9566700534';
export const SUPPORT_EMAIL = 'support@nammaooru.express';

// Delivery charges
export const DEFAULT_DELIVERY_CHARGES = {
  '0-2': 30,
  '2-5': 50,
  '5-8': 80,
  '8+': 10, // per km extra
};

// Order statuses with Tamil labels
export const ORDER_STATUS_LABELS = {
  placed: { en: 'Order Placed', ta: 'ஆர்டர் வைக்கப்பட்டது' },
  confirmed: { en: 'Confirmed', ta: 'உறுதி செய்யப்பட்டது' },
  preparing: { en: 'Preparing', ta: 'தயாரிக்கப்படுகிறது' },
  ready: { en: 'Ready for Pickup', ta: 'பிக்அப் தயார்' },
  rider_assigned: { en: 'Rider Assigned', ta: 'ரைடர் நியமிக்கப்பட்டார்' },
  picked_up: { en: 'Picked Up', ta: 'எடுக்கப்பட்டது' },
  in_transit: { en: 'On the Way', ta: 'வழியில் உள்ளது' },
  delivered: { en: 'Delivered', ta: 'டெலிவரி ஆனது' },
  cancelled: { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டது' },
  refunded: { en: 'Refunded', ta: 'பணம் திரும்ப அளிக்கப்பட்டது' },
};

// Platform features
export const FEATURES = [
  { icon: '⚡', title: 'Fast Delivery', titleTamil: 'வேக டெலிவரி', description: '30 minutes or less' },
  { icon: '🛡️', title: 'Safe Handling', titleTamil: 'பாதுகாப்பான கையாளுதல்', description: 'Your items are safe with us' },
  { icon: '✅', title: 'Trusted Service', titleTamil: 'நம்பகமான சேவை', description: 'Verified shops and riders' },
  { icon: '📍', title: 'Your Area', titleTamil: 'உங்கள் பகுதி', description: 'Hyperlocal coverage' },
];

// Service areas
export const SERVICE_AREAS = [
  { city: 'Thanjavur', state: 'Tamil Nadu', isActive: true },
  { city: 'Kumbakonam', state: 'Tamil Nadu', isActive: true },
];
