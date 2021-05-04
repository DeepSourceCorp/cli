build:
	GOOS=linux GOARCH=amd64 go build -tags static_all -o /tmp/deepsource .

test:
	CGO_ENABLED=0 go test -cover -coverprofile=coverage.out -v ./tests/... -run TestReportKeyValueWorkflow
	CGO_ENABLED=0 go test --cover -coverprofile=coverage.out -v ./tests/... -run TestReportKeyValueFileWorkflow

test_setup:
	mkdir -p ${CODE_PATH}
	cd ${CODE_PATH} && ls -A1 | xargs rm -rf
	git clone https://github.com/deepsourcelabs/cli ${CODE_PATH}
	chmod +x /tmp/deepsource
	cp ./tests/dummy/python_coverage.xml /tmp
