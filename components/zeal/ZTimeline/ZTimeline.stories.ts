import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZTimeline from './ZTimeline.vue'
import ZTimelineItem from './ZTimelineItem/ZTimelineItem.vue'
import ZAvatar from '../ZAvatar/ZAvatar.vue'

export default {
  title: 'Timeline',
  component: ZTimeline,
  excludeStories: /.*Data$/
}

export const BasicTimeline = () => ({
  components: { ZTimeline, ZTimelineItem },
  template: `<div class='padded-container'>
    <z-timeline>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM"></z-timeline-item>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM"></z-timeline-item>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM"></z-timeline-item>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM"></z-timeline-item>
    </z-timeline>
    </div>`
})

export const TimelineWithCustomIcon = () => ({
  components: { ZTimeline, ZTimelineItem, ZAvatar },
  template: `<div class='padded-container'>
    <z-timeline>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
      <z-timeline-item class="h-32" content="Carter Workman" timestamp="Friday, 4:24PM">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
    </z-timeline>
    </div>`
})

export const TimelineWithCustomBorderWidth = () => ({
  components: { ZTimeline, ZTimelineItem, ZAvatar },
  template: `<div class='padded-container'>
    <z-timeline>
      <z-timeline-item content="Carter Workman" timestamp="Friday, 4:24PM" border-width-class="" class="h-32">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
      <z-timeline-item content="Carter Workman" timestamp="Friday, 4:24PM" border-width-class="" class="h-32">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
      <z-timeline-item content="Carter Workman" timestamp="Friday, 4:24PM" border-width-class="" class="h-32">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
      <z-timeline-item content="Carter Workman" timestamp="Friday, 4:24PM" border-width-class="" class="h-32">
        <template slot="icon">
        <z-avatar
          image="https://randomuser.me/api/portraits/women/24.jpg"
          user-name="Akshay Paliwal"
          size="sm"
        ></z-avatar></template>
      </z-timeline-item>
    </z-timeline>
    </div>`
})
