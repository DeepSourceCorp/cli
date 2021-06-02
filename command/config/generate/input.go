package generate

// Collects user input for generating DeepSource config
func (o *Options) collectUserInput() error {

	// TODO: Remove this hard coded data
	supportedAnalyzers := []string{"Python", "JavaScript", "Go", "Java (beta)", "Ruby", "Docker", "Terraform", "Secrets", "SQL", "Test-Coverage"}

	transformerMap := map[string][]string{
		"Python":     {"YAPF", "Black", "AutoPEP8"},
		"Go":         {"Gofmt"},
		"JavaScript": {"Prettier", "StandardJS"},
		"Java":       {"Google-Java-Format"},
		"Ruby":       {"StandardRB"},
	}

	err := o.collectAnalyzerInput(supportedAnalyzers)
	if err != nil {
		return err
	}

	err = o.collectTransformersInput(supportedAnalyzers, transformerMap)
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
