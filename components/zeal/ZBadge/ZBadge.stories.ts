import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZBadge from './ZBadge.vue'
import ZButton from '~/components/zeal/ZButton'
import ZAvatar from '~/components/zeal/ZAvatar'

export default {
  title: 'Badge',
  component: ZBadge,
  excludeStories: /.*Data$/
}

export const BasicBadge = () => ({
  components: { ZBadge, ZButton },
  template: `<div class='padded-container'>
        <z-badge type="danger" :value="12">
            <z-button color="primary">Likes</z-button>
        </z-badge>
    </div>`
})

export const BadgeWithDifferentTypes = () => ({
  components: { ZBadge, ZButton },
  template: `<div class='padded-container flex space-x-8'>
        <z-badge type="success" value="new">
            <z-button color="secondary">Likes</z-button>
        </z-badge>
         <z-badge type="warning" value="new">
            <z-button color="secondary">Likes</z-button>
        </z-badge>
         <z-badge type="info" value="new">
            <z-button color="secondary">Likes</z-button>
        </z-badge>
         <z-badge type="danger" value="new">
            <z-button color="secondary">Likes</z-button>
        </z-badge>
    </div>`
})

export const BadgeWithMaxSize = () => ({
  components: { ZBadge, ZButton },
  template: `<div class='padded-container'>
        <z-badge type="success" :value="150" :max="99">
            <z-button color="secondary">Filter</z-button>
        </z-badge>
    </div>`
})

export const DotBadge = () => ({
  components: { ZBadge, ZButton },
  template: `<div class='padded-container'>
        <z-badge type="success" is-dot>
            <z-button color="secondary">Filter</z-button>
        </z-badge>
    </div>`
})

export const DotBadgeWithDifferentSizes = () => ({
  components: { ZBadge, ZButton },
  template: `<div class='padded-container flex space-x-8'>
        <z-badge type="success" is-dot size="sm">
            <z-button color="secondary">Filter</z-button>
        </z-badge>
        <z-badge type="success" is-dot size="md">
            <z-button color="secondary">Filter</z-button>
        </z-badge>
        <z-badge type="success" is-dot size="lg">
            <z-button color="secondary">Filter</z-button>
        </z-badge>
    </div>`
})

export const DotBadgeWithCustomPositioning = () => ({
  components: { ZBadge, ZButton, ZAvatar },
  template: `<div class='padded-container'>
        <z-badge is-dot type="warning" size="md" position="top-1 right-1">
            <z-avatar
            user-name="Akshay Paliwal"
            size="md"
            ></z-avatar>
        </z-badge>
    </div>`
})

export const StandAloneNotification = () => ({
  components: { ZBadge, ZButton, ZAvatar },
  template: `<div class='padded-container flex space-x-2'>
        <span class="text-vanilla-100">Metrics</span>
        <z-badge type="danger" :value="12" :isNotification="true">
        </z-badge>
    </div>`
})
