"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apolloClient } from "@/lib/apollo-client";
import { ME_QUERY } from "@/graphql/queries/me";
import { useAuthStore } from "@/store/useAuthStore";

export function DashboardHydrator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    (async () => {
      try {
        const { data } = await apolloClient.query<{ me: any }>({ query: ME_QUERY, fetchPolicy: "no-cache" });
        if (data?.me) {
          setUser(data.me);
        } else {
          logout();
          router.replace("/sign-in");
        }
      } catch (e) {
        logout();
        router.replace("/sign-in");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return <>{children}</>;
}
