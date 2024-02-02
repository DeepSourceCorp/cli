package report

import (
	"errors"
	"regexp"
)

var (
	ErrInvalidDSN = errors.New("DeepSource | Error | Invalid DSN. Cross verify DEEPSOURCE_DSN value against the settings page of the repository")
)

type DSN struct {
	Protocol string
	Host     string
	Token    string
}

func NewDSN(raw string) (*DSN, error) {

	var dsnPattern = regexp.MustCompile(`^(https?)://([^:@]+)@([^:/]+)`)
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
