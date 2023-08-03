<template>
  <div class="grid w-full max-w-4xl gap-x-12 gap-y-6 sm:grid-cols-2">
    <div class="space-y-8">
      <enterprise-installation-logo :installation-logo="installationLogo" />

      <div class="space-y-3 text-sm leading-8 text-vanilla-400">
        <h2 class="text-lg font-medium leading-6 text-vanilla-100">Access required</h2>
        <p>
          We successfully created your DeepSource account, but we couldn’t find a team to which your
          account has access.
        </p>
        <p>
          Get in touch with one of your organization administrators and ask them to grant you
          access.
        </p>
      </div>
    </div>
    <div class="admin-contact-card hide-scroll max-h-84 space-y-5 overflow-y-auto px-6">
      <div
        v-if="loading"
        class="h-5 w-16 animate-pulse rounded-md bg-ink-200 bg-opacity-50 pt-4"
      ></div>

      <h3
        v-else
        class="pt-4 text-11px font-medium uppercase leading-6 tracking-wider text-vanilla-400"
      >
        {{ totalSuperuserCount }} {{ totalSuperuserCount === 1 ? 'admin' : 'admins' }}
      </h3>

      <div class="space-y-7">
        <template v-if="loading">
          <div
            v-for="i in 6"
            :key="i"
            class="h-38px animate-pulse rounded-md bg-ink-200 bg-opacity-50"
          ></div>
        </template>

        <template v-else>
          <a
            v-for="user in superuserList"
            :key="user.id"
            :href="`mailto:${user.email}`"
            class="flex justify-between text-slate-200 hover:text-vanilla-100"
          >
            <div class="inline-flex items-start gap-x-2.5 text-vanilla-100">
              <z-avatar
                :image="user.avatar"
                :alt="`avatar for ${user.fullName}`"
                :user-name="user.fullName || user.email"
                :fallback-image="getDefaultAvatar(user.email)"
                type="span"
              />
              <div>
                <p class="text-sm font-medium leading-6">{{ user.fullName }}</p>
                <p class="text-xs leading-5 text-vanilla-400">{{ user.email }}</p>
              </div>
            </div>
            <z-icon icon="mail" color="current" />
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getDefaultAvatar } from '~/utils/ui'

import { EnterpriseUser } from '~/types/types'

/**
 * Component for the request access view.
 * Shows list of superusers/admins to contact to request access from.
 */
@Component({
  name: 'RequestAccess',
  methods: {
    getDefaultAvatar
  }
})
export default class RequestAccess extends Vue {
  @Prop({ required: true })
  superuserList: Array<EnterpriseUser>

  @Prop({ required: true })
  totalSuperuserCount: number

  @Prop({ default: '' })
  installationLogo: string

  @Prop({ default: false })
  loading: boolean
}
</script>

<style lang="postcss" scoped>
@tailwind base;
@tailwind utilities;

.admin-contact-card {
  background: rgba(22, 24, 29, 0.6);
  border: theme('spacing.px') solid #21242c;
  backdrop-filter: blur(theme('spacing.10'));
  border-radius: theme('borderRadius.md');
}

.h-38px {
  height: 38px;
}
</style>
