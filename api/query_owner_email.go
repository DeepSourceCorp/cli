package api

import (
	"context"

	"github.com/shurcooL/graphql"
)

func GetRepoActiveStatus(client *DSGQLClient) (string, error) {

	var query struct {
		Viewer struct {
			Email graphql.String
		}
	}

	gq := client.gqlClient
	err := gq.Query(context.Background(), &query, nil)
	if err != nil {
		return "", err
	}

	return string(query.Viewer.Email), nil
}
