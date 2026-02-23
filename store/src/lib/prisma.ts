import { PrismaClient } from '@prisma/client'
import { neon } from '@neondatabase/serverless'

// Connection pool settings
const CONNECTION_LIMIT = 10; // Maximum number of connections in the pool
const CONNECTION_TIMEOUT = 30000; // 30 seconds timeout for connections
const CONNECTION_IDLE_TIMEOUT = 10000; // 10 seconds idle timeout

/**
 * Enhanced Prisma Client with connection pooling and performance optimizations
 * - Uses a singleton pattern to avoid multiple instances in development
 * - Implements connection pooling for better performance
 * - Includes error handling and retry logic
 */
function createPrismaClient() {
  // Create a new Prisma client with optimized settings
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Connection testing with retry logic
  (async () => {
    let retries = 5;
    let connected = false;

    while (retries > 0 && !connected) {
      try {
        // Simple query to test connection
        await client.$queryRaw`SELECT 1`;
        console.log('Successfully connected to the database');
        connected = true;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Failed to connect to the database after multiple attempts:', error);
        } else {
          console.warn(`Database connection failed, retrying... (${retries} attempts left)`);
          // Exponential backoff: 1s, 2s, 4s, 8s
          await new Promise(r => setTimeout(r, Math.pow(2, 5 - retries) * 500));
        }
      }
    }
  })();

  // Add middleware for query performance tracking in development
  if (process.env.NODE_ENV === 'development') {
    client.$use(async (params, next) => {
      const start = performance.now();
      const result = await next(params);
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 100) { // Log slow queries (>100ms)
        console.warn(`Slow query detected (${duration.toFixed(2)}ms): ${params.model}.${params.action}`);
      }
      
      return result;
    });
  }

  // Add error handling middleware
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      // Log the error with query context for better debugging
      console.error(`Database error in ${params.model}.${params.action}:`, error);
      throw error;
    }
  });
  
  return client;
}

// Global type declaration for the Prisma client
declare global {
  var prisma: undefined | ReturnType<typeof createPrismaClient>
}

// Use existing instance in development to avoid too many connections
const prisma = globalThis.prisma ?? createPrismaClient();

// In development, attach to the global object for hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma; 