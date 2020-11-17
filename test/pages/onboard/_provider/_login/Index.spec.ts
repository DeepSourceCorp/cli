import { shallowMount, Wrapper, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';

import { RootState } from '~/store';
import Index from '~/pages/onboard/_provider/_login/index.vue';
import { mockUser } from '~/test/store/user/__mocks__/active.mock';

// Vue config
const localVue = createLocalVue();
localVue.use(Vuex);

// Vuex config
let store: Store<RootState>;

// Component config
let wrapper: Wrapper<Index>;

describe('onboard/index.vue', () => {
  beforeEach(() => {
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
      stubs: {
        NuxtLink: RouterLinkStub,
        NuxtChild: { template: '<div></div>' }
      },
      mocks: {
        $route: {
          params: {
            login: 'deepsourcelabs',
            provider: 'gh'
          }
        }
      }
    });
  });

  test('found Vue Component', () => {
    expect(wrapper.findComponent(Index).exists()).toBeTruthy();
  });
});
