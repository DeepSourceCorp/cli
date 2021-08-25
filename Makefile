VERSION?=$(shell git rev-parse --short HEAD)

.ONESHELL:

build:
	export CDN_URL=https://$(DOMAIN)/$(VERSION)/bifrost && \
	yarn build

sync-files:
	aws s3 sync .nuxt/dist/client $(S3_BUCKET)/$(VERSION)/bifrost  --acl public-read --cache-control max-age=31536000 --size-only --delete && \
	aws s3 cp --recursive static $(S3_BUCKET)/$(VERSION)/bifrost  --acl public-read --cache-control max-age=31536000

major:
	@git pull --tags; \
	IFS='.' read -ra tag <<< "$$(git describe --tags `git rev-list --tags --max-count=1`)"; \
	bump=$$(($${tag[0]:1} + 1)); \
	ver=v$$bump.0.0; \
	rem=$$(git remote); \
	git tag $$ver; \
	git push $$rem $$ver

minor:
	@git pull --tags; \
	IFS='.' read -ra tag <<< "$$(git describe --tags `git rev-list --tags --max-count=1`)"; \
	bump=$$(($${tag[1]} + 1)); \
	ver=$${tag[0]}.$$bump.0; \
	rem=$$(git remote); \
	git tag $$ver; \
	git push $$rem $$ver

patch:
	@git pull --tags; \
	IFS='.' read -ra tag <<< "$$(git describe --tags `git rev-list --tags --max-count=1`)"; \
	bump=$$(($${tag[2]} + 1)); \
	ver=$${tag[0]}.$${tag[1]}.$$bump; \
	rem=$$(git remote); \
	git tag $$ver; \
	git push $$rem $$ver
