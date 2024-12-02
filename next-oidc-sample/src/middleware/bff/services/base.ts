import { BFFContext } from "../types";
import { CircuitBreaker } from "./circuit-breaker"; // Ensure this path is correct
import { MetricsCollector } from "@/path/to/metrics-collector"; // Ensure this path is correct

export class BaseService {
  protected context: BFFContext;
  private circuitBreaker: CircuitBreaker;

  constructor(context: BFFContext) {
    this.context = context;
    this.circuitBreaker = new CircuitBreaker();
  }

  protected async fetch(url: string, options: RequestInit) {
    const startTime = Date.now();
    try {
      const response = await this.circuitBreaker.execute(
        url,
        async () => {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              "x-api-key": process.env.API_KEY,
              "x-request-id": this.context.requestId,
            },
          });

          if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
          }

          return response;
        },
        async () => {
          this.context.metrics.recordError(url);
          return this.context.cache.getStaleData(url);
        }
      );

      MetricsCollector.getInstance().record({
        upstream: { name: url },
        metrics: {
          status: response.status,
          latency: Date.now() - startTime,
        },
      });

      return response;
    } catch (error) {
      MetricsCollector.getInstance().record({
        upstream: { name: url },
        metrics: {
          status: 500,
          latency: Date.now() - startTime,
        },
      });
      throw error;
    }
  }
}
