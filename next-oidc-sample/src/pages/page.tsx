"use client";
import React from "react";
import Login from "@/components/Login";
import useSession from "@/hooks/useSession";

const Page = () => {
  const { session, loading } = useSession();
  console.log("Session:", session);
  console.log("Loading:", loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Login />;
};

export default Page;
