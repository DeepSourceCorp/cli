package report

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/klauspost/compress/zstd"
	clierrors "github.com/deepsourcelabs/cli/internal/errors"
	"github.com/deepsourcelabs/cli/internal/interfaces"
	"github.com/deepsourcelabs/cli/internal/oidc"
)

type ServiceDeps struct {
	GitClient   interfaces.GitClient
	HTTPClient  interfaces.HTTPClient
	FileSystem  interfaces.FileSystem
	Environment interfaces.Environment
	Sentry      interfaces.SentryClient
	Output      interfaces.OutputWriter
	Workdir     func() (string, error)
}

// Service handles artifact reporting.
type Service struct {
	git       interfaces.GitClient
	http      interfaces.HTTPClient
	fs        interfaces.FileSystem
	env       interfaces.Environment
	sentry    interfaces.SentryClient
	output    interfaces.OutputWriter
	workdir   func() (string, error)
}

// NewService creates a report service.
func NewService(deps ServiceDeps) *Service {
	workdir := deps.Workdir
	if workdir == nil {
		workdir = os.Getwd
	}
	return &Service{
		git:       deps.GitClient,
		http:      deps.HTTPClient,
		fs:        deps.FileSystem,
		env:       deps.Environment,
		sentry:    deps.Sentry,
		output:    deps.Output,
		workdir:   workdir,
	}
}

// Report publishes an artifact and returns report metadata.
func (s *Service) Report(ctx context.Context, opts Options) (*Result, error) {
	s.sanitize(&opts)

	if opts.UseOIDC {
		dsn, err := oidc.GetDSNFromOIDC(opts.OIDCRequestToken, opts.OIDCRequestUrl, opts.DeepSourceHostEndpoint, opts.OIDCProvider)
		if err != nil {
			s.capture(err)
			return nil, fmt.Errorf("DeepSource | Error | Failed to get DSN using OIDC: %w", err)
		}
		opts.DSN = dsn
	}

	if opts.DSN == "" {
		return nil, clierrors.NewUserError(errors.New("DeepSource | Error | Environment variable DEEPSOURCE_DSN not set (or) is empty. Set DEEPSOURCE_DSN from the repository settings page or use --use-oidc."))
	}

	s.infof("DeepSource | Info | Preparing artifact...\n")
	currentDir, err := s.workdir()
	if err != nil {
		s.capture(err)
		return nil, errors.New("DeepSource | Error | Unable to identify current directory")
	}

	if err := s.validateKey(opts); err != nil {
		uerr := clierrors.NewUserError(err)
		s.capture(uerr)
		return nil, uerr
	}

	dsn, err := NewDSN(opts.DSN)
	if err != nil {
		uerr := clierrors.NewUserError(err)
		s.capture(uerr)
		return nil, uerr
	}

	headCommitOID, warning, err := s.git.GetHead(currentDir)
	if err != nil {
		s.capture(err)
		return nil, errors.New("DeepSource | Error | Unable to get commit OID HEAD. Make sure you are running the CLI from a git repository")
	}

	if opts.Value == "" && opts.ValueFile == "" {
		return nil, clierrors.NewUserError(errors.New("DeepSource | Error | '--value' (or) '--value-file' not passed"))
	}

	artifactValue := opts.Value
	if opts.ValueFile != "" {
		if _, err := s.fs.Stat(opts.ValueFile); err != nil {
			uerr := clierrors.NewUserErrorf("DeepSource | Error | Unable to read specified value file: %s", opts.ValueFile)
			s.capture(uerr)
			return nil, uerr
		}

		valueBytes, err := s.fs.ReadFile(opts.ValueFile)
		if err != nil {
			uerr := clierrors.NewUserErrorf("DeepSource | Error | Unable to read specified value file: %s", opts.ValueFile)
			s.capture(uerr)
			return nil, uerr
		}

		artifactValue = string(valueBytes)
	}

	s.infof("DeepSource | Info | Checking compression support...\n")
	meta := map[string]interface{}{"workDir": currentDir}
	compressed, err := s.compressIfSupported(ctx, dsn, artifactValue, opts.SkipCertificateVerification, meta)
	if err != nil {
		s.capture(err)
		return nil, err
	}
	artifactValue = compressed

	queryInput := ReportQueryInput{
		AccessToken:       dsn.Token,
		CommitOID:         headCommitOID,
		ReporterName:      "cli",
		ReporterVersion:   CliVersion,
		Key:               opts.Key,
		Data:              artifactValue,
		AnalyzerShortcode: opts.Analyzer,
		Metadata:          meta,
	}
	if opts.AnalyzerType != "" {
		queryInput.AnalyzerType = opts.AnalyzerType
	}

	query := ReportQuery{Query: reportGraphqlQuery}
	query.Variables.Input = queryInput

	queryBodyBytes, err := json.Marshal(query)
	if err != nil {
		s.capture(err)
		return nil, errors.New("DeepSource | Error | Unable to marshal query body")
	}

	s.infof("DeepSource | Info | Uploading artifact...\n")
	responseBody, err := s.makeQuery(ctx, dsn, queryBodyBytes, opts.SkipCertificateVerification)
	if err != nil {
		queryFallback := ReportQuery{Query: reportGraphqlQueryOld}
		queryFallback.Variables.Input = queryInput
		queryBodyBytes, err = json.Marshal(queryFallback)
		if err != nil {
			s.capture(err)
			return nil, errors.New("DeepSource | Error | Unable to marshal query body")
		}

		responseBody, err = s.makeQuery(ctx, dsn, queryBodyBytes, opts.SkipCertificateVerification)
		if err != nil {
			s.capture(err)
			return nil, fmt.Errorf("DeepSource | Error | Reporting failed | %w", err)
		}
	}

	queryResponse := QueryResponse{}
	if err := json.Unmarshal(responseBody, &queryResponse); err != nil {
		s.capture(err)
		return nil, errors.New("DeepSource | Error | Unable to parse response body")
	}

	if !queryResponse.Data.CreateArtifact.Ok {
		err := errors.New(queryResponse.Data.CreateArtifact.Error)
		s.capture(err)
		return nil, fmt.Errorf("DeepSource | Error | Reporting failed | %s", queryResponse.Data.CreateArtifact.Error)
	}

	return &Result{
		Analyzer: opts.Analyzer,
		Key:      opts.Key,
		Message:  queryResponse.Data.CreateArtifact.Message,
		Warning:  warning,
	}, nil
}

