import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZTabs from './ZTabs.vue'
import ZTabItem from './ZTabItem'
import ZTabList from './ZTabList'
import ZTabPanes from './ZTabPanes'
import ZTabPane from './ZTabPane'

export default {
  title: 'Tabs',
  component: ZTabs,
  excludeStories: /.*Data$/
}

export const BasicTabs = () => ({
  components: { ZTabs, ZTabList, ZTabItem, ZTabPanes, ZTabPane },
  template: `<div class='padded-container'>
              <z-tabs>
                <z-tab-list>
                  <z-tab-item>Overview</z-tab-item>
                  <z-tab-item>Issues</z-tab-item>
                  <z-tab-item>Metrics</z-tab-item>
                  <z-tab-item>Autofix</z-tab-item>
                </z-tab-list>
                <z-tab-panes class="p-4">
                  <z-tab-pane>Overview of the code.</z-tab-pane>
                  <z-tab-pane>There are the list of issues.</z-tab-pane>
                  <z-tab-pane>This are metrics.</z-tab-pane>
                  <z-tab-pane>Works like magic</z-tab-pane>
                </z-tab-panes>
              </z-tabs>
      </div>`
})

export const DisabledTabs = () => ({
  components: { ZTabs, ZTabList, ZTabItem, ZTabPanes, ZTabPane },
  template: `<div class='padded-container'>
              <z-tabs>
                <z-tab-list>
                  <z-tab-item>Overview</z-tab-item>
                  <z-tab-item>Issues</z-tab-item>
                  <z-tab-item :disabled="true">Metrics</z-tab-item>
                  <z-tab-item :disabled="true">Autofix</z-tab-item>
                </z-tab-list>
                <z-tab-panes class="p-4">
                  <z-tab-pane>Overview of the code.</z-tab-pane>
                  <z-tab-pane>There are the list of issues.</z-tab-pane>
                  <z-tab-pane>This are metrics.</z-tab-pane>
                  <z-tab-pane>Works like magic</z-tab-pane>
                </z-tab-panes>
              </z-tabs>
      </div>`
})

export const TabsWithIcons = () => ({
  components: { ZTabs, ZTabList, ZTabItem, ZTabPanes, ZTabPane },
  template: `<div class='padded-container'>
              <z-tabs>
                <z-tab-list class="bg-ink-300 p-4 pb-0">
                  <z-tab-item icon="activity">
                    Overview
                  </z-tab-item>
                  <z-tab-item icon="autofix">
                    Issues
                  </z-tab-item>
                  <z-tab-item icon="bar-chart">
                    Metrics
                  </z-tab-item>
                  <z-tab-item icon="settings">
                    Settings
                  </z-tab-item>
                </z-tab-list>
                <z-tab-panes class="p-4">
                  <z-tab-pane>Overview of the code.</z-tab-pane>
                  <z-tab-pane>There are the list of issues.</z-tab-pane>
                  <z-tab-pane>This are metrics.</z-tab-pane>
                  <z-tab-pane>Works like magic</z-tab-pane>
                </z-tab-panes>
              </z-tabs>
      </div>`
})

export const MixedTabs = () => ({
  components: { ZTabs, ZTabList, ZTabItem, ZTabPanes, ZTabPane },
  template: `<div class='padded-container'>
              <z-tabs>
                <z-tab-list class="bg-ink-300 p-4 pb-0">
                  <z-tab-item icon="activity">
                    With Icon
                  </z-tab-item>
                  <z-tab-item :disabled="true" icon="bar-chart">
                    With Icon Disabled
                  </z-tab-item>
                  <z-tab-item>
                    Without Icon
                  </z-tab-item>
                  <z-tab-item :disabled="true">
                    Without Icon Disabled
                  </z-tab-item>
                </z-tab-list>
                <z-tab-panes class="p-4">
                  <z-tab-pane>This is a tab with an icon</z-tab-pane>
                  <z-tab-pane>This is a disabled tab with icon.</z-tab-pane>
                  <z-tab-pane>This is a tab without icon.</z-tab-pane>
                  <z-tab-pane>This is a disabled tab without icon </z-tab-pane>
                </z-tab-panes>
              </z-tabs>
      </div>`
})

export const TabsWithoutIndicators = () => ({
  components: { ZTabs, ZTabList, ZTabItem, ZTabPanes, ZTabPane },
  template: `<div class='padded-container'>
              <z-tabs>
                <z-tab-list>
                  <z-tab-item :removeIndicatorStyles="true">Overview</z-tab-item>
                  <z-tab-item :removeIndicatorStyles="true">Issues</z-tab-item>
                  <z-tab-item :removeIndicatorStyles="true">Metrics</z-tab-item>
                  <z-tab-item :removeIndicatorStyles="true">Autofix</z-tab-item>
                </z-tab-list>
                <z-tab-panes class="p-4">
                  <z-tab-pane>Overview of the code.</z-tab-pane>
                  <z-tab-pane>There are the list of issues.</z-tab-pane>
                  <z-tab-pane>This are metrics.</z-tab-pane>
                  <z-tab-pane>Works like magic</z-tab-pane>
                </z-tab-panes>
              </z-tabs>
      </div>`
})
