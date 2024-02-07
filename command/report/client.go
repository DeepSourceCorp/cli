package report

import (
	"context"
	"crypto/tls"
	"net/http"
	"time"

	"github.com/deepsourcelabs/graphql"
)

type Client struct {
	gql *graphql.Client
}

func NewGraphQLClient(url string, skipCertificateVerification bool) *Client {
	httpClient := &http.Client{
		Timeout: time.Second * 60,
	}
	if skipCertificateVerification {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		}
		httpClient.Transport = tr
	}

	gql := graphql.NewClient(url, graphql.WithHTTPClient(httpClient))
	return &Client{gql: gql}
}

const artifactMetadataInputQuery = `query {  
	__type(name: "ArtifactMetadataInput") {
		inputFields {
			name
		}
	}
}`

type InputFields struct {
	Name string `json:"name"`
}

type Type struct {
	InputFields []InputFields `json:"inputFields"`
}

type ArtifactMetadataInputResponse struct {
	Type Type `json:"__type"`
}

func (c *Client) CompressionEnabled() (bool, error) {
	req := graphql.NewRequest(artifactMetadataInputQuery)
	var resp = ArtifactMetadataInputResponse{}

	err := c.gql.Run(context.Background(), req, &resp)
	if err != nil {
		return false, err
	}

	for _, field := range resp.Type.InputFields {
		if field.Name == "compressed" {
			return true, nil
		}
	}
	return false, nil
}

const createArtifactMutationNew = `mutation($input: CreateArtifactInput!) {
	createArtifact(input: $input) {
		ok
		message
		error
	}
}`

const createArtifactMutationOld = `mutation($input: CreateArtifactInput!) {
	createArtifact(input: $input) {
		ok
		error
	}
}`

type CreateArtifactResponse struct {
	CreateArtifact CreateArtifact `json:"createArtifact"`
}

type CreateArtifact struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Ok      bool   `json:"ok"`
}

type CreateArtifactInput struct {
	AccessToken       string      `json:"accessToken"`
	CommitOID         string      `json:"commitOid"`
	ReporterName      string      `json:"reporter"`
	ReporterVersion   string      `json:"reporterVersion"`
	Key               string      `json:"key"`
	Data              string      `json:"data"`
	AnalyzerShortcode string      `json:"analyzer"`
	AnalyzerType      string      `json:"analyzerType,omitempty"`
	Metadata          interface{} `json:"metadata,omitempty"`
}

func (c *Client) SendReportNew(input *CreateArtifactInput) (*CreateArtifactResponse, error) {
	req := graphql.NewRequest(createArtifactMutationNew)
	req.Var("input", input)

	resp := CreateArtifactResponse{}

	err := c.gql.Run(context.Background(), req, &resp)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}

func (c *Client) SendReportOld(input *CreateArtifactInput) (*CreateArtifactResponse, error) {
	req := graphql.NewRequest(createArtifactMutationOld)
	req.Var("input", input)

	resp := CreateArtifactResponse{}

	err := c.gql.Run(context.Background(), req, &resp)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}
