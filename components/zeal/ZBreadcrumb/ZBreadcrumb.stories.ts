import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZBreadcrumb from './ZBreadcrumb.vue'
import ZBreadcrumbItem from './ZBreadcrumbItem/ZBreadcrumbItem.vue'

export default {
  title: 'Breadcrumb',
  component: ZBreadcrumb,
  excludeStories: /.*Data$/
}

export const BasicBreadcrumb = () => ({
  components: { ZBreadcrumb, ZBreadcrumbItem },
  template: `<div class='padded-container'>
  <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
    <z-breadcrumb-item><a href="#">Autofix</a></z-breadcrumb-item>
    <z-breadcrumb-item>Method has no argument</z-breadcrumb-item>
  </z-breadcrumb>
    </div>`
})

export const BreadcrumbWithCurrentPage = () => ({
  components: { ZBreadcrumb, ZBreadcrumbItem },
  template: `<div class='padded-container'>
  <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
    <z-breadcrumb-item><a href="#">Home</a></z-breadcrumb-item>
    <z-breadcrumb-item><a href="#">Repository</a></z-breadcrumb-item>
    <z-breadcrumb-item isCurrent>Settings</z-breadcrumb-item>
  </z-breadcrumb>
    </div>`
})
