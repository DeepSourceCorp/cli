import { GetterTree, MutationTree } from 'vuex'
import { RootState } from '~/store'

export interface IssuePreferencesInterface {
  issueTypes: Record<string, boolean>
}

export enum IssuePreferencesGetterTypes {
  ISSUE_TYPES = 'GET_ISSUE_TYPES'
}

export enum IssuePreferencesMutationTypes {
  UPDATE_ISSUE_TYPE = 'UPDATE_ISSUE_TYPE'
}

export const getters: GetterTree<IssuePreferencesInterface, RootState> = {
  [IssuePreferencesGetterTypes.ISSUE_TYPES]: (state) => state.issueTypes || {}
}

export const mutations: MutationTree<IssuePreferencesInterface> = {
  [IssuePreferencesMutationTypes.UPDATE_ISSUE_TYPE]: (
    state: IssuePreferencesInterface,
    issue: Record<string, boolean>
  ) => {
    Object.assign(state.issueTypes, issue)
  }
}

export const state = function (): IssuePreferencesInterface {
  return <IssuePreferencesInterface>{
    issueTypes: {}
  }
}
