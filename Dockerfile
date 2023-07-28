FROM node:16-alpine AS builder

# Add any env added here to the final build step too
ARG STRIPE_PUBLISHABLE_KEY
ARG BIFROST_SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG COMMIT_SHA
ARG GOOGLE_ANALYTICS_ID
ARG NODE_ENV
ARG BIFROST_ENV
ARG DOMAIN
ARG ON_PREM

ENV STRIPE_KEY=$STRIPE_PUBLISHABLE_KEY
ENV BIFROST_ENV=$BIFROST_ENV
ENV NODE_ENV=$NODE_ENV
ENV DOMAIN=$DOMAIN

RUN apk update && \
    apk add git make

COPY package.json yarn.lock /app/

WORKDIR /app

# First install dev dependencies too for nuxt build,
# then run yarn install based on node_env (production for prod and dev)
RUN yarn install --production=false

COPY . /app

RUN make build && \
    yarn


FROM node:16-alpine AS node

FROM frolvlad/alpine-glibc:alpine-3.17_glibc-2.34

ARG NODE_ENV
ARG BIFROST_ENV
ARG DOMAIN
ARG ON_PREM

ENV BIFROST_ENV=$BIFROST_ENV
ENV NODE_ENV=$NODE_ENV
ENV DOMAIN=$DOMAIN
ENV ON_PREM=$ON_PREM

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
