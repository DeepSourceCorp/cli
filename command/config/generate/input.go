package generate

import (
	"context"

	"github.com/deepsourcelabs/cli/config"
	configsvc "github.com/deepsourcelabs/cli/internal/services/config"
)

// Responsible for collecting user input for generating DeepSource config
func (o *Options) collectUserInput(svc *configsvc.Service, cfg *config.CLIConfig) error {
	ctx := context.Background()

	// Get the list of analyzers and transformers supported by DeepSource
	err := svc.FetchAnalyzersAndTransformersData(ctx, cfg)
	if err != nil {
		return err
	}

	// Get input for analyzers to be activated
	err = o.collectAnalyzerInput()
	if err != nil {
		return err
	}

	err = o.collectTransformersInput()
	if err != nil {
		return err
	}

	err = o.collectExcludePatterns()
	if err != nil {
		return err
	}

	err = o.collectTestPatterns()
	if err != nil {
		return err
	}

	return nil
}
