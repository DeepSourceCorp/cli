package initialize

import (
	"reflect"
	"strings"
	"testing"
)

type MockInputPrompt struct {
	AnalyzerShortcode   string
	AnalyzerName        string
	AnalyzerDescription string
	AnalyzerTags        string
	Repository          string
	AnalysisCommand     string
	TestCommand         string
	SDKRequired         bool
	SDKLanguage         string
	ExpectedConfig      string
}

func (m MockInputPrompt) GetSingleLineInput(msg, helpText, defaultValue string) (string, error) {
	if strings.Contains(msg, "Display name") {
		return m.AnalyzerName, nil
	}
	if strings.Contains(msg, "Description") {
		return m.AnalyzerDescription, nil
	}
	if strings.Contains(msg, "Tags") {
		return m.AnalyzerTags, nil
	}
	if strings.Contains(msg, "Git repository") {
		return m.Repository, nil
	}
	if strings.Contains(msg, "Analysis command") {
		return m.AnalysisCommand, nil
	}
	if strings.Contains(msg, "Test command") {
		return m.TestCommand, nil
	}
	return "", nil
}

func (m MockInputPrompt) ConfirmFromUser(msg, helpText string) (bool, error) {
	return m.SDKRequired, nil
}

func (m MockInputPrompt) SelectFromOptions(msg, helpText string, opts []string) (string, error) {
	return m.SDKLanguage, nil
}

func TestInitAnalyzer(t *testing.T) {
	testCases := []MockInputPrompt{
		{
			AnalyzerShortcode:   "@deepsource/demo-python",
			AnalyzerName:        "Python Analyzer",
			AnalyzerDescription: "This is a python analyzer",
			AnalyzerTags:        "python, analyzer, static-analysis",
			Repository:          "https://github.com/deepsourcelabs/demo-python",
			AnalysisCommand:     "./analysis.sh",
			TestCommand:         "./test-command.sh",
			SDKRequired:         false,
			SDKLanguage:         "",
			ExpectedConfig: `name = "Python Analyzer"
shortcode = "@deepsource/demo-python"
description = "This is a python analyzer"
tags = ["python", "analyzer", "static-analysis"]
repository = "https://github.com/deepsourcelabs/demo-python"
documentation = ""
bug_tracker = ""

[environment_variables]

[analysis]
  command = "./analysis.sh"

[build]
  engine = ""
  dockerfile = ""
  script = ""

[test]
  command = "./test-command.sh"
`,
		},
		{
			AnalyzerShortcode:   "@deepsource/demo-go",
			AnalyzerName:        "Go Analyzer",
			AnalyzerDescription: "This is a golang analyzer",
			AnalyzerTags:        "golang go analyzer static-analysis",
			Repository:          "https://gitlab.com/deepsourcelabs/demo-go",
			AnalysisCommand:     "",
			TestCommand:         "",
			SDKRequired:         true,
			SDKLanguage:         "Go",
			ExpectedConfig: `name = "Go Analyzer"
shortcode = "@deepsource/demo-go"
description = "This is a golang analyzer"
tags = ["golang", "go", "analyzer", "static-analysis"]
repository = "https://gitlab.com/deepsourcelabs/demo-go"
documentation = ""
bug_tracker = ""

[environment_variables]

[analysis]
  command = ""

[build]
  engine = ""
  dockerfile = ""
  script = ""

[test]
  command = ""
`,
		},
	}

	for _, tc := range testCases {
		opts := AnalyzerInitOpts{
			PromptUtils: tc,
		}
		opts.AnalyzerShortcodeArg = tc.AnalyzerShortcode
		buf, err := opts.initAnalyzer()
		if err != nil {
			t.Error(err)
		}
		if !reflect.DeepEqual(tc.ExpectedConfig, buf.String()) {
			t.Errorf("Expected %s\n====\nGot %s", tc.ExpectedConfig, buf.String())
		}
	}
}
