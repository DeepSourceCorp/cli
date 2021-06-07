package generate

import (
	"github.com/AlecAivazis/survey/v2"
)

// ==========
// Analyzers Prompt
// ==========

func (o *Options) collectAnalyzerInput(supportedAnalyzers []string) error {

	// Extracting languages and tools being used in the project for Analyzers
	analyzerPrompt := &survey.MultiSelect{
		Renderer: survey.Renderer{},
		Message:  "Which languages/tools does your project use?",
		Options:  supportedAnalyzers,
		Help:     "Analyzers will find issues in your code. Add an analyzer by selecting a language you've written your code in.",
	}
	err := survey.AskOne(analyzerPrompt, &o.ActivatedAnalyzers, survey.WithValidator(survey.Required))
	if err != nil {
		checkInterrupt(err)
		return err
	}

	// Extracting compulsary meta for Go and Java analyzers
	for _, analyzer := range o.ActivatedAnalyzers {
		if analyzer == "Go" {
			msg := "Please input the \"import path\" for Go analyzer."
			helpMsg := "The source code will be placed in $GOPATH/src/{import_root}. An example of import root is - github.com/spf13/viper"
			o.GoImportRoot, err = getSingleLineInput(msg, helpMsg)
			if err != nil {
				return err
			}
		}
		if analyzer == "Java (beta)" {
			msg := "Which Java version does the project use?"
			helpMsg := "The version of Java runtime to use. OpenJDK versions 8 to 15 are supported."
			supportedJavaVersions := []string{"8", "9", "10", "11", "12", "13", "14", "15"}
			o.JavaVersion, err = getSingleOptionInput(msg, helpMsg, supportedJavaVersions)
			if err != nil {
				return err
			}
		}
	}
	return nil

}
