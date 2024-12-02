import { NextRequest } from "next/server";

export interface SessionData {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  access_token?: string;
  id_token?: string;
  state?: string;
  codeVerifier?: string;
  destroy: (callback: (err: Error | null) => void) => void;
  save: () => Promise<void>;
}

export interface RequestWithSession extends NextRequest {
  session: SessionData;
}
