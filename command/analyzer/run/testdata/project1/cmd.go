package main

import (
	"bytes"
	"io"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"
)

func runCmd(command string, args []string, env []string, cmdDir string) (string, string, error) {
	cmd := exec.Command(command, args...)
	cmd.Dir = cmdDir
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, env...)

	var stdoutBuf, stderrBuf bytes.Buffer
	stdoutIn, _ := cmd.StdoutPipe()
	stderrIn, _ := cmd.StderrPipe()

	stdout := io.MultiWriter(os.Stdout, &stdoutBuf)
	stderr := io.MultiWriter(os.Stderr, &stderrBuf)

	startTime := time.Now()

	err := cmd.Start()
	if err != nil {
		return string(stdoutBuf.Bytes()), string(stderrBuf.Bytes()), err
	}

	log.Println("==> EXEC COMMAND " + command)
	log.Println("-> ARGS: " + strings.Join(args[:], " "))
	log.Println("-> DIR: " + cmdDir)
	log.Println("-> STDOUT/STDERR: ..")

	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		_, _ = io.Copy(stdout, stdoutIn)
		wg.Done()
	}()

	_, _ = io.Copy(stderr, stderrIn)
	wg.Wait()

	err = cmd.Wait()

	if err != nil {
		log.Println("-> ERROR: ", err.Error())
		if exitError, ok := err.(*exec.ExitError); ok {
			log.Println("-> EXIT CODE: ", exitError.ExitCode())

			log.Println("-> TIME TAKEN: ", time.Now().Sub(startTime)/time.Millisecond)
			log.Println("==> END EXEC COMMAND " + command + "\n")

			return string(stdoutBuf.Bytes()), string(stderrBuf.Bytes()), err
		}
	}

	log.Println("-> TIME TAKEN: ", time.Now().Sub(startTime)/time.Millisecond)
	log.Println("=> END EXEC COMMAND " + command + "\n")

	if bytes.Compare(stdoutBuf.Bytes(), stderrBuf.Bytes()) == 0 {
		log.Println("Both stdout and stderr have same value")
	}

	return string(stdoutBuf.Bytes()), string(stderrBuf.Bytes()), nil
}

func ExampleOpenFile() {
	f, err := os.OpenFile("notes.txt", os.O_RDWR|os.O_CREATE, 0755)
	if err != nil {
		log.Fatal(err)
	}

	if err := f.Close(); err != nil {
		log.Fatal(err)
	}
}

func createTempFile() {
	tmpFile, _ := os.Create("emptyFile.txt")
	log.Println(tmpFile)
}

func ExampleTempFile() {
	err := ioutil.WriteFile("/tmp/demo-go", []byte("deepsource-for-go"), 0644)
	if err != nil {
		panic(err)
	}
}

func ExampleCreate() {
	f, _ := os.Create("exampe.txt")
	f.Close()
}

func EmptyPath(path string) bool {
	if len(path) == 0 {
		return true
	}
	return false
}
