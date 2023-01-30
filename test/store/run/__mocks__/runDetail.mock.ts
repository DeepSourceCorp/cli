import {
  Check,
  IssueConnection,
  AutofixableIssueDetail,
  Run,
  CheckIssueConnection,
  CheckStatus,
  Analyzer,
  RunStatus,
  CheckIssue,
  CheckIssueEdge
} from '~/types/types'
import { RunDetailModuleState } from '~/store/run/detail'

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ RUN DETAIL MOCK +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for Run.
 */
export const RUN_DETAIL: Run = {
  createdAt: '2020-07-06T10:14:37.419400+00:00',
  modifiedAt: '2020-07-06T12:09:30.685771+00:00',
  alive: true,
  id: 'UnVuOnpucnJveQ==',
  runId: 'b2729b23-1126-4d84-a738-01d46da17978',
  branchName: 'deepsource-transform-d833cc25',
  baseOid: '2316e689facc8b4ea67258230b5cbce5c7d6c8d4',
  commitOid: '38ca5bd8fe006eb246eb23f453d72b816ece20ba',
  finishedAt: '2020-07-06T12:09:30.685586+00:00',
  errorMeta: null,
  config: {
    version: 1,
    analyzers: [
      {
        meta: {
          runtime_version: '3.x.x'
        },
        name: 'python',
        enabled: true
      }
    ],
    transformers: [
      {
        name: 'black',
        enabled: true
      }
    ]
  },
  extraData:
    '{"base_branch": "master", "trigger_source": "pull_request", "is_config_updated": false, "pull_request_number": 75}',
  checks: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  status: RunStatus.Pass,
  finishedIn: 28,
  vcsCommitUrl:
    'https://github.com/deepsourcelabs/demo-python/commit/38ca5bd8fe006eb246eb23f453d72b816ece20ba',
  gitCompareDisplay: '2316e68..38ca5bd',
  vcsPrUrl: 'https://github.com/deepsourcelabs/demo-python/pull/75',
  pullRequestNumberDisplay: '#75'
}

export const CHECK: Check = {
  createdAt: '2020-07-06T12:09:01.137320+00:00',
  modifiedAt: '2020-07-06T12:09:30.681629+00:00',
  alive: true,
  id: 'Q2hlY2s6Ym5qZGFn',
  checkSeq: 2,
  status: CheckStatus.Pass,
  run: {
    id: 'UnVuOnpucnJveQ==',
    isForDefaultBranch: false,
    isForCrossRepoPr: false
  } as Run,
  analyzer: {
    name: 'Python',
    shortcode: 'python',
    analyzerLogo:
      'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
    description:
      "This is the official analyzer for the Python programming language. It detects issues covered by open-source tools like pylint, flake8, bandit, pycodestyle, pydocstyle, and DeepSource's custom checkers."
  } as Analyzer,
  triggeredAt: '2020-07-06T12:09:01.771791+00:00',
  finishedAt: '2020-07-06T12:09:30.319308+00:00',
  resolvedIssues: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  extraData: '{"retries": 1, "gh_status": "COMPLETED", "gh_conclusion": "SUCCESS"}',
  errors: [],
  metrics: '[{"namespaces": [{"key": "Python", "value": 20}], "metric_code": "DCV"}]',
  metricsCaptured: [],
  checkIssues: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  concreteIssues: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  finishedIn: 29,
  finishedInDisplay: '29 seconds',
  issuesRaisedCount: 0,
  issuesResolvedCount: 4,
  autofixableIssues: [],
  filesAffectedByAutofix: 0
}

