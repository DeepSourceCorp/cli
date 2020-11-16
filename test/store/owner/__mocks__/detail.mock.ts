import { Owner } from "~/types/types";
import { OwnerModuleState } from "~/store/owner/detail"

/**
 * Mock for issue type settings.
 */
export const OWNER_DETAIL_ISSUE_TYPE_SETTINGS: Owner = {
  "id": "T3duZXI6NjM=",
  "ownerSetting": {
    "createdAt": "2020-09-21T07:20:36.748374+00:00",
    "modifiedAt": "2020-09-21T07:20:36.748379+00:00",
    "owner": {
      "id": "T3duZXI6NjM=",
      "login": "deepsourcelabs",
      "createdAt": "2020-02-29T03:07:11.151959+00:00",
      "modifiedAt": "2020-09-21T07:20:36.536697+00:00",
      "vcsProvider": "GH"
    },
    "id": "T3duZXJTZXR0aW5nOjM0",
    "issueTypeSettings": [
      {
        "slug": "bug-risk",
        "name": "Bug Risk",
        "isIgnoredInCheckStatus": false,
        "isIgnoredToDisplay": false,
        "description": null
      },
      {
        "slug": "antipattern",
        "name": "Anti-pattern",
        "isIgnoredInCheckStatus": false,
        "isIgnoredToDisplay": false,
        "description": null
      },
      {
        "slug": "performance",
        "name": "Performance",
        "isIgnoredInCheckStatus": true,
        "isIgnoredToDisplay": true,
        "description": null
      },
      {
        "slug": "security",
        "name": "Security",
        "isIgnoredInCheckStatus": true,
        "isIgnoredToDisplay": true,
        "description": null
      },
      {
        "slug": "typecheck",
        "name": "Typecheck",
        "isIgnoredInCheckStatus": true,
        "isIgnoredToDisplay": true,
        "description": null
      },
      {
        "slug": "coverage",
        "name": "Coverage",
        "isIgnoredInCheckStatus": true,
        "isIgnoredToDisplay": true,
        "description": null
      },
      {
        "slug": "style",
        "name": "Style",
        "isIgnoredInCheckStatus": true,
        "isIgnoredToDisplay": true,
        "description": null
      },
      {
        "slug": "doc",
        "name": "Documentation",
        "isIgnoredInCheckStatus": true,
        "isIgnoredToDisplay": true,
        "description": null
      }
    ]
  }
}

/**
 * Mock -- Issue type settings factory
 * @see OWNER_DETAIL_ISSUE_TYPE_SETTINGS
 */
export const mockOwnerDetailIssueTypeSettings = (): Owner => OWNER_DETAIL_ISSUE_TYPE_SETTINGS;

/**
 * Mock factory
 */
export const mock = (): OwnerModuleState => ({
  owner: mockOwnerDetailIssueTypeSettings()
});