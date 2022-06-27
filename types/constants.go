package types

// Issue category maps.
var IssueCategoryMap = map[string]string{
	"bug-risk":    "Bug risk",
	"antipattern": "Anti-pattern",
	"performance": "Performance",
	"style":       "Style",
	"security":    "Security",
	"coverage":    "Coverage",
	"typecheck":   "Type check",
	"doc":         "Documentation",
}

// Default supported metrics map.
var MetricMap = map[string]string{
	"BCV": "Branch coverage",
	"ADC": "API documentation coverage",
	"TDC": "Test documentation coverage",
	"IDP": "Indirect dependencies",
	"TCV": "Test coverage",
	"DDP": "Direct dependencies",
	"DCV": "Application documentation coverage",
}
