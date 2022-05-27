package login

import (
	"context"
	"fmt"
	"os"
	"os/user"
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

	// Fetch the PAT using the device registration resonse
	var tokenData *auth.PAT
	tokenData, opts.AuthTimedOut, err = fetchPAT(ctx, deviceRegistrationResponse)
	if err != nil {
		return err
	}

	// Check if it was a success poll or the Auth timed out
	if opts.AuthTimedOut {
		return fmt.Errorf("Authentication timed out")
	}

	// Storing the useful data for future reference and usage
	// in a global config object (Cfg)
	cfg.User = tokenData.User.Email
	cfg.Token = tokenData.Token
	cfg.SetTokenExpiry(tokenData.Expiry)

	// Having stored the data in the global Cfg object, write it into the config file present in the local filesystem
	err = cfg.WriteFile()
	if err != nil {
		return fmt.Errorf("Error in writing authentication data to a file. Exiting...")
	}
	return nil
}

func registerDevice(ctx context.Context) (*auth.Device, error) {
	// Fetching DeepSource client in order to interact with SDK
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
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

func fetchPAT(ctx context.Context, deviceRegistrationData *auth.Device) (*auth.PAT, bool, error) {
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

	// Fetching DeepSource client in order to interact with SDK
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
	if err != nil {
		return nil, authTimedOut, err
	}

	// Keep polling the mutation at a certain interval till the expiry timeperiod
	ticker := time.NewTicker(time.Duration(deviceRegistrationData.Interval) * time.Second)
	pollStartTime := time.Now()

	// Polling for fetching PAT
	func() {
		for range ticker.C {
			tokenData, err = deepsource.Login(ctx, deviceRegistrationData.Code, userDescription)
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
