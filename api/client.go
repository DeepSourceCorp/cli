package api

import (
	"net"
	"net/http"
	"time"

	"github.com/shurcooL/graphql"
)

const DefaultReadTimeout = 10
const DefaultConnectTimeout = 1

var client *DSGQLClient

type DSQLClientConfig struct {
	ReadTimeout int
	ConnTimeout int
}

type DSGQLClient struct {
	Client *graphql.Client
	Token  string
}

func NewDSGQLClient(host string, token string, config *DSQLClientConfig) *DSGQLClient {
	httpClient := getHTTPClient(config.ConnTimeout, config.ReadTimeout)
	graqphqlClient := graphql.NewClient(host, httpClient)
	return &DSGQLClient{
		Client: graqphqlClient,
		Token:  token,
	}
}

func GetClient(hostname string, token string) *DSGQLClient {
	return NewDSGQLClient(hostname, token, &DSQLClientConfig{ReadTimeout: DefaultReadTimeout, ConnTimeout: DefaultConnectTimeout})
}

func getHTTPClient(connTimeOut int, readTimeout int) *http.Client {

	var netTransport = &http.Transport{
		Dial: (&net.Dialer{
			Timeout: time.Duration(connTimeOut) * time.Second,
		}).Dial,
		TLSHandshakeTimeout: 5 * time.Second,
	}

	var netClient = &http.Client{
		Timeout:   time.Duration(readTimeout) * time.Second,
		Transport: netTransport,
	}

	return netClient
}

// // To use it - gql := graphQLClient("host",client.http)
// func GraphQLClient(host string) *graphql.Client {
//     return graphql.NewClient(host, nil)
// }
