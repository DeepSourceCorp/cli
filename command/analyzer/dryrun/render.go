package dryrun

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/deepsourcelabs/cli/types"
)

/* Routes:
 * /issues
 * /issue/TCV-001/occurences
 * /issues?category=all
 * /issues?category=performance  */

type ResultData struct {
	Title              string
	SourcePath         string
	AnalyzerTOMLData   types.AnalyzerTOML
	Issues             []types.Issue
	Metrics            []types.Metric
	AnalysisResult     types.AnalysisResult
	RenderedSourceCode []template.HTML
	// OccurencesArray    []Occurences
}

func (a *AnalyzerDryRun) renderResultsOnBrowser() {
	const tpl = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>{{.Title}}</title>
        <link href="static/style.css" type="text/css" rel="stylesheet"/>
	</head>
	<body>
    {{ $scd := .RenderedSourceCode }}
    {{ range $index, $issue := .Issues }}
            <div>{{ $issue.IssueCode }} {{ $issue.IssueText }} {{ $issue.Location.Path }}<br>
            {{index $scd $index}}
            </div>
        {{end}}
	</body>
</html>`

	t, err := template.New("issues").Parse(tpl)
	if err != nil {
		fmt.Println(err)
	}

	data := ResultData{
		Title:          "Analyzer Dry Run",
		AnalysisResult: a.AnalysisResult,
		Issues:         a.AnalysisResult.Issues,
	}

	for _, issue := range a.AnalysisResult.Issues {
		data.RenderedSourceCode = append(data.RenderedSourceCode, template.HTML(issue.ProcessedData.SourceCode.Rendered))
	}

	http.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		err = t.Execute(w, data)
		if err != nil {
			fmt.Println(err)
		}
	})
	log.Fatalln(http.ListenAndServe(":8080", nil))
}
