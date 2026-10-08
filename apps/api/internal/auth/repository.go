package auth

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/rs/zerolog/log"
)

var (
	ErrUserNotFound     = errors.New("user not found")
	ErrDBNotInitialized = errors.New("database connection not initialized")
)

type UserRepository struct {
	db *sql.DB
}

var globalUserRepo *UserRepository

func InitUserRepository(db *sql.DB) {
	globalUserRepo = &UserRepository{db: db}
}

func GetUserRepository() *UserRepository {
	return globalUserRepo
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*UserRecord, error) {
	if r == nil || r.db == nil {
		return nil, ErrDBNotInitialized
	}

	normEmail := strings.ToLower(strings.TrimSpace(email))
	query := `
		SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.must_change_password, u.token_version, u.created_at,
		       COALESCE(ARRAY_AGG(ufa.factory_id) FILTER (WHERE ufa.factory_id IS NOT NULL), '{}') as factory_ids
		FROM users u
		LEFT JOIN user_factory_access ufa ON u.id = ufa.user_id
		WHERE lower(u.email) = lower($1)
		GROUP BY u.id, u.email, u.password_hash, u.full_name, u.role, u.must_change_password, u.token_version, u.created_at
	`

	var u UserRecord
	var factoryIDs []string
	err := r.db.QueryRowContext(ctx, query, normEmail).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.FullName,
		&u.Role,
		&u.MustChangePassword,
		&u.TokenVersion,
		&u.CreatedAt,
		pq.Array(&factoryIDs),
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	} else if err != nil {
		return nil, err
	}

	u.FactoryIDs = factoryIDs
	return &u, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*UserRecord, error) {
	if r == nil || r.db == nil {
		return nil, ErrDBNotInitialized
	}

	query := `
		SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.must_change_password, u.token_version, u.created_at,
		       COALESCE(ARRAY_AGG(ufa.factory_id) FILTER (WHERE ufa.factory_id IS NOT NULL), '{}') as factory_ids
		FROM users u
		LEFT JOIN user_factory_access ufa ON u.id = ufa.user_id
		WHERE u.id = $1
		GROUP BY u.id, u.email, u.password_hash, u.full_name, u.role, u.must_change_password, u.token_version, u.created_at
	`

	var u UserRecord
	var factoryIDs []string
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.FullName,
		&u.Role,
		&u.MustChangePassword,
		&u.TokenVersion,
		&u.CreatedAt,
		pq.Array(&factoryIDs),
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	} else if err != nil {
		return nil, err
	}

	u.FactoryIDs = factoryIDs
	return &u, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, u *UserRecord) error {
	if r == nil || r.db == nil {
		return ErrDBNotInitialized
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if u.TokenVersion <= 0 {
		u.TokenVersion = 1
	}

	normEmail := strings.ToLower(strings.TrimSpace(u.Email))
	query := `
		INSERT INTO users (id, email, password_hash, full_name, role, must_change_password, token_version, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err = tx.ExecContext(ctx, query, u.ID, normEmail, u.PasswordHash, u.FullName, u.Role, u.MustChangePassword, u.TokenVersion, u.CreatedAt)
	if err != nil {
		return err
	}

	for _, fid := range u.FactoryIDs {
		if fid != "" {
			_, err = tx.ExecContext(ctx, `INSERT INTO user_factory_access (user_id, factory_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, u.ID, fid)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID, newHash string) error {
	if r == nil || r.db == nil {
		return ErrDBNotInitialized
	}
	res, err := r.db.ExecContext(ctx, "UPDATE users SET password_hash = $1, token_version = token_version + 1, must_change_password = FALSE WHERE id = $2", newHash, userID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return ErrUserNotFound
	}
	return nil
}

func BootstrapInitialAdmin(ctx context.Context, email, password, fullName string) error {
	if globalUserRepo == nil || globalUserRepo.db == nil {
		return ErrDBNotInitialized
	}
	if email == "" || password == "" {
		return nil
	}

	var count int
	err := globalUserRepo.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM users WHERE role = 'super_admin'").Scan(&count)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if count > 0 {
		log.Debug().Msg("Super admin account already exists. Skipping bootstrap.")
		return nil
	}

	hashedPassword, err := HashPassword(password)
	if err != nil {
		return err
	}

	adminID := uuid.New().String()
	adminRecord := &UserRecord{
		ID:                 adminID,
		Email:              strings.ToLower(strings.TrimSpace(email)),
		PasswordHash:       hashedPassword,
		FullName:           fullName,
		Role:               "super_admin",
		MustChangePassword: true,
		TokenVersion:       1,
		CreatedAt:          time.Now().UTC(),
	}

	if err := globalUserRepo.CreateUser(ctx, adminRecord); err != nil {
		return err
	}

	log.Info().
		Str("admin_email", email).
		Msg("BOOTSTRAP: Initial super_admin created from environment. Password change required on first login.")
	return nil
}
