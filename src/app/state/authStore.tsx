import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, mapProfile, type Profile, supabase } from '../lib/supabase';

interface AuthResult {
  ok: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthStoreValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: string;
  isRemoteAuth: boolean;
  signUp: (input: { fullName: string; email: string; password: string }) => Promise<AuthResult>;
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const LOCAL_AUTH_KEY = 'odatly.local.auth.v1';

const AuthContext = createContext<AuthStoreValue | null>(null);

function createLocalUser(email: string, fullName = ''): User {
  return {
    id: 'local-user',
    app_metadata: {},
    user_metadata: { full_name: fullName },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
  } as User;
}

function readLocalAuth() {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(LOCAL_AUTH_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { email: string; fullName: string };
    if (!parsed.email) return null;
    return {
      user: createLocalUser(parsed.email, parsed.fullName),
      profile: {
        id: 'local-user',
        email: parsed.email,
        fullName: parsed.fullName,
      },
    };
  } catch {
    return null;
  }
}

async function fetchProfile(user: User): Promise<Profile> {
  if (!supabase) {
    return {
      id: user.id,
      email: user.email ?? '',
      fullName: String(user.user_metadata?.full_name ?? ''),
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (data) return mapProfile(data);

  const fallback = {
    id: user.id,
    full_name: String(user.user_metadata?.full_name ?? ''),
    email: user.email ?? '',
  };

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert(fallback)
    .select('id, full_name, email')
    .single();

  if (insertError) throw insertError;
  return mapProfile(inserted);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      setAuthError('');

      try {
        if (!supabase) {
          const localAuth = readLocalAuth();
          if (mounted && localAuth) {
            setUser(localAuth.user);
            setProfile(localAuth.profile);
          }
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const currentUser = data.session?.user ?? null;
        if (mounted) setUser(currentUser);
        if (currentUser) {
          const currentProfile = await fetchProfile(currentUser);
          if (mounted) setProfile(currentProfile);
        }
      } catch (error) {
        if (mounted) setAuthError(error instanceof Error ? error.message : 'Auth holatini yuklab bo‘lmadi.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setProfile(null);

      if (currentUser) {
        try {
          setProfile(await fetchProfile(currentUser));
        } catch (error) {
          setAuthError(error instanceof Error ? error.message : 'Profilni yuklab bo‘lmadi.');
        }
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthStoreValue>(() => ({
    user,
    profile,
    loading,
    authError,
    isRemoteAuth: isSupabaseConfigured,
    async signUp(input) {
      setLoading(true);
      setAuthError('');

      try {
        if (!supabase) {
          const localUser = createLocalUser(input.email, input.fullName);
          const localProfile = { id: localUser.id, email: input.email, fullName: input.fullName };
          window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localProfile));
          setUser(localUser);
          setProfile(localProfile);
          return { ok: true };
        }

        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              full_name: input.fullName,
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          return {
            ok: true,
            needsEmailConfirmation: true,
            message: 'Email tasdiqlash yoqilgan. Pochtangizni tasdiqlab, keyin login qiling.',
          };
        }

        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ro‘yxatdan o‘tib bo‘lmadi.';
        setAuthError(message);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    async signIn(input) {
      setLoading(true);
      setAuthError('');

      try {
        if (!supabase) {
          const localUser = createLocalUser(input.email, input.email.split('@')[0]);
          const localProfile = { id: localUser.id, email: input.email, fullName: input.email.split('@')[0] };
          window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localProfile));
          setUser(localUser);
          setProfile(localProfile);
          return { ok: true };
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) throw error;
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Email yoki parol noto‘g‘ri.';
        setAuthError(message);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    async signOut() {
      setLoading(true);
      setAuthError('');

      try {
        if (supabase) {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        } else {
          window.localStorage.removeItem(LOCAL_AUTH_KEY);
        }
        setUser(null);
        setProfile(null);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Logout qilib bo‘lmadi.');
      } finally {
        setLoading(false);
      }
    },
    clearAuthError() {
      setAuthError('');
    },
  }), [authError, loading, profile, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
