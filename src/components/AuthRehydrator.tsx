'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';

/**
 * AuthRehydrator
 * 
 * Runs on every dashboard mount. If the Redux auth state is empty (e.g. after
 * a page refresh or navigation to a 404), it fetches /api/users/me which reads
 * the httpOnly cookie server-side and returns the real user object.
 * 
 * This ensures the correct role is always restored from the server-authoritative
 * JWT rather than falling back to 'VIEWER'.
 * 
 * If the API returns 401 (no valid cookie / expired), the user is logged out
 * and redirected to /login.
 */
export default function AuthRehydrator() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Only rehydrate if the store is empty (page refresh / direct navigation)
    if (user) return;

    const rehydrate = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });

        if (!res.ok) {
          // No valid session — send to login
          dispatch(logout());
          router.push('/login');
          return;
        }

        const userData = await res.json();

        dispatch(setCredentials({
          user: {
            id:    userData.id,
            email: userData.email,
            name:  userData.name,
            role:  userData.role,
          },
          // Token is in httpOnly cookie — we pass empty string as placeholder
          // since the cookie is handled server-side automatically
          token: 'cookie-session',
        }));
      } catch (err) {
        console.error('Auth rehydration failed:', err);
        dispatch(logout());
        router.push('/login');
      }
    };

    rehydrate();
  }, [user, dispatch, router]);

  return null;
}
