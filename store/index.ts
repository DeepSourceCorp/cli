import { GetterTree, ActionTree, MutationTree, ActionContext } from 'vuex'

export interface RootState {}

export const state = (): RootState => ({
  ...(<RootState>{})
})

export type RootStateActionContext = ActionContext<RootState, RootState>

export const getters: GetterTree<RootState, RootState> = {}

export const mutations: MutationTree<RootState> = {}

export const actions: ActionTree<RootState, RootState> = {}
