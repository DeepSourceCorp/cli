package tests

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"reflect"
	"testing"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	analyzers "github.com/deepsourcelabs/cli/deepsource/analyzers/queries"
	"github.com/deepsourcelabs/graphql"
)

type testGraphQLClient struct {
	client *graphql.Client
	token  string
}

func (c *testGraphQLClient) Query(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
	return c.run(ctx, query, vars, result)
}

func (c *testGraphQLClient) Mutate(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error {
	return c.run(ctx, mutation, vars, result)
}

func (c *testGraphQLClient) SetAuthToken(token string) {
	c.token = token
}

func (c *testGraphQLClient) run(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
	req := graphql.NewRequest(query)
	req.Header.Set("Cache-Control", "no-cache")
	if c.token != "" {
		req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", c.token))
	}
	for key, value := range vars {
		req.Var(key, value)
	}
	return c.client.Run(ctx, req, result)
}

func TestAnalyzers(t *testing.T) {
	t.Run("valid GraphQL request", func(t *testing.T) {
		// create client
		gql := graphql.NewClient("http://localhost:8081/analyzer")
		c := &testGraphQLClient{client: gql, token: "secret"}

		// perform request
		var gqlClient graphqlclient.GraphQLClient = c
		req := analyzers.NewAnalyzersRequest(gqlClient)
		ctx := context.Background()
		_, err := req.Do(ctx)
		if err != nil {
			t.Error(err.Error())
		}
	})
}

// a mock GraphQL handler for testing
func mockAnalyzer(w http.ResponseWriter, r *http.Request) {
	req, _ := ioutil.ReadAll(r.Body)

	// Read test graphql request body artifact file
	requestBodyData, err := ioutil.ReadFile("./testdata/analyzer/request_body.txt")
	if err != nil {
		log.Println(err)
		return
	}

	// Read test graphql success response body artifact file
	successResponseBodyData, err := ioutil.ReadFile("./testdata/analyzer/success_response_body.json")
	if err != nil {
		log.Println(err)
		return
	}

	// Read test graphql error response body artifact file
	errorResponseBodyData, err := ioutil.ReadFile("./testdata/analyzer/error_response_body.json")
	if err != nil {
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	if reflect.DeepEqual(requestBodyData, req) {
		w.Write([]byte(successResponseBodyData))
	} else {
		w.Write([]byte(errorResponseBodyData))
	}
}
