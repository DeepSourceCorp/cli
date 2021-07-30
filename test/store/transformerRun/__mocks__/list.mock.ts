import { TransformerRunConnection } from '~/types/types'
import { TransformerRunListModuleState } from '~/store/transformerRun/list'

/**
 * Mock for transformer run list.
 */
export const TRANSFORMER_RUN_LIST: TransformerRunConnection = <TransformerRunConnection>{
  totalCount: 1,
  edges: [
    {
      node: {
        createdAt: '2020-07-09T12:10:42.825467+00:00',
        runId: 'dfd9a3e2-4738-4c9d-af04-156ec754b460',
        status: 'PASS',
        branchName: 'master',
        commitOid: '43353bd9880a42e9f87397677e3d96ede72e35bf',
        finishedIn: 91,
        changedFilesCount: 1,
        tools: [
          {
            name: 'Black',
            shortcode: 'black',
            logo_path:
              'https://s3.us-east-1.amazonaws.com/local-asgard-static/transformer_logos/black.svg',
            description: 'The uncompromising Python code formatter'
          }
        ],
        committedToBranchStatus: 'NCB',
        gitCompareDisplay: '7a187d8..43353bd',
        pullRequestNumber: 16,
        vcsPrUrl: 'https://github.com/mohi7solanki/2048-Game/pull/16',
        __typename: 'TransformerRun'
      },
      __typename: 'TransformerRunEdge'
    }
  ],
  __typename: 'TransformerRunConnection'
}

/**
 * Mock -- Transformer run list factory
 * @see TRANSFORMER_RUN_LIST
 */
export const mockTransformerRunList = (): TransformerRunConnection => TRANSFORMER_RUN_LIST

/**
 * Mock factory
 */
export const mockTransformerRunListState = (): TransformerRunListModuleState => ({
  loading: false as boolean,
  error: {},
  transformerRunList: mockTransformerRunList(),
  branchTransformRunList: {
    master: mockTransformerRunList()
  }
})
