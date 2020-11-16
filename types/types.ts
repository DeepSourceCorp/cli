export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  UUID: any;
  JSONString: any;
  GenericScalar: any;
  SocialCamelJSON: any;
  Date: any;
};

export enum ActionChoice {
  Add = 'ADD',
  Remove = 'REMOVE'
}

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

export type Analyzer = Node & {
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
  owner?: Maybe<Scalars['String']>;
  isPrimary: Scalars['Boolean'];
  starIssues: IssueConnection;
  exampleConfig?: Maybe<Scalars['String']>;
  issues: IssueConnection;
  reviews: AnalyzerReviewConnection;
  checks: CheckConnection;
  repositories: RepositoryConnection;
  userSet: UserConnection;
  autofixRuns: AutofixRunConnection;
  transformertoolSet: TransformerToolConnection;
  transformerRuns: TransformerRunConnection;
  analyzerLogo?: Maybe<Scalars['String']>;
  publishedOn?: Maybe<Scalars['Date']>;
  updatedOn?: Maybe<Scalars['Date']>;
  issuesCount?: Maybe<Scalars['Int']>;
  autofixableIssuesCount?: Maybe<Scalars['Int']>;
  issueDistribution?: Maybe<Scalars['GenericScalar']>;
};


export type AnalyzerStarIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
};


export type AnalyzerIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
};


export type AnalyzerReviewsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type AnalyzerChecksArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type AnalyzerRepositoriesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
};


export type AnalyzerUserSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type AnalyzerAutofixRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type AnalyzerTransformertoolSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
};


export type AnalyzerTransformerRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};

export enum AnalyzerAnalyzerType {
  Core = 'CORE',
  Community = 'COMMUNITY',
  Custom = 'CUSTOM'
}

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

