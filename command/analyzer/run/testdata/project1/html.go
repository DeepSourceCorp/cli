package main

import (
	"html/template"
	"os"
)

const tmpl = ""

func badHTMLTemplate() {
	a := "something from another place"
	t := template.Must(template.New("ex").Parse(tmpl))
	v := map[string]interface{}{
		"Title": "Test <b>World</b>",
		"Body":  template.HTML(a),
	}
	t.Execute(os.Stdout, v)
}
