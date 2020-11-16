import { Owner } from "~/types/types";
import { OwnerModuleState } from "~/store/owner/detail"

/**
 * Mock for issue type settings.
 */
export const OWNER_DETAIL_ISSUE_TYPE_SETTINGS: Owner = <Owner>{
  "id": "T3duZXI6NjM=",
  "ownerSetting": {
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