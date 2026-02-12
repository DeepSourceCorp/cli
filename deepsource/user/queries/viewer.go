package user

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	dsuser "github.com/deepsourcelabs/cli/deepsource/user"
)

// GraphQL query to fetch the authenticated user.
const viewerQuery = `
{
  viewer {
    id
    firstName
    lastName
    email
    accounts {
      edges {
        node {
          id
          login
          type
          vcsProvider
        }
      }
    }
  }
}`

type ViewerRequest struct {
	client graphqlclient.GraphQLClient
}

type viewerResponse struct {
	Viewer struct {
		ID        string `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
		Accounts  struct {
			Edges []struct {
				Node struct {
					ID          string `json:"id"`
					Login       string `json:"login"`
					Type        string `json:"type"`
					VCSProvider string `json:"vcsProvider"`
				} `json:"node"`
			} `json:"edges"`
		} `json:"accounts"`
	} `json:"viewer"`
}

func NewViewerRequest(client graphqlclient.GraphQLClient) *ViewerRequest {
	return &ViewerRequest{client: client}
}

func (r *ViewerRequest) Do(ctx context.Context) (*dsuser.User, error) {
	var respData viewerResponse
	if err := r.client.Query(ctx, viewerQuery, nil, &respData); err != nil {
		return nil, fmt.Errorf("Fetch viewer: %w", err)
	}

	user := &dsuser.User{
		ID:        respData.Viewer.ID,
		FirstName: respData.Viewer.FirstName,
		LastName:  respData.Viewer.LastName,
		Email:     respData.Viewer.Email,
	}
	if len(respData.Viewer.Accounts.Edges) > 0 {
		user.Accounts = make([]dsuser.Account, 0, len(respData.Viewer.Accounts.Edges))
		for _, edge := range respData.Viewer.Accounts.Edges {
			user.Accounts = append(user.Accounts, dsuser.Account{
				ID:          edge.Node.ID,
				Login:       edge.Node.Login,
				Type:        edge.Node.Type,
				VCSProvider: edge.Node.VCSProvider,
			})
		}
	}
	return user, nil
}
