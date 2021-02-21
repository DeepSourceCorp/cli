package cmd

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/deepsourcelabs/cli/pkg/login"
	"github.com/spf13/cobra"
)

// loginCmd represents the login command
func newLoginCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Authenticate to DeepSource using OAuth.",
		Run: func(cmd *cobra.Command, args []string) {

			// Login Workflow
			// 1. Check the status if the user is already logged in or not
			// 2. If yes, displays the message that the user is already logged in.
			// 3. If no :
			// 		1. Find a free port. Default - 8080
			//      2. Calculate state
			// 		3. Open the browser at `https://deepsource.io/login/cli/state=<state>&redirect_uri=http://localhost:<port>`
			// 		4. Asgard does the magic required.
			// 		5. Get the query params - `auth_token` and `state`
			// 		6. Match the `state` to verify.
			// 		7. If verified, save the received `auth_token` in `~/.deepsource` and show Logged in, else show Error message

			// TODO: Check the status of user auth (Not planned as of now)
			// checkAuthStatus()

			var token string
			var recState string
			var serverPort string

			wg := new(sync.WaitGroup)
			defaultPort := "8080"

			serverPort, err := login.FindFreePort(defaultPort)
			if err != nil {
				log.Fatalln("Failed to find an available port. Error:", err)
			}

			// `state` calculation
			state, _ := login.CalcState(20)

			// get URL
			url := login.MakeURL(serverPort, state)
			fmt.Println("URL - ", url)

			// bind local server to receive token
			listener, err := login.BindLocalServer(serverPort)
			if err != nil {
				log.Fatalln("Failed to bind local server")
			}

			wg.Add(1)
			// serve the local server in a goroutine
			go func() {
				fmt.Println("Serving http in a goroutine")
				http.Serve(listener, nil)
			}()

			http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
				fmt.Println("Redirect Received")
				params := r.URL.Query()
				fmt.Println("Received Params - ", params)
				token = params.Get("code")
				recState = params.Get("state")
				listener.Close()
				wg.Done()
			})

			// Open Browser for authentication at the respective URL
			login.OpenBrowser(url)
			wg.Wait()
			if recState == state {
				login.SaveAuthToken(token)
			} else {
				log.Fatalln("Error: States don't match. Authentication Failed.")
			}
		},
	}
	return cmd
}
