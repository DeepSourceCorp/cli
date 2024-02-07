package report

import (
	"encoding/base64"
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

	var artifactValue string
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

	client := NewGraphQLClient(dsn.Protocol+"://"+dsn.Host+"/graphql/cli/", opts.SkipCertificateVerification)
	mustCompress, err := client.CompressionEnabled()
	if err != nil {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Unable to check if compression is supported")
		sentry.CaptureException(err)
	}

	reportMeta := make(map[string]interface{})
	reportMeta["workDir"] = currentDir

	// Compress the value if compression is supported

	if mustCompress {
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

	queryInput := CreateArtifactInput{
		AccessToken:       dsn.Token,
		CommitOID:         headCommitOID,
		ReporterName:      "cli",
		ReporterVersion:   CliVersion,
		Key:               opts.Key,
		Data:              artifactValue,
		AnalyzerShortcode: opts.Analyzer,
		AnalyzerType:      opts.AnalyzerType,
		// AnalyzerType:      analyzerType,  // Add this in the later steps, only is the analyzer type is passed.
		// This makes sure that the cli is always backwards compatible. The API is designed to accept analyzer type only if it is passed.
		Metadata: reportMeta,
	}

	var res *CreateArtifactResponse
	res, err = client.SendReportNew(&queryInput)
	if err != nil {
		// Make Query without message field.
		res, err = client.SendReportOld(&queryInput)
		if err != nil {
			fmt.Fprintln(os.Stderr, "DeepSource | Error | Reporting failed |", err)
			sentry.CaptureException(err)
			return 1
		}
	}

	if !res.CreateArtifact.Ok {
		fmt.Fprintln(os.Stderr, "DeepSource | Error | Reporting failed |", res.CreateArtifact.Error)
		sentry.CaptureException(errors.New(res.CreateArtifact.Error))
		return 1
	}

	fmt.Printf("DeepSource | Artifact published successfully\n\n")
	fmt.Printf("Analyzer  %s\n", opts.Analyzer)
	fmt.Printf("Key       %s\n", opts.Key)
	if res.CreateArtifact.Message != "" {
		fmt.Printf("Message   %s\n", res.CreateArtifact.Message)
	}
	if warning != "" {
		fmt.Print(warning)
	}
	return 0
}
