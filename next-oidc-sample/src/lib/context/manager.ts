import { ContextSymbols } from "./symbols";

export class ContextManager {
  static set<T>(request: Request, symbol: Symbol, value: T): void {
    (request as any)[symbol] = value;
  }

  static get<T>(request: Request, symbol: Symbol): T | undefined {
    return (request as any)[symbol];
  }
}
