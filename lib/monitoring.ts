// lib/monitoring.ts
// Production monitoring and error handling utilities

/**
 * Log errors safely in production
 * In production, send to error tracking service (Sentry, LogRocket, etc)
 */
export function logError(
  error: Error | unknown,
  context?: Record<string, any>
) {
  if (process.env['NODE_ENV'] === "production") {
    // Send to error tracking service
    console.error("Production Error:", error, context);
    
    // Example: Send to Sentry
    // Sentry.captureException(error, { contexts: { app: context } });
  } else {
    // Development logging
    console.error("Development Error:", error);
    if (context) console.error("Context:", context);
  }
}

/**
 * Performance monitoring
 */
export function measurePerformance(label: string) {
  if (typeof window === "undefined") return;

  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env['NODE_ENV'] === "development") {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
}

/**
 * Safe async handler with error boundary
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorCallback?: (error: Error) => void
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err);
    
    if (errorCallback) {
      errorCallback(err);
    }
    
    return null;
  }
}

/**
 * API request wrapper with timeout and retry logic
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit & { timeout?: number; retries?: number } = {}
): Promise<T> {
  const { timeout = 10000, retries = 2, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        logError(error, { url, attempt: attempt + 1 });
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error("Failed after retries");
}

/**
 * Memory usage monitoring (server-side)
 */
export function getMemoryUsage() {
  if (typeof process === "undefined") return null;
  
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + " MB",
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + " MB",
    external: Math.round(used.external / 1024 / 1024) + " MB",
    rss: Math.round(used.rss / 1024 / 1024) + " MB",
  };
}
