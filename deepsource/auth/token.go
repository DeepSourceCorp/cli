package auth


type PAT struct {
	Token  string `json:"token"` // PAT received from the server
	Expiry string `json:"expiry"` // Token expiry timestamp
	User   struct {
		FirstName string `json:"firstName"` // User's firstname
		LastName  string `json:"lastName"` // User's lastname
		Email     string `json:"email"` // User's email address
	} `json:"user"`
}
