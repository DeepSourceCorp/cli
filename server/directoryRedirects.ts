import { ServerMiddleware } from '@nuxt/types'
import { IncomingMessage, NextFunction } from 'connect'
import { ServerResponse } from 'http'

/**
 * A utility to perform a redirect to a different url
 *
 * @param  {ServerResponse} res
 * @param  {string} location
 * @param  {number} status
 * @returns void
 */
const redirect = (res: ServerResponse, location: string, status = 302): void => {
  res.writeHead(status, {
    location
  })
  res.end()
}

/**
 * Server middleware function to handle redirects for Analyzer directory.
 *
 * - Temporarily redirect `/analyzers` and `/transformers` to `/directory`
 * - Permanently redirect old directory paths to new paths.
 *
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @param  {NextFunction} next
 * @returns void
 */
const directoryRedirect: ServerMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
): void => {
  const urlsToRedirect = ['/analyzers', '/transformers']
  const urlRegexToPermanentlyRedirect = /(?<stringToReplace>\/analyzer\/|\/transformer\/)/i
  let { url } = req
  if (url) {
    //? Handle redirect to directory
    if (url.slice(-1) === '/') {
      url = url.slice(0, -1)
    }
    if (urlsToRedirect.includes(url)) {
      return redirect(res, '/directory')
    }

    //? Handle 301 redirects for old url paths
    if (urlRegexToPermanentlyRedirect.test(url)) {
      const permanentlyRedirectedUrl = url
        .replace(/\/analyzer\//i, '/analyzers/')
        .replace(/\/transformer\//i, '/transformers/')
      // ! A 301 redirect is permanent and often cached by browser, be sure to test it fully before deploying it.
      return redirect(res, `/directory${permanentlyRedirectedUrl}`, 301)
    }
  }
  return next()
}

export default directoryRedirect
