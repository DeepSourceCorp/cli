package docker

import (
	"context"
	"fmt"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	v1 "github.com/opencontainers/image-spec/specs-go/v1"
)

func (d *DockerClient) StartDockerContainer() {
	// vol := map[string]struct{}{"/code": {}}
	// Prepare the container config
	config := container.Config{
		Image: fmt.Sprintf("%s:%s", d.ImageName, d.ImageTag),
		Cmd:   []string{"ls", "/code"},
		// Volumes: vol,
	}

	hostConfig := container.HostConfig{
		Binds: []string{"/Users/phoenix/hermes:/code"},
	}

	networkConfig := network.NetworkingConfig{}
	platform := v1.Platform{
		Architecture: "amd64",
		OS:           "linux",
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*120)
	defer cancel()
	res, err := d.Client.ContainerCreate(ctx, &config, &hostConfig, &networkConfig, &platform, "test-again-pls")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(res)

	containerOpts := types.ContainerStartOptions{}
	err = d.Client.ContainerStart(ctx, res.ID, containerOpts)
	if err != nil {
		fmt.Println(err)
	}

	// Start the container
}
