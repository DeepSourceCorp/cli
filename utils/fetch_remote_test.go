package utils

import (
	"fmt"
	"os"
	"os/exec"
	"testing"
)

var testRemotes = "origin	https://username:ghp_pat@github.com/username/repo\norigin	https://username:ghp_pat@github.com/username/repo"

var testRemoteURL = "https://github.com/username/repo"

func TestShellRemotes(t *testing.T) {
	if os.Getenv("GO_TEST_PROCESS") != "1" {
		return
	}
	fmt.Fprintln(os.Stdout, testRemotes)
	os.Exit(0)
}

func TestShellRemoteURL(t *testing.T) {
	if os.Getenv("GO_TEST_PROCESS") != "1" {
		return
	}
	fmt.Fprint(os.Stdout, testRemoteURL)
	os.Exit(0)
}

// returns a mock command for getting git remotes
func mockRemotes(command string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestShellRemotes", "--", command}
	cs = append(cs, args...)
	cmd := exec.Command(os.Args[0], cs...)
	cmd.Env = []string{"GO_TEST_PROCESS=1"}
	return cmd
}

// returns a mock command for getting git remote URL
func mockRemoteURL(command string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestShellRemoteURL", "--", command}
	cs = append(cs, args...)
	cmd := exec.Command(os.Args[0], cs...)
	cmd.Env = []string{"GO_TEST_PROCESS=1"}
	return cmd
}

func TestListRemotes(t *testing.T) {
	remoteMap, err := ListRemotes(mockRemotes, mockRemoteURL)
	if err != nil {
		t.Error(err)
		return
	}

	got := remoteMap["origin"][0]
	expected := "username"

	if got != expected {
		t.Errorf("got: %s; expected: %s\n", got, expected)
	}
}
