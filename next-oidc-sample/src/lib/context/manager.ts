// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ContextSymbols } from "./symbols";

export class ContextManager {
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  static set<T>(request: Request, symbol: Symbol, value: T): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any)[symbol.toString()] = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  static get<T>(request: Request, symbol: Symbol): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (request as any)[symbol.toString()];
  }
}
