build:
	cd cmd/deepsource && GOOS=linux GOARCH=amd64 go build -tags static_all -o /tmp/deepsource .

build_local:
	cd cmd/deepsource && go build -tags static_all -o /tmp/deepsource .
	
	

test:
	CGO_ENABLED=0 go test -v ./command/report/tests/... -run TestReportKeyValueWorkflow -count=1
	CGO_ENABLED=0 go test -v ./command/report/tests/... -run TestReportKeyValueFileWorkflow -count=1
	echo "\n====TESTING DEEPSOURCE PACKAGE====\n"
	CGO_ENABLED=0 go test -v ./deepsource/tests/...
	echo "\n====TESTING CONFIG VALIDATOR PACKAGE====\n"
	go test -v ./configvalidator/... -count=1
	echo "\n====CALCULATING TEST COVERAGE FOR ENTIRE PACKAGE====\n"
	go test -v -coverprofile=coverage.out -count=1 ./...

test_setup:
	mkdir -p ${CODE_PATH}
	cd ${CODE_PATH} && ls -A1 | xargs rm -rf
	git clone https://github.com/deepsourcelabs/cli ${CODE_PATH}
	chmod +x /tmp/deepsource
	cp ./command/report/tests/dummy/python_coverage.xml /tmp
