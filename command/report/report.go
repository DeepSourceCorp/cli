package report

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/DataDog/zstd"
	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/utils"
	"github.com/getsentry/sentry-go"
	"github.com/spf13/cobra"
)

type ReportOptions struct {
	Analyzer                    string
	AnalyzerType                string
	Key                         string
	Value                       string
	ValueFile                   string
	SkipCertificateVerification bool
	DSN                         string
	UseOIDC                     bool
	OIDCRequestToken            string // id token to manually get an OIDC token
	OIDCRequestUrl              string // url to manually get an OIDC token
	DeepSourceHostEndpoint      string // DeepSource host endpoint where the app is running. Defaults to the cloud endpoint https://app.deepsource.com
	OIDCProvider                string // OIDC provider to use for authentication
}

// NewCmdVersion returns the current version of cli being used
func NewCmdReport() *cobra.Command {
	opts := ReportOptions{}

	doc := heredoc.Docf(`
		Report artifacts to DeepSource.

		Use %[1]s to specify the analyzer, for example:
		%[2]s

		Use %[3]s to specify the value of the artifact:
		%[4]s

		You can flag combinations as well:
		%[5]s
		`, utils.Yellow("--analyzer"), utils.Cyan("deepsource report --analyzer python"), utils.Yellow("--value"), utils.Cyan("deepsource report --key value"), utils.Cyan("deepsource report --analyzer go --value-file coverage.out"))

	cmd := &cobra.Command{
		Use:   "report",
		Short: "Report artifacts to DeepSource",
		Long:  doc,
		Args:  utils.NoArgs,
		Run: func(cmd *cobra.Command, args []string) {
			returnCode := opts.Run()
			sentry.Flush(2 * time.Second)
			defer os.Exit(returnCode)
		},
	}

	// --repo, -r flag
	cmd.Flags().StringVar(&opts.Analyzer, "analyzer", "", "name of the analyzer to report the artifact to (example: test-coverage)")

	cmd.Flags().StringVar(&opts.AnalyzerType, "analyzer-type", "", "type of the analyzer (example: community)")

	cmd.Flags().StringVar(&opts.Key, "key", "", "shortcode of the language (example: go)")

	cmd.Flags().StringVar(&opts.Value, "value", "", "value of the artifact")

	cmd.Flags().StringVar(&opts.ValueFile, "value-file", "", "path to the artifact value file")

	cmd.Flags().BoolVar(&opts.UseOIDC, "use-oidc", false, "use OIDC to authenticate with DeepSource")

	cmd.Flags().StringVar(&opts.OIDCRequestToken, "oidc-request-token", "", "request ID token to fetch an OIDC token from OIDC provider")

	cmd.Flags().StringVar(&opts.OIDCRequestUrl, "oidc-request-url", "", "OIDC provider's request URL to fetch an OIDC token")
	cmd.Flags().StringVar(&opts.DeepSourceHostEndpoint, "deepsource-host-endpoint", "https://app.deepsource.com", "DeepSource host endpoint where the app is running. Defaults to the cloud endpoint https://app.deepsource.com")
	cmd.Flags().StringVar(&opts.OIDCProvider, "oidc-provider", "", "OIDC provider to use for authentication. Supported providers: github-actions")

	// --skip-verify flag to skip SSL certificate verification while reporting test coverage data.
	cmd.Flags().BoolVar(&opts.SkipCertificateVerification, "skip-verify", false, "skip SSL certificate verification while sending the test coverage data")

	return cmd
}

func (opts *ReportOptions) sanitize() {
	opts.Analyzer = strings.TrimSpace(opts.Analyzer)
	opts.AnalyzerType = strings.TrimSpace(opts.AnalyzerType)
	opts.Key = strings.TrimSpace(opts.Key)
	opts.Value = strings.TrimSpace(opts.Value)
	opts.ValueFile = strings.TrimSpace(opts.ValueFile)
	opts.DSN = strings.TrimSpace(os.Getenv("DEEPSOURCE_DSN"))
	opts.OIDCRequestToken = strings.TrimSpace(opts.OIDCRequestToken)
	opts.OIDCRequestUrl = strings.TrimSpace(opts.OIDCRequestUrl)
	opts.DeepSourceHostEndpoint = strings.TrimSpace(opts.DeepSourceHostEndpoint)
}

