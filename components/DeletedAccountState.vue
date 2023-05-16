<template>
  <div class="relative flex w-full">
    <div
      class="intermediate-page-gradient-layer absolute inset-x-1/4 -top-102 w-1/2 rounded-full"
    ></div>
    <div
      class="mx-auto flex min-h-screen flex-col justify-between pt-32 pb-24 text-center text-sm text-vanilla-400"
    >
      <div class="flex flex-grow items-center">
        <slot>
          <empty-state
            :png-image-path="require('~/assets/images/ui-states/user-deleted.gif')"
            :webp-image-path="require('~/assets/images/ui-states/user-deleted.webp')"
            class="space-y-8"
          >
            <template #title>
              <span class="text-base">Your {{ accountType }} has been deleted.</span></template
            >
            <template #subtitle> Redirecting to deepsource.com... </template>
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
