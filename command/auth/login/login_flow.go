package login

import (
	"fmt"
	"time"

	"github.com/cli/browser"
	"github.com/deepsourcelabs/cli/api"
	"github.com/deepsourcelabs/cli/internal/config"
	"github.com/pelletier/go-toml"
)

type ConfigData struct {
	User                string    `toml:"user"`
	JWT                 string    `toml:"token"`
	RefreshToken        string    `toml:"refresh_token"`
	RefreshTokenExpiry  int64     `toml:"refresh_token_expiry"`
	RefreshTokenSetDate int64     `toml:"refresh_token_set_date"`
	JWTExpiry           time.Time `toml:"token_expiry"`
	OrigIAT             int64     `toml:"orig_iat"`
}

func (o *LoginOptions) startLoginFlow() error {

	// Creating a GraphQL client
	apiClient := api.NewDSClient(o.ConfigFactory.HostName, o.Config.JWT)

	// Send a mutation to register device and get the device code
	deviceCode, userCode, verificationURI, expiresIn, interval, err := api.GetDeviceCode(apiClient)

	if err != nil {
		return err
	}

	// Having received the device code, open the browser at verificationURI
	// Print the user code and the permission to open browser at verificationURI
	fmt.Printf("Please copy your one-time code: %s\n", userCode)
	fmt.Printf("Press enter to open deepsource.io in your browser...")
	fmt.Scanln()

	err = browser.OpenURL(verificationURI)
	if err != nil {
		return err
	}

	// // Keep polling the mutation at a certain interval till "expiresIn"
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	pollStartTime := time.Now()

	func() {
		for {
			select {
			case <-ticker.C:
				// do stuff
				o.Config.JWT, o.Config.RefreshToken, o.Config.RefreshTokenExpiry = api.GetJWT(apiClient, deviceCode)
				if o.Config.JWT != "" {
					o.AuthTimedOut = false
					return
				}

				// Check auth polling time out
				timeElapsed := time.Since(pollStartTime)
				if timeElapsed >= time.Duration(expiresIn)*time.Second {
					o.AuthTimedOut = true
					return
				}
			}
		}
	}()

	// Check if its a success poll or the auth timed out
	if o.AuthTimedOut {
		fmt.Println("Authentication timed out. Exiting...")
		return fmt.Errorf("Authentication timed out")
	}

	// Parse the JWT and get the user email, token expiry and origIAT
	// o.getMetaFromToken()

	authConfig := ConfigData{
		User:                userCode,
		JWT:                 o.Config.JWT,
		RefreshToken:        o.Config.RefreshToken,
		RefreshTokenExpiry:  o.Config.RefreshTokenExpiry,
		RefreshTokenSetDate: time.Now().Unix(),
		JWTExpiry:           time.Time{},
		OrigIAT:             0,
	}

	tomlConfig, err := toml.Marshal(authConfig)
	if err != nil {
		fmt.Println("Error in parsing the authentication data in the TOML format. Exiting ...")
		return err
	}

	err = config.WriteConfigToFile(string(tomlConfig))
	if err != nil {
		fmt.Println("Error in writing authentication data to a file. Exiting...")
		return err
	}

	return nil
}
