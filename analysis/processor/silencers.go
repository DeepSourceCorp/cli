package processor

import (
	"regexp"
	"strings"
)

var languagesMeta map[string]LanguageMeta

// for the extension e.g .py, .go, .js etc build a map of compiled
// regex with the corresponding comment identifier in regex.
var regexMap map[string]regexp.Regexp

// Silencers data structure
type IssueSilencer struct {
	PortName     string            `json:"port_name"`
	SilencerCode string            `json:"silencer_code"`
	Issues       map[string]string `json:"issues"`
	TagSeparator string            `json:"tag_separator"`
}

type LanguageMeta struct {
	Extension         string          `json:"extension"`
	CommentIdentifier string          `json:"comment_identifier"`
	Silencers         []IssueSilencer `json:"issue_silencers"`
}

// Reads the `silencers.json` file present in `/toolbox` directory
// and makes a LanguageMeta map which helps in processing skipcq
func prepareSilencersMeta() []LanguageMeta {
	// Sane default meta to use when failed to read the silencers file.
	// Also, appended to the every config
	issuesMeta := []LanguageMeta{
		{
			Extension:         "default_extension",
			CommentIdentifier: `(\#|\/\/)`,
			Silencers:         []IssueSilencer{},
		},
	}
	return issuesMeta
}

func generateRegExp(fileExt string) regexp.Regexp {
	skipCQTags := []string{"skipcq"} // analyzer specific issues silencer tags, with `skipcq` tag

	// different analyzers may have different ending token for issue silencing. eg. Pylint has `=` while
	// most others have `:`
	separators := map[string]int{
		":": 1, // default, for skipcq
	}
	for _, silencer := range languagesMeta[fileExt].Silencers {
		skipCQTags = append(skipCQTags, silencer.SilencerCode)
		separators[silencer.TagSeparator] = 1
	}

	separatorsList := []string{}

	for k := range separators {
		separatorsList = append(separatorsList, k)
	}

	commentIdentifier := languagesMeta[fileExt].CommentIdentifier
	regex := *regexp.MustCompile(
		// case-insensitive
		`(?i)` +

			// group the silencer tags with a name, matching one of the many issue silencers (eg, noqa, nosec)
			commentIdentifier + `.*?(?P<skipcq_tag>(` + strings.Join(skipCQTags, "|") + `))` +

			// zero or more occurrences of the issue codes, ends at `)?` later
			`(` +

			// separators, like `:` and `=`
			`?:(` + strings.Join(separatorsList, "|") + `)[\s]?` +

			// create a group named issue_codes, with pattern similar to PYL-W0614 or SA1022
			`(?P<issue_codes>([A-Z]*-?[A-Z]*[0-9]+(?:,(\s+)?)?)+)` +

			// zero or one occurrences of `: issuecode1, issuecode2` and so on
			`)?`,
	)

	return regex
}

func generateSilencersRegexMap() {
	langMeta := make(map[string]LanguageMeta)
	silencerRegexMap := make(map[string]regexp.Regexp)

	// Fetch the silencers meta from the analyzer's .deepsource/silencers.json file
	silencersData := prepareSilencersMeta()

	for _, silencerData := range silencersData {
		langMeta[silencerData.Extension] = silencerData
	}
	languagesMeta = langMeta

	for ext := range langMeta {
		silencerRegexMap[ext] = generateRegExp(ext)
	}
	regexMap = silencerRegexMap
}