export type AnalyzerReview = Node & {
  __typename?: 'AnalyzerReview';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
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
  ownerId: Scalars['Int'];
  amount: Scalars['Int'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type ApplyCreditsToOwnerPayload = {
  __typename?: 'ApplyCreditsToOwnerPayload';
  ok?: Maybe<Scalars['Boolean']>;
  availableCredits?: Maybe<Scalars['Int']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type AutofixableIssueDetail = {
  __typename?: 'AutofixableIssueDetail';
  shortcode?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  category?: Maybe<Scalars['String']>;
  occurrenceCount?: Maybe<Scalars['Int']>;
};

export type AutofixRun = Node & {
  __typename?: 'AutofixRun';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  runId: Scalars['UUID'];
  commitOid?: Maybe<Scalars['String']>;
  status: AutofixRunStatus;
  finishedAt?: Maybe<Scalars['DateTime']>;
  errors?: Maybe<Scalars['JSONString']>;
  config?: Maybe<Scalars['JSONString']>;
  resolvedIssues?: Maybe<Scalars['Int']>;
  resolvedIssuesMetadata: Scalars['JSONString'];
  pullRequestNumber?: Maybe<Scalars['Int']>;
  pullRequestStatus: AutofixRunPullRequestStatus;
  committedToBranchStatus: AutofixRunCommittedToBranchStatus;
  extraData: Scalars['JSONString'];
  createdBy?: Maybe<User>;
  issue?: Maybe<Issue>;
  analyzer?: Maybe<Analyzer>;
  repository: Repository;
  checkIssues: CheckIssueConnection;
  filesAffected?: Maybe<Scalars['Int']>;
  issuesAffected?: Maybe<Scalars['Int']>;
  changeset?: Maybe<Scalars['GenericScalar']>;
  finishedIn?: Maybe<Scalars['Int']>;
  vcsPrUrl?: Maybe<Scalars['String']>;
  resolvedIssuesCount?: Maybe<Scalars['Int']>;
  gitCompareDisplay?: Maybe<Scalars['String']>;
  isGeneratedFromPr?: Maybe<Scalars['Boolean']>;
  pullRequestTitle?: Maybe<Scalars['String']>;
};


export type AutofixRunCheckIssuesArgs = {
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
  Ctb = 'CTB'
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
  Prc = 'PRC'
}

export enum AutofixRunStatus {
  Pend = 'PEND',
  Pass = 'PASS',
  Timo = 'TIMO',
  Cncl = 'CNCL',
  Fail = 'FAIL'
}

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
};

export type CancelCodeQualitySubscriptionInput = {
  ownerId: Scalars['Int'];
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

export type Check = Node & {
  __typename?: 'Check';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
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
  githubCheckRunId?: Maybe<Scalars['Int']>;
  githubCheckSuiteId?: Maybe<Scalars['Int']>;
  repository: Repository;
  metricsCaptured?: Maybe<Array<Maybe<RepositoryMetricValue>>>;
  checkIssues: CheckIssueConnection;
  concreteIssues?: Maybe<IssueConnection>;
  finishedIn?: Maybe<Scalars['Int']>;
  finishedInDisplay?: Maybe<Scalars['String']>;
  issuesRaisedCount?: Maybe<Scalars['Int']>;
  issuesResolvedCount?: Maybe<Scalars['Int']>;
  autofixableIssues?: Maybe<Array<Maybe<AutofixableIssueDetail>>>;
  filesAffectedByAutofix?: Maybe<Scalars['Int']>;
};


export type CheckResolvedIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Scalars['String']>;
};


export type CheckCheckIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type CheckConcreteIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
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

export type CheckIssue = Node & {
  __typename?: 'CheckIssue';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
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
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Scalars['String']>;
};


export type CheckIssueAutofixRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
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
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CommitConfigToVcsPayload = {
  __typename?: 'CommitConfigToVCSPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CouponInfo = {
  __typename?: 'CouponInfo';
  currentCycleDiscount: Scalars['Float'];
  nextCycleDiscount: Scalars['Float'];
  isApplied: Scalars['Boolean'];
  description: Scalars['String'];
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

export type CreateUserFeedbackInput = {
  content: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreateUserFeedbackPayload = {
  __typename?: 'CreateUserFeedbackPayload';
  ok?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type CreditsInfo = {
  __typename?: 'CreditsInfo';
  currentCycleDiscount: Scalars['Float'];
  nextCycleDiscount: Scalars['Float'];
  isApplied: Scalars['Boolean'];
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

export type Discount = {
  __typename?: 'Discount';
  coupon?: Maybe<CouponInfo>;
  credits?: Maybe<CreditsInfo>;
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
  ownerId: Scalars['Int'];
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
  ownerId: Scalars['Int'];
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

export type Invitee = {
  email: Scalars['String'];
  role: TeamMemberRoleChoices;
};

export enum InviteTeamMemberActionChoice {
  Create = 'CREATE',
  Cancel = 'CANCEL'
}

export type InviteTeamMemberInput = {
  ownerId: Scalars['Int'];
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

export type Invoice = {
  __typename?: 'Invoice';
  invoiceId?: Maybe<Scalars['String']>;
  date?: Maybe<Scalars['DateTime']>;
  amount?: Maybe<Scalars['Float']>;
  url?: Maybe<Scalars['String']>;
};

export type Issue = Node & {
  __typename?: 'Issue';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  shortcode: Scalars['String'];
  title: Scalars['String'];
  description: Scalars['String'];
  severity: IssueSeverity;
  analyzer: Analyzer;
  autofixAvailable: Scalars['Boolean'];
  autofixTitle?: Maybe<Scalars['String']>;
  isRecommended: Scalars['Boolean'];
  starIssueInAnalyzers: AnalyzerConnection;
  checkIssues: CheckIssueConnection;
  autofixRuns: AutofixRunConnection;
  occurrenceCount?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  seenIn?: Maybe<Scalars['String']>;
  descriptionRendered?: Maybe<Scalars['String']>;
};


export type IssueStarIssueInAnalyzersArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
};


export type IssueCheckIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type IssueAutofixRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
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


export type Mutation = {
  __typename?: 'Mutation';
  socialAuth?: Maybe<SocialAuthJwt>;
  toggleRepositoryActivation?: Maybe<ToggleRepositoryActivationPayload>;
  createUserFeedback?: Maybe<CreateUserFeedbackPayload>;
  updateRepositorySettings?: Maybe<UpdateRepositorySettingsPayload>;
  updateOwnerSettings?: Maybe<UpdateOwnerSettingsPayload>;
  getBillingInfo?: Maybe<GetBillingInfoPayload>;
  ignoreIssueForRepository?: Maybe<IgnoreIssueForRepositoryPayload>;
  ignoreIssueForFilePatternInRepository?: Maybe<IgnoreIssueForFilePatternInRepositoryPayload>;
  ignoreIssueForTestPatternsInRepository?: Maybe<IgnoreIssueForTestPatternsInRepositoryPayload>;
  reportIssueFalsePositive?: Maybe<ReportIssueFalsePositivePayload>;
  ignoreCheckIssue?: Maybe<IgnoreCheckIssuePayload>;
  generateKeyPairForRepository?: Maybe<GenerateKeyPairForRepositoryPayload>;
  updateRepositoryWidgets?: Maybe<UpdateRepositoryWidgetsPayload>;
  deleteSilenceRule?: Maybe<DeleteSilenceRulePayload>;
  updateDefaultDashboardContextForUser?: Maybe<UpdateDefaultDashboardContextForUserPayload>;
  updateBillingInfo?: Maybe<UpdateBillingInfoPayload>;
  updateDefaultPaymentSource?: Maybe<UpdateDefaultPaymentSourcePayload>;
  cancelCodeQualitySubscription?: Maybe<CancelCodeQualitySubscriptionPayload>;
  updateCodeQualitySubscriptionSeats?: Maybe<UpdateCodeQualitySubscriptionSeatsPayload>;
  getUpgradeCodeQualitySubscriptionPlanInfo?: Maybe<GetUpgradeCodeQualitySubscriptionPlanInfoPayload>;
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
  commitChangesToPr?: Maybe<CommitChangesToPrPayload>;
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
};


export type MutationSocialAuthArgs = {
  accessToken: Scalars['String'];
  provider: Scalars['String'];
};


export type MutationToggleRepositoryActivationArgs = {
  input: ToggleRepositoryActivationInput;
};


export type MutationCreateUserFeedbackArgs = {
  input: CreateUserFeedbackInput;
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


export type MutationCommitChangesToPrArgs = {
  input: CommitChangesToPrInput;
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

export type Node = {
  id: Scalars['ID'];
};

export type Owner = Node & {
  __typename?: 'Owner';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  login: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  vcsProvider: OwnerVcsProvider;
  vcsAccountUid: Scalars['String'];
  plan?: Maybe<OwnerPlan>;
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
  customerId?: Maybe<Scalars['String']>;
  primaryUser?: Maybe<User>;
  analyzers: AnalyzerConnection;
  team?: Maybe<Team>;
  repositories?: Maybe<RepositoryConnection>;
  userSet: UserConnection;
  ownerSetting?: Maybe<OwnerSetting>;
  isTeam?: Maybe<Scalars['Boolean']>;
  cards?: Maybe<Scalars['GenericScalar']>;
  stripeInvoices?: Maybe<Scalars['GenericScalar']>;
  numMembersTotal?: Maybe<Scalars['Int']>;
  billingInfo?: Maybe<BillingInfo>;
  activeCard?: Maybe<Card>;
  hasPremiumPlan?: Maybe<Scalars['Boolean']>;
  planUpgradeUrl?: Maybe<Scalars['String']>;
  isViewerPrimaryUser?: Maybe<Scalars['Boolean']>;
  setting?: Maybe<OwnerSetting>;
  hasGrantedAllRepoAccess?: Maybe<Scalars['Boolean']>;
  appConfigurationUrl?: Maybe<Scalars['String']>;
};


export type OwnerAnalyzersArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
};


export type OwnerRepositoriesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
};


export type OwnerUserSetArgs = {
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

export type OwnerSetting = Node & {
  __typename?: 'OwnerSetting';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  owner: Owner;
  issueTypeSettings?: Maybe<Array<Maybe<IssueTypeSetting>>>;
};

export enum OwnerVcsProvider {
  Gh = 'GH',
  Bb = 'BB',
  Gl = 'GL'
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
  transformer?: Maybe<TransformerTool>;
  transformers?: Maybe<TransformerToolConnection>;
  transformerRun: TransformerRun;
  autofixRun: AutofixRun;
  issue?: Maybe<Issue>;
  transactions?: Maybe<TransactionConnection>;
  owner?: Maybe<Owner>;
  team?: Maybe<Team>;
  checkIssues?: Maybe<CheckIssueConnection>;
  check: Check;
  analyzer?: Maybe<Analyzer>;
  analyzers?: Maybe<AnalyzerConnection>;
  viewer?: Maybe<User>;
  repositoryIssues?: Maybe<RepositoryIssueConnection>;
  repository?: Maybe<Repository>;
  trendingRepositories?: Maybe<RepositoryConnection>;
  node?: Maybe<Node>;
};


export type QueryTransformerArgs = {
  shortcode: Scalars['String'];
};


export type QueryTransformersArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  language?: Maybe<Scalars['String']>;
};


export type QueryTransformerRunArgs = {
  runId: Scalars['String'];
};


export type QueryAutofixRunArgs = {
  runId: Scalars['String'];
};


export type QueryIssueArgs = {
  shortcode: Scalars['String'];
};


export type QueryTransactionsArgs = {
  userId: Scalars['Int'];
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


export type QueryCheckIssuesArgs = {
  checkId: Scalars['ID'];
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
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
};


export type QueryRepositoryIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Scalars['String']>;
};


export type QueryRepositoryArgs = {
  name: Scalars['String'];
  owner: Scalars['String'];
  provider: VcsProviderChoices;
};


export type QueryTrendingRepositoriesArgs = {
  count?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
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

export type RemoveTeamMemberInput = {
  ownerId: Scalars['Int'];
  memberEmail: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RemoveTeamMemberPayload = {
  __typename?: 'RemoveTeamMemberPayload';
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

export type Repository = Node & {
  __typename?: 'Repository';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  name: Scalars['String'];
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
  supportedAnalyzers?: Maybe<Scalars['GenericScalar']>;
  token: Scalars['String'];
  extraData: Scalars['JSONString'];
  checks: CheckConnection;
  autofixRuns?: Maybe<AutofixRunConnection>;
  transformerRuns?: Maybe<TransformerRunConnection>;
  runs?: Maybe<RunConnection>;
  repositorycollaboratorSet: RepositoryCollaboratorConnection;
  silenceRules?: Maybe<SilenceRuleConnection>;
  ownerLogin?: Maybe<Scalars['String']>;
  canBeActivated?: Maybe<Scalars['Boolean']>;
  lastAnalyzedAt?: Maybe<Scalars['DateTime']>;
  blobUrlRoot?: Maybe<Scalars['String']>;
  fullName?: Maybe<Scalars['String']>;
  activityModality?: Maybe<Scalars['String']>;
  issueTypeSettings?: Maybe<Array<Maybe<IssueTypeSetting>>>;
  widgetsDisplay?: Maybe<Scalars['GenericScalar']>;
  isAutofixEnabled?: Maybe<Scalars['Boolean']>;
  isCommitPossible?: Maybe<Scalars['Boolean']>;
  vcsHost?: Maybe<Scalars['String']>;
  configGenerationRoute?: Maybe<Scalars['String']>;
  activeIssueCount?: Maybe<Scalars['Int']>;
  primaryAnalyzer?: Maybe<Analyzer>;
  issue?: Maybe<RepositoryIssue>;
  autofixRun?: Maybe<AutofixRun>;
  transformerRun?: Maybe<TransformerRun>;
  run?: Maybe<Run>;
  hasViewerEditAccess?: Maybe<Scalars['Boolean']>;
  viewerPermission?: Maybe<RepositoryPermissionChoices>;
  autofixGithubAppInstallationUrl?: Maybe<Scalars['String']>;
  autofixBitbucketAddonInstallationUrl?: Maybe<Scalars['String']>;
  addableMembers?: Maybe<TeamMemberConnection>;
};


export type RepositoryCollaboratorsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
};


export type RepositoryIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Scalars['String']>;
};


export type RepositoryChecksArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type RepositoryAutofixRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryTransformerRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type RepositoryRepositorycollaboratorSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
};


export type RepositorySilenceRulesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  silenceLevel?: Maybe<Scalars['String']>;
};


export type RepositoryIssueArgs = {
  shortcode: Scalars['String'];
};


export type RepositoryAutofixRunArgs = {
  runId: Scalars['String'];
};


export type RepositoryTransformerRunArgs = {
  runId: Scalars['String'];
};


export type RepositoryRunArgs = {
  runId: Scalars['String'];
};


export type RepositoryAddableMembersArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};

export type RepositoryCollaborator = Node & {
  __typename?: 'RepositoryCollaborator';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  repository: Repository;
  user: User;
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

export type RepositoryIssue = Node & {
  __typename?: 'RepositoryIssue';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  repositoryInstance: Repository;
  checkIssues: CheckIssueConnection;
  shouldIgnore: Scalars['Boolean'];
  severity: RepositoryIssueSeverityChoices;
  lastSeen?: Maybe<Scalars['DateTime']>;
  checkSet: CheckConnection;
  userSet: UserConnection;
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
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  shortcode?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
};


export type RepositoryIssueCheckSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type RepositoryIssueUserSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
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

export enum RepositoryIssueSeverityChoices {
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR'
}

export type RepositoryMetricValue = Node & {
  __typename?: 'RepositoryMetricValue';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  value: Scalars['Float'];
  extraData: Scalars['JSONString'];
  commitOid: Scalars['String'];
  checkInstance: Check;
  branchName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  valueDisplay?: Maybe<Scalars['String']>;
  isPassing?: Maybe<Scalars['Boolean']>;
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
  ownerId: Scalars['Int'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type RevertSubscriptionCancellationPayload = {
  __typename?: 'RevertSubscriptionCancellationPayload';
  ok?: Maybe<Scalars['Boolean']>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type Run = Node & {
  __typename?: 'Run';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  runId: Scalars['UUID'];
  status: RunStatus;
  branchName?: Maybe<Scalars['String']>;
  baseOid?: Maybe<Scalars['String']>;
  commitOid?: Maybe<Scalars['String']>;
  finishedAt?: Maybe<Scalars['DateTime']>;
  errorMeta?: Maybe<Scalars['JSONString']>;
  config?: Maybe<Scalars['GenericScalar']>;
  extraData: Scalars['JSONString'];
  repository: Repository;
  checks: CheckConnection;
  finishedIn?: Maybe<Scalars['Int']>;
  vcsCommitUrl?: Maybe<Scalars['String']>;
  gitCompareDisplay?: Maybe<Scalars['String']>;
  pullRequestNumberDisplay?: Maybe<Scalars['String']>;
  issuesRaisedCount?: Maybe<Scalars['Int']>;
  issuesResolvedNum?: Maybe<Scalars['Int']>;
  isForDefaultBranch?: Maybe<Scalars['Boolean']>;
};


export type RunChecksArgs = {
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

export type SilenceRule = Node & {
  __typename?: 'SilenceRule';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  silenceLevel: SilenceRuleSilenceLevel;
  filePath?: Maybe<Scalars['String']>;
  repository: Repository;
  issue: Issue;
  creator?: Maybe<User>;
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
};


export type SocialNode = Node & {
  __typename?: 'SocialNode';
  id: Scalars['ID'];
  user: User;
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
  user: User;
  provider: Scalars['String'];
  uid: Scalars['String'];
  extraData?: Maybe<Scalars['SocialCamelJSON']>;
  created: Scalars['DateTime'];
  modified: Scalars['DateTime'];
};

export enum SubscriptionStatusChoice {
  Trial = 'TRIAL',
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  PastDue = 'PAST_DUE'
}

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

export type Team = Node & {
  __typename?: 'Team';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  login: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  vcsProvider: OwnerVcsProvider;
  vcsAccountUid: Scalars['String'];
  plan?: Maybe<OwnerPlan>;
  billingEmail?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<Scalars['String']>;
  customerId?: Maybe<Scalars['String']>;
  primaryUser?: Maybe<User>;
  ownerPtr: Owner;
  name: Scalars['String'];
  members: UserConnection;
  invitationCode?: Maybe<Scalars['String']>;
  syncPermissionsWithVcs: Scalars['Boolean'];
  teammemberSet: TeamMemberConnection;
  teammemberinvitationSet: TeamMemberInvitationConnection;
  basePermissionSet?: Maybe<TeamBasePermissionSet>;
  billingDetails?: Maybe<Scalars['GenericScalar']>;
  numMembersTotal?: Maybe<Scalars['Int']>;
  isViewerPrimaryUser?: Maybe<Scalars['Boolean']>;
  teamMembers?: Maybe<TeamMemberConnection>;
  invites?: Maybe<TeamMemberInvitationConnection>;
  invitationUrl?: Maybe<Scalars['String']>;
};


export type TeamMembersArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type TeamTeammemberSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};


export type TeamTeammemberinvitationSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type TeamTeamMembersArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};


export type TeamInvitesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};

export type TeamBasePermissionSet = Node & {
  __typename?: 'TeamBasePermissionSet';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
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
};

export type TeamEdge = {
  __typename?: 'TeamEdge';
  node?: Maybe<Team>;
  cursor: Scalars['String'];
};

export type TeamMember = Node & {
  __typename?: 'TeamMember';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  role?: Maybe<TeamMemberRoleChoices>;
  team: Team;
  user: User;
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

export type TeamMemberInvitation = Node & {
  __typename?: 'TeamMemberInvitation';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  role?: Maybe<TeamMemberRoleChoices>;
  id: Scalars['ID'];
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

export type Transaction = Node & {
  __typename?: 'Transaction';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  transactionType: TransactionTransactionType;
  amount: Scalars['Int'];
  user: User;
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

export type TransformerReview = Node & {
  __typename?: 'TransformerReview';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
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

export type TransformerRun = Node & {
  __typename?: 'TransformerRun';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
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
  commitStatus?: Maybe<Scalars['Boolean']>;
  createdCommitOid?: Maybe<Scalars['String']>;
  extraData: Scalars['JSONString'];
  repository: Repository;
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
};

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
  Prm = 'PRM'
}

export enum TransformerRunStatus {
  Pend = 'PEND',
  Pass = 'PASS',
  Empt = 'EMPT',
  Timo = 'TIMO',
  Fail = 'FAIL'
}

export type TransformerTool = Node & {
  __typename?: 'TransformerTool';
  createdAt: Scalars['DateTime'];
  modifiedAt: Scalars['DateTime'];
  alive?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
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
  language?: Maybe<Scalars['String']>;
  publishedOn?: Maybe<Scalars['Date']>;
  updatedOn?: Maybe<Scalars['Date']>;
  owner?: Maybe<Scalars['String']>;
};


export type TransformerToolTransformerRunsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type TransformerToolReviewsArgs = {
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

export type TriggerAnalysisForRepositoryInput = {
  repoId: Scalars['ID'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type TriggerAnalysisForRepositoryPayload = {
  __typename?: 'TriggerAnalysisForRepositoryPayload';
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

export type UpdateBillingInfoInput = {
  ownerId: Scalars['Int'];
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
  ownerId: Scalars['Int'];
  seats: Scalars['Int'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type UpdateCodeQualitySubscriptionSeatsPayload = {
  __typename?: 'UpdateCodeQualitySubscriptionSeatsPayload';
  ok?: Maybe<Scalars['Boolean']>;
  totalSeats?: Maybe<Scalars['Int']>;
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
  ownerId: Scalars['Int'];
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
  issueTypeSettings: Array<Maybe<IssueTypeSettingInput>>;
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
  ownerId: Scalars['Int'];
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

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  isStaff: Scalars['Boolean'];
  isActive: Scalars['Boolean'];
  dateJoined: Scalars['DateTime'];
  email: Scalars['String'];
  primaryOwner?: Maybe<Owner>;
  avatar?: Maybe<Scalars['String']>;
  preferredTechnologies: AnalyzerConnection;
  bookmarkedIssues: RepositoryIssueConnection;
  socialAuth: SocialNodeConnection;
  primaryOwnerships: OwnerConnection;
  teams: TeamConnection;
  teamMemberships: TeamMemberConnection;
  repositorySet: RepositoryConnection;
  transactions: TransactionConnection;
  autofixrunSet: AutofixRunConnection;
  repositorycollaboratorSet: RepositoryCollaboratorConnection;
  silenceRulesCreated: SilenceRuleConnection;
  fullName?: Maybe<Scalars['String']>;
  availableCredits?: Maybe<Scalars['Float']>;
  referralUrl?: Maybe<Scalars['String']>;
  repositories?: Maybe<RepositoryConnection>;
  bookmarkedIssueCount?: Maybe<Scalars['Int']>;
};


export type UserPreferredTechnologiesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  categoryIn?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
};


export type UserBookmarkedIssuesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  severity?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
  severityIn?: Maybe<Scalars['String']>;
};


export type UserSocialAuthArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  uid?: Maybe<Scalars['String']>;
  uid_In?: Maybe<Scalars['String']>;
  provider?: Maybe<Scalars['String']>;
  provider_In?: Maybe<Scalars['String']>;
};


export type UserPrimaryOwnershipsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type UserTeamsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type UserTeamMembershipsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};


export type UserRepositorySetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
};


export type UserTransactionsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  transactionType?: Maybe<Scalars['String']>;
};


export type UserAutofixrunSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
};


export type UserRepositorycollaboratorSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  q?: Maybe<Scalars['String']>;
  permission?: Maybe<Scalars['String']>;
};


export type UserSilenceRulesCreatedArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  silenceLevel?: Maybe<Scalars['String']>;
};


export type UserRepositoriesArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name_Icontains?: Maybe<Scalars['String']>;
  vcsProvider?: Maybe<Scalars['String']>;
  isPrivate?: Maybe<Scalars['Boolean']>;
  isActivated?: Maybe<Scalars['Boolean']>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  pageInfo: PageInfo;
  edges: Array<Maybe<UserEdge>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  node?: Maybe<User>;
  cursor: Scalars['String'];
};


export enum VcsProviderChoices {
  Github = 'GITHUB',
  Bitbucket = 'BITBUCKET',
  Gitlab = 'GITLAB'
}

export type Unnamed_1_MutationVariables = Exact<{
  input: UpdateOwnerSettingsInput;
}>;


export type Unnamed_1_Mutation = (
  { __typename?: 'Mutation' }
  & { updateOwnerSettings?: Maybe<(
    { __typename?: 'UpdateOwnerSettingsPayload' }
    & Pick<UpdateOwnerSettingsPayload, 'ok'>
  )> }
);

export type Unnamed_2_MutationVariables = Exact<{
  input: CommitConfigToVcsInput;
}>;


export type Unnamed_2_Mutation = (
  { __typename?: 'Mutation' }
  & { commitConfigToVcs?: Maybe<(
    { __typename?: 'CommitConfigToVCSPayload' }
    & Pick<CommitConfigToVcsPayload, 'ok'>
  )> }
);

export type SocialAuthMutationVariables = Exact<{
  provider: Scalars['String'];
  accessToken: Scalars['String'];
}>;


export type SocialAuthMutation = (
  { __typename?: 'Mutation' }
  & { socialAuth?: Maybe<(
    { __typename?: 'SocialAuthJWT' }
    & Pick<SocialAuthJwt, 'token'>
    & { social?: Maybe<(
      { __typename?: 'SocialType' }
      & Pick<SocialType, 'uid'>
      & { user: (
        { __typename?: 'User' }
        & Pick<User, 'fullName'>
      ) }
    )> }
  )> }
);

export type Unnamed_3_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_3_Query = (
  { __typename?: 'Query' }
  & { analyzers?: Maybe<(
    { __typename?: 'AnalyzerConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'AnalyzerEdge' }
      & { node?: Maybe<(
        { __typename?: 'Analyzer' }
        & Pick<Analyzer, 'id' | 'name' | 'shortcode'>
      )> }
    )>> }
  )> }
);

export type Unnamed_4_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
}>;


export type Unnamed_4_Query = (
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

export type Unnamed_5_QueryVariables = Exact<{
  name: Scalars['String'];
  owner: Scalars['String'];
  provider: VcsProviderChoices;
  q: Scalars['String'];
}>;


export type Unnamed_5_Query = (
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
          & Pick<TeamMember, 'role' | 'isPrimaryUser'>
          & { user: (
            { __typename?: 'User' }
            & Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'dateJoined'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_6_QueryVariables = Exact<{
  repositoryId: Scalars['ID'];
}>;


export type Unnamed_6_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'TransformerTool' } | { __typename?: 'Analyzer' } | { __typename?: 'Issue' } | { __typename?: 'CheckIssue' } | { __typename?: 'Check' } | { __typename?: 'Run' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'defaultBranchName' | 'hasViewerEditAccess' | 'vcsUrl' | 'vcsHost' | 'supportedAnalyzers' | 'isCommitPossible' | 'isAutofixEnabled' | 'autofixGithubAppInstallationUrl'>
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'User' } | { __typename?: 'Owner' } | { __typename?: 'Team' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'OwnerSetting' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'SilenceRule' } | { __typename?: 'SocialNode' } | { __typename?: 'Transaction' } | { __typename?: 'AutofixRun' } | { __typename?: 'TransformerRun' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'TransformerReview' }> }
);

export type Unnamed_7_QueryVariables = Exact<{
  repositoryId: Scalars['ID'];
}>;


export type Unnamed_7_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'TransformerTool' } | { __typename?: 'Analyzer' } | { __typename?: 'Issue' } | { __typename?: 'CheckIssue' } | { __typename?: 'Check' } | { __typename?: 'Run' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'name' | 'defaultBranchName' | 'hasViewerEditAccess' | 'vcsUrl' | 'vcsHost' | 'supportedAnalyzers' | 'isCommitPossible' | 'isAutofixEnabled' | 'autofixGithubAppInstallationUrl'>
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'User' } | { __typename?: 'Owner' } | { __typename?: 'Team' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'OwnerSetting' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'SilenceRule' } | { __typename?: 'SocialNode' } | { __typename?: 'Transaction' } | { __typename?: 'AutofixRun' } | { __typename?: 'TransformerRun' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'TransformerReview' }> }
);

export type Unnamed_8_QueryVariables = Exact<{
  repositoryId: Scalars['ID'];
  shortcode: Scalars['String'];
}>;


export type Unnamed_8_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'TransformerTool' } | { __typename?: 'Analyzer' } | { __typename?: 'Issue' } | { __typename?: 'CheckIssue' } | { __typename?: 'Check' } | { __typename?: 'Run' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'config' | 'blobUrlRoot' | 'vcsProvider' | 'hasViewerEditAccess'>
    & { issue?: Maybe<(
      { __typename?: 'RepositoryIssue' }
      & Pick<RepositoryIssue, 'id' | 'descriptionRendered' | 'issueType' | 'title' | 'shortcode' | 'firstSeen' | 'lastSeen' | 'occurrenceCount' | 'analyzerName' | 'analyzerShortcode' | 'analyzerLogo' | 'autofixAvailable' | 'newVcsIssueUrl'>
      & { silenceRules?: Maybe<Array<Maybe<(
        { __typename?: 'SilenceRule' }
        & Pick<SilenceRule, 'silenceLevel' | 'id' | 'filePath' | 'createdAt' | 'metadata'>
        & { creator?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'firstName' | 'lastName' | 'email' | 'avatar'>
        )> }
      )>>> }
    )> }
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'User' } | { __typename?: 'Owner' } | { __typename?: 'Team' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'OwnerSetting' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'SilenceRule' } | { __typename?: 'SocialNode' } | { __typename?: 'Transaction' } | { __typename?: 'AutofixRun' } | { __typename?: 'TransformerRun' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'TransformerReview' }> }
);

