package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeaders applies production HTTP security headers (HSTS, nosniff, frame-deny, CSP, Referrer-Policy)
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Strict Transport Security (HSTS): 2 years with preloading
		c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")

		// Prevent MIME-sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		// Clickjacking defense: Deny framing
		c.Header("X-Frame-Options", "DENY")

		// Referrer Policy: Send full referrer on same-origin, domain-only on cross-origin HTTPS
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Content Security Policy
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' wss: ws: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';")

		// Prevent cross-site scripting filter bypasses in legacy browsers
		c.Header("X-XSS-Protection", "1; mode=block")

		c.Next()
	}
}
