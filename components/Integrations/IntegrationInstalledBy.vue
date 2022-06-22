<template>
  <div class="flex items-center text-xs gap-x-1 text-vanilla-400 mb-7">
    <span>Installed by</span>
    <z-avatar
      :image="avatar"
      :user-name="userName"
      size="xs"
      class="flex-shrink-0 leading-none rounded-full"
    />
    <span class="text-xs font-medium leading-none text-vanilla-100">{{ userName }}</span>
    <span>on {{ formatDate(enabledOn) }} </span>
  </div>
</template>

<script lang="ts">
import { ZAvatar } from '@deepsourcelabs/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { formatDate } from '~/utils/date'

/**
 * Component that is responsible to render the integration logo and name on detailed view
 */
@Component({
  components: { ZAvatar },
  methods: {
    formatDate
  }
})
export default class IntegrationInstalledOn extends Vue {
  @Prop({ required: true })
  enabledOn: string

  @Prop({ required: true })
  avatar: string

  @Prop({ required: true })
  userName: string
}
</script>
