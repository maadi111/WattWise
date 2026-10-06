package auth

import (
	"context"
	"database/sql"
	"errors"

	"github.com/rs/zerolog/log"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepository struct {
	db *sql.DB
}

var globalUserRepo *UserRepository

func InitUserRepository(db *sql.DB) {
	globalUserRepo = &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*UserRecord, error) {
	if r == nil || r.db == nil {
		// Fallback to in-memory store
		globalStore.mu.RLock()
		defer globalStore.mu.RUnlock()
		u, exists := globalStore.users[email]
		if !exists {
			return nil, ErrUserNotFound
		}
		return &u, nil
	}

	query := `
		SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.created_at,
		       COALESCE(ARRAY_AGG(ufa.factory_id) FILTER (WHERE ufa.factory_id IS NOT NULL), '{}') as factory_ids
		FROM users u
		LEFT JOIN user_factory_access ufa ON u.id = ufa.user_id
		WHERE u.email = $1
		GROUP BY u.id, u.email, u.password_hash, u.full_name, u.role, u.created_at
	`

	var u UserRecord
	var factoryIDs []string
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.FullName,
		&u.Role,
		&u.CreatedAt,
		&factoryIDs,
	)

	if err == sql.ErrNoRows {
		// Check fallback memory store
		globalStore.mu.RLock()
		memUser, exists := globalStore.users[email]
		globalStore.mu.RUnlock()
		if exists {
			return &memUser, nil
		}
		return nil, ErrUserNotFound
	} else if err != nil {
		log.Warn().Err(err).Msg("Database query failed, checking fallback store")
		globalStore.mu.RLock()
		memUser, exists := globalStore.users[email]
		globalStore.mu.RUnlock()
		if exists {
			return &memUser, nil
		}
		return nil, err
	}

	u.FactoryIDs = factoryIDs
	return &u, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*UserRecord, error) {
	if r == nil || r.db == nil {
		globalStore.mu.RLock()
		defer globalStore.mu.RUnlock()
		for _, u := range globalStore.users {
			if u.ID == id {
				return &u, nil
			}
		}
		return nil, ErrUserNotFound
	}

	query := `
		SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.created_at,
		       COALESCE(ARRAY_AGG(ufa.factory_id) FILTER (WHERE ufa.factory_id IS NOT NULL), '{}') as factory_ids
		FROM users u
		LEFT JOIN user_factory_access ufa ON u.id = ufa.user_id
		WHERE u.id = $1
		GROUP BY u.id, u.email, u.password_hash, u.full_name, u.role, u.created_at
	`

	var u UserRecord
	var factoryIDs []string
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.FullName,
		&u.Role,
		&u.CreatedAt,
		&factoryIDs,
	)

	if err == sql.ErrNoRows {
		globalStore.mu.RLock()
		defer globalStore.mu.RUnlock()
		for _, memUser := range globalStore.users {
			if memUser.ID == id {
				return &memUser, nil
			}
		}
		return nil, ErrUserNotFound
	} else if err != nil {
		return nil, err
	}

	u.FactoryIDs = factoryIDs
	return &u, nil
}
