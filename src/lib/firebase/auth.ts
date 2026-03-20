import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential | void> {
  // Use redirect flow on mobile devices (popups are often blocked)
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    await signInWithRedirect(auth, googleProvider);
    return;
  }

  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    const code = err?.code || '';
    // Fallback to redirect for environments where popups are blocked or unsupported
    if (
      code === 'auth/operation-not-supported-in-this-environment' ||
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
}

export async function logOut(): Promise<void> {
  return signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}
