package auth

import (
	"errors"
	"strings"
	"unicode"
)

const (
	minPasswordLength = 12
	maxPasswordLength = 128
)

// commonPasswordBases are the letters-only cores of very common passwords. A password is rejected when
// its letters (digits, symbols and case removed) equal one of these, so "Password12345" and "P@ssw0rd!!!!"
// fail while a real passphrase that merely contains a word passes.
var commonPasswordBases = map[string]bool{
	"password": true, "passw": true, "passwrd": true, "psswrd": true, "psswd": true, "pass": true, "admin": true, "administrator": true,
	"welcome": true, "letmein": true, "qwerty": true, "qwertyuiop": true, "qwertyuiopasdfghjkl": true,
	"iloveyou": true, "monkey": true, "dragon": true, "football": true, "baseball": true, "master": true,
	"changeme": true, "changethis": true, "changethisstrongbootstrappassword": true, "wattwise": true,
	"wattwisepassword": true, "temporary": true, "default": true, "secret": true, "login": true,
	"abc": true, "abcdefgh": true, "abcdefghijkl": true, "pakistan": true, "lahore": true, "karachi": true,
}

// ValidatePassword enforces the platform password policy. email may be empty; when given, passwords that
// embed the local part of the address are rejected.
func ValidatePassword(password, email string) error {
	if len(password) < minPasswordLength {
		return errors.New("password must be at least 12 characters")
	}
	if len(password) > maxPasswordLength {
		return errors.New("password must be at most 128 characters")
	}
	lower := strings.ToLower(strings.TrimSpace(password))
	if commonPasswordDenylist[lower] {
		return errors.New("password is too common or easily guessable; please choose a stronger passphrase")
	}

	var letters strings.Builder
	distinct := map[rune]bool{}
	for _, r := range lower {
		distinct[r] = true
		if unicode.IsLetter(r) {
			letters.WriteRune(r)
		}
	}
	if commonPasswordBases[letters.String()] {
		return errors.New("password is too common or easily guessable; please choose a stronger passphrase")
	}
	if len(distinct) < 5 {
		return errors.New("password has too little variety; use a longer, more varied passphrase")
	}
	if local, _, ok := strings.Cut(strings.ToLower(strings.TrimSpace(email)), "@"); ok && len(local) >= 4 && strings.Contains(lower, local) {
		return errors.New("password must not contain your email address")
	}
	return nil
}
