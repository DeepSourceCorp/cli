package publish

import (
	"context"
	"encoding/base64"
	"encoding/json"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"

	"github.com/deepsourcelabs/cli/config"
)

type DockerClient struct {
	Client *client.Client
}

// Return the auth config for the DeepSource registry.
// This config contains the base64 encoded basic auth
// credentials for identifying the request on the token
// server.
func (cli *DockerClient) GetRegistryAuthConfig() (string, error) {
	authConfig, err := json.Marshal(types.AuthConfig{
		Username: config.Cfg.User,
		Password: config.Cfg.Token,
	})
	if err != nil {
		return "", err
	}

	return base64.URLEncoding.EncodeToString(authConfig), nil
}

// Push the image corresponding to the passed `image` name.
// The `image` param should be the full name of the image,
// with the registry name prepended:
// `registry.deepsource.io/namespace/analyzer:version`
func (cli *DockerClient) Push(ctx context.Context, image string) error {
	authConfig, err := cli.GetRegistryAuthConfig()
	if err != nil {
		return err
	}

	_, err = cli.Client.ImagePush(ctx, image, types.ImagePushOptions{
		RegistryAuth: authConfig,
	})
	if err != nil {
		return err
	}

	return nil
}
