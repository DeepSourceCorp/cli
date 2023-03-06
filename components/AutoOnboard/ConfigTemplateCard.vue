<template>
  <base-card :to="$generateRoute(['settings', 'auto-onboard', shortcode])">
    <template slot="title">
      <span class="text-base">{{ title }}</span>
    </template>
    <template slot="description">
      <p class="line-clamp-1 text-sm">
        {{ description }}
      </p>
    </template>
    <template slot="info">
      <div class="flex items-center justify-around h-full">
        <z-button
          v-tooltip="'Edit template'"
          v-if="allowCrud"
          icon="edit"
          button-type="ghost"
          @click.stop.prevent="editTemplate"
          icon-color="vanilla-400 opacity-75"
          size="small"
        ></z-button>
        <z-button
          v-tooltip="'Use template'"
          @click.stop.prevent="onboard"
          :icon="loadOnboarding ? 'spin-loader' : 'fast-forward'"
          :icon-color="
            loadOnboarding ? 'vanilla-400 opacity-75 animate-spin' : 'vanilla-400 opacity-75'
          "
          button-type="ghost"
          size="small"
        ></z-button>
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsource/zeal'

@Component({
  components: {
    ZIcon,
    ZButton
  }
})
export default class ConfigTemplateCard extends Vue {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true })
  shortcode: string

  @Prop({ default: false })
  loadOnboarding: boolean

  @Prop({ default: true })
  allowCrud: boolean

  onboard() {
    this.$emit('onboard', {
      title: this.title,
      shortcode: this.shortcode
    })
  }

  async editTemplate(): Promise<void> {
    await this.$router.push(this.$generateRoute(['settings', 'auto-onboard', this.shortcode]))
    setTimeout(() => {
      this.$root.$emit('auto-onboard-config-edit', this.shortcode)
    }, 400)
  }
}
</script>
