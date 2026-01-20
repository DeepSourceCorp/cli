package tests

import (
	"context"
	"io/ioutil"
	"log"
	"net/http"
	"reflect"
	"testing"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	userquery "github.com/deepsourcelabs/cli/deepsource/user/queries"
	"github.com/deepsourcelabs/graphql"
)

func TestViewer(t *testing.T) {
	t.Run("valid GraphQL request", func(t *testing.T) {
		gql := graphql.NewClient("http://localhost:8081/viewer")
		c := &testGraphQLClient{client: gql, token: "secret"}

		var gqlClient graphqlclient.GraphQLClient = c
		req := userquery.NewViewerRequest(gqlClient)
		ctx := context.Background()
		_, err := req.Do(ctx)
		if err != nil {
			t.Error(err.Error())
		}
	})
}

func mockViewer(w http.ResponseWriter, r *http.Request) {
	req, _ := ioutil.ReadAll(r.Body)

	requestBodyData, err := ioutil.ReadFile("./testdata/viewer/request_body.txt")
	if err != nil {
		log.Println(err)
		return
	}

	successResponseBodyData, err := ioutil.ReadFile("./testdata/viewer/success_response_body.json")
	if err != nil {
		log.Println(err)
		return
	}

	errorResponseBodyData, err := ioutil.ReadFile("./testdata/viewer/error_response_body.json")
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
