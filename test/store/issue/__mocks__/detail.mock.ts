import { RepositoryIssue } from "~/types/types";
import { IssueDetailModuleState } from "~/store/issue/detail"

/**
 * Mock for issue.
 */
export const ISSUE_DETAIL: RepositoryIssue = <RepositoryIssue>{
  "id": "UmVwb3NpdG9yeUlzc3VlOjIxOTQ=",
  "descriptionRendered": "<p>It is recommended to group imports together by packages.</p>\n",
  "issueType": "style",
  "title": "Imports from same package are not grouped",
  "shortcode": "PYL-C0412",
  "firstSeen": "2020-02-29T07:06:11.659321+00:00",
  "lastSeen": "2020-07-09T08:55:25.934225+00:00",
  "occurrenceCount": 0,
  "analyzerName": "Python",
  "analyzerShortcode": "python",
  "analyzerLogo": "https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg",
  "autofixAvailable": false,
  "newVcsIssueUrl": "/services/proxy/new-vcs-issue?id=UmVwb3NpdG9yeUlzc3VlOjIxOTQ%3D",
  "silenceRules": [
    {
      "silenceLevel": "RL",
      "id": "U2lsZW5jZVJ1bGU6MTA=",
      "filePath": null,
      "createdAt": "2020-11-26T04:14:09.728093+00:00",
      "metadata": {
        "type": "forever"
      },
      "creator": {
        "firstName": "Aman",
        "lastName": "Sharma",
        "email": "aman@deepsource.io",
        "avatar": "https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9e7acac4-9d55-4609-b5c3-a489c5e61459.jpeg"
      }
    },
    {
      "silenceLevel": "RL",
      "id": "U2lsZW5jZVJ1bGU6MTE=",
      "filePath": null,
      "createdAt": "2020-11-26T04:14:09.885947+00:00",
      "metadata": {
        "type": "forever"
      },
      "creator": {
        "firstName": "Aman",
        "lastName": "Sharma",
        "email": "aman@deepsource.io",
        "avatar": "https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9e7acac4-9d55-4609-b5c3-a489c5e61459.jpeg"
      }
    }
  ]
}

/**
 * Mock -- Issue detail factory
 * @see ISSUE_DETAIL
 */
export const mockIssueDetail = (): RepositoryIssue => ISSUE_DETAIL;

/**
 * Mock factory
 */
export const mockIssueDetailState = (): IssueDetailModuleState => ({
  loading: false,
  error: {},
  issue: mockIssueDetail()
});