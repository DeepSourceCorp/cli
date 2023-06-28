import { SupportTierChoices } from './types'

export enum SupportReqType {
  ACC_OR_BILL = 'Account or billing',
  SECURITY = 'Security',
  FP = 'False positive',
  BUG = 'Bug',
  FEATURE = 'New feature',
  FEEDBACK = 'Feedback',
  NOT_LISTED = 'Not listed'
}

export enum SupportReqFormType {
  COMMON,
  PER_TYPE
}

type BaseSupportComponent = {
  componentToRender: unknown
  bind: Record<string, unknown> | false
  handlers: Record<string, Function> | false
}

type CommonFormRender = {
  type: SupportReqFormType.COMMON
} & BaseSupportComponent

type PerTypeFormRender = { type: SupportReqFormType.PER_TYPE } & {
  [key in SupportTierChoices]: BaseSupportComponent
}

export type SupportFormT = CommonFormRender | PerTypeFormRender

export type SupportValidationData = {
  fromEmail: string
  ccEmails: string
  subject: string
  supportText: string
  supportHTML: string
}

export enum SupportPageStatusT {
  default,
  success,
  error
}
