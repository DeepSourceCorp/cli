<template>
  <nuxt-link
    :to="path"
    class="flex min-h-28 cursor-pointer flex-col justify-between space-y-2 rounded-md bg-ink-300 p-3 hover:bg-ink-200"
  >
    <div class="flex items-center justify-between">
      <span class="flex-1 text-sm font-normal leading-none text-vanilla-300">{{
        analyzer.name
      }}</span>
      <analyzer-logo v-bind="analyzer" />
    </div>
    <h4
      class="overflow-x-hidden overflow-ellipsis whitespace-nowrap text-lg font-normal text-vanilla-400"
    >
      <span class="font-bold text-vanilla-100">
        {{ count }} {{ issueCount > 1 ? 'issues' : 'issue' }}
      </span>
      in {{ files }} {{ filesAffected > 1 ? 'files' : 'file' }}
    </h4>
    <div class="flex items-center space-x-2 text-sm text-vanilla-400">
      <z-icon icon="autofix" size="small" color="vanilla-400" />
      <span>Autofix</span>
      <z-icon icon="arrow-right" size="small" color="vanilla-400" />
    </div>
  </nuxt-link>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { shortenLargeNumber } from '@/utils/string'

@Component({})
export default class AutofixCard extends Vue {
  @Prop()
  analyzer!: Record<string, string>

  @Prop()
  issueCount!: string

  @Prop()
  filesAffected!: string

  get path(): string {
    return this.$generateRoute([
      `issues?page=1&analyzer=${this.analyzer.shortcode}&autofixAvailable=true`
    ])
  }

  get count(): number | string {
    return shortenLargeNumber(Number(this.issueCount))
  }

  get files(): number | string {
    return shortenLargeNumber(Number(this.filesAffected))
  }
}
</script>
