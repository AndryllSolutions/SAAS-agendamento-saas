import { useCallback, useEffect, useMemo, useState } from "react";

// Mock auth hook for landing page - simplified version
// This avoids dependencies on project-specific modules

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

type User = {
  id: string;
  email: string;
  name?: string;
} | null;

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/auth/login" } =
    options ?? {};

  // Mock user state - landing page doesn't need real auth
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isAuthenticated = Boolean(user);

  const logout = useCallback(async () => {
    setUser(null);
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    // No-op for landing page
    return Promise.resolve();
  }, []);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  const state = useMemo(() => {
    return {
      user,
      loading,
      error,
      isAuthenticated,
    };
  }, [user, loading, error, isAuthenticated]);

  return {
    ...state,
    refresh,
    logout,
  };
}
