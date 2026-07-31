'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, createUserProfile } from '@/lib/firebaseService';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import { Bike, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Store confirmation result for OTP verification
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    if (!auth) return toast.error('Firebase not initialized');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Fetch full profile from Firestore
      const profile = await getUserProfile(cred.user.uid);
      setUser({
        uid: cred.user.uid,
        displayName: profile?.name || cred.user.displayName || 'User',
        phone: profile?.phone || cred.user.phoneNumber || '',
        email: profile?.email || cred.user.email || '',
        photoURL: profile?.photoURL || cred.user.photoURL || '',
        role: profile?.role || 'customer',
      });
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : err.message?.replace('Firebase: ', '') || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) return toast.error('Enter valid 10-digit phone number');
    if (!auth) return toast.error('Firebase not initialized');
    setLoading(true);
    try {
      // Clear previous recaptcha if any
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
      recaptchaRef.current = recaptcha;
      const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, recaptcha);
      confirmationRef.current = confirmation;
      setOtpSent(true);
      toast.success('OTP sent to +91' + phone);
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-phone-number'
        ? 'Invalid phone number format'
        : err.code === 'auth/too-many-requests'
        ? 'Too many OTP requests. Try again later.'
        : 'Failed to send OTP. Try email login.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return toast.error('Enter 6-digit OTP');
    if (!confirmationRef.current) return toast.error('Please request OTP first');
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const firebaseUser = result.user;

      // Check if profile exists, create if new user
      let profile = await getUserProfile(firebaseUser.uid);
      if (!profile) {
        await createUserProfile(firebaseUser.uid, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          phone: phone,
          email: firebaseUser.email || '',
          role: 'customer',
          walletBalance: 0,
          loyaltyPoints: 0,
        });
        profile = await getUserProfile(firebaseUser.uid);
      }

      setUser({
        uid: firebaseUser.uid,
        displayName: profile?.name || 'User',
        phone: phone,
        email: profile?.email || '',
        photoURL: profile?.photoURL || '',
        role: profile?.role || 'customer',
      });
      toast.success('Welcome to NammaOoru!');
      router.push('/');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-verification-code'
        ? 'Wrong OTP. Please check and try again.'
        : err.code === 'auth/code-expired'
        ? 'OTP expired. Please request a new one.'
        : 'OTP verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4 py-8">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-400/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Bike size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-body">Welcome Back!</h1>
          <p className="text-sm text-faint mt-1">Sign in to continue ordering</p>
        </div>

        {/* Card */}
        <div className="glass-strong p-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 surface rounded-xl mb-6">
            {(['email', 'phone'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setOtpSent(false); setOtp(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-orange-500 text-white shadow-lg' : 'text-muted hover:text-secondary'
                }`}>
                {t === 'email' ? 'Email' : 'Phone'}
              </button>
            ))}
          </div>

          {tab === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint">
                    <Mail size={16} />
                  </span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input-glass pl-11" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint">
                    <Lock size={16} />
                  </span>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password" className="input-glass pl-11 pr-11" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-faint hover:text-secondary transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-xs text-accent hover:opacity-80 transition-opacity">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 surface rounded-xl text-sm text-secondary flex-shrink-0">
                    +91
                  </div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210" className="input-glass flex-1" maxLength={10}
                    disabled={otpSent} />
                </div>
              </div>

              {otpSent && (
                <div className="animate-slide-up">
                  <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Enter OTP</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit OTP" className="input-glass text-center text-xl tracking-widest" maxLength={6} autoFocus />
                  <button onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-xs text-accent mt-2 hover:opacity-80">
                    ← Change number
                  </button>
                </div>
              )}

              {/* Invisible recaptcha container */}
              <div id="recaptcha-container" />

              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={loading || phone.length < 10}
                  className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Sending OTP...
                    </span>
                  ) : 'Send OTP →'}
                </button>
              ) : (
                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                  className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </span>
                  ) : 'Verify OTP'}
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 divider" />
            <span className="text-xs text-faint font-medium">OR</span>
            <div className="flex-1 divider" />
          </div>

          {/* Demo login */}
          <button onClick={() => {
            setUser({ uid: 'demo-user', displayName: 'Demo User', phone: '9876543210', email: 'demo@noe.com', role: 'customer' });
            toast.success('Logged in as Demo User!');
            router.push('/');
          }} className="btn-secondary w-full py-3 text-sm">
            Continue as Demo User
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-muted mt-6">
          New to NammaOoru?{' '}
          <Link href="/auth/register" className="text-accent font-bold hover:opacity-80 transition-opacity">
            Create Account →
          </Link>
        </p>

        {/* Partner links */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Link href="/shop/register" className="text-xs text-faint hover:text-secondary transition-colors">Register Shop</Link>
          <span className="text-faint">•</span>
          <Link href="/rider/register" className="text-xs text-faint hover:text-secondary transition-colors">Become Rider</Link>
        </div>
      </div>
    </div>
  );
}
