import { Component, namespace, mixins } from 'nuxt-property-decorator'

import {
  AdHocRunMutationTypes,
  AdHocRunActionTypes,
  AdHocRunAnalyzer
} from '~/store/repository/adHocRun'
import TomlGeneratorMixin from './tomlGeneratorMixin'

const adHocRunStore = namespace('repository/adHocRun')

@Component
export default class AdHocRunMixin extends mixins(TomlGeneratorMixin) {
  @adHocRunStore.State
  analyzers: Array<AdHocRunAnalyzer>

  @adHocRunStore.Mutation(AdHocRunMutationTypes.UPDATE_REPOSITORY)
  updateRepository: (repositoryId: string) => void

  @adHocRunStore.Mutation(AdHocRunMutationTypes.UPDATE_ANALYZER)
  updateAnalyzer: (analyzer: AdHocRunAnalyzer) => void

  @adHocRunStore.Mutation(AdHocRunMutationTypes.REMOVE_ANALYZER)
  removeAnalyzer: (analyzer: string) => void

  @adHocRunStore.Action(AdHocRunActionTypes.RESET_ALL_PREFERENCES)
  resetPreferences: () => void

  @adHocRunStore.Action(AdHocRunActionTypes.TRIGGER_ADHOC_RUN)
  triggerAdHocRun: (args: { config: string }) => void

  get toml(): string {
    return this.tomlTemplate(
      {
        version: 1,
        analyzers: this.analyzers,
        transformers: [],
        test_patterns: [],
        exclude_patterns: []
      },
      [],
      []
    )
  }
}
