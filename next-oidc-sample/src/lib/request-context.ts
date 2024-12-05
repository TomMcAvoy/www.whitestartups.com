import { NextRequest } from "next/server";

const requestContextMap = new WeakMap<NextRequest, Map<symbol, any>>();

export function setRequestContext(
  request: NextRequest,
  key: symbol,
  value: any
) {
  let context = requestContextMap.get(request);
  if (!context) {
    context = new Map();
    requestContextMap.set(request, context);
  }
  context.set(key, value);
}

export function getRequestContext<T>(
  request: NextRequest,
  key: symbol
): T | undefined {
  const context = requestContextMap.get(request);
  return context?.get(key);
}
