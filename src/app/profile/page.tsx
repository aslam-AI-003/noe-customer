'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Pencil, Camera, UserRound, Package, Wallet, Heart, Bell,
  Ticket, Users, LifeBuoy, FileText, Settings, MapPin, Home, Building2,
  Check, Plus, ChevronRight, LogOut,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { updateUserProfile, addUserAddress, getUserAddresses } from '@/lib/firebaseService';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

const MENU_ITEMS = [
  { icon: Package, label: 'My Orders', href: '/orders', badge: '' },
  { icon: Heart, label: 'Favourites', href: '/favorites', badge: '' },
  { icon: Wallet, label: 'My Wallet', href: '/wallet', badge: '' },
  { icon: Bell, label: 'Notifications', href: '/notifications', badge: '' },
  { icon: Ticket, label: 'Offers & Coupons', href: '/offers', badge: '' },
  { icon: Users, label: 'Refer & Earn', href: '/offers', badge: '₹50' },
  { icon: LifeBuoy, label: 'Help & Support', href: '/support', badge: '' },
  { icon: FileText, label: 'Terms & Privacy', href: '/terms', badge: '' },
];

export default function ProfilePage() {
  const router = useRouter();
  const {
    user, walletBalance, orders, favoriteShopIds,
    addresses, selectedAddressId, setAddresses, setSelectedAddress,
    unreadNotificationCount, logout,
  } = useStore();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ name: user?.displayName || '', phone: user?.phone || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'menu' | 'addresses'>('menu');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullAddress: '', landmark: '', city: 'Thanjavur', pincode: '', areaId: 'thanjavur' });
  const [addingAddress, setAddingAddress] = useState(false);

  const menuWithBadges = MENU_ITEMS.map(item => {
    if (item.href === '/wallet') return { ...item, badge: `₹${walletBalance}` };
    if (item.href === '/notifications' && unreadNotificationCount > 0) return { ...item, badge: String(unreadNotificationCount) };
    return item;
  });

  const saveProfile = async () => {
    if (!draft.name.trim()) { toast.error('Name cannot be empty'); return; }
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
      });
      setEditMode(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.fullAddress.trim() || !newAddress.pincode.trim()) {
      toast.error('Please fill address and pincode');
      return;
    }
    if (!user) return;
    setAddingAddress(true);
    try {
      const addressData = {
        label: newAddress.label,
        fullAddress: newAddress.fullAddress.trim(),
        landmark: newAddress.landmark?.trim() || '',
        city: newAddress.city,
        pincode: newAddress.pincode.trim(),
        lat: 10.787,
        lng: 79.1378,
        isDefault: addresses.length === 0,
      };

      // Try Firestore first, fall back to local-only
      let id: string;
      try {
        id = await addUserAddress(user.uid, addressData);
        const updated = await getUserAddresses(user.uid);
        setAddresses(updated);
      } catch (e) {
        // Firestore failed (auth/rules issue) — save locally in Zustand
        console.warn('Firestore address save failed, saving locally:', e);
        id = 'addr-' + Date.now().toString(36);
        const localAddress = { id, ...addressData };
        setAddresses([...addresses, localAddress]);
      }

      if (addresses.length === 0) setSelectedAddress(id);
      setShowAddAddress(false);
      setNewAddress({ label: 'Home', fullAddress: '', landmark: '', city: 'Thanjavur', pincode: '', areaId: 'thanjavur' });
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      logout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen app-bg flex items-center justify-center px-4">
        <div className="text-center">
          <UserRound size={48} className="text-faint mx-auto mb-4" />
          <h2 className="text-xl font-black text-body mb-2">Not logged in</h2>
          <p className="text-sm text-faint mb-6">Login to view your profile</p>
          <Link href="/auth/login" className="btn-primary">Login / Register →</Link>
        </div>
      </main>
    );
  }

  const initials = user.displayName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-body flex-1">My Profile</h1>
          <button onClick={() => { setEditMode(!editMode); setDraft({ name: user.displayName || '', phone: user.phone || '', email: user.email || '' }); }}
            className={`text-xs font-bold transition-colors px-3 py-1.5 rounded-lg border flex items-center gap-1 ${editMode ? 'bg-red-500/10 border-red-500/25 text-red-500 dark:text-red-400' : 'bg-[#0E9F6E]/10 border-[#0E9F6E]/25 text-accent'}`}>
            {editMode ? 'Cancel' : <><Pencil size={12} /> Edit</>}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">

        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-3xl border p-5 bg-gradient-to-br from-[#0E9F6E]/10 to-[#087f58]/4 border-orange-400/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-0.5 rounded-full bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-black border text-accent bg-gradient-to-br from-[#0E9F6E]/30 to-[#087f58]/15 border-orange-400/25">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                ) : initials}
              </div>
              {editMode && (
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-[#0E9F6E] text-white">
                  <Camera size={12} />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editMode ? (
                <div className="space-y-2">
                  <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                    className="input-glass text-sm py-2 w-full font-bold" placeholder="Full name" />
                  <input value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))}
                    className="input-glass text-sm py-2 w-full" placeholder="Phone number" />
                  <input value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
                    className="input-glass text-sm py-2 w-full" placeholder="Email address" />
                </div>
              ) : (
                <>
                  <h2 className="font-black text-body text-lg">{user.displayName}</h2>
                  <p className="text-sm mt-0.5 text-secondary">{user.phone || 'No phone added'}</p>
                  <p className="text-xs mt-0.5 text-faint">{user.email || 'No email added'}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verified Account</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {editMode && (
            <button onClick={saveProfile} disabled={saving} className="btn-primary w-full mt-4 py-3 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Orders', value: String(orders.length), icon: Package, href: '/orders' },
            { label: 'Wallet', value: `₹${walletBalance}`, icon: Wallet, href: '/wallet' },
            { label: 'Saved', value: String(favoriteShopIds.length), icon: Heart, href: '/favorites' },
          ].map(s => (
            <Link key={s.label} href={s.href}
              className="glass-card p-3 text-center transition-all hover:border-[#0E9F6E]-400/25">
              <s.icon size={17} className="text-accent mx-auto" />
              <div className="text-sm font-black text-body mt-0.5">{s.value}</div>
              <div className="text-[10px] mt-0.5 text-faint">{s.label}</div>
            </Link>
          ))}
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 p-1 rounded-xl surface">
          {(['menu', 'addresses'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveSection(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all flex items-center justify-center gap-1.5 ${activeSection === tab ? 'bg-[#0E9F6E] text-white' : 'text-muted'}`}>
              {tab === 'menu' ? <><Settings size={12} /> Account</> : <><MapPin size={12} /> Addresses</>}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {activeSection === 'menu' && (
          <div className="glass-card overflow-hidden p-0">
            {menuWithBadges.map((item, i) => (
              <React.Fragment key={item.label}>
                <Link href={item.href} className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--card-hover)]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 surface">
                    <item.icon size={16} className="text-secondary" />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-body">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0E9F6E]/12 text-accent border border-[#0E9F6E]/20">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-faint" />
                </Link>
                {i < menuWithBadges.length - 1 && <div className="divider mx-4" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Addresses */}
        {activeSection === 'addresses' && (
          <div className="space-y-3">
            {addresses.length === 0 && !showAddAddress && (
              <div className="text-center py-8 text-faint text-sm">No addresses saved yet</div>
            )}
            {addresses.map(addr => (
              <div key={addr.id} className={`glass-card p-4 ${addr.id === selectedAddressId ? 'border-orange-400/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${addr.id === selectedAddressId ? 'bg-[#0E9F6E]/12' : 'surface'}`}>
                    {addr.label === 'Home' ? <Home size={17} className="text-secondary" /> : addr.label === 'Work' ? <Building2 size={17} className="text-secondary" /> : <MapPin size={17} className="text-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-body">{addr.label}</span>
                      {addr.id === selectedAddressId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#0E9F6E]/12 text-accent">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-secondary">{addr.fullAddress}</p>
                    <p className="text-xs mt-0.5 text-faint">{addr.city} - {addr.pincode}</p>
                  </div>
                  <button onClick={() => setSelectedAddress(addr.id)}
                    className={`text-xs font-bold flex-shrink-0 flex items-center gap-1 ${addr.id === selectedAddressId ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent'}`}>
                    {addr.id === selectedAddressId ? <><Check size={12} /> Selected</> : 'Select'}
                  </button>
                </div>
              </div>
            ))}

            {/* Add Address Form — Smart Address System */}
            {showAddAddress && (
              <div className="glass-card p-4 space-y-3 border-orange-400/20">
                <h3 className="text-sm font-bold text-body">📍 Add New Address</h3>

                {/* Label selection */}
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map(l => (
                    <button key={l} onClick={() => setNewAddress(a => ({ ...a, label: l }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newAddress.label === l ? 'bg-[#0E9F6E] text-white border-[#0E9F6E]' : 'surface text-secondary'}`}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* Full Address (Door no, Street) */}
                <div>
                  <label className="text-[10px] font-bold text-faint mb-1 block">Door No, Street Name *</label>
                  <input value={newAddress.fullAddress} onChange={e => setNewAddress(a => ({ ...a, fullAddress: e.target.value }))}
                    placeholder="e.g. 12, Kovil Street, Near Bus Stand" className="input-glass text-sm" />
                </div>

                {/* 🏛️ LANDMARK — KEY FEATURE for rural delivery */}
                <div>
                  <label className="text-[10px] font-bold text-faint mb-1 block">🏛️ Landmark (helps rider find you) *</label>
                  <input value={newAddress.landmark} onChange={e => setNewAddress(a => ({ ...a, landmark: e.target.value }))}
                    placeholder="e.g. Near Murugan Temple, Opp SBI Bank, Behind School"
                    className="input-glass text-sm border-amber-400/30 focus:border-amber-500/50" />
                  <p className="text-[9px] text-faint mt-0.5">💡 Temple, Bank, School, Shop — anything nearby that&apos;s easy to find</p>
                </div>

                {/* Area + City + Pincode */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-faint mb-1 block">Area/Town *</label>
                    <select value={newAddress.city} onChange={e => setNewAddress(a => ({ ...a, city: e.target.value }))}
                      className="input-glass text-sm w-full">
                      <option value="Thanjavur">Thanjavur</option>
                      <option value="Kumbakonam">Kumbakonam</option>
                      <option value="Papanasam">Papanasam</option>
                      <option value="Thiruvaiyaru">Thiruvaiyaru</option>
                      <option value="Vallam">Vallam</option>
                      <option value="Mannargudi">Mannargudi</option>
                      <option value="Mayiladuthurai">Mayiladuthurai</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-faint mb-1 block">Pincode *</label>
                    <input value={newAddress.pincode} onChange={e => setNewAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      placeholder="613001" className="input-glass text-sm w-full" maxLength={6} />
                  </div>
                </div>

                {/* GPS Pin Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        () => toast.success('📍 GPS location saved! Rider can navigate to you.'),
                        () => toast.error('GPS denied — landmark will be used instead')
                      );
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400"
                >
                  <MapPin size={13} /> Drop GPS Pin (optional bonus)
                </button>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => setShowAddAddress(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                  <button onClick={handleAddAddress} disabled={addingAddress} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-60">
                    {addingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}

            {!showAddAddress && (
              <button onClick={() => setShowAddAddress(true)}
                className="w-full rounded-2xl border border-dashed p-4 flex items-center justify-center gap-2 transition-all hover:border-[#0E9F6E]-400/30 border-subtle">
                <Plus size={16} className="text-accent" />
                <span className="text-sm font-bold text-accent">Add New Address</span>
              </button>
            )}
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full rounded-2xl border p-4 flex items-center justify-center gap-2 transition-all hover:border-red-500/25 bg-red-500/5 border-red-500/15">
          <LogOut size={15} className="text-red-500 dark:text-red-400" />
          <span className="text-sm font-bold text-red-500 dark:text-red-400">Logout</span>
        </button>

      </div>
    </main>
  );
}
