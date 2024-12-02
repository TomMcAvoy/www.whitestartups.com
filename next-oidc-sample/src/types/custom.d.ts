/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextApiRequest } from "next";
import { NextRequest } from "next/server";
import { Request } from "express";

declare module "next" {
  interface NextApiRequest {
    jwt?: string;
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
      destroy: (callback: (err: any) => void) => void;
      save: () => Promise<void>;
    };
  }
}

declare module "next/server" {
  interface NextRequest {
    jwt?: string;
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
      destroy: (callback: (err: any) => void) => void;
      save: () => Promise<void>;
    };
  }
}

export interface CustomRequest extends Request {
  jwt?: string;
}
