PACKAGE_NAME := "github.com/deepsourcelabs/cli"

build:
	cd cmd/deepsource && go build -o /tmp/deepsource .

test:
	go test -v ./command/report/tests/... -count=1
	echo "\n====TESTING DEEPSOURCE PACKAGE====\n"
	go test -v ./deepsource/tests/...
	echo "\n====CALCULATING TEST COVERAGE FOR ENTIRE PACKAGE====\n"
	go test -v -coverprofile=coverage.out -count=1 ./...

test-setup:
	mkdir -p $CODE_PATH
	cd $CODE_PATH && ls -A1 | xargs rm -rf
	git clone https://github.com/DeepSourceCorp/july $CODE_PATH
	chmod +x /tmp/deepsource
	cp ./command/report/tests/golden_files/python_coverage.xml /tmp

clean:
	rm -rf /tmp/deepsource coverage.out dist/ completions/

bump-patch:
	#!/usr/bin/env bash
	set -euo pipefail
	current=$(cat VERSION)
	IFS='.' read -r major minor patch <<< "$current"
	new="${major}.${minor}.$((patch + 1))"
	echo "$new" > VERSION
	git add VERSION
	git commit -m "Bump version to ${new}"
	echo "Bumped ${current} -> ${new}"

bump-minor:
	#!/usr/bin/env bash
	set -euo pipefail
	current=$(cat VERSION)
	IFS='.' read -r major minor patch <<< "$current"
	new="${major}.$((minor + 1)).0"
	echo "$new" > VERSION
	git add VERSION
	git commit -m "Bump version to ${new}"
	echo "Bumped ${current} -> ${new}"

bump-major:
	#!/usr/bin/env bash
	set -euo pipefail
	current=$(cat VERSION)
	IFS='.' read -r major minor patch <<< "$current"
	new="$((major + 1)).0.0"
	echo "$new" > VERSION
	git add VERSION
	git commit -m "Bump version to ${new}"
	echo "Bumped ${current} -> ${new}"

deploy:
	#!/usr/bin/env bash
	set -euo pipefail
	version=$(cat VERSION)
	tag="v${version}"
	echo "Creating tag ${tag}..."
	git tag -a "${tag}" -m "Release ${tag}"
	git push origin "${tag}"
	echo "Pushed ${tag} — build-and-deploy workflow triggered"

deploy-dev:
	#!/usr/bin/env bash
	set -euo pipefail
	version=$(cat VERSION)
	hash=$(git rev-parse --short HEAD)
	tag="v${version}-${hash}"
	echo "Creating dev tag ${tag}..."
	git tag -a "${tag}" -m "Dev release ${tag}"
	git push origin "${tag}"
	echo "Pushed ${tag} — dev build-and-deploy workflow triggered"
