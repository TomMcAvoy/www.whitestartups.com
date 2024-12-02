/* eslint-disable @typescript-eslint/no-unused-vars */
export class CircuitBreaker {
  private failures = new Map<string, number>();
  private readonly threshold = 5;

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    // ...existing code...
    try {
      const result = await operation();
      this.resetFailures(key);
      return result;
    } catch (error) {
      this.recordFailure(key);
      return fallback();
    }
  }

  private isOpen(key: string): boolean {
    return (this.failures.get(key) || 0) >= this.threshold;
  }

  private recordFailure(key: string): void {
    const currentFailures = this.failures.get(key) || 0;
    this.failures.set(key, currentFailures + 1);
  }

  private resetFailures(key: string): void {
    this.failures.delete(key);
  }
}
