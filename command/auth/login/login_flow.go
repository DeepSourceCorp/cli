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

// Starts the login flow for the CLI
func (opts *LoginOptions) startLoginFlow(svc *authsvc.Service, cfg *config.CLIConfig) error {
	// Register the device and get a device code through the response
	ctx := context.Background()
	deviceRegistrationResponse, err := registerDevice(ctx, svc, cfg)
	if err != nil {
		return err
	}

	// Open the browser for authentication
	err = browser.OpenURL(deviceRegistrationResponse.VerificationURIComplete)
	if err != nil {
		// If the browser fails to open, show the URL for manual access
		c := color.New(color.FgCyan, color.Bold)
		c.Printf("Open this URL in your browser to authenticate:\n")
		fmt.Println(deviceRegistrationResponse.VerificationURIComplete)
	} else {
		fmt.Println("Opened the authentication page in your browser")
	}

	fmt.Println("Waiting for authentication")

	// Fetch the PAT by polling the server
	var tokenData *auth.PAT
	tokenData, opts.AuthTimedOut, err = fetchPAT(ctx, deviceRegistrationResponse, svc, cfg)
	if err != nil {
		return err
	}

	if opts.AuthTimedOut {
		return clierrors.NewCLIError(clierrors.ErrAuthRequired, "Authentication timed out. Please try again", nil)
	}

	// Store auth data in config
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

	/* ======================================================================= */
	// The username and hostname to add in the description for the PAT request
	/* ======================================================================= */
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

	// Keep polling the mutation at a certain interval till the expiry timeperiod
	ticker := time.NewTicker(time.Duration(deviceRegistrationData.Interval) * time.Second)
	pollStartTime := time.Now()

	// Polling for fetching PAT
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
