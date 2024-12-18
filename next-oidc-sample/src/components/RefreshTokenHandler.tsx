import { useEffect } from "react";
import { SessionStore } from "@/lib/redis/store";
import { refreshTokens } from "@/lib/oidc-utils";
import { useRouter } from "next/router";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function RefreshTokenHandler() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const sessionId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sessionId="))
        ?.split("=")[1];

      if (sessionId) {
        const session = await SessionStore.getSession(sessionId);
        const now = new Date();

        if (session && session.tokens.refresh_token) {
          if (now > new Date(session.accessTokenExpiresAt)) {
            try {
              const tokens = await refreshTokens(session.tokens.refresh_token);
              await SessionStore.updateSession(sessionId, { tokens });
            } catch (error) {
              console.error("Failed to refresh tokens:", error);
              router.push("/auth/login");
            }
          }
        }
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
