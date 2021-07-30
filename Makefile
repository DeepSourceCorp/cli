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
