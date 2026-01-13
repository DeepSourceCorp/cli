package report

const (
	CliVersion = "v0.8.0"

	reportGraphqlQuery     = "mutation($input: CreateArtifactInput!) {\r\n  createArtifact(input: $input) {\r\n    ok\r\n  message\r\n  error\r\n  }\r\n}"
	reportGraphqlQueryOld  = "mutation($input: CreateArtifactInput!) {\r\n  createArtifact(input: $input) {\r\n    ok\r\n  error\r\n  }\r\n}"
	graphqlCheckCompressed = "query {\r\n __type(name: \"ArtifactMetadataInput\") {\r\n inputFields {\r\n name\r\n }\r\n }\r\n}"
)
