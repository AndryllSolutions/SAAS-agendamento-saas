/**
 * Intelligent Retry Strategy - Exponential Backoff with Rate Limit Handling
 */

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  rateLimitDelay: number
  retryCondition?: (error: any) => boolean
}

interface RetryResult<T> {
  data?: T
  error?: any
  attempt: number
  totalTime: number
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  rateLimitDelay: 60000, // 1 minute for rate limits
  retryCondition: (error) => {
    // Retry on network errors, 5xx errors, and 429 rate limits
    if (!error.response) return true // Network error
    const status = error.response?.status
    return status >= 500 || status === 429
  }
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> => {
  const finalConfig = { ...defaultConfig, ...config }
  const startTime = Date.now()
  let lastError: any

  for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${finalConfig.maxRetries + 1}`)
      
      const data = await operation()
      const totalTime = Date.now() - startTime
      
      console.log(`✅ Success on attempt ${attempt} (${totalTime}ms)`)
      return { data, attempt, totalTime }

    } catch (error: any) {
      lastError = error
      const totalTime = Date.now() - startTime

      console.log(`❌ Attempt ${attempt} failed:`, {
        status: error.response?.status,
        message: error.message,
        totalTime
      })

      // If this was the last attempt, don't retry
      if (attempt > finalConfig.maxRetries) {
        console.log(`🛑 Max retries (${finalConfig.maxRetries}) reached`)
        break
      }

      // Check if we should retry this error
      if (finalConfig.retryCondition && !finalConfig.retryCondition(error)) {
        console.log(`🚫 Error not retryable: ${error.response?.status}`)
        break
      }

      // Calculate delay based on error type
      let delay: number
      
      if (error.response?.status === 429) {
        // Rate limit: use longer delay
        delay = finalConfig.rateLimitDelay
        console.log(`⏳ Rate limit detected, waiting ${delay/1000}s...`)
      } else {
        // Exponential backoff for other errors
        delay = Math.min(
          finalConfig.baseDelay * Math.pow(2, attempt - 1),
          finalConfig.maxDelay
        )
        console.log(`⏱️ Exponential backoff: ${delay/1000}s`)
      }

      // Add jitter to avoid thundering herd
      const jitter = Math.random() * 0.1 * delay
      const totalDelay = delay + jitter

      await new Promise(resolve => setTimeout(resolve, totalDelay))
    }
  }

  const totalTime = Date.now() - startTime
  console.error(`💥 Operation failed after ${finalConfig.maxRetries + 1} attempts (${totalTime}ms)`)
  
  return { error: lastError, attempt: finalConfig.maxRetries + 1, totalTime }
}

/**
 * Axios interceptor for automatic retries
 */
export const setupAxiosRetry = (axiosInstance: any) => {
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const config = error.config
      
      // Avoid infinite loops
      if (config._retryCount >= 3) {
        return Promise.reject(error)
      }
      
      config._retryCount = config._retryCount || 0
      config._retryCount++

      // Only retry specific errors
      if (!error.response || ![429, 500, 502, 503, 504].includes(error.response.status)) {
        return Promise.reject(error)
      }

      const delay = error.response.status === 429 
        ? 60000 // 1 minute for rate limit
        : Math.min(1000 * Math.pow(2, config._retryCount), 30000) // Exponential backoff

      console.log(`🔄 Axios retry ${config._retryCount}/3 after ${delay}ms`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return axiosInstance(config)
    }
  )
}

/**
 * React Query retry function
 */
export const queryRetryFn = (failureCount: number, error: any) => {
  // Don't retry client errors (4xx except 429)
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
    return false
  }
  
  // Max 3 retries
  if (failureCount >= 3) {
    return false
  }

  return true
}

/**
 * React Query retry delay function
 */
export const queryRetryDelay = (attemptIndex: number, error: any) => {
  if (error.response?.status === 429) {
    return 60000 // 1 minute for rate limit
  }
  
  // Exponential backoff: 2^attempt * 1000ms, max 30s
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000)
}
