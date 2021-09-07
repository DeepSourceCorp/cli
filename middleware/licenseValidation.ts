import { Middleware } from '@nuxt/types'

const licenseValidation: Middleware = ({ $config, error }) => {
  if ($config.onPrem) {
    const expiryDate = new Date($config.licenseExpiry)
    const today = new Date()
    if (today > expiryDate) {
      error({ statusCode: 403, message: 'license-expired' })
    }
  }
}

export default licenseValidation
