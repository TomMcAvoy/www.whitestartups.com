import { BaseService } from "./base";

export class UserService extends BaseService {
  async getProfile(userId: string) {
    // Check cache first
    const cached = await this.context.cache.get(`user:${userId}`);
    if (cached) return cached;

    // Parallel requests to different services
    const [userDetails, preferences, orders] = await Promise.all([
      this.fetch(`/api/users/${userId}`, {}),
      this.fetch(`/api/preferences/${userId}`, {}),
      this.fetch(`/api/orders?userId=${userId}`, {}),
    ]);

    // Compose response
    const profile = {
      ...userDetails,
      preferences,
      recentOrders: orders.slice(0, 5),
    };

    // Cache result
    await this.context.cache.set(`user:${userId}`, profile);
    return profile;
  }
}
