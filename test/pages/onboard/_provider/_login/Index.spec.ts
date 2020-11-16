import { shallowMount, Wrapper, createLocalVue } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import VueRouter from 'vue-router';

import { RootState } from '~/store';
import Index from '~/pages/onboard/_provider/_login/index.vue';
import { mockUser } from '~/test/store/user/__mocks__/active.mock';

// Vue config
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueRouter)

const $route = {
  path: '/onboard/gh/deepsourcelabs/issue-preferences'
}

// Vuex config
let store: Store<RootState>;

// Component config
let wrapper: Wrapper<Index>;

describe('onboard/index.vue', () => {
  beforeEach(() => {
    // const router = new VueRouter({
    //   routes: [
    //     { path: '/onboard/:provider/:login/', name: 'issue-preferences', component: Index, props: true }
    //   ]
    // })
    // localVue.prototype.$route = {
    //   params: {
    //     login: 'deepsource',
    //     provider: 'gh'
    //   }
    // }
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          actions: {},
          modules: {
            active: {
              namespaced: true,
              state: mockUser()
            }
          }
        }
      }
    });

    wrapper = shallowMount(Index, {
      localVue,
      store,
      mocks: {
        $route: {
          params: {
            login: 'deepsourcelabs',
            provider: 'gh'
          }
        }
      }
    });
    console.log(wrapper)
  });

  test('is a Vue component', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
