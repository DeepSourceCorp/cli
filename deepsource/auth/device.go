package auth

type Device struct {
	Code                    string `json:"deviceCode"`              // Device Code
	UserCode                string `json:"userCode"`                // 8 figure User code to be used while authentication
	VerificationURI         string `json:"verificationUri"`         // URL to verify user code
	VerificationURIComplete string `json:"verificationUriComplete"` // URL to verify user code with the user code being sent as a URL param
	ExpiresIn               int    `json:"expiresIn"`               // Time in which the device code expires
	Interval                int    `json:"interval"`                // Interval in which the client needs to poll at the endpoint to receive the JWT
}
