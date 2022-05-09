import { MutationTree, ActionTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'

export interface SubscriptionStore {
  selectedPlan: string
  billingCycle: 'yearly' | 'monthly'
  seats: number
}

// Mutations ----------------------------------------
export enum SubscriptionMutationTypes {
  SET_PLAN = 'setPlan',
  RESET = 'reset'
}

export const mutations: MutationTree<SubscriptionStore> = {
  [SubscriptionMutationTypes.SET_PLAN]: (state: SubscriptionStore, details: SubscriptionStore) => {
    Object.assign(state, details)
  },

  [SubscriptionMutationTypes.RESET]: (state: SubscriptionStore) => {
    // skipcq: JS-0387
    state = {
      selectedPlan: '',
      billingCycle: 'yearly',
      seats: 3
    }
  }
}

// Actions ----------------------------------------
export type SubscriptionActionContext = ActionContext<SubscriptionStore, RootState>

export enum SubscriptionActionTypes {
  SET_PLAN = 'setPlan',
  RESET_PLAN = 'resetPlan'
}

interface SubscriptionActions extends ActionTree<SubscriptionStore, RootState> {
  [SubscriptionActionTypes.SET_PLAN]: (
    this: Store<RootState>,
    injectee: SubscriptionActionContext,
    args: {
      billingCycle?: 'yearly' | 'monthly'
      plan?: string
      seat?: number
    }
  ) => void
  [SubscriptionActionTypes.RESET_PLAN]: (
    this: Store<RootState>,
    injectee: SubscriptionActionContext
  ) => void
}

export const actions: SubscriptionActions = {
  [SubscriptionActionTypes.SET_PLAN]({ commit }, args) {
    commit(SubscriptionMutationTypes.SET_PLAN, args)
  },
  [SubscriptionActionTypes.RESET_PLAN]({ commit }) {
    commit(SubscriptionMutationTypes.RESET)
  }
}

export const state = function (): SubscriptionStore {
  return <SubscriptionStore>{
    selectedPlan: '',
    billingCycle: 'yearly',
    seats: 3
  }
}
