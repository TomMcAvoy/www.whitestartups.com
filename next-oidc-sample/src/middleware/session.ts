import { getSession, applySession } from "next-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import { NextApiRequest, NextApiResponse } from "next";

const RedisStore = connectRedis(getSession);
const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

const sessionOptions = {
  store: new RedisStore({ client: redisClient }),
  name: "next.js.session",
  secret: process.env.SECRET_COOKIE_PASSWORD || "default_password",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};

export const withSessionMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await applySession(req, res, sessionOptions);
};

export const createSession = async <T>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T
) => {
  await withSessionMiddleware(req, res);
  req.session.data = data;
  await req.session.save();
  res.status(201).json({ message: "Session created", data: req.session.data });
};

export const readSession = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await withSessionMiddleware(req, res);
  if (!req.session.data) {
    res.status(404).json({ message: "Session not found" });
    return;
  }
  res.status(200).json({ message: "Session data", data: req.session.data });
};

export const updateSession = async <T>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T
) => {
  await withSessionMiddleware(req, res);
  req.session.data = { ...req.session.data, ...data };
  await req.session.save();
  res.status(200).json({ message: "Session updated", data: req.session.data });
};

export const deleteSession = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await withSessionMiddleware(req, res);
  req.session.destroy((err: any) => {
    if (err) {
      res.status(500).json({ message: "Failed to destroy session" });
      return;
    }
    res.status(200).json({ message: "Session destroyed" });
  });
};
