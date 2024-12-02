import Redis from "ioredis";
import crypto from "crypto";
import { Session } from "./session"; // Import Session interface

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

export const createSession = async (
  data: Session, // Use Session interface
  expiresIn: number = 86400, // Default 24 hours
  prefix: string = "sess:"
): Promise<string> => {
  const sessionId = crypto.randomUUID();
  await redisClient.set(
    `${prefix}${sessionId}`,
    JSON.stringify(data),
    "EX",
    expiresIn
  );
  return sessionId;
};

export const readSession = async (sid: string): Promise<Session | null> => {
  const data = await redisClient.get(`sess:${sid}`);
  return data ? JSON.parse(data) : null;
};

export const updateSession = async (sid: string, data: Partial<Session>) => {
  const existingData = await readSession(sid);
  const updatedData = { ...existingData, ...data };
  await redisClient.set(`sess:${sid}`, JSON.stringify(updatedData));
};

export const deleteSession = async (sid: string) => {
  await redisClient.del(`sess:${sid}`);
};

export const sessionManager = {
  createSession,
  readSession,
  updateSession,
  deleteSession,
};
