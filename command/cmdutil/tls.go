package cmdutil

import "github.com/spf13/cobra"

// ResolveSkipTLSVerify returns true if TLS verification should be skipped.
// Priority: --skip-tls-verify flag > config value (which includes env var).
func ResolveSkipTLSVerify(cmd *cobra.Command, cfgValue bool) bool {
	if cmd != nil {
		if f := cmd.Root().PersistentFlags().Lookup("skip-tls-verify"); f != nil && f.Changed {
			return true
		}
	}
	return cfgValue
}
