/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * FIREBASE PHONE AUTHENTICATION — Real OTP via SMS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Supports BOTH:
 *  - reCAPTCHA Enterprise (automatic via initializeRecaptchaConfig)
 *  - Legacy reCAPTCHA v2 (RecaptchaVerifier fallback)
 *
 * Flow:
 * 1. initRecaptchaEnterprise() — called once on app load
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
// Dynamic import for initializeRecaptchaConfig (Firebase v10.7+)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let recaptchaEnterpriseInitialized = false;

async function initRecaptchaEnterprise(): Promise<boolean> {
  if (!auth || recaptchaEnterpriseInitialized) return recaptchaEnterpriseInitialized;

  try {
    // initializeRecaptchaConfig tells Firebase to use reCAPTCHA Enterprise
    // automatically for Phone Auth — no manual RecaptchaVerifier needed!
    const { initializeRecaptchaConfig } = await import('firebase/auth');
    await initializeRecaptchaConfig(auth);
    recaptchaEnterpriseInitialized = true;
    console.log('✅ reCAPTCHA Enterprise initialized');
    return true;
  } catch (error: any) {
    console.warn('⚠️ reCAPTCHA Enterprise init failed:', error.message);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let recaptchaContainerId = 0;

// Check if real Firebase Auth is available
export function isFirebaseAuthAvailable(): boolean {
  return !!auth;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERNAL: Destroy old reCAPTCHA widget completely
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function destroyRecaptcha(): void {
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch {}
    recaptchaVerifier = null;
  }
  document.querySelectorAll('[id^="recaptcha-box-"]').forEach(el => el.remove());
  document.querySelectorAll('.grecaptcha-badge').forEach(el => el.remove());
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Create a fresh invisible reCAPTCHA v2 verifier (fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function setupRecaptcha(): boolean {
  if (!auth) return false;

  try {
    destroyRecaptcha();

    recaptchaContainerId++;
    const container = document.createElement('div');
    container.id = `recaptcha-box-${recaptchaContainerId}`;
    container.style.display = 'none';
    document.body.appendChild(container);

    recaptchaVerifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => console.log('✅ reCAPTCHA v2 solved'),
      'expired-callback': () => console.warn('⚠️ reCAPTCHA expired'),
    });

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
// SEND OTP via SMS
// Strategy:
// 1. Try reCAPTCHA Enterprise (automatic, no widget needed)
// 2. Fallback to RecaptchaVerifier v2
// 3. Fallback to dev mode
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string; devMode?: boolean }> {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

  if (!auth) {
    console.log('📱 [DEV MODE] OTP "sent" to', formattedPhone);
    return { success: true, devMode: true };
  }

  // ─── Strategy 1: reCAPTCHA Enterprise (no widget needed) ───
  // Initialize reCAPTCHA Enterprise config first
  const enterpriseReady = await initRecaptchaEnterprise();

  if (enterpriseReady) {
    try {
      // With reCAPTCHA Enterprise initialized, we can call signInWithPhoneNumber
      // with a RecaptchaVerifier — Firebase handles Enterprise verification automatically
      // Create a fresh verifier for Enterprise mode too
      setupRecaptcha();
      await new Promise(resolve => setTimeout(resolve, 500));

      confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier!);
      console.log('✅ OTP sent via reCAPTCHA Enterprise to', formattedPhone);
      return { success: true };
    } catch (error: any) {
      console.warn('⚠️ Enterprise send failed:', error.code, error.message);
      destroyRecaptcha();

      // If it's a real auth error (not reCAPTCHA), return it
      if (error.code === 'auth/invalid-phone-number' ||
          error.code === 'auth/too-many-requests' ||
          error.code === 'auth/quota-exceeded' ||
          error.code === 'auth/user-disabled') {
        return { success: false, error: getErrorMessage(error.code) };
      }
      // Otherwise fall through to Strategy 2
    }
  }

  // ─── Strategy 2: Legacy RecaptchaVerifier v2 ───
  try {
    setupRecaptcha();
    await new Promise(resolve => setTimeout(resolve, 800));

    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier!);
    console.log('✅ OTP sent via reCAPTCHA v2 to', formattedPhone);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Send OTP error:', error.code, error.message);
    destroyRecaptcha();

    return {
      success: false,
      error: getErrorMessage(error.code) || error.message || 'Failed to send OTP. Please try again.',
    };
  }
}

function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-phone-number': 'Invalid phone number. Please check and try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again after some time.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/captcha-check-failed': 'Verification failed. Please refresh and try again.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/invalid-app-credential': 'Phone verification failed. Add localhost to reCAPTCHA Enterprise allowed domains in Firebase Console → Authentication → Settings → reCAPTCHA → Manage reCAPTCHA.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/operation-not-allowed': 'Phone sign-in is not enabled. Enable it in Firebase Console.',
  };
  return errorMessages[code] || '';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERIFY OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function verifyOTP(otpCode: string): Promise<{ success: boolean; user?: User; error?: string; devMode?: boolean }> {
  if (!auth || !confirmationResult) {
    if (otpCode === '1234') {
      console.log('✅ [DEV MODE] OTP verified');
      return { success: true, devMode: true };
    }
    return { success: false, error: 'Invalid OTP. Try 1234 (dev mode).' };
  }

  try {
    const result = await confirmationResult.confirm(otpCode);
    console.log('✅ Phone verified! UID:', result.user.uid);
    confirmationResult = null;
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);
    const msgs: Record<string, string> = {
      'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
      'auth/code-expired': 'OTP has expired. Please request a new one.',
      'auth/session-expired': 'Session expired. Please request a new OTP.',
    };
    return { success: false, error: msgs[error.code] || 'Invalid OTP. Please try again.' };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH STATE LISTENER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) return () => {};
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
// CLEANUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function cleanupRecaptcha(): void {
  destroyRecaptcha();
  confirmationResult = null;
}
