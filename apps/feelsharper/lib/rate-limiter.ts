export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

export interface SessionData {
  count: number;
  resetTime: number;
  firstRequest: number;
}

/**
 * In-memory rate limiter for API requests
 * For production with multiple instances, consider Redis
 */
export class RateLimiter {
  private sessions = new Map<string, SessionData>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly cleanupInterval: number;

  constructor(
    maxRequests: number = 3,
    windowMs: number = 60 * 60 * 1000, // 1 hour
    cleanupInterval: number = 5 * 60 * 1000 // 5 minutes
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.cleanupInterval = cleanupInterval;

    // Clean up expired sessions periodically
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Check if request is allowed for the given identifier
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const session = this.sessions.get(identifier);

    // No existing session or session expired
    if (!session || now > session.resetTime) {
      const newSession: SessionData = {
        count: 1,
        resetTime: now + this.windowMs,
        firstRequest: now
      };
      
      this.sessions.set(identifier, newSession);
      
      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetTime: newSession.resetTime
      };
    }

    // Check if limit exceeded
    if (session.count >= this.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: session.resetTime,
        error: `Rate limit exceeded. You can ask ${this.maxRequests} questions per hour. Try again in ${Math.ceil((session.resetTime - now) / (60 * 1000))} minutes.`
      };
    }

    // Increment count and allow request
    session.count++;
    
    return {
      success: true,
      remaining: this.maxRequests - session.count,
      resetTime: session.resetTime
    };
  }

  /**
   * Get current status for an identifier
   */
  getStatus(identifier: string): RateLimitResult {
    const now = Date.now();
    const session = this.sessions.get(identifier);

    if (!session || now > session.resetTime) {
      return {
        success: true,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs
      };
    }

    return {
      success: session.count < this.maxRequests,
      remaining: Math.max(0, this.maxRequests - session.count),
      resetTime: session.resetTime
    };
  }

  /**
   * Reset rate limit for an identifier (admin function)
   */
  reset(identifier: string): void {
    this.sessions.delete(identifier);
  }

  /**
   * Clean up expired sessions
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [identifier, session] of this.sessions.entries()) {
      if (now > session.resetTime) {
        expiredSessions.push(identifier);
      }
    }

    for (const identifier of expiredSessions) {
      this.sessions.delete(identifier);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired rate limit sessions`);
    }
  }

  /**
   * Get statistics about current rate limiting
   */
  getStats() {
    const now = Date.now();
    let activeSessions = 0;
    let totalRequests = 0;

    for (const session of this.sessions.values()) {
      if (now <= session.resetTime) {
        activeSessions++;
        totalRequests += session.count;
      }
    }

    return {
      activeSessions,
      totalRequests,
      maxRequestsPerWindow: this.maxRequests,
      windowMs: this.windowMs
    };
  }
}

// Global rate limiter instance
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Generate identifier from request for rate limiting
 */
export function getIdentifierFromRequest(request: Request): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Use the first available IP
  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // For development, you might want to use a session ID instead
  const sessionId = request.headers.get('x-session-id');
  
  return sessionId || ip;
}
