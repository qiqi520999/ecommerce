import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || 'https://patient-midge-34601.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'AYcpAAIjcDFiNDFkNGE3MThjMjc0OGFiOGY1ZWJkZjJkNWE5MDgxY3AxMA',
});

// Example usage
await redis.set('foo', 'bar');
const data = await redis.get('foo');
console.log('Redis data:', data);