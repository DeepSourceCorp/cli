FROM golang:1.17-alpine

# RUN mkdir /code
RUN apk update
RUN apk add make git
# RUN mkdir /code

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
COPY . ./

# RUN make build_local

