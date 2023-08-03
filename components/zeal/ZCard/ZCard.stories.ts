import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZCard from './ZCard.vue'

export default {
  title: 'Card',
  component: ZCard,
  excludeStories: /.*Data$/
}

export const CardWithNamedSlots = () => ({
  components: { ZCard },
  template: `<div class="wrapper w-1/3">
      <z-card class="p-0 bg-ink-400">
        <template slot="header">
            <img src="https://www.kindpng.com/picc/m/4-46830_chris-evans-png-transparent-png.png" class="w-full block object-fill">
        </template>
        <template slot="body">
          <div class="p-6">
              <p>"DeepSource has made the code base <span class="text-juniper">much more stable and dependable</span>. It allowed us to identify many more areas for improvement."</p>
          </div>
        </template>
        <template slot="footer">
            <div class="p-6">
              <p class="font-medium block">Chris Evans</p>
              <p class="font-normal block text-sm">The First Avenger</p>
          </div>
        </template>
      </z-card>
    </div>`
})
