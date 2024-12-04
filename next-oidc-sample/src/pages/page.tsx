"use client";
import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@/middleware/redis-store";
import Login from "@/components/Login";

interface LoginProps {
  session: SessionData | null;
}

const Page = ({ session }: LoginProps) => {
  return <Login session={session} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionId = context.req.cookies.session_id;
  const session = sessionId ? await getSession(sessionId) : null;

  return {
    props: {
      session,
    },
  };
};

export default Page;
