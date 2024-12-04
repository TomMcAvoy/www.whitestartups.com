"use client";
import React, { useEffect, useState } from "react";
import { getSession } from "@/middleware/redis-store";
import Login from "@/components/Login";
import { SessionData } from "@/types/session-types"; // Import SessionData

const Page = () => {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_id="))
        ?.split("=")[1];
      if (sessionId) {
        const sessionData = await getSession(sessionId);
        setSession(sessionData);
      }
    };

    fetchSession();
  }, []);

  return <Login session={session} />;
};

export default Page;
