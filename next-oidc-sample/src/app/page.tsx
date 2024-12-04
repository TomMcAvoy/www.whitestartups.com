/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import LoginComponent from "@/components/Login";
import { SessionData } from "@/types/session-types"; // Updated import path
import { Redis } from "@upstash/redis";
import { generateRandomState } from "@/utils/oidc-utils"; // Updated import path
import useSession from "@/hooks/useSession"; // Ensure correct import

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default function Page() {
  const { session } = useSession();

  return (
    <div>
      <h1>Welcome</h1>
      {session ? <p>Logged in as {session.user.name}</p> : <p>Please log in</p>}
    </div>
  );
}
