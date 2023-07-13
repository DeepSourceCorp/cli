#!/bin/sh

set -e
rm -rf completions
mkdir completions

# Generate completion using the in-built cobra completion command
for shell in bash zsh fish; do
  go run cmd/deepsource/main.go completion "$shell" > "completions/deepsource.$shell"
done
