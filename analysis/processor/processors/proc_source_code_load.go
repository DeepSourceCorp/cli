package processors

import (
	"bytes"
	"fmt"
	"log"
	"strings"

	"github.com/alecthomas/chroma/formatters/html"
	"github.com/alecthomas/chroma/lexers"
	"github.com/alecthomas/chroma/styles"
	"github.com/deepsourcelabs/cli/types"
)

const sourceCodeOffset int = 3

type ProcSourceCodeLoad struct{}

type formattedFile struct {
	fileContent        []string
	highlightedContent []string
}

var (
	lineStartWithOffset, lineEndWithOffset int
	formattedFileCache                     map[string]formattedFile = make(map[string]formattedFile)
)

// We cache the past file's iterator, taking advantage of the fact that
// issues are sorted according to filenames
func getFinalFormattedSlice(fileContentSlice []string, issue *types.Issue) formattedFile {
	filePath := issue.Location.Path

	// Check if the formatted file data is already present in the cache.
	// If yes, return the cached data.
	if formattedFileData, ok := formattedFileCache[filePath]; ok {
		return formattedFileData
	}

	// Else, clear the cache.
	for k := range formattedFileCache {
		delete(formattedFileCache, k)
	}

	/* ============================================================
	 * Use alecthomas/chroma to generate syntax highlighted snippet
	 * ============================================================ */
	fileContentString := strings.Join(fileContentSlice, "\n")
	lexer := lexers.Match(filePath)

	/* Case: In case of .vue files, use the `html` lexer since the `vue` lexer
	 * breaks in certain cases. The `html` lexer provides comparatively better results.
	 * TODO(SNT): Remove this case if vue lexer is improved in future. */
	if strings.HasSuffix(filePath, ".vue") {
		lexer = lexers.Get("html")
	}
	if lexer == nil {
		lexer = lexers.Fallback
	}

	// Tokenize the file content.
	iterator, err := lexer.Tokenise(nil, fileContentString)
	if err != nil {
		log.Println("Could not tokenize file ", filePath)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}

	// Selecting the chroma format in which we expect the output(html) and use the `monokai` colorscheme to highlight the snippet.
	formatter := html.New(html.WithLineNumbers(true), html.PreventSurroundingPre(true), html.WithClasses(true))
	style := styles.Get("monokai")
	if style == nil {
		style = styles.Fallback
	}

	var chromaFormattedBytes bytes.Buffer
	var chromaFormattedString string
	err = formatter.Format(&chromaFormattedBytes, style, iterator)
	if err != nil {
		fmt.Println(err)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}

	// Convert the generated data in bytes to string and also extract the slice containing
	// all the lines as the contents.
	chromaFormattedString = chromaFormattedBytes.String()
	chromaFormattedSlice := strings.Split(chromaFormattedString, "\n")

	// We need to move the trailing span to the previous line in order.
	for i := range chromaFormattedSlice {
		if i != 0 && !strings.HasPrefix(chromaFormattedSlice[i], "<span class=\"ln\">") {
			lineStartIndex := strings.Index(chromaFormattedSlice[i], "<span class=\"ln\">")

			if lineStartIndex != -1 {
				chromaFormattedSlice[i-1] += chromaFormattedSlice[i][:lineStartIndex]
				chromaFormattedSlice[i] = chromaFormattedSlice[i][lineStartIndex:]
			}
		}
	}

	// Highlight all lines in the file.
	lexer = lexers.Match(filePath)
	if lexer == nil {
		lexer = lexers.Fallback
	}
	iterator, err = lexer.Tokenise(nil, fileContentString)
	if err != nil {
		fmt.Println("Could not tokenize file ", filePath)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}

	// Specifying the highlight range.
	lineHighlightRange := [][2]int{{1, len(fileContentSlice)}}

	// Format, style and color the snippet.
	formatter = html.New(html.WithLineNumbers(true), html.PreventSurroundingPre(true), html.WithClasses(true), html.HighlightLines(lineHighlightRange))
	style = styles.Get("monokai")
	if style == nil {
		style = styles.Fallback
	}
	var chromaHighlightedBytes bytes.Buffer
	err = formatter.Format(&chromaHighlightedBytes, style, iterator)
	if err != nil {
		fmt.Println(err)
		return formattedFile{
			fileContent:        []string{},
			highlightedContent: []string{},
		}
	}
	chromaHighlightedString := chromaHighlightedBytes.String()
	chromaHighlightedSlice := strings.Split(chromaHighlightedString, "\n")

	/* Correct the span elements in the slice.
	 * Highlighted lines look like this:
	 *
	 * <span class="hl"><span class="ln"> 1</span><span class="kn">import</span> <span class="nn">os</span>
	 * </span><span class="hl"><span class="ln"> 2</span><span class="kn">import</span> <span class="nn">random</span>  <span class="c1"># noqa: F401</span>
	 * </span><span class="hl"><span class="ln"> 3</span><span class="kn">import</span> <span class="nn">this</span>  <span class="c1"># noqa</span>
	 * </span><span class="hl"><span class="ln"> 4</span><span class="kn">import</span> <span class="nn">sys</span> */

	// We need to move the trailing span to the previous line in order for our replacement logic to work.
	for i := range chromaHighlightedSlice {
		if i != 0 && !strings.HasPrefix(chromaHighlightedSlice[i], "<span class=\"line hl\">") {
			lineStartIndex := strings.Index(chromaHighlightedSlice[i], "<span class=\"line hl\">")

			if lineStartIndex != -1 {
				chromaHighlightedSlice[i-1] += chromaHighlightedSlice[i][:lineStartIndex]
				chromaHighlightedSlice[i] = chromaHighlightedSlice[i][lineStartIndex:]
			}
		}
	}

	// Create formattedContent variable of `formattedFile` type and return.
	formattedContent := formattedFile{
		fileContent:        chromaFormattedSlice,
		highlightedContent: chromaHighlightedSlice,
	}
	formattedFileCache[filePath] = formattedContent

	return formattedContent
}

// Returns the name of the processor
func (p ProcSourceCodeLoad) String() string {
	return "source_code_load"
}

// Process processes the source code to be highlighted using chroma and writes that into the
// analysis result post highlighting.
func (p ProcSourceCodeLoad) Process(fileContentSlice []string, issue *types.Issue, _ *[]types.Issue) error {
	lineStart := issue.Location.Position.Begin.Line
	lineEnd := issue.Location.Position.End.Line

	// Count lines in the file
	numLines := len(fileContentSlice)

	// Calculate the line number from where the highlighting should start
	if lineStart-sourceCodeOffset < 1 {
		lineStartWithOffset = 1
	} else {
		lineStartWithOffset = lineStart - sourceCodeOffset
	}

	// Calculate the line number from where the highlighting should end
	if lineEnd+sourceCodeOffset > numLines {
		lineEndWithOffset = numLines
	} else {
		lineEndWithOffset = lineEnd + sourceCodeOffset
	}

	formattedFileContent := getFinalFormattedSlice(fileContentSlice, issue)
	chromaFormattedSlice := formattedFileContent.fileContent
	chromaHighlightedSlice := formattedFileContent.highlightedContent

	finalFormattedSlice := make([]string, 0)
	finalFormattedSlice = append(finalFormattedSlice, `<div class="highlight"><pre>`)

	// Get the file slice to write
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
	return nil
}
