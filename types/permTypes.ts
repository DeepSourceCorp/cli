export enum TeamPerms {
  CHANGE_PLAN = 'changePlan',
  UPDATE_SEATS = 'updateSeats',
  UPDATE_BILLING_DETAILS = 'updateBillingDetails',
  MANAGE_TEAM_MEMEBERS = 'manageTeamMemebers',
  VIEW_ACCESS_CONTROL_DASHBOARD = 'viewAccessControlDashboard',
  DELETE_TEAM_ACCOUNT = 'deleteTeamAccount',
  SET_GRANUALAR_IGNORE_PERMISSION = 'setGranualarIgnorePermission',
  ACTIVATE_ANALYSIS = 'activateAnalysis',
  SYNC_REPO_LIST = 'syncRepoList',
  ONBOARD_ACCOUNT = 'onboardAccount',
  VIEW_TEAM_HOME = 'viewTeamHome',
  AUTO_ONBOARD_CRUD_FOR_TEMPLATE = 'autoOnboardCrudForTemplate',
  AUTO_ONBOARD_VIEW_TEMPLATE = 'autoOnboardViewTemplate',
  AUTO_ONBOARD_REPOSITORIES = 'autoOnboardRepositories'
}

export enum RepoPerms {
  VIEW_ISSUES = 'viewIssues',
  VIEW_BADGES = 'viewIssues',
  VIEW_PAST_RUNS = 'viewPastRuns',
  VIEW_METRICS = 'viewMetrics',
  VIEW_OVERVIEW_WIDGETS = 'viewOverviewWidgets',
  CUSTOMIZE_OVERVIEW_WIDGETS = 'customizeOverviewWidgets',
  INSTALL_AUTOFIX_APP = 'installAutofixApp',
  CREATE_AUTOFIXES = 'createAutofixes',
  VIEW_DSN = 'viewDsn',
  GENERATE_SSH_KEY_PAIR = 'generateSshKeyPair',
  CHANGE_DEFAULT_ANALYSIS_BRANCH = 'changeDefaultAnalysisBranch',
  CHANGE_ISSUE_TYPES_TO_REPORT = 'changeIssueTypesToReport',
  CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON = 'changeIssuesToTypeToBlockPrsOn',
  DEACTIVATE_ANALYSIS_ON_REPOSITORY = 'deactivateAnalysisOnRepository',
  ADD_REMOVE_MEMBERS = 'add/removeMembers',
  UPDATE_ROLE_OF_EXISTING_MEMBERS = 'updateRoleOfExistingMembers',
  IGNORE_ISSUES = 'ignoreIssues',
  VIEW_AUDIT_LOGS = 'viewAuditLogs',
  ALLOW_STAR = 'allowStar'
}
