package login

import (
	"fmt"
	"time"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/api"
	cliConfig "github.com/deepsourcelabs/cli/internal/config"
	"github.com/fatih/color"
	"github.com/pterm/pterm"
)

func (opts *LoginOptions) startLoginFlow() error {

	// Send a mutation to register device and get the device code
	deviceCode, userCode, verificationURI, expiresIn, interval, err := api.GetDeviceCode(opts.graphqlClient)
	if err != nil {
		return err
	}

	// Having received the device code, open the browser at verificationURI
	// Print the user code and the permission to open browser at verificationURI
	c := color.New(color.FgCyan, color.Bold)
	c.Printf("Please copy your one-time code: %s\n", userCode)
	c.Printf("Press enter to open deepsource.io in your browser...")
	fmt.Scanln()

	err = browser.OpenURL(verificationURI)
	if err != nil {
		return err
	}

	// // Keep polling the mutation at a certain interval till "expiresIn"
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	pollStartTime := time.Now()
	var jwtData *api.FetchJWTResponse

	// Polling for JWT
	func() {
		for {
			select {
			case <-ticker.C:
				// do stuff
				jwtData, _ = api.GetJWT(opts.graphqlClient, deviceCode)
				if jwtData.Requestjwt.Token != "" {
					opts.AuthTimedOut = false
					return
				}

				// Check auth polling time out
				timeElapsed := time.Since(pollStartTime)
				if timeElapsed >= time.Duration(expiresIn)*time.Second {
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
	finalConfig := cliConfig.ConfigData{
		User:                jwtData.Requestjwt.Payload.Email,
		Token:               jwtData.Requestjwt.Token,
		TokenExpiry:         jwtData.Requestjwt.Payload.Exp,
		RefreshToken:        jwtData.Requestjwt.Refreshtoken,
		OrigIAT:             jwtData.Requestjwt.Payload.Origiat,
		RefreshTokenExpiry:  jwtData.Requestjwt.Refreshexpiresin,
		RefreshTokenSetTime: time.Now().Unix(),
	}

	err = cliConfig.WriteConfigToFile(finalConfig)
	if err != nil {
		pterm.Error.Println("Error in writing authentication data to a file. Exiting...")
		return err
	}

	return nil
}
