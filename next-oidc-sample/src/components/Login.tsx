"use client";
import useSession from "@/hooks/useSession";
import React from "react";

const handleLogin = async () => {
  try {
    console.log("Starting login process...");
    const response = await fetch("/api/auth/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Response from /api/auth/start:", data);

    if (data.url) {
      console.log("Redirecting to:", data.url); // Log the redirect URL
      window.location.href = data.url; // Redirects to the identity provider
    } else {
      throw new Error("No URL in response");
    }
  } catch (error) {
    console.error("Login error:", error);
  }
};

const handleLogout = async () => {
  try {
    console.log("Starting logout process...");
    const response = await fetch("/auth/logout");
    const data = await response.json();
    console.log("Response from /auth/logout:", data);

    if (!data.url) {
      throw new Error("No URL in response");
    }
    window.location.href = data.url;
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const Login = () => {
  const { session, loading } = useSession();
  console.log("Session:", session);
  console.log("Loading:", loading);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (session?.isLoggedIn) {
    return (
      <button
        className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
        onClick={handleLogout}
      >
        Logout
      </button>
    );
  }
  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
      onClick={handleLogin}
    >
      Login
    </button>
  );
};

export default Login;
