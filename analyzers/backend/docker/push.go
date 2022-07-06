package docker

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/docker/docker/api/types"
)

const imagePushTimeout = 10 * time.Minute

// PushImageToRegistry pushes the Analyzer image to the docker registry post authenticating using the
// credentials passed as arguments.
func (d *DockerClient) PushImageToRegistry(user, token string) (context.CancelFunc, io.ReadCloser, error) {
	ctx, ctxCancelFunc := context.WithTimeout(context.Background(), imagePushTimeout)
	authConfig := types.AuthConfig{
		Username: user,
		Password: token,
	}

	// Encode the authentication config as a JSON.
	encodedJSON, err := json.Marshal(authConfig)
	if err != nil {
		return ctxCancelFunc, nil, err
	}
	// Encode the config to base64.
	authStr := base64.URLEncoding.EncodeToString(encodedJSON)

	// Push the image.
	imagePushRespReader, err := d.Client.ImagePush(ctx, fmt.Sprintf("%s:%s", d.ImageName, d.ImageTag), types.ImagePushOptions{RegistryAuth: authStr})
	if err != nil {
		return ctxCancelFunc, nil, err
	}

	return ctxCancelFunc, imagePushRespReader, nil
}
