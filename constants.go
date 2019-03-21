package main

const (
	cliVersion         = "v0.1.0"
	commonUsageMessage = `
Usage:
    deepsource <command> [<arguments>]

Available commands are:
    report        Report an artifact to analyzer

Help:
    Use 'deepsource <command> --help' for more information about the command.

Documentation:
    https://deepsource.io/docs/cli
`

	reportUsageMessage = `
Usage:
    deepsource report [<arguments>]

Available arguments are:
    --analyzer        Shortcode of the analyzer
    --key             Name of the artifact
    --value           Value of the artifact
    --value-file      Path to the artifact value file

Examples:
    deepsource report --analyzer test-coverage --key python --value-file ./coverage.xml
    deepsource report --analyzer git --key lines-changed --value 22

Notes:
    - Pass either '--value' or '--value-file'. If both are passed, contents of '--value' will be considered.

Documentation:
    https://deepsource.io/docs/cli#report
`
	reportGraphqlQuery = "mutation($input: TrackRepositoryTestCoverageInput!) {\r\n  trackRepositoryTestCoverage(input: $input) {\r\n    ok\r\n    error\r\n  }\r\n}"
)
