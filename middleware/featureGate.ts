import { Middleware } from '@nuxt/types'
import { AppFeatures } from '~/types/permTypes'
import { VcsProviderChoices } from '~/types/types'

const checkFeatureAllowed: Middleware = ({ route, error, $providerMetaMap, $gateKeeper }) => {
  const featuresArray: AppFeatures[] = []

  route.meta.forEach((meta: { gateFeature?: AppFeatures | AppFeatures[] }) => {
    if (meta?.gateFeature) {
      featuresArray.push(
        ...(Array.isArray(meta.gateFeature) ? meta.gateFeature : [meta.gateFeature])
      )
    }
  })

  if (featuresArray.length) {
    let routeAllowed = false

    const provider = $providerMetaMap[route.params.provider].value as VcsProviderChoices
    if (provider) {
      routeAllowed = featuresArray.reduce((shouldAllow: boolean, currentFeature: AppFeatures) => {
        return $gateKeeper.provider(currentFeature, provider) && shouldAllow
      }, true)
    }

    if (!routeAllowed) {
      error({ statusCode: 404, message: 'This page is not real' })
    }
  }
}

export default checkFeatureAllowed
