FROM node:14.19-alpine AS builder

ARG DISABLE_SENTRY
ARG ZEAL_SECRET

ARG STRIPE_PUBLISHABLE_KEY
ARG GOOGLE_ANALYTICS_ID
ARG NODE_ENV
ARG DOMAIN
ARG ON_PREM

ENV STRIPE_KEY=$STRIPE_PUBLISHABLE_KEY

RUN apk update && \
    apk add git make

COPY package.json yarn.lock /app/

WORKDIR /app

RUN yarn

COPY . /app

RUN make build

FROM node:14.19-alpine AS node

FROM frolvlad/alpine-glibc:alpine-3.15_glibc-2.34

ENV NUXT_HOST=0.0.0.0

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY --from=builder /app/.nuxt /app/.nuxt
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/tsconfig.json /app/tsconfig.json
COPY --from=builder /app/nuxt.config.js /app/nuxt.config.js
COPY --from=builder /app/content /app/content
COPY --from=builder /app/server /app/server
COPY --from=builder /app/static /app/static
COPY --from=builder /app/Makefile /app/Makefile
COPY --from=builder /app/.git /app/.git

RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl git make && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install

WORKDIR /app

EXPOSE 3000

CMD ["node_modules/@nuxt/cli/bin/nuxt-cli.js", "start", "--dotenv", "/config/.env"]
