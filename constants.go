package main

const (
	queryCoverage = "mutation($input: TrackRepositoryTestCoverageInput!) {\r\n  trackRepositoryTestCoverage(input: $input) {\r\n    ok\r\n    error\r\n  }\r\n}"
)
