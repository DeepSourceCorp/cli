package push

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
	"time"

	"github.com/deepsourcelabs/cli/analyzers/backend/docker"
	"github.com/deepsourcelabs/cli/analyzers/config"
	cliConfig "github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/types"
	"github.com/deepsourcelabs/cli/utils"
)

func TestPushAnalyzer(t *testing.T) {
	/* ----------------------------------------------------------------------------
	// 1. Run the registry locally.
	/* ---------------------------------------------------------------------------- */
	appPath := os.Getenv("APP_PATH")
	if appPath == "" {
		appPath = "/app/"
	}

	// Set REGISTRY_URL as localhost:5000 otherwise it will use the default value which is registry.deepsource.io.
	os.Setenv("REGISTRY_URL", "localhost:5000")

	/* ----------------------------------------------------------------------------
	// Setup the local docker registry for testing at localhost:5000.
	/* ---------------------------------------------------------------------------- */
	if err := runCmd("docker", appPath, "run", "-d", "-p", "5000:5000", "--restart=always", "--name", "registry", "registry:2"); err != nil {
		t.Error(err)
	}

	/* ----------------------------------------------------------------------------
	// Copying the todo-checker directory to $APP_PATH for the integration tests
	/* ---------------------------------------------------------------------------- */
	analyzerPath, _ := filepath.Abs("../dryrun/test/todo-checker")

	// Copy all the files to APP_PATH
	if err := runCmd("cp", appPath, "-a", "-f", analyzerPath+"/.", "."); err != nil {
		t.Error(err)
	}

	/* ----------------------------------------------------------------------------
	// Initialize appPath as git repo and add a commit to it
	/* ---------------------------------------------------------------------------- */

	if err := runCmd("git", appPath, "init"); err != nil {
		t.Error(err)
	}

	if err := runCmd("git", appPath, "add", "."); err != nil {
		t.Error(err)
	}

	if err := runCmd("git", appPath, "commit", "--no-gpg-sign", "-m", "hello"); err != nil {
		t.Error(err)
	}
	/* -------------------------------------------------------------------------------------
	// Fetch the analyzer.toml data and the issue descriptions of the todo-checker Analyzer
	/* ------------------------------------------------------------------------------------- */
	os.Chdir(appPath)
	analyzerTOMLData, err := config.GetAnalyzerTOML()
	if err != nil {
		t.Error(err)
	}

	issuesData, err := config.GetIssueDescriptions()
	if err != nil {
		t.Error(err)
	}

	/* -------------------------------------------------------------------------------------
	// Create test cases.
	/* ------------------------------------------------------------------------------------- */
	type fields struct {
		RegistryURL      string
		AnalyzerTOMLData types.AnalyzerTOML
		IssuesData       *[]types.AnalyzerIssue
		DockerClient     *docker.DockerClient
		Spinner          *utils.SpinnerUtils
	}
	tests := []struct {
		name    string
		fields  fields
		wantErr bool
	}{
		{
			name: "Test Analyzer push to the registry",
			fields: fields{
				RegistryURL:      "localhost:5000",
				AnalyzerTOMLData: *analyzerTOMLData,
				IssuesData:       issuesData,
				DockerClient:     &docker.DockerClient{},
				Spinner:          &utils.SpinnerUtils{},
			},
			wantErr: false,
		},
	}

	cliConf := cliConfig.CLIConfig{
		Host:           "deepsource.io",
		Token:          "dsp_2c14cf8d5c46485e8b811687760caf526a4",
		TokenExpiresIn: time.Unix(1<<63-1, 0),
		User:           "test@deepsource.io",
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a := &AnalyzerPushOpts{
				RegistryURL:      tt.fields.RegistryURL,
				AnalyzerTOMLData: tt.fields.AnalyzerTOMLData,
				IssuesData:       tt.fields.IssuesData,
				DockerClient:     tt.fields.DockerClient,
				Spinner:          tt.fields.Spinner,
				cliConfig:        &cliConf,
			}
			if err := a.pushAnalyzer(); (err != nil) != tt.wantErr {
				t.Errorf("AnalyzerPushOpts.pushAnalyzer() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}

	/* Stop the registry. */
	if err := runCmd("docker", appPath, "container", "stop", "registry"); err != nil {
		t.Error(err)
	}
	if err := runCmd("docker", appPath, "container", "rm", "-v", "registry"); err != nil {
		t.Error(err)
	}
}

func runCmd(command, directory string, cmdArgs ...string) (err error) {
	// Stop the running registry instance.
	cmd := exec.Command(command, cmdArgs...)
	cmd.Dir = directory

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Run the command
	err = cmd.Run()
	_, outErr := stdout.String(), stderr.String()
	if err != nil {
		return fmt.Errorf("Failed to run the command. Error:%s\n", outErr)
	}
	return nil
}
