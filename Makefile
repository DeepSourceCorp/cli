VERSION?=$(shell git rev-parse --short HEAD)

.ONESHELL:

build:
	export CDN_URL=https://$(DOMAIN)/bifrost/$(VERSION) && \
	yarn build

sync-files:
	aws s3 sync .nuxt/dist/client $(S3_BUCKET)/bifrost/$(VERSION)  --acl public-read --cache-control max-age=31536000 --size-only --delete

sync-files-r2:
	aws s3 sync .nuxt/dist/client $(R2_BUCKET)/bifrost/$(VERSION) --endpoint-url $(R2_ENDPOINT) --acl public-read --cache-control max-age=31536000 --size-only --delete

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
