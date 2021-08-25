FROM node:14.13-alpine as builder

ARG DISABLE_SENTRY
ARG ZEAL_SECRET
ARG DSN
ARG SENTRY_TOKEN
ARG STRIPE_PUBLISHABLE_KEY
ARG GOOGLE_ANALYTICS_ID
ARG NODE_ENV
ARG DOMAIN

ENV SENTRY_DSN=$DSN
ENV SENTRY_AUTH_TOKEN=$SENTRY_TOKEN
ENV STRIPE_KEY=$STRIPE_PUBLISHABLE_KEY
ENV SENTRY_RELEASE=1

RUN apk update && \
    apk add git make 

COPY package.json yarn.lock .npmrc /app/

WORKDIR /app

RUN yarn

COPY . /app

RUN make build && \
    rm -rf .npmrc

FROM sleavely/node-awscli:14.x

ENV NUXT_HOST=0.0.0.0

COPY --from=builder /app/.nuxt /app/.nuxt
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/tsconfig.json /app/tsconfig.json
COPY --from=builder /app/nuxt.config.js /app/nuxt.config.js
COPY --from=builder /app/content /app/content
COPY --from=builder /app/server /app/server
COPY --from=builder /app/static /app/static
COPY --from=builder /app/Makefile /app/Makefile

WORKDIR /app

EXPOSE 3000

CMD ["node_modules/@nuxt/typescript-runtime/bin/nuxt-ts.js", "start", "--dotenv", "/config/.env"]
