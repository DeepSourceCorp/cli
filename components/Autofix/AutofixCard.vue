<template>
  <nuxt-link
    :to="path"
    class="p-3 bg-ink-300 hover:bg-ink-200 flex flex-col justify-between space-y-2 rounded-md cursor-pointer min-h-28"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-normal text-vanilla-300 flex-1 leading-none">{{
        analyzer.name
      }}</span>
      <analyzer-logo v-bind="analyzer" />
    </div>
    <h4
      class="text-vanilla-400 font-normal text-lg overflow-ellipsis whitespace-nowrap overflow-x-hidden"
    >
      <span class="font-bold text-vanilla-100">
        {{ count }} {{ issueCount > 1 ? 'issues' : 'issue' }}
      </span>
      in {{ files }} {{ filesAffected > 1 ? 'files' : 'file' }}
    </h4>
    <div class="text-vanilla-400 flex space-x-2 items-center text-sm">
      <z-icon icon="autofix" size="small" color="vanilla-400"></z-icon>
      <span>Autofix</span>
      <z-icon icon="arrow-right" size="small" color="vanilla-400"></z-icon>
    </div>
  </nuxt-link>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { shortenLargeNumber } from '@/utils/string'

@Component({
  components: {
    ZIcon
  }
})
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

  get count(): string {
    return shortenLargeNumber(Number(this.issueCount))
  }

  get files(): string {
    return shortenLargeNumber(Number(this.filesAffected))
  }
}
</script>
