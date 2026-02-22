package report

import (
	"errors"
	"regexp"
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
	return &DSN{
		Protocol: matches[1],
		Token:    matches[2],
		Host:     matches[3],
	}, nil
}
