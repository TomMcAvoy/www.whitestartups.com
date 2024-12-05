import { NextRequest, NextResponse } from "next/server";
import { ContextManager } from "../lib/context";

const CONTEXT_SYMBOL = Symbol("context");

export async function contextMiddleware(req: NextRequest, res: NextResponse) {
  const context = ContextManager.createContext(req, res);

  // Create an object with multiple fields
  const complexObject = {
    field1: "value1",
    field2: "value2",
    // Add more fields as needed
    field50: "value50",
  };

  // Add the object to the request using a symbol
  ContextManager.set(req, CONTEXT_SYMBOL, complexObject);

  return NextResponse.next();
}
