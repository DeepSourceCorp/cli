import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZTicker from './ZTicker.vue'

export default {
  title: 'Ticker',
  component: ZTicker,
  excludeStories: /.*Data$/
}

export const DefaultTicker = () => ({
  components: { ZTicker },

  template: `<div class='padded-container'>
        <div class="input-container">
            <z-ticker></z-ticker>
        </div>
    </div>`
})

export const NegativeTicker = () => ({
  components: { ZTicker },

  template: `<div class='padded-container'>
        <div class="input-container">
            <z-ticker class="text-vanilla" color="cherry" arrowDirection="down" value="44%"></z-ticker>
        </div>
    </div>`
})

export const TickerWithoutIcon = () => ({
  components: { ZTicker },

  template: `<div class='padded-container'>
        <div class="input-container">
            <z-ticker class="text-vanilla" color="cherry" value="44%" :hide-icon="true"></z-ticker>
        </div>
    </div>`
})

export const TickerWithContent = () => ({
  components: { ZTicker },

  template: `<div class='padded-container'>
        <div class="input-container">
            <z-ticker class="text-vanilla-200 space-x-1" color="juniper" arrowDirection="up" value="44%">
              <template slot="content">
                <span class="text-sm">since last week</span>
              </template>
            </z-ticker>
        </div>
    </div>`
})
