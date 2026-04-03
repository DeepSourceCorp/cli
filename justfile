PACKAGE_NAME := "github.com/deepsourcelabs/cli"

default:
    @just --list

# Build the CLI binary (CI alias)
build: build-local

# Build the CLI binary to /tmp/deepsource
build-local:
	cd cmd/deepsource && go build -o /tmp/deepsource .

# Run all tests with coverage
test:
	go test -v -coverprofile=coverage.out -count=1 ./...

# Remove build artifacts and coverage files
clean:
	rm -rf /tmp/deepsource coverage.out dist/

# Bump patch version (x.y.Z)
bump-patch:
	#!/usr/bin/env bash
	set -euo pipefail
	current=$(cat VERSION)
	IFS='.' read -r major minor patch <<< "$current"
	new="${major}.${minor}.$((patch + 1))"
	echo "$new" > VERSION
	git add VERSION
	git commit -m "chore: bump version to ${new}"
	echo "Bumped ${current} -> ${new}"

# Bump minor version (x.Y.0)
bump-minor:
	#!/usr/bin/env bash
	set -euo pipefail
	current=$(cat VERSION)
	IFS='.' read -r major minor patch <<< "$current"
	new="${major}.$((minor + 1)).0"
	echo "$new" > VERSION
	git add VERSION
	git commit -m "chore: bump version to ${new}"
	echo "Bumped ${current} -> ${new}"

# Bump major version (X.0.0)
bump-major:
	#!/usr/bin/env bash
	set -euo pipefail
	current=$(cat VERSION)
	IFS='.' read -r major minor patch <<< "$current"
	new="$((major + 1)).0.0"
	echo "$new" > VERSION
	git add VERSION
	git commit -m "chore: bump version to ${new}"
	echo "Bumped ${current} -> ${new}"

# Tag and push a production release
deploy-prod:
	#!/usr/bin/env bash
	set -euo pipefail
	version=$(cat VERSION)
	tag="v${version}"
	echo "Creating tag ${tag}..."
	git tag -s "${tag}" -m "Release ${tag}"
	git push origin "${tag}"
	echo "Pushed ${tag} — build-and-deploy workflow triggered"

# Tag and push a dev release (version + commit hash)
deploy-dev:
	#!/usr/bin/env bash
	set -euo pipefail
	version=$(cat VERSION)
	hash=$(git rev-parse --short HEAD)
	tag="v${version}-${hash}"
	echo "Creating dev tag ${tag}..."
	git tag -s "${tag}" -m "Dev release ${tag}"
	git push origin "${tag}"
	echo "Pushed ${tag} — dev build-and-deploy workflow triggered"
