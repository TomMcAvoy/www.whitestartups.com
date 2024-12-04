import { RequestContext } from "@/middleware/context"; // Import RequestContext type

const contextStore = new Map<
  string,
  { context: RequestContext; expiry: number }
>();

export function setContext(
  requestId: string,
  context: RequestContext,
  ttl: number
) {
  const expiry = Date.now() + ttl;
  contextStore.set(requestId, { context, expiry });

  // Schedule removal of the context after TTL
  setTimeout(() => {
    deleteContext(requestId);
  }, ttl);
}

export function getContext(requestId: string): RequestContext | undefined {
  const record = contextStore.get(requestId);
  if (record && record.expiry > Date.now()) {
    return record.context;
  } else {
    contextStore.delete(requestId);
    return undefined;
  }
}

export function deleteContext(requestId: string) {
  contextStore.delete(requestId);
}
