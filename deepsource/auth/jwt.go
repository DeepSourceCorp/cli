package auth

import "time"

type JWT struct {
	Payload struct {
		Email   string `json:"email"`   // Email of the user
		Exp     string `json:"exp"`     // Token Expiry timestamp
		Origiat int64  `json:"origIat"` // The issued At claim : identifies the time at which the JWT was issued
	} `json:"payload"`
	Token            string `json:"token"`            // The JWT
	Refreshtoken     string `json:"refreshToken"`     // Refresh token for refreshing auth creds when needed
	TokenExpiresIn   int64  `json:"tokenExpiresIn"`   // Token expiry timestamp
	RefreshExpiresIn int64  `json:"refreshExpiresIn"` // Refresh token expiry timestamp
}

type PAT struct {
	Token  string    `json:"token"`
	Expiry time.Time `json:"expiry"`
	User   struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	} `json:"user"`
}
