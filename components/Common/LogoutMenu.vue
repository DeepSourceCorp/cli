<template>
  <z-menu>
    <template #trigger="{ toggle }">
      <button
        class="flex items-center gap-x-2 rounded-md bg-opacity-60 p-1.5 text-sm leading-5 text-vanilla-400 hover:bg-ink-200 focus:bg-ink-200"
        @click="toggle"
      >
        <z-avatar
          :image="avatar"
          :fallback-image="getDefaultAvatar(email)"
          :user-name="fullName"
          :loading="isLoading"
          size="xs"
          stroke=""
          type="div"
          class="flex-shrink-0"
        />
        <span>{{ email }}</span>
      </button>
    </template>
    <template #body>
      <z-menu-section :divider="false" class="py-2.5 text-left">
        <z-menu-item
          spacing="px-3.5 py-2"
          class="border-l-2 border-juniper bg-ink-200 text-sm leading-4 text-vanilla-400"
        >
          <z-avatar
            :image="avatar"
            :fallback-image="getDefaultAvatar(email)"
            :user-name="fullName"
            :loading="isLoading"
            size="xs"
            stroke=""
            type="div"
            class="flex-shrink-0"
          />
          <span>{{ email }}</span>
        </z-menu-item>
      </z-menu-section>
      <z-divider color="ink-200" margin="m-0" />
      <z-menu-section :divider="false">
        <z-menu-item
          as="button"
          spacing="px-3.5 py-2.5"
          class="w-full justify-between text-sm leading-4 text-vanilla-400"
          @click="$emit('sign-out')"
        >
          <span> Log out </span>
          <z-icon icon="arrow-right" color="current" />
        </z-menu-item>
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'nuxt-property-decorator'
import { ZIcon, ZAvatar, ZDivider, ZMenu, ZMenuItem, ZMenuSection } from '@deepsource/zeal'

import { getDefaultAvatar } from '~/utils/ui'

@Component({
  name: 'LogoutMenu',
  methods: { getDefaultAvatar },
  components: { ZIcon, ZAvatar, ZDivider, ZMenu, ZMenuItem, ZMenuSection }
})
export default class LogoutMenu extends Vue {
  @Prop({ required: true })
  email: string

  @Prop({ default: '' })
  avatar: string

  @Prop({ default: '' })
  fullName: string

  @Prop({ default: false })
  isLoading: boolean
}
</script>
