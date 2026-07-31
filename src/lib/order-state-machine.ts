/**
 * Order State Machine for Namma Ooru Express
 * 
 * States: placed → shop_notified → shop_accepted → rider_assigned → rider_accepted →
 *         pickup_otp_verified → in_transit → delivery_otp_verified → payment_settled → rated → closed
 * 
 * Branch states: cancelled | refunded | disputed (can branch from any pre-completion state)
 */

export type OrderStatus =
  | 'placed'
  | 'shop_notified'
  | 'shop_accepted'
  | 'rider_assigned'
  | 'rider_accepted'
  | 'pickup_otp_verified'
  | 'in_transit'
  | 'delivery_otp_verified'
  | 'payment_settled'
  | 'rated'
  | 'closed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type OrderAction =
  | 'notify_shop'
  | 'shop_accept'
  | 'shop_reject'
  | 'assign_rider'
  | 'rider_accept'
  | 'rider_reject'
  | 'verify_pickup_otp'
  | 'start_transit'
  | 'verify_delivery_otp'
  | 'settle_payment'
  | 'rate'
  | 'close'
  | 'cancel'
  | 'refund'
  | 'dispute';

// Valid state transitions
const transitions: Record<OrderStatus, Partial<Record<OrderAction, OrderStatus>>> = {
  placed: {
    notify_shop: 'shop_notified',
    cancel: 'cancelled',
  },
  shop_notified: {
    shop_accept: 'shop_accepted',
    shop_reject: 'cancelled',
    cancel: 'cancelled',
  },
  shop_accepted: {
    assign_rider: 'rider_assigned',
    cancel: 'cancelled',
  },
  rider_assigned: {
    rider_accept: 'rider_accepted',
    rider_reject: 'shop_accepted', // re-assign another rider
    cancel: 'cancelled',
  },
  rider_accepted: {
    verify_pickup_otp: 'pickup_otp_verified',
    cancel: 'cancelled',
    dispute: 'disputed',
  },
  pickup_otp_verified: {
    start_transit: 'in_transit',
    dispute: 'disputed',
  },
  in_transit: {
    verify_delivery_otp: 'delivery_otp_verified',
    dispute: 'disputed',
  },
  delivery_otp_verified: {
    settle_payment: 'payment_settled',
    dispute: 'disputed',
  },
  payment_settled: {
    rate: 'rated',
    close: 'closed',
    dispute: 'disputed',
  },
  rated: {
    close: 'closed',
  },
  closed: {},
  cancelled: {
    refund: 'refunded',
  },
  refunded: {},
  disputed: {
    refund: 'refunded',
    close: 'closed',
  },
};

export interface OrderTransitionResult {
  success: boolean;
  newStatus?: OrderStatus;
  error?: string;
}

export function canTransition(currentStatus: OrderStatus, action: OrderAction): boolean {
  return transitions[currentStatus]?.[action] !== undefined;
}

export function transition(currentStatus: OrderStatus, action: OrderAction): OrderTransitionResult {
  const nextStatus = transitions[currentStatus]?.[action];
  
  if (!nextStatus) {
    return {
      success: false,
      error: `Invalid transition: cannot perform "${action}" from status "${currentStatus}"`,
    };
  }

  return {
    success: true,
    newStatus: nextStatus,
  };
}

// Helper to get human-readable status info
export function getStatusInfo(status: OrderStatus) {
  const statusMap: Record<OrderStatus, { label: string; labelTamil: string; color: string; icon: string }> = {
    placed: { label: 'Order Placed', labelTamil: 'ஆர்டர் செய்யப்பட்டது', color: 'blue', icon: 'package' },
    shop_notified: { label: 'Shop Notified', labelTamil: 'கடைக்கு அறிவிக்கப்பட்டது', color: 'blue', icon: 'bell' },
    shop_accepted: { label: 'Shop Accepted', labelTamil: 'கடை ஏற்றுக்கொண்டது', color: 'green', icon: 'check-circle' },
    rider_assigned: { label: 'Rider Assigned', labelTamil: 'ரைடர் நியமிக்கப்பட்டார்', color: 'yellow', icon: 'bike' },
    rider_accepted: { label: 'Rider Accepted', labelTamil: 'ரைடர் ஏற்றுக்கொண்டார்', color: 'yellow', icon: 'thumbs-up' },
    pickup_otp_verified: { label: 'Picked Up', labelTamil: 'எடுக்கப்பட்டது', color: 'orange', icon: 'package-check' },
    in_transit: { label: 'On the Way', labelTamil: 'வழியில்', color: 'orange', icon: 'truck' },
    delivery_otp_verified: { label: 'Delivered', labelTamil: 'டெலிவர் ஆனது', color: 'green', icon: 'check-circle-2' },
    payment_settled: { label: 'Payment Done', labelTamil: 'பணம் செலுத்தப்பட்டது', color: 'green', icon: 'credit-card' },
    rated: { label: 'Rated', labelTamil: 'மதிப்பிடப்பட்டது', color: 'green', icon: 'star' },
    closed: { label: 'Completed', labelTamil: 'முடிந்தது', color: 'gray', icon: 'circle-check' },
    cancelled: { label: 'Cancelled', labelTamil: 'ரத்து', color: 'red', icon: 'x-circle' },
    refunded: { label: 'Refunded', labelTamil: 'பணம் திரும்பியது', color: 'purple', icon: 'rotate-ccw' },
    disputed: { label: 'Disputed', labelTamil: 'தகராறு', color: 'red', icon: 'alert-triangle' },
  };

  return statusMap[status];
}

// Get the flow steps for tracking UI
export function getTrackingSteps(currentStatus: OrderStatus) {
  const mainFlow: OrderStatus[] = [
    'placed',
    'shop_accepted',
    'rider_accepted',
    'pickup_otp_verified',
    'in_transit',
    'delivery_otp_verified',
    'closed',
  ];

  const currentIndex = mainFlow.indexOf(currentStatus);
  
  return mainFlow.map((status, index) => ({
    ...getStatusInfo(status),
    status,
    isCompleted: index <= currentIndex && currentIndex >= 0,
    isCurrent: status === currentStatus,
  }));
}
