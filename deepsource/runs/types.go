package runs

import "time"

// AnalysisRun represents a single analysis run in the repository history
type AnalysisRun struct {
	RunUid              string    `json:"runUid"`
	CommitOid           string    `json:"commitOid"`
	BranchName          string    `json:"branchName"`
	Status              string    `json:"status"`
	CreatedAt           time.Time `json:"createdAt"`
	FinishedAt          *time.Time `json:"finishedAt"`
	OccurrencesIntroduced int     `json:"occurrencesIntroduced"`
	OccurrencesResolved   int     `json:"occurrencesResolved"`
	OccurrencesSuppressed int     `json:"occurrencesSuppressed"`
}

// RunWithIssues represents an analysis run with its associated issues
type RunWithIssues struct {
	RunUid     string     `json:"runUid"`
	CommitOid  string     `json:"commitOid"`
	BranchName string     `json:"branchName"`
	Status     string     `json:"status"`
	Issues     []RunIssue `json:"issues"`
}

// RunIssue represents an issue found in an analysis run
type RunIssue struct {
	Path              string `json:"path"`
	BeginLine         int    `json:"beginLine"`
	BeginColumn       int    `json:"beginColumn"`
	EndLine           int    `json:"endLine"`
	EndColumn         int    `json:"endColumn"`
	IssueText         string `json:"issueText"`
	IssueCode         string `json:"issueCode"`
	Title             string `json:"title"`
	Category          string `json:"category"`
	Severity          string `json:"severity"`
	Source            string `json:"source"`
	AnalyzerName      string `json:"analyzerName"`
	AnalyzerShortcode string `json:"analyzerShortcode"`
}
