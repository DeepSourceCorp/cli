FROM golang:1.17.6-alpine3.15
USER root

RUN mkdir -p /toolbox /app /code
RUN apk add --no-cache openssh shadow git grep

COPY . /app
WORKDIR /app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/todo-checker .

# delete any user with uid 1000, then create the runner user with uid 1000
RUN adduser -D -u 1000 runner runner && \
    mkdir -p /.cache /code /home/runner/go && \
    chmod -R ugo+rwx /toolbox /.cache /code /home/runner && \
    chown -R runner:runner /toolbox /.cache /code /home/runner

WORKDIR /app

USER runner
