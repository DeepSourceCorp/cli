import { RunStatus } from './types'

export type WSRepoAnalysisUpdatedPayload = {
  repository_id: string
  run_id: string
  is_for_default_branch: boolean
  branch_name: string
  status: RunStatus
}
