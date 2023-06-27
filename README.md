# bifrost

[![DeepSource](https://corp.deepsource.icu/gh/DeepSourceCorp/bifrost.svg/?label=active+issues&show_trend=true&token=VQi1-IA1Lz2dHJn5PhuPK2J1)](https://corp.deepsource.icu/gh/DeepSourceCorp/bifrost/?ref=repository-badge)
[![DeepSource](https://corp.deepsource.icu/gh/DeepSourceCorp/bifrost.svg/?label=resolved+issues&show_trend=true&token=VQi1-IA1Lz2dHJn5PhuPK2J1)](https://corp.deepsource.icu/gh/DeepSourceCorp/bifrost/?ref=repository-badge)

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
