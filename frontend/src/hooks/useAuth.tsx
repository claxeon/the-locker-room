/**
 * useAuth — Authentication hook and context for The Locker Room
 *
 * Provides:
 *   - AuthContext / AuthProvider  — wrap the app to share auth state globally
 *   - useAuth()                   — consume auth state anywhere in the tree
 *
 * Returned shape:
 *   {
 *     user: User | null,
 *     session: Session | null,
 *     profile: UserProfile | null,
 *     loading: boolean,
 *   }
 *
 * The `profile` value is fetched from the `profiles` table in Supabase once a
 * session is established.  It exposes verification_status, is_admin, school_id,
 * and sport — the fields that gate access to review submission.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  full_name: string | null;
  school_id: string | null;
  sport: string | null;
  gender: string | null;
  graduation_year: number | null;
  verification_status: VerificationStatus;
  is_admin: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  profile: null,
  loading: true,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the row from the `profiles` table for the given user id.
   * If no row exists yet (e.g. the DB trigger hasn't run) we return null
   * silently and let the UI handle the absence gracefully.
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, school_id, sport, gender, graduation_year, verification_status, is_admin, avatar_url, created_at"
      )
      .eq("id", userId)
      .single();

    if (error) {
      // Row might not exist yet — not a hard error at this stage.
      console.warn("[useAuth] Could not fetch profile:", error.message);
      setProfile(null);
    } else {
      setProfile(data as UserProfile);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // ── 1. Hydrate from existing session (avoids flash of unauthenticated state)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return;

      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        // Fire profile fetch, but don't block the loading flag on it.
        fetchProfile(existingSession.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // ── 2. Subscribe to future auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        // Logged out — clear profile.
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuth — returns the current authentication state from AuthContext.
 *
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export { AuthContext };
