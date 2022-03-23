import { WebhookState } from '~/store/owner/webhook'
import { Webhook, WebhookEventDelivery } from '~/types/types'

export const mockWebhookStoreInitialState = (): WebhookState => ({
  endpoint: {
    url: ''
  } as Webhook,
  delivery: {} as WebhookEventDelivery,
  endpointDeliveries: [],
  endpointDeliveriesCount: 0,
  webhookEventTypes: [],
  webhookEndpoints: [],
  totalWebhookEndpoints: 0
})

export const webhookStoreMock: WebhookState = {
  endpoint: {
    id: 'V2ViaG9vazpkYmd4b3o=',
    url: 'https://webhook.site/9600f45f-99b3-4424-837e-12c86c6c9fac',
    active: '2022-03-23T08:12:28.385967+00:00',
    secret: 'd4cef000be0149d18137137ad923b14c',
    version: 'v1.0.0',
    apiSigning: true,
    createdAt: '2022-03-23T08:12:23.464192+00:00',
    modifiedAt: '2022-03-23T08:12:23.464243+00:00',
    eventsSubscribed: {
      edges: [
        {
          // @ts-ignore
          node: {
            shortcode: 'analysis_run.started',
            name: 'Analysis Run Started',
            shortDescription: 'This event is triggered when an analysis run is started.'
          }
        },
        {
          // @ts-ignore
          node: {
            shortcode: 'analysis_run.updated',
            name: 'Analysis Run Updated',
            shortDescription: 'This event is triggered when an analysis run is updated.'
          }
        },
        {
          // @ts-ignore
          node: {
            shortcode: 'autofix.created',
            name: 'Autofix Created',
            shortDescription: 'This event is triggered when a new Autofix is created.'
          }
        },
        {
          // @ts-ignore
          node: {
            shortcode: 'autofix.updated',
            name: 'Autofix Status Updated',
            shortDescription: 'This event is triggered when the status of an Autofix is updated.'
          }
        },
        {
          // @ts-ignore
          node: {
            shortcode: 'repository.analysis.activated',
            name: 'Repository Analysis Activated',
            shortDescription: 'This event is triggered when a repository is enabled for analysis.'
          }
        }
      ]
    }
  },
  delivery: {
    id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6YnhqcWdi',
    eventId: '400125830862209925',
    deliveryId: '400125831701073098',
    finishedIn: 1.261,
    createdAt: '2022-03-23T08:13:00.644151+00:00',
    retryCount: 0,
    httpStatusCode: 200,
    // @ts-ignore
    webhook: {
      id: 'V2ViaG9vazpkYmd4b3o=',
      url: 'https://webhook.site/9600f45f-99b3-4424-837e-12c86c6c9fac'
    },
    // @ts-ignore
    eventType: {
      id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
      name: 'Repository Analysis Activated',
      shortcode: 'repository.analysis.activated',
      shortDescription: 'This event is triggered when a repository is enabled for analysis.'
    },
    payload: {
      id: '400125830862209925',
      type: 'repository.analysis.activated',
      createdAt: 1648023180,
      data: {
        object: {
          id: 'UmVwb3NpdG9yeTp6eHd3b2c=',
          object: 'Repository',
          name: 'esbuild',
          vcsProvider: 'GITHUB',
          vcsUrl: 'https://github.com/CyberdyneHQ/esbuild',
          defaultBranch: 'master',
          latestCommitOid: 'master',
          isPrivate: false,
          isActivated: true,
          account: {
            id: 'T3duZXI6Ynh3dmR6',
            object: 'Account',
            login: 'CyberdyneHQ',
            vcsProvider: 'GITHUB',
            vcsUrl: 'https://github.com/CyberdyneHQ',
            type: 'TEAM',
            avatarUrl:
              'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
          }
        }
      }
    }
  },
  endpointDeliveries: [
    {
      id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6YnhqcWdi',
      eventId: '400125830862209925',
      payload: {
        id: '400125830862209925',
        type: 'repository.analysis.activated',
        createdAt: 1648023180,
        data: {
          object: {
            id: 'UmVwb3NpdG9yeTp6eHd3b2c=',
            object: 'Repository',
            name: 'esbuild',
            vcsProvider: 'GITHUB',
            vcsUrl: 'https://github.com/CyberdyneHQ/esbuild',
            defaultBranch: 'master',
            latestCommitOid: 'master',
            isPrivate: false,
            isActivated: true,
            account: {
              id: 'T3duZXI6Ynh3dmR6',
              object: 'Account',
              login: 'CyberdyneHQ',
              vcsProvider: 'GITHUB',
              vcsUrl: 'https://github.com/CyberdyneHQ',
              type: 'TEAM',
              avatarUrl:
                'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
            }
          }
        }
      },
      createdAt: '2022-03-23T08:13:00.644151+00:00',
      retryCount: 0,
      finishedIn: 1.261,
      deliveryId: '400125831701073098',
      httpStatusCode: 200,
      // @ts-ignore
      eventType: {
        id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
        name: 'Repository Analysis Activated',
        shortcode: 'repository.analysis.activated'
      }
    },
    {
      id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6Ym92d3h6',
      eventId: '400125835979263178',
      payload: {
        id: '400125835979263178',
        type: 'analysis_run.started',
        createdAt: 1648023183,
        data: {
          object: {
            id: 'UnVuOmJyd2xkag==',
            object: 'AnalysisRun',
            runUid: '07725e05-202d-4779-9949-83fdb4a3e99e',
            status: 'PENDING',
            branchName: 'master',
            baseOid: '432ee007ff20a64b26dd1046cefa186c21abefc8',
            commitOid: '432ee007ff20a64b26dd1046cefa186c21abefc8',
            createdAt: 1648023182,
            updatedAt: 1648023182,
            repository: {
              id: 'UmVwb3NpdG9yeTp6ZHh4anA=',
              object: 'Repository',
              name: 'automatic-umbrella',
              vcsProvider: 'GITHUB',
              vcsUrl: 'https://github.com/CyberdyneHQ/automatic-umbrella',
              defaultBranch: 'master',
              latestCommitOid: '432ee007ff20a64b26dd1046cefa186c21abefc8',
              isPrivate: true,
              isActivated: true,
              account: {
                id: 'T3duZXI6Ynh3dmR6',
                object: 'Account',
                login: 'CyberdyneHQ',
                vcsProvider: 'GITHUB',
                vcsUrl: 'https://github.com/CyberdyneHQ',
                type: 'TEAM',
                avatarUrl:
                  'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
              }
            },
            summary: {
              object: 'AnalysisRunSummary',
              occurrencesIntroduced: 0,
              occurrencesResolved: 0,
              occurrenceDistributionByAnalyzer: [
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'javascript',
                  introduced: 0
                }
              ],
              occurrenceDistributionByCategory: []
            },
            checks: [
              {
                id: 'Q2hlY2s6emVkeGVh',
                object: 'Check',
                sequence: 1,
                status: 'PENDING',
                analyzer: {
                  id: 'QW5hbHl6ZXI6bHhiYW1i',
                  object: 'Analyzer',
                  shortcode: 'javascript',
                  name: 'JavaScript',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/javascript.svg'
                },
                createdAt: 1648023182,
                updatedAt: 1648023183,
                finishedAt: null,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              }
            ]
          }
        }
      },
      createdAt: '2022-03-23T08:13:03.977496+00:00',
      retryCount: 0,
      finishedIn: 0.804,
      deliveryId: '400125837287886026',
      httpStatusCode: 200,
      // @ts-ignore
      eventType: {
        id: 'V2ViaG9va0V2ZW50VHlwZXM6cnlieXZ6',
        name: 'Analysis Run Started',
        shortcode: 'analysis_run.started'
      }
    },
    {
      id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6YnZkb2xi',
      eventId: '400125840710438090',
      payload: {
        id: '400125840710438090',
        type: 'analysis_run.started',
        createdAt: 1648023186,
        data: {
          object: {
            id: 'UnVuOmJneW9tcA==',
            object: 'AnalysisRun',
            runUid: '39bd7744-a371-43ca-a948-cca63cc3bfc2',
            status: 'PENDING',
            branchName: 'master',
            baseOid: 'fb481d52fc4b023b459f873ee49683df7a0dc219',
            commitOid: '6350cdf93a2dece1bedfa9235e7b36ee957becea',
            createdAt: 1648023185,
            updatedAt: 1648023185,
            repository: {
              id: 'UmVwb3NpdG9yeTp6eHd3b2c=',
              object: 'Repository',
              name: 'esbuild',
              vcsProvider: 'GITHUB',
              vcsUrl: 'https://github.com/CyberdyneHQ/esbuild',
              defaultBranch: 'master',
              latestCommitOid: '6350cdf93a2dece1bedfa9235e7b36ee957becea',
              isPrivate: false,
              isActivated: true,
              account: {
                id: 'T3duZXI6Ynh3dmR6',
                object: 'Account',
                login: 'CyberdyneHQ',
                vcsProvider: 'GITHUB',
                vcsUrl: 'https://github.com/CyberdyneHQ',
                type: 'TEAM',
                avatarUrl:
                  'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
              }
            },
            summary: {
              object: 'AnalysisRunSummary',
              occurrencesIntroduced: 0,
              occurrencesResolved: 0,
              occurrenceDistributionByAnalyzer: [
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'go',
                  introduced: 0
                }
              ],
              occurrenceDistributionByCategory: []
            },
            checks: [
              {
                id: 'Q2hlY2s6YmtheW9r',
                object: 'Check',
                sequence: 1,
                status: 'PENDING',
                analyzer: {
                  id: 'QW5hbHl6ZXI6cnlieXZ6',
                  object: 'Analyzer',
                  shortcode: 'go',
                  name: 'Go',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg'
                },
                createdAt: 1648023185,
                updatedAt: 1648023185,
                finishedAt: null,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              }
            ]
          }
        }
      },
      createdAt: '2022-03-23T08:13:06.093453+00:00',
      retryCount: 0,
      finishedIn: 0.684,
      deliveryId: '400125840844655818',
      httpStatusCode: 200,
      // @ts-ignore
      eventType: {
        id: 'V2ViaG9va0V2ZW50VHlwZXM6cnlieXZ6',
        name: 'Analysis Run Started',
        shortcode: 'analysis_run.started'
      }
    },
    {
      id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6endwZ3di',
      eventId: '400125806619132805',
      payload: {
        id: '400125806619132805',
        type: 'repository.analysis.activated',
        createdAt: 1648023165,
        data: {
          object: {
            id: 'UmVwb3NpdG9yeTp6bWpqbmc=',
            object: 'Repository',
            name: 'core',
            vcsProvider: 'GITHUB',
            vcsUrl: 'https://github.com/CyberdyneHQ/core',
            defaultBranch: 'develop',
            latestCommitOid: 'develop',
            isPrivate: false,
            isActivated: true,
            account: {
              id: 'T3duZXI6Ynh3dmR6',
              object: 'Account',
              login: 'CyberdyneHQ',
              vcsProvider: 'GITHUB',
              vcsUrl: 'https://github.com/CyberdyneHQ',
              type: 'TEAM',
              avatarUrl:
                'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
            }
          }
        }
      },
      createdAt: '2022-03-23T08:12:45.890809+00:00',
      retryCount: 0,
      finishedIn: 0.681,
      deliveryId: '400125806954679498',
      httpStatusCode: 200,
      // @ts-ignore
      eventType: {
        id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
        name: 'Repository Analysis Activated',
        shortcode: 'repository.analysis.activated'
      }
    },
    {
      id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6enBqZHF6',
      eventId: '400125817507548362',
      payload: {
        id: '400125817507548362',
        type: 'analysis_run.started',
        createdAt: 1648023172,
        data: {
          object: {
            id: 'UnVuOmJtYXlnbA==',
            object: 'AnalysisRun',
            runUid: '14ed1c71-d963-4667-80f0-3f09261c133b',
            status: 'PENDING',
            branchName: 'develop',
            baseOid: 'eda909b11c4946574324d387f9a211a1a4d58e24',
            commitOid: '9d2aeb2d2abdfd72797778bec4c35da03ce9193e',
            createdAt: 1648023170,
            updatedAt: 1648023170,
            repository: {
              id: 'UmVwb3NpdG9yeTp6bWpqbmc=',
              object: 'Repository',
              name: 'core',
              vcsProvider: 'GITHUB',
              vcsUrl: 'https://github.com/CyberdyneHQ/core',
              defaultBranch: 'develop',
              latestCommitOid: '9d2aeb2d2abdfd72797778bec4c35da03ce9193e',
              isPrivate: false,
              isActivated: true,
              account: {
                id: 'T3duZXI6Ynh3dmR6',
                object: 'Account',
                login: 'CyberdyneHQ',
                vcsProvider: 'GITHUB',
                vcsUrl: 'https://github.com/CyberdyneHQ',
                type: 'TEAM',
                avatarUrl:
                  'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
              }
            },
            summary: {
              object: 'AnalysisRunSummary',
              occurrencesIntroduced: 0,
              occurrencesResolved: 0,
              occurrenceDistributionByAnalyzer: [
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'javascript',
                  introduced: 0
                },
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'rust',
                  introduced: 0
                },
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'shell',
                  introduced: 0
                }
              ],
              occurrenceDistributionByCategory: []
            },
            checks: [
              {
                id: 'Q2hlY2s6empqZ3ly',
                object: 'Check',
                sequence: 1,
                status: 'PENDING',
                analyzer: {
                  id: 'QW5hbHl6ZXI6bHhiYW1i',
                  object: 'Analyzer',
                  shortcode: 'javascript',
                  name: 'JavaScript',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/javascript.svg'
                },
                createdAt: 1648023170,
                updatedAt: 1648023171,
                finishedAt: null,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              },
              {
                id: 'Q2hlY2s6endxcmd4',
                object: 'Check',
                sequence: 2,
                status: 'PENDING',
                analyzer: {
                  id: 'QW5hbHl6ZXI6a3plZHFi',
                  object: 'Analyzer',
                  shortcode: 'rust',
                  name: 'Rust',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/rust.svg'
                },
                createdAt: 1648023171,
                updatedAt: 1648023171,
                finishedAt: null,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              },
              {
                id: 'Q2hlY2s6enBrd2Ru',
                object: 'Check',
                sequence: 3,
                status: 'PENDING',
                analyzer: {
                  id: 'QW5hbHl6ZXI6eGJkb2F6',
                  object: 'Analyzer',
                  shortcode: 'shell',
                  name: 'Shell',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/shell.svg'
                },
                createdAt: 1648023171,
                updatedAt: 1648023171,
                finishedAt: null,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              }
            ]
          }
        }
      },
      createdAt: '2022-03-23T08:12:52.275161+00:00',
      retryCount: 0,
      finishedIn: 0.91,
      deliveryId: '400125817658543306',
      httpStatusCode: 200,
      // @ts-ignore
      eventType: {
        id: 'V2ViaG9va0V2ZW50VHlwZXM6cnlieXZ6',
        name: 'Analysis Run Started',
        shortcode: 'analysis_run.started'
      }
    },
    {
      id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6emV2ZWpi',
      eventId: '400125824000332386',
      payload: {
        id: '400125824000332386',
        type: 'analysis_run.updated',
        createdAt: 1648023176,
        data: {
          object: {
            id: 'UnVuOmJtYXlnbA==',
            object: 'AnalysisRun',
            runUid: '14ed1c71-d963-4667-80f0-3f09261c133b',
            status: 'PENDING',
            branchName: 'develop',
            baseOid: 'eda909b11c4946574324d387f9a211a1a4d58e24',
            commitOid: '9d2aeb2d2abdfd72797778bec4c35da03ce9193e',
            createdAt: 1648023170,
            updatedAt: 1648023175,
            repository: {
              id: 'UmVwb3NpdG9yeTp6bWpqbmc=',
              object: 'Repository',
              name: 'core',
              vcsProvider: 'GITHUB',
              vcsUrl: 'https://github.com/CyberdyneHQ/core',
              defaultBranch: 'develop',
              latestCommitOid: '9d2aeb2d2abdfd72797778bec4c35da03ce9193e',
              isPrivate: false,
              isActivated: true,
              account: {
                id: 'T3duZXI6Ynh3dmR6',
                object: 'Account',
                login: 'CyberdyneHQ',
                vcsProvider: 'GITHUB',
                vcsUrl: 'https://github.com/CyberdyneHQ',
                type: 'TEAM',
                avatarUrl:
                  'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
              }
            },
            summary: {
              object: 'AnalysisRunSummary',
              occurrencesIntroduced: 0,
              occurrencesResolved: 0,
              occurrenceDistributionByAnalyzer: [
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'javascript',
                  introduced: 0
                },
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'rust',
                  introduced: 0
                },
                {
                  object: 'OccurrenceDistributionByAnalyzer',
                  analyzerShortcode: 'shell',
                  introduced: 0
                }
              ],
              occurrenceDistributionByCategory: []
            },
            checks: [
              {
                id: 'Q2hlY2s6empqZ3ly',
                object: 'Check',
                sequence: 1,
                status: 'PENDING',
                analyzer: {
                  id: 'QW5hbHl6ZXI6bHhiYW1i',
                  object: 'Analyzer',
                  shortcode: 'javascript',
                  name: 'JavaScript',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/javascript.svg'
                },
                createdAt: 1648023170,
                updatedAt: 1648023171,
                finishedAt: null,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              },
              {
                id: 'Q2hlY2s6endxcmd4',
                object: 'Check',
                sequence: 2,
                status: 'PENDING',
                analyzer: {
                  id: 'QW5hbHl6ZXI6a3plZHFi',
                  object: 'Analyzer',
                  shortcode: 'rust',
                  name: 'Rust',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/rust.svg'
                },
                createdAt: 1648023171,
                updatedAt: 1648023171,
                finishedAt: null,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              },
              {
                id: 'Q2hlY2s6enBrd2Ru',
                object: 'Check',
                sequence: 3,
                status: 'SUCCESS',
                analyzer: {
                  id: 'QW5hbHl6ZXI6eGJkb2F6',
                  object: 'Analyzer',
                  shortcode: 'shell',
                  name: 'Shell',
                  logoUrl:
                    'https://dev-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/shell.svg'
                },
                createdAt: 1648023171,
                updatedAt: 1648023175,
                finishedAt: 1648023175,
                summary: {
                  object: 'CheckSummary',
                  occurrencesIntroduced: 0,
                  occurrencesResolved: 0,
                  occurrenceDistributionByCategory: []
                }
              }
            ]
          }
        }
      },
      createdAt: '2022-03-23T08:12:56.127178+00:00',
      retryCount: 0,
      finishedIn: 0.559,
      deliveryId: '400125824117771466',
      httpStatusCode: 200,
      // @ts-ignore
      eventType: {
        id: 'V2ViaG9va0V2ZW50VHlwZXM6eGR6bWF6',
        name: 'Analysis Run Updated',
        shortcode: 'analysis_run.updated'
      }
    },
    {
      id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6Ymtnb3hi',
      eventId: '400125829335483269',
      payload: {
        id: '400125829335483269',
        type: 'repository.analysis.activated',
        createdAt: 1648023179,
        data: {
          object: {
            id: 'UmVwb3NpdG9yeTp6ZHh4anA=',
            object: 'Repository',
            name: 'automatic-umbrella',
            vcsProvider: 'GITHUB',
            vcsUrl: 'https://github.com/CyberdyneHQ/automatic-umbrella',
            defaultBranch: 'master',
            latestCommitOid: '432ee007ff20a64b26dd1046cefa186c21abefc8',
            isPrivate: true,
            isActivated: true,
            account: {
              id: 'T3duZXI6Ynh3dmR6',
              object: 'Account',
              login: 'CyberdyneHQ',
              vcsProvider: 'GITHUB',
              vcsUrl: 'https://github.com/CyberdyneHQ',
              type: 'TEAM',
              avatarUrl:
                'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/c10af49e-0365-4f31-9a36-194479486abc.png'
            }
          }
        }
      },
      createdAt: '2022-03-23T08:12:59.301458+00:00',
      retryCount: 0,
      finishedIn: 0.826,
      deliveryId: '400125829452926154',
      httpStatusCode: 200,
      // @ts-ignore
      eventType: {
        id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
        name: 'Repository Analysis Activated',
        shortcode: 'repository.analysis.activated'
      }
    }
  ],
  endpointDeliveriesCount: 7,
  // @ts-ignore
  webhookEventTypes: [
    // @ts-ignore
    {
      name: 'Analysis Run Started',
      shortcode: 'analysis_run.started',
      shortDescription: 'This event is triggered when an analysis run is started.'
    },
    // @ts-ignore
    {
      name: 'Analysis Run Updated',
      shortcode: 'analysis_run.updated',
      shortDescription: 'This event is triggered when an analysis run is updated.'
    },
    // @ts-ignore
    {
      name: 'Autofix Created',
      shortcode: 'autofix.created',
      shortDescription: 'This event is triggered when a new Autofix is created.'
    },
    // @ts-ignore
    {
      name: 'Autofix Status Updated',
      shortcode: 'autofix.updated',
      shortDescription: 'This event is triggered when the status of an Autofix is updated.'
    },
    // @ts-ignore
    {
      name: 'Repository Analysis Activated',
      shortcode: 'repository.analysis.activated',
      shortDescription: 'This event is triggered when a repository is enabled for analysis.'
    },
    // @ts-ignore
    {
      name: 'Repository Analysis Deactivated',
      shortcode: 'repository.analysis.deactivated',
      shortDescription: 'This event is triggered when a repository is disabled for analysis.'
    },
    // @ts-ignore
    {
      name: 'Repository Issue Introduced',
      shortcode: 'repository_issue.introduced',
      shortDescription:
        'This event is trigerred when an issue is introduced on a repository is activated.'
    },
    // @ts-ignore
    {
      name: 'Repository Issue Resolved',
      shortcode: 'repository_issue.resolved',
      shortDescription: 'This event is triggered when an issue is resolved on the default branch.'
    },
    // @ts-ignore
    {
      name: 'Team Member Added',
      shortcode: 'team_member.added',
      shortDescription: 'This event is triggered when a new member is added to a team..'
    },
    // @ts-ignore
    {
      name: 'Team Member Removed',
      shortcode: 'team_member.removed',
      shortDescription: 'This event is triggered when a member is removed from the team,.'
    },
    // @ts-ignore
    {
      name: 'Team Member Role Updated',
      shortcode: 'team_member.updated',
      shortDescription: 'This event is triggered when the role of a member is changed.'
    }
  ],
  webhookEndpoints: [
    {
      id: 'V2ViaG9vazpkYmd4b3o=',
      createdAt: '2022-03-23T08:12:23.464192+00:00',
      modifiedAt: '2022-03-23T08:12:23.464243+00:00',
      url: 'https://webhook.site/9600f45f-99b3-4424-837e-12c86c6c9fac',
      alive: true,
      active: '2022-03-23T08:12:28.385967+00:00',
      // @ts-ignore
      eventsSubscribed: {
        totalCount: 5
      }
    }
  ],
  totalWebhookEndpoints: 1
}
