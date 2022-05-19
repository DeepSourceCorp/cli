import {
  actions,
  IntegrationsDetailActionContext,
  IntegrationsDetailActions,
  IntegrationsDetailModuleState,
  IntegrationsDetailMutations,
  mutations
} from '~/store/integrations/detail'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IntegrationInstallationStep,
  IntegrationProviderStatus,
  IntegrationSettingsLevel,
  User
} from '~/types/types'

// Mocks
const integrationDetails = {
  shortcode: 'slack',
  logo: 'http://dev-asgard-static.s3.us-east-1.amazonaws.com/integration_logos/slack.svg',
  status: IntegrationProviderStatus.ConfigRequired,
  installed: true,
  enabledOn: '2022-03-28T09:43:56.837404+00:00',
  enabledBy: {
    id: 'VXNlcjpkemdkeWI=',
    email: 'test@test.com',
    fullName: 'Test User'
  } as User,
  settings: {
    channel: 'issues'
  },
  options: {
    channel: ['issues', 'general', 'random']
  }
}

const installIntegrationPayload = {
  nextStep: IntegrationInstallationStep.ConfigReqd,
  options: { channel: ['issues', 'general', 'random'] }
}

// Set `processs.client` to `true`
Object.defineProperty(process, 'client', {
  value: true
})

