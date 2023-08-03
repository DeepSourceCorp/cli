import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZLabel from './ZLabel.vue'

export default {
  title: 'Label',
  component: ZLabel,
  excludeStories: /.*Data$/
}

export const BasicLabels = () => ({
  components: { ZLabel },
  template: `<div class="padded-container h-full bg-ink-300 flex gap-3 items-end">
      <z-label state="success">Analysis Active</z-label>
      <z-label state="error">Analysis Errored</z-label>
      <z-label state="warning">Analysis Incomplete</z-label>
      <z-label >Analysis Inactive</z-label>
    </div>`
})

export const LargeLabels = () => ({
  components: { ZLabel },
  template: `<div class="padded-container h-full bg-ink-300 flex gap-3 items-end">
      <z-label size="large" state="success">Analysis Active</z-label>
      <z-label size="large" state="error">Analysis Errored</z-label>
      <z-label size="large" state="warning">Analysis Incomplete</z-label>
      <z-label size="large" >Analysis Inactive</z-label>
    </div>`
})
