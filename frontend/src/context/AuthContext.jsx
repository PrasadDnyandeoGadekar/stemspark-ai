import { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../utils/firebase';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

const AuthContext = createContext();

const verificationSettings = () => ({
  url: `${window.location.origin}/login`,
});

const createAuthError = (code, message) => Object.assign(new Error(message), { code });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const createAccount = async (displayName, email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
      }
      await sendEmailVerification(credential.user, verificationSettings());
    } finally {
      await signOut(auth);
    }
  };

  const loginWithEmail = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (credential.user.emailVerified) return credential;

    try {
      await sendEmailVerification(credential.user, verificationSettings());
    } finally {
      await signOut(auth);
    }

    throw createAuthError(
      'auth/email-not-verified',
      'Your email is not verified yet. We sent a verification link; check your inbox and spam folder.',
    );
  };

  const resendVerificationEmail = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (credential.user.emailVerified) return;

    try {
      await sendEmailVerification(credential.user, verificationSettings());
    } finally {
      await signOut(auth);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const hasUnverifiedPasswordAccount = currentUser?.providerData.some(
        ({ providerId }) => providerId === 'password',
      ) && !currentUser.emailVerified;
      setUser(hasUnverifiedPasswordAccount ? null : currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loginWithGoogle,
      createAccount,
      loginWithEmail,
      resendVerificationEmail,
      logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// The context hook stays beside its provider so existing imports remain stable.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);