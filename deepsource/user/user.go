package user

// Account represents a DeepSource account.
type Account struct {
	ID          string `json:"id"`
	Login       string `json:"login"`
	Type        string `json:"type"`
	VCSProvider string `json:"vcsProvider"`
}

// User represents the authenticated user.
type User struct {
	ID        string    `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	Accounts  []Account `json:"accounts"`
}
