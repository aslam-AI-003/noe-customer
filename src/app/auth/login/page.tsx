'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getUserProfile, createUserProfile } from '@/lib/firebaseService';
import toast from 'react-hot-toast';
import { Phone, ArrowRight, Shield, Loader2, MapPin, ChevronLeft } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN PAGE — Phone OTP (Dev Mode: any phone, OTP = 1234)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEV_OTP = '1234'; // Fixed OTP for development

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = () => {
    if (phone.length !== 10) {
      toast.error('Enter valid 10-digit number');
      return;
    }
    setLoading(true);
    // Simulate OTP send (dev mode - instant)
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setCountdown(30);
      toast.success(`OTP sent to +91 ${phone}`);
      toast(`Dev OTP: ${DEV_OTP}`, { icon: '🔑', duration: 8000 });
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 800);
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (newOtp.every(d => d) && newOtp.join('').length === 4) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (otpCode: string) => {
    if (otpCode !== DEV_OTP) {
      toast.error('Invalid OTP. Try 1234');
      setOtp(['', '', '', '']);
      otpRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    try {
      // Check if user exists in Firestore
      const existingProfile = await getUserProfile(`phone-${phone}`);
      
      if (existingProfile) {
        // Existing user — login directly
        setUser({
          uid: `phone-${phone}`,
          displayName: existingProfile.name || 'User',
          phone: phone,
          email: existingProfile.email || '',
          photoURL: existingProfile.photoURL || '',
          role: 'customer',
        });
        toast.success(`Welcome back, ${existingProfile.name}! 🎉`);
        router.push('/');
      } else {
        // New user — ask for name
        setStep('name');
      }
    } catch (err) {
      // If Firestore fails, just login with phone as name
      setStep('name');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Enter your name');
      return;
    }
    setLoading(true);
    try {
      const uid = `phone-${phone}`;
      // Create profile in Firestore
      await createUserProfile(uid, {
        uid,
        name: name.trim(),
        phone,
        email: '',
        role: 'customer',
        walletBalance: 0,
        loyaltyPoints: 0,
      });

      setUser({
        uid,
        displayName: name.trim(),
        phone,
        email: '',
        photoURL: '',
        role: 'customer',
      });

      toast.success(`Welcome to NammaOoru, ${name}! 🎉`);
      router.push('/');
    } catch (err) {
      // Even if Firestore fails, login locally
      setUser({
        uid: `phone-${phone}`,
        displayName: name.trim(),
        phone,
        email: '',
        photoURL: '',
        role: 'customer',
      });
      toast.success(`Welcome, ${name}!`);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl" />
      </div>

      {/* Top Section — Brand */}
      <div className="flex-shrink-0 pt-12 pb-8 px-6 text-center relative z-10">
        {step !== 'phone' && (
          <button onClick={() => { setStep(step === 'name' ? 'otp' : 'phone'); setOtp(['','','','']); }}
            className="absolute left-4 top-4 btn-icon">
            <ChevronLeft size={20} />
          </button>
        )}
        
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-orange-500/30 rotate-3">
          <span className="text-3xl font-black text-white -rotate-3">NOE</span>
        </div>
        <h1 className="text-2xl font-black text-body">NammaOoru Express</h1>
        <p className="text-sm text-muted mt-1.5 flex items-center justify-center gap-1.5">
          <MapPin size={13} className="text-accent" />
          Thanjavur • Kumbakonam
        </p>
      </div>

      {/* Bottom Section — Card */}
      <div className="flex-1 flex items-start justify-center px-4 relative z-10">
        <div className="w-full max-w-sm">
          
          {/* ━━━ STEP 1: Phone Number ━━━ */}
          {step === 'phone' && (
            <div className="glass-strong rounded-3xl p-6 space-y-5 animate-scale-in">
              <div>
                <h2 className="text-lg font-black text-body">Login / Register</h2>
                <p className="text-xs text-faint mt-1">Enter your phone number to continue</p>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-3 surface rounded-xl text-sm font-bold text-body flex-shrink-0 border border-subtle">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="input-glass flex-1 text-lg font-bold tracking-wider"
                    maxLength={10}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                onClick={handleSendOtp}
                disabled={loading || phone.length < 10}
                className="btn-primary w-full py-4 text-base font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <>Get OTP <ArrowRight size={18} /></>
                )}
              </button>

              {/* Terms */}
              <p className="text-[10px] text-faint text-center leading-relaxed">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-accent">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-accent">Privacy Policy</Link>
              </p>
            </div>
          )}

          {/* ━━━ STEP 2: OTP Verification ━━━ */}
          {step === 'otp' && (
            <div className="glass-strong rounded-3xl p-6 space-y-5 animate-scale-in">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield size={24} className="text-emerald-500" />
                </div>
                <h2 className="text-lg font-black text-body">Verify OTP</h2>
                <p className="text-xs text-faint mt-1">
                  Sent to <span className="font-bold text-body">+91 {phone}</span>
                </p>
              </div>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-2xl font-black rounded-xl border-2 border-subtle bg-[var(--card-bg)] text-body focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    maxLength={1}
                  />
                ))}
              </div>

              {/* Dev hint */}
              <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl text-center">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  🔑 Dev Mode: Use OTP <span className="text-base tracking-wider">{DEV_OTP}</span>
                </p>
              </div>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-faint">Resend OTP in <span className="font-bold text-body">{countdown}s</span></p>
                ) : (
                  <button onClick={handleSendOtp} className="text-xs text-accent font-bold hover:opacity-80">
                    Resend OTP
                  </button>
                )}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted">
                  <Loader2 size={14} className="animate-spin" /> Verifying...
                </div>
              )}
            </div>
          )}

          {/* ━━━ STEP 3: Name (New User) ━━━ */}
          {step === 'name' && (
            <div className="glass-strong rounded-3xl p-6 space-y-5 animate-scale-in">
              <div className="text-center">
                <div className="text-4xl mb-3">👋</div>
                <h2 className="text-lg font-black text-body">Welcome!</h2>
                <p className="text-xs text-faint mt-1">You&apos;re new here. What should we call you?</p>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-glass text-lg font-bold"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
              </div>

              {/* Continue Button */}
              <button
                onClick={handleRegister}
                disabled={loading || !name.trim()}
                className="btn-primary w-full py-4 text-base font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating account...</>
                ) : (
                  <>Start Ordering <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          )}

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-3">
            <div className="flex items-center justify-center gap-4">
              <Link href="https://noe-vendor.vercel.app" target="_blank" className="text-[11px] text-faint hover:text-accent transition-colors font-medium">
                🏪 Partner with us
              </Link>
              <span className="text-faint/30">|</span>
              <Link href="https://noe-rider.vercel.app" target="_blank" className="text-[11px] text-faint hover:text-accent transition-colors font-medium">
                🛵 Become a rider
              </Link>
            </div>
            <p className="text-[10px] text-faint/50">v1.0 • Made in Thanjavur 🇮🇳</p>
          </div>
        </div>
      </div>
    </div>
  );
}
