import { Component, mixins } from 'nuxt-property-decorator'
import IntegrationsDetailMixin from './integrationsDetailMixin'

export type JiraConfigOptions = Array<{ id: string; name: string }>
export type SelectOptions = Array<{ value: string; label: string }>
export type JiraConfig = {
  _rel?: {
    cloud_id?: Record<
      string,
      {
        project_key?: JiraConfigOptions
        issue_type?: JiraConfigOptions
      }
    >
  }
  cloud_id?: JiraConfigOptions
}

/**
 * Mixin that has methods for working with details for Jira Integration.
 */
@Component
export default class JiraIntegrationMixin extends mixins(IntegrationsDetailMixin) {
  selectedCloudId = ''
  selectedProject = ''
  selectedIssueType = ''

  integrationOptions: JiraConfig = {
    _rel: {
      cloud_id: {}
    },
    cloud_id: []
  }

  get installedOn(): string {
    const opts = this.cloudIdOptions.filter(
      (opt) => opt.value === this.integration.settings.cloud_id
    )[0]

    if (opts) {
      return opts.label
    }

    return ''
  }

  get isProjectValid(): boolean {
    return this.projectOptions.some((project) => project.value === this.selectedProject)
  }

  get isIssueTypeValid(): boolean {
    return this.issueTypeOptions.some((issueType) => issueType.value === this.selectedIssueType)
  }

  get selectedCloudName(): string {
    if (this.selectedCloudId) {
      const { label } = this.cloudIdOptions.filter((opt) => opt.value === this.selectedCloudId)[0]
      return label
    }

    return ''
  }

  /**
   * Check if the given Jira project and issue type belongs to the cloud id
   * @return {void}
   */
  validateJiraConfig(): void {
    if (!(this.selectedCloudId && this.selectedProject && this.selectedIssueType)) {
      throw new Error('Please select all the configuration options.')
    }

    if (!this.isProjectValid) {
      throw new Error(`The selected project does not belong to ${this.selectedCloudName}.`)
    }

    if (!this.isIssueTypeValid) {
      throw new Error(`The selected issue type does not belong to the ${this.selectedCloudName}.`)
    }
  }

  /**
   * utility function to generate label value pairs
   *
   * @param {JiraConfigOptions} options?
   *
   * @return {SelectOptions}
   */
  generateOptionsFromConfig(options?: JiraConfigOptions): SelectOptions {
    return Array.isArray(options)
      ? options.map((opt) => {
          return { value: opt.id, label: opt.name }
        })
      : []
  }

  get cloudIdOptions(): SelectOptions {
    return this.generateOptionsFromConfig(this.integrationOptions?.cloud_id)
  }

  get projectOptions(): SelectOptions {
    return this.generateOptionsFromConfig(
      this.integrationOptions?._rel?.cloud_id?.[this.selectedCloudId]?.project_key
    )
  }

  get issueTypeOptions(): SelectOptions {
    // Epic is not really an issue type, and intializing it won't make sense for
    // our use case, filtering it out of the valid options
    return this.generateOptionsFromConfig(
      this.integrationOptions?._rel?.cloud_id?.[this.selectedCloudId]?.issue_type
    ).filter((option) => option.label.toLowerCase() !== 'epic')
  }
}
