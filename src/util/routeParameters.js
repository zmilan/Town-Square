import bs58 from 'bs58'

export const makeParamtersRoute = function (rootCommentId, base58EncodedConfig) {
  const routeArray = window.location.toString().split('/')

  // remove comment id
  const commentIndex = routeArray.lastIndexOf('thread')
  if (commentIndex > 0 && routeArray.length > commentIndex + 1) {
    routeArray.splice(commentIndex, 2)
  }

  // remove base58 encoded config
  const configIndex = routeArray.lastIndexOf('config')
  if (configIndex > 0 && routeArray.length > configIndex + 1) {
    routeArray.splice(configIndex, 2)
  }

  // rebuild the route without the comment id or config
  let route = ''
  routeArray.forEach(element => {
    route += element + '/'
  })

  return route +
    (rootCommentId ? `comment/${rootCommentId}/` : '') +
    (base58EncodedConfig ? `config/${base58EncodedConfig}/` : '')
}

export const getParameters = function () {
  // the route is expected to look something like:
  // .../comment/<rootCommentId>/config/<base58EncodedConfig>

  const parameters = {}
  const routeArray = window.location.toString().split('/')

  // read comment id
  const commentIndex = routeArray.lastIndexOf('thread')
  if (commentIndex > 0 && routeArray.length > commentIndex + 1) {
    const rootCommentId = Number(routeArray[commentIndex + 1])
    if (rootCommentId) {
      parameters.threadId = rootCommentId
    }
  }

  // read the base58 encoded config
  const configIndex = routeArray.lastIndexOf('config')
  if (configIndex > 0 && routeArray.length > configIndex + 1) {
    try {
      const base58UrlParam = routeArray[configIndex + 1]
      const bytes = bs58.decode(base58UrlParam)
      const config = JSON.parse(bytes.toString('ascii'))
      for (let key in config) {
        parameters[key] = config[key]
      }
    } catch (err) {
      console.error('There was a problem reading the url config parameter, using default config instead. ', err)
    }
  }

  return parameters
}
