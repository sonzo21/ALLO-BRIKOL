import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (user: User, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOOTSTRAP_ADMIN_EMAIL = "elmahdilaaboudi@gmail.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || user?.email === BOOTSTRAP_ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (user: User, role?: UserRole) => {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    // Auto-assign admin role for bootstrap email
    const finalRole = user.email === BOOTSTRAP_ADMIN_EMAIL ? 'admin' : role;

    if (!docSnap.exists() && finalRole) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: finalRole as UserRole,
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    } else if (docSnap.exists()) {
      setProfile(docSnap.data() as UserProfile);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
