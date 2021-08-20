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

// Starts the login flow for the CLI
func (opts *LoginOptions) startLoginFlow(cfg *config.CLIConfig) error {
	// Register the device and get a device code through the response
	ctx := context.Background()
	deviceRegistrationResponse, err := registerDevice(ctx)
	if err != nil {
		return err
	}

	// Print the user code and the permission to open browser at verificationURI
	c := color.New(color.FgCyan, color.Bold)
	c.Printf("Please copy your one-time code: %s\n", deviceRegistrationResponse.UserCode)
	c.Printf("Press enter to open deepsource.io in your browser...")
	fmt.Scanln()

	// Having received the user code, open the browser at verificationURIComplete
	err = browser.OpenURL(deviceRegistrationResponse.VerificationURIComplete)
	if err != nil {
		return err
	}

	// Fetch the JWT using the device registration resonse
	var jwtData *auth.JWT
	jwtData, opts.AuthTimedOut, err = fetchJWT(ctx, deviceRegistrationResponse)
	if err != nil {
		return err
	}

	// Check if it was a success poll or the Auth timed out
	if opts.AuthTimedOut {
		return fmt.Errorf("Authentication timed out")
	}

	// Storing the useful data for future reference and usage
	// in a global config object (Cfg)
	cfg.User = jwtData.Payload.Email
	cfg.Token = jwtData.Token
	cfg.RefreshToken = jwtData.Refreshtoken
	cfg.RefreshTokenExpiresIn = time.Unix(jwtData.RefreshExpiresIn, 0)
	cfg.SetTokenExpiry(jwtData.Payload.Exp)

	// Having stored the data in the global Cfg object, write it into the config file present in the local filesystem
	err = cfg.WriteFile()
	if err != nil {
		return fmt.Errorf("Error in writing authentication data to a file. Exiting...")
	}
	return nil
}

func registerDevice(ctx context.Context) (*auth.Device, error) {
	// Fetching DeepSource client in order to interact with SDK
	deepsource, err := deepsource.New()
	if err != nil {
		return nil, err
	}

	// Send a mutation to register device and get the device code
	res, err := deepsource.RegisterDevice(ctx)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func fetchJWT(ctx context.Context, deviceRegistrationData *auth.Device) (*auth.JWT, bool, error) {
	var jwtData *auth.JWT
	var err error
	authTimedOut := true

	// Fetching DeepSource client in order to interact with SDK
	deepsource, err := deepsource.New()
	if err != nil {
		return nil, authTimedOut, err
	}

	// Keep polling the mutation at a certain interval till the expiry timeperiod
	ticker := time.NewTicker(time.Duration(deviceRegistrationData.Interval) * time.Second)
	pollStartTime := time.Now()

	// Polling for fetching JWT
	func() {
		for {
			select {
			case <-ticker.C:
				// Fetch JWT
				jwtData, err = deepsource.Login(ctx, deviceRegistrationData.Code)
				if err == nil {
					authTimedOut = false
					return
				}

				// Check if polling timed-out
				timeElapsed := time.Since(pollStartTime)
				if timeElapsed >= time.Duration(deviceRegistrationData.ExpiresIn)*time.Second {
					authTimedOut = true
					return
				}
			}
		}
	}()

	return jwtData, authTimedOut, nil
}
