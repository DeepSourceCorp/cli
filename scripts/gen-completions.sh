#!/bin/sh

set -e

rm -rf completions
mkdir completions

for shell in bash zsh fish; do
  go run main.go completion "$shell" > "completions/deepsource.$shell"
done
