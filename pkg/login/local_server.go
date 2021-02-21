package login

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"sync"
)

// Receive the code in the local server.
// Return the auth code on receiving
// The auth code will then be exchanged for auth token
func ReceiveAuthCode(port string) (string, string, string, error) {
	var (
		authCode     string
		state        string
		refreshToken string
	)
	// bind local server to receive token
	listener, err := BindLocalServer(port)
	if err != nil {
		log.Fatalln("Failed to bind local server")
	}

	var wg sync.WaitGroup
	wg.Add(1)

	// serve the local server in a goroutine
	go func() {
		log.Println("Local server started at port ", port)
		http.Serve(listener, nil)
	}()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Redirect Received")
		params := r.URL.Query()
		fmt.Println("Received Params - ", params)
		authCode = params.Get("code")
		state = params.Get("state")
		refreshToken = params.Get("refresh_token")
		listener.Close()
		wg.Done()
	})

	wg.Wait()
	return authCode, refreshToken, state, nil
}

func BindLocalServer(port string) (net.Listener, error) {
	localhostURL := fmt.Sprintf("127.0.0.1:%v", port)
	listener, err := net.Listen("tcp4", localhostURL)
	if err != nil {
		return nil, err
	}

	return listener, nil
}
