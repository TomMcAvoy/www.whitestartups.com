export interface GatewayContext {
  requestId: string;
  startTime: number;
  auth: {
    token?: string;
    claims?: Record<string, unknown>; // Specify a more appropriate type
    scopes?: string[];
  };
  rate: {
    limit: number;
    remaining: number;
    reset: number;
  };
  metrics: {
    latency: number;
    status: number;
    cached: boolean;
  };
  cache?: {
    hit: boolean;
    key: string;
  };
  upstream?: {
    name: string;
    url: string;
    timeout: number;
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Remove the unused variables
// const someVariable: any = {};
// type SomeType = {
//   property: string;
// };
