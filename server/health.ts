import { ServerMiddleware } from '@nuxt/types'

const healthMiddleware: ServerMiddleware = function (req, res, next) {
  return res.end("ok")
}

export default healthMiddleware