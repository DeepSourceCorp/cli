import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'
import { render, fireEvent } from '@testing-library/vue'
import { MemberListItem } from '~/components/Members'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

import ZMenu from '@/components/zeal/ZMenu'
import ZMenuItem from '@/components/zeal/ZMenu/ZMenuItem'
import ZMenuSection from '@/components/zeal/ZMenu/ZMenuSection'

import { mocksGenerator } from '~/test/mocks'

const baseProps = {
  avatar: '/static/dashboard/images/empty-avatar.svg',
  dateJoined: '2019-02-01T07:55:15.466139+00:00',
  email: 'root@deepsource.io',
  fullName: 'Duck Norris',
  id: 'VXNlcjpseGJhbWI=',
  login: 'deepsourcelabs',
  vcsProvider: 'gh',
  teamAvatarUrl: 'static/dashboard/images/empty-avatar.svg'
}

const optionalProps = {
  clickable: true,
  isPrimaryUser: false,
  isRepo: false,
  role: 'ADMIN',
  showRoleOptions: true,
  isPermFromVcs: false,
  isLastListItem: false
}

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    'account/context': {
      namespaced: true,
      state: {
        context: {
          emptyAvatarUrl: ''
        }
      }
    },
    'owner/detail': {
      namespaced: true,
      state: {
        owner: {
          isViewerPrimaryUser: true
        }
      }
    }
  }
})

const mocks = mocksGenerator()

test('renders MemberListItem with all prop options for team', () => {
  const teamRoleOptions = generateStringProps('role', ['ADMIN', 'MEMBER', 'CONTRIBUTOR'], false)
  const isPrimaryUserOptions = generateBooleanProps('isPrimaryUser', false)
  const clickableOptions = generateBooleanProps('clickable', false)
  const showRoleOptions = generateBooleanProps('showRoleOptions', false)
  const isPermFromVcsOptions = generateBooleanProps('isPermFromVcs', false)
  const isLastListItemOptions = generateBooleanProps('isLastListItem', false)

  cartesian(
    isPrimaryUserOptions,
    clickableOptions,
    showRoleOptions,
    teamRoleOptions,
    isPermFromVcsOptions,
    isLastListItemOptions
  ).forEach((propCombination) => {
    const props = {
      ...baseProps,
      ...propCombination,
      isRepo: false
    }

    const { html } = render(MemberListItem, {
      props,
      stubs: {
        ZIcon: true,
        ZMenu: true,
        ZMenuItem: true,
        ZMenuSection: true,
        ZAvatar: true
      },
      store,
      mocks
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})

test('renders MemberListItem with all prop options for repo', () => {
  const repoRoleOptions = generateStringProps('role', ['ADMIN', 'WRITE', 'READ'], false)
  const isPrimaryUserOptions = generateBooleanProps('isPrimaryUser', false)
  const clickableOptions = generateBooleanProps('clickable', false)
  const showRoleOptions = generateBooleanProps('showRoleOptions', false)
  const isPermFromVcsOptions = generateBooleanProps('isPermFromVcs', false)
  const isLastListItemOptions = generateBooleanProps('isLastListItem', false)

  cartesian(
    isPrimaryUserOptions,
    clickableOptions,
    showRoleOptions,
    repoRoleOptions,
    isPermFromVcsOptions,
    isLastListItemOptions
  ).forEach((propCombination) => {
    const props = {
      ...baseProps,
      ...propCombination,
      isRepo: true
    }

    const { html } = render(MemberListItem, {
      props,
      stubs: {
        ZIcon: true,
        ZMenu: true,
        ZMenuItem: true,
        ZMenuSection: true,
        ZAvatar: true
      },
      store,
      mocks
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})

test('Emits "updateRole" event', async () => {
  const newRole = 'MEMBER'
  const { getByTestId, emitted } = render(MemberListItem, {
    props: { ...baseProps, ...optionalProps },
    stubs: {
      ZIcon: true,
      ZAvatar: true
    },
    components: { ZMenu, ZMenuItem, ZMenuSection },
    store,
    mocks
  })

  const button = getByTestId('show-role-menu')
  await fireEvent(button, new Event('click'))

  const roleButton = getByTestId(`${newRole}-button`)
  await fireEvent(roleButton, new Event('click'))

  expect(emitted()).toHaveProperty('updateRole')
  expect(emitted()['updateRole'][0][0].newRole).toBe(newRole)
})

test('Emits "removeMember" event', async () => {
  const { getByTestId, emitted } = render(MemberListItem, {
    props: { ...baseProps, ...optionalProps },
    stubs: {
      ZIcon: true,
      ZAvatar: true
    },
    components: { ZMenu, ZMenuItem, ZMenuSection },
    store,
    mocks
  })

  const button = getByTestId('show-role-menu')
  await fireEvent(button, new Event('click'))

  const roleButton = getByTestId('remove-team-member')
  await fireEvent(roleButton, new Event('click'))

  expect(emitted()).toHaveProperty('removeMember')
  expect(emitted()['removeMember'][0][0].id).toBe(baseProps.id)
})

test('Emits "transferOwnership" event', async () => {
  const testProps = {
    clickable: true,
    isPrimaryUser: true,
    allowTransfer: true,
    isRepo: false,
    role: 'ADMIN',
    showRoleOptions: true
  }

  const { getByTestId, emitted } = render(MemberListItem, {
    props: { ...baseProps, ...testProps },
    stubs: {
      ZIcon: true,
      ZAvatar: true
    },
    components: { ZMenu, ZMenuItem, ZMenuSection },
    store,
    mocks
  })

  const button = getByTestId('show-role-menu')
  await fireEvent(button, new Event('click'))

  const roleButton = getByTestId('transfer-ownership')
  await fireEvent(roleButton, new Event('click'))

  expect(emitted()).toHaveProperty('transferOwnership')
  expect(emitted()['transferOwnership'][0][0].id).toBe(baseProps.id)
})
