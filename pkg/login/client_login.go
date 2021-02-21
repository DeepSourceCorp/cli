package login

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

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"runtime"

	"github.com/deepsourcelabs/cli/pkg/browser"
	"github.com/spf13/cobra"
)

var open = browser.Open
var canOpenBrowser = browser.CanOpenBrowser

func Login(cmd *cobra.Command, args []string) {

	var recState string
	var serverPort string

	defaultPort := "8080"

	serverPort, err := FindFreePort(defaultPort)
	if err != nil {
		log.Fatalln("Failed to find an available port. Error:", err)
	}

	// `state` calculation
	state, _ := CalcState(20)
	// get URL
	url := MakeURL(serverPort, state)

	// Open Browser for authentication at the respective URL
	OpenBrowser(url)

	// Receive authorization code, refresh token in a local server
	authCode, refreshToken, recvState, err := ReceiveAuthCode(serverPort)
	if recvState != state {
		log.Fatalln("The incoming state doesn't match with the sent state. Danger of CSRF.")
	}

	// TODO: Send another request to asgard (For exchanging the authCode with a JWT and store it locally)

	// After exchanging, save the JSON web-token and refresh-token locallly
	// Send the data to be saved and filename as args to SaveAuthToken function
	// SaveTokens(jsonWT, refreshToken)
}

func FindFreePort(port string) (string, error) {
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

func CalcState(length int) (string, error) {
	b := make([]byte, length/2)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// Frame the URL to open browser at
func MakeURL(port string, state string) string {
	return fmt.Sprintf("https://deepsource.io/login/cli?state=%s&redirect_port=%s", state, port)
}

// Opens the browser at the provided URL
func OpenBrowser(url string) {
	if isSSH() || !canOpenBrowser() {
		fmt.Printf("To authenticate with DeepSource, please go to: %s\n", url)
		// TODO: Add spinner

	} else {
		var input io.Reader
		input = os.Stdin
		fmt.Printf("Press Enter to open the browser (^C to quit)")
		fmt.Fscanln(input)

		// TODO: Add loading spinner here

		err := open(url)
		if err != nil {
			fmt.Println("Failed to open browser, please go to %s manually.", url)
			// TODO: Handle the spinner action here
		}
	}
}

// Check SSH
func isSSH() bool {
	if os.Getenv("SSH_TTY") != "" || os.Getenv("SSH_CONNECTION") != "" || os.Getenv("SSH_CLIENT") != "" {
		return true
	}
	return false
}

func SaveAuthToken(jsonWebToken string, refreshToken string) {
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
	_, err = f.WriteString(jsonWebToken)
	if err != nil {
		log.Fatalln("Contents not written in file. Error:", err)
	}
}
