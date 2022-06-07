package processor

import (
	"bytes"
	"log"
	"strings"

	"github.com/alecthomas/chroma/formatters/html"
	"github.com/alecthomas/chroma/lexers"
	"github.com/alecthomas/chroma/styles"
	"github.com/deepsourcelabs/cli/types"
)

type formattedFile struct {
	fileContent        []string
	highlightedContent []string
}

var formattedFileCache map[string]formattedFile = make(map[string]formattedFile)

func procLoadSourceCode(fileContentSlice []string, issue *types.Issue, offset int) {
	var lineStartWithOffset, lineEndWithOffset int
	lineStart := issue.Location.Position.Begin.Line
	lineEnd := issue.Location.Position.End.Line

	// Count lines
	numLines := len(fileContentSlice)

	// Line start
	if lineStart-offset < 1 {
		lineStartWithOffset = 1
	} else {
		lineStartWithOffset = lineStart - offset
	}

	// Line end
	if lineEnd+offset > numLines {
		lineEndWithOffset = numLines
	} else {
		lineEndWithOffset = lineEnd + offset
	}

	formattedFileContent := getFinalFormattedSlice(fileContentSlice, issue)
	chromaFormattedSlice := formattedFileContent.fileContent
	chromaHighlightedSlice := formattedFileContent.highlightedContent

	finalFormattedSlice := make([]string, 0)
	finalFormattedSlice = append(finalFormattedSlice, `<div class="highlight"><pre>`)
	// get the file slice to write
	for i := lineStartWithOffset; i <= lineEndWithOffset; i++ {
		currentLine := chromaFormattedSlice[i-1]

		// for all lines except the last, append a newline
		if i < lineEndWithOffset {
			currentLine = currentLine + "\n"
		}

		// highlight the lines containing the issue
		// We need not add a \n at the end of highlighted lines, as chroma does it itself
		if i >= lineStart && i <= lineEnd {
			currentLine = chromaHighlightedSlice[i-1]
		}
		finalFormattedSlice = append(finalFormattedSlice, currentLine)
	}
	finalFormattedSlice = append(finalFormattedSlice, "</pre></div>")
	issue.ProcessedData.SourceCode.Rendered = strings.Join(finalFormattedSlice, "")
}

// We cache the past file's iterator, taking advantage of the fact that
// issues are sorted according to filenames
func getFinalFormattedSlice(fileContentSlice []string, issue *types.Issue) formattedFile {
	filePath := issue.Location.Path
	if formattedFileData, ok := formattedFileCache[filePath]; ok {
		return formattedFileData
	}

	// Clear the cache
	for k := range formattedFileCache {
		delete(formattedFileCache, k)
	}

	fileContentString := strings.Join(fileContentSlice, "\n")

	// Generate syntax highlighted file

	lexer := lexers.Match(filePath)
	if strings.HasSuffix(filePath, ".vue") {
		lexer = lexers.Get("html")
	}

	if lexer == nil {
		lexer = lexers.Fallback
	}

	iterator, err := lexer.Tokenise(nil, fileContentString)
	if err != nil {
		log.Println("Could not tokenize file ", filePath)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}

	formatter := html.New(html.WithLineNumbers(true), html.PreventSurroundingPre(true), html.WithClasses(true))

	style := styles.Get("monokai")
	if style == nil {
		style = styles.Fallback
	}

	var chromaFormattedBytes bytes.Buffer
	var chromaFormattedString string
	err = formatter.Format(&chromaFormattedBytes, style, iterator)
	if err != nil {
		log.Println(err)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}

	chromaFormattedString = chromaFormattedBytes.String()
	chromaFormattedSlice := strings.Split(chromaFormattedString, "\n")

	for i := range chromaFormattedSlice {
		if i != 0 && !strings.HasPrefix(chromaFormattedSlice[i], "<span class=\"ln\">") {
			lineStartIndex := strings.Index(chromaFormattedSlice[i], "<span class=\"ln\">")

			if lineStartIndex != -1 {
				chromaFormattedSlice[i-1] += chromaFormattedSlice[i][:lineStartIndex]
				chromaFormattedSlice[i] = chromaFormattedSlice[i][lineStartIndex:]
			}
		}
	}

	// Highlight all lines in the file

	lexer = lexers.Match(filePath)

	if lexer == nil {
		lexer = lexers.Fallback
	}

	iterator, err = lexer.Tokenise(nil, fileContentString)
	if err != nil {
		log.Println("Could not tokenize file ", filePath)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}

	lineHighlightRange := [][2]int{{1, len(fileContentSlice)}}

	formatter = html.New(html.WithLineNumbers(true), html.PreventSurroundingPre(true), html.WithClasses(true), html.HighlightLines(lineHighlightRange))

	style = styles.Get("monokai")
	if style == nil {
		style = styles.Fallback
	}

	var chromaHighlightedBytes bytes.Buffer
	err = formatter.Format(&chromaHighlightedBytes, style, iterator)
	if err != nil {
		log.Println(err)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}

	chromaHighlightedString := chromaHighlightedBytes.String()
	chromaHighlightedSlice := strings.Split(chromaHighlightedString, "\n")

	// Correct the span elements in the slice.
	// Highlighted lines look like this:
	//
	// <span class="hl"><span class="ln"> 1</span><span class="kn">import</span> <span class="nn">os</span>
	// </span><span class="hl"><span class="ln"> 2</span><span class="kn">import</span> <span class="nn">random</span>  <span class="c1"># noqa: F401</span>
	// </span><span class="hl"><span class="ln"> 3</span><span class="kn">import</span> <span class="nn">this</span>  <span class="c1"># noqa</span>
	// </span><span class="hl"><span class="ln"> 4</span><span class="kn">import</span> <span class="nn">sys</span>
	//
	// We need to move the trailing span to the previous line in order for our replacement logic to work.

	for i := range chromaHighlightedSlice {
		if i != 0 && !strings.HasPrefix(chromaHighlightedSlice[i], "<span class=\"hl\">") {
			lineStartIndex := strings.Index(chromaHighlightedSlice[i], "<span class=\"hl\">")

			if lineStartIndex != -1 {
				chromaHighlightedSlice[i-1] += chromaHighlightedSlice[i][:lineStartIndex]
				chromaHighlightedSlice[i] = chromaHighlightedSlice[i][lineStartIndex:]
			}
		}
	}

	formattedContent := formattedFile{
		fileContent:        chromaFormattedSlice,
		highlightedContent: chromaHighlightedSlice,
	}
	formattedFileCache[filePath] = formattedContent

	return formattedContent
}
