package login

import (
	"github.com/deepsourcelabs/cli/cmdutils"
	"github.com/shurcooL/graphql"
	"github.com/spf13/cobra"
)

// Options holds the metadata.
type LoginOptions struct {
	LoginStatus        bool
	LoginEmail         string
	GraphQLClient      *graphql.Client
	JWT                string
	RefreshToken       string
	RefreshTokenExpiry int64
	AuthTimedOut       bool
}

// NewCmdVersion returns the current version of cli being used
func NewCmdLogin(cf *cmdutils.CLIFactory) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "login",
		Short: "Login to DeepSource using Command Line Interface",
		RunE: func(cmd *cobra.Command, args []string) error {
			o := LoginOptions{}
			err := o.Run()
			if err != nil {
				return err
			}
			return nil
		},
	}
	return cmd
}

// Validate impletments the Validate method for the ICommand interface.
func (o *LoginOptions) Validate() error {
	return nil
}

// Run executest the command.
func (o *LoginOptions) Run() error {

	// TODO: Check here if user is already authenticated before beginning login workflow
	// Will implement this in auth status and use that function here to get the status
	// o.LoginStatus = false

	// if o.LoginStatus == true {
	//     // Use survey to display message
	//     msg := fmt.Sprintf("You're already logged into deepsource.io as %s. Do you want to re-authenticate?", o.LoginEmail)
	//     helpText := ""
	//     response, err := api.ConfirmFromUser(msg, helpText)
	//     if err != nil {
	//         return err
	//     }

	//     if response == false {
	//         return nil
	//     }

	// Login flow starts
	err := o.startLoginFlow()
	if err != nil {
		return err
	}

	// }
	return nil
}
