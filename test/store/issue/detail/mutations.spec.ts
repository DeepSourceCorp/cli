import { mutations, IssueDetailMutations, IssueDetailModuleState } from '~/store/issue/detail'
import { mockIssueDetailState } from '../__mocks__/detail.mock'
import { RepositoryIssue } from '~/types/types'

let issueDetailState: IssueDetailModuleState

describe('[Store] Issue/Detail', () => {
  beforeEach(() => {
    issueDetailState = mockIssueDetailState()
  })

  describe('[[Mutations]]', () => {
    describe(`Mutation "${IssueDetailMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[IssueDetailMutations.SET_LOADING](issueDetailState, true)
        expect(issueDetailState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${IssueDetailMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[IssueDetailMutations.SET_ERROR](issueDetailState, dummyError)
        expect(issueDetailState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${IssueDetailMutations.SET_ISSUE}"`, () => {
      beforeEach(() => {
        issueDetailState.issue = {} as RepositoryIssue
      })
      test('successfully adds new issue to the state', () => {
        const newIssueDetail: RepositoryIssue = {
          issueType: 'style',
          shortcode: 'PYL-C0412'
        } as RepositoryIssue

        mutations[IssueDetailMutations.SET_ISSUE](issueDetailState, newIssueDetail)
        expect(issueDetailState.issue).toEqual(newIssueDetail)
      })

      test('successfully appends data', () => {
        const newIssueDetail: RepositoryIssue = mockIssueDetailState().issue as RepositoryIssue

        if (newIssueDetail.description) {
          newIssueDetail.description = 'New dummy description'
        }
        mutations[IssueDetailMutations.SET_ISSUE](issueDetailState, newIssueDetail)
        expect(issueDetailState.issue.description).toEqual(newIssueDetail.description)
      })
    })
  })
})