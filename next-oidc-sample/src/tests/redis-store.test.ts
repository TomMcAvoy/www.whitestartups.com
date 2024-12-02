// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Redis } from "@upstash/redis";
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
} from "../middleware/redis-store";

describe("Redis Store", () => {
  let sessionId: string;
  const sessionData = {
    user: { id: "1", name: "Test User", email: "test@example.com" },
  };

  it("should create a session", async () => {
    const result = await createSession(sessionData);
    sessionId = result.sessionId;
    expect(sessionId).toBeDefined();
    expect(result.sessionData.user).toEqual(sessionData.user);
  });

  it("should get a session", async () => {
    const session = await getSession(sessionId);
    expect(session).toBeDefined();
    expect(session?.user).toEqual(sessionData.user);
  });

  it("should update a session", async () => {
    const updatedData = { user: { name: "Updated User" } };
    await updateSession(sessionId, updatedData);
    const session = await getSession(sessionId);
    expect(session?.user.name).toEqual("Updated User");
  });

  it("should delete a session", async () => {
    await deleteSession(sessionId);
    const session = await getSession(sessionId);
    expect(session).toBeNull();
  });
});
