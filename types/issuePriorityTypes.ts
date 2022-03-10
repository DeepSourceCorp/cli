import { IssuePriorityLevel } from './types'

export enum IssuePriorityTypes {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  NOOP = 'no priority',
  SET_PRIORITY = 'Set priority'
}

export enum IssuePriorityTypesVerbose {
  LOW = 'low priority',
  MEDIUM = 'medium priority',
  HIGH = 'high priority',
  NOOP = 'no priority',
  SET_PRIORITY = 'Set priority'
}

export const IssuePriorityLevelVerbose: Record<IssuePriorityLevel, string> = {
  [IssuePriorityLevel.Repository]: "repository's settings",
  [IssuePriorityLevel.Owner]: "team's settings",
  [IssuePriorityLevel.Enterprise]: 'Enterprise Control Panel'
}