describe('[Store] Integrations/Detail', () => {
  describe('[[ Mutations ]]', () => {
    test(`Mutation "${IntegrationsDetailMutations.SET_INTEGRATION_DETAILS}"`, () => {
      const integrationsDetailState = {
        integration: {},
        installIntegrationPayload: {}
      } as IntegrationsDetailModuleState

      // Invoke the Vuex mutation
      mutations[IntegrationsDetailMutations.SET_INTEGRATION_DETAILS](
        integrationsDetailState,
        integrationDetails
      )

      // Assertions
      expect(integrationsDetailState.integration).toEqual(integrationDetails)
    })

    test(`Mutation "${IntegrationsDetailMutations.SET_INSTALL_INTEGRATION_PAYLOAD}"`, () => {
      const integrationsDetailState = {
        integration: {},
        installIntegrationPayload: {}
      } as IntegrationsDetailModuleState

      // Invoke the Vuex mutation
      mutations[IntegrationsDetailMutations.SET_INSTALL_INTEGRATION_PAYLOAD](
        integrationsDetailState,
        installIntegrationPayload
      )

      // Assertions
      expect(integrationsDetailState.installIntegrationPayload).toEqual(installIntegrationPayload)
    })
  })

  describe('[[ Actions ]]', () => {
    let actionCxt = {} as IntegrationsDetailActionContext
    beforeEach(() => {
      actionCxt = {
        state: {
          integration: integrationDetails
        } as IntegrationsDetailModuleState,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: jest.fn(),
        rootGetters: jest.fn(),
        rootState: {}
      }
    })

    test(`Action "${IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS}"`, async () => {
      const localThis = {
        async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return new Promise<GraphqlQueryResponse>((resolve) =>
            setTimeout(() => resolve({ data: { integration: integrationDetails } }), 10)
          )
        }
      }

      // Set spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).toHaveBeenCalledWith(
        IntegrationsDetailMutations.SET_INTEGRATION_DETAILS,
        integrationDetails
      )
    })

    test(`Action "${IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS}" error handler`, async () => {
      const localThis = {
        async $fetchGraphqlData(): Promise<void> {
          return new Promise<void>((_, reject) => setTimeout(() => reject(), 10))
        },
        $logErrorAndToast: jest.fn()
      }

      // Set spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
        undefined,
        'There was an error fetching integration details.'
      )
    })

    test(`Action "${IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL}"`, async () => {
      const { logo } = integrationDetails
      const queryResponse = { logo }

      const localThis = {
        async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return new Promise<GraphqlQueryResponse>((resolve) =>
            setTimeout(() => resolve({ data: { integration: queryResponse } }), 10)
          )
        }
      }

      // Set spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).toHaveBeenCalledWith(
        IntegrationsDetailMutations.SET_INTEGRATION_DETAILS,
        queryResponse
      )
    })

    test(`Action "${IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL}" error handler`, async () => {
      const localThis = {
        async $fetchGraphqlData(): Promise<void> {
          return new Promise<void>((_, reject) => setTimeout(() => reject(), 10))
        },
        $logErrorAndToast: jest.fn()
      }

      // Set spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
        undefined,
        'There was an error fetching integration logo URL.'
      )
    })

    test(`Action "${IntegrationsDetailActions.FETCH_INTEGRATION_INSTALLATION_STATUS}"`, async () => {
      const { installed } = integrationDetails
      const queryResponse = { installed }

      const localThis = {
        async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return new Promise<GraphqlQueryResponse>((resolve) =>
            setTimeout(() => resolve({ data: { integration: queryResponse } }), 10)
          )
        }
      }

      // Set spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsDetailActions.FETCH_INTEGRATION_INSTALLATION_STATUS].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          repositoryId: 'T3duZXI6cXpscnh6'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).toHaveBeenCalledWith(
        IntegrationsDetailMutations.SET_INTEGRATION_DETAILS,
        queryResponse
      )
    })

    test(`Action "${IntegrationsDetailActions.FETCH_INTEGRATION_INSTALLATION_STATUS}" error handler`, async () => {
      const localThis = {
        async $fetchGraphqlData(): Promise<void> {
          return new Promise<void>((_, reject) => setTimeout(() => reject(), 10))
        },
        $logErrorAndToast: jest.fn()
      }

      // Set spy on `localThis.$fetchGraphqlData`
      const spy = jest.spyOn(localThis, '$fetchGraphqlData')

      // Dispatch the Vuex action
      await actions[IntegrationsDetailActions.FETCH_INTEGRATION_INSTALLATION_STATUS].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          repositoryId: 'T3duZXI6cXpscnh6'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
        undefined,
        'There was an error fetching integration installation status.'
      )
    })

    test(`Action "${IntegrationsDetailActions.GET_INTEGRATION_INSTALLATION_URL}"`, async () => {
      const installationUrl =
        'https://slack.com/oauth/v2/authorize?client_id=3008460848721.2989151408982&scope=channels%3Aread%2Cchat%3Awrite%2Cgroups%3Aread&state=_CKrdQlcaZfYca9U8Dg5wH5gz0-bdoBDrHt9IGIuuVk'

      const localThis = {
        async $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    getIntegrationInstallationUrl: {
                      url: installationUrl
                    }
                  }
                }),
              10
            )
          )
        },
        $toast: {
          danger: jest.fn()
        }
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      // Vuex action that invokes the GQL mutation
      const { url } = await actions[
        IntegrationsDetailActions.GET_INTEGRATION_INSTALLATION_URL
      ].call(localThis as any, actionCxt, {
        shortcode: 'slack'
      })

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(url).toBe(installationUrl)
    })

    test(`Action "${IntegrationsDetailActions.GET_INTEGRATION_INSTALLATION_URL}" error handler`, async () => {
      const localThis = {
        async $applyGraphqlMutation(): Promise<void> {
          return new Promise<void>((_, reject) => setTimeout(() => reject(), 10))
        },
        $logErrorAndToast: jest.fn()
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      // Vuex action that invokes the GQL mutation
      await actions[IntegrationsDetailActions.GET_INTEGRATION_INSTALLATION_URL].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
        undefined,
        'There was an error fetching integration installation URL.'
      )
    })

    test(`Action "${IntegrationsDetailActions.INSTALL_INTEGRATION}"`, async () => {
      const localThis = {
        async $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    installIntegration: installIntegrationPayload
                  }
                }),
              10
            )
          )
        }
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      // Vuex action that invokes the GQL mutation
      await actions[IntegrationsDetailActions.INSTALL_INTEGRATION].call(
        localThis as any,
        actionCxt,
        {
          step: IntegrationInstallationStep.Install,
          shortcode: 'slack',
          ownerId: 'T3duZXI6cXpscnh6',
          code: '3008460848721.3360571871733.dba65df03a4bcb525d226ec2d4cdc171595e3554f69af70f00c3c7659ffe3470',
          state: 'OTy00JuBZpKagj6400e9smdyrCCoImxSoeVksXHufZk'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).toHaveBeenCalledWith(
        IntegrationsDetailMutations.SET_INSTALL_INTEGRATION_PAYLOAD,
        installIntegrationPayload
      )
    })

    test(`Action "${IntegrationsDetailActions.INSTALL_INTEGRATION}" error handler`, async () => {
      const localThis = {
        async $applyGraphqlMutation(): Promise<void> {
          return new Promise<void>((_, reject) => setTimeout(() => reject(), 10))
        },
        $logErrorAndToast: jest.fn()
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      // Vuex action that invokes the GQL mutation
      await actions[IntegrationsDetailActions.INSTALL_INTEGRATION].call(
        localThis as any,
        actionCxt,
        {
          step: IntegrationInstallationStep.Install,
          shortcode: 'slack',
          ownerId: 'T3duZXI6cXpscnh6',
          code: '3008460848721.3360571871733.dba65df03a4bcb525d226ec2d4cdc171595e3554f69af70f00c3c7659ffe3470',
          state: 'OTy00JuBZpKagj6400e9smdyrCCoImxSoeVksXHufZk'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
        undefined,
        'There was an error installing the integration.'
      )
    })

    test(`Action "${IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS}"`, async () => {
      const localThis = {
        async $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(() => resolve({ data: { updateIntegrationSettings: { ok: true } } }), 10)
          )
        }
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      // Vuex action that invokes the GQL mutation
      const { ok } = await actions[IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6',
          settings: { channel: 'issues' }
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.dispatch).toHaveBeenCalledWith(
        IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6',
          refetch: true
        }
      )
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(ok).toBe(true)
    })

    test(`Action "${IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS}" error handler`, async () => {
      const localThis = {
        async $applyGraphqlMutation(): Promise<void> {
          return new Promise<void>((_, reject) => setTimeout(() => reject(), 10))
        },
        $logErrorAndToast: jest.fn()
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      // Vuex action that invokes the GQL mutation
      await actions[IntegrationsDetailActions.UPDATE_INTEGRATION_SETTINGS].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6',
          settings: { channel: 'issues' }
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
        undefined,
        'There was an error updating the integration settings.'
      )
    })

    test(`Action "${IntegrationsDetailActions.UNINSTALL_INTEGRATION}"`, async () => {
      const localThis = {
        async $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(() => resolve({ data: { uninstallIntegration: { ok: true } } }), 10)
          )
        }
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      // Vuex action that invokes the GQL mutation
      const { ok } = await actions[IntegrationsDetailActions.UNINSTALL_INTEGRATION].call(
        localThis as any,
        actionCxt,
        {
          shortcode: 'slack',
          ownerId: 'T3duZXI6cXpscnh6'
        }
      )

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.dispatch).toHaveBeenCalledWith(
        IntegrationsDetailActions.FETCH_INTEGRATION_DETAILS,
        {
          shortcode: 'slack',
          level: IntegrationSettingsLevel.Owner,
          ownerId: 'T3duZXI6cXpscnh6',
          refetch: true
        }
      )
      expect(actionCxt.commit).not.toHaveBeenCalled()
      expect(ok).toBe(true)
    })

    test(`Action "${IntegrationsDetailActions.UNINSTALL_INTEGRATION}" error handler`, async () => {
      const localThis = {
        async $applyGraphqlMutation(): Promise<void> {
          return new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Something went wrong')), 10)
          )
        },
        $logErrorAndToast: jest.fn()
      }

      // Set spy on `localThis.$applyGraphqlMutation`
      const spy = jest.spyOn(localThis, '$applyGraphqlMutation')

      expect(
        actions[IntegrationsDetailActions.UNINSTALL_INTEGRATION].call(localThis as any, actionCxt, {
          shortcode: 'slack',
          ownerId: 'T3duZXI6cXpscnh6'
        })
      ).rejects.toThrowError(new Error('Something went wrong'))

      // Assertions
      expect(spy).toHaveBeenCalledTimes(1)
      expect(actionCxt.commit).not.toHaveBeenCalled()
    })
  })
})
