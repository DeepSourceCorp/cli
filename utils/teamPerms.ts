const TEAM_PERMS = {
  ADMIN: {
    title: 'Administrator',
    description:
      'Full access to all repositories and the team, including billing, adding, or removing members.'
  },
  MEMBER: {
    title: 'Member',
    description: 'Add and edit specific repositories.'
  },
  CONTRIBUTOR: {
    title: 'Contributor',
    description:
      "Contributors don't have any team level access or any access to change repo level settings."
  }
}

export default TEAM_PERMS
