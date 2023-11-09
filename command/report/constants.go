package report

const (
	CliVersion         = "v0.8.0"
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
    --analyzer-type   Type of the analyzer (default: "core")
    --key             Name of the artifact
    --value           Value of the artifact
    --value-file      Path to the artifact value file
Examples:
    deepsource report --analyzer test-coverage --key python --value-file ./coverage.xml
    deepsource report --analyzer git --key lines-changed --value 22
    deepsource report --analyzer kube-linter --type community --value-file ./kube-linter.sarif
Notes:
    - Pass either '--value' or '--value-file'. If both are passed, contents of '--value' will be considered.
    - '--analyzer-type' is optional. If not passed, it will default to 'core'.
Documentation:
    https://deepsource.io/docs/cli#report
`
	reportGraphqlQuery     = "mutation($input: CreateArtifactInput!) {\r\n  createArtifact(input: $input) {\r\n    ok\r\n  message\r\n  error\r\n  }\r\n}"
	reportGraphqlQueryOld  = "mutation($input: CreateArtifactInput!) {\r\n  createArtifact(input: $input) {\r\n    ok\r\n  error\r\n  }\r\n}"
	graphqlCheckCompressed = "query {\r\n __type(name: \"ArtifactMetadataInput\") {\r\n inputFields {\r\n name\r\n }\r\n }\r\n}"
)
