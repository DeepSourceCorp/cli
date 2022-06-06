package processor

type ProcessAnalysisResults struct {
	AnalysisResult []byte
	Processors     []string
}

/* Accepts the result as a byte array and processes the results in the form of a
 * AnalysisReport struct instance */
func (p *ProcessAnalysisResults) ProcessAnalysisResult() {
}
