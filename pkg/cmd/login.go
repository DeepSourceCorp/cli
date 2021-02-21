package cmd

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"sync"

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

			serverPort, err := findFreePort(defaultPort)
			if err != nil {
				log.Fatalln("Failed to find an available port. Error:", err)
			}

			// `state` calculation
			state, _ := calcState(20)

			// get URL
			url := makeURL(serverPort, state)
			fmt.Println("URL - ", url)

			// bind local server to receive token
			listener, err := bindLocalServer(serverPort)
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
			openBrowser(url)
			wg.Wait()
			if recState == state {
				saveAuthToken(token)
			} else {
				log.Fatalln("Error: States don't match. Authentication Failed.")
			}
		},
	}
	return cmd
}

// Opens the browser at the provided URL
func openBrowser(url string) {
	var err error

	fmt.Printf("Opening the default browser for authentication....\n")
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	if err != nil {
		log.Fatal(err)
	}
}

func findFreePort(port string) (string, error) {
	listener, err := net.Listen("tcp4", ":"+port)
	if err == nil {
		return port, nil
	} else {
		log.Println(err)
	}

	// if the default port is not available, let the os give us a random port
	listener, err = net.Listen("tcp4", "127.0.0.1:0")
	if err != nil {
		log.Fatalln("Failed to find a port to run localserver on. Error:", err)
	}
	defer listener.Close()

	addr := listener.Addr().String()
	_, portString, err := net.SplitHostPort(addr)
	return portString, nil
}

func calcState(length int) (string, error) {
	b := make([]byte, length/2)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func makeURL(port string, state string) string {
	return fmt.Sprintf("https://deepsource.io/login/cli?state=%s&redirect_uri=https://localhost:%v", state, port)
}

func bindLocalServer(port string) (net.Listener, error) {
	localhostURL := fmt.Sprintf("127.0.0.1:%v", port)
	listener, err := net.Listen("tcp4", localhostURL)
	if err != nil {
		return nil, err
	}

	return listener, nil
}

func saveAuthToken(token string) {
	filePath := "~/.deepsource/token.txt"
	if runtime.GOOS == "windows" {
		// TODO: Figure this path out
		filePath = "somepath"
	}
	f, err := os.Create(filePath)
	if err != nil {
		log.Fatalln("File not created. Error:", err)
	}
	defer f.Close()
	_, err = f.WriteString(token)
	if err != nil {
		log.Fatalln("Contents not written in file. Error:", err)
	}
}
