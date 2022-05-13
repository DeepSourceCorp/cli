package initialize

import (
	"reflect"
	"testing"
)

var (
	singleLineInputResponse, descriptionInputResponse, singleOptionPromptResponse string
	confirmationResponse                                                          bool
)

func mockGetSingleLineInput(string, string, string) (string, error) {
	return singleLineInputResponse, nil
}

func mockDescriptionPrompt(string, string, string) (string, error) {
	return descriptionInputResponse, nil
}

func mockConfirmFromUser(string, string) (bool, error) {
	return confirmationResponse, nil
}

func mockSingleOptionPrompt(string, string, []string) (string, error) {
	return singleOptionPromptResponse, nil
}

type Test struct {
	AnalyzerShortcode   string
	AnalyzerName        string
	AnalyzerDescription string
	SDKRequired         bool
	SDKLanguage         string
	ExpectedConfig      string
}

func TestInitAnalyzer(t *testing.T) {
	// Creating an instance of AnalyzerInitOpts
	opts := AnalyzerInitOpts{
		SingleLineInputPrompt: mockGetSingleLineInput,
		DescriptionPrompt:     mockDescriptionPrompt,
		ConfirmationPrompt:    mockConfirmFromUser,
		SingleOptionPrompt:    mockSingleOptionPrompt,
	}

	testCases := []Test{
		{
			AnalyzerShortcode:   "@deepsource/demo-python",
			AnalyzerName:        "Python Analyzer",
			AnalyzerDescription: "This is a python analyzer",
			SDKRequired:         false,
			SDKLanguage:         "",
			ExpectedConfig: `name = "Python Analyzer"
shortcode = "@deepsource/demo-python"
description = "This is a python analyzer"
category = ""
tags = []

[urls]
  source = ""
  documentation = ""
  bug_tracker = ""

[environment_variables]

[analysis]
  command = ""

[build]
  builder = ""
  dockerfile = ""
  script = ""

[test]
  command = ""
`,
		},
	}

	for _, tc := range testCases {
		opts.AnalyzerShortcodeArg = tc.AnalyzerShortcode
		singleLineInputResponse = tc.AnalyzerName
		descriptionInputResponse = tc.AnalyzerDescription
		confirmationResponse = tc.SDKRequired
		singleOptionPromptResponse = tc.SDKLanguage
		buf, err := opts.initAnalyzer()
		if err != nil {
			t.Error(err)
		}
		if !reflect.DeepEqual(tc.ExpectedConfig, buf.String()) {
			t.Errorf("Expected %s\n====\nGot %s", tc.ExpectedConfig, buf.String())
		}
	}
}
