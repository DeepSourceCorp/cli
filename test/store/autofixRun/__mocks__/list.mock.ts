import { AutofixRunConnection } from "~/types/types";
import { AutofixRunListModuleState } from "~/store/autofixRun/list"

/**
 * Mock for autofix run list.
 */
export const AUTOFIX_RUN_LIST: AutofixRunConnection = <AutofixRunConnection>{
  "totalCount": 21,
  "edges": [
    {
      "node": {
        "runId": "4f9b1371-9964-444a-ae59-ccd3764fcf72",
        "status": "PASS",
        "filesAffected": 1,
        "finishedIn": 10,
        "isGeneratedFromPr": false,
        "gitCompareDisplay": null,
        "pullRequestTitle": "",
        "pullRequestNumber": 1555,
        "pullRequestStatus": "PRM",
        "createdAt": "2020-04-13T14:17:41.594687+00:00",
        "resolvedIssuesCount": 1,
        "createdBy": {
          "fullName": "Srijan Saurav",
          "avatar": "https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/4159a623-5478-4979-8310-ef47531ee41b.jpeg"
        },
        "analyzer": {
          "name": "Python",
          "analyzerLogo": "https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg"
        },
        "issue": {
          "title": "No use of `self`",
          "issueType": "performance",
          "shortcode": "PYL-R0201"
        },
        "__typename": "AutofixRun"
      },
      "__typename": "AutofixRunEdge"
    },
    {
      "node": {
        "runId": "2064f154-c847-45c6-83c8-4521a2e03285",
        "status": "PASS",
        "filesAffected": 1,
        "finishedIn": 31,
        "isGeneratedFromPr": false,
        "gitCompareDisplay": null,
        "pullRequestTitle": "",
        "pullRequestNumber": null,
        "pullRequestStatus": "PNC",
        "createdAt": "2020-03-29T16:38:30.483047+00:00",
        "resolvedIssuesCount": 1,
        "createdBy": {
          "fullName": "Sourya Vatsyayan",
          "avatar": "https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/bc950f22-1090-47b7-adb3-fd971b922a7b.jpeg"
        },
        "analyzer": {
          "name": "Python",
          "analyzerLogo": "https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg"
        },
        "issue": {
          "title": "Function contains unused argument",
          "issueType": "antipattern",
          "shortcode": "PYL-W0613"
        },
        "__typename": "AutofixRun"
      },
      "__typename": "AutofixRunEdge"
    }
  ],
  "__typename": "AutofixRunConnection"
}

/**
 * Mock -- Autofix run list factory
 * @see AUTOFIX_RUN_LIST
 */
export const mockAutofixRunList = (): AutofixRunConnection => AUTOFIX_RUN_LIST;

/**
 * Mock factory
 */
export const mockAutofixRunListState = (): AutofixRunListModuleState => ({
  loading: false as boolean,
  error: {},
  autofixRunList: mockAutofixRunList()
});