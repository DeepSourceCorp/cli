import { OwnerVcsProvider, Owner } from '~/types/types'

import { TeamState } from '~/store/team/detail'

export const TEAM = {
  id: 'VGVhbTpxemxyeHo=',
  createdAt: '2020-02-29T03:07:11.151959+00:00',
  modifiedAt: '2020-12-02T10:12:03.474725+00:00',
  login: 'deepsourcelabs',
  vcsProvider: OwnerVcsProvider.Gh,
  vcsAccountUid: '40287229',
  ownerPtr: {
    id: 'T3duZXI6cXpscnh6'
  } as Owner,
  name: 'deepsourcelabs',
  syncPermissionsWithVcs: true,
  numMembersTotal: 9,
  teammemberSet: {},
  teammemberinvitationSet: {},
  invitationUrl:
    'http://special-data-invite-url.example.com/invitation/wrqf2yUld8jhDz2p3ooHSyWBaMo5Jf/',
  members: {
    totalCount: 5,
    pageInfo: {
      startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
      endCursor: 'YXJyYXljb25uZWN0aW9uOjk=',
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: [
      {
        cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        node: {
          id: 'VGVhbU1lbWJlcjpsYm9rZ2I=',
          role: 'ADMIN',
          isPrimaryUser: false,
          user: {
            id: 'VXNlcjpsa2Jldno=',
            fullName: 'Harry Mock',
            email: 'harry@example.com',
            avatar: 'https://randomuser.me/api/portraits/thumb/women/75.jpg',
            dateJoined: '2018-12-22T13:46:59.236651+00:00'
          }
        }
      },
      {
        cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        node: {
          id: 'VGVhbU1lbWJlcjpkemdnb3o=',
          role: 'ADMIN',
          isPrimaryUser: false,
          user: {
            id: 'VXNlcjp2bHpydno=',
            fullName: 'William Mock',
            email: 'william@example.com',
            avatar: 'https://randomuser.me/api/portraits/thumb/women/75.jpg',
            dateJoined: '2019-01-15T09:38:15.676257+00:00'
          }
        }
      },
      {
        cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        node: {
          id: 'VGVhbU1lbWJlcjpqemt2bmI=',
          role: 'ADMIN',
          isPrimaryUser: true,
          user: {
            id: 'VXNlcjpsenFuYWI=',
            fullName: 'Arthur Mock',
            email: 'arthur@example.com',
            avatar: 'https://randomuser.me/api/portraits/thumb/women/75.jpg',
            dateJoined: '2021-03-10T12:17:45.323933+00:00'
          }
        }
      },
      {
        cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        node: {
          id: 'VGVhbU1lbWJlcjp5YnlldmI=',
          role: 'ADMIN',
          isPrimaryUser: false,
          user: {
            id: 'VXNlcjpqemt3d3o=',
            fullName: 'Suraj Mock',
            email: 'suraj@example.com',
            avatar: 'https://randomuser.me/api/portraits/thumb/women/75.jpg',
            dateJoined: '2019-07-09T13:43:51.769867+00:00'
          }
        }
      },
      {
        cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        node: {
          id: 'VGVhbU1lbWJlcjp5enlncXo=',
          role: 'ADMIN',
          isPrimaryUser: false,
          user: {
            id: 'VXNlcjp5YnltcWI=',
            fullName: 'Maggie',
            email: 'maggie@example.com',
            avatar: 'https://randomuser.me/api/portraits/thumb/women/75.jpg',
            dateJoined: '2020-07-08T10:49:40.658677+00:00'
          }
        }
      }
    ]
  }
}

/**
 * Mock -- Run list factory
 * @see TEAM
 */
export const mockTeamList = (): any => TEAM

/**
 * Mock factory
 */
export const mockTeamState = (): TeamState => ({
  loading: false as boolean,
  error: {},
  team: mockTeamList()
})
