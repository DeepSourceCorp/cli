import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import { AutofixListItem } from '~/components/Autofix'
import IssueListItem from '~/components/IssueListItem.vue'
import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import {
  AutofixRunCommittedToBranchStatus,
  AutofixRunPullRequestStatus,
  AutofixRunStatus
} from '~/types/types'

const autofixRun = {
  id: 'QXV0b2ZpeFJ1bjpicnZlZ3g=',
  errorsRendered: [],
  runId: 'b010d61e-a0cc-4d7c-b392-45047d79c872',
  staleRedirectUrl: '',
  finishedIn: 19,
  isGeneratedFromPr: false,
  issuesAffected: 1,
  committedToBranchStatus: 'NCB',
  resolvedIssuesCount: 28,
  pullRequestStatus: 'PNC',
  pullRequestTitle: '',
  pullRequestNumber: null,
  status: 'PASS',
  createdAt: '2022-07-31T12:57:40.152223+00:00',
  changeset: {
    'api/tests/types/test_analyzer.py': {
      patches: [
        {
          id: 577933,
          action: 'modified',
          before_html: '<div class="highlight"></div>',
          after_html: '<div class="highlight"></div>'
        }
      ],
      issues: [
        {
          title: 'Imported name is not used anywhere in the module',
          shortcode: 'PY-W2000'
        }
      ]
    },
    'api/tests/types/test_autoonboard.py': {
      patches: [
        {
          id: 577934,
          action: 'modified',
          before_html: '<div class="highlight"></div>',
          after_html: '<div class="highlight"></div>'
        }
      ],
      issues: [
        {
          title: 'Imported name is not used anywhere in the module',
          shortcode: 'PY-W2000'
        }
      ]
    }
  },
  vcsPrUrl: null,
  createdBy: {
    fullName: 'Souvik Dey',
    email: 'souvik@deepsource.io',
    avatar: 'https://static.deepsource.io/avatars/123.png'
  },
  analyzer: {
    name: 'Python',
    shortcode: 'python',
    avatar: 'https://static.deepsource.io/avatars/123.png'
  },
  issue: {
    title: 'Imported name is not used anywhere in the module',
    issueType: 'antipattern',
    shortcode: 'PY-W2000'
  }
}

describe('[[ IssueListItem ]]', () => {
  let localVue: VueConstructor<Vue>
  let storeMock: Record<string, unknown>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)

    storeMock = {
      modules: storeModulesGenerator()
    }
  })

  test('renders `IssueListItem` with all prop options', () => {
    const baseProps = {
      autofixRun: autofixRun,
      pullRequestNumber: '#1214',
      issuesAffected: ['123', '125'],
      runId: 'string',
      issue: autofixRun.issue,
      analyzer: autofixRun.analyzer,
      createdBy: autofixRun.createdBy,
      createdAt: autofixRun.createdAt,
      resolvedIssuesCount: 23,
      pullRequestTitle: autofixRun.pullRequestTitle,
      filesAffected: 123,
      repositoryId: '2342342343242343'
    }

    const isGeneratedFromPr = generateBooleanProps('isGeneratedFromPr', false)
    const showInfo = generateBooleanProps('showInfo', false)
    const removeDefaultStyle = generateBooleanProps('removeDefaultStyle', false)
    const pullRequestStatus = generateStringProps(
      'pullRequestStatus',
      [
        AutofixRunPullRequestStatus.Pnc,
        AutofixRunPullRequestStatus.Prc,
        AutofixRunPullRequestStatus.Prf,
        AutofixRunPullRequestStatus.Prm,
        AutofixRunPullRequestStatus.Pro,
        AutofixRunPullRequestStatus.Prp
      ],
      false
    )
    const committedToBranchStatus = generateStringProps(
      'committedToBranchStatus',
      [
        AutofixRunCommittedToBranchStatus.Cip,
        AutofixRunCommittedToBranchStatus.Ctb,
        AutofixRunCommittedToBranchStatus.Ctf,
        AutofixRunCommittedToBranchStatus.Ncb
      ],
      false
    )
    const status = generateStringProps(
      'status',
      [
        AutofixRunStatus.Cncl,
        AutofixRunStatus.Fail,
        AutofixRunStatus.Pass,
        AutofixRunStatus.Pend,
        AutofixRunStatus.Stal,
        AutofixRunStatus.Timo
      ],
      false
    )

    cartesian(
      isGeneratedFromPr,
      showInfo,
      removeDefaultStyle,
      pullRequestStatus,
      committedToBranchStatus,
      status
    ).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }
      const { html } = render(
        AutofixListItem,
        {
          props,
          stubs: {
            BaseCard: true,
            IssueType: true,
            ZIcon: true,
            AnalyzerLogo: true,
            ZButton: true
          },
          mocks: mocksGenerator(),
          store: new Vuex.Store(storeMock)
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot()
    })
  })
})
