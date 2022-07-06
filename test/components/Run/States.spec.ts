import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'

import RunCancelled from '~/components/Run/RunCancelled.vue'
import RunTimeout from '~/components/Run/RunTimeout.vue'
import RunLoading from '~/components/Run/RunLoading.vue'
import RunNuked from '~/components/Run/RunNuked.vue'
import RunPass from '~/components/Run/RunPass.vue'
import RunWaiting from '~/components/Run/RunWaiting.vue'

const stubs = {
  ZIcon: true
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
})
