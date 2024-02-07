PACKAGE_NAME          := github.com/deepsourcelabs/cli
GOLANG_CROSS_VERSION  ?= v1.21.6

SYSROOT_DIR     ?= sysroots
SYSROOT_ARCHIVE ?= sysroots.tar.bz2

build:
	cd cmd/deepsource && GOOS=linux GOARCH=amd64 go build -tags static_all -o /tmp/deepsource .

build_local:
	cd cmd/deepsource && go build -tags static_all -o /tmp/deepsource .

test:
	CGO_ENABLED=1 go test -v ./command/report/tests/... -count=1
	echo "\n====TESTING DEEPSOURCE PACKAGE====\n"
	CGO_ENABLED=1 go test -v ./deepsource/tests/...
	echo "\n====TESTING CONFIG VALIDATOR PACKAGE====\n"
	go test -v ./configvalidator/... -count=1
	echo "\n====CALCULATING TEST COVERAGE FOR ENTIRE PACKAGE====\n"
	go test -v -coverprofile=coverage.out -count=1 ./...

test_setup:
	mkdir -p ${CODE_PATH}
	cd ${CODE_PATH} && ls -A1 | xargs rm -rf
	git clone https://github.com/DeepSourceCorp/july ${CODE_PATH}
	chmod +x /tmp/deepsource
	cp ./command/report/tests/golden_files/python_coverage.xml /tmp

.PHONY: sysroot-pack
sysroot-pack:
	@tar cf - $(SYSROOT_DIR) -P | pv -s $[$(du -sk $(SYSROOT_DIR) | awk '{print $1}') * 1024] | pbzip2 > $(SYSROOT_ARCHIVE)

.PHONY: sysroot-unpack
sysroot-unpack:
	@pv $(SYSROOT_ARCHIVE) | pbzip2 -cd | tar -xf -

.PHONY: release-dry-run
release-dry-run:
	@if [ ! -f ".release-env" ]; then \
		echo "\033[91m.release-env is required for release\033[0m";\
		exit 1;\
	fi
	@docker run \
		--rm \
		-e CGO_ENABLED=1 \
		--env-file .release-env \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v `pwd`:/go/src/$(PACKAGE_NAME) \
		-v `pwd`/sysroot:/sysroot \
		-w /go/src/$(PACKAGE_NAME) \
		ghcr.io/goreleaser/goreleaser-cross:${GOLANG_CROSS_VERSION} \
                release --clean --skip-publish --skip-validate

.PHONY: release
release:
	@if [ ! -f ".release-env" ]; then \
		echo "\033[91m.release-env is required for release\033[0m";\
		exit 1;\
	fi
	docker run \
		--rm \
		-e CGO_ENABLED=1 \
		--env-file .release-env \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v `pwd`:/go/src/$(PACKAGE_NAME) \
		-v `pwd`/sysroot:/sysroot \
		-w /go/src/$(PACKAGE_NAME) \
		ghcr.io/goreleaser/goreleaser-cross:${GOLANG_CROSS_VERSION} \
                release --clean
