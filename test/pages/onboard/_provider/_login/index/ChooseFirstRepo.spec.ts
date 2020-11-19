import { shallowMount, Wrapper, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';

import { RootState } from '~/store';
import ChooseFirstRepo from '~/pages/onboard/_provider/_login/index/choose-first-repo.vue';
import { mockRepository } from '~/test/store/repository/__mocks__/list.mock';

// Vue config
const localVue = createLocalVue();
localVue.use(Vuex);

// Vuex config
let store: Store<RootState>;

// Component config
let wrapper: Wrapper<ChooseFirstRepo>;

describe('onboard/_provider/_login/index/choose-first-repo.vue', () => {
  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        repository: {
          namespaced: true,
          actions: {},
          modules: {
            list: {
              namespaced: true,
              state: mockRepository()
            }
          }
        }
      }
    });

    wrapper = shallowMount(ChooseFirstRepo, {
      localVue,
      store,
      data: () => {
        return {
          selectedRepository: {}
        }
      },
      stubs: {
        NuxtLink: RouterLinkStub
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
    expect(wrapper.findComponent(ChooseFirstRepo).exists()).toBeTruthy();
  });

});
