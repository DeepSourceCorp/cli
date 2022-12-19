<template>
  <div class="p-1 rounded-sm bg-ink-300">
    <img :src="logo" alt="Integration logo" :class="['flex-shrink-0', dimensions]" />
  </div>
</template>

<script lang="ts">
import { ZIcon } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({
  components: {
    ZIcon
  }
})

/**
 * Component that is responsible to render integration logo container on detailed view
 */
export default class LogoContainer extends Vue {
  @Prop({ required: true })
  logo: string

  @Prop({ default: 'w-5 h-5' })
  dimensions: string
}
</script>
