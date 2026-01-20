package browse

import (
	"context"
	"fmt"
	"strings"

	"github.com/MakeNowJust/heredoc"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/deepsource/issues"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	issuesvc "github.com/deepsourcelabs/cli/internal/services/issues"
	"github.com/spf13/cobra"
)

const maxIssueLimit = 100

type BrowseOptions struct {
	FileArg     string
	RepoArg     string
	AnalyzerArg []string
	LimitArg    int
}

// NewCmdIssuesBrowse lets users cycle through issues one at a time.
func NewCmdIssuesBrowse() *cobra.Command {
	opts := BrowseOptions{
		LimitArg: 30,
	}

	doc := heredoc.Docf(`
		Interactively browse issues one at a time.

		To browse issues for the current repository:
		%[1]s

		To browse issues for a specific repository, use the %[2]s flag:
		%[3]s
		`, style.Cyan("deepsource issues browse"), style.Yellow("--repo"), style.Cyan("deepsource issues browse --repo repo_name"))

	cmd := &cobra.Command{
		Use:   "browse [path]",
		Short: "Interactively browse reported issues",
		Long:  doc,
		Args:  args.MaxNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 1 {
				opts.FileArg = args[0]
			}
			return opts.Run()
		},
	}

	cmd.Flags().StringVarP(&opts.RepoArg, "repo", "r", "", "Browse issues for the specified repository")
	cmd.Flags().StringArrayVarP(&opts.AnalyzerArg, "analyzer", "a", nil, "Browse issues for the specified analyzer")
	cmd.Flags().IntVarP(&opts.LimitArg, "limit", "l", 30, "Fetch issues upto the specified limit")

	return cmd
}

func (opts *BrowseOptions) Run() error {
	if opts.LimitArg > maxIssueLimit {
		return fmt.Errorf("The maximum allowed limit to fetch issues is 100. Found %d", opts.LimitArg)
	}

	ctx := context.Background()
	svc := issuesvc.NewService(config.DefaultManager())
	fileArgs := []string{}
	if opts.FileArg != "" {
		fileArgs = []string{opts.FileArg}
	}

	result, err := svc.List(ctx, issuesvc.ListOptions{
		RepoArg:      opts.RepoArg,
		FileArgs:     fileArgs,
		AnalyzerArgs: opts.AnalyzerArg,
		Limit:        opts.LimitArg,
	})
	if err != nil {
		return err
	}

	if len(result.Issues) == 0 {
		fmt.Println("No issues found.")
		return nil
	}

	// Start the bubbletea program
	p := tea.NewProgram(initialModel(result.Issues))
	if _, err := p.Run(); err != nil {
		return fmt.Errorf("error running browse UI: %w", err)
	}

	return nil
}

// Model represents the bubbletea model
type model struct {
	issues       []issues.Issue
	currentIndex int
	width        int
	height       int
}

func initialModel(issues []issues.Issue) model {
	return model{
		issues:       issues,
		currentIndex: 0,
		width:        80,
		height:       24,
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c", "esc":
			return m, tea.Quit
		case "n", "right", "j", "down":
			if m.currentIndex < len(m.issues)-1 {
				m.currentIndex++
			}
		case "p", "left", "k", "up":
			if m.currentIndex > 0 {
				m.currentIndex--
			}
		case "g", "home":
			m.currentIndex = 0
		case "G", "end":
			m.currentIndex = len(m.issues) - 1
		}
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
	}
	return m, nil
}

func (m model) View() string {
	if len(m.issues) == 0 {
		return "No issues found.\n"
	}

	var b strings.Builder

	// Styles
	titleStyle := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("12")).
		Background(lipgloss.Color("0")).
		Padding(0, 1)

	headerStyle := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("14"))

	labelStyle := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("11")).
		Width(12).
		Align(lipgloss.Left)

	valueStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("15"))

	severityStyle := lipgloss.NewStyle().
		Bold(true).
		Padding(0, 1)

	footerStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("8")).
		Italic(true)

	issue := m.issues[m.currentIndex]

	// Header
	header := titleStyle.Render(fmt.Sprintf(" Issue %d/%d ", m.currentIndex+1, len(m.issues)))
	b.WriteString(header)
	b.WriteString("\n\n")

	// Issue Title
	b.WriteString(headerStyle.Render(issue.IssueText))
	b.WriteString("\n\n")

	// Issue Details
	details := []struct {
		label string
		value string
		style lipgloss.Style
	}{
		{"Code", issue.IssueCode, valueStyle},
		{"Category", issue.IssueCategory, valueStyle},
		{"Severity", issue.IssueSeverity, getSeverityStyle(issue.IssueSeverity, severityStyle)},
		{"Analyzer", issue.Analyzer.Shortcode, valueStyle},
		{"Location", formatLocation(issue.Location), valueStyle},
	}

	for _, detail := range details {
		if detail.value != "" {
			b.WriteString(labelStyle.Render(detail.label))
			b.WriteString("  ")
			b.WriteString(detail.style.Render(detail.value))
			b.WriteString("\n")
		}
	}

	b.WriteString("\n")
	b.WriteString(strings.Repeat("─", min(m.width, 80)))
	b.WriteString("\n\n")

	// Footer with navigation hints
	navigationHints := []string{}
	if m.currentIndex > 0 {
		navigationHints = append(navigationHints, "←/p: previous")
	}
	if m.currentIndex < len(m.issues)-1 {
		navigationHints = append(navigationHints, "→/n: next")
	}
	if len(m.issues) > 2 {
		navigationHints = append(navigationHints, "g: first", "G: last")
	}
	navigationHints = append(navigationHints, "q: quit")

	footer := footerStyle.Render(strings.Join(navigationHints, " • "))
	b.WriteString(footer)
	b.WriteString("\n")

	return b.String()
}

// Helper functions

func getSeverityStyle(severity string, baseStyle lipgloss.Style) lipgloss.Style {
	switch strings.ToUpper(severity) {
	case "CRITICAL":
		return baseStyle.Foreground(lipgloss.Color("9")).Background(lipgloss.Color("0"))
	case "MAJOR":
		return baseStyle.Foreground(lipgloss.Color("202"))
	case "MINOR":
		return baseStyle.Foreground(lipgloss.Color("11"))
	default:
		return baseStyle.Foreground(lipgloss.Color("15"))
	}
}

func formatLocation(loc issues.Location) string {
	if loc.Path == "" {
		return ""
	}

	line := ""
	if loc.Position.BeginLine > 0 {
		line = fmt.Sprintf(":%d", loc.Position.BeginLine)
		if loc.Position.EndLine > loc.Position.BeginLine {
			line = fmt.Sprintf("%s-%d", line, loc.Position.EndLine)
		}
	}
	return fmt.Sprintf("%s%s", loc.Path, line)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
