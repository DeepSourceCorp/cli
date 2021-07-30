import { AdHocRunStore } from '~/store/repository/adHocRun'

/**
 * Mock factory
 */
export const mockAdHocRunStore = (): AdHocRunStore => ({
  repositoryId: '',
  analyzers: []
})
