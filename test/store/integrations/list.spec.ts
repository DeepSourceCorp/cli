import { IntegrationShortcodes } from '~/mixins/integrationsDetailMixin'
import {
  actions,
  IntegrationsListActionContext,
  IntegrationsListActions,
  IntegrationsListModuleState,
  IntegrationsListMutations,
  mutations
} from '~/store/integrations/list'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { IntegrationSettingsLevel } from '~/types/types'

const integrations = [{ shortcode: IntegrationShortcodes.SLACK, installed: true }]

// Set `processs.client` to `true`
Object.defineProperty(process, 'client', {
  value: true
})

describe('[Store] Integrations/List', () => {
  describe('[[ Mutations ]]', () => {
    test(`Mutation "${IntegrationsListMutations.SET_INTEGRATIONS}"`, () => {
      const integrationsListState = { integrations: [] } as IntegrationsListModuleState

      // Invoke the Vuex mutation
      mutations[IntegrationsListMutations.SET_INTEGRATIONS](integrationsListState, integrations)

      // Assertions
      expect(integrationsListState.integrations).toEqual(integrations)
    })
  })

  describe('[[ Actions ]]', () => {
    let actionCxt = {} as IntegrationsListActionContext

    beforeEach(() => {
      actionCxt = {
        state: {
          integrations
        } as IntegrationsListModuleState,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: jest.fn(),
        rootGetters: jest.fn(),
        rootState: {}
      }
    })

    test(`Action "${IntegrationsListActions.FETCH_INTEGRATIONS}"`, async () => {
      const localThis = {
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return new Promise<GraphqlQueryResponse>((resolve) =>
            setTimeout(() => resolve({ data: { integrations } }), 10)
          )
        }
      }

      // Setting the global spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsListActions.FETCH_INTEGRATIONS].call(localThis as any, actionCxt, {
        level: IntegrationSettingsLevel.Owner,
        ownerId: 'T3duZXI6cXpscnh6'
      })

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).toHaveBeenCalledWith(
        IntegrationsListMutations.SET_INTEGRATIONS,
        integrations
      )
    })

    test(`Action "${IntegrationsListActions.FETCH_INTEGRATIONS}" error handler`, async () => {
      const localThis = {
        $fetchGraphqlData(): Promise<void> {
          return new Promise<void>((_, reject) => setTimeout(() => reject(), 10))
        },
        $logErrorAndToast: jest.fn()
      }

      // Setting the global spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsListActions.FETCH_INTEGRATIONS].call(localThis as any, actionCxt, {
        level: IntegrationSettingsLevel.Owner,
        ownerId: 'T3duZXI6cXpscnh6'
      })

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
        undefined,
        'There was an error fetching integrations.'
      )
    })
  })
})
