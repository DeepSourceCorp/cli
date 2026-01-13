package auth

import (
	"context"
	"fmt"

	"github.com/deepsourcelabs/cli/deepsource/graphqlclient"
	"github.com/deepsourcelabs/cli/deepsource/auth"
)

// GraphQL mutation to register Device get a device code
const registerDeviceMutation = `mutation register {
	registerDevice(input:{}) {
		deviceCode
		userCode
		verificationUri
		verificationUriComplete
		expiresIn
		interval
	}
}`

type RegisterDeviceRequest struct {
	client graphqlclient.GraphQLClient
}

type RegisterDeviceResponse struct {
	auth.Device `json:"registerDevice"`
}

func NewRegisterDeviceRequest(client graphqlclient.GraphQLClient) *RegisterDeviceRequest {
	return &RegisterDeviceRequest{client: client}
}

func (r *RegisterDeviceRequest) Do(ctx context.Context) (*auth.Device, error) {
	var res RegisterDeviceResponse
	if err := r.client.Mutate(ctx, registerDeviceMutation, nil, &res); err != nil {
		return nil, fmt.Errorf("register device: %w", err)
	}

	return &res.Device, nil
}
