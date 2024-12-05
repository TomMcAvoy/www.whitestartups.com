import { NextRequest } from "next/server";

export const OIDCContext = {
  STATE: Symbol("oidc-state"),
  TOKENS: Symbol("oidc-tokens"),
  SESSION_ID: Symbol("session-id"),
} as const;

export class ContextManager {
  static set(request: NextRequest, key: symbol, value: string): void {
    (request as any)[key] = value;
  }

  static get(request: NextRequest, key: symbol): string | undefined {
    return (request as any)[key];
  }

  static clear(request: NextRequest): void {
    if ((request as any)[OIDCContext.SESSION_ID]) {
      delete (request as any)[OIDCContext.SESSION_ID];
    }
    if ((request as any)[OIDCContext.STATE]) {
      delete (request as any)[OIDCContext.STATE];
    }
  }

  static createContext(request: NextRequest, response: NextResponse): any {
    const context = {};
    this.set(request, OIDCContext.SESSION_ID, "");
    this.set(request, OIDCContext.STATE, "");
    return context;
  }
}