export type Unnamed_9_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
  analyzer?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  q?: Maybe<Scalars['String']>;
}>;


export type Unnamed_9_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'defaultBranchName' | 'ownerLogin' | 'name' | 'id' | 'hasViewerEditAccess' | 'config' | 'blobUrlRoot' | 'vcsProvider' | 'activityModality'>
    & { issues?: Maybe<(
      { __typename?: 'RepositoryIssueConnection' }
      & Pick<RepositoryIssueConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryIssueEdge' }
        & { node?: Maybe<(
          { __typename?: 'RepositoryIssue' }
          & Pick<RepositoryIssue, 'id' | 'issueType' | 'title' | 'shortcode' | 'description' | 'occurrenceCount' | 'createdAt' | 'analyzerName' | 'analyzerLogo' | 'seenIn' | 'firstSeen' | 'lastSeen' | 'pastValue' | 'autofixAvailable'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_10_QueryVariables = Exact<{
  repositoryId: Scalars['ID'];
  shortcode: Scalars['String'];
}>;


export type Unnamed_10_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'TransformerTool' } | { __typename?: 'Analyzer' } | { __typename?: 'Issue' } | { __typename?: 'CheckIssue' } | { __typename?: 'Check' } | { __typename?: 'Run' } | (
    { __typename?: 'Repository' }
    & { issue?: Maybe<(
      { __typename?: 'RepositoryIssue' }
      & Pick<RepositoryIssue, 'id' | 'raisedInFiles'>
    )> }
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'User' } | { __typename?: 'Owner' } | { __typename?: 'Team' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'OwnerSetting' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'SilenceRule' } | { __typename?: 'SocialNode' } | { __typename?: 'Transaction' } | { __typename?: 'AutofixRun' } | { __typename?: 'TransformerRun' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'TransformerReview' }> }
);

export type Unnamed_11_QueryVariables = Exact<{
  login: Scalars['String'];
  provider: VcsProviderChoices;
  isActivated?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
}>;


export type Unnamed_11_Query = (
  { __typename?: 'Query' }
  & { owner?: Maybe<(
    { __typename?: 'Owner' }
    & Pick<Owner, 'id' | 'hasPremiumPlan' | 'planUpgradeUrl'>
    & { repositories?: Maybe<(
      { __typename?: 'RepositoryConnection' }
      & Pick<RepositoryConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename?: 'RepositoryEdge' }
        & { node?: Maybe<(
          { __typename?: 'Repository' }
          & Pick<Repository, 'id' | 'name' | 'vcsProvider' | 'ownerLogin' | 'modifiedAt' | 'isActivated' | 'isFork' | 'isPrivate' | 'latestCommitOid' | 'defaultBranchName' | 'lastAnalyzedAt' | 'config' | 'canBeActivated' | 'supportedAnalyzers'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_12_QueryVariables = Exact<{
  q?: Maybe<Scalars['String']>;
}>;


export type Unnamed_12_Query = (
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

export type Unnamed_13_QueryVariables = Exact<{
  runId: Scalars['String'];
}>;


export type Unnamed_13_Query = (
  { __typename?: 'Query' }
  & { autofixRun: (
    { __typename?: 'AutofixRun' }
    & Pick<AutofixRun, 'id' | 'errors' | 'finishedIn' | 'issuesAffected' | 'committedToBranchStatus' | 'resolvedIssuesCount' | 'pullRequestStatus' | 'status' | 'changeset' | 'vcsPrUrl'>
  ) }
);

export type Unnamed_14_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_14_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename: 'Repository' }
    & Pick<Repository, 'id'>
    & { autofixRuns?: Maybe<(
      { __typename: 'AutofixRunConnection' }
      & Pick<AutofixRunConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename: 'AutofixRunEdge' }
        & { node?: Maybe<(
          { __typename: 'AutofixRun' }
          & Pick<AutofixRun, 'runId' | 'status' | 'filesAffected' | 'finishedIn' | 'isGeneratedFromPr' | 'gitCompareDisplay' | 'pullRequestTitle' | 'pullRequestNumber' | 'pullRequestStatus' | 'createdAt' | 'resolvedIssuesCount'>
          & { createdBy?: Maybe<(
            { __typename?: 'User' }
            & Pick<User, 'fullName' | 'avatar'>
          )>, analyzer?: Maybe<(
            { __typename?: 'Analyzer' }
            & Pick<Analyzer, 'name' | 'analyzerLogo'>
          )>, issue?: Maybe<(
            { __typename?: 'Issue' }
            & Pick<Issue, 'title' | 'issueType' | 'shortcode'>
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_15_QueryVariables = Exact<{
  runId: Scalars['String'];
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_15_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & { autofixRun?: Maybe<(
      { __typename?: 'AutofixRun' }
      & Pick<AutofixRun, 'runId' | 'status' | 'filesAffected' | 'isGeneratedFromPr' | 'gitCompareDisplay' | 'pullRequestTitle' | 'pullRequestNumber' | 'pullRequestStatus' | 'createdAt' | 'resolvedIssuesCount'>
      & { createdBy?: Maybe<(
        { __typename?: 'User' }
        & Pick<User, 'fullName' | 'avatar'>
      )>, analyzer?: Maybe<(
        { __typename?: 'Analyzer' }
        & Pick<Analyzer, 'name' | 'analyzerLogo'>
      )>, issue?: Maybe<(
        { __typename?: 'Issue' }
        & Pick<Issue, 'title' | 'issueType' | 'shortcode'>
      )> }
    )> }
  )> }
);

export type Unnamed_16_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  status?: Maybe<Scalars['String']>;
}>;


export type Unnamed_16_Query = (
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

export type Unnamed_17_QueryVariables = Exact<{
  checkId: Scalars['ID'];
}>;


export type Unnamed_17_Query = (
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

export type Unnamed_18_QueryVariables = Exact<{
  checkId: Scalars['ID'];
  q?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  sort?: Maybe<Scalars['String']>;
  issueType?: Maybe<Scalars['String']>;
}>;


export type Unnamed_18_Query = (
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
          & Pick<Issue, 'id' | 'issueType' | 'title' | 'seenIn' | 'shortcode' | 'occurrenceCount'>
        )> }
      )>> }
    )> }
  ) }
);

export type Unnamed_19_QueryVariables = Exact<{
  checkId: Scalars['ID'];
}>;


export type Unnamed_19_Query = (
  { __typename?: 'Query' }
  & { check: (
    { __typename?: 'Check' }
    & Pick<Check, 'id' | 'status' | 'checkSeq' | 'finishedInDisplay' | 'filesAffectedByAutofix' | 'errors' | 'issuesRaisedCount' | 'issuesResolvedCount'>
    & { autofixableIssues?: Maybe<Array<Maybe<(
      { __typename?: 'AutofixableIssueDetail' }
      & Pick<AutofixableIssueDetail, 'shortcode' | 'title' | 'category' | 'occurrenceCount'>
    )>>>, run: (
      { __typename?: 'Run' }
      & Pick<Run, 'isForDefaultBranch'>
    ), analyzer?: Maybe<(
      { __typename?: 'Analyzer' }
      & Pick<Analyzer, 'name' | 'description'>
    )>, metricsCaptured?: Maybe<Array<Maybe<(
      { __typename?: 'RepositoryMetricValue' }
      & Pick<RepositoryMetricValue, 'id' | 'name' | 'valueDisplay' | 'isPassing'>
    )>>>, concreteIssues?: Maybe<(
      { __typename?: 'IssueConnection' }
      & Pick<IssueConnection, 'totalCount'>
    )> }
  ) }
);

export type Unnamed_20_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_20_Query = (
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
          & Pick<Run, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'pullRequestNumberDisplay' | 'issuesRaisedCount' | 'issuesResolvedNum'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_21_QueryVariables = Exact<{
  runId: Scalars['String'];
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_21_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & { run?: Maybe<(
      { __typename?: 'Run' }
      & Pick<Run, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'vcsCommitUrl' | 'gitCompareDisplay' | 'pullRequestNumberDisplay' | 'issuesRaisedCount' | 'issuesResolvedNum'>
    )> }
  )> }
);

export type Unnamed_22_QueryVariables = Exact<{
  runId: Scalars['String'];
}>;


export type Unnamed_22_Query = (
  { __typename?: 'Query' }
  & { transformerRun: (
    { __typename?: 'TransformerRun' }
    & Pick<TransformerRun, 'errors' | 'pullRequestStatus' | 'status' | 'tools' | 'changedFilesCount' | 'commitStatus' | 'id' | 'changeset' | 'vcsPrUrl' | 'vcsCommitUrl'>
  ) }
);

export type Unnamed_23_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_23_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename: 'Repository' }
    & Pick<Repository, 'id'>
    & { transformerRuns?: Maybe<(
      { __typename: 'TransformerRunConnection' }
      & Pick<TransformerRunConnection, 'totalCount'>
      & { edges: Array<Maybe<(
        { __typename: 'TransformerRunEdge' }
        & { node?: Maybe<(
          { __typename: 'TransformerRun' }
          & Pick<TransformerRun, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'changedFilesCount' | 'tools' | 'commitStatus' | 'gitCompareDisplay' | 'pullRequestNumber' | 'vcsPrUrl'>
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_24_QueryVariables = Exact<{
  runId: Scalars['String'];
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_24_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & { transformerRun?: Maybe<(
      { __typename?: 'TransformerRun' }
      & Pick<TransformerRun, 'createdAt' | 'runId' | 'status' | 'branchName' | 'commitOid' | 'finishedIn' | 'changedFilesCount' | 'tools' | 'commitStatus' | 'gitCompareDisplay' | 'pullRequestNumber' | 'vcsPrUrl'>
    )> }
  )> }
);

export type Unnamed_25_QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type Unnamed_25_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'TransformerTool' } | { __typename?: 'Analyzer' } | { __typename?: 'Issue' } | { __typename?: 'CheckIssue' } | { __typename?: 'Check' } | { __typename?: 'Run' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'showInDiscover' | 'analyzeChangesetOnly' | 'defaultBranchName' | 'isSubmoduleEnabled' | 'config' | 'isActivated' | 'isPrivate'>
    & { issueTypeSettings?: Maybe<Array<Maybe<(
      { __typename?: 'IssueTypeSetting' }
      & Pick<IssueTypeSetting, 'name' | 'slug' | 'description' | 'isIgnoredInCheckStatus' | 'isIgnoredToDisplay'>
    )>>> }
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'User' } | { __typename?: 'Owner' } | { __typename?: 'Team' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'OwnerSetting' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'SilenceRule' } | { __typename?: 'SocialNode' } | { __typename?: 'Transaction' } | { __typename?: 'AutofixRun' } | { __typename?: 'TransformerRun' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'TransformerReview' }> }
);

export type Unnamed_26_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_26_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'hasViewerEditAccess'>
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
          ), creator?: Maybe<(
            { __typename?: 'User' }
            & Pick<User, 'firstName' | 'lastName' | 'email' | 'avatar'>
          )> }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_27_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
  q: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type Unnamed_27_Query = (
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
            { __typename?: 'User' }
            & Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'dateJoined'>
          ) }
        )> }
      )>> }
    )> }
  )> }
);

