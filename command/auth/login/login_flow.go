package login

import (
	"context"
	"fmt"
	"time"

	"github.com/cli/browser"
	cliConfig "github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	"github.com/fatih/color"
	"github.com/pterm/pterm"
)

func (opts *LoginOptions) startLoginFlow() error {

	deepsource := deepsource.New()
	ctx := context.Background()

	// Send a mutation to register device and get the device code
	// deviceCode, userCode, verificationURI, expiresIn, interval, err := deepsource.RegisterDevice(ctx)

	res, err := deepsource.RegisterDevice(ctx)
	if err != nil {
		return err
	}

	// Having received the device code, open the browser at verificationURI
	// Print the user code and the permission to open browser at verificationURI
	c := color.New(color.FgCyan, color.Bold)
	c.Printf("Please copy your one-time code: %s\n", res.Code)
	c.Printf("Press enter to open deepsource.io in your browser...")
	fmt.Scanln()

	err = browser.OpenURL(res.VerificationURIComplete)
	if err != nil {
		return err
	}

	// // Keep polling the mutation at a certain interval till "expiresIn"
	ticker := time.NewTicker(time.Duration(res.Interval) * time.Second)
	pollStartTime := time.Now()
	var jwtData *auth.JWT

	// Polling for JWT
	func() {
		for {
			select {
			case <-ticker.C:
				// do stuff
				jwtData, err = deepsource.Login(ctx, res.Code)
				if jwtData.Token != "" {
					opts.AuthTimedOut = false
					return
				}

				// Check auth polling time out
				timeElapsed := time.Since(pollStartTime)
				if timeElapsed >= time.Duration(res.ExpiresIn)*time.Second {
					opts.AuthTimedOut = true
					return
				}
			}
		}
	}()

	// Check if its a success poll or the auth timed out
	if opts.AuthTimedOut {
		pterm.Error.Println("Authentication timed out. Exiting...")
		return fmt.Errorf("Authentication timed out")
	}

	// Convert incoming config into the ConfigData format
	finalConfig := cliConfig.CLIConfig{
		User:                  jwtData.Payload.Email,
		Token:                 jwtData.Token,
		RefreshToken:          jwtData.Refreshtoken,
		TokenExpiresIn:        time.Unix(jwtData.TokenExpiresIn, 0),
		RefreshTokenExpiresIn: jwtData.RefreshExpiresIn,
	}

	err = finalConfig.WriteFile()
	if err != nil {
		pterm.Error.Println("Error in writing authentication data to a file. Exiting...")
		return err
	}

	return nil
}
