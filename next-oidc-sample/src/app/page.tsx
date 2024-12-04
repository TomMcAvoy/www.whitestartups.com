/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import LoginComponent from "@/components/Login";
import { SessionData } from "@/types/session-types"; // Updated import path
import { Redis } from "@upstash/redis";
import { generateRandomState } from "@/utils"; // Updated import path

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default function Home() {
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    // Request code verifier and code challenge from the server
    async function requestCodeVerifierAndChallenge() {
      try {
        const res = await fetch("/api/generate-code-verifier", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch code verifier and challenge");
        }
        const data = await res.json();
        setCodeVerifier(data.codeVerifier);
        setCode(data.codeChallenge);
      } catch (error) {
        console.error("Error fetching code verifier and challenge:", error);
      }
    }
    requestCodeVerifierAndChallenge();

    // Request CSRF token from the server
    async function requestCsrfToken() {
      try {
        const res = await fetch("/api/generate-csrf-token", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch CSRF token");
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    }
    requestCsrfToken();

    // Fetch session data from Upstash
    async function fetchSession() {
      try {
        const sessionId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session_id="))
          ?.split("=")[1];
        if (sessionId) {
          const sessionData = await redis.get<SessionData>(sessionId);
          if (sessionData) {
            setSession(sessionData);
          } else {
            setSession(new SessionData({ authenticated: false }));
          }
        } else {
          setSession(new SessionData({ authenticated: false }));
        }
      } catch (error) {
        console.error("Error fetching session data from Upstash:", error);
        setSession(new SessionData({ authenticated: false }));
      }
    }

    fetchSession();

    // Retrieve code from local storage if it exists
    const storedCode = localStorage.getItem("auth_code");
    if (storedCode) {
      setCode(storedCode);
    }
  }, []);

  const handleLogout = () => {
    // Clear session data and cookies
    document.cookie =
      "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly; Secure;";
    document.cookie =
      "csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly; Secure;";
    setSession(new SessionData({ authenticated: false }));
  };

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
          {session?.authenticated ? (
            <>
              <pre>{JSON.stringify(session, null, 2)}</pre>
              <button onClick={handleLogout} className="btn btn-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <pre>{JSON.stringify({ codeVerifier, code }, null, 2)}</pre>
              <LoginComponent session={session} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
