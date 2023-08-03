import ZAvatarGroup from './ZAvatarGroup.vue'
import ZAvatar from '../ZAvatar/index'
import { Component } from 'vue'

export default {
  title: 'Avatar Group',
  component: ZAvatarGroup,
  excludeStories: /.*Data$/
}

export const Default = (): Component => ({
  components: { ZAvatarGroup, ZAvatar },
  template: `<div class='padded-container'>
      <z-avatar-group>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
      </z-avatar-group>
    </div>`
})

export const InLoadingState = (): Component => ({
  components: { ZAvatarGroup, ZAvatar },
  template: `
    <div class='padded-container'>
      <z-avatar-group :loading="true">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
      </z-avatar-group>
    </div>
    `
})

export const WithSizes = (): Component => ({
  components: { ZAvatarGroup, ZAvatar },
  data() {
    return {
      sizes: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl']
    }
  },
  template: `<div class='padded-container space-y-4'>
    <div v-for="size in sizes" :key="size" class="space-y-2">
      <h3 class="text-vanilla-100 text-xl font-semibold">{{ size }}</h3>
        <z-avatar-group :size="size">
          <z-avatar
            image="https://randomuser.me/api/portraits/women/24.jpg"
            user-name="Akshay Paliwal"
          />
          <z-avatar
            image="https://randomuser.me/api/portraits/women/24.jpg"
            user-name="Akshay Paliwal"
          />
          <z-avatar
            image="https://randomuser.me/api/portraits/women/24.jpg"
            user-name="Akshay Paliwal"
          />
          <z-avatar
            image="https://randomuser.me/api/portraits/women/24.jpg"
            user-name="Akshay Paliwal"
          />
        </z-avatar-group>
      </div>
    </div>`
})

export const WithLimit = (): Component => ({
  components: { ZAvatarGroup, ZAvatar },
  template: `
    <div class='padded-container'>
      <z-avatar-group class="p-2 text-vanilla-100 bg-dark" :limit="3">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
      </z-avatar-group>
      <z-avatar-group class="p-2" :limit="3">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
      </z-avatar-group>
    </div>
  `
})

export const WithUserNameOrImageOrSize = (): Component => ({
  components: { ZAvatarGroup, ZAvatar },
  template: `
    <div class='padded-container'>
      <z-avatar-group class="p-2 text-vanilla-100 bg-dark" :limit="6">
        <z-avatar
          user-name="John Doe"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
        user-name="Tom Marvolo Riddle"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
      </z-avatar-group>
      <z-avatar-group class="p-2" :limit="3" size="xl">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          user-name="Snoop Dogg"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
        ></z-avatar>
      </z-avatar-group>
    </div>
  `
})
