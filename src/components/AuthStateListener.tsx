'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { onAuthChange, isFirebaseAuthAvailable } from '@/lib/phoneAuth';
import { getUserProfile } from '@/lib/firebaseService';

/**
 * AuthStateListener — Sits in layout, listens for Firebase Auth changes.
 * 
 * When Firebase Auth is configured:
 * - On page refresh, Firebase auto-restores the session
 * - This component detects the restored user and syncs Zustand store
 * - On sign-out, clears the Zustand store
 * 
 * When Firebase Auth is NOT configured (dev mode):
 * - Does nothing — Zustand's persist middleware handles session
 */
export default function AuthStateListener() {
  const { user, setUser, logout: clearUser } = useStore();

  useEffect(() => {
    if (!isFirebaseAuthAvailable()) {
      // Dev mode — Zustand persist handles everything
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User signed in (or session restored)
        // Only update if Zustand doesn't already have this user
        if (!user || user.uid !== firebaseUser.uid) {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              uid: firebaseUser.uid,
              displayName: profile.name || 'User',
              phone: firebaseUser.phoneNumber?.replace('+91', '') || profile.phone || '',
              email: profile.email || '',
              photoURL: profile.photoURL || '',
              role: 'customer',
            });
          }
        }
      } else {
        // User signed out
        if (user) {
          clearUser();
        }
      }
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // Invisible component
}
