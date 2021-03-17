package cmd

import (
	"bytes"
	"io"
	"log"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"
)

func runCmd(command string, args []string, cmdDir string) (string, string, error) {
	cmd := exec.Command(command, args...)
	cmd.Dir = cmdDir

	var stdoutBuf, stderrBuf bytes.Buffer
	stdoutIn, _ := cmd.StdoutPipe()
	stderrIn, _ := cmd.StderrPipe()

	stdout := io.MultiWriter(os.Stdout, &stdoutBuf)
	stderr := io.MultiWriter(os.Stderr, &stderrBuf)

	startTime := time.Now()

	err := cmd.Start()
	if err != nil {
		return stdoutBuf.String(), stderrBuf.String(), err
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

			log.Println("-> TIME TAKEN: ", time.Since(startTime)/time.Millisecond)
			log.Println("==> END EXEC COMMAND " + command + "\n")

			return stdoutBuf.String(), stderrBuf.String(), err
		}
	}

	log.Println("-> TIME TAKEN: ", time.Since(startTime)/time.Millisecond)
	log.Println("=> END EXEC COMMAND " + command + "\n")

	return stdoutBuf.String(), stderrBuf.String(), nil
}
