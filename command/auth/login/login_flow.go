package login

import (
	"context"
	"fmt"
	"time"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	"github.com/fatih/color"
)

func (opts *LoginOptions) startLoginFlow() error {
	// Fetching DeepSource client in order to interact with SDK
	deepsource := deepsource.New()
	ctx := context.Background()

	// Send a mutation to register device and get the device code
	res, err := deepsource.RegisterDevice(ctx)
	if err != nil {
		return err
	}

	// Having received the device code, open the browser at verificationURI
	// Print the user code and the permission to open browser at verificationURI
	c := color.New(color.FgCyan, color.Bold)
	c.Printf("Please copy your one-time code: %s\n", res.UserCode)
	c.Printf("Press enter to open deepsource.io in your browser...")
	fmt.Scanln()

	err = browser.OpenURL(res.VerificationURIComplete)
	if err != nil {
		return err
	}

	// Keep polling the mutation at a certain interval till the expiry timeperiod
	ticker := time.NewTicker(time.Duration(res.Interval) * time.Second)
	pollStartTime := time.Now()
	var jwtData *auth.JWT

	// Polling for fetching JWT
	func() {
		for {
			select {
			case <-ticker.C:
				// Fetch JWT
				jwtData, err = deepsource.Login(ctx, res.Code)
				if err == nil {
					opts.AuthTimedOut = false
					return
				}

				// Check if polling timed-out
				timeElapsed := time.Since(pollStartTime)
				if timeElapsed >= time.Duration(res.ExpiresIn)*time.Second {
					opts.AuthTimedOut = true
					return
				}
			}
		}
	}()

	// Check if it was a success poll or the Auth timed out
	if opts.AuthTimedOut {
		return fmt.Errorf("Authentication timed out")
	}

	// Convert incoming config into the local config format
	// For storing the useful data for future reference and usage
	finalConfig := config.CLIConfig{
		User:                  jwtData.Payload.Email,
		Token:                 jwtData.Token,
		RefreshToken:          jwtData.Refreshtoken,
		RefreshTokenExpiresIn: time.Unix(jwtData.RefreshExpiresIn, 0),
	}
	finalConfig.SetTokenExpiry(jwtData.Payload.Exp)

	// Having formatted the data, write it into a file in the local filesystem
	err = finalConfig.WriteFile()
	if err != nil {
		return fmt.Errorf("Error in writing authentication data to a file. Exiting...")
	}

	return nil
}
