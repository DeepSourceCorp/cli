<template>
  <div class="flex max-w-2xl flex-col gap-y-2 p-4">
    <page-title
      title="Badges"
      description-width-class="max-w-2xl"
      description="Embeddable badges that can be used to link to the DeepSource dashboard for this project. Add
        these badges in the project's README, wiki or the website."
      class="max-w-2xl"
    />
    <div class="flex flex-col gap-y-2">
      <div class="flex max-w-2xl flex-col gap-y-2">
        <label class="text-sm text-vanilla-100">Preview</label>
        <!-- Preview component -->
        <div class="flex h-40 flex-col items-center border border-slate-400 p-2">
          <div class="item-center flex flex-1 justify-center">
            <img :src="badgeImageURL" alt="badge" />
          </div>
          <z-input v-model="embedCode" class="self-end pr-0.5">
            <template #right>
              <copy-button :value="embedCode" :disabled="!embedCode" class="w-36" />
            </template>
          </z-input>
        </div>
      </div>
      <!-- Badge type -->
      <form-group>
        <div class="flex max-w-2xl items-center py-4">
          <div class="flex-1 text-sm text-vanilla-100">Badge type</div>
          <z-radio-group v-model="badgeType" class="flex">
            <z-radio-button value="active issues" label="Active issues" />
            <z-radio-button value="resolved issues" label="Resolved issues" />
          </z-radio-group>
        </div>
        <!-- Show trend -->
        <toggle-input
          v-model="showTrend"
          input-width="x-small"
          label="Show trend"
          input-id="show-trend"
          class="max-w-2xl border-t border-slate-400"
        >
          <template #description>
            <p class="max-w-xs">
              Add a trendline showing how the value of this metric has varied in the last 6 months.
            </p>
          </template>
        </toggle-input>
        <!-- Format -->
        <div class="flex max-w-2xl items-center border-t border-slate-400 py-4">
          <div class="flex-1 text-sm text-vanilla-100">Format</div>
          <div class="h-8 w-1/3 md:w-1/4">
            <z-select v-model="selectedFormat" spacing="py-1 px-2" class="text-sm">
              <z-option
                v-for="item in formats"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </z-select>
          </div>
        </div>
        <!-- Add referral -->
        <div class="flex max-w-2xl items-center border-t border-slate-400 py-4">
          <div class="flex-1 text-sm text-vanilla-100">Add referral to badge</div>
          <z-toggle v-model="addReferral" />
        </div>
      </form-group>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'

import { RepositoryDetailActions } from '~/store/repository/detail'
import { Repository } from '~/types/types'

const repoStore = namespace('repository/detail')

@Component({
  layout: 'repository'
})
export default class Badges extends Vue {
  @repoStore.State
  repository!: Repository

  public badgeType = 'active issues'
  public selectedFormat = 'markdown'
  public showTrend = true
  public addReferral = true
  public formats = [
    {
      value: 'markdown',
      label: 'Markdown'
    },
    {
      value: 'AsciiDoc',
      label: 'AsciiDoc'
    },
    {
      value: 'HTML',
      label: 'HTML'
    },
    {
      value: 'reStructuredText',
      label: 'reStructuredText'
    }
  ]
  FORMATS = {
    MARKDOWN: 'markdown',
    HTML: 'HTML',
    REST: 'reStructuredText',
    ASCIIDOC: 'AsciiDoc'
  }

  async fetch(): Promise<void> {
    await this.$store.dispatch(
      `repository/detail/${RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_BADGES}`,
      {
        provider: this.$route.params.provider,
        owner: this.$route.params.owner,
        name: this.$route.params.repo
      }
    )
  }

  /**
   * Generate an URL based on user choice or use default state
   */
  get badgeImageURL(): string {
    const imgURL = this.urlBuilder({
      label: this.badgeType,
      show_trend: this.showTrend,
      token: this.repository.token
    })

    return imgURL
  }

  get badgeTargetURL(): string {
    return this.addReferral
      ? this.repository.badge?.target_url
      : this.repository.badge?.target_url.split('?')[0]
  }

  get embedCode(): string {
    switch (this.selectedFormat) {
      case this.FORMATS.MARKDOWN:
        return `[![DeepSource](${this.badgeImageURL})](${this.badgeTargetURL})`
      case this.FORMATS.HTML:
        return `<a href="${this.badgeTargetURL}}" target="_blank"><img alt="DeepSource" title="DeepSource" src="${this.badgeImageURL}"/></a>`
      case this.FORMATS.REST:
        return `.. image:: ${this.badgeImageURL}\n  :target: ${this.badgeTargetURL}`
      case this.FORMATS.ASCIIDOC:
        return `image:${this.badgeImageURL}["DeepSource", link="${this.badgeTargetURL}"]`
      default:
        return ''
    }
  }

  public urlBuilder(
    params: Record<string, string | Record<string, string> | string[][] | boolean | undefined>
  ): string {
    /**
     * Remove keys which need not be in queryString
     */
    if (params !== undefined) {
      const queryStringObj = Object.keys(params).reduce(
        (queryObj: Record<string, string>, key: string) => {
          if (params[key]) {
            queryObj[key] = String(params[key])
          }
          return queryObj
        },
        {}
      )
      const queryString = new URLSearchParams(queryStringObj).toString()

      return `${this.repository.badge?.image_url}?${queryString}`
    }
    return ''
  }
}
</script>
