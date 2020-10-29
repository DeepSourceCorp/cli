import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import analyzers from '~/store/analyzers'

let analyzersStore: analyzers

function initialiseStores(store: Store<any>): void {
  analyzersStore = getModule(analyzers, store)
}

export {
  initialiseStores,
  analyzersStore
} 