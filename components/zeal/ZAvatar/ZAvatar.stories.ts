import { Component } from 'vue'
import ZAvatar from './ZAvatar.vue'

export default {
  title: 'Avatar',
  component: ZAvatar,
  excludeStories: /.*Data$/
}

export const AsASpan = (): Component => ({
  components: { ZAvatar },
  template: `
    <div class='padded-container'>
      <z-avatar
        type="span"
        image="https://randomuser.me/api/portraits/women/24.jpg"
        user-name="Akshay Paliwal"
        href="https://example.com"
      ></z-avatar>
    </div>
    `
})

export const BrokenAvatarWithFallback = (): Component => ({
  components: { ZAvatar },
  template: `
    <div class='padded-container'>
      <z-avatar
        type="span"
        image="https://deepsource.io/broken-image"
        fallback-image="https://pbs.twimg.com/media/BXhh-sfIAAArh4S.jpg"
        user-name="Akshay Paliwal"
        href="https://example.com"
      />
    </div>
    `
})

export const InLoadingState = (): Component => ({
  components: { ZAvatar },
  template: `
    <div class='padded-container'>
      <z-avatar
        :loading="true"
        type="link"
        image="https://randomuser.me/api/portraits/women/24.jpg"
        user-name="Akshay Paliwal"
        href="https://example.com"
      ></z-avatar>
    </div>
    `
})

export const WithUserName = (): Component => ({
  components: { ZAvatar },
  template: `
    <div class='padded-container'>
      <z-avatar
        user-name="Akshay Paliwal"
      ></z-avatar>
    </div>
    `
})

export const WithImageAndUserName = (): Component => ({
  components: { ZAvatar },
  template: `<div class='padded-container'>
      <z-avatar
        image="https://static.deepsource.io/avatars/ea226af3-a3a2-4f9f-ba5b-bce3225d1f80.svg"
        user-name="Akshay Paliwal"
      ></z-avatar>
    </div>`
})

export const WithSizes = (): Component => ({
  components: { ZAvatar },
  template: `
    <div class='bg-dark padded-container'>
      <div class='padded-container'>
      <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="2xs"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="xs"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="md"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="lg"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="xl"
        ></z-avatar>
      </div>
      <div class='padded-container bg-vanilla-100'>
      <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="2xs"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="xs"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="md"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="lg"
        ></z-avatar>
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="xl"
        ></z-avatar>
      </div>
      <div class='padded-container'>
        <z-avatar
          user-name="Akshay Paliwal"
          size="2xs"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="xs"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="md"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="lg"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="xl"
        ></z-avatar>
      </div>
      <div class='bg-vanilla-100 padded-container'>
        <z-avatar
          user-name="Akshay Paliwal"
          size="2xs"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="xs"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="md"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="lg"
        ></z-avatar>
        <z-avatar
          user-name="Akshay Paliwal"
          size="xl"
        ></z-avatar>
      </div>
    </div>
    `
})

export const WithRectangularImages = (): Component => ({
  components: { ZAvatar },
  template: `<div class='padded-container'>
      <z-avatar
        image="https://picsum.photos/id/237/200/400"
        user-name="Doggy McDogFace"
        size="xl"
      ></z-avatar>
      <z-avatar
        image="https://picsum.photos/id/237/400/200"
        user-name="Doggy McDogFace"
        size="xl"
      ></z-avatar>
    </div>`
})
