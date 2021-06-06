package api

import (
	"context"

	"github.com/shurcooL/graphql"
	"golang.org/x/oauth2"
)

const DefaultReadTimeout = 10
const DefaultConnectTimeout = 1

var client *DSGQLClient

type DSQLClientConfig struct {
	ReadTimeout int
	ConnTimeout int
}

type DSGQLClient struct {
	gqlClient *graphql.Client
	Token     string
}

func NewDSGQLClient(host string, token string, refreshToken string, config *DSQLClientConfig) *DSGQLClient {

	src := oauth2.StaticTokenSource(
		&oauth2.Token{
			AccessToken:  token,
			TokenType:    "JWT",
			RefreshToken: refreshToken,
			// Expiry:       unixTimeUTC,
		},
	)

	httpClient := oauth2.NewClient(context.Background(), src)
	graqphqlClient := graphql.NewClient(host, httpClient)

	return &DSGQLClient{
		gqlClient: graqphqlClient,
		Token:     token,
	}
}

func GetClient(hostname string, token string, refreshToken string) *DSGQLClient {
	return NewDSGQLClient(hostname, token, refreshToken, &DSQLClientConfig{ReadTimeout: DefaultReadTimeout, ConnTimeout: DefaultConnectTimeout})
}

// func getHTTPClient(connTimeOut int, readTimeout int) *http.Client {

// var netTransport = &http.Transport{
//     Dial: (&net.Dialer{
//         Timeout: time.Duration(connTimeOut) * time.Second,
//     }).Dial,
//     TLSHandshakeTimeout: 5 * time.Second,
// }

// var netClient = &http.Client{
//     Timeout:   time.Duration(readTimeout) * time.Second,
//     Transport: netTransport,
// }

// return netClient
// }
