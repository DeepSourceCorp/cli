import { Context } from '@nuxt/types'
import { ErrorResponse } from 'apollo-link-error'

export default (gqlError: ErrorResponse, { $config, error }: Context): void => {
  if (gqlError.graphQLErrors) {
    const errorObj = gqlError.graphQLErrors?.[0]
    if ($config.onPrem && errorObj && errorObj.message === 'User is disabled')
      error({ message: errorObj.message, statusCode: 403 })
  }
}
