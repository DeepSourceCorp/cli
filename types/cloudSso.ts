export enum SSO_SETUP_STATES {
  NEED_TO_UPGRADE = 'needToUpgrade',
  NEEDS_INFORMATION = 'needsInformation',
  VERIFICATION_IN_PROGRESS = 'verificationInProgress',
  VERIFICATION_COMPLETE = 'verificationComplete'
}

export interface LocalStoreDomainVerification {
  state: SSO_SETUP_STATES
  domainName: string
}
