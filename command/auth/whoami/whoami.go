package whoami

import (
	"context"
	"fmt"
	"strings"

	"github.com/MakeNowJust/heredoc"
	"github.com/deepsourcelabs/cli/config"
	"github.com/deepsourcelabs/cli/internal/cli/args"
	"github.com/deepsourcelabs/cli/internal/cli/style"
	authsvc "github.com/deepsourcelabs/cli/internal/services/auth"
	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

type WhoAmIOptions struct{}

// NewCmdWhoAmI shows the authenticated user and accounts.
func NewCmdWhoAmI() *cobra.Command {
	doc := heredoc.Docf(`
		Show the authenticated user and available accounts.

		Use %[1]s to view the current user.
	`, style.Cyan("deepsource auth whoami"))

	cmd := &cobra.Command{
		Use:   "whoami",
		Short: "Show the current user",
		Long:  doc,
		Args:  args.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			opts := WhoAmIOptions{}
			return opts.Run(cmd.Context())
		},
	}
	return cmd
}

func (opts *WhoAmIOptions) Run(ctx context.Context) error {
	svc := authsvc.NewService(config.DefaultManager())
	cfg, err := svc.LoadConfig()
	if err != nil {
		return fmt.Errorf("Error while reading DeepSource CLI config : %v", err)
	}
	if err := cfg.VerifyAuthentication(); err != nil {
		return err
	}

	user, err := svc.GetViewer(ctx, cfg)
	if err != nil {
		return err
	}

	fullName := strings.TrimSpace(strings.Join([]string{user.FirstName, user.LastName}, " "))
	if fullName == "" {
		fullName = "-"
	}

	pterm.DefaultSection.Println("User")
	userSummary := [][]string{
		{"Name", fullName},
		{"Email", user.Email},
		{"ID", user.ID},
	}
	pterm.DefaultTable.WithData(userSummary).WithBoxed(false).Render()

	if len(user.Accounts) == 0 {
		pterm.Println("Accounts: none")
		return nil
	}

	pterm.Println("")
	pterm.DefaultSection.Println("Accounts")
	accountsTable := [][]string{{"Account", "Type", "VCS", "ID"}}
	for _, account := range user.Accounts {
		label := strings.TrimSpace(account.Login)
		if label == "" {
			label = "-"
		}
		accountsTable = append(accountsTable, []string{
			label,
			account.Type,
			account.VCSProvider,
			account.ID,
		})
	}
	pterm.DefaultTable.WithHasHeader(true).WithData(accountsTable).Render()
	return nil
}
