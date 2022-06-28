package render

// fetchIssueCategoryData creates a map of issue category to issue occurences count of that category.
func (r *ResultRenderOpts) fetchIssueCategoryData() {
	// Iterate over the map and then keep adding the issue counts.
	issueCategoryMap := make(map[string]int)

	// Creating a map of issue categories present to their count.
	for _, occurenceData := range r.AnalysisResultData.IssuesOccurenceMap {
		if _, ok := issueCategoryMap[occurenceData.IssueMeta.Category]; !ok {
			issueCategoryMap[occurenceData.IssueMeta.Category] = len(occurenceData.Occurences)
			continue
		}
		issueCategoryMap[occurenceData.IssueMeta.Category] = issueCategoryMap[occurenceData.IssueMeta.Category] + len(occurenceData.Occurences)
	}

	// Add remaining categories to the map other than what are reported in the issues by the Analyzer since
	// need to render all the categories.
	for categoryShortcode := range r.IssueCategoryNameMap {
		if _, ok := issueCategoryMap[categoryShortcode]; !ok {
			issueCategoryMap[categoryShortcode] = 0
			continue
		}
	}
	r.AnalysisResultData.IssueCategoryCountMap = issueCategoryMap
}
