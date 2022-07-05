package docker

import (
	"context"
	"io"

	"github.com/docker/docker/api/types"
)

// PullImage pulls an image from a registry.
func (d *DockerClient) PullImage(imageName string) (context.CancelFunc, io.ReadCloser, error) {
	ctx, ctxCancelFunc := context.WithTimeout(context.Background(), buildTimeout)

	reader, err := d.Client.ImagePull(ctx, imageName, types.ImagePullOptions{})
	if err != nil {
		ctxCancelFunc()
		return ctxCancelFunc, nil, err
	}

	return ctxCancelFunc, reader, nil
}
