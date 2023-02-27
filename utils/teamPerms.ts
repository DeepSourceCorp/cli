import { TeamMemberRoleChoices } from '~/types/types'

const TEAM_PERMS = {
  [TeamMemberRoleChoices.Admin]: {
    title: 'Administrator',
    description:
      'Full access to all repositories and the team, including billing, adding, or removing members.'
  },
  [TeamMemberRoleChoices.Member]: {
    title: 'Member',
    description: 'Add and edit specific repositories.'
  },
  [TeamMemberRoleChoices.Contributor]: {
    title: 'Contributor',
    description:
      "Contributors don't have any team level access or any access to change repo level settings."
  }
}

export default TEAM_PERMS