export const CHECK_ISSUES: CheckIssueConnection = {
  totalCount: 2,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false
  },
  edges: [
    {
      node: {
        id: 'Q2hlY2tJc3N1ZTpkeGV5cHB2bHI=',
        path: 'store/run/detail.ts',
        text: 'Lines not covered in tests',
        modifiedAt: '2022-03-28T06:13:35.298685+00:00',
        createdAt: '2022-03-28T06:13:35.298675+00:00',
        beginLine: 263,
        beginColumn: 0,
        endLine: 290,
        endColumn: 0,
        sourceCodeMarkup:
          '<div class="highlight"><pre><span class="ln">260</span>    <span class="p">}</span>\n<span class="ln">261</span>  <span class="p">}</span><span class="p">,</span>\n<span class="ln">262</span>  <span class="kr">async</span> <span class="p">[</span><span class="nx">RunDetailActions</span><span class="p">.</span><span class="nx">CREATE_AUTOFIX_PR</span><span class="p">]</span><span class="p">(</span><span class="p">{</span> <span class="nx">commit</span> <span class="p">}</span><span class="p">,</span> <span class="nx">args</span><span class="p">)</span> <span class="p">{</span>\n<span class="hl"><span class="ln">263</span>    <span class="k">try</span> <span class="p">{</span></span><span class="hl"><span class="ln">264</span>      <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">true</span><span class="p">)</span></span><span class="hl"><span class="ln">265</span>      <span class="kr">const</span> <span class="nx">response</span> <span class="o">=</span> <span class="k">await</span> <span class="k">this</span><span class="p">.</span><span class="nx">$applyGraphqlMutation</span><span class="p">(</span><span class="nx">CreateAutofixRunForPullRequestMutation</span><span class="p">,</span> <span class="p">{</span></span><span class="hl"><span class="ln">266</span>        <span class="nx">input</span>: <span class="kt">args.input</span></span><span class="hl"><span class="ln">267</span>      <span class="p">}</span><span class="p">)</span></span><span class="hl"><span class="ln">268</span>      <span class="k">return</span> <span class="nx">response</span><span class="p">.</span><span class="nx">data</span><span class="p">.</span><span class="nx">createAutofixRunForPullRequest</span></span><span class="hl"><span class="ln">269</span>    <span class="p">}</span> <span class="k">catch</span> <span class="p">(</span><span class="nx">e</span><span class="p">)</span> <span class="p">{</span></span><span class="hl"><span class="ln">270</span>      <span class="kr">const</span> <span class="nx">error</span> <span class="o">=</span> <span class="nx">e</span> <span class="kr">as</span> <span class="nx">GraphqlError</span></span><span class="hl"><span class="ln">271</span>      <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_ERROR</span><span class="p">,</span> <span class="nx">error</span><span class="p">)</span></span><span class="hl"><span class="ln">272</span>    <span class="p">}</span> <span class="k">finally</span> <span class="p">{</span></span><span class="hl"><span class="ln">273</span>      <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span></span><span class="hl"><span class="ln">274</span>    <span class="p">}</span></span><span class="hl"><span class="ln">275</span>  <span class="p">}</span><span class="p">,</span></span><span class="hl"><span class="ln">276</span>  <span class="kr">async</span> <span class="p">[</span><span class="nx">RunDetailActions</span><span class="p">.</span><span class="nx">COMMIT_TO_PR</span><span class="p">]</span><span class="p">(</span><span class="p">{</span> <span class="nx">commit</span> <span class="p">}</span><span class="p">,</span> <span class="nx">args</span><span class="p">)</span> <span class="p">{</span></span><span class="hl"><span class="ln">277</span>    <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">true</span><span class="p">)</span></span><span class="hl"><span class="ln">278</span>    <span class="kr">const</span> <span class="nx">response</span> <span class="o">=</span> <span class="k">await</span> <span class="k">this</span><span class="p">.</span><span class="nx">$applyGraphqlMutation</span><span class="p">(</span><span class="nx">CommitFixToPullRequest</span><span class="p">,</span> <span class="p">{</span></span><span class="hl"><span class="ln">279</span>      <span class="nx">input</span>: <span class="kt">args.input</span></span><span class="hl"><span class="ln">280</span>    <span class="p">}</span><span class="p">)</span></span><span class="hl"><span class="ln">281</span>    <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span></span><span class="hl"><span class="ln">282</span>    <span class="k">return</span> <span class="nx">response</span></span><span class="hl"><span class="ln">283</span>  <span class="p">}</span><span class="p">,</span></span><span class="hl"><span class="ln">284</span>  <span class="kr">async</span> <span class="p">[</span><span class="nx">RunDetailActions</span><span class="p">.</span><span class="nx">CREATE_PR</span><span class="p">]</span><span class="p">(</span><span class="p">{</span> <span class="nx">commit</span> <span class="p">}</span><span class="p">,</span> <span class="nx">args</span><span class="p">)</span> <span class="p">{</span></span><span class="hl"><span class="ln">285</span>    <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">true</span><span class="p">)</span></span><span class="hl"><span class="ln">286</span>    <span class="kr">const</span> <span class="nx">response</span> <span class="o">=</span> <span class="k">await</span> <span class="k">this</span><span class="p">.</span><span class="nx">$applyGraphqlMutation</span><span class="p">(</span><span class="nx">CreatePullRequest</span><span class="p">,</span> <span class="p">{</span></span><span class="hl"><span class="ln">287</span>      <span class="nx">input</span>: <span class="kt">args.input</span></span><span class="hl"><span class="ln">288</span>    <span class="p">}</span><span class="p">)</span></span><span class="hl"><span class="ln">289</span>    <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span></span><span class="hl"><span class="ln">290</span>    <span class="k">return</span> <span class="nx">response</span></span><span class="ln">291</span>  <span class="p">}</span>\n<span class="ln">292</span><span class="p">}</span>\n</pre></div>'
      }
    } as CheckIssueEdge,
    {
      node: {
        id: 'Q2hlY2tJc3N1ZTpxcmF5cXFvZGU=',
        path: 'store/run/detail.ts',
        text: 'Lines not covered in tests',
        modifiedAt: '2022-03-28T06:13:35.298287+00:00',
        createdAt: '2022-03-28T06:13:35.298263+00:00',
        beginLine: 192,
        beginColumn: 0,
        endLine: 230,
        endColumn: 0,
        sourceCodeMarkup:
          '<div class="highlight"><pre><span class="ln">189</span>        <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span>\n<span class="ln">190</span>      <span class="p">}</span><span class="p">)</span>\n<span class="ln">191</span>      <span class="p">.</span><span class="k">catch</span><span class="p">(</span><span class="p">(</span><span class="nx">e</span>: <span class="kt">GraphqlError</span><span class="p">)</span> <span class="o">=</span><span class="o">&gt;</span> <span class="p">{</span>\n<span class="hl"><span class="ln">192</span>        <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_ERROR</span><span class="p">,</span> <span class="nx">e</span><span class="p">)</span></span><span class="hl"><span class="ln">193</span>        <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span></span><span class="hl"><span class="ln">194</span>      <span class="p">}</span><span class="p">)</span></span><span class="hl"><span class="ln">195</span>  <span class="p">}</span><span class="p">,</span></span><span class="hl"><span class="ln">196</span>  <span class="kr">async</span> <span class="p">[</span><span class="nx">RunDetailActions</span><span class="p">.</span><span class="nx">FETCH_CHECK</span><span class="p">]</span><span class="p">(</span><span class="p">{</span> <span class="nx">commit</span> <span class="p">}</span><span class="p">,</span> <span class="p">{</span> <span class="nx">checkId</span><span class="p">,</span> <span class="nx">refetch</span> <span class="p">}</span><span class="p">)</span> <span class="p">{</span></span><span class="hl"><span class="ln">197</span>    <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">true</span><span class="p">)</span></span><span class="hl"><span class="ln">198</span>    <span class="k">try</span> <span class="p">{</span></span><span class="hl"><span class="ln">199</span>      <span class="kr">const</span> <span class="nx">response</span> <span class="o">=</span> <span class="k">await</span> <span class="k">this</span><span class="p">.</span><span class="nx">$fetchGraphqlData</span><span class="p">(</span></span><span class="hl"><span class="ln">200</span>        <span class="nx">RepositoryRunCheckGQLQuery</span><span class="p">,</span></span><span class="hl"><span class="ln">201</span>        <span class="p">{</span></span><span class="hl"><span class="ln">202</span>          <span class="nx">checkId</span>: <span class="kt">checkId</span></span><span class="hl"><span class="ln">203</span>        <span class="p">}</span><span class="p">,</span></span><span class="hl"><span class="ln">204</span>        <span class="nx">refetch</span></span><span class="hl"><span class="ln">205</span>      <span class="p">)</span></span><span class="hl"><span class="ln">206</span>      <span class="kr">const</span> <span class="nx">check</span> <span class="o">=</span> <span class="nx">response</span><span class="p">.</span><span class="nx">data</span><span class="p">.</span><span class="nx">check</span> <span class="kr">as</span> <span class="nx">Check</span></span><span class="hl"><span class="ln">207</span>      <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_CHECK</span><span class="p">,</span> <span class="nx">check</span><span class="p">)</span></span><span class="hl"><span class="ln">208</span>    <span class="p">}</span> <span class="k">catch</span> <span class="p">(</span><span class="nx">e</span><span class="p">)</span> <span class="p">{</span></span><span class="hl"><span class="ln">209</span>      <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_ERROR</span><span class="p">,</span> <span class="nx">e</span><span class="p">)</span></span><span class="hl"><span class="ln">210</span>    <span class="p">}</span> <span class="k">finally</span> <span class="p">{</span></span><span class="hl"><span class="ln">211</span>      <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span></span><span class="hl"><span class="ln">212</span>    <span class="p">}</span></span><span class="hl"><span class="ln">213</span>  <span class="p">}</span><span class="p">,</span></span><span class="hl"><span class="ln">214</span>  <span class="kr">async</span> <span class="p">[</span><span class="nx">RunDetailActions</span><span class="p">.</span><span class="nx">FETCH_CHECK_ISSUES</span><span class="p">]</span><span class="p">(</span><span class="p">{</span> <span class="nx">commit</span> <span class="p">}</span><span class="p">,</span> <span class="nx">args</span><span class="p">)</span> <span class="p">{</span></span><span class="hl"><span class="ln">215</span>    <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">true</span><span class="p">)</span></span><span class="hl"><span class="ln">216</span>    <span class="k">await</span> <span class="k">this</span><span class="p">.</span><span class="nx">$fetchGraphqlData</span><span class="p">(</span><span class="nx">RepositoryRunCheckIssuesGQLQuery</span><span class="p">,</span> <span class="p">{</span></span><span class="hl"><span class="ln">217</span>      <span class="nx">checkId</span>: <span class="kt">args.checkId</span><span class="p">,</span></span><span class="hl"><span class="ln">218</span>      <span class="nx">shortcode</span>: <span class="kt">args.shortcode</span><span class="p">,</span></span><span class="hl"><span class="ln">219</span>      <span class="nx">limit</span>: <span class="kt">args.limit</span><span class="p">,</span></span><span class="hl"><span class="ln">220</span>      <span class="nx">after</span>: <span class="kt">this.$getGQLAfter</span><span class="p">(</span><span class="nx">args</span><span class="p">.</span><span class="nx">currentPageNumber</span><span class="p">,</span> <span class="nx">args</span><span class="p">.</span><span class="nx">limit</span><span class="p">)</span><span class="p">,</span></span><span class="hl"><span class="ln">221</span>      <span class="nx">q</span>: <span class="kt">args.q</span><span class="p">,</span></span><span class="hl"><span class="ln">222</span>      <span class="nx">sort</span>: <span class="kt">args.sort</span></span><span class="hl"><span class="ln">223</span>    <span class="p">}</span><span class="p">)</span></span><span class="hl"><span class="ln">224</span>      <span class="p">.</span><span class="nx">then</span><span class="p">(</span><span class="p">(</span><span class="nx">response</span>: <span class="kt">GraphqlQueryResponse</span><span class="p">)</span> <span class="o">=</span><span class="o">&gt;</span> <span class="p">{</span></span><span class="hl"><span class="ln">225</span>        <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_CHECK_ISSUES</span><span class="p">,</span> <span class="nx">response</span><span class="p">.</span><span class="nx">data</span><span class="p">.</span><span class="nx">checkIssues</span><span class="p">)</span></span><span class="hl"><span class="ln">226</span>        <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span></span><span class="hl"><span class="ln">227</span>      <span class="p">}</span><span class="p">)</span></span><span class="hl"><span class="ln">228</span>      <span class="p">.</span><span class="k">catch</span><span class="p">(</span><span class="p">(</span><span class="nx">e</span>: <span class="kt">GraphqlError</span><span class="p">)</span> <span class="o">=</span><span class="o">&gt;</span> <span class="p">{</span></span><span class="hl"><span class="ln">229</span>        <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_ERROR</span><span class="p">,</span> <span class="nx">e</span><span class="p">)</span></span><span class="hl"><span class="ln">230</span>        <span class="nx">commit</span><span class="p">(</span><span class="nx">RunDetailMutations</span><span class="p">.</span><span class="nx">SET_LOADING</span><span class="p">,</span> <span class="kc">false</span><span class="p">)</span></span><span class="ln">231</span>      <span class="p">}</span><span class="p">)</span>\n<span class="ln">232</span>  <span class="p">}</span><span class="p">,</span>\n<span class="ln">233</span>  <span class="kr">async</span> <span class="p">[</span><span class="nx">RunDetailActions</span><span class="p">.</span><span class="nx">FETCH_AUTOFIXABLE_ISSUES</span><span class="p">]</span><span class="p">(</span><span class="p">{</span> <span class="nx">commit</span> <span class="p">}</span><span class="p">,</span> <span class="nx">args</span><span class="p">)</span> <span class="p">{</span></pre></div>'
      }
    } as CheckIssueEdge
  ]
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL
 */
