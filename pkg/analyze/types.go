package analyze

import (
	"github.com/shurcooL/graphql"
)

type File struct {
	Filename graphql.String `json:"filename" graphql:"filename"`
	Hash     graphql.String `json:"hash"`
	Contents graphql.String `json:"content" graphql:"content"`
}

// In the case of running analysis on changelog
type AnalysisChangelogPayload struct {
	LastCommitOID graphql.String `json:"last_commit_oid" graphql:"lastCommitOid"`
	Files         []File         `json:"files" graphql:"files"`
	RequestHash   string         `json:"request_hash"`
}

// In case of running analysis on certain files
type AnalysisFilesPayload struct {
	Files       []File
	RequestHash string
}

type AnalysisTriggerQuery struct {
	Response AnalysisInitResponse `graphql:"createLocalRun(input: {lastCommitOid: $lastCommitOID, files: $files, config: $config})"`
}

type RunStatus struct {
	StatusCode int
	Message    string
}

type AsgardResult struct {
	PollURL       string
	ResultAddress string
}

type AnalysisInitResponse struct {
	RunID          graphql.String `json:"run_id" graphql:"runId"`
	Status         RunStatus      `json:"status" graphql:"status"`
	ResultEndPoint AsgardResult   `json:"result_endpoint" graphql:"result_endpoint"`
}
