package processor

import (
	"fmt"
	"io/ioutil"
	"log"
	"path"
	"sort"
	"strings"

	"github.com/deepsourcelabs/cli/types"
)

var (
	issueIndex      int = 0
	batchSize       int = 30
	maxIssueDensity int = 100
)

/* While this loop looks like it would have a complexity of len(filesWIssueRange) * len(cachedFiles) * issues * len(processorList)
 * it only has a complexity of O(len(report.Issues)).
 * When there are a lot of files to be processed, opening all of them one by one takes time, while the CPU waits idly.
 * Opening all files and loading them into memory is expensive in terms of space, since there could be a lot of files.
 * Hence, opening files concurrently in batches (of, say, 30 files) and then processing all issues in those 30 files one by one
 * appears to be the best option. We cannot process each file's issues concurrently, because only the file loading operation is
 * IO intensive, and the rest is CPU intensive. */
func (p *ProcessAnalysisResults) processIssuesBatch(filesWIssueRange []IssueRange) {
	// Process files in batches of `batchSize` to avoid `too many files open` error
	for processedFiles := range filesWIssueRange {
		filesToProcess := 0

		/* The default batch size is 30. If the number of files is less than this batchsize assign their count
		 * as the number of files to process, else assign the batchsize as the number of files to be processed in
		 * this iteration. */
		if len(filesWIssueRange)-processedFiles < batchSize {
			filesToProcess = len(filesWIssueRange) - processedFiles
		} else {
			filesToProcess = batchSize
		}

		// The slice containing the data about cached files to be processed.
		cachedFiles := p.cacheFilesToBeProcessed(filesToProcess, processedFiles, filesWIssueRange)

		// Iterate over the cached files data and process the issues present in them.
		for j, cachedFile := range cachedFiles {
			for issueIndex := range p.AnalysisResult.Issues {
				// Pick an issue.
				issue := p.AnalysisResult.Issues[issueIndex]

				// Check if the file is a generated one, this happens if enormous amount of issues are
				// reported in a single file on a single line.
				if p.isGeneratedFile(processedFiles+j, &cachedFile, filesWIssueRange) {
					continue
				}

				// Check if the issue is for another file.
				// If yes, skip this iteration and go to next file.
				if cachedFile.Filename != issue.Location.Path {
					break
				}
				processedIssue := issue
				p.runProcessors(cachedFile, &processedIssue)
				issueIndex++ // loop increments
			}
		}
		fmt.Println("Batch processing done")
		// Increase total number of files processed
		processedFiles += filesToProcess
	}
}

// runProcessors runs the supported processors on the issue passed as a parameter
func (p *ProcessAnalysisResults) runProcessors(cachedFile fileContentNode, processedIssue *types.Issue) {
	var err error
	skipIssue := false
	// Loop through processors
	for _, processor := range p.Processors {
		switch processor {
		case "source_code_load":
			procLoadSourceCode(cachedFile.FileContent, processedIssue, sourceCodeOffset)
		case "skip_cq":
			skipIssue, err = procSkipCQ(cachedFile.FileContent, processedIssue)
			if err != nil {
				fmt.Println("Publish: Error in processor skip_cq for issue: ", *processedIssue, err)
			}
		default:
			fmt.Println("Publish: Unkown processor received")
		}
	}
	if !skipIssue {
		p.ProcessedIssues = append(p.ProcessedIssues, *processedIssue)
	}
}

/* If the number of issues in this file is more than a certain number of issues
 * averaged per line, this may be a generated file. Skip processing of further issues
 * in this file */
func (p *ProcessAnalysisResults) isGeneratedFile(fileIndex int, cachedFile *fileContentNode, filesWIssueRange []IssueRange) bool {
	linesInThisFile := len(cachedFile.FileContent) | 1 // bitwise op to ensure no divisionbyzero errs
	issuesInThisFile := filesWIssueRange[fileIndex].EndIndex - filesWIssueRange[fileIndex].BeginIndex
	if (issuesInThisFile / linesInThisFile) > maxIssueDensity {
		log.Printf(
			"Skipping file %s. Too many issues per line. Lines: %d, issues: %d\n",
			cachedFile.Filename,
			linesInThisFile,
			issuesInThisFile,
		)
		p.AnalysisResult.Errors = append(p.AnalysisResult.Errors, types.Error{
			HMessage: fmt.Sprintf(
				"Skipped file %s because too many issues were raised. "+
					"Is this a generated file that can be added in [exclude_patterns](https://deepsource.io/docs/config/deepsource-toml.html#exclude-patterns)?",
				cachedFile.Filename,
			),
			Level: 1,
		})
		return true
	}
	return false
}

// cacheBatchOfFiles receives the count of files to be cached and caches them in a batch by spawning goroutines.
func (p *ProcessAnalysisResults) cacheFilesToBeProcessed(totalFiles, processedFiles int, filesWIssueRange []IssueRange) []fileContentNode {
	fileContentChannel := make(chan fileContentNode, totalFiles)
	for j := 0; j < totalFiles; j++ {
		filename := filesWIssueRange[processedFiles+j].Filename
		go addFileToCache(fileContentChannel, filename, p.CodePath)
	}

	cachedFiles := []fileContentNode{}
	for j := 0; j < totalFiles; j++ {
		cachedFiles = append(cachedFiles, <-fileContentChannel)
	}

	// sort the cached files by filename, because our issues are sorted by filename
	sort.Slice(cachedFiles, func(i, j int) bool {
		return cachedFiles[i].Filename < cachedFiles[j].Filename
	})
	return cachedFiles
}

/* addFileToCache reads the file and formats its content into a fileContentNode struct instance
 * and passes that to the cachedFilesChannel channel since this function is run on a goroutine. */
func addFileToCache(cachedFilesChannel chan fileContentNode, filename, codePath string) {
	fileContentSlice := []string{}

	fileContentBytes, err := ioutil.ReadFile(path.Join(codePath, filename))
	if err != nil {
		fmt.Println("Could not process for file: ", filename, ". Err: ", err)
	} else if string(fileContentBytes) != "" {
		fileContentSlice = strings.Split(string(fileContentBytes), "\n")
	} else {
		fileContentSlice = []string{}
	}

	cachedFilesChannel <- fileContentNode{
		Filename:    filename,
		FileContent: fileContentSlice,
	}
}