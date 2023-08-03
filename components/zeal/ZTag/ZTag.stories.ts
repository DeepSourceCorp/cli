import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZTag from './ZTag.vue'

export default {
  title: 'Tags',
  component: ZTag,
  excludeStories: /.*Data$/
}

export const DefaultTag = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag>Tag</z-tag>
    </div>`
})

export const ColoredTag = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag>Tag</z-tag>
        <z-tag state="success">Tag</z-tag>
        <z-tag state="warning">Tag</z-tag>
        <z-tag state="error">Tag</z-tag>
        <z-tag state="info">Tag</z-tag>
    </div>`
})

export const TagWithLeftIcon = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag state="success" icon-left="star">Tag</z-tag>
    </div>`
})

export const TagWithRightIcon = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag state="success" icon-right="star">Tag</z-tag>
    </div>`
})

export const TagsWithBothIcons = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag state="success" icon-left="star" icon-right="star">Tag</z-tag>
    </div>`
})

export const TagsWithIcons = () => ({
  components: { ZTag },
  template: `<div class='padded-container flex items-center space-x-2'>
        <z-tag state="warning" icon-left="star">Tag</z-tag>
        <z-tag state="warning" icon-right="star">Tag</z-tag>
        <z-tag state="warning" icon-left="star" icon-right="star">Tag</z-tag>
    </div>`
})

export const TagsWithSizes = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag state="success" text-size="sm">Tag</z-tag>
        <z-tag state="success" text-size="lg">Tag</z-tag>
    </div>`
})

export const LargeTags = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag state="success" size="large">Tag</z-tag>
    </div>`
})

export const LargeTagWithLeftIcon = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag size="large" icon-left="star">Tag</z-tag>
        <z-tag state="success" size="large" icon-left="star">Tag</z-tag>
        <z-tag state="warning" size="large" icon-left="star">Tag</z-tag>
        <z-tag state="error" size="large" icon-left="star">Tag</z-tag>
        <z-tag state="info" size="large" icon-left="star">Tag</z-tag>
    </div>`
})

export const LargeTagWithRightIcon = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag size="large" icon-right="star">Tag</z-tag>
        <z-tag state="success" size="large" icon-right="star">Tag</z-tag>
        <z-tag state="warning" size="large" icon-right="star">Tag</z-tag>
        <z-tag state="error" size="large" icon-right="star">Tag</z-tag>
        <z-tag state="info" size="large" icon-right="star">Tag</z-tag>
    </div>`
})

export const LargeTagWithBothIcons = () => ({
  components: { ZTag },
  template: `<div class='padded-container'>
        <z-tag size="large" icon-left="star" icon-right="star">Tag</z-tag>
        <z-tag state="success" size="large" icon-left="star" icon-right="star">Tag</z-tag>
        <z-tag state="warning" size="large" icon-left="star" icon-right="star">Tag</z-tag>
        <z-tag state="error" size="large" icon-left="star" icon-right="star">Tag</z-tag>
        <z-tag state="info" size="large" icon-left="star" icon-right="star">Tag</z-tag>
    </div>`
})
