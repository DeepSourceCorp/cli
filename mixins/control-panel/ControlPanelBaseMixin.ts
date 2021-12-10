import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { OrgBaseActions, OrgBaseGetters } from '~/store/control-panel/base'
import { ControlPanelRouteT } from '~/types/control-panel'
import { EnterpriseInstallationSetup } from '~/types/types'

const baseOrgStore = namespace('control-panel/base')

@Component
export default class ControlPanelBaseMixin extends Vue {
  @baseOrgStore.Getter(OrgBaseGetters.IS_VIEWER_SUPERADMIN)
  isViewerSuperadmin: boolean

  @baseOrgStore.Getter(OrgBaseGetters.GET_MANAGEMENT_URL)
  managementConsoleUrl: string

  @baseOrgStore.Action(OrgBaseActions.IS_VIEWER_SUPERADMIN)
  getViewerSuperadminStatus: () => Promise<void>

  @baseOrgStore.Getter(OrgBaseGetters.ORG_BASE_DATA)
  orgInfo: EnterpriseInstallationSetup

  @baseOrgStore.Action(OrgBaseActions.FETCH_ORG_BASE_DATA)
  getOrgBaseData: () => Promise<void>

  CONTROL_PANELS = [
    {
      icon: 'users',
      title: ['User management'],
      description:
        'Manage all users across teams of this DeepSource enterprise instance installation.',
      to: '/control-panel/user-management',
      subroutes: [
        {
          icon: 'users',
          title: ['User management', 'All users'],
          to: '/control-panel/user-management',
          navTo: '/control-panel/user-management/users'
        },
        {
          icon: 'building',
          title: ['User management', 'Groups'],
          to: '/control-panel/user-management/groups'
        },
        {
          icon: 'envelope-add',
          title: ['User management', 'Invitations'],
          to: '/control-panel/user-management/invites'
        }
      ]
    },
    {
      icon: 'file-landscape',
      title: ['License'],
      description:
        'Manage and monitor license usage across this DeepSource enterprise installation.',
      to: '/control-panel/license',
      subroutes: [
        {
          icon: 'file-landscape',
          title: ['License', 'License overview'],
          to: '/control-panel/license'
        },
        { icon: 'add-ons', title: ['License', 'Add-ons'], to: '/control-panel/license/add-ons' }
      ]
    },
    {
      icon: 'university',
      title: ['Enterprise overview'],
      description: 'Get a bird-eye view of this DeepSource enterprise installation.',
      to: '/control-panel/overview'
    },
    {
      icon: 'document-layout-left',
      title: ['Reports & Insights'],
      description:
        'Get in-depth reports and insights of how DeepSource is being used across your installation.',
      to: '/control-panel/reports'
    },
    {
      icon: 'cloud-data-connection',
      title: ['Policies'],
      description:
        'Set and monitor global policies governing how DeepSource is used across your organization.',
      to: '/control-panel/policies'
    },
    {
      icon: 'amount-up',
      title: ['Audit log'],
      description:
        'Monitor audit logs of all events across teams in your Deepsource enterprise installation.',
      to: '/control-panel/logs'
    },
    {
      icon: 'hard-hat',
      title: ['Installation Management Console'],
      description: 'Manage your DeepSource Enterprise installation.'
    },
    {
      icon: 'headphones-alt',
      title: ['Enterprise Help Center'],
      description:
        'Reach out to the DeepSource team to resolve issues or ask questions on a priority basis.',
      href: 'https://deepsource.io/docs/'
    }
  ] as ControlPanelRouteT[]

  secondaryMenuList = ['Enterprise Help Center']

  get isSubroute(): boolean {
    return (this.$route.path.slice(0, -1).match(/\//g)?.length ?? 0) > 2
  }

  get parentRoute(): string {
    if (this.isSubroute) return this.$route.path.split('/').slice(0, 3).join('/')
    return this.$route.path
  }

  get subRoute(): string {
    return this.$route.path.split('/').slice(0, 4).join('/')
  }

  getPageTitle(titleArray: string[]): string {
    return titleArray.slice(-1)[0] || ''
  }
}
