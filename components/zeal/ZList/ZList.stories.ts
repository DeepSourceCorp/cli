import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZList from './ZList.vue'
import ZListItem from '@/components/ZListItem/ZListItem.vue'
import ZIcon from '@/components/ZIcon/ZIcon.vue'
import ZInput from '@/components/ZInput/ZInput.vue'

export default {
  title: 'List',
  component: ZList,
  excludeStories: /.*Data$/
}

export const DefaultList = () => ({
  components: { ZList, ZListItem },
  template: `<div class='input-container'>
        <z-list class="text-vanilla-100 space-y-2" :isCollapsible="true">
            <template slot="title">
                <div class="font-medium">Heading</div>
            </template>
            <z-list-item as="a" href="#">First</z-list-item>
            <z-list-item as="a" href="#">Second</z-list-item>
            <z-list-item as="a" href="#">Third</z-list-item>
        </z-list>
        <z-accordion>
            <z-accordion-item>

            </z-accordion-item>
        </z-accordion>
    </div>`
})

export const ListWithHeadingProvided = () => ({
  components: { ZList, ZListItem },
  template: `<div class='input-container'>
        <z-list class="text-vanilla-100 text-sm space-y-2" title="Heading">
            <z-list-item as="a" href="#">First</z-list-item>
            <z-list-item as="a" href="#">Second</z-list-item>
            <z-list-item as="a" href="#">Third</z-list-item>
        </z-list>
    </div>`
})

export const ListWithHorizontalItems = () => ({
  components: { ZList, ZListItem, ZIcon },
  template: `<div class='input-container'>
        <z-list class="text-slate space-y-3" title="Languages">
            <div class="flex flex-wrap gap-x-2 gap-y-2">
                <z-list-item v-for="i in 20" :key="i" class="cursor-pointer">
                    <img src="https://i.imgur.com/6r5cdUd.png" class="h-10" />
                </z-list-item>
            </div>
        </z-list>
    </div>`
})

export const ListWithItemsAndIcons = () => ({
  components: { ZList, ZListItem, ZIcon },
  template: `<div class='input-container'>
        <z-list class="text-slate space-y-3" title="Languages">
            <div class="flex flex-col gap-y-4">
                <z-list-item v-for="i in 5" :key="i" as="a" icon="javascript" class="flex cursor-pointer items-center space-x-2">
                    Languages - {{i}}
                </z-list-item>
            </div>
        </z-list>
    </div>`
})

export const ListWithItemsFooter = () => ({
  components: { ZList, ZListItem, ZIcon },
  data() {
    return {
      links: [
        'About',
        'Customers',
        'Jobs',
        'Privacy Policy',
        'Terms of Service',
        'Press Enquiries',
        'Brand Assets'
      ]
    }
  },
  template: `<div class='input-container'>
        <z-list class="text-vanilla-400 tracking-wide space-y-3" title="Company">
            <div class="flex flex-col text-vanilla-300 space-y-2 text-sm">
                <z-list-item v-for="link in links" :key="link" as="a" href="#">{{link}}</z-list-item>
            </div>
        </z-list>
    </div>`
})

export const ListWithComplexItems = () => ({
  components: { ZList, ZListItem, ZIcon },
  template: `<div class='input-container'>
        <z-list class="text-vanilla-400 tracking-wide space-y-3" title="Company">
            <div class="flex sm:flex-col text-vanilla-300 space-x-2 sm:space-x-0 sm:space-y-2 text-sm">
                <z-list-item v-for="i in 2" :key="i">
                    <div class="flex flex-col space-y-1 text-sm text-center p-2 bg-ink-300 rounded-lg">
                        <img class="inline-block max-w-none" src="https://i.imgur.com/JBKMaq5.png"/>
                        <span>GDPR</span>
                        <span class="text-vanilla-400">compliant</span>
                    </div>
                </z-list-item>
            </div>
        </z-list>
    </div>`
})

export const ListWithDifferentTypesOfComponents = () => ({
  components: { ZList, ZListItem, ZIcon, ZInput },
  template: `<div class='w-56'>
        <z-list class="text-vanilla-400 tracking-wide space-y-3" title="Social Media">
            <div class="flex flex-col text-vanilla-300 space-y-3 text-sm">
                <z-list-item>Follow us on social media to stay updated.</z-list-item>
                <div class="flex justify-center space-x-4 py-4">
                    <z-list-item v-for="i in 3" :key="i" icon="github" icon-size="medium"></z-list-item>
                </div>
                <z-list-item class="text-vanilla-400 tracking-normal">SIGN UP FOR THE NEWSLETTER</z-list-item>
                <z-list-item>
                    <z-input v-model="name"></z-input>
                </z-list-item>
            </div>
        </z-list>
    </div>`
})
