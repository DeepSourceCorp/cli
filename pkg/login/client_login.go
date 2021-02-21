package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"
	"runtime"
)

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
