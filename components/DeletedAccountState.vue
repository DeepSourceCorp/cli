<template>
  <div class="w-full flex relative">
    <div
      class="absolute w-1/2 -top-102 inset-x-1/4 rounded-full intermediate-page-gradient-layer"
    ></div>
    <div
      class="flex flex-col mx-auto justify-between min-h-screen pt-32 pb-24 text-sm text-center text-vanilla-400"
    >
      <div class="flex items-center flex-grow">
        <slot>
          <empty-state
            :png-image-path="require('~/assets/images/ui-states/user-deleted.gif')"
            :webp-image-path="require('~/assets/images/ui-states/user-deleted.webp')"
            class="space-y-8"
          >
            <template #title>
              <span class="text-base">Your {{ accountType }} has been deleted.</span></template
            >
            <template #subtitle> Redirecting to deepsource.io... </template>
          </empty-state>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Component to show deleted user account or team account intermediate state
 */
@Component({ name: 'DeletedAccountState' })
export default class DeletedAccountState extends Vue {
  @Prop({
    default: 'team',
    validator: (value: string) => ['team', 'account'].includes(value)
  })
  accountType: string
}
</script>
