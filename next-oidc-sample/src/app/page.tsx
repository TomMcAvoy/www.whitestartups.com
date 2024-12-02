"use client";

import { useEffect, useState } from "react";
import Login from "@/components/Login";
import { SessionData } from "@/types/session";
import { generateCodeVerifier } from "@/utils";

export default function Home() {
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    // Generate and store the code verifier if it doesn't exist
    let verifier = localStorage.getItem("pkce_code_verifier");
    if (!verifier) {
      verifier = generateCodeVerifier();
      localStorage.setItem("pkce_code_verifier", verifier);
    }
    setCodeVerifier(verifier);

    // Fetch session data client-side
    async function fetchSession() {
      const res = await fetch("/api/session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const sessionData = await res.json();
      setSession(sessionData);
    }

    fetchSession();
  }, []);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Welcome back
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Sign in to your account to continue.
        </p>
        <div>
          <pre>{JSON.stringify(session, null, 2)}</pre>{" "}
          {/* This line outputs the session object */}
          <pre>{JSON.stringify({ codeVerifier }, null, 2)}</pre>{" "}
          {/* This line outputs the code verifier */}
        </div>
        <Login />
      </div>
    </main>
  );
}
