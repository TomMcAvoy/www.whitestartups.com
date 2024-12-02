export interface BFFContext {
  requestId: string;
  services: {
    users: UserService;
    products: ProductService;
    orders: OrderService;
    payments: PaymentService;
  };
  auth: {
    token: string;
    userId: string;
    permissions: string[];
  };
  cache: CacheService;
  metrics: MetricsService;
}
