import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileDetails: (details: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateProfileDetails: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem('user_token', currentUser.uid);
        localStorage.setItem('user_name', currentUser.displayName || '');
        
        // Fetch or create user doc
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            const newUserData: UserData = {
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: '',
              address: ''
            };
            await setDoc(userDocRef, {
              ...newUserData,
              createdAt: serverTimestamp()
            });
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          const errInfo = {
            error: error instanceof Error ? error.message : String(error),
            operationType: 'get',
            path: `users/${currentUser.uid}`,
            authInfo: {
              userId: currentUser.uid,
              email: currentUser.email,
              emailVerified: currentUser.emailVerified,
              isAnonymous: currentUser.isAnonymous,
            }
          };
          console.error('Firestore Error: ', JSON.stringify(errInfo));
          throw new Error(JSON.stringify(errInfo));
        }
      } else {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_name');
        setUserData(null);
      }
      setLoading(false);
      window.dispatchEvent(new Event('userLogin'));
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await logoutUser();
  };

  const updateProfileDetails = async (details: Partial<UserData>) => {
    if (user) {
      if (details.name) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(user, { displayName: details.name });
        setUser({ ...user } as User);
        localStorage.setItem('user_name', details.name);
        window.dispatchEvent(new Event('userLogin'));
      }
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          ...details,
          updatedAt: serverTimestamp()
        });
        setUserData(prev => prev ? { ...prev, ...details } : null);
      } catch (error) {
        console.error("Error updating user data in Firestore:", error);
        const errInfo = {
          error: error instanceof Error ? error.message : String(error),
          operationType: 'update',
          path: `users/${user.uid}`,
          authInfo: {
            userId: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
          }
        };
        console.error('Firestore Error: ', JSON.stringify(errInfo));
        throw new Error(JSON.stringify(errInfo));
      }
    } else {
      // Local fallback
      if (details.name) {
         localStorage.setItem('user_name', details.name);
         window.dispatchEvent(new Event('userLogin'));
      }
      if (details.phone) localStorage.setItem('user_phone', details.phone);
      if (details.address) localStorage.setItem('user_address', details.address);
      setUserData(prev => prev ? { ...prev, ...details } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout, updateProfileDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

