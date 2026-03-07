package cmdutil

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestResolveSkipTLSVerify(t *testing.T) {
	tests := []struct {
		name     string
		setupCmd func() *cobra.Command
		cfgValue bool
		want     bool
	}{
		{
			name:     "nil cmd, cfgValue false",
			setupCmd: func() *cobra.Command { return nil },
			cfgValue: false,
			want:     false,
		},
		{
			name:     "nil cmd, cfgValue true",
			setupCmd: func() *cobra.Command { return nil },
			cfgValue: true,
			want:     true,
		},
		{
			name: "cmd without skip-tls-verify flag, cfgValue false",
			setupCmd: func() *cobra.Command {
				return &cobra.Command{Use: "test"}
			},
			cfgValue: false,
			want:     false,
		},
		{
			name: "cmd without skip-tls-verify flag, cfgValue true",
			setupCmd: func() *cobra.Command {
				return &cobra.Command{Use: "test"}
			},
			cfgValue: true,
			want:     true,
		},
		{
			name: "cmd with flag not set, cfgValue false",
			setupCmd: func() *cobra.Command {
				root := &cobra.Command{Use: "root"}
				root.PersistentFlags().Bool("skip-tls-verify", false, "")
				child := &cobra.Command{Use: "child"}
				root.AddCommand(child)
				return child
			},
			cfgValue: false,
			want:     false,
		},
		{
			name: "cmd with flag not set, cfgValue true",
			setupCmd: func() *cobra.Command {
				root := &cobra.Command{Use: "root"}
				root.PersistentFlags().Bool("skip-tls-verify", false, "")
				child := &cobra.Command{Use: "child"}
				root.AddCommand(child)
				return child
			},
			cfgValue: true,
			want:     true,
		},
		{
			name: "cmd with flag set, cfgValue false",
			setupCmd: func() *cobra.Command {
				root := &cobra.Command{Use: "root"}
				root.PersistentFlags().Bool("skip-tls-verify", false, "")
				child := &cobra.Command{Use: "child"}
				root.AddCommand(child)
				// Simulate the flag being set on the command line
				root.PersistentFlags().Set("skip-tls-verify", "true")
				return child
			},
			cfgValue: false,
			want:     true,
		},
		{
			name: "cmd with flag set, cfgValue true",
			setupCmd: func() *cobra.Command {
				root := &cobra.Command{Use: "root"}
				root.PersistentFlags().Bool("skip-tls-verify", false, "")
				child := &cobra.Command{Use: "child"}
				root.AddCommand(child)
				root.PersistentFlags().Set("skip-tls-verify", "true")
				return child
			},
			cfgValue: true,
			want:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := tt.setupCmd()
			got := ResolveSkipTLSVerify(cmd, tt.cfgValue)
			if got != tt.want {
				t.Errorf("ResolveSkipTLSVerify() = %v, want %v", got, tt.want)
			}
		})
	}
}
