import { Check, IssueConnection, AutofixableIssueDetail } from "~/types/types";
import { RunDetailModuleState } from "~/store/run/detail"

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ RUN DETAIL MOCK +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for Run.
 */
export const RUN_DETAIL: Check = <Check>{
  "id": "Q2hlY2s6ODEwNQ==",
  "status": "FAIL",
  "checkSeq": 3,
  "finishedInDisplay": "33 seconds",
  "autofixableIssues": <AutofixableIssueDetail>[],
  "filesAffectedByAutofix": 0,
  "errors": [],
  "issuesRaisedCount": 15,
  "issuesResolvedCount": 4,
  "run": {
    "isForDefaultBranch": false
  },
  "analyzer": {
    "name": "Test Coverage",
    "description": "Test coverage analyzer"
  },
  "metricsCaptured": [
    {
      "id": "UmVwb3NpdG9yeU1ldHJpY1ZhbHVlOjg3MDU=",
      "name": "Branch Coverage",
      "valueDisplay": "60.5%",
      "isPassing": null
    },
    {
      "id": "UmVwb3NpdG9yeU1ldHJpY1ZhbHVlOjg3MDQ=",
      "name": "Test Coverage",
      "valueDisplay": "85.3%",
      "isPassing": null
    }
  ],
  "concreteIssues": {
    "totalCount": 1
  }
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL
 */
export const mockRunDetail = (): Check => RUN_DETAIL;

/**
 * Mock factory
 */
export const mockRunDetailState = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRunDetail(),
  concreteIssueList: {} as IssueConnection
});

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ AUTOFIXABLE ISSUES MOCK +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for run.
 */
export const RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES: Check = <Check>{
  "id": "Q2hlY2s6ODEwNQ==",
  "autofixableIssues": <AutofixableIssueDetail>[],
  "filesAffectedByAutofix": 0
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES
 */
export const mockRepositoryDetailForAutofixableIssues = (): Check => RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES;

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForAutofixableIssues = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRepositoryDetailForAutofixableIssues(),
  concreteIssueList: {} as IssueConnection
});

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ CONCRETE ISSUE LIST MOCK +++++++++++++++++++
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for run.
 */
export const RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST: IssueConnection = <IssueConnection>{
  "totalCount": 1,
  "edges": [
    {
      "node": {
        "id": "SXNzdWU6Mjcx",
        "issueType": "bug-risk",
        "title": "Lines not covered in tests",
        "seenIn": "api/types/check.py, api/types/run.py and 2 other files",
        "shortcode": "TCV-001",
        "occurrenceCount": 15
      }
    }
  ]
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST
 */
export const mockRunDetailForConcreteIssueList = (): IssueConnection => RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST;

/**
 * Mock factory
 */
export const mockRunDetailStateForConcreteIssueList = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: {} as Check,
  concreteIssueList: mockRunDetailForConcreteIssueList()
});