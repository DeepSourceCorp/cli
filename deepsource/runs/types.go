package runs

import "time"

// AnalysisRun represents a single analysis run in the repository history
type AnalysisRun struct {
	RunUid                string      `json:"runUid"`
	CommitOid             string      `json:"commitOid"`
	BranchName            string      `json:"branchName"`
	Status                string      `json:"status"`
	CreatedAt             time.Time   `json:"createdAt"`
	FinishedAt            *time.Time  `json:"finishedAt"`
	UpdatedAt             *time.Time  `json:"updatedAt"`
	OccurrencesIntroduced int         `json:"occurrencesIntroduced"`
	OccurrencesResolved   int         `json:"occurrencesResolved"`
	OccurrencesSuppressed int         `json:"occurrencesSuppressed"`
	ReportCard            *ReportCard `json:"reportCard,omitempty"`
}

// ReportCard contains quality grades and scores for an analysis run
type ReportCard struct {
	Status      string           `json:"status"`
	Security    *ReportDimension `json:"security,omitempty"`
	Reliability *ReportDimension `json:"reliability,omitempty"`
	Complexity  *ReportDimension `json:"complexity,omitempty"`
	Hygiene     *ReportDimension `json:"hygiene,omitempty"`
	Coverage    *ReportCoverage  `json:"coverage,omitempty"`
	Aggregate   *ReportAggregate `json:"aggregate,omitempty"`
	FocusArea   *ReportFocusArea `json:"focusArea,omitempty"`
}

// ReportDimension represents a single quality dimension (security, reliability, etc.)
type ReportDimension struct {
	Grade       string `json:"grade"`
	Score       int    `json:"score"`
	IssuesCount int    `json:"issuesCount"`
}

// ReportCoverage represents coverage information in a report card
type ReportCoverage struct {
	Grade          string   `json:"grade,omitempty"`
	Score          *int     `json:"score,omitempty"`
	LineCoverage   *float64 `json:"lineCoverage,omitempty"`
	BranchCoverage *float64 `json:"branchCoverage,omitempty"`
}

// ReportAggregate represents the aggregate grade across all dimensions
type ReportAggregate struct {
	Grade string `json:"grade"`
	Score int    `json:"score"`
}

// ReportFocusArea represents the recommended area of focus
type ReportFocusArea struct {
	Dimension string `json:"dimension,omitempty"`
	Action    string `json:"action,omitempty"`
}

// RunWithIssues represents an analysis run with its associated issues
type RunWithIssues struct {
	RunUid     string      `json:"runUid"`
	CommitOid  string      `json:"commitOid"`
	BranchName string      `json:"branchName"`
	Status     string      `json:"status"`
	ReportCard *ReportCard `json:"reportCard,omitempty"`
	Issues     []RunIssue  `json:"issues"`
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
