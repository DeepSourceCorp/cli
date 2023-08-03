import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZExpandable from './ZExpandable.vue'

export default {
  title: 'Expandables',
  component: ZExpandable,
  excludeStories: /.*Data$/
}

export const DefaultExpandable = () => ({
  components: { ZExpandable },
  template: `
    <div class="expandable-container">
        <z-expandable>
            <template slot="header">
                <p>Non-iterable value used in an iterating context</p>
            </template>
            <template slot="content">
                <p>
                    Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.
                </p>
            </template>
        </z-expandable>
        <z-expandable>
            <template slot="header">
                <p>Non-iterable value used in an iterating context</p>
            </template>
            <template slot="content">
                <p>
                    Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.
                </p>
            </template>
        </z-expandable>
    </div>`
})

export const OpenedExpandable = () => ({
  components: { ZExpandable },
  template: `
    <div class="expandable-container">
        <z-expandable :open="true" :key="1">
            <template slot="header">
                <p>Non-iterable value used in an iterating context</p>
            </template>
            <template slot="content">
                <p>
                    Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.
                </p>
            </template>
        </z-expandable>
        <z-expandable :open="true" :key="2">
            <template slot="header">
                <p>Non-iterable value used in an iterating context</p>
            </template>
            <template slot="content">
                <p>
                    Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.
                </p>
            </template>
        </z-expandable>
    </div>`
})
