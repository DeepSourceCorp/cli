package cmdutils

import "net/http"

type CLIFactory struct {
	Config     ConfigMeta
	HTTPClient func() (*http.Client, error)
	HostName   string
}

type ConfigMeta struct {
	Token               string
	RefreshToken        string
	RefreshTokenExpiry  int64
	RefreshTokenSetTime int64
}