export const mockRunDetail = (): Run => RUN_DETAIL
export const mockCheckDetail = (): Check => CHECK
export const mockCheckIssueList = (): CheckIssueConnection => CHECK_ISSUES

/**
 * Mock factory
 */
export const mockRunDetailState = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRunDetail(),
  check: mockCheckDetail(),
  checkIssues: mockCheckIssueList(),
  concreteIssueList: {} as IssueConnection,
  pageRefetchStatus: {
    issueOccurrences: {
      status: false,
      page: 1,
      issueId: ''
    },
    runs: { status: false },
    runDetail: {
      status: false,
      analyzer: '',
      runId: '',
      pageOffset: 0
    }
  }
})

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ AUTOFIXABLE ISSUES MOCK +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for run.
 */
export const RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES: Check = <Check>{
  id: 'Q2hlY2s6ODEwNQ==',
  autofixableIssues: <AutofixableIssueDetail>[],
  filesAffectedByAutofix: 0
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES
 */
export const mockRepositoryDetailForAutofixableIssues = (): Check =>
  RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForAutofixableIssues = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRunDetail(),
  check: mockCheckDetail(),
  checkIssues: {} as CheckIssueConnection,
  concreteIssueList: {} as IssueConnection,
  pageRefetchStatus: {
    issueOccurrences: {
      status: false,
      page: 1,
      issueId: ''
    },
    runs: { status: false },
    runDetail: {
      status: false,
      analyzer: '',
      runId: '',
      pageOffset: 0
    }
  }
})

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ CONCRETE ISSUE LIST MOCK +++++++++++++++++++
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for run.
 */
export const RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST: IssueConnection = <IssueConnection>{
  totalCount: 1,
  edges: [
    {
      node: {
        id: 'SXNzdWU6Mjcx',
        issueType: 'bug-risk',
        title: 'Lines not covered in tests',
        seenIn: 'api/types/check.py, api/types/run.py and 2 other files',
        shortcode: 'TCV-001',
        occurrenceCount: 15
      }
    }
  ]
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST
 */
export const mockRunDetailForConcreteIssueList = (): IssueConnection =>
  RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST

/**
 * Mock factory
 */
export const mockRunDetailStateForConcreteIssueList = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRunDetail(),
  check: mockCheckDetail(),
  checkIssues: {} as CheckIssueConnection,
  concreteIssueList: mockRunDetailForConcreteIssueList() as IssueConnection,
  pageRefetchStatus: {
    issueOccurrences: {
      status: false,
      page: 1,
      issueId: ''
    },
    runs: { status: false },
    runDetail: {
      status: false,
      analyzer: '',
      runId: '',
      pageOffset: 0
    }
  }
})