export type Unnamed_28_QueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type Unnamed_28_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<{ __typename?: 'TransformerTool' } | { __typename?: 'Analyzer' } | { __typename?: 'Issue' } | { __typename?: 'CheckIssue' } | { __typename?: 'Check' } | { __typename?: 'Run' } | (
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'encPublicKey'>
  ) | { __typename?: 'RepositoryCollaborator' } | { __typename?: 'User' } | { __typename?: 'Owner' } | { __typename?: 'Team' } | { __typename?: 'TeamMember' } | { __typename?: 'TeamMemberInvitation' } | { __typename?: 'TeamBasePermissionSet' } | { __typename?: 'OwnerSetting' } | { __typename?: 'RepositoryIssue' } | { __typename?: 'SilenceRule' } | { __typename?: 'SocialNode' } | { __typename?: 'Transaction' } | { __typename?: 'AutofixRun' } | { __typename?: 'TransformerRun' } | { __typename?: 'RepositoryMetricValue' } | { __typename?: 'AnalyzerReview' } | { __typename?: 'TransformerReview' }> }
);

export type Unnamed_29_QueryVariables = Exact<{
  provider: VcsProviderChoices;
  owner: Scalars['String'];
  name: Scalars['String'];
}>;


export type Unnamed_29_Query = (
  { __typename?: 'Query' }
  & { repository?: Maybe<(
    { __typename?: 'Repository' }
    & Pick<Repository, 'id' | 'widgets' | 'widgetsDisplay'>
  )> }
);

export type Unnamed_30_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_30_Query = (
  { __typename?: 'Query' }
  & { viewer?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'fullName' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'lastLogin' | 'isActive' | 'isStaff'>
    & { primaryOwner?: Maybe<(
      { __typename?: 'Owner' }
      & Pick<Owner, 'id' | 'login' | 'vcsProvider' | 'billingEmail'>
    )> }
  )> }
);
