package validator

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	validate "github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

var (
	configFolder     string
	analyzerTOMLPath string
	issuesDirPath    string
)

// Checks if the analyzer.toml file and the issue directory is present
func CheckConfigPresent() (err error) {
	// Check if `.deepsource/analyzer` folder is present
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}
	configFolder = filepath.Join(cwd, ".deepsource/analyzer")

	analyzerTOMLPath = filepath.Join(configFolder, "analyzer.toml")
	issuesDirPath = filepath.Join(configFolder, "issues/")

	// Check if `analyzer.toml` is present in `.deepsource/analyzer` folder
	if _, err := os.Stat(analyzerTOMLPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the analyzer.toml file doesn't exist")
		}
	}

	// Check if `issues/` directory is present in `.deepsource/analyzer` folder and is not empty.
	if _, err := os.Stat(issuesDirPath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return errors.New("the issue descriptions directory doesn't exist")
		}
	}
	return
}

// Validates analyzer.toml file
func ValidateAnalyzerTOML() (err error) {
	// Read the contents of analyzer.toml file
	analyzerTOMLContent, err := ioutil.ReadFile(analyzerTOMLPath)
	if err != nil {
		return errors.New("failed to read analyzer.toml file")
	}

	config := AnalyzerMetadata{}
	viper.SetConfigType("toml")
	if err = viper.ReadConfig(bytes.NewBuffer(analyzerTOMLContent)); err != nil {
		return err
	}
	// Unmarshaling the configdata into AnalyzerMetadata struct
	viper.Unmarshal(&config)

	// Validate analyzer.toml fields based on type and sanity checks
	v := validate.New()
	if err := v.Struct(&config); err != nil {
		log.Fatalf("Missing required attributes %v\n", err)
	}

	return nil
}

// Validates issue description TOML files
func ValidateIssueDescriptions() (err error) {
	issuesList, err := ioutil.ReadDir(issuesDirPath)
	if err != nil {
		return err
	}

	config := AnalyzerIssue{}
	for _, issuePath := range issuesList {
		// Read the contents of issue toml file
		issueTOMLContent, err := ioutil.ReadFile(filepath.Join(issuesDirPath, issuePath.Name()))
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
