FROM golang:1.18.2-alpine3.15

RUN apk add --no-cache make git curl

RUN mkdir /app
COPY . /app

WORKDIR /app

RUN pwd
RUN ls

