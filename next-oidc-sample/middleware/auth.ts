import { NextRequest } from "next/server";
import { OIDCRequestManager } from "@/lib/oidc-manager";
import { getSession } from "@/";
import { setRequestContext } from "@/lib/request-context";
import { OIDCContext } from "@/lib/context";

export async function authMiddleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId");
  if (!sessionId) return;

  const session = await getSession(sessionId.value);
  if (!session) return;

  // Store tokens in request context for this request
  OIDCRequestManager.setTokens(request, session.tokens);

  // Store claims in request context
  setRequestContext(request, OIDCContext.CLAIMS, session.claims);
}
