package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
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

func newTracker(rpm int) *ipRateTracker {
	tracker := &ipRateTracker{
		clients: make(map[string]*clientBucket),
		limit:   rpm,
		window:  time.Minute,
	}

	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			tracker.mu.Lock()
			now := time.Now()
			for k, b := range tracker.clients {
				if now.Sub(b.lastRefill) > 10*time.Minute {
					delete(tracker.clients, k)
				}
			}
			tracker.mu.Unlock()
		}
	}()

	return tracker
}

func (tracker *ipRateTracker) allow(key string) bool {
	tracker.mu.Lock()
	defer tracker.mu.Unlock()

	b, exists := tracker.clients[key]
	now := time.Now()

	if !exists {
		tracker.clients[key] = &clientBucket{
			tokens:     tracker.limit - 1,
			lastRefill: now,
		}
		return true
	}

	elapsed := now.Sub(b.lastRefill)
	if elapsed >= tracker.window {
		b.tokens = tracker.limit
		b.lastRefill = now
	}

	if b.tokens <= 0 {
		return false
	}

	b.tokens--
	return true
}

func RateLimiter(requestsPerMinute int) gin.HandlerFunc {
	tracker := newTracker(requestsPerMinute)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !tracker.allow("ip:" + ip) {
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded: too many requests. Please wait 1 minute.",
			})
			return
		}
		c.Next()
	}
}

// LoginRateLimiter limits by both client IP and normalized email to prevent distributed credential stuffing (H9)
func LoginRateLimiter(requestsPerMinute int) gin.HandlerFunc {
	tracker := newTracker(requestsPerMinute)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !tracker.allow("ip:" + ip) {
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded: too many login attempts from this IP. Please wait 1 minute.",
			})
			return
		}

		// Peek at email from request body for per-account rate limiting
		if c.Request.Body != nil {
			bodyBytes, err := io.ReadAll(c.Request.Body)
			if err == nil {
				// Restore request body for subsequent JSON binding
				c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

				var payload struct {
					Email string `json:"email"`
				}
				if err := json.Unmarshal(bodyBytes, &payload); err == nil && payload.Email != "" {
					normalizedEmail := strings.ToLower(strings.TrimSpace(payload.Email))
					if !tracker.allow("email:" + normalizedEmail) {
						c.Header("Retry-After", "60")
						c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
							"error": "rate limit exceeded: too many login attempts for this account. Please wait 1 minute.",
						})
						return
					}
				}
			}
		}

		c.Next()
	}
}
