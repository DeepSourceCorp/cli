import { shallowMount, Wrapper, createLocalVue, RouterLinkStub, WrapperArray } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';

import { RootState } from '~/store';
import ChooseFirstRepo from '~/pages/onboard/_provider/_login/index/choose-first-repo.vue';
import { mockRepositoryListState } from '~/test/store/repository/__mocks__/list.mock';
import { ACT_FETCH_REPOSITORY_DETAIL } from '~/store/repository/detail';
import { ACT_FETCH_REPOSITORY_LIST } from '~/store/repository/list';

// Vue config
const localVue = createLocalVue();
localVue.use(Vuex);

let wrapper: Wrapper<ChooseFirstRepo>;
let store: Store<RootState>;
let repoItems: WrapperArray<Vue>;

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
              state: mockRepositoryListState(),
              actions: {
                [ACT_FETCH_REPOSITORY_DETAIL]: jest.fn(),
                [ACT_FETCH_REPOSITORY_LIST]: jest.fn()
              }
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

    repoItems = wrapper.findAll('.repo-box')
  });

  test('found Vue Component', () => {
    expect(wrapper.findComponent(ChooseFirstRepo).exists()).toBeTruthy();
  });

  test('repository list is populated in the store', () => {
    const repoListStore = wrapper.vm.$store.state.repository.list.repositoryList;
    const repoListMocked = mockRepositoryListState().repositoryList;
    expect(repoListStore.edges.length).toEqual(repoListMocked.edges.length)
  });

  test('renders list of repositories correctly', () => {
    const repoListMocked = mockRepositoryListState().repositoryList;
    expect(wrapper.text()).toContain(repoListMocked.edges[0]?.node?.name)
    expect(repoItems.length).toEqual(repoListMocked.edges.length)
  });

  test('selects repository on click', () => {
    const firstRepo = repoItems.wrappers[0]
    firstRepo.trigger('click')
    expect(wrapper.vm.$data.selectedRepository).toEqual(mockRepositoryListState().repositoryList.edges[0]?.node)
  });

  // TODO: Add a test for onSubmit method's use case.
});
