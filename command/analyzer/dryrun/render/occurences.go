package render

import (
	"fmt"
	"path/filepath"
	"strings"
)

// fetchIssueOccurencesData collects all the occurence related data.
func (r *ResultRenderOpts) fetchIssueOccurencesData(cwd string) {
	// Create a map of occurences of the issues.
	issueOccurenceMap := make(map[string]OccurenceData)

	// Iterate over the analysis result issues.
	for _, issue := range r.AnalysisResultData.AnalysisResult.Issues {
		currentOccurence := OccurenceData{}

		// Fix path of the issues(remove cwd prefix from them).
		issue.Location.Path = strings.TrimPrefix(issue.Location.Path, filepath.Join(r.AnalysisResultData.SourcePath, string(filepath.Separator)))

		if _, ok := issueOccurenceMap[issue.IssueCode]; !ok {
			// Fetch issue meta for the issue code raised.
			issueMeta, err := getIssueMeta(cwd, issue.IssueCode)
			if err != nil {
				fmt.Println("Couldn't resolve issue meta for the issue:", issue.IssueCode)
				continue
			}
			currentOccurence = OccurenceData{
				IssueMeta: issueMeta,
			}
			currentOccurence.Occurences = append(currentOccurence.Occurences, issue)
			currentOccurence.Files = append(currentOccurence.Files, issue.Location.Path)
			issueOccurenceMap[issue.IssueCode] = currentOccurence
			continue
		}

		// Get past occurences and append to it since maps don't allow direct append to a slice value.
		pastOccurences := issueOccurenceMap[issue.IssueCode]
		currentOccurence.IssueMeta = pastOccurences.IssueMeta
		currentOccurence.Occurences = append(pastOccurences.Occurences, issue)
		currentOccurence.Files = append(pastOccurences.Files, issue.Location.Path)
		issueOccurenceMap[issue.IssueCode] = currentOccurence
	}

	// Remove duplicates from the files array.
	for issueCode, occurenceData := range issueOccurenceMap {
		filesMap := make(map[string]int, 0)
		uniqueFiles := make([]string, 0)

		// Setting the map value to 1 for the files in order to identify unique files.
		for _, file := range occurenceData.Files {
			filesMap[file] = 1
		}

		// Appending the unique files.
		for file := range filesMap {
			uniqueFiles = append(uniqueFiles, file)
		}
		occurence := issueOccurenceMap[issueCode]
		occurence.Files = append(occurence.Files, uniqueFiles...)
		issueOccurenceMap[issueCode] = occurence
	}

	// Create the files information string.
	for issueCode, occurenceData := range issueOccurenceMap {
		occurenceData.FilesInfo = fmt.Sprintf("Found in %s and %d other file(s)", occurenceData.Files[0], len(occurenceData.Files)-1)
		issueOccurenceMap[issueCode] = occurenceData
	}
	r.AnalysisResultData.IssuesOccurenceMap = issueOccurenceMap

	// Find out total number of occurences of all the issues.
	for _, v := range issueOccurenceMap {
		r.AnalysisResultData.TotalOccurences = r.AnalysisResultData.TotalOccurences + len(v.Occurences)
	}

	// Finds the unique issues count(the length of the occurences map since its mapped by issue codes which are unique).
	r.AnalysisResultData.UniqueIssuesCount = len(r.AnalysisResultData.IssuesOccurenceMap)
}
