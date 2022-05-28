package generate

import (
	"context"

	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource"
	"github.com/deepsourcelabs/cli/utils"
)

// Responsible for collecting user input for generating DeepSource config
func (o *Options) collectUserInput() error {
	deepsource, err := deepsource.New(deepsource.ClientOpts{
		Token:    config.Cfg.Token,
		HostName: config.Cfg.Host,
	})
	if err != nil {
		return err
	}
	ctx := context.Background()

	// Get the list of analyzers and transformers supported by DeepSource
	err = utils.GetAnalyzersAndTransformersData(ctx, *deepsource)
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
