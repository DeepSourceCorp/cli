import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZDivider from './ZDivider.vue'

export default {
  title: 'Divider',
  component: ZDivider,
  excludeStories: /.*Data$/
}

export const Horizontal = () => ({
  components: { ZDivider },
  template: `<div class='padded-container'>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <z-divider></z-divider>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </div>`
})

export const Vertical = () => ({
  components: { ZDivider },
  template: `<div>
        <span>Icons</span>
        <z-divider direction="vertical"></z-divider>
        <span>Layout</span>
        <z-divider direction="vertical"></z-divider>
        <span>Typography</span>
    </div>`
})
