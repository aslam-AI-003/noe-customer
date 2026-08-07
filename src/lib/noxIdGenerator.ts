/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NOX ID GENERATOR — Unique, Human-Readable IDs
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Format:
 * - Shop:     NOX-{ShopCode}-{AreaCode}-{SeqNo}     → NOX-SRV-TJ-001
 * - Order:    NOX-{ShopCode}-{YYYYMMDD}-{HHMM}-{SeqNo} → NOX-SRV-20260807-2045-001
 * - Rider:    NOX-R-{Name}-{AreaCode}-{SeqNo}       → NOX-R-Muthu-TJ-001
 * - Customer: NOX-C-{Phone}-{AreaCode}              → NOX-C-9876543210-TJ
 */

import { doc, getDoc, setDoc, increment, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AREA CODES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const AREA_CODES: Record<string, string> = {
  'Thanjavur': 'TJ',
  'Kumbakonam': 'KBK',
  'Papanasam': 'PPN',
  'Thiruvaiyaru': 'TVR',
  'Pattukkottai': 'PTK',
  'Orathanadu': 'OTN',
  'Thiruvidaimarudur': 'TVM',
  'Ayyampettai': 'AYP',
  'Srinivasa Nallur': 'SNR',
  'Vallam': 'VLM',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Generate 3-letter shop code from name
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateShopCode(shopName: string): string {
  // Remove common words and get meaningful letters
  const cleaned = shopName
    .replace(/[^a-zA-Z\s]/g, '')
    .replace(/\b(the|and|of|in|a|an|shop|store|stores|mart|super)\b/gi, '')
    .trim();
  
  const words = cleaned.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return 'XXX';
  
  if (words.length === 1) {
    // Single word: take first 3 consonants or letters
    return words[0].substring(0, 3).toUpperCase();
  }
  
  if (words.length === 2) {
    // Two words: first 2 letters of first word + first letter of second
    return (words[0].substring(0, 2) + words[1].substring(0, 1)).toUpperCase();
  }
  
  // 3+ words: first letter of each word
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Get area code from area name
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function getAreaCode(area: string): string {
  // Try exact match first
  if (AREA_CODES[area]) return AREA_CODES[area];
  
  // Try case-insensitive match
  const key = Object.keys(AREA_CODES).find(
    k => k.toLowerCase() === area.toLowerCase()
  );
  if (key) return AREA_CODES[key];
  
  // Fallback: first 2-3 letters
  return area.substring(0, 3).toUpperCase();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Format number with leading zeros
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function padNumber(num: number, digits: number = 3): string {
  return num.toString().padStart(digits, '0');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Get current datetime string
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDateTimeString(): { date: string; time: string } {
  const now = new Date();
  const date = now.getFullYear().toString() +
    padNumber(now.getMonth() + 1, 2) +
    padNumber(now.getDate(), 2);
  const time = padNumber(now.getHours(), 2) + padNumber(now.getMinutes(), 2);
  return { date, time };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COUNTER: Atomic increment in Firestore
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getNextSequence(counterName: string): Promise<number> {
  if (!db) {
    // Fallback for demo mode — random number
    return Math.floor(Math.random() * 900) + 100;
  }

  const counterRef = doc(db, 'config', 'counters');
  
  try {
    let newValue = 1;
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      if (counterDoc.exists()) {
        const data = counterDoc.data();
        const current = data[counterName] || 0;
        newValue = current + 1;
        transaction.update(counterRef, { [counterName]: newValue });
      } else {
        newValue = 1;
        transaction.set(counterRef, { [counterName]: 1 });
      }
    });
    
    return newValue;
  } catch (error) {
    console.error('Counter error:', error);
    // Fallback: timestamp-based unique number
    return parseInt(Date.now().toString().slice(-4));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE: Shop ID
// Format: NOX-{ShopCode}-{AreaCode}-{SeqNo}
// Example: NOX-SRV-TJ-001
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function generateShopId(shopName: string, area: string): Promise<string> {
  const shopCode = generateShopCode(shopName);
  const areaCode = getAreaCode(area);
  const seq = await getNextSequence('shops');
  
  return `NOX-${shopCode}-${areaCode}-${padNumber(seq)}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE: Order ID
// Format: NOX-{ShopCode}-{YYYYMMDD}-{HHMM}-{SeqNo}
// Example: NOX-SRV-20260807-2045-001
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function generateOrderId(shopCode: string): Promise<string> {
  const { date, time } = getDateTimeString();
  const todayKey = `orders_${shopCode}_${date}`;
  const seq = await getNextSequence(todayKey);
  
  return `NOX-${shopCode}-${date}-${time}-${padNumber(seq)}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE: Rider ID
// Format: NOX-R-{Name}-{AreaCode}-{SeqNo}
// Example: NOX-R-Muthu-TJ-001
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function generateRiderId(riderName: string, area: string): Promise<string> {
  const cleanName = riderName.replace(/[^a-zA-Z]/g, '').substring(0, 8);
  const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  const areaCode = getAreaCode(area);
  const seq = await getNextSequence('riders');
  
  return `NOX-R-${capitalizedName}-${areaCode}-${padNumber(seq)}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE: Customer ID
// Format: NOX-C-{Phone}-{AreaCode}
// Example: NOX-C-9876543210-TJ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateCustomerId(phone: string, area: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const areaCode = getAreaCode(area);
  
  return `NOX-C-${cleanPhone}-${areaCode}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE: Delivery OTP (4-digit)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateDeliveryOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARSE: Extract info from NOX IDs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function parseOrderId(orderId: string) {
  // NOX-SRV-20260807-2045-001
  const parts = orderId.split('-');
  if (parts.length < 5) return null;
  
  return {
    prefix: parts[0],       // NOX
    shopCode: parts[1],     // SRV
    date: parts[2],         // 20260807
    time: parts[3],         // 2045
    sequence: parts[4],     // 001
    formattedDate: `${parts[2].slice(6, 8)}/${parts[2].slice(4, 6)}/${parts[2].slice(0, 4)}`,
    formattedTime: `${parts[3].slice(0, 2)}:${parts[3].slice(2, 4)}`,
  };
}

export function parseShopId(shopId: string) {
  // NOX-SRV-TJ-001
  const parts = shopId.split('-');
  if (parts.length < 4) return null;
  
  return {
    prefix: parts[0],     // NOX
    shopCode: parts[1],   // SRV
    areaCode: parts[2],   // TJ
    sequence: parts[3],   // 001
  };
}
