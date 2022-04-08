package tests

import (
	"context"
	"io/ioutil"
	"log"
	"net/http"
	"reflect"
	"testing"

	analyzers "github.com/deepsourcelabs/cli/deepsource/analyzers/queries"
	"github.com/deepsourcelabs/graphql"
)

// mock client
type Client struct {
	gql   *graphql.Client
	token string
}

// Returns a GraphQL client which can be used to interact with the GQL APIs
func (c Client) GQL() *graphql.Client {
	return c.gql
}

// Returns the token which is required for authentication and thus, interacting with the APIs
func (c Client) GetToken() string {
	return c.token
}

func TestAnalyzers(t *testing.T) {
	t.Run("valid GraphQL request", func(t *testing.T) {
		// create client
		gql := graphql.NewClient("http://localhost:8081")
		c := Client{gql: gql, token: "secret"}

		// perform request
		req := analyzers.AnalyzersRequest{}
		ctx := context.Background()
		_, err := req.Do(ctx, c)
		if err != nil {
			t.Error(err.Error())
		}
	})
}

// a mock GraphQL server for testing
func graphQLAPIMock(w http.ResponseWriter, r *http.Request) {
	req, _ := ioutil.ReadAll(r.Body)

	// Read test graphql request body artifact file
	requestBodyData, err := ioutil.ReadFile("./dummy/request_body.txt")
	if err != nil {
		log.Println(err)
		return
	}

	// Read test graphql success response body artifact file
	successResponseBodyData, err := ioutil.ReadFile("./dummy/success_response_body.json")
	if err != nil {
		log.Println(err)
		return
	}

	// Read test graphql error response body artifact file
	errorResponseBodyData, err := ioutil.ReadFile("./dummy/error_response_body.json")
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
