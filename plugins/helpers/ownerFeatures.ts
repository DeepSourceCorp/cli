import { Inject, Context } from '@nuxt/types/app'
import { OwnerFeature, OwnerFeatureType } from '~/types/ownerTypes'
import { OwnerFeaturesQueryVariables } from '~/types/types'

import OwnerFeaturesGQLQuery from '~/apollo/queries/owner/features.gql'

export type IsFeatureAvailableT = (
  feature: OwnerFeatureType,
  queryArgs: OwnerFeaturesQueryVariables
) => Promise<boolean>

declare module 'vue/types/vue' {
  interface Vue {
    $isFeatureAvailable: IsFeatureAvailableT
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $isFeatureAvailable: IsFeatureAvailableT
  }
  interface Context {
    $isFeatureAvailable: IsFeatureAvailableT
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $isFeatureAvailable: IsFeatureAvailableT
  }
}

export default ({ $fetchGraphqlData }: Context, inject: Inject): void => {
  // Fetch features available for owner and compare it against the features list passed in params
  const isFeatureAvailable: IsFeatureAvailableT = async function (
    feature: OwnerFeatureType,
    queryArgs: OwnerFeaturesQueryVariables
  ): Promise<boolean> {
    const { login, provider } = queryArgs

    const response = await $fetchGraphqlData(OwnerFeaturesGQLQuery, {
      login,
      provider
    })

    const ownerFeatureList = response.data.owner.features as OwnerFeature[]

    return ownerFeatureList.some(({ shortcode, enabled }) => shortcode === feature && enabled)
  }

  inject('isFeatureAvailable', isFeatureAvailable)
}
