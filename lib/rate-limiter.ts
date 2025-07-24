import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
}

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (request: NextRequest): { success: boolean; limit: number; remaining: number; resetTime: number } => {
      const now = Date.now()
      const key = getClientIdentifier(request)
      
      // Clean up expired entries
      if (store[key] && now > store[key].resetTime) {
        delete store[key]
      }
      
      // Initialize or get current count
      if (!store[key]) {
        store[key] = {
          count: 0,
          resetTime: now + options.windowMs
        }
      }
      
      const current = store[key]
      const remaining = Math.max(0, options.maxRequests - current.count - 1)
      
      if (current.count >= options.maxRequests) {
        return {
          success: false,
          limit: options.maxRequests,
          remaining: 0,
          resetTime: current.resetTime
        }
      }
      
      current.count++
      
      return {
        success: true,
        limit: options.maxRequests,
        remaining,
        resetTime: current.resetTime
      }
    }
  }
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  return `${ip}`
}

// Pre-configured rate limiters
export const generateApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 requests per 15 minutes per IP
})

export const resultsApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute per IP
})