func (opts *ReportOptions) validateKey() error {
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

func (opts *ReportOptions) Run() int {
	opts.sanitize()
	if opts.UseOIDC {
		dsn, err := utils.GetDSNFromOIDC(opts.OIDCRequestToken, opts.OIDCRequestUrl, opts.DeepSourceHostEndpoint, opts.OIDCProvider)
		if err != nil {
			fmt.Fprintln(os.Stderr, "DeepSource | Error | Failed to get DSN using OIDC:", err)
			return 1
		}
		opts.DSN = dsn
	}

	if opts.DSN == "" {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Environment variable DEEPSOURCE_DSN not set (or) is empty. You can find it under the repository settings page")
		return 1
	}
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetUser(sentry.User{ID: opts.DSN})
	})

	/////////////////////
	// Command: report //
	/////////////////////

	// Get current path
	currentDir, err := os.Getwd()
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to identify current directory")
		sentry.CaptureException(err)
		return 1
	}
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetExtra("currentDir", currentDir)
	})

	// validate key
	if err := opts.validateKey(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		sentry.CaptureException(err)
		return 1
	}

	dsn, err := NewDSN(opts.DSN)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		sentry.CaptureException(err)
		return 1
	}

	///////////////////////
	// Generate metadata //
	///////////////////////

	// Head Commit OID
	headCommitOID, warning, err := gitGetHead(currentDir)
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to get commit OID HEAD. Make sure you are running the CLI from a git repository")
		log.Println(err)
		sentry.CaptureException(err)
		return 1
	}
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetExtra("headCommitOID", headCommitOID)
	})

	// Flag validation
	if opts.Value == "" && opts.ValueFile == "" {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | '--value' (or) '--value-file' not passed")
		return 1
	}

	var analyzerShortcode string
	var analyzerType string
	var artifactKey string
	var artifactValue string

	analyzerShortcode = opts.Analyzer
	analyzerType = opts.AnalyzerType
	artifactKey = opts.Key

	if opts.Value != "" {
		artifactValue = opts.Value
	}

	if opts.ValueFile != "" {
		// Check file size
		_, err := os.Stat(opts.ValueFile)
		if err != nil {
			fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to read specified value file:", opts.ValueFile)
			sentry.CaptureException(err)
			return 1
		}

		valueBytes, err := os.ReadFile(opts.ValueFile)
		if err != nil {
			fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to read specified value file:", opts.ValueFile)
			sentry.CaptureException(err)
			return 1
		}

		artifactValue = string(valueBytes)
	}

	// Query DeepSource API to check if compression is supported
	q := ReportQuery{Query: graphqlCheckCompressed}

	qBytes, err := json.Marshal(q)
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Failed to marshal query:", err)
		sentry.CaptureException(err)
		return 1
	}

	r, err := makeQuery(
		dsn.Protocol+"://"+dsn.Host+"/graphql/cli/",
		qBytes,
		"application/json",
		opts.SkipCertificateVerification,
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Failed to make query:", err)
		sentry.CaptureException(err)
		return 1
	}

	// res is a struct to unmarshal the response to check if compression is supported
	var res struct {
		Data struct {
			Type struct {
				InputFields []struct {
					Name string `json:"name"`
				} `json:"inputFields"`
			} `json:"__type"`
		} `json:"data"`
	}

	err = json.Unmarshal(r, &res)
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Failed to unmarshal response:", err)
		sentry.CaptureException(err)
		return 1
	}

	reportMeta := make(map[string]interface{})
	reportMeta["workDir"] = currentDir

	// Compress the value if compression is supported
	for _, inputField := range res.Data.Type.InputFields {
		if inputField.Name == "compressed" {
			// Compress the byte array
			var compressedBytes []byte
			compressLevel := 20
			compressedBytes, err = zstd.CompressLevel(compressedBytes, []byte(artifactValue), compressLevel)
			if err != nil {
				fmt.Fprintln(os.Stderr, "DeepSource | Error | Failed to compress value file:", opts.ValueFile)
				sentry.CaptureException(err)
				return 1
			}

			// Base64 encode the compressed byte array
			artifactValue = base64.StdEncoding.EncodeToString(compressedBytes)

			// Set the compression flag
			reportMeta["compressed"] = "True"
		}
	}

	////////////////////
	// Generate query //
	////////////////////

	queryInput := ReportQueryInput{
		AccessToken:       dsn.Token,
		CommitOID:         headCommitOID,
		ReporterName:      "cli",
		ReporterVersion:   CliVersion,
		Key:               artifactKey,
		Data:              artifactValue,
		AnalyzerShortcode: analyzerShortcode,
		// AnalyzerType:      analyzerType,  // Add this in the later steps, only is the analyzer type is passed.
		// This makes sure that the cli is always backwards compatible. The API is designed to accept analyzer type only if it is passed.
		Metadata: reportMeta,
	}

	query := ReportQuery{Query: reportGraphqlQuery}
	// Check if analyzerType is passed and add it to the queryInput
	if analyzerType != "" {
		queryInput.AnalyzerType = analyzerType
	}
	//  Pass queryInput to the query
	query.Variables.Input = queryInput

	// Marshal request body
	queryBodyBytes, err := json.Marshal(query)
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to marshal query body")
		sentry.CaptureException(err)
		return 1
	}

	queryResponseBody, err := makeQuery(
		dsn.Protocol+"://"+dsn.Host+"/graphql/cli/",
		queryBodyBytes,
		"application/json",
		opts.SkipCertificateVerification,
	)
	if err != nil {
		// Make Query without message field.
		query := ReportQuery{Query: reportGraphqlQueryOld}
		query.Variables.Input = queryInput
		queryBodyBytes, err := json.Marshal(query)
		if err != nil {
			fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to marshal query body")
			sentry.CaptureException(err)
			return 1
		}
		queryResponseBody, err = makeQuery(
			dsn.Protocol+"://"+dsn.Host+"/graphql/cli/",
			queryBodyBytes,
			"application/json",
			opts.SkipCertificateVerification,
		)
		if err != nil {
			fmt.Fprintln(os.Stderr, "DeepSource | Error | Reporting failed |", err)
			sentry.CaptureException(err)
			return 1
		}
	}
	// Parse query's response body
	queryResponse := QueryResponse{}
	err = json.Unmarshal(queryResponseBody, &queryResponse)
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to parse response body")
		sentry.CaptureException(err)
		return 1
	}

	// Check for errors in response body
	// Response format:
	// {
	//   "data": {
	//     "createArtifact": {
	//       "ok": false,
	//       "error": "No repository found attached with the access token: dasdsds"
	//     }
	//   }
	// }

	if !queryResponse.Data.CreateArtifact.Ok {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Reporting failed |", queryResponse.Data.CreateArtifact.Error)
		sentry.CaptureException(errors.New(queryResponse.Data.CreateArtifact.Error))
		return 1
	}

	fmt.Printf("DeepSource | Artifact published successfully\n\n")
	fmt.Printf("Analyzer  %s\n", analyzerShortcode)
	fmt.Printf("Key       %s\n", artifactKey)
	if queryResponse.Data.CreateArtifact.Message != "" {
		fmt.Printf("Message   %s\n", queryResponse.Data.CreateArtifact.Message)
	}
	if warning != "" {
		fmt.Print(warning)
	}
	return 0
}
