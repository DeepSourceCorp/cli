<template>
  <div class="bg-ink-300 border border-ink-200 rounded-md py-4">
    <p class="uppercase px-4 pb-4 text-vanilla-400 text-xs leading-5 tracking-wider">
      VCS provider connections
    </p>
    <div
      :class="autofixAvailable && autofixEnabled ? 'py-4' : 'pt-4'"
      class="flex justify-between px-4 border-t border-ink-200"
    >
      <component
        :is="vcsInstallationUrl ? 'a' : 'div'"
        :href="vcsInstallationUrl || false"
        class="flex gap-x-2.5 items-center group"
      >
        <z-icon :icon="vcsProviderIcon" />
        <div class="text-sm">
          {{ vcsProviderDisplay }}
          <span class="text-vanilla-400">— {{ teamName }}</span>
          <z-icon
            v-if="vcsInstallationUrl"
            icon="arrow-up-right"
            class="inline group-hover:ml-0.5"
          />
        </div>
      </component>

      <component
        :is="vcsInstallationUrl ? 'a' : 'div'"
        :href="vcsInstallationUrl || false"
        :class="{ 'hover:opacity-80': vcsInstallationUrl }"
        class="flex items-center gap-x-1 bg-ink-200 border border-ink-50 rounded-sm px-2"
      >
        <z-icon icon="check" />
        <span class="text-vanilla-400 text-sm">Installed</span>
      </component>
    </div>

    <!-- TODO: add install autofix CTA -->
    <div
      v-if="autofixAvailable && autofixEnabled"
      class="flex justify-between px-4 pt-4 border-t border-ink-200"
    >
      <component
        :is="autofixInstallationUrl ? 'a' : 'div'"
        :href="autofixInstallationUrl || false"
        class="flex gap-x-2.5 items-center group"
      >
        <z-icon icon="autofix" color="juniper" />

        <div class="text-sm">
          DeepSource Autofix

          <z-icon
            v-if="autofixInstallationUrl"
            icon="arrow-up-right"
            class="inline group-hover:ml-0.5"
          />
        </div>
      </component>

      <component
        v-if="autofixEnabled"
        :is="autofixInstallationUrl ? 'a' : 'div'"
        :href="autofixInstallationUrl || false"
        :class="{ 'hover:opacity-80': autofixInstallationUrl }"
        class="flex items-center gap-x-1 bg-ink-200 border border-ink-50 rounded-sm px-2"
      >
        <z-icon icon="check" />
        <span class="text-vanilla-400 text-sm">Installed</span>
      </component>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'

@Component({
  components: {
    ZIcon
  }
})
export default class VcsConnections extends Vue {
  @Prop({ required: true })
  vcsInstallationUrl: string

  @Prop({ required: true })
  vcsProviderDisplay: string

  @Prop({ required: true })
  vcsProviderIcon: string

  @Prop({ required: true })
  teamName: string

  @Prop({ default: false })
  autofixAvailable: boolean

  @Prop({ default: false })
  autofixEnabled: boolean

  @Prop({ default: '' })
  autofixInstallationUrl: string
}
</script>
