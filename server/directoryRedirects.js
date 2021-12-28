/**
 * A utility to perform a redirect to a different url
 *
 * @param  {Response} res
 * @param  {string} location
 * @param  {number} status
 * @returns void
 */
function redirect(res, location, status = 302) {
  res.writeHead(status, {
    location
  })
  res.end()
}

export default (req, res, next) => {
  const urlsToRedirect = ['/analyzers', '/transformers']
  const urlRegexToPermanentlyRedirect = /(?<stringToReplace>\/analyzer\/|\/transformer\/)/i
  let { url } = req
  if (url.slice(-1) === '/') {
    url = url.slice(0, -1)
  }
  if (urlsToRedirect.includes(url)) {
    return redirect(res, '/directory')
  }
  if (urlRegexToPermanentlyRedirect.test(url)) {
    const permanentlyRedirectedUrl = url
      .replace(/\/analyzer\//i, '/analyzers/')
      .replace(/\/transformer\//i, '/transformers/')
    // ! A 301 redirect is permanent and often cached by browser, be sure to test it fully before deploying it.
    return redirect(res, `/directory${permanentlyRedirectedUrl}`, 301)
  }
  return next()
}
