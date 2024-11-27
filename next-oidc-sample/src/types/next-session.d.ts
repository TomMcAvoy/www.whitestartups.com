import { SessionOptions as ExpressSessionOptions } from "express-session";

declare module "next" {
  interface NextApiRequest {
    session: {
      user?: {
        id: string;
        name: string;
        email: string;
      };
      access_token?: string;
      id_token?: string;
      state?: string;
      codeVerifier?: string;
      destroy: (callback: (err: unknown) => void) => void;
    };
  }
}

declare module "express-session" {
  export interface Session {
    user?: {
      id: string;
      name: string;
      email: string;
    };
    access_token?: string;
    id_token?: string;
    state?: string;
    codeVerifier?: string;
    destroy: (callback: (err: unknown) => void) => void;
  }

  export interface SessionOptions extends ExpressSessionOptions {}
}
