import { OwnerRepoCountsQuery } from './types'

export enum RepoStatusType {
  ACTIVATED = 'activated',
  INACTIVE = 'inactive',
  MONOREPO = 'monorepo'
}

export type OwnerRepoCountT = Pick<
  NonNullable<OwnerRepoCountsQuery['owner']>,
  'activeRepoCount' | 'inactiveRepoCount' | 'monorepoCount'
>
