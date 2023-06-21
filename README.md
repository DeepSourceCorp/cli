# bifrost

[![DeepSource](https://app.deepsource.com/gh/deepsourcelabs/bifrost.svg/?label=active+issues&show_trend=true&token=3nkERNaAYhpljn1V3cjYtHzg)](https://app.deepsource.com/gh/deepsourcelabs/bifrost/?ref=repository-badge)
[![DeepSource](https://app.deepsource.com/gh/deepsourcelabs/bifrost.svg/?label=resolved+issues&show_trend=true&token=3nkERNaAYhpljn1V3cjYtHzg)](https://app.deepsource.com/gh/deepsourcelabs/bifrost/?ref=repository-badge)

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

---

## Trigger enterprise dev build

1. Comment `/gcbrun` to queue the build on cloudbuild.
2. Go to the queued cloudbuild run and approve it.

> **Note**
> The image name for enteprise builds is of format `${PR_NUMBER}-enterprise` (e.g. `PR-2025-enterprise`).
