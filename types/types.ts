export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  DateTime: any;
  Decimal: any;
  GenericScalar: any;
  JSONString: any;
  SocialCamelJSON: any;
  UUID: any;
};

export type AcceptGroupInviteInput = {
  invitationCode: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AcceptGroupInvitePayload = {
  __typename?: 'AcceptGroupInvitePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AccessToken = MaskPrimaryKeyNode & {
  __typename?: 'AccessToken';
  description: Scalars['String'];
  expiresAt: Scalars['DateTime'];
  lastUsedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  expirationStatus?: Maybe<AccessTokenExpirationStatus>;
};

export type AccessTokenConnection = {
  __typename?: 'AccessTokenConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<AccessTokenEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type AccessTokenEdge = {
  __typename?: 'AccessTokenEdge';
  node?: Maybe<AccessToken>;
  cursor: Scalars['String'];
};

export enum AccessTokenExpirationStatus {
  Active = 'ACTIVE',
  DoesNotExpire = 'DOES_NOT_EXPIRE',
  Expired = 'EXPIRED'
}

export enum ActionChoice {
  Add = 'ADD',
  Remove = 'REMOVE'
}

export type ActivateGsrRepositoryInput = {
  config: Scalars['String'];
  defaultBranchName: Scalars['String'];
  repositoryId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ActivateGsrRepositoryPayload = {
  __typename?: 'ActivateGSRRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddAnalyzerFeedbackInput = {
  feedback: Scalars['String'];
  analyzerShortcode: Scalars['String'];
  okToContact: Scalars['Boolean'];
  isAlreadyUsing: Scalars['Boolean'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddAnalyzerFeedbackPayload = {
  __typename?: 'AddAnalyzerFeedbackPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddTeamToGroupInput = {
  groupId: Scalars['ID'];
  teamId: Scalars['ID'];
  role?: Maybe<TeamMemberRoleChoices>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddTeamToGroupPayload = {
  __typename?: 'AddTeamToGroupPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddTransformerFeedbackInput = {
  feedback: Scalars['String'];
  shortcode: Scalars['String'];
  okToContact: Scalars['Boolean'];
  isAlreadyUsing: Scalars['Boolean'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddTransformerFeedbackPayload = {
  __typename?: 'AddTransformerFeedbackPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddUserToGroupInput = {
  groupId: Scalars['ID'];
  userId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AddUserToGroupPayload = {
  __typename?: 'AddUserToGroupPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Analyzer = MaskPrimaryKeyNode & {
  __typename?: 'Analyzer';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  category?: Maybe<Scalars['String']>;
  documentationUrl?: Maybe<Scalars['String']>;
  discussUrl?: Maybe<Scalars['String']>;
  version: Scalars['String'];
  shortcode: Scalars['String'];
  macroPath?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  accessKey: Scalars['UUID'];
  logo?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  analyzerType: AnalyzerAnalyzerType;
  status: AnalyzerStatus;
  command?: Maybe<Scalars['String']>;
  autofixerCommand?: Maybe<Scalars['String']>;
  minCpuLimit: Scalars['Int'];
  minMemoryLimit: Scalars['Int'];
  maxCpuLimit: Scalars['Int'];
  maxMemoryLimit: Scalars['Int'];
  metaSchema: Scalars['JSONString'];
  runtimeVersions: Array<Scalars['String']>;
  trigger: AnalyzerTrigger;
  repository?: Maybe<Repository>;
  owner?: Maybe<Scalars['String']>;
  isPrimary: Scalars['Boolean'];
  starIssues: IssueConnection;
  exampleConfig?: Maybe<Scalars['String']>;
  defaultTestPatterns: Array<Scalars['String']>;
  supportedFilesRegex?: Maybe<Scalars['String']>;
  issues: IssueConnection;
  reviews: AnalyzerReviewConnection;
  checks: CheckConnection;
  repositories: RepositoryConnection;
  userSet: EnterpriseUserConnection;
  autofixRuns: AutofixRunConnection;
  transformertoolSet: TransformerToolConnection;
  transformerRuns: TransformerRunConnection;
  analyzerLogo?: Maybe<Scalars['String']>;
  descriptionRendered?: Maybe<Scalars['String']>;
  publishedOn?: Maybe<Scalars['Date']>;
  updatedOn?: Maybe<Scalars['Date']>;
  issuesCount?: Maybe<Scalars['Int']>;
  autofixableIssuesCount?: Maybe<Scalars['Int']>;
  issueDistribution?: Maybe<Scalars['GenericScalar']>;
  issueTypeDistribution?: Maybe<Scalars['GenericScalar']>;
};


export type AnalyzerStarIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type AnalyzerIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type AnalyzerReviewsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type AnalyzerChecksArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type AnalyzerRepositoriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type AnalyzerUserSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type AnalyzerAutofixRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  status_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  pullRequestStatus_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type AnalyzerTransformertoolSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  language?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type AnalyzerTransformerRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type AnalyzerIssueTypeDistributionArgs = {
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};

export enum AnalyzerAnalyzerType {
  Core = 'CORE',
  Community = 'COMMUNITY',
  Custom = 'CUSTOM'
}

export type AnalyzerAutofixableIssues = {
  __typename?: 'AnalyzerAutofixableIssues';
  analyzer?: Maybe<Analyzer>;
  filesAffected?: Maybe<Scalars['Int']>;
  issueCount?: Maybe<Scalars['Int']>;
  raisedInFiles?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type AnalyzerConnection = {
  __typename?: 'AnalyzerConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<AnalyzerEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type AnalyzerEdge = {
  __typename?: 'AnalyzerEdge';
  node?: Maybe<Analyzer>;
  cursor: Scalars['String'];
};

export type AnalyzerReview = MaskPrimaryKeyNode & {
  __typename?: 'AnalyzerReview';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  analyzer: Analyzer;
  name: Scalars['String'];
  avatar: Scalars['String'];
  comment: Scalars['String'];
};

export type AnalyzerReviewConnection = {
  __typename?: 'AnalyzerReviewConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<AnalyzerReviewEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type AnalyzerReviewEdge = {
  __typename?: 'AnalyzerReviewEdge';
  node?: Maybe<AnalyzerReview>;
  cursor: Scalars['String'];
};

export enum AnalyzerStatus {
  Active = 'ACTIVE',
  Draft = 'DRAFT'
}

export enum AnalyzerTrigger {
  Code = 'CODE',
  Data = 'DATA'
}

export type AppliedCoupon = {
  __typename?: 'AppliedCoupon';
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type ApplyCreditsToOwnerInput = {
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  amount: Scalars['Int'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ApplyCreditsToOwnerPayload = {
  __typename?: 'ApplyCreditsToOwnerPayload';
  ok?: Maybe<Scalars['Boolean']>;
  availableCredits?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Attachment = {
  base64Data: Scalars['String'];
  filename: Scalars['String'];
};

export type AuditLog = MaskPrimaryKeyNode & {
  __typename?: 'AuditLog';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  eventName: Scalars['String'];
  description: Scalars['String'];
  actor?: Maybe<EnterpriseUser>;
  ipAddress?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  reason?: Maybe<Scalars['String']>;
  objectId?: Maybe<Scalars['Int']>;
};

export type AuditLogConnection = {
  __typename?: 'AuditLogConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<AuditLogEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type AuditLogEdge = {
  __typename?: 'AuditLogEdge';
  node?: Maybe<AuditLog>;
  cursor: Scalars['String'];
};

export type AuditLogMeta = {
  __typename?: 'AuditLogMeta';
  possibleActors?: Maybe<Array<Maybe<Scalars['String']>>>;
  events?: Maybe<Array<Maybe<Scalars['String']>>>;
  exportFormats?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type AutoOnboardEvent = MaskPrimaryKeyNode & {
  __typename?: 'AutoOnboardEvent';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  pullRequestNumber?: Maybe<Scalars['Int']>;
  owner: Owner;
  repository: Repository;
  template: ConfigTemplate;
  createdBy?: Maybe<EnterpriseUser>;
  status: AutoOnboardEventStatus;
  vcsPrUrl?: Maybe<Scalars['String']>;
};

export type AutoOnboardEventConnection = {
  __typename?: 'AutoOnboardEventConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<AutoOnboardEventEdge>>;
};

export type AutoOnboardEventEdge = {
  __typename?: 'AutoOnboardEventEdge';
  node?: Maybe<AutoOnboardEvent>;
  cursor: Scalars['String'];
};

export enum AutoOnboardEventStatus {
  Pend = 'PEND',
  Clsd = 'CLSD',
  Fail = 'FAIL',
  Mrgd = 'MRGD',
  Open = 'OPEN'
}

export type AutoOnboardInput = {
  templateShortcode: Scalars['String'];
  repoIds: Array<Maybe<Scalars['ID']>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AutoOnboardPayload = {
  __typename?: 'AutoOnboardPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AutofixRun = MaskPrimaryKeyNode & {
  __typename?: 'AutofixRun';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  runId: Scalars['UUID'];
  commitOid?: Maybe<Scalars['String']>;
  status: AutofixRunStatus;
  finishedAt?: Maybe<Scalars['DateTime']>;
  errors?: Maybe<Scalars['JSONString']>;
  config?: Maybe<Scalars['JSONString']>;
  resolvedIssuesMetadata: Scalars['JSONString'];
  pullRequestNumber?: Maybe<Scalars['Int']>;
  pullRequestStatus: AutofixRunPullRequestStatus;
  committedToBranchStatus: AutofixRunCommittedToBranchStatus;
  extraData: Scalars['JSONString'];
  createdBy?: Maybe<User>;
  issue?: Maybe<Issue>;
  analyzer?: Maybe<Analyzer>;
  checkIssues: CheckIssueConnection;
  filesAffected?: Maybe<Scalars['Int']>;
  issuesAffected?: Maybe<Scalars['Int']>;
  changeset?: Maybe<Scalars['GenericScalar']>;
  errorsRendered?: Maybe<Scalars['GenericScalar']>;
  finishedIn?: Maybe<Scalars['Int']>;
  vcsPrUrl?: Maybe<Scalars['String']>;
  resolvedIssuesCount?: Maybe<Scalars['Int']>;
  gitCompareDisplay?: Maybe<Scalars['String']>;
  isGeneratedFromPr?: Maybe<Scalars['Boolean']>;
  pullRequestTitle?: Maybe<Scalars['String']>;
  staleRedirectUrl?: Maybe<Scalars['String']>;
};


export type AutofixRunCheckIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};

export enum AutofixRunCommittedToBranchStatus {
  Ncb = 'NCB',
  Cip = 'CIP',
  Ctb = 'CTB',
  Ctf = 'CTF'
}

export type AutofixRunConnection = {
  __typename?: 'AutofixRunConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<AutofixRunEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type AutofixRunEdge = {
  __typename?: 'AutofixRunEdge';
  node?: Maybe<AutofixRun>;
  cursor: Scalars['String'];
};

export enum AutofixRunPullRequestStatus {
  Pnc = 'PNC',
  Prp = 'PRP',
  Pro = 'PRO',
  Prm = 'PRM',
  Prc = 'PRC',
  Prf = 'PRF'
}

export enum AutofixRunStatus {
  Pend = 'PEND',
  Pass = 'PASS',
  Timo = 'TIMO',
  Cncl = 'CNCL',
  Fail = 'FAIL',
  Stal = 'STAL'
}

export type AutofixableIssueDetail = {
  __typename?: 'AutofixableIssueDetail';
  shortcode?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  category?: Maybe<Scalars['String']>;
  occurrenceCount?: Maybe<Scalars['Int']>;
};

export type AutofixableIssuesMetadata = {
  __typename?: 'AutofixableIssuesMetadata';
  autofixableIssueCount?: Maybe<Scalars['Int']>;
  estimatedTimeSaved?: Maybe<Scalars['Int']>;
};

export type BillingInfo = {
  __typename?: 'BillingInfo';
  planSlug?: Maybe<Scalars['String']>;
  seatsTotal?: Maybe<Scalars['Int']>;
  seatsUsed?: Maybe<Scalars['Int']>;
  lastBillAmount?: Maybe<Scalars['Float']>;
  upcomingBillAmount?: Maybe<Scalars['Float']>;
  lastPaymentDate?: Maybe<Scalars['DateTime']>;
  upcomingPaymentDate?: Maybe<Scalars['DateTime']>;
  upcomingCancellationDate?: Maybe<Scalars['DateTime']>;
  lastInvoiceUrl?: Maybe<Scalars['String']>;
  couponApplied?: Maybe<AppliedCoupon>;
  activeCard?: Maybe<Card>;
  invoices?: Maybe<Array<Maybe<Invoice>>>;
  outstandingCredits?: Maybe<Scalars['Float']>;
  upgradePlans?: Maybe<Array<Maybe<Scalars['String']>>>;
  downgradePlans?: Maybe<Array<Maybe<Scalars['String']>>>;
  status: SubscriptionStatusChoice;
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
  cancelAtPeriodEnd?: Maybe<Scalars['Boolean']>;
  billingBackend?: Maybe<Scalars['String']>;
  pendingUpdate?: Maybe<Scalars['Boolean']>;
  synced?: Maybe<Scalars['Boolean']>;
  clientSecret?: Maybe<Scalars['String']>;
};

export type BitbucketInstallationLandingInput = {
  queryParams?: Maybe<Scalars['GenericScalar']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type BitbucketInstallationLandingPayload = {
  __typename?: 'BitbucketInstallationLandingPayload';
  message?: Maybe<Scalars['String']>;
  nextAction?: Maybe<NextActionChoice>;
  vcsProvider?: Maybe<VcsProviderChoices>;
  login?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CancelCodeQualitySubscriptionInput = {
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CancelCodeQualitySubscriptionPayload = {
  __typename?: 'CancelCodeQualitySubscriptionPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Card = {
  __typename?: 'Card';
  brand?: Maybe<Scalars['String']>;
  endingIn?: Maybe<Scalars['String']>;
  expYear?: Maybe<Scalars['Int']>;
  expMonth?: Maybe<Scalars['Int']>;
};

export type Changelog = {
  __typename?: 'Changelog';
  logEntries?: Maybe<Array<Maybe<ChangelogItem>>>;
};

export type ChangelogItem = {
  __typename?: 'ChangelogItem';
  id: Scalars['ID'];
  url: Scalars['String'];
  status: StatusOptions;
  created?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  labels?: Maybe<Array<Maybe<ChangelogItemLabel>>>;
  markdownDetails?: Maybe<Scalars['String']>;
  plaintextDetails?: Maybe<Scalars['String']>;
  publishedAt?: Maybe<Scalars['String']>;
};

export type ChangelogItemLabel = {
  __typename?: 'ChangelogItemLabel';
  id?: Maybe<Scalars['String']>;
  created?: Maybe<Scalars['String']>;
  entryCount?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type Check = MaskPrimaryKeyNode & {
  __typename?: 'Check';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  checkSeq: Scalars['Int'];
  analyzer?: Maybe<Analyzer>;
  status: CheckStatus;
  run: Run;
  triggeredAt?: Maybe<Scalars['DateTime']>;
  finishedAt?: Maybe<Scalars['DateTime']>;
  resolvedIssues: RepositoryIssueConnection;
  extraData: Scalars['JSONString'];
  errors?: Maybe<Scalars['GenericScalar']>;
  metrics: Scalars['JSONString'];
  metricsCaptured?: Maybe<Array<Maybe<RepositoryMetricValue>>>;
  checkIssues: CheckIssueConnection;
  concreteIssues?: Maybe<IssueConnection>;
  finishedIn?: Maybe<Scalars['Int']>;
  finishedInDisplay?: Maybe<Scalars['String']>;
  errorsRendered?: Maybe<Scalars['GenericScalar']>;
  issuesRaisedCount?: Maybe<Scalars['Int']>;
  issuesResolvedCount?: Maybe<Scalars['Int']>;
  autofixableIssues?: Maybe<Array<Maybe<AutofixableIssueDetail>>>;
  filesAffectedByAutofix?: Maybe<Scalars['Int']>;
};


export type CheckResolvedIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type CheckCheckIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type CheckConcreteIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};

export type CheckConnection = {
  __typename?: 'CheckConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<CheckEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type CheckEdge = {
  __typename?: 'CheckEdge';
  node?: Maybe<Check>;
  cursor: Scalars['String'];
};

export type CheckIssue = MaskPrimaryKeyNode & {
  __typename?: 'CheckIssue';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  checkInstance: Check;
  concreteIssue?: Maybe<Issue>;
  severity: CheckIssueSeverity;
  isSuppressed?: Maybe<Scalars['Boolean']>;
  path: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  occurrenceType: CheckIssueOccurrenceType;
  beginLine: Scalars['Int'];
  beginColumn: Scalars['Int'];
  endLine: Scalars['Int'];
  endColumn: Scalars['Int'];
  extraData: Scalars['JSONString'];
  inRepositoryIssue: RepositoryIssueConnection;
  autofixRuns: AutofixRunConnection;
  sourceCodeMarkup?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};


export type CheckIssueInRepositoryIssueArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type CheckIssueAutofixRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  status_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  pullRequestStatus_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type CheckIssueConnection = {
  __typename?: 'CheckIssueConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<CheckIssueEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type CheckIssueEdge = {
  __typename?: 'CheckIssueEdge';
  node?: Maybe<CheckIssue>;
  cursor: Scalars['String'];
};

export enum CheckIssueOccurrenceType {
  Exist = 'EXIST',
  New = 'NEW'
}

export enum CheckIssueSeverity {
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR'
}

export enum CheckStatus {
  Pend = 'PEND',
  Pass = 'PASS',
  Fail = 'FAIL',
  Timo = 'TIMO',
  Cncl = 'CNCL',
  Read = 'READ',
  Neut = 'NEUT'
}

export type CommitAdhocConfigInput = {
  repositoryId: Scalars['ID'];
  createPullRequest?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CommitAdhocConfigPayload = {
  __typename?: 'CommitAdhocConfigPayload';
  ok?: Maybe<Scalars['Boolean']>;
  vcsPrUrl?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CommitChangesToPrInput = {
  patches: Array<Maybe<Scalars['Int']>>;
  autofixRunId: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CommitChangesToPrPayload = {
  __typename?: 'CommitChangesToPRPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CommitConfigToVcsInput = {
  config: Scalars['String'];
  repositoryId: Scalars['ID'];
  createPullRequest?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CommitConfigToVcsPayload = {
  __typename?: 'CommitConfigToVCSPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ConfigTemplate = MaskPrimaryKeyNode & {
  __typename?: 'ConfigTemplate';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  owner: Owner;
  shortcode: Scalars['String'];
  title: Scalars['String'];
  description: Scalars['String'];
  config: Scalars['JSONString'];
  events: AutoOnboardEventConnection;
};


export type ConfigTemplateEventsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  owner?: Maybe<Scalars['ID']>;
};

export type ConfigTemplateConnection = {
  __typename?: 'ConfigTemplateConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<ConfigTemplateEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type ConfigTemplateEdge = {
  __typename?: 'ConfigTemplateEdge';
  node?: Maybe<ConfigTemplate>;
  cursor: Scalars['String'];
};

export type ConfirmInvitationInput = {
  action?: Maybe<InviteActions>;
  invitationCode: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ConfirmInvitationPayload = {
  __typename?: 'ConfirmInvitationPayload';
  ok?: Maybe<Scalars['Boolean']>;
  teamName?: Maybe<Scalars['String']>;
  teamLogo?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  role?: Maybe<TeamMemberRoleChoices>;
  viewer?: Maybe<User>;
  message?: Maybe<Scalars['String']>;
  joined?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Context = {
  __typename?: 'Context';
  staticRoot?: Maybe<Scalars['String']>;
  apiRoot?: Maybe<Scalars['String']>;
  websocketUrl?: Maybe<Scalars['String']>;
  installationProvidersUrl?: Maybe<Scalars['String']>;
  installationUrls?: Maybe<Scalars['GenericScalar']>;
  stripePublishableKey?: Maybe<Scalars['String']>;
  appEnv?: Maybe<Scalars['String']>;
  emptyAvatarUrl?: Maybe<Scalars['String']>;
  debug?: Maybe<Scalars['String']>;
  sentryDsn?: Maybe<Scalars['String']>;
  userGroupUrl?: Maybe<Scalars['String']>;
  weeklyLiveDemoUrl?: Maybe<Scalars['String']>;
  onPrem?: Maybe<Scalars['String']>;
  deepsourceCloudProduction?: Maybe<Scalars['String']>;
  githubEnabled?: Maybe<Scalars['Boolean']>;
  gitlabEnabled?: Maybe<Scalars['Boolean']>;
  bitbucketEnabled?: Maybe<Scalars['Boolean']>;
  supportEmail?: Maybe<Scalars['String']>;
  isTransformersLicensed?: Maybe<Scalars['Boolean']>;
  toOnboard?: Maybe<Scalars['Boolean']>;
  plans?: Maybe<Scalars['GenericScalar']>;
};

export type CouponInfo = {
  __typename?: 'CouponInfo';
  currentCycleDiscount: Scalars['Float'];
  nextCycleDiscount: Scalars['Float'];
  isApplied: Scalars['Boolean'];
  description: Scalars['String'];
};

export type CreateAccessTokenInput = {
  description: Scalars['String'];
  expireInDays?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateAccessTokenPayload = {
  __typename?: 'CreateAccessTokenPayload';
  token?: Maybe<Scalars['String']>;
  accessToken?: Maybe<AccessToken>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateAutofixRunForAnalyzerInput = {
  analyzerId: Scalars['ID'];
  repositoryId: Scalars['ID'];
  inputFiles?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateAutofixRunForAnalyzerPayload = {
  __typename?: 'CreateAutofixRunForAnalyzerPayload';
  runId?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateAutofixRunForPullRequestInput = {
  checkId: Scalars['ID'];
  issues: Array<Maybe<Scalars['String']>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateAutofixRunForPullRequestPayload = {
  __typename?: 'CreateAutofixRunForPullRequestPayload';
  autofixRunId?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateAutofixRunInput = {
  inputFiles: Array<Maybe<Scalars['String']>>;
  repoIssueId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateAutofixRunPayload = {
  __typename?: 'CreateAutofixRunPayload';
  runId?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateConfigTemplateInput = {
  ownerId: Scalars['ID'];
  config: Scalars['JSONString'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateConfigTemplatePayload = {
  __typename?: 'CreateConfigTemplatePayload';
  template?: Maybe<ConfigTemplate>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateGroupInput = {
  name: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateGroupPayload = {
  __typename?: 'CreateGroupPayload';
  group?: Maybe<EnterpriseGroup>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreatePullRequestInput = {
  patches: Array<Maybe<Scalars['Int']>>;
  autofixRunId: Scalars['String'];
  repoId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreatePullRequestPayload = {
  __typename?: 'CreatePullRequestPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateWebhookInput = {
  url: Scalars['String'];
  secret: Scalars['String'];
  apiSigning: Scalars['Boolean'];
  eventsSubscribed: Array<Maybe<Scalars['String']>>;
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateWebhookPayload = {
  __typename?: 'CreateWebhookPayload';
  webhook?: Maybe<Webhook>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreditsInfo = {
  __typename?: 'CreditsInfo';
  currentCycleDiscount: Scalars['Float'];
  nextCycleDiscount: Scalars['Float'];
  isApplied: Scalars['Boolean'];
};




export type DeleteAccessTokenInput = {
  tokenId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteAccessTokenPayload = {
  __typename?: 'DeleteAccessTokenPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteAllAccessTokensInput = {
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteAllAccessTokensPayload = {
  __typename?: 'DeleteAllAccessTokensPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteConfigTemplateInput = {
  shortcode: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteConfigTemplatePayload = {
  __typename?: 'DeleteConfigTemplatePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteGroupInput = {
  groupId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteGroupPayload = {
  __typename?: 'DeleteGroupPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteJsonWebTokenCookie = {
  __typename?: 'DeleteJSONWebTokenCookie';
  deleted: Scalars['Boolean'];
};

export type DeleteRefreshTokenCookie = {
  __typename?: 'DeleteRefreshTokenCookie';
  deleted: Scalars['Boolean'];
};

export type DeleteSilenceRuleInput = {
  silenceRuleId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteSilenceRulePayload = {
  __typename?: 'DeleteSilenceRulePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteUserInput = {
  userId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteUserPayload = {
  __typename?: 'DeleteUserPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteWebhookInput = {
  webhookId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DeleteWebhookPayload = {
  __typename?: 'DeleteWebhookPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DisableWebhookInput = {
  webhookId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type DisableWebhookPayload = {
  __typename?: 'DisableWebhookPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Discount = {
  __typename?: 'Discount';
  coupon?: Maybe<CouponInfo>;
  credits?: Maybe<CreditsInfo>;
};

export type EnterpriseBillingInfo = {
  __typename?: 'EnterpriseBillingInfo';
  seatsTotal?: Maybe<Scalars['Int']>;
  seatsUsed?: Maybe<Scalars['Int']>;
  plan?: Maybe<Scalars['String']>;
  licenseExpiry?: Maybe<Scalars['String']>;
  features?: Maybe<Scalars['GenericScalar']>;
};

export type EnterpriseGroup = MaskPrimaryKeyNode & {
  __typename?: 'EnterpriseGroup';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  scimId?: Maybe<Scalars['String']>;
  scimExternalId?: Maybe<Scalars['String']>;
  scimDisplayName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  members: EnterpriseUserConnection;
  teams: TeamConnection;
  invitationCode?: Maybe<Scalars['String']>;
  groupusermembershipSet: GroupUserMembershipConnection;
  groupteammembershipSet: GroupTeamMembershipConnection;
  groupTeams?: Maybe<GroupTeamMembershipConnection>;
  groupUsers?: Maybe<GroupUserMembershipConnection>;
  allTeams?: Maybe<TeamConnection>;
  invitationUrl?: Maybe<Scalars['String']>;
  scimEnabled?: Maybe<Scalars['Boolean']>;
};


export type EnterpriseGroupMembersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseGroupTeamsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseGroupGroupusermembershipSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseGroupGroupteammembershipSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseGroupGroupTeamsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseGroupGroupUsersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseGroupAllTeamsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};

export type EnterpriseGroupConnection = {
  __typename?: 'EnterpriseGroupConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<EnterpriseGroupEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type EnterpriseGroupEdge = {
  __typename?: 'EnterpriseGroupEdge';
  node?: Maybe<EnterpriseGroup>;
  cursor: Scalars['String'];
};

export type EnterpriseInstallationRoot = {
  __typename?: 'EnterpriseInstallationRoot';
  installation?: Maybe<EnterpriseInstallationSetup>;
  license?: Maybe<License>;
  group?: Maybe<EnterpriseGroup>;
  groups?: Maybe<EnterpriseGroupConnection>;
  user?: Maybe<EnterpriseUser>;
  users?: Maybe<EnterpriseUserConnection>;
  teams?: Maybe<TeamConnection>;
  personalAccounts?: Maybe<OwnerConnection>;
  managementConsoleUrl?: Maybe<Scalars['String']>;
  isScimEnabled?: Maybe<Scalars['Boolean']>;
};


export type EnterpriseInstallationRootGroupArgs = {
  id: Scalars['ID'];
};


export type EnterpriseInstallationRootGroupsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseInstallationRootUserArgs = {
  id: Scalars['ID'];
};


export type EnterpriseInstallationRootUsersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseInstallationRootTeamsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseInstallationRootPersonalAccountsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type EnterpriseInstallationSetup = {
  __typename?: 'EnterpriseInstallationSetup';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
};

export type EnterpriseUser = MaskPrimaryKeyNode & {
  __typename?: 'EnterpriseUser';
  id: Scalars['ID'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  isStaff: Scalars['Boolean'];
  isActive: Scalars['Boolean'];
  dateJoined: Scalars['DateTime'];
  scimId?: Maybe<Scalars['String']>;
  scimExternalId?: Maybe<Scalars['String']>;
  scimUsername?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  primaryOwner?: Maybe<Owner>;
  avatar?: Maybe<Scalars['String']>;
  preferredTechnologies: AnalyzerConnection;
  bookmarkedIssues: RepositoryIssueConnection;
  preference?: Maybe<UserPreference>;
  IsBetaTester: Scalars['Boolean'];
  socialAuth: SocialNodeConnection;
  auditlogSet: AuditLogConnection;
  primaryOwnerships: OwnerConnection;
  teams: TeamConnection;
  teamMemberships: TeamMemberConnection;
  repositorySet: RepositoryConnection;
  transactions: TransactionConnection;
  scimGroups: EnterpriseGroupConnection;
  groupusermembershipSet: GroupUserMembershipConnection;
  autofixrunSet: AutofixRunConnection;
  onboardingEvents: AutoOnboardEventConnection;
  repositorycollaboratorSet: RepositoryCollaboratorConnection;
  silenceRulesCreated: SilenceRuleConnection;
  accessTokens: AccessTokenConnection;
  isSuperuser: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  fullName?: Maybe<Scalars['String']>;
  team?: Maybe<TeamConnection>;
  scimEnabled?: Maybe<Scalars['Boolean']>;
};


export type EnterpriseUserPreferredTechnologiesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseUserBookmarkedIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type EnterpriseUserSocialAuthArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  uid?: Maybe<Scalars['String']>;
  uid_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  provider?: Maybe<Scalars['String']>;
  provider_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type EnterpriseUserAuditlogSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  actor_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  created?: Maybe<Scalars['String']>;
  createdBefore?: Maybe<Scalars['String']>;
  createdAfter?: Maybe<Scalars['String']>;
  ipAddress_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  eventName_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type EnterpriseUserPrimaryOwnershipsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type EnterpriseUserTeamsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseUserTeamMembershipsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type EnterpriseUserRepositorySetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type EnterpriseUserTransactionsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  transactionType?: Maybe<Scalars['String']>;
};


export type EnterpriseUserScimGroupsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseUserGroupusermembershipSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type EnterpriseUserAutofixrunSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  status_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  pullRequestStatus_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type EnterpriseUserOnboardingEventsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  owner?: Maybe<Scalars['ID']>;
};


export type EnterpriseUserRepositorycollaboratorSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
};


export type EnterpriseUserSilenceRulesCreatedArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  creator?: Maybe<Scalars['ID']>;
  issueTitle?: Maybe<Scalars['String']>;
  issueCode?: Maybe<Scalars['String']>;
  filePath?: Maybe<Scalars['String']>;
  silenceLevel?: Maybe<Scalars['String']>;
};


export type EnterpriseUserAccessTokensArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type EnterpriseUserTeamArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};

export type EnterpriseUserConnection = {
  __typename?: 'EnterpriseUserConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<EnterpriseUserEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type EnterpriseUserEdge = {
  __typename?: 'EnterpriseUserEdge';
  node?: Maybe<EnterpriseUser>;
  cursor: Scalars['String'];
};

export type FeatureDefinition = MaskPrimaryKeyNode & {
  __typename?: 'FeatureDefinition';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  shortcode: Scalars['String'];
  featureType: FeatureFeatureType;
  showUpgradeCta: Scalars['Boolean'];
  subscribedOwners: OwnerConnection;
  id: Scalars['ID'];
};


export type FeatureDefinitionSubscribedOwnersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export enum FeatureFeatureType {
  A_1 = 'A_1',
  A_2 = 'A_2'
}

export type FeatureInfo = {
  __typename?: 'FeatureInfo';
  feature?: Maybe<FeatureDefinition>;
  enabled?: Maybe<Scalars['Boolean']>;
};

export type GsrInstallationLandingInput = {
  login: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GsrInstallationLandingPayload = {
  __typename?: 'GSRInstallationLandingPayload';
  ok?: Maybe<Scalars['Boolean']>;
  reauth?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GsrProject = {
  __typename?: 'GSRProject';
  login?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  hasInstalled?: Maybe<Scalars['Boolean']>;
  isSetupPending?: Maybe<Scalars['Boolean']>;
};

export type GenerateKeyPairForOwnerInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GenerateKeyPairForOwnerPayload = {
  __typename?: 'GenerateKeyPairForOwnerPayload';
  publicKey?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GenerateKeyPairForRepositoryInput = {
  repositoryId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GenerateKeyPairForRepositoryPayload = {
  __typename?: 'GenerateKeyPairForRepositoryPayload';
  repository?: Maybe<Repository>;
  clientMutationId?: Maybe<Scalars['String']>;
};


export type GetBillingInfoInput = {
  productSlug: Scalars['String'];
  planSlug: Scalars['String'];
  quantity: Scalars['Int'];
  couponCode?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  isTrial: Scalars['Boolean'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GetBillingInfoPayload = {
  __typename?: 'GetBillingInfoPayload';
  amountPayableThisCycle: Scalars['Float'];
  amountPayableNextCycle: Scalars['Float'];
  nextBillingCycle: Scalars['DateTime'];
  netPayableThisCycle: Scalars['Float'];
  netPayableNextCycle: Scalars['Float'];
  discounts: Discount;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GetUpgradeCodeQualitySubscriptionPlanInfoInput = {
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  planSlug: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GetUpgradeCodeQualitySubscriptionPlanInfoPayload = {
  __typename?: 'GetUpgradeCodeQualitySubscriptionPlanInfoPayload';
  endingBalance?: Maybe<Scalars['Int']>;
  upcomingBillAmount?: Maybe<Scalars['Int']>;
  upcomingBillDate?: Maybe<Scalars['DateTime']>;
  prorationAmount?: Maybe<Scalars['Int']>;
  proratedForDays?: Maybe<Scalars['Int']>;
  billedImmediately?: Maybe<Scalars['Boolean']>;
  quantity?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GithubEnterpriseInstallationLandingInput = {
  queryParams?: Maybe<Scalars['GenericScalar']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GithubEnterpriseInstallationLandingPayload = {
  __typename?: 'GithubEnterpriseInstallationLandingPayload';
  message?: Maybe<Scalars['String']>;
  nextAction?: Maybe<NextActionChoice>;
  vcsProvider?: Maybe<VcsProviderChoices>;
  login?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GithubInstallationLandingInput = {
  queryParams?: Maybe<Scalars['GenericScalar']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GithubInstallationLandingPayload = {
  __typename?: 'GithubInstallationLandingPayload';
  message?: Maybe<Scalars['String']>;
  nextAction?: Maybe<NextActionChoice>;
  vcsProvider?: Maybe<VcsProviderChoices>;
  login?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GitlabInstallationLandingInput = {
  login: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GitlabInstallationLandingPayload = {
  __typename?: 'GitlabInstallationLandingPayload';
  ok?: Maybe<Scalars['Boolean']>;
  reauth?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type GroupInviteInfo = {
  __typename?: 'GroupInviteInfo';
  name?: Maybe<Scalars['String']>;
};

export type GroupTeamMembership = MaskPrimaryKeyNode & {
  __typename?: 'GroupTeamMembership';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  role?: Maybe<TeamMemberRoleChoices>;
  team: Team;
  group: EnterpriseGroup;
};

export type GroupTeamMembershipConnection = {
  __typename?: 'GroupTeamMembershipConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<GroupTeamMembershipEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type GroupTeamMembershipEdge = {
  __typename?: 'GroupTeamMembershipEdge';
  node?: Maybe<GroupTeamMembership>;
  cursor: Scalars['String'];
};

export type GroupUserMembership = MaskPrimaryKeyNode & {
  __typename?: 'GroupUserMembership';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  user: EnterpriseUser;
  group: EnterpriseGroup;
};

export type GroupUserMembershipConnection = {
  __typename?: 'GroupUserMembershipConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<GroupUserMembershipEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type GroupUserMembershipEdge = {
  __typename?: 'GroupUserMembershipEdge';
  node?: Maybe<GroupUserMembership>;
  cursor: Scalars['String'];
};

export enum IgnoreCheckIssueActionChoice {
  Suppress = 'SUPPRESS',
  Delete = 'DELETE'
}

export type IgnoreCheckIssueInput = {
  checkIssueId: Scalars['ID'];
  action: IgnoreCheckIssueActionChoice;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type IgnoreCheckIssuePayload = {
  __typename?: 'IgnoreCheckIssuePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type IgnoreIssueForFilePatternInRepositoryInput = {
  repoIssueId?: Maybe<Scalars['ID']>;
  checkId?: Maybe<Scalars['ID']>;
  issueShortcode?: Maybe<Scalars['String']>;
  pattern: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type IgnoreIssueForFilePatternInRepositoryPayload = {
  __typename?: 'IgnoreIssueForFilePatternInRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  checkIssueIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type IgnoreIssueForRepositoryInput = {
  repoIssueId?: Maybe<Scalars['ID']>;
  checkId?: Maybe<Scalars['ID']>;
  issueShortcode?: Maybe<Scalars['String']>;
  filePath?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type IgnoreIssueForRepositoryPayload = {
  __typename?: 'IgnoreIssueForRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  checkIssueIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type IgnoreIssueForTestPatternsInRepositoryInput = {
  repoIssueId?: Maybe<Scalars['ID']>;
  checkId?: Maybe<Scalars['ID']>;
  issueShortcode?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type IgnoreIssueForTestPatternsInRepositoryPayload = {
  __typename?: 'IgnoreIssueForTestPatternsInRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  checkIssueIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export enum InviteActions {
  View = 'VIEW',
  Accept = 'ACCEPT'
}

export enum InviteTeamMemberActionChoice {
  Create = 'CREATE',
  Cancel = 'CANCEL'
}

export type InviteTeamMemberInput = {
  ownerId?: Maybe<Scalars['Int']>;
  ownerPk?: Maybe<Scalars['ID']>;
  email: Scalars['String'];
  action: InviteTeamMemberActionChoice;
  role: TeamMemberRoleChoices;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type InviteTeamMemberPayload = {
  __typename?: 'InviteTeamMemberPayload';
  invitationUrl?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type InviteTeamMembersInput = {
  invitees: Array<Maybe<Invitee>>;
  ownerId: Scalars['ID'];
  action: InviteTeamMemberActionChoice;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type InviteTeamMembersPayload = {
  __typename?: 'InviteTeamMembersPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Invitee = {
  email: Scalars['String'];
  role: TeamMemberRoleChoices;
};

export type Invoice = {
  __typename?: 'Invoice';
  invoiceId?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['DateTime']>;
  amount?: Maybe<Scalars['Float']>;
  url?: Maybe<Scalars['String']>;
};

export type Issue = MaskPrimaryKeyNode & {
  __typename?: 'Issue';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  shortcode: Scalars['String'];
  title: Scalars['String'];
  description: Scalars['String'];
  severity: IssueSeverity;
  analyzer: Analyzer;
  autofixAvailable: Scalars['Boolean'];
  autofixTitle?: Maybe<Scalars['String']>;
  isRecommended: Scalars['Boolean'];
  weight: Scalars['Int'];
  starIssueInAnalyzers: AnalyzerConnection;
  issuePriorities: IssuePriorityConnection;
  checkIssues: CheckIssueConnection;
  autofixRuns: AutofixRunConnection;
  occurrenceCount?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  seenIn?: Maybe<Scalars['String']>;
  descriptionRendered?: Maybe<Scalars['String']>;
  shortDescription?: Maybe<Scalars['String']>;
  shortDescriptionRendered?: Maybe<Scalars['String']>;
  issuePriority?: Maybe<IssuePriority>;
};


export type IssueStarIssueInAnalyzersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  q?: Maybe<Scalars['String']>;
};


export type IssueIssuePrioritiesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type IssueCheckIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type IssueAutofixRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  status_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  pullRequestStatus_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type IssueIssuePriorityArgs = {
  objectId: Scalars['ID'];
  level: IssuePriorityLevel;
};

export type IssueConnection = {
  __typename?: 'IssueConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<IssueEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type IssueEdge = {
  __typename?: 'IssueEdge';
  node?: Maybe<Issue>;
  cursor: Scalars['String'];
};

export type IssuePriority = MaskPrimaryKeyNode & {
  __typename?: 'IssuePriority';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  issuePriorityType: IssuePriorityType;
  concreteIssue: Issue;
  repository?: Maybe<Repository>;
  owner?: Maybe<Owner>;
  repositoryIssuePriority?: Maybe<IssuePriorityType>;
  ownerIssuePriority?: Maybe<IssuePriorityType>;
  cascadingIssuePriority?: Maybe<IssuePriorityType>;
  source?: Maybe<IssuePriorityLevel>;
};

export type IssuePriorityConnection = {
  __typename?: 'IssuePriorityConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<IssuePriorityEdge>>;
};

export type IssuePriorityEdge = {
  __typename?: 'IssuePriorityEdge';
  node?: Maybe<IssuePriority>;
  cursor: Scalars['String'];
};

export enum IssuePriorityLevel {
  Repository = 'REPOSITORY',
  Owner = 'OWNER',
  Enterprise = 'ENTERPRISE'
}

export type IssuePrioritySetting = {
  __typename?: 'IssuePrioritySetting';
  slug?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Int']>;
  verboseName?: Maybe<Scalars['String']>;
  isIgnoredInCheckStatus?: Maybe<Scalars['Boolean']>;
  isIgnoredToDisplay?: Maybe<Scalars['Boolean']>;
};

export type IssuePriorityType = Node & {
  __typename?: 'IssuePriorityType';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  weight?: Maybe<Scalars['Int']>;
  slug?: Maybe<Scalars['String']>;
  verboseName?: Maybe<Scalars['String']>;
  issuePriorities: IssuePriorityConnection;
  id: Scalars['ID'];
};


export type IssuePriorityTypeIssuePrioritiesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type IssuePriorityTypeConnection = {
  __typename?: 'IssuePriorityTypeConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<IssuePriorityTypeEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type IssuePriorityTypeEdge = {
  __typename?: 'IssuePriorityTypeEdge';
  node?: Maybe<IssuePriorityType>;
  cursor: Scalars['String'];
};

export enum IssueSeverity {
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR'
}

export type IssueTypeSetting = {
  __typename?: 'IssueTypeSetting';
  slug?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  isIgnoredInCheckStatus?: Maybe<Scalars['Boolean']>;
  isIgnoredToDisplay?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
};

export type IssueTypeSettingInput = {
  slug?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  isIgnoredInCheckStatus?: Maybe<Scalars['Boolean']>;
  isIgnoredToDisplay?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
};


export type License = {
  __typename?: 'License';
  seatsTotal?: Maybe<Scalars['Int']>;
  seatsUsed?: Maybe<Scalars['Int']>;
  plan?: Maybe<Scalars['String']>;
  licenseExpiry?: Maybe<Scalars['String']>;
  seatUsageTrend?: Maybe<Scalars['GenericScalar']>;
};


export type LicenseSeatUsageTrendArgs = {
  lastDays: Scalars['Int'];
  trendType: TrendType;
};

export type LogOutInput = {
  clientMutationId?: Maybe<Scalars['String']>;
};

export type LogOutPayload = {
  __typename?: 'LogOutPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type MaskPrimaryKeyNode = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  updateEnterpriseInstallation?: Maybe<UpdateEnterpriseInstallationPayload>;
  createGroup?: Maybe<CreateGroupPayload>;
  updateGroup?: Maybe<UpdateGroupPayload>;
  deleteGroup?: Maybe<DeleteGroupPayload>;
  resetGroupInvitationLink?: Maybe<ResetGroupInvitationLinkPayload>;
  addUserToGroup?: Maybe<AddUserToGroupPayload>;
  removeUserFromGroup?: Maybe<RemoveUserFromGroupPayload>;
  addTeamToGroup?: Maybe<AddTeamToGroupPayload>;
  removeTeamFromGroup?: Maybe<RemoveTeamFromGroupPayload>;
  updateGroupTeamRole?: Maybe<UpdateGroupTeamRolePayload>;
  toggleUserActive?: Maybe<ToggleUserActivePayload>;
  deleteUser?: Maybe<DeleteUserPayload>;
  acceptGroupInvite?: Maybe<AcceptGroupInvitePayload>;
  socialAuth?: Maybe<SocialAuthJwt>;
  revokeToken?: Maybe<Revoke>;
  deleteTokenCookie?: Maybe<DeleteJsonWebTokenCookie>;
  deleteRefreshTokenCookie?: Maybe<DeleteRefreshTokenCookie>;
  logout?: Maybe<LogOutPayload>;
  switchToAsgard?: Maybe<SwitchToAsgardPayload>;
  verifyToken?: Maybe<Verify>;
  refreshToken?: Maybe<RefreshToken>;
  toggleRepositoryActivation?: Maybe<ToggleRepositoryActivationPayload>;
  updateRepositorySettings?: Maybe<UpdateRepositorySettingsPayload>;
  updateOwnerSettings?: Maybe<UpdateOwnerSettingsPayload>;
  getBillingInfo?: Maybe<GetBillingInfoPayload>;
  ignoreIssueForRepository?: Maybe<IgnoreIssueForRepositoryPayload>;
  ignoreIssueForFilePatternInRepository?: Maybe<IgnoreIssueForFilePatternInRepositoryPayload>;
  ignoreIssueForTestPatternsInRepository?: Maybe<IgnoreIssueForTestPatternsInRepositoryPayload>;
  reportIssueFalsePositive?: Maybe<ReportIssueFalsePositivePayload>;
  ignoreCheckIssue?: Maybe<IgnoreCheckIssuePayload>;
  generateKeyPairForRepository?: Maybe<GenerateKeyPairForRepositoryPayload>;
  removeKeyPairForRepository?: Maybe<RemoveKeyPairForRepositoryPayload>;
  generateKeyPairForOwner?: Maybe<GenerateKeyPairForOwnerPayload>;
  removeKeyPairForOwner?: Maybe<RemoveKeyPairForOwnerPayload>;
  updateRepositoryWidgets?: Maybe<UpdateRepositoryWidgetsPayload>;
  deleteSilenceRule?: Maybe<DeleteSilenceRulePayload>;
  updateDefaultDashboardContextForUser?: Maybe<UpdateDefaultDashboardContextForUserPayload>;
  updateBillingInfo?: Maybe<UpdateBillingInfoPayload>;
  subscriptionCheckout?: Maybe<SubscriptionCheckoutPayload>;
  updateDefaultPaymentSource?: Maybe<UpdateDefaultPaymentSourcePayload>;
  cancelCodeQualitySubscription?: Maybe<CancelCodeQualitySubscriptionPayload>;
  updateCodeQualitySubscriptionSeats?: Maybe<UpdateCodeQualitySubscriptionSeatsPayload>;
  getUpgradeCodeQualitySubscriptionPlanInfo?: Maybe<GetUpgradeCodeQualitySubscriptionPlanInfoPayload>;
  subscriptionPlanSwitch?: Maybe<SubscriptionPlanSwitchPayload>;
  revertSubscriptionCancellation?: Maybe<RevertSubscriptionCancellationPayload>;
  applyCreditsToOwner?: Maybe<ApplyCreditsToOwnerPayload>;
  inviteTeamMember?: Maybe<InviteTeamMemberPayload>;
  inviteTeamMembers?: Maybe<InviteTeamMembersPayload>;
  removeTeamMember?: Maybe<RemoveTeamMemberPayload>;
  updateTeamMemberRole?: Maybe<UpdateTeamMemberRolePayload>;
  syncRepositoriesForOwner?: Maybe<SyncRepositoriesForOwnerPayload>;
  createAutofixRun?: Maybe<CreateAutofixRunPayload>;
  createdPullRequest?: Maybe<CreatePullRequestPayload>;
  commitConfigToVcs?: Maybe<CommitConfigToVcsPayload>;
  updateRepoMetricThreshold?: Maybe<UpdateRepoMetricThresholdPayload>;
  createAutofixRunForPullRequest?: Maybe<CreateAutofixRunForPullRequestPayload>;
  createAutofixRunForAnalyzer?: Maybe<CreateAutofixRunForAnalyzerPayload>;
  commitChangesToPr?: Maybe<CommitChangesToPrPayload>;
  commitAdhocConfig?: Maybe<CommitAdhocConfigPayload>;
  resetInvitationLink?: Maybe<ResetTeamInvitationLinkPayload>;
  updateTeamBasePermissions?: Maybe<UpdateTeamBasePermissionsPayload>;
  addAnalyzerFeedback?: Maybe<AddAnalyzerFeedbackPayload>;
  addTransformerFeedback?: Maybe<AddTransformerFeedbackPayload>;
  updateAccessControlSettings?: Maybe<UpdateAccessControlSettingsPayload>;
  syncVcsPermissions?: Maybe<SyncVcsPermissionsPayload>;
  updateOrCreateRepositoryCollaborator?: Maybe<UpdateOrCreateRepositoryCollaboratorPayload>;
  removeRepositoryCollaborator?: Maybe<RemoveRepositoryCollaboratorPayload>;
  triggerAnalysisForRepository?: Maybe<TriggerAnalysisForRepositoryPayload>;
  updateTechnologyPreference?: Maybe<UpdateTechnologyPreferencePayload>;
  updateBookmarkedIssue?: Maybe<UpdateBookmarkedIssuePayload>;
  triggerAdhocRun?: Maybe<TriggerAdHocRunPayload>;
  activateGsrRepository?: Maybe<ActivateGsrRepositoryPayload>;
  installation?: Maybe<GithubInstallationLandingPayload>;
  gheInstallationLanding?: Maybe<GithubEnterpriseInstallationLandingPayload>;
  bitbucketInstallationLanding?: Maybe<BitbucketInstallationLandingPayload>;
  gitlabInstallationLanding?: Maybe<GitlabInstallationLandingPayload>;
  gsrInstallationLanding?: Maybe<GsrInstallationLandingPayload>;
  updateStarredRepository?: Maybe<UpdateStarredRepositoryPayload>;
  updateWatchedRepository?: Maybe<UpdateWatchedRepositoryPayload>;
  confirmInvitation?: Maybe<ConfirmInvitationPayload>;
  verifyDevice?: Maybe<VerifyDevicePayload>;
  createConfigTemplate?: Maybe<CreateConfigTemplatePayload>;
  updateConfigTemplate?: Maybe<UpdateConfigTemplatePayload>;
  deleteConfigTemplate?: Maybe<DeleteConfigTemplatePayload>;
  autoOnboard?: Maybe<AutoOnboardPayload>;
  submitSupportTicket?: Maybe<SubmitSupportTicketPayload>;
  createWebhook?: Maybe<CreateWebhookPayload>;
  testWebhook?: Maybe<TestWebhookPayload>;
  updateWebhook?: Maybe<UpdateWebhookPayload>;
  disableWebhook?: Maybe<DisableWebhookPayload>;
  deleteWebhook?: Maybe<DeleteWebhookPayload>;
  createAccessToken?: Maybe<CreateAccessTokenPayload>;
  updateAccessToken?: Maybe<UpdateAccessTokenPayload>;
  rotateAccessToken?: Maybe<RotateAccessTokenPayload>;
  deleteAccessToken?: Maybe<DeleteAccessTokenPayload>;
  deleteAllAccessTokens?: Maybe<DeleteAllAccessTokensPayload>;
  webhookSecret?: Maybe<WebhookSecretPayload>;
  verifyGsrPermissions?: Maybe<VerifyGsrPermissionsPayload>;
  verifyGsrWebhooks?: Maybe<VerifyGsrWebhooksPayload>;
  triggerVerifyGsrSsh?: Maybe<TriggerVerifyGsrsshPayload>;
  verifyGsrSetup?: Maybe<VerifyGsrSetupPayload>;
  updateIssuePriority?: Maybe<UpdateIssuePriorityPayload>;
  unsetIssuePriority?: Maybe<UnsetIssuePriorityPayload>;
};


export type MutationUpdateEnterpriseInstallationArgs = {
  input: UpdateEnterpriseInstallationInput;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationUpdateGroupArgs = {
  input: UpdateGroupInput;
};


export type MutationDeleteGroupArgs = {
  input: DeleteGroupInput;
};


export type MutationResetGroupInvitationLinkArgs = {
  input: ResetGroupInvitationLinkInput;
};


export type MutationAddUserToGroupArgs = {
  input: AddUserToGroupInput;
};


export type MutationRemoveUserFromGroupArgs = {
  input: RemoveUserFromGroupInput;
};


export type MutationAddTeamToGroupArgs = {
  input: AddTeamToGroupInput;
};


export type MutationRemoveTeamFromGroupArgs = {
  input: RemoveTeamFromGroupInput;
};


export type MutationUpdateGroupTeamRoleArgs = {
  input: UpdateGroupTeamRoleInput;
};


export type MutationToggleUserActiveArgs = {
  input: ToggleUserActiveInput;
};


export type MutationDeleteUserArgs = {
  input: DeleteUserInput;
};


export type MutationAcceptGroupInviteArgs = {
  input: AcceptGroupInviteInput;
};


export type MutationSocialAuthArgs = {
  code: Scalars['String'];
  provider: Scalars['String'];
};


export type MutationRevokeTokenArgs = {
  refreshToken?: Maybe<Scalars['String']>;
};


export type MutationLogoutArgs = {
  input: LogOutInput;
};


export type MutationSwitchToAsgardArgs = {
  input: SwitchToAsgardInput;
};


export type MutationVerifyTokenArgs = {
  token?: Maybe<Scalars['String']>;
};


export type MutationRefreshTokenArgs = {
  refreshToken?: Maybe<Scalars['String']>;
};


export type MutationToggleRepositoryActivationArgs = {
  input: ToggleRepositoryActivationInput;
};


export type MutationUpdateRepositorySettingsArgs = {
  input: UpdateRepositorySettingsInput;
};


export type MutationUpdateOwnerSettingsArgs = {
  input: UpdateOwnerSettingsInput;
};


export type MutationGetBillingInfoArgs = {
  input: GetBillingInfoInput;
};


export type MutationIgnoreIssueForRepositoryArgs = {
  input: IgnoreIssueForRepositoryInput;
};


export type MutationIgnoreIssueForFilePatternInRepositoryArgs = {
  input: IgnoreIssueForFilePatternInRepositoryInput;
};


export type MutationIgnoreIssueForTestPatternsInRepositoryArgs = {
  input: IgnoreIssueForTestPatternsInRepositoryInput;
};


export type MutationReportIssueFalsePositiveArgs = {
  input: ReportIssueFalsePositiveInput;
};


export type MutationIgnoreCheckIssueArgs = {
  input: IgnoreCheckIssueInput;
};


export type MutationGenerateKeyPairForRepositoryArgs = {
  input: GenerateKeyPairForRepositoryInput;
};


export type MutationRemoveKeyPairForRepositoryArgs = {
  input: RemoveKeyPairForRepositoryInput;
};


export type MutationGenerateKeyPairForOwnerArgs = {
  input: GenerateKeyPairForOwnerInput;
};


export type MutationRemoveKeyPairForOwnerArgs = {
  input: RemoveKeyPairForOwnerInput;
};


export type MutationUpdateRepositoryWidgetsArgs = {
  input: UpdateRepositoryWidgetsInput;
};


export type MutationDeleteSilenceRuleArgs = {
  input: DeleteSilenceRuleInput;
};


export type MutationUpdateDefaultDashboardContextForUserArgs = {
  input: UpdateDefaultDashboardContextForUserInput;
};


export type MutationUpdateBillingInfoArgs = {
  input: UpdateBillingInfoInput;
};


export type MutationSubscriptionCheckoutArgs = {
  input: SubscriptionCheckoutInput;
};


export type MutationUpdateDefaultPaymentSourceArgs = {
  input: UpdateDefaultPaymentSourceInput;
};


export type MutationCancelCodeQualitySubscriptionArgs = {
  input: CancelCodeQualitySubscriptionInput;
};


export type MutationUpdateCodeQualitySubscriptionSeatsArgs = {
  input: UpdateCodeQualitySubscriptionSeatsInput;
};


export type MutationGetUpgradeCodeQualitySubscriptionPlanInfoArgs = {
  input: GetUpgradeCodeQualitySubscriptionPlanInfoInput;
};


export type MutationSubscriptionPlanSwitchArgs = {
  input: SubscriptionPlanSwitchInput;
};


export type MutationRevertSubscriptionCancellationArgs = {
  input: RevertSubscriptionCancellationInput;
};


export type MutationApplyCreditsToOwnerArgs = {
  input: ApplyCreditsToOwnerInput;
};


export type MutationInviteTeamMemberArgs = {
  input: InviteTeamMemberInput;
};


export type MutationInviteTeamMembersArgs = {
  input: InviteTeamMembersInput;
};


export type MutationRemoveTeamMemberArgs = {
  input: RemoveTeamMemberInput;
};


export type MutationUpdateTeamMemberRoleArgs = {
  input: UpdateTeamMemberRoleInput;
};


export type MutationSyncRepositoriesForOwnerArgs = {
  input: SyncRepositoriesForOwnerInput;
};


export type MutationCreateAutofixRunArgs = {
  input: CreateAutofixRunInput;
};


export type MutationCreatedPullRequestArgs = {
  input: CreatePullRequestInput;
};


export type MutationCommitConfigToVcsArgs = {
  input: CommitConfigToVcsInput;
};


export type MutationUpdateRepoMetricThresholdArgs = {
  input: UpdateRepoMetricThresholdInput;
};


export type MutationCreateAutofixRunForPullRequestArgs = {
  input: CreateAutofixRunForPullRequestInput;
};


export type MutationCreateAutofixRunForAnalyzerArgs = {
  input: CreateAutofixRunForAnalyzerInput;
};


export type MutationCommitChangesToPrArgs = {
  input: CommitChangesToPrInput;
};


export type MutationCommitAdhocConfigArgs = {
  input: CommitAdhocConfigInput;
};


export type MutationResetInvitationLinkArgs = {
  input: ResetTeamInvitationLinkInput;
};


export type MutationUpdateTeamBasePermissionsArgs = {
  input: UpdateTeamBasePermissionsInput;
};


export type MutationAddAnalyzerFeedbackArgs = {
  input: AddAnalyzerFeedbackInput;
};


export type MutationAddTransformerFeedbackArgs = {
  input: AddTransformerFeedbackInput;
};


export type MutationUpdateAccessControlSettingsArgs = {
  input: UpdateAccessControlSettingsInput;
};


export type MutationSyncVcsPermissionsArgs = {
  input: SyncVcsPermissionsInput;
};


export type MutationUpdateOrCreateRepositoryCollaboratorArgs = {
  input: UpdateOrCreateRepositoryCollaboratorInput;
};


export type MutationRemoveRepositoryCollaboratorArgs = {
  input: RemoveRepositoryCollaboratorInput;
};


export type MutationTriggerAnalysisForRepositoryArgs = {
  input: TriggerAnalysisForRepositoryInput;
};


export type MutationUpdateTechnologyPreferenceArgs = {
  input: UpdateTechnologyPreferenceInput;
};


export type MutationUpdateBookmarkedIssueArgs = {
  input: UpdateBookmarkedIssueInput;
};


export type MutationTriggerAdhocRunArgs = {
  input: TriggerAdHocRunInput;
};


export type MutationActivateGsrRepositoryArgs = {
  input: ActivateGsrRepositoryInput;
};


export type MutationInstallationArgs = {
  input: GithubInstallationLandingInput;
};


export type MutationGheInstallationLandingArgs = {
  input: GithubEnterpriseInstallationLandingInput;
};


export type MutationBitbucketInstallationLandingArgs = {
  input: BitbucketInstallationLandingInput;
};


export type MutationGitlabInstallationLandingArgs = {
  input: GitlabInstallationLandingInput;
};


export type MutationGsrInstallationLandingArgs = {
  input: GsrInstallationLandingInput;
};


export type MutationUpdateStarredRepositoryArgs = {
  input: UpdateStarredRepositoryInput;
};


export type MutationUpdateWatchedRepositoryArgs = {
  input: UpdateWatchedRepositoryInput;
};


export type MutationConfirmInvitationArgs = {
  input: ConfirmInvitationInput;
};


export type MutationVerifyDeviceArgs = {
  input: VerifyDeviceInput;
};


export type MutationCreateConfigTemplateArgs = {
  input: CreateConfigTemplateInput;
};


export type MutationUpdateConfigTemplateArgs = {
  input: UpdateConfigTemplateInput;
};


export type MutationDeleteConfigTemplateArgs = {
  input: DeleteConfigTemplateInput;
};


export type MutationAutoOnboardArgs = {
  input: AutoOnboardInput;
};


export type MutationSubmitSupportTicketArgs = {
  input: SubmitSupportTicketInput;
};


export type MutationCreateWebhookArgs = {
  input: CreateWebhookInput;
};


export type MutationTestWebhookArgs = {
  input: TestWebhookInput;
};


export type MutationUpdateWebhookArgs = {
  input: UpdateWebhookInput;
};


export type MutationDisableWebhookArgs = {
  input: DisableWebhookInput;
};


export type MutationDeleteWebhookArgs = {
  input: DeleteWebhookInput;
};


export type MutationCreateAccessTokenArgs = {
  input: CreateAccessTokenInput;
};


export type MutationUpdateAccessTokenArgs = {
  input: UpdateAccessTokenInput;
};


export type MutationRotateAccessTokenArgs = {
  input: RotateAccessTokenInput;
};


export type MutationDeleteAccessTokenArgs = {
  input: DeleteAccessTokenInput;
};


export type MutationDeleteAllAccessTokensArgs = {
  input: DeleteAllAccessTokensInput;
};


export type MutationWebhookSecretArgs = {
  input: WebhookSecretInput;
};


export type MutationVerifyGsrPermissionsArgs = {
  input: VerifyGsrPermissionsInput;
};


export type MutationVerifyGsrWebhooksArgs = {
  input: VerifyGsrWebhooksInput;
};


export type MutationTriggerVerifyGsrSshArgs = {
  input: TriggerVerifyGsrsshInput;
};


export type MutationVerifyGsrSetupArgs = {
  input: VerifyGsrSetupInput;
};


export type MutationUpdateIssuePriorityArgs = {
  input: UpdateIssuePriorityInput;
};


export type MutationUnsetIssuePriorityArgs = {
  input: UnsetIssuePriorityInput;
};

export enum NextActionChoice {
  GithubLogin = 'GITHUB_LOGIN',
  Dashboard = 'DASHBOARD',
  Onboard = 'ONBOARD',
  Login = 'LOGIN'
}

export type Node = {
  id: Scalars['ID'];
};

export type Owner = MaskPrimaryKeyNode & {
  __typename?: 'Owner';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  login: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  vcsProvider: OwnerVcsProvider;
  vcsAccountUid: Scalars['String'];
  plan?: Maybe<OwnerPlan>;
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
  customerId?: Maybe<Scalars['String']>;
  primaryUser?: Maybe<EnterpriseUser>;
  features?: Maybe<Scalars['GenericScalar']>;
  gsrSetupPending: Scalars['Boolean'];
  analyzers: AnalyzerConnection;
  issuePriorities: IssuePriorityConnection;
  team?: Maybe<Team>;
  repositories?: Maybe<RepositoryConnection>;
  userSet: EnterpriseUserConnection;
  configTemplates?: Maybe<ConfigTemplateConnection>;
  onboardingEvents: AutoOnboardEventConnection;
  ownerSetting?: Maybe<OwnerSetting>;
  webhooks: WebhookConnection;
  isAutofixEnabled?: Maybe<Scalars['Boolean']>;
  autofixInstallationUrl?: Maybe<Scalars['String']>;
  isTeam?: Maybe<Scalars['Boolean']>;
  cards?: Maybe<Scalars['GenericScalar']>;
  stripeInvoices?: Maybe<Scalars['GenericScalar']>;
  numMembersTotal?: Maybe<Scalars['Int']>;
  billingInfo?: Maybe<BillingInfo>;
  enterpriseBillingInfo?: Maybe<EnterpriseBillingInfo>;
  activeCard?: Maybe<Card>;
  hasPremiumPlan?: Maybe<Scalars['Boolean']>;
  hasSubscribedToPlan?: Maybe<Scalars['Boolean']>;
  planUpgradeUrl?: Maybe<Scalars['String']>;
  isViewerPrimaryUser?: Maybe<Scalars['Boolean']>;
  setting?: Maybe<OwnerSetting>;
  hasGrantedAllRepoAccess?: Maybe<Scalars['Boolean']>;
  appConfigurationUrl?: Maybe<Scalars['String']>;
  featureConfig?: Maybe<Array<Maybe<FeatureInfo>>>;
  autofixedIssueTrend?: Maybe<Scalars['GenericScalar']>;
  issueTrend?: Maybe<Scalars['GenericScalar']>;
  resolvedIssueTrend?: Maybe<Scalars['GenericScalar']>;
  accountSetupStatus?: Maybe<Scalars['GenericScalar']>;
  subscribedPlanInfo?: Maybe<Scalars['GenericScalar']>;
  vcsUrl?: Maybe<Scalars['String']>;
  vcsInstallationId?: Maybe<Scalars['String']>;
  canOnboard?: Maybe<Scalars['Boolean']>;
  configTemplate?: Maybe<ConfigTemplate>;
  isAutoonboardAllowed?: Maybe<Scalars['Boolean']>;
  autoonboardableRepositories?: Maybe<RepositoryConnection>;
  autoonboardingEvents?: Maybe<AutoOnboardEventConnection>;
  accessTokens?: Maybe<AccessTokenConnection>;
  maxUsagePercentage?: Maybe<Scalars['Float']>;
  featureUsage?: Maybe<Scalars['GenericScalar']>;
  isGsrSshRegistered?: Maybe<Scalars['Boolean']>;
};


export type OwnerAnalyzersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  q?: Maybe<Scalars['String']>;
};


export type OwnerIssuePrioritiesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type OwnerRepositoriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type OwnerUserSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type OwnerConfigTemplatesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  shortcode?: Maybe<Scalars['String']>;
  title_Icontains?: Maybe<Scalars['String']>;
};


export type OwnerOnboardingEventsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  owner?: Maybe<Scalars['ID']>;
};


export type OwnerWebhooksArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type OwnerAutofixedIssueTrendArgs = {
  lastDays: Scalars['Int'];
};


export type OwnerIssueTrendArgs = {
  lastDays: Scalars['Int'];
};


export type OwnerResolvedIssueTrendArgs = {
  lastDays: Scalars['Int'];
};


export type OwnerConfigTemplateArgs = {
  shortcode: Scalars['String'];
};


export type OwnerAutoonboardableRepositoriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type OwnerAutoonboardingEventsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  owner?: Maybe<Scalars['ID']>;
};


export type OwnerAccessTokensArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type OwnerConnection = {
  __typename?: 'OwnerConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<OwnerEdge>>;
};

export type OwnerEdge = {
  __typename?: 'OwnerEdge';
  node?: Maybe<Owner>;
  cursor: Scalars['String'];
};

export enum OwnerPlan {
  Free = 'FREE',
  Developer = 'DEVELOPER',
  Team = 'TEAM'
}

export type OwnerSetting = MaskPrimaryKeyNode & {
  __typename?: 'OwnerSetting';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  owner: Owner;
  publicKey?: Maybe<Scalars['String']>;
  issueTypeSettings?: Maybe<Array<Maybe<IssueTypeSetting>>>;
};

export enum OwnerVcsProvider {
  Gh = 'GH',
  Gl = 'GL',
  Bb = 'BB',
  Ghe = 'GHE',
  Gsr = 'GSR'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
  endCursor?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  changelog?: Maybe<Changelog>;
  isViewerSuperadmin?: Maybe<Scalars['Boolean']>;
  getGroupInviteInfo?: Maybe<GroupInviteInfo>;
  enterprise?: Maybe<EnterpriseInstallationRoot>;
  accessToken?: Maybe<AccessToken>;
  webhookEventTypes?: Maybe<WebhookEventTypesConnection>;
  webhookEventDeliveries?: Maybe<WebhookEventDeliveryConnection>;
  webhookEventDelivery?: Maybe<WebhookEventDelivery>;
  webhook?: Maybe<Webhook>;
  webhooks?: Maybe<WebhookConnection>;
  transformer?: Maybe<TransformerTool>;
  transformers?: Maybe<TransformerToolConnection>;
  transformerRun: TransformerRun;
  autofixRun: AutofixRun;
  oauth?: Maybe<SocialAuthUrl>;
  issuePriorityType?: Maybe<IssuePriorityTypeConnection>;
  issue?: Maybe<Issue>;
  issuesWithPriority?: Maybe<IssueConnection>;
  transactions?: Maybe<TransactionConnection>;
  owner?: Maybe<Owner>;
  team?: Maybe<Team>;
  fileIssues?: Maybe<RepositoryIssueConnection>;
  checkIssues?: Maybe<CheckIssueConnection>;
  check: Check;
  analyzer?: Maybe<Analyzer>;
  analyzers?: Maybe<AnalyzerConnection>;
  viewer?: Maybe<User>;
  repositoryIssues?: Maybe<RepositoryIssueConnection>;
  repository?: Maybe<Repository>;
  trendingRepositories?: Maybe<RepositoryConnection>;
  editorsPickRepository?: Maybe<Repository>;
  discoverRepositories?: Maybe<RepositoryConnection>;
  context?: Maybe<Context>;
  node?: Maybe<MaskPrimaryKeyNode>;
};


export type QueryGetGroupInviteInfoArgs = {
  invitationCode: Scalars['String'];
};


export type QueryAccessTokenArgs = {
  tokenId: Scalars['ID'];
};


export type QueryWebhookEventTypesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type QueryWebhookEventDeliveriesArgs = {
  ownerId: Scalars['ID'];
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type QueryWebhookEventDeliveryArgs = {
  ownerId: Scalars['ID'];
  deliveryId: Scalars['ID'];
};


export type QueryWebhookArgs = {
  webhookId: Scalars['ID'];
};


export type QueryWebhooksArgs = {
  ownerId: Scalars['ID'];
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type QueryTransformerArgs = {
  shortcode: Scalars['String'];
};


export type QueryTransformersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  language?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type QueryTransformerRunArgs = {
  runId: Scalars['String'];
};


export type QueryAutofixRunArgs = {
  runId: Scalars['String'];
};


export type QueryIssuePriorityTypeArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  weight?: Maybe<Scalars['Int']>;
  verboseName?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
};


export type QueryIssueArgs = {
  shortcode: Scalars['String'];
};


export type QueryIssuesWithPriorityArgs = {
  isIssuePrioritySet?: Maybe<Scalars['Boolean']>;
  objectId: Scalars['ID'];
  level: IssuePriorityLevel;
  analyzerShortcode?: Maybe<Scalars['String']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type QueryTransactionsArgs = {
  userId: Scalars['Int'];
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  transactionType?: Maybe<Scalars['String']>;
};


export type QueryOwnerArgs = {
  login: Scalars['String'];
  provider: VcsProviderChoices;
};


export type QueryTeamArgs = {
  login: Scalars['String'];
  provider: VcsProviderChoices;
};


export type QueryFileIssuesArgs = {
  repoId: Scalars['ID'];
  filepath: Scalars['String'];
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type QueryCheckIssuesArgs = {
  checkId: Scalars['ID'];
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type QueryCheckArgs = {
  checkId: Scalars['ID'];
};


export type QueryAnalyzerArgs = {
  shortcode: Scalars['String'];
};


export type QueryAnalyzersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  q?: Maybe<Scalars['String']>;
};


export type QueryRepositoryIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type QueryRepositoryArgs = {
  name: Scalars['String'];
  owner: Scalars['String'];
  provider: VcsProviderChoices;
};


export type QueryTrendingRepositoriesArgs = {
  count?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type QueryDiscoverRepositoriesArgs = {
  preferredTechnologies?: Maybe<Array<Maybe<Scalars['ID']>>>;
  q?: Maybe<Scalars['String']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};

export type RefreshToken = {
  __typename?: 'RefreshToken';
  payload: Scalars['GenericScalar'];
  refreshExpiresIn: Scalars['Int'];
  token: Scalars['String'];
  refreshToken: Scalars['String'];
};

export type RemoveKeyPairForOwnerInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveKeyPairForOwnerPayload = {
  __typename?: 'RemoveKeyPairForOwnerPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveKeyPairForRepositoryInput = {
  repositoryId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveKeyPairForRepositoryPayload = {
  __typename?: 'RemoveKeyPairForRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveRepositoryCollaboratorInput = {
  repositoryCollaboratorId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveRepositoryCollaboratorPayload = {
  __typename?: 'RemoveRepositoryCollaboratorPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveTeamFromGroupInput = {
  groupId: Scalars['ID'];
  teamId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveTeamFromGroupPayload = {
  __typename?: 'RemoveTeamFromGroupPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveTeamMemberInput = {
  ownerId?: Maybe<Scalars['Int']>;
  ownerPk?: Maybe<Scalars['ID']>;
  memberEmail: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveTeamMemberPayload = {
  __typename?: 'RemoveTeamMemberPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveUserFromGroupInput = {
  groupId: Scalars['ID'];
  userId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveUserFromGroupPayload = {
  __typename?: 'RemoveUserFromGroupPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ReportIssueFalsePositiveInput = {
  checkIssueId: Scalars['ID'];
  comment?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ReportIssueFalsePositivePayload = {
  __typename?: 'ReportIssueFalsePositivePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Repository = MaskPrimaryKeyNode & {
  __typename?: 'Repository';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  vcsType: RepositoryVcsType;
  vcsProvider: VcsProviderChoices;
  vcsUrl: Scalars['String'];
  vcsRepoUid: Scalars['String'];
  collaborators?: Maybe<RepositoryCollaboratorConnection>;
  vcsCreatedAt?: Maybe<Scalars['DateTime']>;
  sshUrl: Scalars['String'];
  defaultBranchName?: Maybe<Scalars['String']>;
  latestCommitOid?: Maybe<Scalars['String']>;
  latestAnalysisRun?: Maybe<Run>;
  isFork: Scalars['Boolean'];
  isMirror: Scalars['Boolean'];
  isPrivate: Scalars['Boolean'];
  showInDiscover: Scalars['Boolean'];
  languages: Scalars['GenericScalar'];
  isActivated: Scalars['Boolean'];
  errorCode: Scalars['Int'];
  errorMessage?: Maybe<Scalars['String']>;
  errorCtaButtonText?: Maybe<Scalars['String']>;
  errorCtaButtonUrl?: Maybe<Scalars['String']>;
  accessToken: Scalars['UUID'];
  encPublicKey?: Maybe<Scalars['String']>;
  isSubmoduleEnabled: Scalars['Boolean'];
  analyzeChangesetOnly: Scalars['Boolean'];
  issues?: Maybe<RepositoryIssueConnection>;
  config: Scalars['GenericScalar'];
  owner: Owner;
  widgets?: Maybe<Array<Maybe<Scalars['String']>>>;
  supportedAnalyzers?: Maybe<Array<Maybe<Scalars['String']>>>;
  token: Scalars['String'];
  extraData: Scalars['JSONString'];
  weightCutoff: Scalars['Int'];
  tree: Scalars['JSONString'];
  latestTrainedRun?: Maybe<Run>;
  primaryAnalyzer?: Maybe<Analyzer>;
  majorityAnalyzer?: Maybe<Analyzer>;
  analyzer?: Maybe<Analyzer>;
  issuePriorities: IssuePriorityConnection;
  checks: CheckConnection;
  userpreferenceSet: UserPreferenceConnection;
  watchedBy: UserPreferenceConnection;
  autofixRuns?: Maybe<AutofixRunConnection>;
  transformerRuns?: Maybe<TransformerRunConnection>;
  onboardingEvents: AutoOnboardEventConnection;
  runs?: Maybe<RunConnection>;
  repositorycollaboratorSet: RepositoryCollaboratorConnection;
  silenceRules?: Maybe<SilenceRuleConnection>;
  ownerLogin?: Maybe<Scalars['String']>;
  canBeActivated?: Maybe<Scalars['Boolean']>;
  lastAnalyzedAt?: Maybe<Scalars['DateTime']>;
  blobUrlRoot?: Maybe<Scalars['String']>;
  fullName?: Maybe<Scalars['String']>;
  renderedErrorMessage?: Maybe<Scalars['String']>;
  activityModality?: Maybe<Scalars['String']>;
  issueTypeSettings?: Maybe<Array<Maybe<IssueTypeSetting>>>;
  issuePrioritySettings?: Maybe<Array<Maybe<IssuePrioritySetting>>>;
  widgetsDisplay?: Maybe<Scalars['GenericScalar']>;
  allWidgets?: Maybe<Scalars['GenericScalar']>;
  widgetsAvailable?: Maybe<Array<Maybe<Scalars['String']>>>;
  isAutofixEnabled?: Maybe<Scalars['Boolean']>;
  availableAnalyzers?: Maybe<AnalyzerConnection>;
  metricsData?: Maybe<Scalars['GenericScalar']>;
  uniqueNamespaceKeys?: Maybe<Array<Maybe<Scalars['String']>>>;
  isCommitPossible?: Maybe<Scalars['Boolean']>;
  vcsHost?: Maybe<Scalars['String']>;
  configGenerationRoute?: Maybe<Scalars['String']>;
  activeIssueCount?: Maybe<Scalars['Int']>;
  vcsDefaultBranchUrl?: Maybe<Scalars['String']>;
  issue?: Maybe<RepositoryIssue>;
  lastRun?: Maybe<Run>;
  groupedRuns?: Maybe<RunConnection>;
  autofixRun?: Maybe<AutofixRun>;
  groupedTransformerRuns?: Maybe<TransformerRunConnection>;
  transformerBranchRuns?: Maybe<TransformerRunConnection>;
  transformerRun?: Maybe<TransformerRun>;
  run?: Maybe<Run>;
  branchRuns?: Maybe<RunConnection>;
  hasViewerEditAccess?: Maybe<Scalars['Boolean']>;
  viewerPermission?: Maybe<RepositoryPermissionChoices>;
  autofixGithubAppInstallationUrl?: Maybe<Scalars['String']>;
  autofixBitbucketAddonInstallationUrl?: Maybe<Scalars['String']>;
  addableMembers?: Maybe<TeamMemberConnection>;
  dsn?: Maybe<Scalars['String']>;
  hasTestCoverage?: Maybe<Scalars['Boolean']>;
  badge: Scalars['GenericScalar'];
  logs?: Maybe<AuditLogConnection>;
  auditLogMeta?: Maybe<AuditLogMeta>;
  issueTrend?: Maybe<Scalars['GenericScalar']>;
  resolvedIssueTrend?: Maybe<Scalars['GenericScalar']>;
  autofixableIssuesPerAnalyzer?: Maybe<Array<Maybe<AnalyzerAutofixableIssues>>>;
  autofixedIssueTrend?: Maybe<Scalars['GenericScalar']>;
  autofixableIssuesMetadata?: Maybe<AutofixableIssuesMetadata>;
  userPermissionMeta?: Maybe<Scalars['GenericScalar']>;
  issueTypeDistribution?: Maybe<Array<Maybe<Scalars['GenericScalar']>>>;
  alertingMetrics?: Maybe<Scalars['GenericScalar']>;
  recommendedIssueCount?: Maybe<Scalars['Int']>;
  totalIssueCount?: Maybe<Scalars['Int']>;
  isStarred?: Maybe<Scalars['Boolean']>;
  isWatched?: Maybe<Scalars['Boolean']>;
  hasAdhocRuns?: Maybe<Scalars['Boolean']>;
  hasHacktoberfestEnabled?: Maybe<Scalars['Boolean']>;
};


export type RepositoryCollaboratorsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
};


export type RepositoryIssuesArgs = {
  all?: Maybe<Scalars['Boolean']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type RepositoryIssuePrioritiesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type RepositoryChecksArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type RepositoryUserpreferenceSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type RepositoryWatchedByArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type RepositoryAutofixRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  status_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  pullRequestStatus_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type RepositoryTransformerRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryOnboardingEventsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  owner?: Maybe<Scalars['ID']>;
};


export type RepositoryRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryRepositorycollaboratorSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
};


export type RepositorySilenceRulesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  creator?: Maybe<Scalars['ID']>;
  issueTitle?: Maybe<Scalars['String']>;
  issueCode?: Maybe<Scalars['String']>;
  filePath?: Maybe<Scalars['String']>;
  silenceLevel?: Maybe<Scalars['String']>;
};


export type RepositoryAvailableAnalyzersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  q?: Maybe<Scalars['String']>;
};


export type RepositoryMetricsDataArgs = {
  lastDays: Scalars['Int'];
};


export type RepositoryIssueArgs = {
  shortcode: Scalars['String'];
};


export type RepositoryGroupedRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryAutofixRunArgs = {
  runId: Scalars['String'];
};


export type RepositoryGroupedTransformerRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryTransformerBranchRunsArgs = {
  branchName: Scalars['String'];
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryTransformerRunArgs = {
  runId: Scalars['String'];
};


export type RepositoryRunArgs = {
  runId: Scalars['String'];
};


export type RepositoryBranchRunsArgs = {
  branchName: Scalars['String'];
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryAddableMembersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type RepositoryLogsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  actor_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  created?: Maybe<Scalars['String']>;
  createdBefore?: Maybe<Scalars['String']>;
  createdAfter?: Maybe<Scalars['String']>;
  ipAddress_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  eventName_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type RepositoryIssueTrendArgs = {
  lastDays: Scalars['Int'];
};


export type RepositoryResolvedIssueTrendArgs = {
  lastDays: Scalars['Int'];
};


export type RepositoryAutofixedIssueTrendArgs = {
  lastDays: Scalars['Int'];
};


export type RepositoryIssueTypeDistributionArgs = {
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};

export type RepositoryCollaborator = MaskPrimaryKeyNode & {
  __typename?: 'RepositoryCollaborator';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  repository: Repository;
  user: EnterpriseUser;
  permission: RepositoryCollaboratorPermission;
};

export type RepositoryCollaboratorConnection = {
  __typename?: 'RepositoryCollaboratorConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<RepositoryCollaboratorEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type RepositoryCollaboratorEdge = {
  __typename?: 'RepositoryCollaboratorEdge';
  node?: Maybe<RepositoryCollaborator>;
  cursor: Scalars['String'];
};

export enum RepositoryCollaboratorPermission {
  Read = 'READ',
  Write = 'WRITE',
  Admin = 'ADMIN'
}

export type RepositoryConnection = {
  __typename?: 'RepositoryConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<RepositoryEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type RepositoryEdge = {
  __typename?: 'RepositoryEdge';
  node?: Maybe<Repository>;
  cursor: Scalars['String'];
};

export type RepositoryIssue = MaskPrimaryKeyNode & {
  __typename?: 'RepositoryIssue';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  repositoryInstance: Repository;
  checkIssues: CheckIssueConnection;
  shouldIgnore: Scalars['Boolean'];
  severity: RepositoryIssueSeverityChoices;
  lastSeen?: Maybe<Scalars['DateTime']>;
  weight: Scalars['Int'];
  checkSet: CheckConnection;
  userSet: EnterpriseUserConnection;
  issueType?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  descriptionRendered?: Maybe<Scalars['String']>;
  occurrenceCount?: Maybe<Scalars['Int']>;
  firstSeen?: Maybe<Scalars['DateTime']>;
  analyzerName?: Maybe<Scalars['String']>;
  analyzerShortcode?: Maybe<Scalars['String']>;
  analyzerLogo?: Maybe<Scalars['String']>;
  seenIn?: Maybe<Scalars['String']>;
  pastValue?: Maybe<Scalars['Int']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
  raisedInFiles?: Maybe<Array<Maybe<Scalars['String']>>>;
  silenceRules?: Maybe<Array<Maybe<SilenceRule>>>;
  newVcsIssueUrl?: Maybe<Scalars['String']>;
  lastActivity?: Maybe<Scalars['String']>;
};


export type RepositoryIssueCheckIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type RepositoryIssueCheckSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type RepositoryIssueUserSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};

export type RepositoryIssueConnection = {
  __typename?: 'RepositoryIssueConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<RepositoryIssueEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type RepositoryIssueEdge = {
  __typename?: 'RepositoryIssueEdge';
  node?: Maybe<RepositoryIssue>;
  cursor: Scalars['String'];
};

export type RepositoryIssuePrioritySettingsInput = {
  slug?: Maybe<Scalars['String']>;
  weight?: Maybe<Scalars['Int']>;
  verboseName?: Maybe<Scalars['String']>;
  isIgnoredInCheckStatus?: Maybe<Scalars['Boolean']>;
  isIgnoredToDisplay?: Maybe<Scalars['Boolean']>;
};

export enum RepositoryIssueSeverityChoices {
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR'
}

export type RepositoryMetricValue = MaskPrimaryKeyNode & {
  __typename?: 'RepositoryMetricValue';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  value: Scalars['Decimal'];
  extraData: Scalars['JSONString'];
  commitOid: Scalars['String'];
  checkInstance: Check;
  branchName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  valueDisplay?: Maybe<Scalars['String']>;
  isPassing?: Maybe<Scalars['Boolean']>;
  namespace?: Maybe<Scalars['GenericScalar']>;
};

export enum RepositoryPermissionChoices {
  Read = 'READ',
  Write = 'WRITE',
  Admin = 'ADMIN'
}

export enum RepositoryVcsType {
  Git = 'GIT',
  Svn = 'SVN',
  Hg = 'HG'
}

export type ResetGroupInvitationLinkInput = {
  groupId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ResetGroupInvitationLinkPayload = {
  __typename?: 'ResetGroupInvitationLinkPayload';
  invitationUrl?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ResetTeamInvitationLinkInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ResetTeamInvitationLinkPayload = {
  __typename?: 'ResetTeamInvitationLinkPayload';
  invitationUrl?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RevertSubscriptionCancellationInput = {
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RevertSubscriptionCancellationPayload = {
  __typename?: 'RevertSubscriptionCancellationPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Revoke = {
  __typename?: 'Revoke';
  revoked: Scalars['Int'];
};

export type RotateAccessTokenInput = {
  tokenId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RotateAccessTokenPayload = {
  __typename?: 'RotateAccessTokenPayload';
  token?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Run = MaskPrimaryKeyNode & {
  __typename?: 'Run';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  runId: Scalars['UUID'];
  status: RunStatus;
  branchName?: Maybe<Scalars['String']>;
  baseOid?: Maybe<Scalars['String']>;
  commitOid?: Maybe<Scalars['String']>;
  finishedAt?: Maybe<Scalars['DateTime']>;
  errorMeta?: Maybe<Scalars['JSONString']>;
  config?: Maybe<Scalars['GenericScalar']>;
  extraData: Scalars['JSONString'];
  checks: CheckConnection;
  finishedIn?: Maybe<Scalars['Int']>;
  vcsCommitUrl?: Maybe<Scalars['String']>;
  gitCompareDisplay?: Maybe<Scalars['String']>;
  pullRequestNumberDisplay?: Maybe<Scalars['String']>;
  issuesRaisedCount?: Maybe<Scalars['Int']>;
  issuesResolvedNum?: Maybe<Scalars['Int']>;
  isForDefaultBranch?: Maybe<Scalars['Boolean']>;
  isForCrossRepoPr?: Maybe<Scalars['Boolean']>;
  branchRunCount?: Maybe<Scalars['Int']>;
  vcsPrUrl?: Maybe<Scalars['String']>;
  blobUrlRoot?: Maybe<Scalars['String']>;
};


export type RunChecksArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type RunConnection = {
  __typename?: 'RunConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<RunEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type RunEdge = {
  __typename?: 'RunEdge';
  node?: Maybe<Run>;
  cursor: Scalars['String'];
};

export enum RunStatus {
  Pend = 'PEND',
  Pass = 'PASS',
  Fail = 'FAIL',
  Timo = 'TIMO',
  Cncl = 'CNCL',
  Read = 'READ'
}

export type SilenceRule = MaskPrimaryKeyNode & {
  __typename?: 'SilenceRule';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  silenceLevel: SilenceRuleSilenceLevel;
  filePath?: Maybe<Scalars['String']>;
  repository: Repository;
  issue: Issue;
  creator?: Maybe<EnterpriseUser>;
  objectId: Scalars['Int'];
  metadata?: Maybe<Scalars['GenericScalar']>;
};

export type SilenceRuleConnection = {
  __typename?: 'SilenceRuleConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<SilenceRuleEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type SilenceRuleEdge = {
  __typename?: 'SilenceRuleEdge';
  node?: Maybe<SilenceRule>;
  cursor: Scalars['String'];
};

export enum SilenceRuleSilenceLevel {
  Fl = 'FL',
  Rl = 'RL'
}

export type SocialAuthJwt = {
  __typename?: 'SocialAuthJWT';
  social?: Maybe<SocialType>;
  token?: Maybe<Scalars['String']>;
  refreshToken?: Maybe<Scalars['String']>;
  tokenExpiresIn?: Maybe<Scalars['Int']>;
  refreshExpiresIn?: Maybe<Scalars['Int']>;
};

export type SocialAuthUrl = {
  __typename?: 'SocialAuthURL';
  socialUrls?: Maybe<Scalars['GenericScalar']>;
};


export type SocialNode = Node & {
  __typename?: 'SocialNode';
  id: Scalars['ID'];
  user: EnterpriseUser;
  provider: Scalars['String'];
  uid: Scalars['String'];
  extraData?: Maybe<Scalars['SocialCamelJSON']>;
  created: Scalars['DateTime'];
  modified: Scalars['DateTime'];
};

export type SocialNodeConnection = {
  __typename?: 'SocialNodeConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<SocialNodeEdge>>;
};

export type SocialNodeEdge = {
  __typename?: 'SocialNodeEdge';
  node?: Maybe<SocialNode>;
  cursor: Scalars['String'];
};

export type SocialType = {
  __typename?: 'SocialType';
  id: Scalars['ID'];
  user: EnterpriseUser;
  provider: Scalars['String'];
  uid: Scalars['String'];
  extraData?: Maybe<Scalars['SocialCamelJSON']>;
  created: Scalars['DateTime'];
  modified: Scalars['DateTime'];
};

export enum StatusOptions {
  Published = 'PUBLISHED',
  Draft = 'DRAFT',
  Planned = 'PLANNED'
}

export type SubmitSupportTicketInput = {
  fromEmail: Scalars['String'];
  ccEmails?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  body: Scalars['String'];
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SubmitSupportTicketPayload = {
  __typename?: 'SubmitSupportTicketPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SubscriptionCheckoutInput = {
  email: Scalars['String'];
  name: Scalars['String'];
  token: Scalars['String'];
  coupon: Scalars['String'];
  seats: Scalars['Int'];
  installationId: Scalars['String'];
  planSlug: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SubscriptionCheckoutPayload = {
  __typename?: 'SubscriptionCheckoutPayload';
  nextAction?: Maybe<Scalars['String']>;
  clientSecret?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SubscriptionPlanSwitchInput = {
  id?: Maybe<Scalars['ID']>;
  planSlug: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SubscriptionPlanSwitchPayload = {
  __typename?: 'SubscriptionPlanSwitchPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export enum SubscriptionStatusChoice {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Trial = 'TRIAL',
  PastDue = 'PAST_DUE',
  ScaRequired = 'SCA_REQUIRED'
}

export type SwitchToAsgardInput = {
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SwitchToAsgardPayload = {
  __typename?: 'SwitchToAsgardPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SyncRepositoriesForOwnerInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SyncRepositoriesForOwnerPayload = {
  __typename?: 'SyncRepositoriesForOwnerPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SyncVcsPermissionsInput = {
  teamId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type SyncVcsPermissionsPayload = {
  __typename?: 'SyncVcsPermissionsPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Team = MaskPrimaryKeyNode & {
  __typename?: 'Team';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  login: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  vcsProvider: OwnerVcsProvider;
  vcsAccountUid: Scalars['String'];
  plan?: Maybe<OwnerPlan>;
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
  customerId?: Maybe<Scalars['String']>;
  primaryUser?: Maybe<EnterpriseUser>;
  gsrSetupPending: Scalars['Boolean'];
  ownerPtr: Owner;
  name: Scalars['String'];
  members: EnterpriseUserConnection;
  invitationCode?: Maybe<Scalars['String']>;
  syncPermissionsWithVcs: Scalars['Boolean'];
  teammemberSet: TeamMemberConnection;
  teammemberinvitationSet: TeamMemberInvitationConnection;
  groupSet: EnterpriseGroupConnection;
  groupteammembershipSet: GroupTeamMembershipConnection;
  basePermissionSet?: Maybe<TeamBasePermissionSet>;
  billingDetails?: Maybe<Scalars['GenericScalar']>;
  numMembersTotal?: Maybe<Scalars['Int']>;
  isViewerPrimaryUser?: Maybe<Scalars['Boolean']>;
  teamMembers?: Maybe<TeamMemberConnection>;
  invites?: Maybe<TeamMemberInvitationConnection>;
  invitationUrl?: Maybe<Scalars['String']>;
  logs?: Maybe<AuditLogConnection>;
  auditLogMeta?: Maybe<AuditLogMeta>;
  accountSetupStatus?: Maybe<Scalars['GenericScalar']>;
  roleInGroup?: Maybe<TeamMemberRoleChoices>;
  isDirectMember?: Maybe<Scalars['Boolean']>;
};


export type TeamMembersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type TeamTeammemberSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type TeamTeammemberinvitationSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type TeamGroupSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type TeamGroupteammembershipSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type TeamTeamMembersArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type TeamInvitesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type TeamLogsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  actor_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  created?: Maybe<Scalars['String']>;
  createdBefore?: Maybe<Scalars['String']>;
  createdAfter?: Maybe<Scalars['String']>;
  ipAddress_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  eventName_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type TeamBasePermissionSet = MaskPrimaryKeyNode & {
  __typename?: 'TeamBasePermissionSet';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  team: Team;
  defaultRepositoryPermission?: Maybe<TeamBasePermissionSetDefaultRepositoryPermission>;
  canMembersIgnoreIssues: Scalars['Boolean'];
  canMembersModifyMetricThresholds: Scalars['Boolean'];
  canContributorsIgnoreIssues: Scalars['Boolean'];
  canContributorsModifyMetricThresholds: Scalars['Boolean'];
};

export enum TeamBasePermissionSetDefaultRepositoryPermission {
  Read = 'READ',
  Write = 'WRITE',
  Admin = 'ADMIN'
}

export type TeamConnection = {
  __typename?: 'TeamConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<TeamEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TeamEdge = {
  __typename?: 'TeamEdge';
  node?: Maybe<Team>;
  cursor: Scalars['String'];
};

export type TeamMember = MaskPrimaryKeyNode & {
  __typename?: 'TeamMember';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  role?: Maybe<TeamMemberRoleChoices>;
  team: Team;
  user: EnterpriseUser;
  isPrimaryUser?: Maybe<Scalars['Boolean']>;
};

export type TeamMemberConnection = {
  __typename?: 'TeamMemberConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<TeamMemberEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TeamMemberEdge = {
  __typename?: 'TeamMemberEdge';
  node?: Maybe<TeamMember>;
  cursor: Scalars['String'];
};

export type TeamMemberInvitation = MaskPrimaryKeyNode & {
  __typename?: 'TeamMemberInvitation';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  role?: Maybe<TeamMemberRoleChoices>;
  team: Team;
  invitationCode: Scalars['String'];
  email: Scalars['String'];
  status: TeamMemberInvitationStatus;
};

export type TeamMemberInvitationConnection = {
  __typename?: 'TeamMemberInvitationConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<TeamMemberInvitationEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TeamMemberInvitationEdge = {
  __typename?: 'TeamMemberInvitationEdge';
  node?: Maybe<TeamMemberInvitation>;
  cursor: Scalars['String'];
};

export enum TeamMemberInvitationStatus {
  Pend = 'PEND',
  Actd = 'ACTD'
}

export enum TeamMemberRoleChoices {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Contributor = 'CONTRIBUTOR'
}

export type TestWebhookInput = {
  webhookId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type TestWebhookPayload = {
  __typename?: 'TestWebhookPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ToggleRepositoryActivationInput = {
  isActivated: Scalars['Boolean'];
  id: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ToggleRepositoryActivationPayload = {
  __typename?: 'ToggleRepositoryActivationPayload';
  repository?: Maybe<Repository>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ToggleUserActiveInput = {
  userId: Scalars['ID'];
  isActive: Scalars['Boolean'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ToggleUserActivePayload = {
  __typename?: 'ToggleUserActivePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Transaction = MaskPrimaryKeyNode & {
  __typename?: 'Transaction';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  transactionType: TransactionTransactionType;
  amount: Scalars['Int'];
  user: EnterpriseUser;
  reason: TransactionReason;
  objectId?: Maybe<Scalars['Int']>;
  through?: Maybe<Scalars['String']>;
};

export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<TransactionEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TransactionEdge = {
  __typename?: 'TransactionEdge';
  node?: Maybe<Transaction>;
  cursor: Scalars['String'];
};

export enum TransactionReason {
  Refer = 'REFER',
  Signup = 'SIGNUP',
  Credit = 'CREDIT'
}

export enum TransactionTransactionType {
  Crd = 'CRD',
  Dbt = 'DBT'
}

export type TransformerReview = MaskPrimaryKeyNode & {
  __typename?: 'TransformerReview';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  transformerTool: TransformerTool;
  name: Scalars['String'];
  avatar: Scalars['String'];
  comment: Scalars['String'];
};

export type TransformerReviewConnection = {
  __typename?: 'TransformerReviewConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<TransformerReviewEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TransformerReviewEdge = {
  __typename?: 'TransformerReviewEdge';
  node?: Maybe<TransformerReview>;
  cursor: Scalars['String'];
};

export type TransformerRun = MaskPrimaryKeyNode & {
  __typename?: 'TransformerRun';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  runId: Scalars['UUID'];
  commitOid: Scalars['String'];
  baseOid?: Maybe<Scalars['String']>;
  branchName?: Maybe<Scalars['String']>;
  status: TransformerRunStatus;
  finishedAt?: Maybe<Scalars['DateTime']>;
  errors?: Maybe<Scalars['JSONString']>;
  config?: Maybe<Scalars['JSONString']>;
  pullRequestNumber?: Maybe<Scalars['Int']>;
  pullRequestStatus: TransformerRunPullRequestStatus;
  committedToBranchStatus: TransformerRunCommittedToBranchStatus;
  createdCommitOid?: Maybe<Scalars['String']>;
  extraData: Scalars['JSONString'];
  analyzer: Analyzer;
  changedFiles: Array<Scalars['String']>;
  tools?: Maybe<Scalars['GenericScalar']>;
  githubCheckRunId?: Maybe<Scalars['Int']>;
  githubCheckSuiteId?: Maybe<Scalars['Int']>;
  changedFilesCount?: Maybe<Scalars['Int']>;
  changeset?: Maybe<Scalars['GenericScalar']>;
  finishedIn?: Maybe<Scalars['Int']>;
  vcsPrUrl?: Maybe<Scalars['String']>;
  vcsCommitUrl?: Maybe<Scalars['String']>;
  pullRequestNumberDisplay?: Maybe<Scalars['String']>;
  commitOidShort?: Maybe<Scalars['String']>;
  gitCompareDisplay?: Maybe<Scalars['String']>;
  gitCompareUrl?: Maybe<Scalars['String']>;
  staleRedirectUrl?: Maybe<Scalars['String']>;
  errorsRendered?: Maybe<Scalars['GenericScalar']>;
};

export enum TransformerRunCommittedToBranchStatus {
  Ncb = 'NCB',
  Ctb = 'CTB',
  Ctf = 'CTF'
}

export type TransformerRunConnection = {
  __typename?: 'TransformerRunConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<TransformerRunEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TransformerRunEdge = {
  __typename?: 'TransformerRunEdge';
  node?: Maybe<TransformerRun>;
  cursor: Scalars['String'];
};

export enum TransformerRunPullRequestStatus {
  Pnc = 'PNC',
  Pro = 'PRO',
  Prc = 'PRC',
  Prm = 'PRM',
  Prf = 'PRF'
}

export enum TransformerRunStatus {
  Pend = 'PEND',
  Pass = 'PASS',
  Empt = 'EMPT',
  Timo = 'TIMO',
  Fail = 'FAIL',
  Stal = 'STAL'
}

export type TransformerTool = MaskPrimaryKeyNode & {
  __typename?: 'TransformerTool';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  analyzer?: Maybe<Analyzer>;
  documentationUrl?: Maybe<Scalars['String']>;
  discussUrl?: Maybe<Scalars['String']>;
  exampleConfig?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  shortcode: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  transformerRuns: TransformerRunConnection;
  reviews: TransformerReviewConnection;
  descriptionRendered?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
  publishedOn?: Maybe<Scalars['Date']>;
  updatedOn?: Maybe<Scalars['Date']>;
  owner?: Maybe<Scalars['String']>;
};


export type TransformerToolTransformerRunsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type TransformerToolReviewsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type TransformerToolConnection = {
  __typename?: 'TransformerToolConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<TransformerToolEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type TransformerToolEdge = {
  __typename?: 'TransformerToolEdge';
  node?: Maybe<TransformerTool>;
  cursor: Scalars['String'];
};

export enum TrendType {
  Yearly = 'YEARLY',
  Monthly = 'MONTHLY'
}

export type TriggerAdHocRunInput = {
  config: Scalars['String'];
  repositoryId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type TriggerAdHocRunPayload = {
  __typename?: 'TriggerAdHocRunPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type TriggerAnalysisForRepositoryInput = {
  repoId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type TriggerAnalysisForRepositoryPayload = {
  __typename?: 'TriggerAnalysisForRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type TriggerVerifyGsrsshInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type TriggerVerifyGsrsshPayload = {
  __typename?: 'TriggerVerifyGSRSSHPayload';
  status?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};


export type UnsetIssuePriorityInput = {
  issueShortcode: Scalars['String'];
  level: IssuePriorityLevel;
  objectId: Scalars['ID'];
  issuePriorityType?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UnsetIssuePriorityPayload = {
  __typename?: 'UnsetIssuePriorityPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateAccessControlSettingsInput = {
  teamId: Scalars['ID'];
  syncPermissionsWithVcs?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateAccessControlSettingsPayload = {
  __typename?: 'UpdateAccessControlSettingsPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateAccessTokenInput = {
  tokenId: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  expireInDays?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateAccessTokenPayload = {
  __typename?: 'UpdateAccessTokenPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateBillingInfoInput = {
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateBillingInfoPayload = {
  __typename?: 'UpdateBillingInfoPayload';
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateBookmarkedIssueInput = {
  repoIssueId: Scalars['ID'];
  action: ActionChoice;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateBookmarkedIssuePayload = {
  __typename?: 'UpdateBookmarkedIssuePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateCodeQualitySubscriptionSeatsInput = {
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  seats: Scalars['Int'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateCodeQualitySubscriptionSeatsPayload = {
  __typename?: 'UpdateCodeQualitySubscriptionSeatsPayload';
  ok?: Maybe<Scalars['Boolean']>;
  totalSeats?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateConfigTemplateInput = {
  shortcode: Scalars['String'];
  config?: Maybe<Scalars['JSONString']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateConfigTemplatePayload = {
  __typename?: 'UpdateConfigTemplatePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateDefaultDashboardContextForUserInput = {
  contextOwnerId: Scalars['Int'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateDefaultDashboardContextForUserPayload = {
  __typename?: 'UpdateDefaultDashboardContextForUserPayload';
  contexts?: Maybe<Scalars['GenericScalar']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateDefaultPaymentSourceInput = {
  id?: Maybe<Scalars['ID']>;
  ownerId?: Maybe<Scalars['Int']>;
  token?: Maybe<Scalars['String']>;
  action: UpdatePaymentActionChoice;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateDefaultPaymentSourcePayload = {
  __typename?: 'UpdateDefaultPaymentSourcePayload';
  card?: Maybe<Card>;
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateEnterpriseInstallationInput = {
  name?: Maybe<Scalars['String']>;
  logo?: Maybe<Attachment>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateEnterpriseInstallationPayload = {
  __typename?: 'UpdateEnterpriseInstallationPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateGroupInput = {
  groupId: Scalars['ID'];
  name: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateGroupPayload = {
  __typename?: 'UpdateGroupPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateGroupTeamRoleInput = {
  groupId: Scalars['ID'];
  teamId: Scalars['ID'];
  role?: Maybe<TeamMemberRoleChoices>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateGroupTeamRolePayload = {
  __typename?: 'UpdateGroupTeamRolePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateIssuePriorityInput = {
  issueShortcode: Scalars['String'];
  level: IssuePriorityLevel;
  objectId: Scalars['ID'];
  issuePriorityType?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateIssuePriorityPayload = {
  __typename?: 'UpdateIssuePriorityPayload';
  issue?: Maybe<Issue>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateOrCreateRepositoryCollaboratorInput = {
  userId: Scalars['ID'];
  repositoryId: Scalars['ID'];
  permission?: Maybe<RepositoryPermissionChoices>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateOrCreateRepositoryCollaboratorPayload = {
  __typename?: 'UpdateOrCreateRepositoryCollaboratorPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateOwnerSettingsInput = {
  issueTypeSettings: Array<Maybe<IssueTypeSettingInput>>;
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateOwnerSettingsPayload = {
  __typename?: 'UpdateOwnerSettingsPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export enum UpdatePaymentActionChoice {
  Update = 'UPDATE',
  Remove = 'REMOVE'
}

export type UpdateRepoMetricThresholdInput = {
  metricShortcode: Scalars['String'];
  repositoryId: Scalars['ID'];
  thresholdValue?: Maybe<Scalars['Int']>;
  key: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateRepoMetricThresholdPayload = {
  __typename?: 'UpdateRepoMetricThresholdPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateRepositorySettingsInput = {
  defaultBranchName?: Maybe<Scalars['String']>;
  isSubmoduleEnabled?: Maybe<Scalars['Boolean']>;
  showInDiscover?: Maybe<Scalars['Boolean']>;
  analyzeChangesetOnly?: Maybe<Scalars['Boolean']>;
  keepExistingIssues?: Maybe<Scalars['Boolean']>;
  issueTypeSettings?: Maybe<Array<Maybe<IssueTypeSettingInput>>>;
  issuePrioritySettings?: Maybe<Array<Maybe<RepositoryIssuePrioritySettingsInput>>>;
  id: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateRepositorySettingsPayload = {
  __typename?: 'UpdateRepositorySettingsPayload';
  repository?: Maybe<Repository>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateRepositoryWidgetsInput = {
  widgetCodes: Array<Maybe<Scalars['String']>>;
  repositoryId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateRepositoryWidgetsPayload = {
  __typename?: 'UpdateRepositoryWidgetsPayload';
  widgetCodes?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateStarredRepositoryInput = {
  repoId: Scalars['ID'];
  action: ActionChoice;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateStarredRepositoryPayload = {
  __typename?: 'UpdateStarredRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateTeamBasePermissionsInput = {
  teamId: Scalars['ID'];
  defaultRepositoryPermission?: Maybe<RepositoryPermissionChoices>;
  canMembersIgnoreIssues?: Maybe<Scalars['Boolean']>;
  canMembersModifyMetricThresholds?: Maybe<Scalars['Boolean']>;
  canContributorsIgnoreIssues?: Maybe<Scalars['Boolean']>;
  canContributorsModifyMetricThresholds?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateTeamBasePermissionsPayload = {
  __typename?: 'UpdateTeamBasePermissionsPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateTeamMemberRoleInput = {
  ownerId?: Maybe<Scalars['Int']>;
  ownerPk?: Maybe<Scalars['ID']>;
  email: Scalars['String'];
  role: TeamMemberRoleChoices;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateTeamMemberRolePayload = {
  __typename?: 'UpdateTeamMemberRolePayload';
  role?: Maybe<TeamMemberRoleChoices>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateTechnologyPreferenceInput = {
  analyzerShortcodes?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateTechnologyPreferencePayload = {
  __typename?: 'UpdateTechnologyPreferencePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateWatchedRepositoryInput = {
  repoId: Scalars['ID'];
  action: ActionChoice;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateWatchedRepositoryPayload = {
  __typename?: 'UpdateWatchedRepositoryPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateWebhookInput = {
  webhookId: Scalars['ID'];
  url?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
  apiSigning?: Maybe<Scalars['Boolean']>;
  eventsSubscribed?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateWebhookPayload = {
  __typename?: 'UpdateWebhookPayload';
  webhook?: Maybe<Webhook>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type User = MaskPrimaryKeyNode & {
  __typename?: 'User';
  id: Scalars['ID'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  isStaff: Scalars['Boolean'];
  isActive: Scalars['Boolean'];
  dateJoined: Scalars['DateTime'];
  scimId?: Maybe<Scalars['String']>;
  scimExternalId?: Maybe<Scalars['String']>;
  scimUsername?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  primaryOwner?: Maybe<Owner>;
  avatar?: Maybe<Scalars['String']>;
  preferredTechnologies: AnalyzerConnection;
  bookmarkedIssues: RepositoryIssueConnection;
  preference?: Maybe<UserPreference>;
  IsBetaTester: Scalars['Boolean'];
  socialAuth: SocialNodeConnection;
  auditlogSet: AuditLogConnection;
  primaryOwnerships: OwnerConnection;
  teams: TeamConnection;
  teamMemberships: TeamMemberConnection;
  repositorySet: RepositoryConnection;
  transactions: TransactionConnection;
  scimGroups: EnterpriseGroupConnection;
  groupusermembershipSet: GroupUserMembershipConnection;
  autofixrunSet: AutofixRunConnection;
  onboardingEvents: AutoOnboardEventConnection;
  repositorycollaboratorSet: RepositoryCollaboratorConnection;
  silenceRulesCreated: SilenceRuleConnection;
  accessTokens?: Maybe<AccessTokenConnection>;
  fullName?: Maybe<Scalars['String']>;
  availableCredits?: Maybe<Scalars['Float']>;
  referralUrl?: Maybe<Scalars['String']>;
  repositories?: Maybe<RepositoryConnection>;
  dashboardContext?: Maybe<Scalars['GenericScalar']>;
  bookmarkedIssueCount?: Maybe<Scalars['Int']>;
  recommendedIssues?: Maybe<RepositoryIssueConnection>;
  gitlabAccounts?: Maybe<Array<Maybe<Scalars['GenericScalar']>>>;
  gsrProjects?: Maybe<Array<Maybe<GsrProject>>>;
  isAsgardian?: Maybe<Scalars['Boolean']>;
  intercomUserHash?: Maybe<Scalars['String']>;
  missiveUserHash?: Maybe<Scalars['String']>;
  isBetaTester?: Maybe<Scalars['Boolean']>;
  connectedVcsProviders?: Maybe<Array<Maybe<VcsProviderChoices>>>;
};


export type UserPreferredTechnologiesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  q?: Maybe<Scalars['String']>;
};


export type UserBookmarkedIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};


export type UserSocialAuthArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  uid?: Maybe<Scalars['String']>;
  uid_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  provider?: Maybe<Scalars['String']>;
  provider_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type UserAuditlogSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  actor_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  created?: Maybe<Scalars['String']>;
  createdBefore?: Maybe<Scalars['String']>;
  createdAfter?: Maybe<Scalars['String']>;
  ipAddress_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  eventName_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type UserPrimaryOwnershipsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type UserTeamsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type UserTeamMembershipsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type UserRepositorySetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type UserTransactionsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  transactionType?: Maybe<Scalars['String']>;
};


export type UserScimGroupsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type UserGroupusermembershipSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
};


export type UserAutofixrunSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  status_In?: Maybe<Array<Maybe<Scalars['String']>>>;
  pullRequestStatus_In?: Maybe<Array<Maybe<Scalars['String']>>>;
};


export type UserOnboardingEventsArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  owner?: Maybe<Scalars['ID']>;
};


export type UserRepositorycollaboratorSetArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
};


export type UserSilenceRulesCreatedArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  creator?: Maybe<Scalars['ID']>;
  issueTitle?: Maybe<Scalars['String']>;
  issueCode?: Maybe<Scalars['String']>;
  filePath?: Maybe<Scalars['String']>;
  silenceLevel?: Maybe<Scalars['String']>;
};


export type UserAccessTokensArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type UserRepositoriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type UserRecommendedIssuesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
};

export type UserPreference = MaskPrimaryKeyNode & {
  __typename?: 'UserPreference';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  starredRepositories: RepositoryConnection;
  watchedRepositories: RepositoryConnection;
  user?: Maybe<EnterpriseUser>;
};


export type UserPreferenceStarredRepositoriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};


export type UserPreferenceWatchedRepositoriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
  errorCode?: Maybe<Scalars['Int']>;
};

export type UserPreferenceConnection = {
  __typename?: 'UserPreferenceConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<UserPreferenceEdge>>;
};

export type UserPreferenceEdge = {
  __typename?: 'UserPreferenceEdge';
  node?: Maybe<UserPreference>;
  cursor: Scalars['String'];
};

export enum VcsProviderChoices {
  Github = 'GITHUB',
  Gitlab = 'GITLAB',
  Bitbucket = 'BITBUCKET',
  GithubEnterprise = 'GITHUB_ENTERPRISE',
  Gsr = 'GSR'
}

export type Verify = {
  __typename?: 'Verify';
  payload: Scalars['GenericScalar'];
};

export type VerifyDeviceInput = {
  userCode: Scalars['String'];
  accepted: Scalars['Boolean'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type VerifyDevicePayload = {
  __typename?: 'VerifyDevicePayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type VerifyGsrPermissionsInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type VerifyGsrPermissionsPayload = {
  __typename?: 'VerifyGSRPermissionsPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type VerifyGsrSetupInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type VerifyGsrSetupPayload = {
  __typename?: 'VerifyGSRSetupPayload';
  ok: Scalars['Boolean'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type VerifyGsrWebhooksInput = {
  ownerId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type VerifyGsrWebhooksPayload = {
  __typename?: 'VerifyGSRWebhooksPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Webhook = MaskPrimaryKeyNode & {
  __typename?: 'Webhook';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  owner: Owner;
  url: Scalars['String'];
  secret: Scalars['String'];
  apiSigning: Scalars['Boolean'];
  eventsSubscribed: WebhookEventTypesConnection;
  version: Scalars['String'];
  active?: Maybe<Scalars['DateTime']>;
  deliveries: WebhookEventDeliveryConnection;
};


export type WebhookEventsSubscribedArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type WebhookDeliveriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type WebhookConnection = {
  __typename?: 'WebhookConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<WebhookEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type WebhookEdge = {
  __typename?: 'WebhookEdge';
  node?: Maybe<Webhook>;
  cursor: Scalars['String'];
};

export type WebhookEventDelivery = MaskPrimaryKeyNode & {
  __typename?: 'WebhookEventDelivery';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  deliveryId?: Maybe<Scalars['String']>;
  eventId?: Maybe<Scalars['String']>;
  httpStatusCode?: Maybe<Scalars['Int']>;
  retryCount?: Maybe<Scalars['Int']>;
  webhook: Webhook;
  eventType: WebhookEventTypes;
  payload?: Maybe<Scalars['GenericScalar']>;
  finishedIn?: Maybe<Scalars['Float']>;
};

export type WebhookEventDeliveryConnection = {
  __typename?: 'WebhookEventDeliveryConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<WebhookEventDeliveryEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type WebhookEventDeliveryEdge = {
  __typename?: 'WebhookEventDeliveryEdge';
  node?: Maybe<WebhookEventDelivery>;
  cursor: Scalars['String'];
};

export type WebhookEventTypes = MaskPrimaryKeyNode & {
  __typename?: 'WebhookEventTypes';
  id: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  shortcode: Scalars['String'];
  shortDescription: Scalars['String'];
  isPrivate: Scalars['Boolean'];
  webhooks: WebhookConnection;
  deliveries: WebhookEventDeliveryConnection;
};


export type WebhookEventTypesWebhooksArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type WebhookEventTypesDeliveriesArgs = {
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type WebhookEventTypesConnection = {
  __typename?: 'WebhookEventTypesConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<WebhookEventTypesEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type WebhookEventTypesEdge = {
  __typename?: 'WebhookEventTypesEdge';
  node?: Maybe<WebhookEventTypes>;
  cursor: Scalars['String'];
};

export type WebhookSecretInput = {
  clientMutationId?: Maybe<Scalars['String']>;
};

export type WebhookSecretPayload = {
  __typename?: 'WebhookSecretPayload';
  secret?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Unnamed_1_MutationVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_1_Mutation = (
  { __typename?: 'Mutation' }
  & { deleteRefreshTokenCookie?: Maybe<(
    { __typename?: 'DeleteRefreshTokenCookie' }
    & Pick<DeleteRefreshTokenCookie, 'deleted'>
  )> }
);

export type Unnamed_2_MutationVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_2_Mutation = (
  { __typename?: 'Mutation' }
  & { deleteTokenCookie?: Maybe<(
    { __typename?: 'DeleteJSONWebTokenCookie' }
    & Pick<DeleteJsonWebTokenCookie, 'deleted'>
  )> }
);

export type Unnamed_3_MutationVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_3_Mutation = (
  { __typename?: 'Mutation' }
  & { logout?: Maybe<(
    { __typename?: 'LogOutPayload' }
    & Pick<LogOutPayload, 'ok'>
  )> }
);

export type Unnamed_4_MutationVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_4_Mutation = (
  { __typename?: 'Mutation' }
  & { refreshToken?: Maybe<(
    { __typename?: 'RefreshToken' }
    & Pick<RefreshToken, 'token'>
  )> }
);

export type SocialAuthMutationVariables = Exact<{
  code: Scalars['String'];
  provider: Scalars['String'];
}>;


export type SocialAuthMutation = (
  { __typename?: 'Mutation' }
  & { socialAuth?: Maybe<(
    { __typename?: 'SocialAuthJWT' }
    & Pick<SocialAuthJwt, 'token' | 'tokenExpiresIn' | 'refreshToken' | 'refreshExpiresIn'>
    & { social?: Maybe<(
      { __typename?: 'SocialType' }
      & { user: (
        { __typename?: 'EnterpriseUser' }
        & Pick<EnterpriseUser, 'firstName'>
      ) }
    )> }
  )> }
);

export type Unnamed_5_MutationVariables = Exact<{
  input: CommitChangesToPrInput;
}>;


export type Unnamed_5_Mutation = (
  { __typename?: 'Mutation' }
  & { commitChangesToPr?: Maybe<(
    { __typename?: 'CommitChangesToPRPayload' }
    & Pick<CommitChangesToPrPayload, 'ok'>
  )> }
);

export type Unnamed_6_MutationVariables = Exact<{
  input: CreateAutofixRunForPullRequestInput;
}>;


export type Unnamed_6_Mutation = (
  { __typename?: 'Mutation' }
  & { createAutofixRunForPullRequest?: Maybe<(
    { __typename?: 'CreateAutofixRunForPullRequestPayload' }
    & Pick<CreateAutofixRunForPullRequestPayload, 'autofixRunId'>
  )> }
);

export type Unnamed_7_MutationVariables = Exact<{
  input: CreatePullRequestInput;
}>;


export type Unnamed_7_Mutation = (
  { __typename?: 'Mutation' }
  & { createdPullRequest?: Maybe<(
    { __typename?: 'CreatePullRequestPayload' }
    & Pick<CreatePullRequestPayload, 'ok'>
  )> }
);

export type Unnamed_8_MutationVariables = Exact<{
  input: VerifyDeviceInput;
}>;


export type Unnamed_8_Mutation = (
  { __typename?: 'Mutation' }
  & { verifyDevice?: Maybe<(
    { __typename?: 'VerifyDevicePayload' }
    & Pick<VerifyDevicePayload, 'ok'>
  )> }
);

export type Unnamed_9_MutationVariables = Exact<{
  invitationCode: Scalars['String'];
}>;


export type Unnamed_9_Mutation = (
  { __typename?: 'Mutation' }
  & { acceptGroupInvite?: Maybe<(
    { __typename?: 'AcceptGroupInvitePayload' }
    & Pick<AcceptGroupInvitePayload, 'ok'>
  )> }
);

export type Unnamed_10_MutationVariables = Exact<{
  groupId: Scalars['ID'];
  teamId: Scalars['ID'];
  role?: Maybe<TeamMemberRoleChoices>;
}>;


export type Unnamed_10_Mutation = (
  { __typename?: 'Mutation' }
  & { addTeamToGroup?: Maybe<(
    { __typename?: 'AddTeamToGroupPayload' }
    & Pick<AddTeamToGroupPayload, 'ok'>
  )> }
);

export type Unnamed_11_MutationVariables = Exact<{
  groupName: Scalars['String'];
}>;


export type Unnamed_11_Mutation = (
  { __typename?: 'Mutation' }
  & { createGroup?: Maybe<(
    { __typename?: 'CreateGroupPayload' }
    & { group?: Maybe<(
      { __typename?: 'EnterpriseGroup' }
      & Pick<EnterpriseGroup, 'id'>
    )> }
  )> }
);

export type Unnamed_12_MutationVariables = Exact<{
  groupId: Scalars['ID'];
}>;


export type Unnamed_12_Mutation = (
  { __typename?: 'Mutation' }
  & { deleteGroup?: Maybe<(
    { __typename?: 'DeleteGroupPayload' }
    & Pick<DeleteGroupPayload, 'ok'>
  )> }
);

export type Unnamed_13_MutationVariables = Exact<{
  userId: Scalars['ID'];
}>;


export type Unnamed_13_Mutation = (
  { __typename?: 'Mutation' }
  & { deleteUser?: Maybe<(
    { __typename?: 'DeleteUserPayload' }
    & Pick<DeleteUserPayload, 'ok'>
  )> }
);

export type Unnamed_14_MutationVariables = Exact<{
  groupId: Scalars['ID'];
  teamId: Scalars['ID'];
}>;


export type Unnamed_14_Mutation = (
  { __typename?: 'Mutation' }
  & { removeTeamFromGroup?: Maybe<(
    { __typename?: 'RemoveTeamFromGroupPayload' }
    & Pick<RemoveTeamFromGroupPayload, 'ok'>
  )> }
);

export type Unnamed_15_MutationVariables = Exact<{
  groupId: Scalars['ID'];
  userId: Scalars['ID'];
}>;


export type Unnamed_15_Mutation = (
  { __typename?: 'Mutation' }
  & { removeUserFromGroup?: Maybe<(
    { __typename?: 'RemoveUserFromGroupPayload' }
    & Pick<RemoveUserFromGroupPayload, 'ok'>
  )> }
);

export type Unnamed_16_MutationVariables = Exact<{
  groupId: Scalars['ID'];
}>;


export type Unnamed_16_Mutation = (
  { __typename?: 'Mutation' }
  & { resetGroupInvitationLink?: Maybe<(
    { __typename?: 'ResetGroupInvitationLinkPayload' }
    & Pick<ResetGroupInvitationLinkPayload, 'invitationUrl'>
  )> }
);

export type Unnamed_17_MutationVariables = Exact<{
  userId: Scalars['ID'];
  isActive: Scalars['Boolean'];
}>;


export type Unnamed_17_Mutation = (
  { __typename?: 'Mutation' }
  & { toggleUserActive?: Maybe<(
    { __typename?: 'ToggleUserActivePayload' }
    & Pick<ToggleUserActivePayload, 'ok'>
  )> }
);

export type Unnamed_18_MutationVariables = Exact<{
  groupId: Scalars['ID'];
  groupName: Scalars['String'];
}>;


export type Unnamed_18_Mutation = (
  { __typename?: 'Mutation' }
  & { updateGroup?: Maybe<(
    { __typename?: 'UpdateGroupPayload' }
    & Pick<UpdateGroupPayload, 'ok'>
  )> }
);

export type Unnamed_19_MutationVariables = Exact<{
  groupId: Scalars['ID'];
  teamId: Scalars['ID'];
  role?: Maybe<TeamMemberRoleChoices>;
}>;


export type Unnamed_19_Mutation = (
  { __typename?: 'Mutation' }
  & { updateGroupTeamRole?: Maybe<(
    { __typename?: 'UpdateGroupTeamRolePayload' }
    & Pick<UpdateGroupTeamRolePayload, 'ok'>
  )> }
);

export type Unnamed_20_MutationVariables = Exact<{
  input: AddAnalyzerFeedbackInput;
}>;


export type Unnamed_20_Mutation = (
  { __typename?: 'Mutation' }
  & { addAnalyzerFeedback?: Maybe<(
    { __typename?: 'AddAnalyzerFeedbackPayload' }
    & Pick<AddAnalyzerFeedbackPayload, 'ok'>
  )> }
);

export type Unnamed_21_MutationVariables = Exact<{
  input: AddTransformerFeedbackInput;
}>;


export type Unnamed_21_Mutation = (
  { __typename?: 'Mutation' }
  & { addTransformerFeedback?: Maybe<(
    { __typename?: 'AddTransformerFeedbackPayload' }
    & Pick<AddTransformerFeedbackPayload, 'ok'>
  )> }
);

export type Unnamed_22_MutationVariables = Exact<{
  input: UpdateTechnologyPreferenceInput;
}>;


export type Unnamed_22_Mutation = (
  { __typename?: 'Mutation' }
  & { updateTechnologyPreference?: Maybe<(
    { __typename?: 'UpdateTechnologyPreferencePayload' }
    & Pick<UpdateTechnologyPreferencePayload, 'ok'>
  )> }
);

export type Unnamed_23_MutationVariables = Exact<{
  repoId: Scalars['ID'];
  action: ActionChoice;
}>;


export type Unnamed_23_Mutation = (
  { __typename?: 'Mutation' }
  & { updateWatchedRepository?: Maybe<(
    { __typename?: 'UpdateWatchedRepositoryPayload' }
    & Pick<UpdateWatchedRepositoryPayload, 'ok'>
  )> }
);

export type Unnamed_24_MutationVariables = Exact<{
  input: BitbucketInstallationLandingInput;
}>;


export type Unnamed_24_Mutation = (
  { __typename?: 'Mutation' }
  & { bitbucketInstallationLanding?: Maybe<(
    { __typename?: 'BitbucketInstallationLandingPayload' }
    & Pick<BitbucketInstallationLandingPayload, 'nextAction' | 'message' | 'vcsProvider' | 'login'>
  )> }
);

export type Unnamed_25_MutationVariables = Exact<{
  input: GithubEnterpriseInstallationLandingInput;
}>;


export type Unnamed_25_Mutation = (
  { __typename?: 'Mutation' }
  & { gheInstallationLanding?: Maybe<(
    { __typename?: 'GithubEnterpriseInstallationLandingPayload' }
    & Pick<GithubEnterpriseInstallationLandingPayload, 'nextAction' | 'message' | 'vcsProvider' | 'login'>
  )> }
);

export type Unnamed_26_MutationVariables = Exact<{
  input: GithubInstallationLandingInput;
}>;


export type Unnamed_26_Mutation = (
  { __typename?: 'Mutation' }
  & { installation?: Maybe<(
    { __typename?: 'GithubInstallationLandingPayload' }
    & Pick<GithubInstallationLandingPayload, 'nextAction' | 'message' | 'vcsProvider' | 'login'>
  )> }
);

export type Unnamed_27_MutationVariables = Exact<{
  input: GitlabInstallationLandingInput;
}>;


export type Unnamed_27_Mutation = (
  { __typename?: 'Mutation' }
  & { gitlabInstallationLanding?: Maybe<(
    { __typename?: 'GitlabInstallationLandingPayload' }
    & Pick<GitlabInstallationLandingPayload, 'ok'>
  )> }
);

export type Unnamed_28_MutationVariables = Exact<{
  input: GsrInstallationLandingInput;
}>;


export type Unnamed_28_Mutation = (
  { __typename?: 'Mutation' }
  & { gsrInstallationLanding?: Maybe<(
    { __typename?: 'GSRInstallationLandingPayload' }
    & Pick<GsrInstallationLandingPayload, 'ok' | 'reauth'>
  )> }
);

export type Unnamed_29_MutationVariables = Exact<{
  invitationCode: Scalars['String'];
}>;


export type Unnamed_29_Mutation = (
  { __typename?: 'Mutation' }
  & { confirmInvitation?: Maybe<(
    { __typename?: 'ConfirmInvitationPayload' }
    & Pick<ConfirmInvitationPayload, 'ok' | 'message' | 'joined'>
  )> }
);

export type Unnamed_30_MutationVariables = Exact<{
  invitationCode: Scalars['String'];
}>;


export type Unnamed_30_Mutation = (
  { __typename?: 'Mutation' }
  & { confirmInvitation?: Maybe<(
    { __typename?: 'ConfirmInvitationPayload' }
    & Pick<ConfirmInvitationPayload, 'teamName' | 'teamLogo' | 'vcsProvider' | 'role' | 'joined'>
    & { viewer?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'firstName' | 'lastName' | 'avatar'>
    )> }
  )> }
);

export type Unnamed_31_MutationVariables = Exact<{
  input: UnsetIssuePriorityInput;
}>;


export type Unnamed_31_Mutation = (
  { __typename?: 'Mutation' }
  & { unsetIssuePriority?: Maybe<(
    { __typename?: 'UnsetIssuePriorityPayload' }
    & Pick<UnsetIssuePriorityPayload, 'ok'>
  )> }
);

export type Unnamed_32_MutationVariables = Exact<{
  input: UpdateIssuePriorityInput;
  objectId: Scalars['ID'];
  level: IssuePriorityLevel;
}>;


export type Unnamed_32_Mutation = (
  { __typename?: 'Mutation' }
  & { updateIssuePriority?: Maybe<(
    { __typename?: 'UpdateIssuePriorityPayload' }
    & { issue?: Maybe<(
      { __typename?: 'Issue' }
      & Pick<Issue, 'id' | 'issueType' | 'title' | 'shortcode' | 'description'>
      & { analyzer: (
        { __typename?: 'Analyzer' }
        & Pick<Analyzer, 'name' | 'logo'>
      ), issuePriority?: Maybe<(
        { __typename?: 'IssuePriority' }
        & Pick<IssuePriority, 'source'>
        & { repositoryIssuePriority?: Maybe<(
          { __typename?: 'IssuePriorityType' }
          & Pick<IssuePriorityType, 'slug' | 'weight' | 'verboseName'>
        )>, cascadingIssuePriority?: Maybe<(
          { __typename?: 'IssuePriorityType' }
          & Pick<IssuePriorityType, 'slug' | 'verboseName' | 'weight'>
        )> }
      )> }
    )> }
  )> }
);

export type Unnamed_33_MutationVariables = Exact<{
  input: CreateAutofixRunInput;
}>;


export type Unnamed_33_Mutation = (
  { __typename?: 'Mutation' }
  & { createAutofixRun?: Maybe<(
    { __typename?: 'CreateAutofixRunPayload' }
    & Pick<CreateAutofixRunPayload, 'runId'>
  )> }
);

export type IgnoreCheckIssueMutationVariables = Exact<{
  checkIssueId: Scalars['ID'];
  action: IgnoreCheckIssueActionChoice;
}>;


export type IgnoreCheckIssueMutation = (
  { __typename?: 'Mutation' }
  & { ignoreCheckIssue?: Maybe<(
    { __typename?: 'IgnoreCheckIssuePayload' }
    & Pick<IgnoreCheckIssuePayload, 'ok'>
  )> }
);

export type ReportFalsePositiveMutationVariables = Exact<{
  checkIssueId: Scalars['ID'];
  comment?: Maybe<Scalars['String']>;
}>;


export type ReportFalsePositiveMutation = (
  { __typename?: 'Mutation' }
  & { reportIssueFalsePositive?: Maybe<(
    { __typename?: 'ReportIssueFalsePositivePayload' }
    & Pick<ReportIssueFalsePositivePayload, 'ok'>
  )> }
);

export type Unnamed_34_MutationVariables = Exact<{
  repoIssueId?: Maybe<Scalars['ID']>;
  checkId?: Maybe<Scalars['ID']>;
  pattern: Scalars['String'];
  issueShortcode?: Maybe<Scalars['String']>;
}>;


export type Unnamed_34_Mutation = (
  { __typename?: 'Mutation' }
  & { ignoreIssueForFilePatternInRepository?: Maybe<(
    { __typename?: 'IgnoreIssueForFilePatternInRepositoryPayload' }
    & Pick<IgnoreIssueForFilePatternInRepositoryPayload, 'ok' | 'checkIssueIds'>
  )> }
);

export type Unnamed_35_MutationVariables = Exact<{
  repoIssueId?: Maybe<Scalars['ID']>;
  checkId?: Maybe<Scalars['ID']>;
  filePath?: Maybe<Scalars['String']>;
  issueShortcode?: Maybe<Scalars['String']>;
}>;


export type Unnamed_35_Mutation = (
  { __typename?: 'Mutation' }
  & { ignoreIssueForRepository?: Maybe<(
    { __typename?: 'IgnoreIssueForRepositoryPayload' }
    & Pick<IgnoreIssueForRepositoryPayload, 'ok' | 'checkIssueIds'>
  )> }
);

export type Unnamed_36_MutationVariables = Exact<{
  repoIssueId?: Maybe<Scalars['ID']>;
  checkId?: Maybe<Scalars['ID']>;
  issueShortcode?: Maybe<Scalars['String']>;
}>;


export type Unnamed_36_Mutation = (
  { __typename?: 'Mutation' }
  & { ignoreIssueForRepository?: Maybe<(
    { __typename?: 'IgnoreIssueForRepositoryPayload' }
    & Pick<IgnoreIssueForRepositoryPayload, 'ok' | 'checkIssueIds'>
  )> }
);

export type Unnamed_37_MutationVariables = Exact<{
  repoIssueId?: Maybe<Scalars['ID']>;
  checkId?: Maybe<Scalars['ID']>;
  issueShortcode?: Maybe<Scalars['String']>;
}>;


export type Unnamed_37_Mutation = (
  { __typename?: 'Mutation' }
  & { ignoreIssueForTestPatternsInRepository?: Maybe<(
    { __typename?: 'IgnoreIssueForTestPatternsInRepositoryPayload' }
    & Pick<IgnoreIssueForTestPatternsInRepositoryPayload, 'ok' | 'checkIssueIds'>
  )> }
);

export type Unnamed_38_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
  amount: Scalars['Int'];
}>;


export type Unnamed_38_Mutation = (
  { __typename?: 'Mutation' }
  & { applyCreditsToOwner?: Maybe<(
    { __typename?: 'ApplyCreditsToOwnerPayload' }
    & Pick<ApplyCreditsToOwnerPayload, 'ok' | 'availableCredits'>
  )> }
);

export type AutoOnboardMutationVariables = Exact<{
  shortcode: Scalars['String'];
  repoIds: Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>;
}>;


export type AutoOnboardMutation = (
  { __typename?: 'Mutation' }
  & { autoOnboard?: Maybe<(
    { __typename?: 'AutoOnboardPayload' }
    & Pick<AutoOnboardPayload, 'ok'>
  )> }
);

export type CreateConfigTemplateMutationVariables = Exact<{
  ownerId: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
  config: Scalars['JSONString'];
}>;


export type CreateConfigTemplateMutation = (
  { __typename?: 'Mutation' }
  & { createConfigTemplate?: Maybe<(
    { __typename?: 'CreateConfigTemplatePayload' }
    & { template?: Maybe<(
      { __typename?: 'ConfigTemplate' }
      & Pick<ConfigTemplate, 'shortcode'>
    )> }
  )> }
);

export type DeleteConfigMutationVariables = Exact<{
  shortcode: Scalars['String'];
}>;


export type DeleteConfigMutation = (
  { __typename?: 'Mutation' }
  & { deleteConfigTemplate?: Maybe<(
    { __typename?: 'DeleteConfigTemplatePayload' }
    & Pick<DeleteConfigTemplatePayload, 'ok'>
  )> }
);

export type UpdateConfigTemplateMutationVariables = Exact<{
  shortcode: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['JSONString']>;
}>;


export type UpdateConfigTemplateMutation = (
  { __typename?: 'Mutation' }
  & { updateConfigTemplate?: Maybe<(
    { __typename?: 'UpdateConfigTemplatePayload' }
    & Pick<UpdateConfigTemplatePayload, 'ok'>
  )> }
);

export type Unnamed_39_MutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type Unnamed_39_Mutation = (
  { __typename?: 'Mutation' }
  & { cancelCodeQualitySubscription?: Maybe<(
    { __typename?: 'CancelCodeQualitySubscriptionPayload' }
    & Pick<CancelCodeQualitySubscriptionPayload, 'ok'>
  )> }
);

export type Unnamed_40_MutationVariables = Exact<{
  id: Scalars['ID'];
  planSlug: Scalars['String'];
}>;


export type Unnamed_40_Mutation = (
  { __typename?: 'Mutation' }
  & { subscriptionPlanSwitch?: Maybe<(
    { __typename?: 'SubscriptionPlanSwitchPayload' }
    & Pick<SubscriptionPlanSwitchPayload, 'ok'>
  )> }
);

export type Unnamed_41_MutationVariables = Exact<{
  email: Scalars['String'];
  name: Scalars['String'];
  token: Scalars['String'];
  planSlug: Scalars['String'];
  seats: Scalars['Int'];
  coupon: Scalars['String'];
  installationId: Scalars['String'];
}>;


export type Unnamed_41_Mutation = (
  { __typename?: 'Mutation' }
  & { subscriptionCheckout?: Maybe<(
    { __typename?: 'SubscriptionCheckoutPayload' }
    & Pick<SubscriptionCheckoutPayload, 'nextAction' | 'clientSecret'>
  )> }
);

export type Unnamed_42_MutationVariables = Exact<{
  productSlug: Scalars['String'];
  planSlug: Scalars['String'];
  quantity: Scalars['Int'];
  couponCode?: Maybe<Scalars['String']>;
  ownerId: Scalars['ID'];
  isTrial: Scalars['Boolean'];
}>;


export type Unnamed_42_Mutation = (
  { __typename?: 'Mutation' }
  & { getBillingInfo?: Maybe<(
    { __typename?: 'GetBillingInfoPayload' }
    & Pick<GetBillingInfoPayload, 'amountPayableThisCycle' | 'amountPayableNextCycle' | 'nextBillingCycle' | 'netPayableThisCycle' | 'netPayableNextCycle'>
    & { discounts: (
      { __typename?: 'Discount' }
      & { credits?: Maybe<(
        { __typename?: 'CreditsInfo' }
        & Pick<CreditsInfo, 'isApplied' | 'currentCycleDiscount' | 'nextCycleDiscount'>
      )>, coupon?: Maybe<(
        { __typename?: 'CouponInfo' }
        & Pick<CouponInfo, 'isApplied' | 'currentCycleDiscount' | 'nextCycleDiscount' | 'description'>
      )> }
    ) }
  )> }
);

export type Unnamed_43_MutationVariables = Exact<{
  id: Scalars['ID'];
  planSlug: Scalars['String'];
}>;


export type Unnamed_43_Mutation = (
  { __typename?: 'Mutation' }
  & { planInfo?: Maybe<(
    { __typename?: 'GetUpgradeCodeQualitySubscriptionPlanInfoPayload' }
    & Pick<GetUpgradeCodeQualitySubscriptionPlanInfoPayload, 'endingBalance' | 'upcomingBillAmount' | 'upcomingBillDate' | 'prorationAmount' | 'proratedForDays' | 'billedImmediately' | 'quantity'>
  )> }
);

export type Unnamed_44_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
}>;


export type Unnamed_44_Mutation = (
  { __typename?: 'Mutation' }
  & { triggerVerifyGsrSsh?: Maybe<(
    { __typename?: 'TriggerVerifyGSRSSHPayload' }
    & Pick<TriggerVerifyGsrsshPayload, 'status'>
  )> }
);

export type Unnamed_45_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
}>;


export type Unnamed_45_Mutation = (
  { __typename?: 'Mutation' }
  & { verifyGsrPermissions?: Maybe<(
    { __typename?: 'VerifyGSRPermissionsPayload' }
    & Pick<VerifyGsrPermissionsPayload, 'ok'>
  )> }
);

export type Unnamed_46_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
}>;


export type Unnamed_46_Mutation = (
  { __typename?: 'Mutation' }
  & { verifyGsrSetup?: Maybe<(
    { __typename?: 'VerifyGSRSetupPayload' }
    & Pick<VerifyGsrSetupPayload, 'ok'>
  )> }
);

export type Unnamed_47_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
}>;


export type Unnamed_47_Mutation = (
  { __typename?: 'Mutation' }
  & { verifyGsrWebhooks?: Maybe<(
    { __typename?: 'VerifyGSRWebhooksPayload' }
    & Pick<VerifyGsrWebhooksPayload, 'ok'>
  )> }
);

export type Unnamed_48_MutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type Unnamed_48_Mutation = (
  { __typename?: 'Mutation' }
  & { revertSubscriptionCancellation?: Maybe<(
    { __typename?: 'RevertSubscriptionCancellationPayload' }
    & Pick<RevertSubscriptionCancellationPayload, 'ok'>
  )> }
);

export type GenerateKeyPairForOwnerMutationVariables = Exact<{
  ownerId: Scalars['ID'];
}>;


export type GenerateKeyPairForOwnerMutation = (
  { __typename?: 'Mutation' }
  & { generateKeyPairForOwner?: Maybe<(
    { __typename?: 'GenerateKeyPairForOwnerPayload' }
    & Pick<GenerateKeyPairForOwnerPayload, 'publicKey'>
  )> }
);

export type RemoveKeyPairForOwnerMutationVariables = Exact<{
  ownerId: Scalars['ID'];
}>;


export type RemoveKeyPairForOwnerMutation = (
  { __typename?: 'Mutation' }
  & { removeKeyPairForOwner?: Maybe<(
    { __typename?: 'RemoveKeyPairForOwnerPayload' }
    & Pick<RemoveKeyPairForOwnerPayload, 'ok'>
  )> }
);

export type Unnamed_49_MutationVariables = Exact<{
  input: UpdateOwnerSettingsInput;
}>;


export type Unnamed_49_Mutation = (
  { __typename?: 'Mutation' }
  & { updateOwnerSettings?: Maybe<(
    { __typename?: 'UpdateOwnerSettingsPayload' }
    & Pick<UpdateOwnerSettingsPayload, 'ok'>
  )> }
);

export type Unnamed_50_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
}>;


export type Unnamed_50_Mutation = (
  { __typename?: 'Mutation' }
  & { syncRepositoriesForOwner?: Maybe<(
    { __typename?: 'SyncRepositoriesForOwnerPayload' }
    & Pick<SyncRepositoriesForOwnerPayload, 'ok'>
  )> }
);

export type Unnamed_51_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
}>;


export type Unnamed_51_Mutation = (
  { __typename?: 'Mutation' }
  & { updateBillingInfo?: Maybe<(
    { __typename?: 'UpdateBillingInfoPayload' }
    & Pick<UpdateBillingInfoPayload, 'billingEmail' | 'billingAddress'>
  )> }
);

export type Unnamed_52_MutationVariables = Exact<{
  id: Scalars['ID'];
  token: Scalars['String'];
  action: UpdatePaymentActionChoice;
}>;


export type Unnamed_52_Mutation = (
  { __typename?: 'Mutation' }
  & { updateDefaultPaymentSource?: Maybe<(
    { __typename?: 'UpdateDefaultPaymentSourcePayload' }
    & Pick<UpdateDefaultPaymentSourcePayload, 'ok'>
  )> }
);

export type Unnamed_53_MutationVariables = Exact<{
  id: Scalars['ID'];
  seats: Scalars['Int'];
}>;


export type Unnamed_53_Mutation = (
  { __typename?: 'Mutation' }
  & { updateCodeQualitySubscriptionSeats?: Maybe<(
    { __typename?: 'UpdateCodeQualitySubscriptionSeatsPayload' }
    & Pick<UpdateCodeQualitySubscriptionSeatsPayload, 'ok' | 'totalSeats'>
  )> }
);

export type CreateWebhookMutationVariables = Exact<{
  url: Scalars['String'];
  secret: Scalars['String'];
  apiSigning: Scalars['Boolean'];
  ownerId: Scalars['ID'];
  eventsSubscribed: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
}>;


export type CreateWebhookMutation = (
  { __typename?: 'Mutation' }
  & { createWebhook?: Maybe<(
    { __typename?: 'CreateWebhookPayload' }
    & { webhook?: Maybe<(
      { __typename?: 'Webhook' }
      & Pick<Webhook, 'id'>
    )> }
  )> }
);

export type DeletewebhookMutationVariables = Exact<{
  webhookId: Scalars['ID'];
}>;


export type DeletewebhookMutation = (
  { __typename?: 'Mutation' }
  & { deleteWebhook?: Maybe<(
    { __typename?: 'DeleteWebhookPayload' }
    & Pick<DeleteWebhookPayload, 'ok'>
  )> }
);

export type DisablewebhookMutationVariables = Exact<{
  webhookId: Scalars['ID'];
}>;


export type DisablewebhookMutation = (
  { __typename?: 'Mutation' }
  & { disableWebhook?: Maybe<(
    { __typename?: 'DisableWebhookPayload' }
    & Pick<DisableWebhookPayload, 'ok'>
  )> }
);

export type WebhookSecretMutationVariables = Exact<{
  input: WebhookSecretInput;
}>;


export type WebhookSecretMutation = (
  { __typename?: 'Mutation' }
  & { webhookSecret?: Maybe<(
    { __typename?: 'WebhookSecretPayload' }
    & Pick<WebhookSecretPayload, 'secret'>
  )> }
);

export type TestWebhookMutationVariables = Exact<{
  webhookId: Scalars['ID'];
}>;


export type TestWebhookMutation = (
  { __typename?: 'Mutation' }
  & { testWebhook?: Maybe<(
    { __typename?: 'TestWebhookPayload' }
    & Pick<TestWebhookPayload, 'ok'>
  )> }
);

export type UpdateWebhookMutationVariables = Exact<{
  webhookId: Scalars['ID'];
  url?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
  apiSigning?: Maybe<Scalars['Boolean']>;
  eventsSubscribed?: Maybe<Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>>;
}>;


export type UpdateWebhookMutation = (
  { __typename?: 'Mutation' }
  & { updateWebhook?: Maybe<(
    { __typename?: 'UpdateWebhookPayload' }
    & { webhook?: Maybe<(
      { __typename?: 'Webhook' }
      & Pick<Webhook, 'id'>
    )> }
  )> }
);

export type Unnamed_54_MutationVariables = Exact<{
  description: Scalars['String'];
  expiryDays?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_54_Mutation = (
  { __typename?: 'Mutation' }
  & { createAccessToken?: Maybe<(
    { __typename?: 'CreateAccessTokenPayload' }
    & Pick<CreateAccessTokenPayload, 'token'>
    & { accessToken?: Maybe<(
      { __typename?: 'AccessToken' }
      & Pick<AccessToken, 'id' | 'description' | 'expirationStatus' | 'expiresAt' | 'lastUsedAt'>
    )> }
  )> }
);

export type Unnamed_55_MutationVariables = Exact<{
  tokenId: Scalars['ID'];
}>;


export type Unnamed_55_Mutation = (
  { __typename?: 'Mutation' }
  & { deleteAccessToken?: Maybe<(
    { __typename?: 'DeleteAccessTokenPayload' }
    & Pick<DeleteAccessTokenPayload, 'ok'>
  )> }
);

export type Unnamed_56_MutationVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_56_Mutation = (
  { __typename?: 'Mutation' }
  & { deleteAllAccessTokens?: Maybe<(
    { __typename?: 'DeleteAllAccessTokensPayload' }
    & Pick<DeleteAllAccessTokensPayload, 'ok'>
  )> }
);

export type Unnamed_57_MutationVariables = Exact<{
  input: CommitConfigToVcsInput;
}>;


export type Unnamed_57_Mutation = (
  { __typename?: 'Mutation' }
  & { commitConfigToVcs?: Maybe<(
    { __typename?: 'CommitConfigToVCSPayload' }
    & Pick<CommitConfigToVcsPayload, 'ok'>
  )> }
);

export type Unnamed_58_MutationVariables = Exact<{
  silenceRuleId: Scalars['ID'];
}>;


export type Unnamed_58_Mutation = (
  { __typename?: 'Mutation' }
  & { deleteSilenceRule?: Maybe<(
    { __typename?: 'DeleteSilenceRulePayload' }
    & Pick<DeleteSilenceRulePayload, 'ok'>
  )> }
);

export type DeleteSshKeyMutationVariables = Exact<{
  repositoryId: Scalars['ID'];
}>;


export type DeleteSshKeyMutation = (
  { __typename?: 'Mutation' }
  & { removeKeyPairForRepository?: Maybe<(
    { __typename?: 'RemoveKeyPairForRepositoryPayload' }
    & Pick<RemoveKeyPairForRepositoryPayload, 'ok'>
  )> }
);

export type Unnamed_59_MutationVariables = Exact<{
  repositoryId: Scalars['ID'];
}>;


export type Unnamed_59_Mutation = (
  { __typename?: 'Mutation' }
  & { generateKeyPairForRepository?: Maybe<(
    { __typename?: 'GenerateKeyPairForRepositoryPayload' }
    & { repository?: Maybe<(
      { __typename?: 'Repository' }
      & Pick<Repository, 'encPublicKey'>
    )> }
  )> }
);

export type Unnamed_60_MutationVariables = Exact<{
  input: RemoveRepositoryCollaboratorInput;
}>;


export type Unnamed_60_Mutation = (
  { __typename?: 'Mutation' }
  & { removeRepositoryCollaborator?: Maybe<(
    { __typename?: 'RemoveRepositoryCollaboratorPayload' }
    & Pick<RemoveRepositoryCollaboratorPayload, 'ok'>
  )> }
);

export type Unnamed_61_MutationVariables = Exact<{
  input: UpdateOrCreateRepositoryCollaboratorInput;
}>;


export type Unnamed_61_Mutation = (
  { __typename?: 'Mutation' }
  & { updateOrCreateRepositoryCollaborator?: Maybe<(
    { __typename?: 'UpdateOrCreateRepositoryCollaboratorPayload' }
    & Pick<UpdateOrCreateRepositoryCollaboratorPayload, 'ok'>
  )> }
);

export type Unnamed_62_MutationVariables = Exact<{
  input: UpdateRepositorySettingsInput;
}>;


export type Unnamed_62_Mutation = (
  { __typename?: 'Mutation' }
  & { updateRepositorySettings?: Maybe<(
    { __typename?: 'UpdateRepositorySettingsPayload' }
    & { repository?: Maybe<(
      { __typename?: 'Repository' }
      & Pick<Repository, 'id' | 'showInDiscover' | 'analyzeChangesetOnly' | 'defaultBranchName' | 'isSubmoduleEnabled' | 'config' | 'isActivated'>
    )> }
  )> }
);

export type Unnamed_63_MutationVariables = Exact<{
  input: ToggleRepositoryActivationInput;
}>;


export type Unnamed_63_Mutation = (
  { __typename?: 'Mutation' }
  & { toggleRepositoryActivation?: Maybe<(
    { __typename?: 'ToggleRepositoryActivationPayload' }
    & { repository?: Maybe<(
      { __typename?: 'Repository' }
      & Pick<Repository, 'isActivated'>
    )> }
  )> }
);

export type Unnamed_64_MutationVariables = Exact<{
  input: TriggerAdHocRunInput;
}>;


export type Unnamed_64_Mutation = (
  { __typename?: 'Mutation' }
  & { triggerAdhocRun?: Maybe<(
    { __typename?: 'TriggerAdHocRunPayload' }
    & Pick<TriggerAdHocRunPayload, 'ok'>
  )> }
);

export type Unnamed_65_MutationVariables = Exact<{
  input: ActivateGsrRepositoryInput;
}>;


export type Unnamed_65_Mutation = (
  { __typename?: 'Mutation' }
  & { activateGsrRepository?: Maybe<(
    { __typename?: 'ActivateGSRRepositoryPayload' }
    & Pick<ActivateGsrRepositoryPayload, 'ok'>
  )> }
);

export type Unnamed_66_MutationVariables = Exact<{
  input: UpdateRepoMetricThresholdInput;
}>;


export type Unnamed_66_Mutation = (
  { __typename?: 'Mutation' }
  & { updateRepoMetricThreshold?: Maybe<(
    { __typename?: 'UpdateRepoMetricThresholdPayload' }
    & Pick<UpdateRepoMetricThresholdPayload, 'ok'>
  )> }
);

export type Unnamed_67_MutationVariables = Exact<{
  input: UpdateRepositoryWidgetsInput;
}>;


export type Unnamed_67_Mutation = (
  { __typename?: 'Mutation' }
  & { updateRepositoryWidgets?: Maybe<(
    { __typename?: 'UpdateRepositoryWidgetsPayload' }
    & Pick<UpdateRepositoryWidgetsPayload, 'widgetCodes'>
  )> }
);

export type Unnamed_68_MutationVariables = Exact<{
  input: SubmitSupportTicketInput;
}>;


export type Unnamed_68_Mutation = (
  { __typename?: 'Mutation' }
  & { submitSupportTicket?: Maybe<(
    { __typename?: 'SubmitSupportTicketPayload' }
    & Pick<SubmitSupportTicketPayload, 'ok'>
  )> }
);

export type Unnamed_69_MutationVariables = Exact<{
  input: InviteTeamMembersInput;
}>;


export type Unnamed_69_Mutation = (
  { __typename?: 'Mutation' }
  & { inviteTeamMembers?: Maybe<(
    { __typename?: 'InviteTeamMembersPayload' }
    & Pick<InviteTeamMembersPayload, 'ok'>
  )> }
);

export type Unnamed_70_MutationVariables = Exact<{
  ownerId: Scalars['ID'];
  email: Scalars['String'];
  action: InviteTeamMemberActionChoice;
  role: TeamMemberRoleChoices;
}>;


export type Unnamed_70_Mutation = (
  { __typename?: 'Mutation' }
  & { inviteTeamMember?: Maybe<(
    { __typename?: 'InviteTeamMemberPayload' }
    & Pick<InviteTeamMemberPayload, 'invitationUrl'>
  )> }
);

export type Unnamed_71_MutationVariables = Exact<{
  ownerPk: Scalars['ID'];
  email: Scalars['String'];
}>;


export type Unnamed_71_Mutation = (
  { __typename?: 'Mutation' }
  & { removeTeamMember?: Maybe<(
    { __typename?: 'RemoveTeamMemberPayload' }
    & Pick<RemoveTeamMemberPayload, 'ok'>
  )> }
);

export type Unnamed_72_MutationVariables = Exact<{
  input: ResetTeamInvitationLinkInput;
}>;


export type Unnamed_72_Mutation = (
  { __typename?: 'Mutation' }
  & { resetInvitationLink?: Maybe<(
    { __typename?: 'ResetTeamInvitationLinkPayload' }
    & Pick<ResetTeamInvitationLinkPayload, 'invitationUrl'>
  )> }
);

export type Unnamed_73_MutationVariables = Exact<{
  teamId: Scalars['ID'];
}>;


export type Unnamed_73_Mutation = (
  { __typename?: 'Mutation' }
  & { syncVcsPermissions?: Maybe<(
    { __typename?: 'SyncVcsPermissionsPayload' }
    & Pick<SyncVcsPermissionsPayload, 'ok'>
  )> }
);

export type Unnamed_74_MutationVariables = Exact<{
  teamId: Scalars['ID'];
  syncPermissionsWithVcs?: Maybe<Scalars['Boolean']>;
}>;


export type Unnamed_74_Mutation = (
  { __typename?: 'Mutation' }
  & { updateAccessControlSettings?: Maybe<(
    { __typename?: 'UpdateAccessControlSettingsPayload' }
    & Pick<UpdateAccessControlSettingsPayload, 'ok'>
  )> }
);

export type Unnamed_75_MutationVariables = Exact<{
  ownerPk: Scalars['ID'];
  email: Scalars['String'];
  role: TeamMemberRoleChoices;
}>;


export type Unnamed_75_Mutation = (
  { __typename?: 'Mutation' }
  & { updateTeamMemberRole?: Maybe<(
    { __typename?: 'UpdateTeamMemberRolePayload' }
    & Pick<UpdateTeamMemberRolePayload, 'role'>
  )> }
);

export type Unnamed_76_MutationVariables = Exact<{
  teamId: Scalars['ID'];
  defaultRepositoryPermission?: Maybe<RepositoryPermissionChoices>;
  canMembersIgnoreIssues?: Maybe<Scalars['Boolean']>;
  canContributorsIgnoreIssues?: Maybe<Scalars['Boolean']>;
  canMembersModifyMetricThresholds?: Maybe<Scalars['Boolean']>;
  canContributorsModifyMetricThresholds?: Maybe<Scalars['Boolean']>;
}>;


export type Unnamed_76_Mutation = (
  { __typename?: 'Mutation' }
  & { updateTeamBasePermissions?: Maybe<(
    { __typename?: 'UpdateTeamBasePermissionsPayload' }
    & Pick<UpdateTeamBasePermissionsPayload, 'ok'>
  )> }
);

export type Unnamed_77_MutationVariables = Exact<{
  contextOwnerId: Scalars['Int'];
}>;


export type Unnamed_77_Mutation = (
  { __typename?: 'Mutation' }
  & { updateDefaultDashboardContextForUser?: Maybe<(
    { __typename?: 'UpdateDefaultDashboardContextForUserPayload' }
    & Pick<UpdateDefaultDashboardContextForUserPayload, 'contexts'>
  )> }
);

export type Unnamed_78_MutationVariables = Exact<{
  repoId: Scalars['ID'];
  action: ActionChoice;
}>;


export type Unnamed_78_Mutation = (
  { __typename?: 'Mutation' }
  & { updateStarredRepository?: Maybe<(
    { __typename?: 'UpdateStarredRepositoryPayload' }
    & Pick<UpdateStarredRepositoryPayload, 'ok'>
  )> }
);

export type Unnamed_79_QueryVariables = Exact<{
  shortcode: Scalars['String'];
}>;


export type Unnamed_79_Query = (
  { __typename?: 'Query' }
  & { analyzer?: Maybe<(
    { __typename?: 'Analyzer' }
    & Pick<Analyzer, 'id' | 'name'>
  )> }
);

export type Unnamed_80_QueryVariables = Exact<{
  shortcode: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_80_Query = (
  { __typename?: 'Query' }
  & { analyzer?: Maybe<(
    { __typename?: 'Analyzer' }
    & Pick<Analyzer, 'id' | 'name' | 'analyzerLogo' | 'description' | 'issueTypeDistribution' | 'category' | 'version' | 'updatedOn' | 'exampleConfig' | 'issuesCount' | 'autofixableIssuesCount' | 'documentationUrl' | 'discussUrl'>
    & { starIssues: (
      { __typename?: 'IssueConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'IssueEdge' }
        & { node?: Maybe<(
          { __typename?: 'Issue' }
          & Pick<Issue, 'title' | 'shortcode' | 'issueType' | 'shortDescriptionRendered' | 'autofixAvailable'>
        )> }
      )>> }
    ) }
  )> }
);

export type Unnamed_81_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_81_Query = (
  { __typename?: 'Query' }
  & { analyzers?: Maybe<(
    { __typename?: 'AnalyzerConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'AnalyzerEdge' }
      & { node?: Maybe<(
        { __typename?: 'Analyzer' }
        & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'logo' | 'analyzerLogo' | 'metaSchema'>
        & { transformertoolSet: (
          { __typename?: 'TransformerToolConnection' }
          & { edges: Array<Maybe<(
            { __typename?: 'TransformerToolEdge' }
            & { node?: Maybe<(
              { __typename?: 'TransformerTool' }
              & Pick<TransformerTool, 'id' | 'name' | 'shortcode' | 'logo' | 'description'>
            )> }
          )>> }
        ) }
      )> }
    )>> }
  )> }
);

export type Unnamed_82_QueryVariables = Exact<{
  shortcode: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
  q?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
}>;


export type Unnamed_82_Query = (
  { __typename?: 'Query' }
  & { analyzer?: Maybe<(
    { __typename?: 'Analyzer' }
    & Pick<Analyzer, 'id' | 'name' | 'owner' | 'analyzerLogo' | 'issueTypeDistribution' | 'issuesCount' | 'documentationUrl' | 'discussUrl'>
    & { issues: (
      { __typename?: 'IssueConnection' }
      & Pick<IssueConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'IssueEdge' }
        & { node?: Maybe<(
          { __typename?: 'Issue' }
          & Pick<Issue, 'title' | 'shortcode' | 'issueType' | 'shortDescriptionRendered' | 'autofixAvailable' | 'severity'>
        )> }
      )>> }
    ) }
  )> }
);

export type Unnamed_83_QueryVariables = Exact<{
  q?: Maybe<Scalars['String']>;
}>;


export type Unnamed_83_Query = (
  { __typename?: 'Query' }
  & { analyzers?: Maybe<(
    { __typename?: 'AnalyzerConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'AnalyzerEdge' }
      & { node?: Maybe<(
        { __typename?: 'Analyzer' }
        & Pick<Analyzer, 'id' | 'shortcode' | 'name' | 'owner' | 'descriptionRendered' | 'issuesCount' | 'autofixableIssuesCount' | 'updatedOn' | 'version' | 'category' | 'analyzerLogo' | 'publishedOn' | 'createdAt'>
      )> }
    )>> }
  )> }
);

export type Unnamed_84_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_84_Query = (
  { __typename?: 'Query' }
  & { oauth?: Maybe<(
    { __typename?: 'SocialAuthURL' }
    & Pick<SocialAuthUrl, 'socialUrls'>
  )> }
);

export type Unnamed_85_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_85_Query = (
  { __typename?: 'Query' }
  & { changelog?: Maybe<(
    { __typename?: 'Changelog' }
    & { logEntries?: Maybe<Array<Maybe<(
      { __typename?: 'ChangelogItem' }
      & Pick<ChangelogItem, 'id' | 'title' | 'created' | 'publishedAt' | 'status' | 'url'>
      & { labels?: Maybe<Array<Maybe<(
        { __typename?: 'ChangelogItemLabel' }
        & Pick<ChangelogItemLabel, 'id' | 'name'>
      )>>> }
    )>>> }
  )> }
);

export type Unnamed_86_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_86_Query = (
  { __typename?: 'Query' }
  & { context?: Maybe<(
    { __typename?: 'Context' }
    & Pick<Context, 'staticRoot' | 'apiRoot' | 'websocketUrl' | 'installationProvidersUrl' | 'installationUrls' | 'stripePublishableKey' | 'appEnv' | 'emptyAvatarUrl' | 'debug' | 'sentryDsn' | 'userGroupUrl' | 'onPrem' | 'deepsourceCloudProduction' | 'githubEnabled' | 'gitlabEnabled' | 'bitbucketEnabled' | 'supportEmail' | 'isTransformersLicensed' | 'toOnboard' | 'plans'>
  )> }
);

export type Unnamed_87_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_87_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & Pick<EnterpriseInstallationRoot, 'managementConsoleUrl'>
    & { installation?: Maybe<(
      { __typename?: 'EnterpriseInstallationSetup' }
      & Pick<EnterpriseInstallationSetup, 'name' | 'logo'>
    )> }
  )> }
);

export type Unnamed_88_QueryVariables = Exact<{
  lastDays: Scalars['Int'];
  trendType: TrendType;
}>;


export type Unnamed_88_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { license?: Maybe<(
      { __typename?: 'License' }
      & Pick<License, 'seatsTotal' | 'seatsUsed' | 'licenseExpiry' | 'seatUsageTrend'>
    )> }
  )> }
);

export type Unnamed_89_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_89_Query = (
  { __typename?: 'Query' }
  & Pick<Query, 'isViewerSuperadmin'>
);

export type Unnamed_90_QueryVariables = Exact<{
  groupId: Scalars['ID'];
  q?: Maybe<Scalars['String']>;
}>;


export type Unnamed_90_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { group?: Maybe<(
      { __typename?: 'EnterpriseGroup' }
      & Pick<EnterpriseGroup, 'id'>
      & { allTeams?: Maybe<(
        { __typename?: 'TeamConnection' }
        & { edges: Array<Maybe<(
          { __typename?: 'TeamEdge' }
          & { node?: Maybe<(
            { __typename?: 'Team' }
            & Pick<Team, 'id' | 'login' | 'name' | 'avatar' | 'roleInGroup'>
            & { teamMembers?: Maybe<(
              { __typename?: 'TeamMemberConnection' }
              & Pick<TeamMemberConnection, 'totalCount'>
            )> }
          )> }
        )>> }
      )> }
    )> }
  )> }
);

export type Unnamed_91_QueryVariables = Exact<{
  invitationCode: Scalars['String'];
}>;


export type Unnamed_91_Query = (
  { __typename?: 'Query' }
  & { getGroupInviteInfo?: Maybe<(
    { __typename?: 'GroupInviteInfo' }
    & Pick<GroupInviteInfo, 'name'>
  )> }
);

export type Unnamed_92_QueryVariables = Exact<{
  id: Scalars['ID'];
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_92_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { group?: Maybe<(
      { __typename?: 'EnterpriseGroup' }
      & Pick<EnterpriseGroup, 'id' | 'name' | 'createdAt' | 'scimEnabled'>
      & { membersCount: (
        { __typename?: 'EnterpriseUserConnection' }
        & Pick<EnterpriseUserConnection, 'totalCount'>
      ), teamsCount?: Maybe<(
        { __typename?: 'GroupTeamMembershipConnection' }
        & Pick<GroupTeamMembershipConnection, 'totalCount'>
      )>, groupTeams?: Maybe<(
        { __typename?: 'GroupTeamMembershipConnection' }
        & Pick<GroupTeamMembershipConnection, 'totalCount'>
        & { edges: Array<Maybe<(
          { __typename?: 'GroupTeamMembershipEdge' }
          & { node?: Maybe<(
            { __typename?: 'GroupTeamMembership' }
            & Pick<GroupTeamMembership, 'id' | 'role' | 'createdAt' | 'modifiedAt'>
            & { team: (
              { __typename?: 'Team' }
              & Pick<Team, 'id' | 'name' | 'avatar' | 'login' | 'vcsProvider'>
              & { members: (
                { __typename?: 'EnterpriseUserConnection' }
                & Pick<EnterpriseUserConnection, 'totalCount'>
              ) }
            ) }
          )> }
        )>> }
      )> }
    )> }
  )> }
);

export type Unnamed_93_QueryVariables = Exact<{
  id: Scalars['ID'];
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_93_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { group?: Maybe<(
      { __typename?: 'EnterpriseGroup' }
      & Pick<EnterpriseGroup, 'id' | 'name' | 'createdAt' | 'scimEnabled'>
      & { membersCount: (
        { __typename?: 'EnterpriseUserConnection' }
        & Pick<EnterpriseUserConnection, 'totalCount'>
      ), members: (
        { __typename?: 'EnterpriseUserConnection' }
        & Pick<EnterpriseUserConnection, 'totalCount'>
        & { edges: Array<Maybe<(
          { __typename?: 'EnterpriseUserEdge' }
          & { node?: Maybe<(
            { __typename?: 'EnterpriseUser' }
            & Pick<EnterpriseUser, 'id' | 'avatar' | 'fullName' | 'email' | 'isActive' | 'isSuperuser' | 'scimEnabled'>
            & { groupsCount: (
              { __typename?: 'EnterpriseGroupConnection' }
              & Pick<EnterpriseGroupConnection, 'totalCount'>
            ) }
          )> }
        )>> }
      ), teamsCount?: Maybe<(
        { __typename?: 'GroupTeamMembershipConnection' }
        & Pick<GroupTeamMembershipConnection, 'totalCount'>
      )> }
    )> }
  )> }
);

export type Unnamed_94_QueryVariables = Exact<{
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_94_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & Pick<EnterpriseInstallationRoot, 'isScimEnabled'>
    & { groups?: Maybe<(
      { __typename?: 'EnterpriseGroupConnection' }
      & Pick<EnterpriseGroupConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'EnterpriseGroupEdge' }
        & { node?: Maybe<(
          { __typename?: 'EnterpriseGroup' }
          & Pick<EnterpriseGroup, 'id' | 'name' | 'createdAt' | 'scimEnabled'>
          & { members: (
            { __typename?: 'EnterpriseUserConnection' }
            & Pick<EnterpriseUserConnection, 'totalCount'>
          ), teams: (
            { __typename?: 'TeamConnection' }
            & Pick<TeamConnection, 'totalCount'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_95_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_95_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { groups?: Maybe<(
      { __typename?: 'EnterpriseGroupConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'EnterpriseGroupEdge' }
        & { node?: Maybe<(
          { __typename?: 'EnterpriseGroup' }
          & Pick<EnterpriseGroup, 'name' | 'id' | 'invitationUrl'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_96_QueryVariables = Exact<{
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_96_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { teams?: Maybe<(
      { __typename?: 'TeamConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'TeamEdge' }
        & { node?: Maybe<(
          { __typename?: 'Team' }
          & Pick<Team, 'id' | 'name' | 'login'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_97_QueryVariables = Exact<{
  id: Scalars['ID'];
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_97_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { user?: Maybe<(
      { __typename?: 'EnterpriseUser' }
      & Pick<EnterpriseUser, 'id' | 'fullName' | 'avatar' | 'email' | 'dateJoined' | 'isActive' | 'isSuperuser' | 'scimEnabled'>
      & { groupsCount: (
        { __typename?: 'EnterpriseGroupConnection' }
        & Pick<EnterpriseGroupConnection, 'totalCount'>
      ), scimGroups: (
        { __typename?: 'EnterpriseGroupConnection' }
        & Pick<EnterpriseGroupConnection, 'totalCount'>
        & { edges: Array<Maybe<(
          { __typename?: 'EnterpriseGroupEdge' }
          & { node?: Maybe<(
            { __typename?: 'EnterpriseGroup' }
            & Pick<EnterpriseGroup, 'id' | 'name' | 'scimEnabled'>
            & { members: (
              { __typename?: 'EnterpriseUserConnection' }
              & Pick<EnterpriseUserConnection, 'totalCount'>
            ), teams: (
              { __typename?: 'TeamConnection' }
              & Pick<TeamConnection, 'totalCount'>
            ) }
          )> }
        )>> }
      ) }
    )> }
  )> }
);

export type Unnamed_98_QueryVariables = Exact<{
  id: Scalars['ID'];
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_98_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { user?: Maybe<(
      { __typename?: 'EnterpriseUser' }
      & Pick<EnterpriseUser, 'id' | 'fullName' | 'avatar' | 'email' | 'dateJoined' | 'isActive' | 'isSuperuser' | 'scimEnabled'>
      & { groupsCount: (
        { __typename?: 'EnterpriseGroupConnection' }
        & Pick<EnterpriseGroupConnection, 'totalCount'>
      ), teams: (
        { __typename?: 'TeamConnection' }
        & Pick<TeamConnection, 'totalCount'>
        & { edges: Array<Maybe<(
          { __typename?: 'TeamEdge' }
          & { node?: Maybe<(
            { __typename?: 'Team' }
            & Pick<Team, 'id' | 'name' | 'login' | 'avatar' | 'vcsProvider' | 'isDirectMember'>
            & { members: (
              { __typename?: 'EnterpriseUserConnection' }
              & Pick<EnterpriseUserConnection, 'totalCount'>
            ) }
          )> }
        )>> }
      ) }
    )> }
  )> }
);

export type Unnamed_99_QueryVariables = Exact<{
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;


export type Unnamed_99_Query = (
  { __typename?: 'Query' }
  & { enterprise?: Maybe<(
    { __typename?: 'EnterpriseInstallationRoot' }
    & { users?: Maybe<(
      { __typename?: 'EnterpriseUserConnection' }
      & Pick<EnterpriseUserConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'EnterpriseUserEdge' }
        & { node?: Maybe<(
          { __typename?: 'EnterpriseUser' }
          & Pick<EnterpriseUser, 'id' | 'avatar' | 'fullName' | 'email' | 'isActive' | 'isSuperuser' | 'scimEnabled'>
          & { teams: (
            { __typename?: 'TeamConnection' }
            & { edges: Array<Maybe<(
              { __typename?: 'TeamEdge' }
              & { node?: Maybe<(
                { __typename?: 'Team' }
                & Pick<Team, 'name'>
              )> }
            )>> }
          ), groupsCount: (
            { __typename?: 'EnterpriseGroupConnection' }
            & Pick<EnterpriseGroupConnection, 'totalCount'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_100_QueryVariables = Exact<{
  preferredTechnologies?: Maybe<Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>>;
  q?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_100_Query = (
  { __typename?: 'Query' }
  & { discoverRepositories?: Maybe<(
    { __typename?: 'RepositoryConnection' }
    & Pick<RepositoryConnection, 'totalCount'>
    & { edges: Array<Maybe<(
      { __typename?: 'RepositoryEdge' }
      & { node?: Maybe<(
        { __typename?: 'Repository' }
        & Pick<Repository, 'id' | 'modifiedAt' | 'name' | 'description' | 'vcsProvider' | 'hasHacktoberfestEnabled' | 'recommendedIssueCount' | 'isWatched'>
        & { owner: (
          { __typename?: 'Owner' }
          & Pick<Owner, 'login'>
        ), primaryAnalyzer?: Maybe<(
          { __typename?: 'Analyzer' }
          & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'analyzerLogo'>
        )> }
      )> }
    )>> }
  )> }
);

export type Unnamed_101_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_101_Query = (
  { __typename?: 'Query' }
  & { editorsPickRepository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'description' | 'recommendedIssueCount' | 'hasHacktoberfestEnabled' | 'isWatched'>
    & { owner: (
      { __typename?: 'Owner' }
      & Pick<Owner, 'login'>
    ), primaryAnalyzer?: Maybe<(
      { __typename?: 'Analyzer' }
      & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'analyzerLogo'>
    )> }
  )> }
);

export type Unnamed_102_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_102_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { preferredTechnologies: (
      { __typename?: 'AnalyzerConnection' }
      & Pick<AnalyzerConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'AnalyzerEdge' }
        & { node?: Maybe<(
          { __typename?: 'Analyzer' }
          & Pick<Analyzer, 'id' | 'shortcode' | 'analyzerLogo'>
        )> }
      )>> }
    ) }
  )> }
);

export type Unnamed_103_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_103_Query = (
  { __typename?: 'Query' }
  & { trendingRepositories?: Maybe<(
    { __typename?: 'RepositoryConnection' }
    & Pick<RepositoryConnection, 'totalCount'>
    & { edges: Array<Maybe<(
      { __typename?: 'RepositoryEdge' }
      & { node?: Maybe<(
        { __typename?: 'Repository' }
        & Pick<Repository, 'id' | 'name' | 'description' | 'vcsProvider' | 'recommendedIssueCount' | 'hasHacktoberfestEnabled' | 'isWatched'>
        & { owner: (
          { __typename?: 'Owner' }
          & Pick<Owner, 'login'>
        ), primaryAnalyzer?: Maybe<(
          { __typename?: 'Analyzer' }
          & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'analyzerLogo'>
        )> }
      )> }
    )>> }
  )> }
);

export type Unnamed_104_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_104_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { preference?: Maybe<(
      { __typename?: 'UserPreference' }
      & { watchedRepositories: (
        { __typename?: 'RepositoryConnection' }
        & Pick<RepositoryConnection, 'totalCount'>
        & { edges: Array<Maybe<(
          { __typename?: 'RepositoryEdge' }
          & { node?: Maybe<(
            { __typename?: 'Repository' }
            & Pick<Repository, 'id' | 'modifiedAt' | 'name' | 'description' | 'vcsProvider' | 'recommendedIssueCount' | 'hasHacktoberfestEnabled' | 'isWatched'>
            & { owner: (
              { __typename?: 'Owner' }
              & Pick<Owner, 'login'>
            ), primaryAnalyzer?: Maybe<(
              { __typename?: 'Analyzer' }
              & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'analyzerLogo'>
            )> }
          )> }
        )>> }
      ) }
    )> }
  )> }
);

export type Unnamed_105_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_105_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { preference?: Maybe<(
      { __typename?: 'UserPreference' }
      & { watchedRepositories: (
        { __typename?: 'RepositoryConnection' }
        & Pick<RepositoryConnection, 'totalCount'>
      ) }
    )> }
  )> }
);

export type Unnamed_106_QueryVariables = Exact<{
  level: IssuePriorityLevel;
  objectId: Scalars['ID'];
  isIssuePrioritySet?: Maybe<Scalars['Boolean']>;
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  offset?: Maybe<Scalars['Int']>;
  analyzerShortcode?: Maybe<Scalars['String']>;
}>;


export type Unnamed_106_Query = (
  { __typename?: 'Query' }
  & { issuesWithPriority?: Maybe<(
    { __typename?: 'IssueConnection' }
    & Pick<IssueConnection, 'totalCount'>
    & { edges: Array<Maybe<(
      { __typename?: 'IssueEdge' }
      & { node?: Maybe<(
        { __typename?: 'Issue' }
        & Pick<Issue, 'id' | 'issueType' | 'title' | 'shortcode' | 'description'>
        & { analyzer: (
          { __typename?: 'Analyzer' }
          & Pick<Analyzer, 'name' | 'logo' | 'analyzerLogo' | 'shortcode'>
        ), issuePriority?: Maybe<(
          { __typename?: 'IssuePriority' }
          & { repositoryIssuePriority?: Maybe<(
            { __typename?: 'IssuePriorityType' }
            & Pick<IssuePriorityType, 'slug' | 'weight' | 'verboseName'>
          )>, ownerIssuePriority?: Maybe<(
            { __typename?: 'IssuePriorityType' }
            & Pick<IssuePriorityType, 'slug' | 'weight' | 'verboseName'>
          )> }
        )> }
      )> }
    )>> }
  )> }
);

export type IssuesWithPriorityCountQueryVariables = Exact<{
  level: IssuePriorityLevel;
  objectId: Scalars['ID'];
  isIssuePrioritySet?: Maybe<Scalars['Boolean']>;
}>;


export type IssuesWithPriorityCountQuery = (
  { __typename?: 'Query' }
  & { issuesWithPriority?: Maybe<(
    { __typename?: 'IssueConnection' }
    & Pick<IssueConnection, 'totalCount'>
  )> }
);

export type Unnamed_107_QueryVariables = Exact<{
  shortcode: Scalars['String'];
  objectId: Scalars['ID'];
  level: IssuePriorityLevel;
}>;


export type Unnamed_107_Query = (
  { __typename?: 'Query' }
  & { issue?: Maybe<(
    { __typename?: 'Issue' }
    & Pick<Issue, 'id'>
    & { issuePriority?: Maybe<(
      { __typename?: 'IssuePriority' }
      & Pick<IssuePriority, 'source'>
      & { cascadingIssuePriority?: Maybe<(
        { __typename?: 'IssuePriorityType' }
        & Pick<IssuePriorityType, 'slug' | 'verboseName' | 'weight'>
      )> }
    )> }
  )> }
);

export type Unnamed_108_QueryVariables = Exact<{
  shortcode: Scalars['String'];
}>;


export type Unnamed_108_Query = (
  { __typename?: 'Query' }
  & { issue?: Maybe<(
    { __typename?: 'Issue' }
    & Pick<Issue, 'title' | 'descriptionRendered' | 'severity' | 'autofixAvailable' | 'shortcode' | 'issueType'>
  )> }
);

export type Unnamed_109_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_109_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'accountSetupStatus'>
  )> }
);

export type AppConfigQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type AppConfigQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'appConfigurationUrl' | 'hasGrantedAllRepoAccess'>
  )> }
);

export type ListAutoOnboardEventsQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type ListAutoOnboardEventsQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { autoonboardingEvents?: Maybe<(
      { __typename?: 'AutoOnboardEventConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'AutoOnboardEventEdge' }
        & { node?: Maybe<(
          { __typename?: 'AutoOnboardEvent' }
          & Pick<AutoOnboardEvent, 'id' | 'status' | 'pullRequestNumber' | 'vcsPrUrl'>
          & { repository: (
            { __typename?: 'Repository' }
            & Pick<Repository, 'name' | 'vcsProvider' | 'vcsHost' | 'isPrivate' | 'vcsUrl'>
            & { owner: (
              { __typename?: 'Owner' }
              & Pick<Owner, 'login'>
            ) }
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type AutoOnboardableRepositoriesQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
}>;


export type AutoOnboardableRepositoriesQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { repoList?: Maybe<(
      { __typename?: 'RepositoryConnection' }
      & Pick<RepositoryConnection, 'totalCount'>
      & { pageInfo: (
        { __typename?: 'PageInfo' }
        & Pick<PageInfo, 'hasNextPage'>
      ), edges: Array<Maybe<(
        { __typename?: 'RepositoryEdge' }
        & { node?: Maybe<(
          { __typename?: 'Repository' }
          & Pick<Repository, 'id' | 'name' | 'isPrivate' | 'isFork' | 'vcsProvider'>
          & { owner: (
            { __typename?: 'Owner' }
            & Pick<Owner, 'id' | 'login'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type GetTemplateInfoQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  shortcode: Scalars['String'];
}>;


export type GetTemplateInfoQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { configTemplate?: Maybe<(
      { __typename?: 'ConfigTemplate' }
      & Pick<ConfigTemplate, 'config' | 'shortcode' | 'title' | 'description'>
    )> }
  )> }
);

export type ListTemplatesQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  q?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type ListTemplatesQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { configTemplates?: Maybe<(
      { __typename?: 'ConfigTemplateConnection' }
      & Pick<ConfigTemplateConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'ConfigTemplateEdge' }
        & { node?: Maybe<(
          { __typename?: 'ConfigTemplate' }
          & Pick<ConfigTemplate, 'shortcode' | 'title' | 'description'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_110_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  lastDays: Scalars['Int'];
}>;


export type Unnamed_110_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'autofixedIssueTrend'>
  )> }
);

export type Unnamed_111_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_111_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'login' | 'billingEmail' | 'billingAddress' | 'vcsInstallationId' | 'hasPremiumPlan'>
    & { billingInfo?: Maybe<(
      { __typename?: 'BillingInfo' }
      & Pick<BillingInfo, 'planSlug' | 'status' | 'upgradePlans' | 'downgradePlans' | 'seatsTotal' | 'seatsUsed' | 'lastBillAmount' | 'upcomingBillAmount' | 'lastPaymentDate' | 'upcomingPaymentDate' | 'lastInvoiceUrl' | 'cancelAtPeriodEnd' | 'upcomingCancellationDate' | 'outstandingCredits' | 'billingBackend' | 'synced' | 'pendingUpdate' | 'clientSecret'>
      & { couponApplied?: Maybe<(
        { __typename?: 'AppliedCoupon' }
        & Pick<AppliedCoupon, 'code' | 'description'>
      )>, activeCard?: Maybe<(
        { __typename?: 'Card' }
        & Pick<Card, 'brand' | 'endingIn' | 'expYear' | 'expMonth'>
      )>, invoices?: Maybe<Array<Maybe<(
        { __typename?: 'Invoice' }
        & Pick<Invoice, 'invoiceId' | 'date' | 'amount' | 'url'>
      )>>> }
    )> }
  )> }
);

export type Unnamed_112_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_112_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'isTeam' | 'avatar' | 'vcsInstallationId' | 'hasSubscribedToPlan' | 'isGsrSshRegistered' | 'gsrSetupPending' | 'autofixInstallationUrl' | 'isAutofixEnabled' | 'isAutoonboardAllowed' | 'hasPremiumPlan' | 'canOnboard'>
    & { team?: Maybe<(
      { __typename?: 'Team' }
      & Pick<Team, 'id'>
    )>, primaryUser?: Maybe<(
      { __typename?: 'EnterpriseUser' }
      & Pick<EnterpriseUser, 'id' | 'email' | 'fullName'>
    )> }
  )> }
);

export type Unnamed_113_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  lastDays: Scalars['Int'];
}>;


export type Unnamed_113_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'issueTrend' | 'resolvedIssueTrend'>
  )> }
);

export type Unnamed_114_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_114_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'maxUsagePercentage'>
    & { billingInfo?: Maybe<(
      { __typename?: 'BillingInfo' }
      & Pick<BillingInfo, 'planSlug'>
    )> }
  )> }
);

export type Unnamed_115_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_115_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { ownerSetting?: Maybe<(
      { __typename?: 'OwnerSetting' }
      & Pick<OwnerSetting, 'id'>
      & { issueTypeSettings?: Maybe<Array<Maybe<(
        { __typename?: 'IssueTypeSetting' }
        & Pick<IssueTypeSetting, 'slug' | 'name' | 'isIgnoredInCheckStatus' | 'isIgnoredToDisplay' | 'description'>
      )>>> }
    )> }
  )> }
);

export type OwnerPublicKeyQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type OwnerPublicKeyQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { ownerSetting?: Maybe<(
      { __typename?: 'OwnerSetting' }
      & Pick<OwnerSetting, 'publicKey'>
    )> }
  )> }
);

export type Unnamed_116_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_116_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & { billingInfo?: Maybe<(
      { __typename?: 'BillingInfo' }
      & Pick<BillingInfo, 'status'>
    )> }
  )> }
);

export type Unnamed_117_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_117_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'features' | 'featureUsage'>
  )> }
);

export type WebhookEventDeliveryQueryVariables = Exact<{
  ownerId: Scalars['ID'];
  deliveryId: Scalars['ID'];
}>;


export type WebhookEventDeliveryQuery = (
  { __typename?: 'Query' }
  & { webhookEventDelivery?: Maybe<(
    { __typename?: 'WebhookEventDelivery' }
    & Pick<WebhookEventDelivery, 'id' | 'eventId' | 'deliveryId' | 'finishedIn' | 'createdAt' | 'retryCount' | 'httpStatusCode' | 'payload'>
    & { webhook: (
      { __typename?: 'Webhook' }
      & Pick<Webhook, 'id' | 'url'>
    ), eventType: (
      { __typename?: 'WebhookEventTypes' }
      & Pick<WebhookEventTypes, 'id' | 'name' | 'shortcode' | 'shortDescription'>
    ) }
  )> }
);

export type WebhookDeliveriesQueryVariables = Exact<{
  webhookId: Scalars['ID'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type WebhookDeliveriesQuery = (
  { __typename?: 'Query' }
  & { webhook?: Maybe<(
    { __typename?: 'Webhook' }
    & Pick<Webhook, 'id'>
    & { deliveries: (
      { __typename?: 'WebhookEventDeliveryConnection' }
      & Pick<WebhookEventDeliveryConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'WebhookEventDeliveryEdge' }
        & { node?: Maybe<(
          { __typename?: 'WebhookEventDelivery' }
          & Pick<WebhookEventDelivery, 'id' | 'eventId' | 'payload' | 'createdAt' | 'retryCount' | 'finishedIn' | 'deliveryId' | 'httpStatusCode'>
          & { eventType: (
            { __typename?: 'WebhookEventTypes' }
            & Pick<WebhookEventTypes, 'id' | 'name' | 'shortcode'>
          ) }
        )> }
      )>> }
    ) }
  )> }
);

export type ListWebhooksQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type ListWebhooksQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { webhooks: (
      { __typename?: 'WebhookConnection' }
      & Pick<WebhookConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'WebhookEdge' }
        & { node?: Maybe<(
          { __typename?: 'Webhook' }
          & Pick<Webhook, 'id' | 'createdAt' | 'modifiedAt' | 'url' | 'alive' | 'active'>
          & { eventsSubscribed: (
            { __typename?: 'WebhookEventTypesConnection' }
            & Pick<WebhookEventTypesConnection, 'totalCount'>
          ) }
        )> }
      )>> }
    ) }
  )> }
);

export type ListWebhookEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListWebhookEventsQuery = (
  { __typename?: 'Query' }
  & { webhookEventTypes?: Maybe<(
    { __typename?: 'WebhookEventTypesConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'WebhookEventTypesEdge' }
      & { node?: Maybe<(
        { __typename?: 'WebhookEventTypes' }
        & Pick<WebhookEventTypes, 'name' | 'shortcode' | 'shortDescription'>
      )> }
    )>> }
  )> }
);

export type GetSingleWebhookQueryVariables = Exact<{
  webhookId: Scalars['ID'];
}>;


export type GetSingleWebhookQuery = (
  { __typename?: 'Query' }
  & { webhook?: Maybe<(
    { __typename?: 'Webhook' }
    & Pick<Webhook, 'id' | 'url' | 'active' | 'secret' | 'version' | 'apiSigning' | 'createdAt' | 'modifiedAt'>
    & { eventsSubscribed: (
      { __typename?: 'WebhookEventTypesConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'WebhookEventTypesEdge' }
        & { node?: Maybe<(
          { __typename?: 'WebhookEventTypes' }
          & Pick<WebhookEventTypes, 'shortcode' | 'name' | 'shortDescription'>
        )> }
      )>> }
    ) }
  )> }
);

export type AccessTokenQueryVariables = Exact<{
  tokenId: Scalars['ID'];
}>;


export type AccessTokenQuery = (
  { __typename?: 'Query' }
  & { accessToken?: Maybe<(
    { __typename?: 'AccessToken' }
    & Pick<AccessToken, 'id' | 'description' | 'lastUsedAt' | 'expirationStatus' | 'expiresAt'>
  )> }
);

export type AccessTokenListQueryVariables = Exact<{
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type AccessTokenListQuery = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { accessTokens?: Maybe<(
      { __typename?: 'AccessTokenConnection' }
      & Pick<AccessTokenConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'AccessTokenEdge' }
        & { node?: Maybe<(
          { __typename?: 'AccessToken' }
          & Pick<AccessToken, 'id' | 'description' | 'expirationStatus' | 'expiresAt' | 'lastUsedAt'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_118_QueryVariables = Exact<{
  name: Scalars['String'];
  owner: Scalars['String'];
  provider: VcsProviderChoices;
  q: Scalars['String'];
}>;


export type Unnamed_118_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { addableMembers?: Maybe<(
      { __typename?: 'TeamMemberConnection' }
      & Pick<TeamMemberConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'TeamMemberEdge' }
        & { node?: Maybe<(
          { __typename?: 'TeamMember' }
          & Pick<TeamMember, 'id' | 'role' | 'isPrimaryUser'>
          & { user: (
            { __typename?: 'EnterpriseUser' }
            & Pick<EnterpriseUser, 'id' | 'firstName' | 'lastName' | 'fullName' | 'email' | 'avatar' | 'dateJoined'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_119_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_119_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'alertingMetrics'>
  )> }
);

export type Unnamed_120_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  status: Scalars['String'];
}>;


export type Unnamed_120_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { runs?: Maybe<(
      { __typename?: 'RunConnection' }
      & Pick<RunConnection, 'totalCount'>
    )> }
  )> }
);

export type RepoAutofixStatsQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type RepoAutofixStatsQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { autofixableIssuesMetadata?: Maybe<(
      { __typename?: 'AutofixableIssuesMetadata' }
      & Pick<AutofixableIssuesMetadata, 'autofixableIssueCount' | 'estimatedTimeSaved'>
    )>, autofixableIssuesPerAnalyzer?: Maybe<Array<Maybe<(
      { __typename?: 'AnalyzerAutofixableIssues' }
      & Pick<AnalyzerAutofixableIssues, 'filesAffected' | 'issueCount'>
      & { analyzer?: Maybe<(
        { __typename?: 'Analyzer' }
        & Pick<Analyzer, 'shortcode' | 'logo' | 'analyzerLogo' | 'name'>
      )> }
    )>>> }
  )> }
);

export type Unnamed_121_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  lastDays: Scalars['Int'];
}>;


export type Unnamed_121_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'autofixedIssueTrend'>
  )> }
);

export type Unnamed_122_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_122_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'supportedAnalyzers'>
    & { availableAnalyzers?: Maybe<(
      { __typename?: 'AnalyzerConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'AnalyzerEdge' }
        & { node?: Maybe<(
          { __typename?: 'Analyzer' }
          & Pick<Analyzer, 'id' | 'shortcode' | 'name' | 'logo' | 'analyzerLogo'>
        )> }
      )>> }
    )> }
  )> }
);

export type BaseRepoQueryQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type BaseRepoQueryQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'vcsUrl' | 'isActivated' | 'isPrivate' | 'isStarred' | 'errorCode' | 'renderedErrorMessage' | 'fullName' | 'defaultBranchName' | 'vcsProvider' | 'vcsDefaultBranchUrl' | 'errorMessage' | 'canBeActivated' | 'isAutofixEnabled' | 'blobUrlRoot'>
    & { lastRun?: Maybe<(
      { __typename?: 'Run' }
      & Pick<Run, 'id' | 'runId' | 'config' | 'commitOid' | 'branchRunCount' | 'status' | 'finishedAt'>
    )>, latestAnalysisRun?: Maybe<(
      { __typename?: 'Run' }
      & Pick<Run, 'id' | 'runId' | 'config' | 'commitOid' | 'branchRunCount' | 'status' | 'finishedAt'>
    )>, owner: (
      { __typename?: 'Owner' }
      & Pick<Owner, 'id'>
    ) }
  )> }
);

export type RepoDetailsQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type RepoDetailsQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'isPrivate' | 'isStarred' | 'canBeActivated' | 'fullName' | 'errorCode' | 'renderedErrorMessage' | 'userPermissionMeta' | 'isActivated' | 'blobUrlRoot' | 'defaultBranchName' | 'widgetsAvailable' | 'allWidgets' | 'vcsDefaultBranchUrl' | 'hasViewerEditAccess' | 'vcsUrl' | 'vcsHost' | 'vcsProvider' | 'config' | 'supportedAnalyzers' | 'isAutofixEnabled' | 'autofixGithubAppInstallationUrl' | 'autofixBitbucketAddonInstallationUrl'>
    & { latestAnalysisRun?: Maybe<(
      { __typename?: 'Run' }
      & Pick<Run, 'id' | 'runId' | 'config' | 'commitOid' | 'branchRunCount' | 'status' | 'finishedAt'>
    )>, availableAnalyzers?: Maybe<(
      { __typename?: 'AnalyzerConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'AnalyzerEdge' }
        & { node?: Maybe<(
          { __typename?: 'Analyzer' }
          & Pick<Analyzer, 'id' | 'shortcode' | 'name' | 'logo' | 'analyzerLogo'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_123_QueryVariables = Exact<{
  repositoryId: Scalars['ID'];
}>;


export type Unnamed_123_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'AccessToken' } | { __typename?: 'Analyzer' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'AuditLog' } | { __typename?: 'AutoOnboardEvent' } | { __typename?: 'AutofixRun' } | { __typename?: 'Check' } | { __typename?: 'CheckIssue' } | { __typename?: 'ConfigTemplate' } | { __typename?: 'EnterpriseGroup' } | { __typename?: 'EnterpriseUser' } | { __typename?: 'FeatureDefinition' } | { __typename?: 'GroupTeamMembership' } | { __typename?: 'GroupUserMembership' } | { __typename?: 'Issue' } | { __typename?: 'IssuePriority' } | { __typename?: 'Owner' } | { __typename?: 'OwnerSetting' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'defaultBranchName' | 'hasViewerEditAccess' | 'vcsUrl' | 'vcsHost' | 'supportedAnalyzers' | 'isCommitPossible' | 'isAutofixEnabled' | 'autofixGithubAppInstallationUrl'>
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'Run' } | { __typename?: 'SilenceRule' } | { __typename?: 'Team' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'Transaction' } | { __typename?: 'TransformerReview' } | { __typename?: 'TransformerRun' } | { __typename?: 'TransformerTool' } | { __typename?: 'User' } | { __typename?: 'UserPreference' } | { __typename?: 'Webhook' } | { __typename?: 'WebhookEventDelivery' } | { __typename?: 'WebhookEventTypes' }> }
);

export type IsCommitPossibleQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type IsCommitPossibleQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'isCommitPossible'>
  )> }
);

export type Unnamed_124_QueryVariables = Exact<{
  repositoryId: Scalars['ID'];
  shortcode: Scalars['String'];
}>;


export type Unnamed_124_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'AccessToken' } | { __typename?: 'Analyzer' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'AuditLog' } | { __typename?: 'AutoOnboardEvent' } | { __typename?: 'AutofixRun' } | { __typename?: 'Check' } | { __typename?: 'CheckIssue' } | { __typename?: 'ConfigTemplate' } | { __typename?: 'EnterpriseGroup' } | { __typename?: 'EnterpriseUser' } | { __typename?: 'FeatureDefinition' } | { __typename?: 'GroupTeamMembership' } | { __typename?: 'GroupUserMembership' } | { __typename?: 'Issue' } | { __typename?: 'IssuePriority' } | { __typename?: 'Owner' } | { __typename?: 'OwnerSetting' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'config' | 'blobUrlRoot' | 'vcsProvider' | 'hasViewerEditAccess'>
    & { issue?: Maybe<(
      { __typename?: 'RepositoryIssue' }
      & Pick<RepositoryIssue, 'id' | 'descriptionRendered' | 'issueType' | 'title' | 'shortcode' | 'firstSeen' | 'lastSeen' | 'modifiedAt' | 'occurrenceCount' | 'analyzerName' | 'analyzerShortcode' | 'analyzerLogo' | 'autofixAvailable' | 'newVcsIssueUrl' | 'raisedInFiles'>
      & { silenceRules?: Maybe<Array<Maybe<(
        { __typename?: 'SilenceRule' }
        & Pick<SilenceRule, 'silenceLevel' | 'id' | 'filePath' | 'createdAt' | 'metadata'>
        & { creator?: Maybe<(
          { __typename?: 'EnterpriseUser' }
          & Pick<EnterpriseUser, 'firstName' | 'lastName' | 'email' | 'avatar'>
        )> }
      )>>> }
    )> }
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'Run' } | { __typename?: 'SilenceRule' } | { __typename?: 'Team' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'Transaction' } | { __typename?: 'TransformerReview' } | { __typename?: 'TransformerRun' } | { __typename?: 'TransformerTool' } | { __typename?: 'User' } | { __typename?: 'UserPreference' } | { __typename?: 'Webhook' } | { __typename?: 'WebhookEventDelivery' } | { __typename?: 'WebhookEventTypes' }> }
);

export type Unnamed_125_QueryVariables = Exact<{
  nodeId: Scalars['ID'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
}>;


export type Unnamed_125_Query = (
  { __typename?: 'Query' }
  & { node?: Maybe<{ __typename?: 'AccessToken' } | { __typename?: 'Analyzer' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'AuditLog' } | { __typename?: 'AutoOnboardEvent' } | { __typename?: 'AutofixRun' } | { __typename?: 'Check' } | { __typename?: 'CheckIssue' } | { __typename?: 'ConfigTemplate' } | { __typename?: 'EnterpriseGroup' } | { __typename?: 'EnterpriseUser' } | { __typename?: 'FeatureDefinition' } | { __typename?: 'GroupTeamMembership' } | { __typename?: 'GroupUserMembership' } | { __typename?: 'Issue' } | { __typename?: 'IssuePriority' } | { __typename?: 'Owner' } | { __typename?: 'OwnerSetting' } | { __typename?: 'Repository' } | { __typename?: 'RepositoryCollaborator' } | (
    { __typename?: 'RepositoryIssue' }
    & Pick<RepositoryIssue, 'shortcode'>
    & { checkIssues: (
      { __typename?: 'CheckIssueConnection' }
      & Pick<CheckIssueConnection, 'totalCount'>
      & { pageInfo: (
        { __typename?: 'PageInfo' }
        & Pick<PageInfo, 'hasNextPage'>
      ), edges: Array<Maybe<(
        { __typename?: 'CheckIssueEdge' }
        & { node?: Maybe<(
          { __typename?: 'CheckIssue' }
          & Pick<CheckIssue, 'id' | 'severity' | 'path' | 'text' | 'beginLine' | 'beginColumn' | 'endLine' | 'endColumn' | 'sourceCodeMarkup' | 'createdAt'>
        )> }
      )>> }
    ) }
  ) | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'Run' } | { __typename?: 'SilenceRule' } | { __typename?: 'Team' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'Transaction' } | { __typename?: 'TransformerReview' } | { __typename?: 'TransformerRun' } | { __typename?: 'TransformerTool' } | { __typename?: 'User' } | { __typename?: 'UserPreference' } | { __typename?: 'Webhook' } | { __typename?: 'WebhookEventDelivery' } | { __typename?: 'WebhookEventTypes' }> }
);

export type Unnamed_126_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
  all?: Maybe<Scalars['Boolean']>;
}>;


export type Unnamed_126_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { issues?: Maybe<(
      { __typename?: 'RepositoryIssueConnection' }
      & Pick<RepositoryIssueConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryIssueEdge' }
        & { node?: Maybe<(
          { __typename?: 'RepositoryIssue' }
          & Pick<RepositoryIssue, 'id' | 'issueType' | 'title' | 'shortcode' | 'description' | 'occurrenceCount' | 'createdAt' | 'analyzerName' | 'analyzerLogo' | 'seenIn' | 'firstSeen' | 'lastSeen' | 'modifiedAt' | 'pastValue' | 'autofixAvailable' | 'raisedInFiles'>
        )> }
      )>> }
    )> }
  )> }
);

export type RepoSilenceRulesQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  issueCode: Scalars['String'];
}>;


export type RepoSilenceRulesQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { silenceRules?: Maybe<(
      { __typename?: 'SilenceRuleConnection' }
      & Pick<SilenceRuleConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'SilenceRuleEdge' }
        & { node?: Maybe<(
          { __typename?: 'SilenceRule' }
          & Pick<SilenceRule, 'silenceLevel' | 'id' | 'filePath' | 'createdAt' | 'metadata'>
          & { issue: (
            { __typename?: 'Issue' }
            & Pick<Issue, 'shortcode' | 'title'>
            & { analyzer: (
              { __typename?: 'Analyzer' }
              & Pick<Analyzer, 'shortcode'>
            ) }
          ), creator?: Maybe<(
            { __typename?: 'EnterpriseUser' }
            & Pick<EnterpriseUser, 'firstName' | 'lastName' | 'email' | 'avatar'>
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_127_QueryVariables = Exact<{
  shortcode: Scalars['String'];
}>;


export type Unnamed_127_Query = (
  { __typename?: 'Query' }
  & { issue?: Maybe<(
    { __typename?: 'Issue' }
    & Pick<Issue, 'shortcode' | 'title' | 'issueType' | 'descriptionRendered'>
    & { analyzer: (
      { __typename?: 'Analyzer' }
      & Pick<Analyzer, 'id' | 'shortcode' | 'name'>
    ) }
  )> }
);

export type Unnamed_128_QueryVariables = Exact<{
  repositoryId: Scalars['ID'];
  shortcode: Scalars['String'];
}>;


export type Unnamed_128_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'AccessToken' } | { __typename?: 'Analyzer' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'AuditLog' } | { __typename?: 'AutoOnboardEvent' } | { __typename?: 'AutofixRun' } | { __typename?: 'Check' } | { __typename?: 'CheckIssue' } | { __typename?: 'ConfigTemplate' } | { __typename?: 'EnterpriseGroup' } | { __typename?: 'EnterpriseUser' } | { __typename?: 'FeatureDefinition' } | { __typename?: 'GroupTeamMembership' } | { __typename?: 'GroupUserMembership' } | { __typename?: 'Issue' } | { __typename?: 'IssuePriority' } | { __typename?: 'Owner' } | { __typename?: 'OwnerSetting' } | (
    { __typename?: 'Repository' }
    & { issue?: Maybe<(
      { __typename?: 'RepositoryIssue' }
      & Pick<RepositoryIssue, 'id' | 'raisedInFiles'>
    )> }
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'Run' } | { __typename?: 'SilenceRule' } | { __typename?: 'Team' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'Transaction' } | { __typename?: 'TransformerReview' } | { __typename?: 'TransformerRun' } | { __typename?: 'TransformerTool' } | { __typename?: 'User' } | { __typename?: 'UserPreference' } | { __typename?: 'Webhook' } | { __typename?: 'WebhookEventDelivery' } | { __typename?: 'WebhookEventTypes' }> }
);

export type Unnamed_129_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  lastDays: Scalars['Int'];
}>;


export type Unnamed_129_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'issueTrend' | 'resolvedIssueTrend'>
  )> }
);

export type Unnamed_130_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  issueType: Scalars['String'];
  analyzer?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  autofixAvailable?: Maybe<Scalars['Boolean']>;
}>;


export type Unnamed_130_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'issueTypeDistribution'>
  )> }
);

export type Unnamed_131_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  isActivated?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
}>;


export type Unnamed_131_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { repositories?: Maybe<(
      { __typename?: 'RepositoryConnection' }
      & Pick<RepositoryConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryEdge' }
        & { node?: Maybe<(
          { __typename?: 'Repository' }
          & Pick<Repository, 'id' | 'name' | 'vcsProvider' | 'ownerLogin' | 'modifiedAt' | 'isActivated' | 'isFork' | 'isPrivate' | 'isStarred' | 'latestCommitOid' | 'defaultBranchName' | 'lastAnalyzedAt' | 'canBeActivated' | 'supportedAnalyzers'>
          & { availableAnalyzers?: Maybe<(
            { __typename?: 'AnalyzerConnection' }
            & { edges: Array<Maybe<(
              { __typename?: 'AnalyzerEdge' }
              & { node?: Maybe<(
                { __typename?: 'Analyzer' }
                & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'analyzerLogo'>
              )> }
            )>> }
          )>, primaryAnalyzer?: Maybe<(
            { __typename?: 'Analyzer' }
            & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'analyzerLogo'>
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type ListAdhocRunPendingQueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type ListAdhocRunPendingQuery = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { repositories?: Maybe<(
      { __typename?: 'RepositoryConnection' }
      & Pick<RepositoryConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryEdge' }
        & { node?: Maybe<(
          { __typename?: 'Repository' }
          & Pick<Repository, 'id' | 'name' | 'errorCode' | 'vcsProvider' | 'ownerLogin' | 'isActivated' | 'isFork' | 'isPrivate' | 'canBeActivated'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_132_QueryVariables = Exact<{
  q?: Maybe<Scalars['String']>;
}>;


export type Unnamed_132_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { repositories?: Maybe<(
      { __typename?: 'RepositoryConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryEdge' }
        & { node?: Maybe<(
          { __typename?: 'Repository' }
          & Pick<Repository, 'name' | 'isPrivate' | 'isFork' | 'configGenerationRoute'>
          & { owner: (
            { __typename?: 'Owner' }
            & Pick<Owner, 'login'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_133_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  lastDays: Scalars['Int'];
}>;


export type Unnamed_133_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'uniqueNamespaceKeys' | 'metricsData'>
  )> }
);

export type RepositoryPermissionsQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type RepositoryPermissionsQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'userPermissionMeta'>
  )> }
);

export type Unnamed_134_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_134_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { repositories?: Maybe<(
      { __typename?: 'RepositoryConnection' }
      & Pick<RepositoryConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryEdge' }
        & { node?: Maybe<(
          { __typename?: 'Repository' }
          & Pick<Repository, 'id' | 'name' | 'vcsProvider' | 'ownerLogin' | 'isActivated' | 'isFork' | 'isPrivate' | 'lastAnalyzedAt'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_135_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_135_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { repositories?: Maybe<(
      { __typename?: 'RepositoryConnection' }
      & Pick<RepositoryConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryEdge' }
        & { node?: Maybe<(
          { __typename?: 'Repository' }
          & Pick<Repository, 'id' | 'name' | 'vcsProvider' | 'ownerLogin' | 'isActivated' | 'isFork' | 'isPrivate' | 'lastAnalyzedAt'>
          & { availableAnalyzers?: Maybe<(
            { __typename?: 'AnalyzerConnection' }
            & { edges: Array<Maybe<(
              { __typename?: 'AnalyzerEdge' }
              & { node?: Maybe<(
                { __typename?: 'Analyzer' }
                & Pick<Analyzer, 'id' | 'name' | 'shortcode' | 'analyzerLogo'>
              )> }
            )>> }
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_136_QueryVariables = Exact<{
  runId: Scalars['String'];
}>;


export type Unnamed_136_Query = (
  { __typename?: 'Query' }
  & { autofixRun: (
    { __typename?: 'AutofixRun' }
    & Pick<AutofixRun, 'id' | 'errorsRendered' | 'runId' | 'staleRedirectUrl' | 'finishedIn' | 'isGeneratedFromPr' | 'issuesAffected' | 'committedToBranchStatus' | 'resolvedIssuesCount' | 'pullRequestStatus' | 'pullRequestTitle' | 'pullRequestNumber' | 'status' | 'changeset' | 'vcsPrUrl'>
    & { createdBy?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'fullName' | 'email' | 'avatar'>
    )>, analyzer?: Maybe<(
      { __typename?: 'Analyzer' }
      & Pick<Analyzer, 'name' | 'shortcode' | 'analyzerLogo'>
    )>, issue?: Maybe<(
      { __typename?: 'Issue' }
      & Pick<Issue, 'title' | 'issueType' | 'shortcode'>
    )> }
  ) }
);

export type AutofixRunsQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  statusIn?: Maybe<Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>>;
  prStatusIn?: Maybe<Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>>;
}>;


export type AutofixRunsQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { autofixRuns?: Maybe<(
      { __typename?: 'AutofixRunConnection' }
      & Pick<AutofixRunConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'AutofixRunEdge' }
        & { node?: Maybe<(
          { __typename?: 'AutofixRun' }
          & Pick<AutofixRun, 'runId' | 'status' | 'filesAffected' | 'finishedIn' | 'isGeneratedFromPr' | 'gitCompareDisplay' | 'pullRequestTitle' | 'pullRequestNumber' | 'pullRequestStatus' | 'createdAt' | 'resolvedIssuesCount' | 'changeset'>
          & { createdBy?: Maybe<(
            { __typename?: 'User' }
            & Pick<User, 'fullName' | 'email' | 'avatar'>
          )>, analyzer?: Maybe<(
            { __typename?: 'Analyzer' }
            & Pick<Analyzer, 'name' | 'shortcode' | 'analyzerLogo'>
          )>, issue?: Maybe<(
            { __typename?: 'Issue' }
            & Pick<Issue, 'title' | 'issueType' | 'shortcode'>
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_137_QueryVariables = Exact<{
  runId: Scalars['String'];
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_137_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & { autofixRun?: Maybe<(
      { __typename?: 'AutofixRun' }
      & Pick<AutofixRun, 'runId' | 'status' | 'filesAffected' | 'isGeneratedFromPr' | 'gitCompareDisplay' | 'pullRequestTitle' | 'pullRequestNumber' | 'pullRequestStatus' | 'createdAt' | 'resolvedIssuesCount'>
      & { createdBy?: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'fullName' | 'email' | 'avatar'>
      )>, analyzer?: Maybe<(
        { __typename?: 'Analyzer' }
        & Pick<Analyzer, 'name' | 'shortcode' | 'analyzerLogo'>
      )>, issue?: Maybe<(
        { __typename?: 'Issue' }
        & Pick<Issue, 'title' | 'issueType' | 'shortcode'>
      )> }
    )> }
  )> }
);

export type Unnamed_138_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  status?: Maybe<Scalars['String']>;
}>;


export type Unnamed_138_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & { runs?: Maybe<(
      { __typename?: 'RunConnection' }
      & Pick<RunConnection, 'totalCount'>
    )>, autofixRuns?: Maybe<(
      { __typename?: 'AutofixRunConnection' }
      & Pick<AutofixRunConnection, 'totalCount'>
    )>, transformerRuns?: Maybe<(
      { __typename?: 'TransformerRunConnection' }
      & Pick<TransformerRunConnection, 'totalCount'>
    )> }
  )> }
);

export type Unnamed_139_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  branchName: Scalars['String'];
  limit: Scalars['Int'];
}>;


export type Unnamed_139_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name'>
    & { branchRuns?: Maybe<(
      { __typename?: 'RunConnection' }
      & Pick<RunConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RunEdge' }
        & { node?: Maybe<(
          { __typename?: 'Run' }
          & Pick<Run, 'config' | 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'pullRequestNumberDisplay' | 'issuesRaisedCount' | 'issuesResolvedNum'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_140_QueryVariables = Exact<{
  checkId: Scalars['ID'];
}>;


export type Unnamed_140_Query = (
  { __typename?: 'Query' }
  & { check: (
    { __typename?: 'Check' }
    & Pick<Check, 'id' | 'filesAffectedByAutofix'>
    & { autofixableIssues?: Maybe<Array<Maybe<(
      { __typename?: 'AutofixableIssueDetail' }
      & Pick<AutofixableIssueDetail, 'title' | 'shortcode' | 'occurrenceCount' | 'category'>
    )>>> }
  ) }
);

export type Unnamed_141_QueryVariables = Exact<{
  checkId: Scalars['ID'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
}>;


export type Unnamed_141_Query = (
  { __typename?: 'Query' }
  & { checkIssues?: Maybe<(
    { __typename?: 'CheckIssueConnection' }
    & Pick<CheckIssueConnection, 'totalCount'>
    & { edges: Array<Maybe<(
      { __typename?: 'CheckIssueEdge' }
      & { node?: Maybe<(
        { __typename?: 'CheckIssue' }
        & Pick<CheckIssue, 'id' | 'path' | 'text' | 'modifiedAt' | 'createdAt' | 'beginLine' | 'beginColumn' | 'endLine' | 'endColumn' | 'sourceCodeMarkup'>
      )> }
    )>> }
  )> }
);

export type ConcreteIssuesQueryVariables = Exact<{
  checkId: Scalars['ID'];
  q?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
}>;


export type ConcreteIssuesQuery = (
  { __typename?: 'Query' }
  & { check: (
    { __typename?: 'Check' }
    & Pick<Check, 'id'>
    & { concreteIssues?: Maybe<(
      { __typename?: 'IssueConnection' }
      & Pick<IssueConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'IssueEdge' }
        & { node?: Maybe<(
          { __typename?: 'Issue' }
          & Pick<Issue, 'id' | 'createdAt' | 'modifiedAt' | 'shortcode' | 'title' | 'description' | 'severity' | 'autofixAvailable' | 'autofixTitle' | 'occurrenceCount' | 'issueType' | 'seenIn'>
        )> }
      )>> }
    )> }
  ) }
);

export type Unnamed_142_QueryVariables = Exact<{
  checkId: Scalars['ID'];
}>;


export type Unnamed_142_Query = (
  { __typename?: 'Query' }
  & { check: (
    { __typename?: 'Check' }
    & Pick<Check, 'id' | 'status' | 'checkSeq' | 'finishedInDisplay' | 'filesAffectedByAutofix' | 'errors' | 'errorsRendered' | 'issuesRaisedCount' | 'issuesResolvedCount'>
    & { autofixableIssues?: Maybe<Array<Maybe<(
      { __typename?: 'AutofixableIssueDetail' }
      & Pick<AutofixableIssueDetail, 'shortcode' | 'title' | 'category' | 'occurrenceCount'>
    )>>>, run: (
      { __typename?: 'Run' }
      & Pick<Run, 'isForDefaultBranch' | 'isForCrossRepoPr'>
    ), analyzer?: Maybe<(
      { __typename?: 'Analyzer' }
      & Pick<Analyzer, 'name' | 'shortcode' | 'analyzerLogo' | 'description'>
    )>, metricsCaptured?: Maybe<Array<Maybe<(
      { __typename?: 'RepositoryMetricValue' }
      & Pick<RepositoryMetricValue, 'id' | 'name' | 'valueDisplay' | 'isPassing' | 'extraData' | 'namespace'>
    )>>>, concreteIssues?: Maybe<(
      { __typename?: 'IssueConnection' }
      & Pick<IssueConnection, 'totalCount'>
    )> }
  ) }
);

export type Unnamed_143_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_143_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name'>
    & { groupedRuns?: Maybe<(
      { __typename?: 'RunConnection' }
      & Pick<RunConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RunEdge' }
        & { node?: Maybe<(
          { __typename?: 'Run' }
          & Pick<Run, 'config' | 'createdAt' | 'runId' | 'status' | 'branchName' | 'branchRunCount' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'pullRequestNumberDisplay' | 'issuesRaisedCount' | 'issuesResolvedNum'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_144_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_144_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { runs?: Maybe<(
      { __typename?: 'RunConnection' }
      & Pick<RunConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RunEdge' }
        & { node?: Maybe<(
          { __typename?: 'Run' }
          & Pick<Run, 'id' | 'config' | 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'pullRequestNumberDisplay' | 'issuesRaisedCount' | 'issuesResolvedNum'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_145_QueryVariables = Exact<{
  runId: Scalars['String'];
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_145_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { run?: Maybe<(
      { __typename?: 'Run' }
      & Pick<Run, 'createdAt' | 'blobUrlRoot' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'vcsPrUrl' | 'pullRequestNumberDisplay'>
      & { checks: (
        { __typename?: 'CheckConnection' }
        & { edges: Array<Maybe<(
          { __typename?: 'CheckEdge' }
          & { node?: Maybe<(
            { __typename?: 'Check' }
            & Pick<Check, 'id' | 'issuesRaisedCount'>
            & { analyzer?: Maybe<(
              { __typename?: 'Analyzer' }
              & Pick<Analyzer, 'name' | 'shortcode' | 'description' | 'analyzerLogo'>
            )> }
          )> }
        )>> }
      ) }
    )> }
  )> }
);

export type Unnamed_146_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  branchName: Scalars['String'];
}>;


export type Unnamed_146_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name'>
    & { transformerBranchRuns?: Maybe<(
      { __typename?: 'TransformerRunConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'TransformerRunEdge' }
        & { node?: Maybe<(
          { __typename?: 'TransformerRun' }
          & Pick<TransformerRun, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'pullRequestNumberDisplay' | 'changedFilesCount' | 'tools'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_147_QueryVariables = Exact<{
  runId: Scalars['String'];
}>;


export type Unnamed_147_Query = (
  { __typename?: 'Query' }
  & { transformerRun: (
    { __typename?: 'TransformerRun' }
    & Pick<TransformerRun, 'branchName' | 'changedFilesCount' | 'changeset' | 'errorsRendered' | 'commitOidShort' | 'committedToBranchStatus' | 'createdAt' | 'finishedIn' | 'gitCompareDisplay' | 'id' | 'pullRequestStatus' | 'status' | 'tools' | 'vcsCommitUrl' | 'vcsPrUrl'>
  ) }
);

export type Unnamed_148_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_148_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name'>
    & { groupedTransformerRuns?: Maybe<(
      { __typename?: 'TransformerRunConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'TransformerRunEdge' }
        & { node?: Maybe<(
          { __typename?: 'TransformerRun' }
          & Pick<TransformerRun, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'pullRequestNumberDisplay' | 'changedFilesCount' | 'tools'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_149_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_149_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { transformerRuns?: Maybe<(
      { __typename?: 'TransformerRunConnection' }
      & Pick<TransformerRunConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'TransformerRunEdge' }
        & { node?: Maybe<(
          { __typename?: 'TransformerRun' }
          & Pick<TransformerRun, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'changedFilesCount' | 'tools' | 'committedToBranchStatus' | 'gitCompareDisplay' | 'pullRequestNumber' | 'vcsPrUrl'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_150_QueryVariables = Exact<{
  runId: Scalars['String'];
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_150_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { transformerRun?: Maybe<(
      { __typename?: 'TransformerRun' }
      & Pick<TransformerRun, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'changedFilesCount' | 'tools' | 'committedToBranchStatus' | 'gitCompareDisplay' | 'pullRequestNumber' | 'vcsPrUrl'>
    )> }
  )> }
);

export type AuditLogsQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type AuditLogsQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name'>
    & { auditLogMeta?: Maybe<(
      { __typename?: 'AuditLogMeta' }
      & Pick<AuditLogMeta, 'events' | 'exportFormats' | 'possibleActors'>
    )>, logs?: Maybe<(
      { __typename?: 'AuditLogConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'AuditLogEdge' }
        & { node?: Maybe<(
          { __typename?: 'AuditLog' }
          & Pick<AuditLog, 'id' | 'eventName' | 'description' | 'ipAddress' | 'location' | 'createdAt'>
          & { actor?: Maybe<(
            { __typename?: 'EnterpriseUser' }
            & Pick<EnterpriseUser, 'fullName' | 'firstName' | 'email' | 'avatar'>
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_151_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_151_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'badge' | 'token'>
  )> }
);

export type Unnamed_152_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_152_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'showInDiscover' | 'analyzeChangesetOnly' | 'defaultBranchName' | 'isSubmoduleEnabled' | 'config' | 'isActivated' | 'isPrivate'>
  )> }
);

export type Unnamed_153_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_153_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'hasViewerEditAccess'>
    & { silenceRules?: Maybe<(
      { __typename?: 'SilenceRuleConnection' }
      & Pick<SilenceRuleConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'SilenceRuleEdge' }
        & { node?: Maybe<(
          { __typename?: 'SilenceRule' }
          & Pick<SilenceRule, 'silenceLevel' | 'id' | 'filePath' | 'createdAt' | 'metadata'>
          & { issue: (
            { __typename?: 'Issue' }
            & Pick<Issue, 'shortcode' | 'title'>
            & { analyzer: (
              { __typename?: 'Analyzer' }
              & Pick<Analyzer, 'shortcode'>
            ) }
          ), creator?: Maybe<(
            { __typename?: 'EnterpriseUser' }
            & Pick<EnterpriseUser, 'firstName' | 'lastName' | 'email' | 'avatar'>
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_154_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  q: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_154_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id'>
    & { collaborators?: Maybe<(
      { __typename?: 'RepositoryCollaboratorConnection' }
      & Pick<RepositoryCollaboratorConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryCollaboratorEdge' }
        & { node?: Maybe<(
          { __typename?: 'RepositoryCollaborator' }
          & Pick<RepositoryCollaborator, 'id' | 'permission'>
          & { repository: (
            { __typename?: 'Repository' }
            & Pick<Repository, 'id'>
          ), user: (
            { __typename?: 'EnterpriseUser' }
            & Pick<EnterpriseUser, 'id' | 'firstName' | 'lastName' | 'fullName' | 'email' | 'avatar' | 'dateJoined'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_155_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_155_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'dsn' | 'hasTestCoverage'>
    & { issueTypeSettings?: Maybe<Array<Maybe<(
      { __typename?: 'IssueTypeSetting' }
      & Pick<IssueTypeSetting, 'name' | 'slug' | 'description' | 'isIgnoredInCheckStatus' | 'isIgnoredToDisplay'>
    )>>>, issuePrioritySettings?: Maybe<Array<Maybe<(
      { __typename?: 'IssuePrioritySetting' }
      & Pick<IssuePrioritySetting, 'slug' | 'weight' | 'verboseName' | 'isIgnoredInCheckStatus' | 'isIgnoredToDisplay'>
    )>>> }
  )> }
);

export type Unnamed_156_QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type Unnamed_156_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'AccessToken' } | { __typename?: 'Analyzer' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'AuditLog' } | { __typename?: 'AutoOnboardEvent' } | { __typename?: 'AutofixRun' } | { __typename?: 'Check' } | { __typename?: 'CheckIssue' } | { __typename?: 'ConfigTemplate' } | { __typename?: 'EnterpriseGroup' } | { __typename?: 'EnterpriseUser' } | { __typename?: 'FeatureDefinition' } | { __typename?: 'GroupTeamMembership' } | { __typename?: 'GroupUserMembership' } | { __typename?: 'Issue' } | { __typename?: 'IssuePriority' } | { __typename?: 'Owner' } | { __typename?: 'OwnerSetting' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'encPublicKey'>
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'Run' } | { __typename?: 'SilenceRule' } | { __typename?: 'Team' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'Transaction' } | { __typename?: 'TransformerReview' } | { __typename?: 'TransformerRun' } | { __typename?: 'TransformerTool' } | { __typename?: 'User' } | { __typename?: 'UserPreference' } | { __typename?: 'Webhook' } | { __typename?: 'WebhookEventDelivery' } | { __typename?: 'WebhookEventTypes' }> }
);

export type RepoStatusPollQueryQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type RepoStatusPollQueryQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'errorCode' | 'defaultBranchName'>
    & { lastRun?: Maybe<(
      { __typename?: 'Run' }
      & Pick<Run, 'id' | 'runId' | 'config' | 'commitOid' | 'branchRunCount' | 'status' | 'finishedAt'>
    )>, latestAnalysisRun?: Maybe<(
      { __typename?: 'Run' }
      & Pick<Run, 'id' | 'runId' | 'config' | 'commitOid' | 'branchRunCount' | 'status' | 'finishedAt'>
    )> }
  )> }
);

export type RepositoryWidgetsQueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type RepositoryWidgetsQuery = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'widgets' | 'widgetsDisplay' | 'widgetsAvailable' | 'allWidgets'>
  )> }
);

export type Unnamed_157_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_157_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id'>
    & { team?: Maybe<(
      { __typename?: 'Team' }
      & Pick<Team, 'id' | 'invitationUrl'>
    )> }
  )> }
);

export type Unnamed_158_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_158_Query = (
  { __typename?: 'Query' }
  & { team?: Maybe<(
    { __typename?: 'Team' }
    & Pick<Team, 'id'>
    & { invites?: Maybe<(
      { __typename?: 'TeamMemberInvitationConnection' }
      & Pick<TeamMemberInvitationConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'TeamMemberInvitationEdge' }
        & { node?: Maybe<(
          { __typename?: 'TeamMemberInvitation' }
          & Pick<TeamMemberInvitation, 'email' | 'createdAt' | 'role'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_159_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
}>;


export type Unnamed_159_Query = (
  { __typename?: 'Query' }
  & { team?: Maybe<(
    { __typename?: 'Team' }
    & Pick<Team, 'id' | 'numMembersTotal' | 'invitationUrl'>
    & { members?: Maybe<(
      { __typename?: 'TeamMemberConnection' }
      & Pick<TeamMemberConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'TeamMemberEdge' }
        & { node?: Maybe<(
          { __typename?: 'TeamMember' }
          & Pick<TeamMember, 'id' | 'role' | 'isPrimaryUser'>
          & { user: (
            { __typename?: 'EnterpriseUser' }
            & Pick<EnterpriseUser, 'id' | 'fullName' | 'email' | 'avatar' | 'dateJoined'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_160_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_160_Query = (
  { __typename?: 'Query' }
  & { team?: Maybe<(
    { __typename?: 'Team' }
    & Pick<Team, 'id' | 'login' | 'syncPermissionsWithVcs'>
    & { basePermissionSet?: Maybe<(
      { __typename?: 'TeamBasePermissionSet' }
      & Pick<TeamBasePermissionSet, 'id' | 'defaultRepositoryPermission' | 'canMembersIgnoreIssues' | 'canContributorsIgnoreIssues' | 'canMembersModifyMetricThresholds' | 'canContributorsModifyMetricThresholds'>
      & { team: (
        { __typename?: 'Team' }
        & Pick<Team, 'id'>
      ) }
    )> }
  )> }
);

export type Unnamed_161_QueryVariables = Exact<{
  shortcode: Scalars['String'];
}>;


export type Unnamed_161_Query = (
  { __typename?: 'Query' }
  & { transformer?: Maybe<(
    { __typename?: 'TransformerTool' }
    & Pick<TransformerTool, 'name'>
    & { analyzer?: Maybe<(
      { __typename?: 'Analyzer' }
      & Pick<Analyzer, 'shortcode'>
    )> }
  )> }
);

export type Unnamed_162_QueryVariables = Exact<{
  shortcode: Scalars['String'];
}>;


export type Unnamed_162_Query = (
  { __typename?: 'Query' }
  & { transformer?: Maybe<(
    { __typename?: 'TransformerTool' }
    & Pick<TransformerTool, 'id' | 'name' | 'descriptionRendered' | 'updatedOn' | 'language' | 'version' | 'shortcode' | 'publishedOn' | 'logo' | 'owner' | 'documentationUrl' | 'discussUrl' | 'exampleConfig'>
    & { analyzer?: Maybe<(
      { __typename?: 'Analyzer' }
      & Pick<Analyzer, 'shortcode'>
    )> }
  )> }
);

export type Unnamed_163_QueryVariables = Exact<{
  q?: Maybe<Scalars['String']>;
}>;


export type Unnamed_163_Query = (
  { __typename?: 'Query' }
  & { transformers?: Maybe<(
    { __typename?: 'TransformerToolConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'TransformerToolEdge' }
      & { node?: Maybe<(
        { __typename?: 'TransformerTool' }
        & Pick<TransformerTool, 'name' | 'owner' | 'descriptionRendered' | 'updatedOn' | 'language' | 'version' | 'shortcode' | 'publishedOn' | 'logo' | 'createdAt'>
        & { analyzer?: Maybe<(
          { __typename?: 'Analyzer' }
          & Pick<Analyzer, 'analyzerLogo'>
        )> }
      )> }
    )>> }
  )> }
);

export type Unnamed_164_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_164_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'connectedVcsProviders' | 'fullName' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'lastLogin' | 'isActive' | 'isAsgardian' | 'isStaff' | 'dashboardContext' | 'availableCredits' | 'missiveUserHash' | 'dateJoined'>
    & { primaryOwner?: Maybe<(
      { __typename?: 'Owner' }
      & Pick<Owner, 'id' | 'login' | 'vcsProvider' | 'billingEmail'>
    )> }
  )> }
);

export type Unnamed_165_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_165_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { recommendedIssues?: Maybe<(
      { __typename?: 'RepositoryIssueConnection' }
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryIssueEdge' }
        & { node?: Maybe<(
          { __typename?: 'RepositoryIssue' }
          & Pick<RepositoryIssue, 'id' | 'title' | 'shortcode' | 'issueType' | 'modifiedAt' | 'createdAt' | 'seenIn' | 'occurrenceCount' | 'autofixAvailable' | 'pastValue' | 'raisedInFiles'>
          & { repositoryInstance: (
            { __typename?: 'Repository' }
            & Pick<Repository, 'id' | 'name' | 'vcsProvider'>
            & { owner: (
              { __typename?: 'Owner' }
              & Pick<Owner, 'id' | 'login'>
            ) }
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type ViewerStarredReposQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerStarredReposQuery = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { preference?: Maybe<(
      { __typename?: 'UserPreference' }
      & { starredRepositories: (
        { __typename?: 'RepositoryConnection' }
        & { edges: Array<Maybe<(
          { __typename?: 'RepositoryEdge' }
          & { node?: Maybe<(
            { __typename?: 'Repository' }
            & Pick<Repository, 'id' | 'name' | 'vcsProvider' | 'ownerLogin' | 'lastAnalyzedAt' | 'isActivated' | 'isFork' | 'isPrivate' | 'supportedAnalyzers'>
            & { owner: (
              { __typename?: 'Owner' }
              & Pick<Owner, 'id' | 'login'>
            ), availableAnalyzers?: Maybe<(
              { __typename?: 'AnalyzerConnection' }
              & { edges: Array<Maybe<(
                { __typename?: 'AnalyzerEdge' }
                & { node?: Maybe<(
                  { __typename?: 'Analyzer' }
                  & Pick<Analyzer, 'id' | 'shortcode' | 'name' | 'logo' | 'analyzerLogo'>
                )> }
              )>> }
            )> }
          )> }
        )>> }
      ) }
    )> }
  )> }
);

export type Unnamed_166_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_166_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id'>
    & { gsrProjects?: Maybe<Array<Maybe<(
      { __typename?: 'GSRProject' }
      & Pick<GsrProject, 'login' | 'name' | 'isSetupPending' | 'hasInstalled'>
    )>>> }
  )> }
);

export type Unnamed_167_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_167_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'gitlabAccounts'>
  )> }
);
