import { SessionData } from "@/types/session-types";
import { useEffect, useState } from "react";

export default function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const sessionData = await res.json();
      setSession(sessionData.session);
      setLoading(false);
    }

    fetchSession();
  }, []);

  return { session, loading };
}
