// DeepSource SDK
package deepsource

import (
	"context"

	analyzers "github.com/deepsourcelabs/cli/deepsource/analyzers/queries"
	"github.com/deepsourcelabs/cli/deepsource/auth"
	authmut "github.com/deepsourcelabs/cli/deepsource/auth/mutations"
	transformers "github.com/deepsourcelabs/cli/deepsource/transformers/queries"
	"github.com/deepsourcelabs/graphql"
)

const host = "http://localhost:8000/graphql/"

type Client struct {
	gql   *graphql.Client
	token string
}

func (c Client) GQL() *graphql.Client {
	return c.gql
}

func (c Client) GetToken() string {
	return c.token
}

func New() *Client {
	gql := graphql.NewClient(host)
	return &Client{
		gql: gql,
	}
}

func (c Client) RegisterDevice(ctx context.Context) (*auth.Device, error) {
	req := authmut.RegisterDeviceRequest{}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) Login(ctx context.Context, deviceCode string) (*auth.JWT, error) {
	req := authmut.RequestJWTRequest{

		Params: authmut.RequestJWTParams{
			DeviceCode: deviceCode,
		},
	}

	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) RefreshAuthCreds(ctx context.Context, refreshToken string) (*auth.RefreshAuthResponse, error) {
	req := authmut.RefreshTokenRequest{
		Params: authmut.RefreshTokenParams{
			RefreshToken: refreshToken,
		},
	}
	res, err := req.Do(ctx, c)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c Client) GetSupportedAnalyzers(ctx context.Context) ([]string, []string, []string, map[string]string, error) {

	req := analyzers.AnalyzersRequest{}
	names, shortCodes, analyzersMeta, analyzersMap, err := req.Do(ctx, c)
	if err != nil {
		return nil, nil, nil, nil, err
	}
	return names, shortCodes, analyzersMeta, analyzersMap, nil
}

func (c Client) GetSupportedTransformers(ctx context.Context) ([]string, []string, map[string]string, error) {

	req := transformers.TransformersRequest{}
	names, shortCodes, transformersMap, err := req.Do(ctx, c)
	if err != nil {
		return nil, nil, nil, err
	}
	return names, shortCodes, transformersMap, nil
}
