// Internationalization - Tamil + English
export type Locale = 'en' | 'ta';

export const translations = {
  en: {
    // Common
    appName: 'Namma Ooru Express',
    tagline: 'Neenga Sollunga... Naanga Deliver Pannuvom!',
    subtitle: 'Fast • Safe • Trusted',
    search: 'Search shops, products...',
    loading: 'Loading...',
    cancel: 'Cancel',
    save: 'Save',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    viewAll: 'View All',
    
    // Nav
    home: 'Home',
    shops: 'Shops',
    trackOrder: 'Track Order',
    about: 'About',
    cart: 'Cart',
    profile: 'Profile',
    orders: 'My Orders',
    wallet: 'Wallet',
    favorites: 'Favorites',
    notifications: 'Notifications',
    support: 'Help & Support',
    settings: 'Settings',

    // Auth
    login: 'Login',
    register: 'Sign Up',
    logout: 'Logout',
    phoneNumber: 'Phone Number',
    enterOtp: 'Enter OTP',
    verifyOtp: 'Verify OTP',
    sendOtp: 'Send OTP',
    loginWithGoogle: 'Continue with Google',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",

    // Home
    setLocation: 'Set your delivery location',
    detectLocation: 'Use current location',
    nearbyShops: 'Nearby Shops',
    categories: 'Categories',
    popularShops: 'Popular in your area',
    recentOrders: 'Recent Orders',
    reorder: 'Reorder',
    
    // Categories
    groceries: 'Groceries',
    vegetables: 'Vegetables & Fruits',
    meat: 'Meat/Chicken/Fish',
    medicines: 'Medicines',
    bakery: 'Bakery',
    restaurants: 'Restaurants',
    teaShops: 'Tea Shops/Snacks',
    stationery: 'Stationery',
    petShop: 'Pet Shop',
    flowerShop: 'Flower Shop',
    electronics: 'Electronics',
    courier: 'Courier/Documents',
    waterCan: 'Water Can',
    gasCylinder: 'Gas Cylinder',
    milk: 'Milk',
    cakes: 'Cakes',
    customParcel: 'Custom Parcel',

    // Shop
    open: 'Open',
    closed: 'Closed',
    minOrder: 'Min order',
    delivery: 'Delivery',
    rating: 'Rating',
    reviews: 'reviews',
    addToCart: 'Add',
    outOfStock: 'Out of Stock',

    // Cart
    yourCart: 'Your Cart',
    emptyCart: 'Your cart is empty',
    subtotal: 'Subtotal',
    deliveryCharge: 'Delivery Charge',
    discount: 'Discount',
    total: 'Total',
    applyCoupon: 'Apply Coupon',
    proceedToCheckout: 'Proceed to Checkout',
    addMoreItems: 'Add more items',

    // Checkout
    deliveryAddress: 'Delivery Address',
    changeAddress: 'Change',
    addAddress: 'Add New Address',
    paymentMethod: 'Payment Method',
    upi: 'UPI',
    card: 'Card',
    cod: 'Cash on Delivery',
    walletPay: 'Wallet',
    placeOrder: 'Place Order',
    orderPlaced: 'Order Placed!',

    // Tracking
    orderStatus: 'Order Status',
    orderPlacedStatus: 'Order Placed',
    shopAccepted: 'Shop Accepted',
    preparing: 'Preparing',
    riderAssigned: 'Rider Assigned',
    riderPickedUp: 'Picked Up',
    onTheWay: 'On the Way',
    delivered: 'Delivered',
    enterDeliveryOtp: 'Enter Delivery OTP',
    estimatedTime: 'Estimated delivery',
    minutes: 'min',

    // Orders
    orderHistory: 'Order History',
    orderDetails: 'Order Details',
    invoice: 'Invoice',
    rateOrder: 'Rate this Order',
    reorderItems: 'Reorder',

    // Wallet
    walletBalance: 'Wallet Balance',
    addMoney: 'Add Money',
    transactions: 'Transactions',
    loyaltyPoints: 'Loyalty Points',

    // Delivery rates
    deliveryRates: 'Delivery Rates',
    freeDelivery: 'Free Delivery',
    kmAway: 'km away',
  },
  ta: {
    // Common
    appName: 'நம்ம ஊரு எக்ஸ்பிரஸ்',
    tagline: 'நீங்க சொல்லுங்க... நாங்க Deliver பண்றோம்!',
    subtitle: 'வேகம் • பாதுகாப்பு • நம்பிக்கை',
    search: 'கடைகள், பொருட்கள் தேடுங்கள்...',
    loading: 'ஏற்றுகிறது...',
    cancel: 'ரத்து',
    save: 'சேமி',
    submit: 'சமர்ப்பி',
    back: 'பின்',
    next: 'அடுத்து',
    done: 'முடிந்தது',
    viewAll: 'அனைத்தும் காண',

    // Nav
    home: 'முகப்பு',
    shops: 'கடைகள்',
    trackOrder: 'ஆர்டர் கண்காணி',
    about: 'எங்களை பற்றி',
    cart: 'கூடை',
    profile: 'சுயவிவரம்',
    orders: 'எனது ஆர்டர்கள்',
    wallet: 'வாலட்',
    favorites: 'பிடித்தவை',
    notifications: 'அறிவிப்புகள்',
    support: 'உதவி & ஆதரவு',
    settings: 'அமைப்புகள்',

    // Auth
    login: 'உள்நுழை',
    register: 'பதிவு செய்',
    logout: 'வெளியேறு',
    phoneNumber: 'தொலைபேசி எண்',
    enterOtp: 'OTP உள்ளிடவும்',
    verifyOtp: 'OTP சரிபார்',
    sendOtp: 'OTP அனுப்பு',
    loginWithGoogle: 'Google மூலம் தொடரவும்',
    createAccount: 'கணக்கு உருவாக்கு',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    dontHaveAccount: 'கணக்கு இல்லையா?',

    // Home
    setLocation: 'டெலிவரி முகவரி அமைக்கவும்',
    detectLocation: 'தற்போதைய இடத்தை பயன்படுத்து',
    nearbyShops: 'அருகிலுள்ள கடைகள்',
    categories: 'வகைகள்',
    popularShops: 'உங்கள் பகுதியில் பிரபலமானவை',
    recentOrders: 'சமீபத்திய ஆர்டர்கள்',
    reorder: 'மீண்டும் ஆர்டர்',

    // Categories
    groceries: 'மளிகை',
    vegetables: 'காய்கறி & பழங்கள்',
    meat: 'இறைச்சி/கோழி/மீன்',
    medicines: 'மருந்துகள்',
    bakery: 'பேக்கரி',
    restaurants: 'உணவகங்கள்',
    teaShops: 'டீ கடை/சிற்றுண்டி',
    stationery: 'ஸ்டேஷனரி',
    petShop: 'செல்லப்பிராணி கடை',
    flowerShop: 'பூ கடை',
    electronics: 'எலக்ட்ரானிக்ஸ்',
    courier: 'கூரியர்/ஆவணங்கள்',
    waterCan: 'தண்ணீர் கேன்',
    gasCylinder: 'காஸ் சிலிண்டர்',
    milk: 'பால்',
    cakes: 'கேக்',
    customParcel: 'கஸ்டம் பார்சல்',

    // Shop
    open: 'திறந்துள்ளது',
    closed: 'மூடப்பட்டுள்ளது',
    minOrder: 'குறைந்தபட்ச ஆர்டர்',
    delivery: 'டெலிவரி',
    rating: 'மதிப்பீடு',
    reviews: 'மதிப்புரைகள்',
    addToCart: 'சேர்',
    outOfStock: 'ஸ்டாக் இல்லை',

    // Cart
    yourCart: 'உங்கள் கூடை',
    emptyCart: 'கூடை காலியாக உள்ளது',
    subtotal: 'கூட்டுத்தொகை',
    deliveryCharge: 'டெலிவரி கட்டணம்',
    discount: 'தள்ளுபடி',
    total: 'மொத்தம்',
    applyCoupon: 'கூப்பன் பயன்படுத்து',
    proceedToCheckout: 'செக்அவுட் செல்',
    addMoreItems: 'மேலும் பொருட்கள் சேர்',

    // Checkout
    deliveryAddress: 'டெலிவரி முகவரி',
    changeAddress: 'மாற்று',
    addAddress: 'புதிய முகவரி சேர்',
    paymentMethod: 'பணம் செலுத்தும் முறை',
    upi: 'UPI',
    card: 'கார்டு',
    cod: 'பணம் (COD)',
    walletPay: 'வாலட்',
    placeOrder: 'ஆர்டர் செய்',
    orderPlaced: 'ஆர்டர் செய்யப்பட்டது!',

    // Tracking
    orderStatus: 'ஆர்டர் நிலை',
    orderPlacedStatus: 'ஆர்டர் செய்யப்பட்டது',
    shopAccepted: 'கடை ஏற்றுக்கொண்டது',
    preparing: 'தயாரிக்கப்படுகிறது',
    riderAssigned: 'ரைடர் நியமிக்கப்பட்டார்',
    riderPickedUp: 'எடுக்கப்பட்டது',
    onTheWay: 'வழியில்',
    delivered: 'டெலிவர் ஆனது',
    enterDeliveryOtp: 'டெலிவரி OTP உள்ளிடவும்',
    estimatedTime: 'மதிப்பிடப்பட்ட நேரம்',
    minutes: 'நிமி',

    // Orders
    orderHistory: 'ஆர்டர் வரலாறு',
    orderDetails: 'ஆர்டர் விவரங்கள்',
    invoice: 'இன்வாய்ஸ்',
    rateOrder: 'மதிப்பிடு',
    reorderItems: 'மீண்டும் ஆர்டர்',

    // Wallet
    walletBalance: 'வாலட் இருப்பு',
    addMoney: 'பணம் சேர்',
    transactions: 'பரிவர்த்தனைகள்',
    loyaltyPoints: 'லாயல்டி புள்ளிகள்',

    // Delivery rates
    deliveryRates: 'டெலிவரி கட்டணம்',
    freeDelivery: 'இலவச டெலிவரி',
    kmAway: 'கி.மீ தூரம்',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, locale: Locale = 'en'): string {
  return translations[locale][key] || translations.en[key] || key;
}
