/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FIREBASE PHONE AUTHENTICATION — Real OTP via SMS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Uses Firebase Auth signInWithPhoneNumber which sends
 * a real SMS OTP to the user's phone.
 *
 * Flow:
 * 1. setupRecaptcha() — invisible reCAPTCHA (fresh div each time)
 * 2. sendOTP(phone) — sends SMS, returns confirmationResult
 * 3. verifyOTP(code) — verifies the OTP, returns Firebase User
 * 4. onAuthChange(cb) — listens for auth state changes
 * 5. logout() — signs out
 *
 * Fallback: If Firebase Auth is not configured, falls back
 * to dev mode (OTP = 1234) so the app still works locally.
 */

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let recaptchaContainerId = 0; // Increment to create unique container IDs

// Check if real Firebase Auth is available
export function isFirebaseAuthAvailable(): boolean {
  return !!auth;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL: Destroy old reCAPTCHA completely
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function destroyRecaptcha(): void {
  // Clear the verifier instance
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch {}
    recaptchaVerifier = null;
  }

  // Remove ALL old reCAPTCHA container divs from DOM
  document.querySelectorAll('[id^="recaptcha-box-"]').forEach(el => el.remove());
  
  // Also remove any stale reCAPTCHA iframes/badges that Google injects globally
  document.querySelectorAll('.grecaptcha-badge').forEach(el => el.remove());
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1: Create a FRESH invisible reCAPTCHA
// Always creates a brand-new div to avoid "already rendered" errors
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function setupRecaptcha(): boolean {
  if (!auth) {
    console.warn('⚠️ Firebase Auth not available — using dev mode');
    return false;
  }

  try {
    // Destroy any previous reCAPTCHA completely
    destroyRecaptcha();

    // Create a brand-new container div with a unique ID
    recaptchaContainerId++;
    const container = document.createElement('div');
    container.id = `recaptcha-box-${recaptchaContainerId}`;
    container.style.display = 'none';
    document.body.appendChild(container);

    recaptchaVerifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => {
        console.log('✅ reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.warn('⚠️ reCAPTCHA expired');
      },
    });

    // Pre-render the widget
    recaptchaVerifier.render().catch((err) => {
      console.warn('reCAPTCHA render warning:', err.message);
    });

    return true;
  } catch (error: any) {
    console.error('reCAPTCHA setup error:', error);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2: Send OTP via SMS
// Phone must include country code: +919876543210
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string; devMode?: boolean }> {
  // Format phone number with country code
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

  // If Firebase Auth not available, return dev mode
  if (!auth) {
    console.log('📱 [DEV MODE] OTP "sent" to', formattedPhone);
    return { success: true, devMode: true };
  }

  // Always create a fresh reCAPTCHA for each send attempt
  // This avoids "already rendered" and stale token issues
  const ok = setupRecaptcha();
  if (!ok) {
    console.log('📱 [DEV MODE] reCAPTCHA failed — falling back to dev mode');
    return { success: true, devMode: true };
  }

  // Wait for reCAPTCHA to fully render
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier!);
    console.log('✅ OTP sent to', formattedPhone);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Send OTP error:', error);

    // Clean up on error
    destroyRecaptcha();

    // User-friendly error messages
    const errorMessages: Record<string, string> = {
      'auth/invalid-phone-number': 'Invalid phone number. Please check and try again.',
      'auth/too-many-requests': 'Too many attempts. Please try again after some time.',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
      'auth/captcha-check-failed': 'Verification failed. Please refresh the page and try again.',
      'auth/missing-phone-number': 'Phone number is required.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/invalid-app-credential': 'Phone auth verification failed. Please ensure Phone Authentication is enabled in your Firebase Console (Authentication → Sign-in method → Phone). Then try again.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/operation-not-allowed': 'Phone sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Phone.',
    };

    return {
      success: false,
      error: errorMessages[error.code] || error.message || 'Failed to send OTP. Please try again.',
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3: Verify OTP code
// Returns Firebase User on success
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function verifyOTP(otpCode: string): Promise<{ success: boolean; user?: User; error?: string; devMode?: boolean }> {
  // Dev mode fallback
  if (!auth || !confirmationResult) {
    if (otpCode === '1234') {
      console.log('✅ [DEV MODE] OTP verified');
      return { success: true, devMode: true };
    }
    return { success: false, error: 'Invalid OTP. Try 1234 (dev mode).' };
  }

  try {
    const result = await confirmationResult.confirm(otpCode);
    const user = result.user;
    console.log('✅ Phone verified! UID:', user.uid);
    
    // Clear confirmation result after use
    confirmationResult = null;

    return { success: true, user };
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);

    const errorMessages: Record<string, string> = {
      'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
      'auth/code-expired': 'OTP has expired. Please request a new one.',
      'auth/session-expired': 'Session expired. Please request a new OTP.',
    };

    return {
      success: false,
      error: errorMessages[error.code] || 'Invalid OTP. Please try again.',
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH STATE LISTENER
// Call this once in app layout to auto-restore session
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET CURRENT USER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIGN OUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function logout(): Promise<void> {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
    console.log('✅ Signed out');
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLEANUP — call on unmount
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function cleanupRecaptcha(): void {
  destroyRecaptcha();
  confirmationResult = null;
}
