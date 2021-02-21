build:
	cd cmd/deepsource && go build .

run:
	cd cmd/deepsource && ./deepsource auth login
