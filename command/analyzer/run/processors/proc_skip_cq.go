package processors

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/deepsourcelabs/cli/types"
)

type ProcSkipCQ struct{}

func isSimilarIssue(fileExt, skipCQTag, probableIssueCode, issueCode string) bool {
	// if it is // skipcq: SCC-S1002 or similar plain skipcq tag, return
	if skipCQTag == "skipcq" {
		if probableIssueCode != "" {
			return strings.EqualFold(strings.TrimSpace(probableIssueCode), issueCode)
		} else {
			return true
		}
	}

	// if the tag to skip CQ is something else, check here
	for _, silencer := range languagesMeta[fileExt].Silencers {
		if strings.EqualFold(strings.TrimSpace(skipCQTag), silencer.SilencerCode) {
			if len(silencer.Issues) == 0 {
				// if the silencer doesn't have any issues in it, ignore all the issues
				return true
			}

			// similarIssues is a comma separated list of issues corresponding to the raised issue
			similarIssues, ok := silencer.Issues[strings.Split(issueCode, "-")[1]]

			// if the issue is not found in the silencer's issue map, do not ignore the issue
			if !ok {
				return false
			}

			if probableIssueCode == "" {
				// if there is no specific issue silenced, ignore all issues
				return true
			} else {
				for _, similarIssue := range strings.Split(similarIssues, ",") {
					// if the silencer has an issue map that contains this particular issue, ignore it
					if similarIssue == strings.ToUpper(probableIssueCode) {
						return true
					} else {
						return false
					}
				}
			}
		}
	}
	return false
}

func checkSkipCQ(fileExt string, skipCQre regexp.Regexp, line, issueCode string) bool {
	matches := skipCQre.FindAllStringSubmatch(line, -1)
	skipCQTag := ""

	if matches == nil {
		return false
	}

	ignoreIssue := true

	for i, name := range skipCQre.SubexpNames() {
		for _, match := range matches {
			if i != 0 && name != "" {
				// note the name of the issue silencer and move on
				if name == "skipcq_tag" {
					skipCQTag = match[i]
				} else if name == "issue_codes" {
					if match[i] != "" {
						for _, probableIssueCode := range strings.Split(match[i], ",") {
							// if an issue is to be ignored in this line of code is same as
							// the issue that is raised, we have to ignore the issue
							print(probableIssueCode)

							if isSimilarIssue(fileExt, skipCQTag, probableIssueCode, issueCode) {
								ignoreIssue = true
								// since we are only dealing with one issue at a time
								// break at the first occurrence
								return ignoreIssue
							} else {
								ignoreIssue = false
							}
						}
					} else {
						// in case there is no issue code associated, check for just the silencer tag
						ignoreIssue = isSimilarIssue(fileExt, skipCQTag, "", issueCode)
					}
				}
			}
		}
	}
	return ignoreIssue
}

/* Check if a given line of code is eligible to be checked for skip CQ.
 * Bare minimum eligibility is that the line should either be empty or
 * contain a comment only line. */
func analyzeLineForSkipCQ(line, fileExt string) bool {
	var commentIdentifier string
	for _, langMeta := range languagesMeta {
		if fileExt == langMeta.Extension {
			commentIdentifier = langMeta.CommentIdentifier
			break
		}
	}

	line = strings.TrimSpace(line)

	if line == "" {
		return true
	}

	match, err := regexp.Match(fmt.Sprintf("^%s", commentIdentifier), []byte(line))
	return err == nil && match
}

func (p ProcSkipCQ) Process(fileContentSlice []string, issue *types.Issue, processedIssues *[]types.Issue) error {
	filePath := issue.Location.Path
	lineStart := issue.Location.Position.Begin.Line
	issueCode := issue.IssueCode

	if lineStart < 1 || lineStart > len(fileContentSlice) {
		return fmt.Errorf("issue position is weird for file of %d lines", len(fileContentSlice))
	}

	shouldSkipCQ := false
	line := strings.TrimSpace(fileContentSlice[lineStart-1])

	fileSupported := false
	var fileExt string
	var skipCQregex regexp.Regexp
	for re := range languagesMeta {
		match, err := regexp.Match(re, []byte(filePath))
		if err != nil || !match {
			continue
		}
		fileSupported = true
		fileExt = re
		break
	}
	if !fileSupported {
		fileExt = "default_extension"
	}
	skipCQregex = regexMap[fileExt]

	// Skip code quality checks for the given issue code on the lineStart
	shouldSkipCQ = checkSkipCQ(fileExt, skipCQregex, line, issueCode)

	// Continue looking only if the previous line is a comment-only line specifying the skipcq condition,
	// the lineStart is not the first line of the file and shouldSkipCQ is not already true
	for index := lineStart - 2; !shouldSkipCQ && index >= 0 && analyzeLineForSkipCQ(fileContentSlice[index], fileExt); index-- {
		shouldSkipCQ = checkSkipCQ(fileExt, skipCQregex, fileContentSlice[index], issueCode)
	}

	if !shouldSkipCQ {
		*processedIssues = append(*processedIssues, *issue)
	}
	return nil
}
