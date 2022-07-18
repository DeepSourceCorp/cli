build:
	cd cmd/deepsource && GOOS=linux GOARCH=amd64 go build -tags static_all -o /tmp/deepsource .

build_local:
	cd cmd/deepsource && go build -tags static_all -o /tmp/deepsource .

test:
	go test -v -coverprofile=coverage.out -count=1 ./...

test_setup:
	mkdir -p ${CODE_PATH} ${APP_PATH}
	cd ${CODE_PATH} && ls -A1 | xargs rm -rf
	git clone https://github.com/deepsourcelabs/cli ${CODE_PATH}
	chmod +x /tmp/deepsource
	cp ./command/report/tests/dummy/python_coverage.xml /tmp
	# Setup git user and email on CI.
  ifeq ($(CI),true)
	 git config --global user.name github-actions
	 git config --global user.email github-actions@github.com
  endif
