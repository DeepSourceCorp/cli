package auth

type RefreshAuthResponse struct {
	Refreshtoken struct {
		Token   string `json:"token"` // The refreshed jwt
		Payload struct {
			Email   string `json:"email"`   // Email of the user
			Exp     string `json:"exp"`     // Token expiry time
			Origiat int64  `json:"origIat"` // The issued At claim : identifies the time at which the JWT was issued
		} `json:"payload"`
		Refreshexpiresin int64  `json:"refreshExpiresIn"` // Refresh token expiry timestamp
		Refreshtoken     string `json:"refreshToken"`     // New refresh token
	} `json:"refreshToken"`
}
