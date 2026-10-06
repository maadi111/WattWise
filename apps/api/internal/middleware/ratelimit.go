package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ipRateTracker struct {
	mu      sync.Mutex
	clients map[string]*clientBucket
	limit   int
	window  time.Duration
}

type clientBucket struct {
	tokens     int
	lastRefill time.Time
}

func RateLimiter(requestsPerMinute int) gin.HandlerFunc {
	tracker := &ipRateTracker{
		clients: make(map[string]*clientBucket),
		limit:   requestsPerMinute,
		window:  time.Minute,
	}

	// Periodic cleanup of stale IP entries
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			tracker.mu.Lock()
			now := time.Now()
			for ip, b := range tracker.clients {
				if now.Sub(b.lastRefill) > 10*time.Minute {
					delete(tracker.clients, ip)
				}
			}
			tracker.mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		tracker.mu.Lock()
		b, exists := tracker.clients[ip]
		now := time.Now()

		if !exists {
			b = &clientBucket{
				tokens:     tracker.limit - 1,
				lastRefill: now,
			}
			tracker.clients[ip] = b
			tracker.mu.Unlock()
			c.Next()
			return
		}

		// Refill tokens based on elapsed time
		elapsed := now.Sub(b.lastRefill)
		if elapsed >= tracker.window {
			b.tokens = tracker.limit
			b.lastRefill = now
		}

		if b.tokens <= 0 {
			tracker.mu.Unlock()
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded: too many login attempts. Please wait 1 minute.",
			})
			return
		}

		b.tokens--
		tracker.mu.Unlock()
		c.Next()
	}
}
