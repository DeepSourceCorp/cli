package main

const (
	cliVersion         = "v0.1.0"
	reportGraphqlQuery = "mutation($input: TrackRepositoryTestCoverageInput!) {\r\n  trackRepositoryTestCoverage(input: $input) {\r\n    ok\r\n    error\r\n  }\r\n}"
	usageMessage       = `
        help

        `
)
