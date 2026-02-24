package debug

import (
	"fmt"
	"os"
	"time"
)

var Enabled = os.Getenv("DEBUG") == "1"

func Log(format string, args ...any) {
	if !Enabled {
		return
	}
	ts := time.Now().Format("15:04:05.000")
	msg := fmt.Sprintf(format, args...)
	fmt.Fprintf(os.Stderr, "[DEBUG %s] %s\n", ts, msg)
}
