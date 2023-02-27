import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex, { Store } from 'vuex'

import { InviteMembersModal } from '~/components/Members'
import { TeamMemberRoleChoices } from '~/types/types'

interface member {
  index: number
  email: string
  isValid: boolean
  modifyAllowed: boolean
  role: TeamMemberRoleChoices
}

interface InviteMembersModalInterface {
  // Data properties
  showModal: boolean
  membersToInvite: member[]

  // Computed properties
  initialMembersToInvites: member[]
  disableSend: boolean
  pendingInvites: number
  seatsLeftCount: number

  // Methods exposed by the component
  areEmailsInvalid: () => boolean
  addMore: () => void
  openInviteModal: () => void
  close: () => void
  resetInviteLink: () => Promise<void>
  sendInvite: () => Promise<void>
  validEmail: (email: string) => boolean

  // Vuex actions
  inviteAll: (args: {
    ownerId: string
    invitees: {
      email: string
      role: string
    }[]
    login: string
    provider: string
    limit: number
    currentPage: number
  }) => Promise<void>
  resetInviteUrl: (args: { ownerId: string }) => Promise<void>
}

describe('[[ InviteMembersModal ]]', () => {
  // Mocks
  const mocks = {
    $config: {
      emailEnabled: true
    },
    $route: {
      params: {
        provider: 'gh',
        owner: 'deepsourcelabs'
      }
    },
    $toast: {
      danger: jest.fn(),
      success: jest.fn()
    },
    $emit: jest.fn(),
    $fetchState: {
      pending: false
    }
  }

  const stubs = {
    CopyButton: true,
    portal: true,
    ZButton: true,
    ZDivider: true,
    ZIcon: true,
    ZInput: true,
    ZModal: true,
    ZOption: true,
    ZSelect: true
  }

  let store = {} as Store<InviteMembersModal>

  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VTooltip)

  // Helper that returns a new store instance
  const getStoreInstance = (hasOwnerBillingInfo = true) => {
    const options = {
      modules: {
        'team/detail': {
          namespaced: true,
          state: {
            team: {
              id: 'VGVhbTpxemxyeHo=',
              login: 'deepsourcelabs',
              invitationUrl: 'https://deepsource.icu/invitation/5cnHJHRUdbbpts2ZeiBa-20oabC_W_/',
              invites: {
                totalCount: 1,
                edges: [
                  {
                    node: {
                      email: 'test@test.com',
                      createdAt: '2022-05-25T07:26:58.330500+00:00',
                      role: TeamMemberRoleChoices.Contributor
                    }
                  },
                  {
                    node: {
                      email: 'test2@test.com',
                      createdAt: '2022-05-25T07:28:33.183971+00:00',
                      role: TeamMemberRoleChoices.Admin
                    }
                  }
                ]
              }
            }
          }
        },
        'owner/detail': {
          namespaced: true,
          state: {
            owner: {}
          }
        }
      }
    }

    if (hasOwnerBillingInfo) {
      options.modules['owner/detail'].state.owner = {
        billingInfo: {
          seatsTotal: 5,
          seatsUsed: 2
        }
      }
    }

    const store = new Vuex.Store(options)
    return store as Store<InviteMembersModal>
  }

  // Helper that creates a wrapper with the rendered component
  const getInstance = (includeOwnerBillingInfo = true) => {
    // Get a new store instance
    store = getStoreInstance(includeOwnerBillingInfo)

    const { vm } = shallowMount(InviteMembersModal, {
      store,
      mocks,
      stubs,
      localVue
    })
    return vm as unknown as InviteMembersModalInterface
  }

  // Helper to populate the invite list with Emails
  const populateListEmails = (inviteMemberList: member[]) => {
    return inviteMemberList.map((invitee) => ({
      ...invitee,
      email: `test${invitee.index + 1}@test.com` // test1@test.com, test2@test.com
    }))
  }

  test('renders invite members modal with the trigger button', () => {
    // Get a new store instance
    store = getStoreInstance()

    const { html } = render(InviteMembersModal, {
      data() {
        return {
          showModal: true
        }
      },
      mocks,
      stubs,
      store,
      localVue
    })

    expect(html()).toMatchSnapshot()
  })

  test('`resetInviteLink` method successfully invokes the `resetInviteUrl` Vuex action', async () => {
    const instance = getInstance()

    // Mock implementation for the `resetInviteUrl` Vuex action
    instance.resetInviteUrl = jest.fn().mockResolvedValueOnce(undefined)

    // Invoke the `resetInviteLink` method
    await instance.resetInviteLink()

    // Assertion
    expect(mocks.$toast.success).toBeCalledWith('Invitation link successfully reset')
  })

  test('`areEmailsInvalid` method returns `true` if email entry is not available in `membersToInvite`', () => {
    const instance = getInstance()

    instance.membersToInvite = instance.initialMembersToInvites.map((invitee) => ({
      ...invitee,
      isValid: instance.validEmail(invitee.email)
    }))

    // Assertion
    expect(instance.areEmailsInvalid()).toBe(true)
  })

  test('`areEmailsInvalid` method returns `false` only if all emails in the list are valid', () => {
    const instance = getInstance()

    instance.membersToInvite = populateListEmails(instance.initialMembersToInvites)

    // Assertion
    expect(instance.areEmailsInvalid()).toBe(false)
  })

  test('`validEmail` returns `true` for a valid email', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.validEmail('test@gmail.com')).toBe(true)
  })

  test('`validEmail` returns `false` for an invalid email', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.validEmail('test')).toBe(false)
  })

  test('`validEmail` returns `false` for an empty string', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.validEmail('')).toBe(false)
  })

  test('`sendInvite` returns early if an email supplied is invalid', async () => {
    const instance = getInstance()

    instance.areEmailsInvalid = jest.fn().mockImplementationOnce(() => true)

    // Invoke the `sendInvite` method
    await instance.sendInvite()

    // Assertion
    expect(mocks.$toast.danger).toBeCalledWith('Please enter a valid email')
  })

  test('`sendInvite` method succesfully invokes the `inviteAll` Vuex action', async () => {
    const instance = getInstance()

    instance.membersToInvite = populateListEmails(instance.initialMembersToInvites)

    // Mock implementation for the `inviteAll` Vuex action
    instance.inviteAll = jest.fn().mockResolvedValueOnce(undefined)

    // Set spy
    instance.close = jest.fn()

    // Invoke the `sendInvite` method
    await instance.sendInvite()

    // Assertions
    expect(mocks.$emit).toBeCalledWith('inviteSuccess')
    expect(instance.close).toBeCalled()
  })

  test('`sendInvite` method shows a danger toast if the `inviteAll` Vuex action fails', async () => {
    const instance = getInstance()

    // Mock the behavior
    instance.inviteAll = jest.fn().mockRejectedValueOnce(new Error('Test error'))

    // Invoke the `sendInvite` method
    await instance.sendInvite()

    // Assertion
    expect(mocks.$toast.danger).toBeCalled()
  })

  test('`addMore` method appends to the members invite list', () => {
    const instance = getInstance()

    // Simulate the assignment happening in the fetch hook
    instance.membersToInvite = instance.initialMembersToInvites

    // Invoke the `addMore` method
    instance.addMore()

    // Assertion
    expect(instance.membersToInvite).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          index: 4,
          isValid: true,
          modifyAllowed: false,
          role: TeamMemberRoleChoices.Contributor
        })
      ])
    )
  })

  test('`open` method opens the modal', () => {
    const instance = getInstance()

    // Invoke the `open` method
    instance.openInviteModal()

    // Assertion
    expect(instance.showModal).toBe(true)
  })

  test('`close` method updates `membersToInvite` state variable and closes the modal', () => {
    const instance = getInstance()

    // Invoke the `close` method
    instance.close()

    // Assertions
    expect(instance.membersToInvite).toEqual(instance.initialMembersToInvites)
    expect(instance.showModal).toBe(false)
  })

  test('`disableSend` returns `true` if there are empty emails in the `membersToInvite` list', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.disableSend).toBe(true)
  })

  test('`disableSend` returns `false` if there are no empty emails in the `membersToInvite` list', () => {
    const instance = getInstance()

    instance.membersToInvite = populateListEmails(instance.initialMembersToInvites)

    // Assertion
    expect(instance.disableSend).toBe(false)
  })

  test('`pendingInvites` returns the count of pending invites excluding contributor roles', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.pendingInvites).toBe(1)
  })

  test('`seatsLeftCount` returns `0` if owner billing info is not available', () => {
    const instance = getInstance(false)

    // Assertion
    expect(instance.seatsLeftCount).toBe(0)
  })

  test('`seatsLeftCount` returns the seats left information for the owner', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.seatsLeftCount).toBe(2)
  })

  test('`initialMembersToInvites` returns the members to invite based on `seatsLeftCount`', () => {
    const instance = getInstance(false)

    // Assertion
    expect(instance.initialMembersToInvites).toEqual([
      {
        email: '',
        index: 0,
        isValid: true,
        modifyAllowed: false,
        role: TeamMemberRoleChoices.Contributor
      },
      {
        email: '',
        index: 1,
        isValid: true,
        modifyAllowed: false,
        role: TeamMemberRoleChoices.Contributor
      },
      {
        email: '',
        index: 2,
        isValid: true,
        modifyAllowed: false,
        role: TeamMemberRoleChoices.Contributor
      }
    ])
  })

  test('`initialMembersToInvites` returns the members with `modifyAllowed` set to `true` if there are seats available', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.initialMembersToInvites).toEqual([
      {
        email: '',
        index: 0,
        isValid: true,
        modifyAllowed: true,
        role: TeamMemberRoleChoices.Member
      },
      {
        email: '',
        index: 1,
        isValid: true,
        modifyAllowed: true,
        role: TeamMemberRoleChoices.Member
      },
      {
        email: '',
        index: 2,
        isValid: true,
        modifyAllowed: false,
        role: TeamMemberRoleChoices.Contributor
      }
    ])
  })
})
