package login

import (
	"context"
	"fmt"
	"os"
	"os/user"
	"time"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/fatih/color"
)

func (opts *LoginOptions) startLoginFlow(svc *authsvc.Service, cfg *config.CLIConfig) error {
	ctx := context.Background()
	deviceRegistrationResponse, err := registerDevice(ctx, svc, cfg)
	if err != nil {
		return err
	}

	err = browser.OpenURL(deviceRegistrationResponse.VerificationURIComplete)
	if err != nil {
		c := color.New(color.FgCyan, color.Bold)
		c.Printf("Open this URL in your browser to authenticate:\n")
	} else {
		fmt.Println("Opened the authentication page in your browser.")
		c := color.New(color.FgCyan, color.Bold)
		c.Printf("If the browser didn't open, visit this URL to authenticate:\n")
	}
	fmt.Println(deviceRegistrationResponse.VerificationURIComplete)
	fmt.Println()
	fmt.Println("Waiting for authentication")

	var tokenData *auth.PAT
	tokenData, opts.AuthTimedOut, err = fetchPAT(ctx, deviceRegistrationResponse, svc, cfg)
	if err != nil {
		return err
	}

	if opts.AuthTimedOut {
		return clierrors.ErrAuthTimeout()
	}

	cfg.User = tokenData.User.Email
	cfg.Token = tokenData.Token
	cfg.SetTokenExpiry(tokenData.Expiry)

	err = svc.SaveConfig(cfg)
	if err != nil {
		return clierrors.NewCLIError(clierrors.ErrInvalidConfig, "Failed to save authentication data", err)
	}

	c := color.New(color.FgGreen, color.Bold)
	c.Printf("Logged in as %s\n", tokenData.User.Email)
	return nil
}

func registerDevice(ctx context.Context, svc *authsvc.Service, cfg *config.CLIConfig) (*auth.Device, error) {
	return svc.RegisterDevice(ctx, cfg)
}

func fetchPAT(ctx context.Context, deviceRegistrationData *auth.Device, svc *authsvc.Service, cfg *config.CLIConfig) (*auth.PAT, bool, error) {
	var tokenData *auth.PAT
	var err error
	defaultUserName := "user"
	defaultHostName := "host"
	userName := ""
	authTimedOut := true

	userData, err := user.Current()
	if err != nil {
		userName = defaultUserName
	} else {
		userName = userData.Username
	}

	hostName, err := os.Hostname()
	if err != nil {
		hostName = defaultHostName
	}
	userDescription := fmt.Sprintf("CLI PAT for %s@%s", userName, hostName)

	ticker := time.NewTicker(time.Duration(deviceRegistrationData.Interval) * time.Second)
	pollStartTime := time.Now()

	func() {
		for range ticker.C {
			tokenData, err = svc.RequestPAT(ctx, cfg, deviceRegistrationData.Code, userDescription)
			if err == nil {
				authTimedOut = false
				return
			}
			timeElapsed := time.Since(pollStartTime)
			if timeElapsed >= time.Duration(deviceRegistrationData.ExpiresIn)*time.Second {
				authTimedOut = true
				return
			}
		}
	}()

	return tokenData, authTimedOut, nil
}
