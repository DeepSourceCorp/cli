package report

import (
	"errors"
	"regexp"

	"github.com/deepsourcelabs/cli/internal/debug"
)

var ErrInvalidDSN = errors.New("Invalid DSN. Expected format: https://token@host. Cross verify DEEPSOURCE_DSN against the repository settings page")

type DSN struct {
	Protocol string
	Host     string
	Token    string
}

func NewDSN(raw string) (*DSN, error) {
	dsnPattern := regexp.MustCompile(`^(https?)://([^:@]+)@([^:/]+(?:\:\d+)?)`)
	matches := dsnPattern.FindStringSubmatch(raw)
	if len(matches) != 4 {
		return nil, ErrInvalidDSN
	}
	d := &DSN{
		Protocol: matches[1],
		Token:    matches[2],
		Host:     matches[3],
	}
	debug.Log("dsn: host=%q token=%s***", d.Host, d.Token[:min(4, len(d.Token))])
	return d, nil
}
