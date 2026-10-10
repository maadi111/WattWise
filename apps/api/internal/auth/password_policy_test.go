package auth

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidatePassword(t *testing.T) {
	reject := map[string]string{
		"too short (11)":            "Abcdefg-123",
		"common + digits":           "Password12345",
		"leetspeak variant":         "P@ssw0rd!!!!!",
		"known project default":     "WattWise2026!#",
		"template placeholder":      "ChangeThisStrongBootstrapPassword!",
		"keyboard walk":             "Qwertyuiop-123",
		"low variety":               "aaaaaaaaaaaaaaaa",
		"too long":                  strings.Repeat("aB3-", 40),
		"contains email local part": "xx-john.smith-yy1",
	}
	for name, pw := range reject {
		email := ""
		if name == "contains email local part" {
			email = "john.smith@company.pk"
		}
		assert.Error(t, ValidatePassword(pw, email), name)
	}

	accept := []string{"Brand-New-Passw0rd-xyz", "correct horse battery staple", "Zq9-vivid-harbor-lantern"}
	for _, pw := range accept {
		assert.NoError(t, ValidatePassword(pw, "john.smith@company.pk"), pw)
	}
}
