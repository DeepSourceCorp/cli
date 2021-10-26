function redirect(res, location) {
  res.writeHead(302, {
    location
  })
  res.end()
}

export default (req, res, next) => {
  const urlsToRedirect = ['/analyzers', '/transformers']
  let { url } = req
  if (url.slice(-1) === '/') {
    url = url.slice(0, -1)
  }
  if (urlsToRedirect.includes(url)) {
    return redirect(res, '/directory')
  }
  return next()
}