func (s *Service) sanitize(opts *Options) {
	opts.Analyzer = strings.TrimSpace(opts.Analyzer)
	opts.AnalyzerType = strings.TrimSpace(opts.AnalyzerType)
	opts.Key = strings.TrimSpace(opts.Key)
	opts.Value = strings.TrimSpace(opts.Value)
	opts.ValueFile = strings.TrimSpace(opts.ValueFile)
	if opts.DSN == "" {
		opts.DSN = strings.TrimSpace(s.env.Get("DEEPSOURCE_DSN"))
	}
	opts.OIDCRequestToken = strings.TrimSpace(opts.OIDCRequestToken)
	opts.OIDCRequestUrl = strings.TrimSpace(opts.OIDCRequestUrl)
	opts.DeepSourceHostEndpoint = strings.TrimSpace(opts.DeepSourceHostEndpoint)
}

func (s *Service) validateKey(opts Options) error {
	supportedKeys := map[string]bool{
		"python":     true,
		"go":         true,
		"javascript": true,
		"ruby":       true,
		"java":       true,
		"scala":      true,
		"php":        true,
		"csharp":     true,
		"cxx":        true,
		"rust":       true,
		"swift":      true,
		"kotlin":     true,
	}

	if opts.Analyzer == "test-coverage" && !supportedKeys[opts.Key] {
		return fmt.Errorf("DeepSource | Error | Invalid Key: %s (Supported Keys: %v)", opts.Key, supportedKeys)
	}

	return nil
}

func (s *Service) compressIfSupported(ctx context.Context, dsn *DSN, artifactValue string, skipVerify bool, meta map[string]interface{}) (string, error) {
	q := ReportQuery{Query: graphqlCheckCompressed}
	qBytes, err := json.Marshal(q)
	if err != nil {
		return "", fmt.Errorf("DeepSource | Error | Failed to marshal query: %w", err)
	}

	response, err := s.makeQuery(ctx, dsn, qBytes, skipVerify)
	if err != nil {
		return "", fmt.Errorf("DeepSource | Error | Failed to make query: %w", err)
	}

	var res struct {
		Data struct {
			Type struct {
				InputFields []struct {
					Name string `json:"name"`
				} `json:"inputFields"`
			} `json:"__type"`
		} `json:"data"`
	}

	if err := json.Unmarshal(response, &res); err != nil {
		return "", fmt.Errorf("DeepSource | Error | Failed to unmarshal response: %w", err)
	}

	for _, inputField := range res.Data.Type.InputFields {
		if inputField.Name != "compressed" {
			continue
		}

		encoder, err := zstd.NewWriter(nil, zstd.WithEncoderLevel(zstd.SpeedBestCompression))
		if err != nil {
			return "", fmt.Errorf("DeepSource | Error | Failed to create zstd encoder: %w", err)
		}
		compressedBytes := encoder.EncodeAll([]byte(artifactValue), nil)

		meta["compressed"] = "True"
		return base64.StdEncoding.EncodeToString(compressedBytes), nil
	}

	return artifactValue, nil
}

func (s *Service) makeQuery(ctx context.Context, dsn *DSN, body []byte, skipVerify bool) ([]byte, error) {
	url := dsn.Protocol + "://" + dsn.Host + "/graphql/cli/"

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	var resBody []byte

	client := s.http
	if skipVerify {
		client = &http.Client{
			Timeout: time.Second * 60,
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{InsecureSkipVerify: true, MinVersion: tls.VersionTLS12},
			},
		}
	}

	res, err := client.Do(req)
	if err != nil {
		return resBody, err
	}
	defer res.Body.Close()

	resBody, err = io.ReadAll(res.Body)
	if err != nil {
		return resBody, err
	}

	if res.StatusCode >= http.StatusInternalServerError || res.StatusCode != 200 {
		if resBody != nil {
			return resBody, fmt.Errorf("Server responded with %d: %s", res.StatusCode, string(resBody))
		}
		return resBody, fmt.Errorf("Server responded with %d", res.StatusCode)
	}

	return resBody, nil
}

func (s *Service) capture(err error) {
	if s.sentry == nil {
		return
	}
	if clierrors.IsUserError(err) {
		return
	}
	s.sentry.CaptureException(err)
}

func (s *Service) infof(format string, args ...interface{}) {
	if s.output == nil {
		return
	}
	s.output.Printf(format, args...)
}
