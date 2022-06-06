package processor

import "sort"

func (p *ProcessAnalysisResults) sortIssuesByFile() {
	// All the files that appear in the issues are now processed by the processors listed in analyzer conf
	// We must cache the files in order to not do file IO for every processor.
	sort.Slice(p.Report.Issues, func(i, j int) bool {
		return p.Report.Issues[i].Location.Path < p.Report.Issues[j].Location.Path
	})
}
