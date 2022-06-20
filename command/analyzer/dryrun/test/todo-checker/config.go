package main

import (
	"encoding/json"
	"os"
	"path"
)

func readAnalysisConfig() (*AnalysisConfig, error) {
	analysisConfig := AnalysisConfig{}

	data, err := os.ReadFile(path.Join(toolboxPath, "analysis_config.json"))
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &analysisConfig)
	if err != nil {
		return nil, err
	}
	return &analysisConfig, nil
}
