import { TeamMemberRoleChoices } from '~/types/types'

const TEAM_PERMS = {
  [TeamMemberRoleChoices.Admin]: {
    title: 'Administrator',
    description:
      'Full access to all repositories and the team, including billing, adding and removing members.'
  },
  [TeamMemberRoleChoices.Member]: {
    title: 'Member',
    description: 'Add and edit specific repositories.'
  },
  [TeamMemberRoleChoices.Contributor]: {
    title: 'Contributor',
    description:
      "Contributors only have access to public repositories and don't count against your seat quota."
  }
}

export default TEAM_PERMS
