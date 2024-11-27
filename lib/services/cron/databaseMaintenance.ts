import { DatabaseHealthService } from '../database/HealthCheckService';

export async function scheduleDatabaseMaintenance() {
  // Run every hour
  setInterval(async () => {
    try {
      const cleanedCount = await DatabaseHealthService.cleanupTransactions();
      console.log(`Cleaned up ${cleanedCount} stale transactions`);
    } catch (error) {
      console.error('Database maintenance failed:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
} 