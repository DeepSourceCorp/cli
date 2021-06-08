package api

import (
	"github.com/deepsourcelabs/graphql"
)

const DefaultReadTimeout = 10
const DefaultConnectTimeout = 1

// var client *DSGQLClient

// type DSQLClientConfig struct {
//     ReadTimeout int
//     ConnTimeout int
// }

type DSClient struct {
	gqlClient *graphql.Client
	Token     string
}

func NewDSClient(host string, token string) *DSClient {

	gq := graphql.NewClient(host)

	return &DSClient{
		gqlClient: gq,
		Token:     token,
	}
}
