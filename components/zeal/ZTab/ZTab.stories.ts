import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZTab from './ZTab.vue'

export default {
  title: 'Tab',
  component: ZTab,
  excludeStories: /.*Data$/
}

export const BasicTab = () => ({
  components: { ZTab },
  template: `<div class='padded-container'>
                <div class="gap-5 overflow-auto flex flex-nowrap">
                  <z-tab :isActive="true">Overview</z-tab>
                  <z-tab :action="clickAction">Issues</z-tab>
                  <z-tab :action="clickAction">Metrics</z-tab>
                  <z-tab :action="clickAction">Autofix</z-tab>
                  <z-tab :disabled="true">Disabled</z-tab>
                </div>
      </div>`,
  methods: {
    clickAction() {
      alert('Clicked on Tab')
    }
  }
})

export const TabWithIcons = () => ({
  components: { ZTab },
  template: `<div class='padded-container'>
              <div class="gap-5 overflow-auto flex flex-nowrap">
                <z-tab icon="code" :isActive="true">Overview</z-tab>
                <z-tab icon="code" :action="clickAction">Issues</z-tab>
                <z-tab icon="code" :action="clickAction">Metrics</z-tab>
                <z-tab icon="code" :action="clickAction">Autofix</z-tab>
                <z-tab icon="code" :disabled="true">Disabled</z-tab>
              </div>
      </div>`,
  methods: {
    clickAction() {
      alert('Clicked on Tab')
    }
  }
})

export const TabWithLinks = () => ({
  components: { ZTab },
  template: `<div class='padded-container'>
                <div class="gap-5 overflow-auto flex flex-nowrap">
                  <z-tab :isActive="true"><a href="https://deepsource.io">DeepSource</a></z-tab>
                  <z-tab><a target="blank" href="https://github.com/deepsourcelabs">Github</a></z-tab>
                  <z-tab><a target="blank" href="https://github.com/deepsourcelabs/zeal">Zeal</a></z-tab>
                  <z-tab><a target="blank" href="https://github.com/deepsourcelabs/bifrost">Bifrost</a></z-tab>
                  <z-tab :disabled="true">Bad Code</z-tab>
                </div>
      </div>`
})

export const TabWithCustomActiveColor = () => ({
  components: { ZTab },
  template: `<div class='padded-container'>
                <div class="gap-5 overflow-auto flex flex-nowrap">
                  <z-tab :isActive="true" border-active-color="vanilla-300">DeepSource</z-tab>
                  <z-tab :isActive="true" border-active-color="cherry">Github</z-tab>
                  <z-tab :isActive="true" border-active-color="honey">Zeal</z-tab>
                  <z-tab :isActive="true" border-active-color="lavender">Bifrost</z-tab>
                  <z-tab :disabled="true" border-active-color="lilac">Bad Code</z-tab>
                </div>
      </div>`
})
