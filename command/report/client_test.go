package report

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestClient_CompressionEnabled(t *testing.T) {
	tests := []struct {
		name        string
		response    string
		responseErr bool
		want        bool
		wantErr     bool
	}{
		{
			name:     "compression enabled",
			response: `{"data":{"__type":{"inputFields":[{"name":"compressed"}]}}}`,
			want:     true,
			wantErr:  false,
		},
		{
			name:     "compression disabled",
			response: `{"data":{"__type":{"inputFields":[{"name":"not_compressed"}]}}}`,
			want:     false,
			wantErr:  false,
		},
		{
			name:        "error",
			responseErr: true,
			want:        false,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if tt.responseErr {
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				if _, err := w.Write([]byte(tt.response)); err != nil {
					t.Error(err)
				}
			}))

			client := NewGraphQLClient(server.URL, false)
			got, err := client.CompressionEnabled()
			if (err != nil) != tt.wantErr {
				t.Errorf("Client.CompressionEnabled() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Client.CompressionEnabled() = %v, want %v", got, tt.want)
			}
		})
	}
}

type artifactRequest struct {
	Query     string `json:"query"`
	Variables struct {
		Input *CreateArtifactInput `json:"input"`
	}
}

type artifactResponse struct {
	Data struct {
		CreateArtifact CreateArtifact `json:"createArtifact"`
	} `json:"data"`
}

func TestClient_SendReportNew(t *testing.T) {
	data, err := os.ReadFile("./tests/golden_files/report_graphql_request_body.json")
	require.NoError(t, err, "failed to read test data")

	request := artifactRequest{}
	err = json.Unmarshal(data, &request)
	require.NoError(t, err, "failed to unmarshal test data")

	input := &CreateArtifactInput{
		AccessToken:       request.Variables.Input.AccessToken,
		CommitOID:         request.Variables.Input.CommitOID,
		ReporterName:      request.Variables.Input.ReporterName,
		ReporterVersion:   request.Variables.Input.ReporterVersion,
		Data:              request.Variables.Input.Data,
		AnalyzerShortcode: request.Variables.Input.AnalyzerShortcode,
		AnalyzerType:      request.Variables.Input.AnalyzerType,
		Metadata:          request.Variables.Input.Metadata,
	}

	t.Run("server success", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			require.NoError(t, err, "failed to read request body")

			payload := artifactRequest{}
			err = json.Unmarshal(body, &payload)
			require.NoError(t, err, "failed to unmarshal request body")

			assert.Equal(t, createArtifactMutationNew, payload.Query)

			response := artifactResponse{
				Data: struct {
					CreateArtifact CreateArtifact `json:"createArtifact"`
				}{
					CreateArtifact: CreateArtifact{
						Ok: true,
					},
				},
			}

			body, err = json.Marshal(response)
			require.NoError(t, err, "failed to marshal response")
			w.WriteHeader(http.StatusOK)
			w.Header().Set("Content-Type", "application/json")
			if _, err := w.Write(body); err != nil {
				t.Error(err)
			}
		}))

		client := NewGraphQLClient(server.URL, false)
		response, err := client.SendReportNew(input)

		require.NoError(t, err, "failed to send report")
		assert.True(t, response.CreateArtifact.Ok, "report failed")
	})

	t.Run("server error", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			require.NoError(t, err, "failed to marshal response")
			w.WriteHeader(http.StatusInternalServerError)

		}))

		client := NewGraphQLClient(server.URL, false)
		response, err := client.SendReportNew(input)

		require.Error(t, err, "expected error")
		require.Nil(t, response, "expected nil response")
	})

}

func TestClient_SendReportOld(t *testing.T) {
	data, err := os.ReadFile("./tests/golden_files/report_graphql_request_body.json")
	require.NoError(t, err, "failed to read test data")

	request := artifactRequest{}
	err = json.Unmarshal(data, &request)
	require.NoError(t, err, "failed to unmarshal test data")

	input := &CreateArtifactInput{
		AccessToken:       request.Variables.Input.AccessToken,
		CommitOID:         request.Variables.Input.CommitOID,
		ReporterName:      request.Variables.Input.ReporterName,
		ReporterVersion:   request.Variables.Input.ReporterVersion,
		Data:              request.Variables.Input.Data,
		AnalyzerShortcode: request.Variables.Input.AnalyzerShortcode,
		AnalyzerType:      request.Variables.Input.AnalyzerType,
		Metadata:          request.Variables.Input.Metadata,
	}

	t.Run("server success", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			require.NoError(t, err, "failed to read request body")

			payload := artifactRequest{}
			err = json.Unmarshal(body, &payload)
			require.NoError(t, err, "failed to unmarshal request body")

			assert.Equal(t, createArtifactMutationOld, payload.Query)

			response := artifactResponse{
				Data: struct {
					CreateArtifact CreateArtifact `json:"createArtifact"`
				}{
					CreateArtifact: CreateArtifact{
						Ok:      true,
						Message: "test-message",
						Error:   "test-error",
					},
				},
			}

			body, err = json.Marshal(response)
			require.NoError(t, err, "failed to marshal response")

			w.WriteHeader(http.StatusOK)
			w.Header().Set("Content-Type", "application/json")
			if _, err := w.Write(body); err != nil {
				t.Error(err)
			}
		}))

		client := NewGraphQLClient(server.URL, false)
		response, err := client.SendReportOld(input)

		require.NoError(t, err, "failed to send report")
		assert.True(t, response.CreateArtifact.Ok, "report failed")
		assert.Equal(t, "test-message", response.CreateArtifact.Message, "unexpected message")
		assert.Equal(t, "test-error", response.CreateArtifact.Error, "unexpected error")
	})

	t.Run("server error", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			require.NoError(t, err, "failed to marshal response")
			w.WriteHeader(http.StatusInternalServerError)

		}))

		client := NewGraphQLClient(server.URL, false)
		response, err := client.SendReportOld(input)

		require.Error(t, err, "expected error")
		require.Nil(t, response, "expected nil response")
	})

}
