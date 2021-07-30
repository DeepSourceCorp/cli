package auth

type RefreshAuthResponse struct {
	Refreshtoken struct {
		Token   string `json:"token"`
		Payload struct {
			Email   string `json:"email"`
			Exp     string `json:"exp"`
			Origiat int64  `json:"origIat"`
		} `json:"payload"`
		Refreshexpiresin int64  `json:"refreshExpiresIn"`
		Refreshtoken     string `json:"refreshToken"`
	} `json:"refreshToken"`
}
