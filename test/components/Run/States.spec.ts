import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, mount } from '@vue/test-utils'
import vuex from 'vuex'

import { BaseState, RepoEmpty, RepoError, RepoTimeout, RepoWaiting } from '~/components/RepoStates'
import RunFailed from '~/components/Run/RunFailed.vue'
import RunLoading from '~/components/Run/RunLoading.vue'
import RunNuked from '~/components/Run/RunNuked.vue'
import RunPass from '~/components/Run/RunPass.vue'
import RunTimeout from '~/components/Run/RunTimeout.vue'
import RunWaiting from '~/components/Run/RunWaiting.vue'
import RunCancelled from '~/components/Run/RunCancelled.vue'

import { storeModulesGenerator } from '~/test/mocks'

const stubs = {
  ZButton: true,
  ZIcon: true,
  EmptyState: true,
  EmptyStatePicture: true
}

const props = {
  id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
  name: 'asgard',
  defaultBranchName: 'master'
}

jest.mock('~/assets/images/ui-states/repo/error.svg', () => 'error.svg')
jest.mock('~/assets/images/ui-states/repo/empty.svg', () => 'empty.svg')
jest.mock('~/assets/images/ui-states/repo/timeout.svg', () => 'timeout.svg')

describe('[[ Run Status Components ]]', () => {
  test('RunCancelled', () => {
    const { html } = render(RunCancelled, { stubs })
    expect(html()).toMatchSnapshot('RunCancelled')
  })
  test('RunTimeout', () => {
    const { html } = render(RunTimeout, { stubs })
    expect(html()).toMatchSnapshot('RunTimeout')
  })
  test('RunLoading', () => {
    const { html } = render(RunLoading, { stubs })
    expect(html()).toMatchSnapshot('RunLoading')
  })
  test('RunNuked', () => {
    const { html } = render(RunNuked, { stubs })
    expect(html()).toMatchSnapshot('RunNuked')
  })
  test('RunPass', () => {
    const { html } = render(RunPass, { stubs })
    expect(html()).toMatchSnapshot('RunPass')
  })
  test('RunWaiting', () => {
    const { html } = render(RunWaiting, { stubs })
    expect(html()).toMatchSnapshot('RunWaiting')
  })
  test('RunFailed', () => {
    const { html } = render(RunFailed, { stubs })
    expect(html()).toMatchSnapshot('RunFailed')
  })
})

describe('[[ Repo Status Components ]]', () => {
  const renderOptions = {
    components: {
      BaseState
    },
    props,
    stubs
  }

  test('RepoTimeout', () => {
    const mocks = {
      $toast: {
        success: jest.fn()
      }
    }
    const localVue = createLocalVue()
    localVue.use(vuex)

    const div = document.createElement('div')
    document.body.appendChild(div)

    const wrapper = mount(RepoTimeout, {
      stubs,
      propsData: props,
      localVue,
      attachTo: div,
      mocks,
      store: new vuex.Store({
        modules: storeModulesGenerator({
          'repository/detail': {
            namespaced: true,
            actions: {
              toggleRepoActivation: jest.fn()
            }
          }
        })
      })
    })

    expect(wrapper.html()).toMatchSnapshot('RepoTimeout')
  })

  test('RepoEmpty', () => {
    const { html } = render(RepoEmpty, renderOptions)
    expect(html()).toMatchSnapshot('RepoEmpty')
  })

  test('RepoError', () => {
    const { html } = render(RepoError, renderOptions)
    expect(html()).toMatchSnapshot('RepoError')
  })

  test('RepoWaiting', () => {
    const { html } = render(RepoWaiting, renderOptions)
    expect(html()).toMatchSnapshot('RepoWaiting')
  })
})
