package report

// ReportQueryInput is the schema for variables of artifacts report GraphQL query.
type ReportQueryInput struct {
	AccessToken       string      `json:"accessToken"`
	CommitOID         string      `json:"commitOid"`
	ReporterName      string      `json:"reporter"`
	ReporterVersion   string      `json:"reporterVersion"`
	Key               string      `json:"key"`
	Data              string      `json:"data"`
	AnalyzerShortcode string      `json:"analyzer"`
	AnalyzerType      string      `json:"analyzerType,omitempty"`
	Metadata          interface{} `json:"metadata,omitempty"`
}

// ReportQuery is the structure of artifacts report GraphQL query.
type ReportQuery struct {
	Query     string `json:"query"`
	Variables struct {
		Input ReportQueryInput `json:"input"`
	} `json:"variables"`
}

// QueryResponse is the response returned by artifacts report GraphQL query.
type QueryResponse struct {
	Data struct {
		CreateArtifact struct {
			Error   string `json:"error"`
			Message string `json:"message"`
			Ok      bool   `json:"ok"`
		} `json:"createArtifact"`
	} `json:"data"`
}

// Options defines inputs for reporting artifacts.
type Options struct {
	Analyzer                    string
	AnalyzerType                string
	Key                         string
	Value                       string
	ValueFile                   string
	SkipCertificateVerification bool
	DSN                         string
	UseOIDC                     bool
	OIDCRequestToken            string
	OIDCRequestUrl              string
	DeepSourceHostEndpoint      string
	OIDCProvider                string
}

// Result captures report output metadata.
type Result struct {
	Analyzer string
	Key      string
	Message  string
	Warning  string
}
