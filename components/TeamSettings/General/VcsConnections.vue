<template>
  <div class="rounded-md border border-ink-200 bg-ink-300 py-4">
    <p class="px-4 pb-4 text-xs uppercase leading-5 tracking-wider text-vanilla-400">
      VCS provider connections
    </p>
    <div
      :class="autofixAvailable && autofixEnabled ? 'py-4' : 'pt-4'"
      class="flex justify-between border-t border-ink-200 px-4"
    >
      <component
        :is="vcsInstallationUrl ? 'a' : 'div'"
        :href="vcsInstallationUrl || false"
        class="group flex items-center gap-x-2.5"
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
        class="flex items-center gap-x-1 rounded-sm border border-ink-50 bg-ink-200 px-2"
      >
        <z-icon icon="check" />
        <span class="text-sm text-vanilla-400">Installed</span>
      </component>
    </div>

    <!-- TODO: add install autofix CTA -->
    <div
      v-if="autofixAvailable && autofixEnabled"
      class="flex justify-between border-t border-ink-200 px-4 pt-4"
    >
      <component
        :is="autofixInstallationUrl ? 'a' : 'div'"
        :href="autofixInstallationUrl || false"
        class="group flex items-center gap-x-2.5"
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
        :is="autofixInstallationUrl ? 'a' : 'div'"
        v-if="autofixEnabled"
        :href="autofixInstallationUrl || false"
        :class="{ 'hover:opacity-80': autofixInstallationUrl }"
        class="flex items-center gap-x-1 rounded-sm border border-ink-50 bg-ink-200 px-2"
      >
        <z-icon icon="check" />
        <span class="text-sm text-vanilla-400">Installed</span>
      </component>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
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
