package validator

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"reflect"

	validate "github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

// Checks if the analyzer.toml file and the issue directory is present
func CheckForAnalyzerConfig(analyzerTOMLPath, issuesDirectoryPath string) (err error) {
	// Check if `analyzer.toml` is present in `.deepsource/analyzer` folder
	if _, err := os.Stat(analyzerTOMLPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the analyzer.toml file doesn't exist")
		}
	}

	// Check if `issues/` directory is present in `.deepsource/analyzer` folder and is not empty.
	if _, err := os.Stat(issuesDirectoryPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the issue descriptions directory doesn't exist")
		}
	}
	return
}

// Validates analyzer.toml file
func ValidateAnalyzerTOML(analyzerTOMLPath string) (analyzerConfig AnalyzerMetadata, err error) {
	config := AnalyzerMetadata{}
	// Read the contents of analyzer.toml file
	analyzerTOMLContent, err := ioutil.ReadFile(analyzerTOMLPath)
	if err != nil {
		return config, errors.New("failed to read analyzer.toml file")
	}

	viper.SetConfigType("toml")
	if err = viper.ReadConfig(bytes.NewBuffer(analyzerTOMLContent)); err != nil {
		return config, err
	}
	// Unmarshaling the configdata into AnalyzerMetadata struct
	viper.Unmarshal(&config)

	// Validate analyzer.toml fields based on type and sanity checks
	v := validate.New()
	missingRequiredFields := []string{}
	if err := v.Struct(&config); err != nil {
		// Improve error message returned by `go-playground/validator`
		errs := err.(validate.ValidationErrors)
		for _, err := range errs {
			if err.Tag() == "required" {
				c := reflect.ValueOf(config)
				for i := 0; i < c.Type().NumField(); i++ {
					if err.Field() == c.Type().Field(i).Name {
						missingRequiredFields = append(missingRequiredFields, c.Type().Field(i).Tag.Get("toml"))
					}
				}
			}
		}
		return config, fmt.Errorf("missing required attributes %v\n", missingRequiredFields)
	}
	return config, nil
}

// Validates issue description TOML files
func ValidateIssueDescriptions(issuesDirectoryPath string) (err error) {
	issuesList, err := ioutil.ReadDir(issuesDirectoryPath)
	if err != nil {
		return err
	}

	config := AnalyzerIssue{}
	for _, issuePath := range issuesList {
		// Read the contents of issue toml file
		issueTOMLContent, err := ioutil.ReadFile(filepath.Join(issuesDirectoryPath, issuePath.Name()))
		if err != nil {
			fmt.Println(err)
			return errors.New("Error occured while reading file:%s. Exiting...")
		}

		viper.SetConfigType("toml")
		if err = viper.ReadConfig(bytes.NewBuffer(issueTOMLContent)); err != nil {
			return err
		}
		// Unmarshaling the configdata into AnalyzerMetadata struct
		viper.Unmarshal(&config)

		v := validate.New()
		if err := v.Struct(&config); err != nil {
			log.Fatalf("Missing required attributes %v\n", err)
		}
		config = AnalyzerIssue{}
	}
	return nil
}
