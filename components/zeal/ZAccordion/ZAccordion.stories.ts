import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import './ZAccordionItemMaxHeightStyle.css'

import ZAccordion from './ZAccordion.vue'
import ZAccordionItem from '@/components/ZAccordionItem/ZAccordionItem.vue'
import ZIcon from '@/components/ZIcon/ZIcon.vue'
import ZButton from '@/components/ZButton/ZButton.vue'
import ZInput from '@/components/ZInput/ZInput.vue'
import Vue from 'vue'

export default {
  title: 'Accordion',
  component: ZAccordion
}

/**
 * UI state representing default Accordion behavior
 *
 * @returns {ExtendedVue}
 */
export const DefaultAccordion = () => ({
  components: { ZAccordion, ZAccordionItem },
  template: `<div class='padded-container input-container'>
        <z-accordion class="text-vanilla-100">
          <z-accordion-item title="Consistency" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
          <z-accordion-item title="Feedback" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
          <z-accordion-item title="Efficiency" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
        </z-accordion>
    </div>`
})

/**
 * UI state representing Accordion with base style
 *
 * @returns {ExtendedVue}
 */
export const AccordionWithBaseStyle = () => ({
  components: { ZAccordion, ZAccordionItem },
  template: `<div class='padded-container input-container'>
        <z-accordion class="text-vanilla-100" :showBorders="true">
          <z-accordion-item title="Consistency" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
          <z-accordion-item title="Feedback" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
          <z-accordion-item title="Efficiency" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
        </z-accordion>
    </div>`
})

/**
 * UI state representing Accordion with controlled cards
 *
 * @returns {ExtendedVue}
 */
export const AccordionWithControlledCards = () => {
  return Vue.extend({
    components: { ZAccordion, ZAccordionItem, ZButton },
    data() {
      return {
        currentIndex: 0,
        buttons: [0, 1, 2]
      }
    },
    methods: {
      updateIndex(index: number) {
        this.currentIndex = index
      }
    },
    template: `<div class='padded-container input-container'>
          <div class="flex flex-row gap-4">
            <z-button v-for="(button, index) in buttons" :buttonType="currentIndex === index ? 'primary' : 'secondary'" @click="() => updateIndex(index)">{{index}}</z-button>
          </div>
          <z-accordion class="text-vanilla-100" :showBorders="true">
            <z-accordion-item title="Consistency" :is-open="currentIndex === 0" class="p-4">
              <template v-slot:title="{ open }">
                <div class="flex items-center cursor-pointer w-full" @click="() => updateIndex(0)">
                  <span class="flex-1 font-medium text-vanilla-100">Consistency</span>
                  <z-icon icon="chevron-right" 
                      size="small" color="slate" 
                      class="transform"
                      :class="open ? 'animate-first-quarter-spin rotate-90' : 'animate-reverse-quarter-spin rotate-0'"></z-icon>
                </div>
              </template>
              <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
              <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
            </z-accordion-item>
            <z-accordion-item title="Feedback" :is-open="currentIndex === 1" class="p-4">
              <template v-slot:title="{ open }">
                <div class="flex items-center cursor-pointer w-full" @click="() => updateIndex(1)">
                  <span class="flex-1 font-medium text-vanilla-100">Feedback</span>
                  <z-icon icon="chevron-right" 
                      size="small" color="slate" 
                      class="transform"
                      :class="open ? 'animate-first-quarter-spin rotate-90' : 'animate-reverse-quarter-spin rotate-0'"></z-icon>
                </div>
              </template>
              <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
              <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
            </z-accordion-item>
            <z-accordion-item title="Efficiency" :is-open="currentIndex === 2" class="p-4">
              <template v-slot:title="{ open }">
                <div class="flex items-center cursor-pointer w-full" @click="() => updateIndex(2)">
                  <span class="flex-1 font-medium text-vanilla-100">Efficiency</span>
                  <z-icon icon="chevron-right" 
                      size="small" color="slate" 
                      class="transform"
                      :class="open ? 'animate-first-quarter-spin rotate-90' : 'animate-reverse-quarter-spin rotate-0'"></z-icon>
                </div>
              </template>
              <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
              <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
            </z-accordion-item>
          </z-accordion>
      </div>`
  })
}

/**
 * UI state representing Accordion with disabled state
 *
 * @returns {ExtendedVue}
 */
export const AccordionWithDisabledState = () => ({
  components: { ZAccordion, ZAccordionItem },
  template: `<div class='padded-container input-container'>
        <z-accordion class="text-vanilla-100" :showBorders="true" :disabled="true">
          <z-accordion-item title="Consistency" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
          <z-accordion-item title="Feedback" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
          <z-accordion-item title="Efficiency" class="p-4">
            <div>Consistent with real life: in line with the process and logic of real life, and comply with languages and habits that the users are used to;</div>
            <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
          </z-accordion-item>
        </z-accordion>
    </div>`
})

/**
 * UI state representing Accordion used in navbar
 *
 * @returns {ExtendedVue}
 */
export const AccordionUsedInNavBar = () => ({
  components: { ZAccordion, ZAccordionItem },
  data() {
    return {
      links: ['Documentation', 'Discourse Form', 'Learning Center', 'Blog', 'Slack User Group']
    }
  },
  template: `<div class='padded-container input-container'>
        <z-accordion class="text-vanilla-100">
          <z-accordion-item title="Resources" class="font-medium p-4">
            <div class="flex flex-col text-sm space-y-4 py-3">
              <a v-for="link in links" :key="link" href="#" class="hover:text-juniper transition-all duration-75 ease-in-out">{{link}}</a>
            </div>
          </z-accordion-item>
        </z-accordion>
    </div>`
})

/**
 * UI state representing Accordion used in header
 *
 * @returns {ExtendedVue}
 */
export const AccordionUsedInHeader = () => ({
  components: { ZAccordion, ZAccordionItem, ZIcon },
  data() {
    return {
      openAccordion: false,
      links: ['Documentation', 'Discourse Form', 'Learning Center', 'Blog', 'Slack User Group']
    }
  },
  template: `<div class='padded-container flex items-center w-52'>
        <z-accordion class="text-vanilla-100 w-full">
          <z-accordion-item :is-open="openAccordion" class="p-4">
            <template v-slot:title="{ open, toggleAccordion }">
              <div class="flex items-center cursor-pointer w-full" @click="toggleAccordion()">
                <span class="flex-1 font-medium text-slate">Resources</span>
                <z-icon icon="chevron-right" 
                    size="small" color="slate" 
                    class="transform"
                    :class="open ? 'animate-first-quarter-spin rotate-90' : 'animate-reverse-quarter-spin rotate-0'"></z-icon>
              </div>
            </template>
            <div class="flex flex-col text-sm space-y-4 py-3">
              <a v-for="link in links" :key="link" href="#" class="hover:text-juniper transition-all duration-75 ease-in-out">{{link}}</a>
            </div>
          </z-accordion-item>
        </z-accordion>
    </div>`
})

/**
 * UI state representing list like Accordion items
 *
 * @returns {ExtendedVue}
 */
export const ListLikeAccordion = () => ({
  components: { ZAccordion, ZAccordionItem, ZIcon },
  data() {
    return {
      openAccordion: false,
      links: ['Documentation', 'Discourse Form', 'Learning Center', 'Blog', 'Slack User Group']
    }
  },
  template: `<div class='padded-container flex items-center w-52'>
        <z-accordion class="text-vanilla-100 w-full">
          <z-accordion-item :is-open="openAccordion" :is-list="true" title="List Items" class="p-4">
            <div class="flex flex-col text-sm space-y-4 py-3">
              <a v-for="link in links" :key="link" href="#" class="hover:text-juniper transition-all duration-75 ease-in-out">{{link}}</a>
            </div>
          </z-accordion-item>
        </z-accordion>
    </div>`
})

/**
 * UI state representing Accordion items as footer list
 *
 * @returns {ExtendedVue}
 */
export const WebNextFooter = () => ({
  components: { ZAccordion, ZAccordionItem, ZIcon, ZButton, ZInput },
  data() {
    return {
      openAccordion: false,
      name: '',
      product: ['Autofix', 'Code formatters', 'Pricing', 'Security'],
      languages: ['For Python', 'For Go', 'For Ruby', 'For JavaScript'],
      resources: ['Documentation', 'Blog', 'Changelog', 'Slack user group'],
      company: [
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
  computed: {
    isMobile() {
      return window.innerWidth < 768
    }
  },
  template: `<div class="h-screen w-full">
        <div class="prose prose-md max-w-none p-20">
        <h1 v-for="i in 8">Some random heading to grab attention</h1>
        </div>
        <footer class="w-full p-12 flex flex-col md:space-y-0 space-y-2 md:grid grid-rows-footer grid-cols-footer gap-x-8 gap-y-4 bg-transparent text-vanilla-100 border-t border-ink-200 min-h-102 bg-gradient-dark_dawn animate-gradient bg-400%">
            <div class="flex row-start-1 row-end-1 col-start-1 col-end-1">
                <img class="max-w-none h-8" src="https://i.imgur.com/zKLLWIr.png"/>
            </div>
            <z-accordion-item :is-list="!isMobile" title="Product" class="row-start-1 row-end-1 col-start-2 col-end-2 flex flex-col px-0 py-0 space-y-2 md:space-y-6 text-vanilla-400 tracking-wide uppercase">
              <div class="flex flex-col space-y-2">
                <a v-for="item in product" :key="item" href="#" class="hover:text-juniper transition-all duration-75 ease-in-out flex flex-col space-y-4 text-vanilla-300 capitalize">
                    {{item}}
                </a>
              </div>
            </z-accordion-item>
            <z-accordion-item :is-list="!isMobile" title="languages" class="row-start-1 row-end-1 col-start-3 col-end-3 flex flex-col px-0 py-0  space-y-2 md:space-y-6 text-vanilla-400 tracking-wide uppercase">
              <div class="flex flex-col space-y-2">
                <a v-for="language in languages" :key="language" href="#" class="hover:text-juniper transition-all duration-75 ease-in-out flex flex-col space-y-4 text-vanilla-300 capitalize">
                    {{language}}
                </a>
              </div>
            </z-accordion-item>
            <z-accordion-item :is-list="!isMobile" title="resources" class="row-start-1 row-end-1 col-start-4 col-end-4 flex flex-col px-0 py-0  space-y-2 md:space-y-6 text-vanilla-400 tracking-wide uppercase">
              <div class="flex flex-col space-y-2">
                <a v-for="item in resources" :key="item" href="#" class="hover:text-juniper transition-all duration-75 ease-in-out flex flex-col space-y-4 text-vanilla-300 capitalize">
                    {{item}}
                </a>
              </div>
            </z-accordion-item>
            <z-accordion-item :is-list="!isMobile" title="company" class="row-start-1 row-end-1 col-start-5 col-end-5 flex flex-col px-0 py-0  space-y-2 md:space-y-6 text-vanilla-400 tracking-wide uppercase">
              <div class="flex flex-col space-y-2">
                <a v-for="item in company" :key="item" href="#" class="hover:text-juniper transition-all duration-75 ease-in-out flex flex-col space-y-4 text-vanilla-300 capitalize">
                    {{item}}
                </a>
              </div>
            </z-accordion-item>
            <div class="row-start-1 row-end-1 col-start-6 col-end-6 flex flex-col space-y-6 text-vanilla-400 text-sm">
                <div class="font-medium uppercase tracking-wide hidden md:block">Social Media</div>
                <div class="flex flex-col-reverse md:flex-col gap-y-3 md:gap-y-16">
                  <div class="flex flex-col space-y-4 items-center md:items-start">
                    <div class="text-vanilla-300 hidden md:block">Follow us on social media to stay updated.</div>
                    <div class="flex space-x-3">
                        <z-icon size="medium" icon="dribbble" color="vanilla-300"></z-icon>
                        <z-icon size="medium" icon="dribbble" color="vanilla-300"></z-icon>
                        <z-icon size="medium" icon="dribbble" color="vanilla-300"></z-icon>
                    </div>
                  </div>
                  <div class="flex flex-col space-y-2">
                    <div class="uppercase">Sign up for the newsletter</div>
                    <z-input v-model="name" backgroundColor="transparent">
                      <template slot="right">
                        <z-button color="primary" icon="chevron-right" iconSize="medium" iconColor="ink-400"></z-button>
                      </template>
                    </z-input>
                  </div>
                </div>
            </div>
            <div class="block md:hidden w-full h-px bg-slate"></div>
            <div class="row-start-1 row-end-1 col-start-7 col-end-7 text-sm text-vanilla-400">
                <div class="flex justify-center flex-row space-x-2 md:space-x-0 md:flex-col space-y-0 md:space-y-2">
                    <div v-for="i in 2" :key="i" class="flex flex-col md:grid grid-rows-3 grid-cols-3 gap-x-4 p-2 md:p-2.5 tracking-wide bg-ink-300 rounded-sm w-auto md:w-full h-auto md:h-20 flex items-center">
                        <img class="max-w-none row-span-3" src="https://i.imgur.com/JBKMaq5.png"/>
                        <span class="uppercase font-medium col-span-2 text-vanilla-100">GDPR</span>
                        <span class="row-span-2 col-span-2 tracking-normal">compliant</span>
                    </div>
                </div>
            </div>
            <span class="order-last self-center row-start-2 row-end-2 col-start-1 col-end-4 self-end text-left text-vanilla-400 text-xs md:text-sm">
                © 2020, DeepSource Corp. All rights reserved.
            </span>
            <span class="row-start-2 self-center row-end-2 col-start-6 col-end-8 self-end justify-self-end text-vanilla-400 text-sm flex space-x-2 items-center">
                Backed by 
                <img class="ml-3 max-w-none" src="https://i.imgur.com/lnlRvjx.png"/>
            </span>
        </footer>
    </div>`
})

/**
 * UI state representing Accordion item spanning full height
 *
 * @returns {ExtendedVue}
 */
export const AccordionSpanningFullHeight = () => ({
  data() {
    return {
      maxHeight: 'max-h-screen'
    }
  },
  components: { ZAccordion, ZAccordionItem },
  template: `<div class='padded-container input-container'>
        <z-accordion class="text-vanilla-100">
        <z-accordion-item :span-custom-height="true" custom-max-height="max-h-item" title="Span full height" class="p-4">
            <p>Anim aliqua duis anim dolor ea deserunt. Consectetur aliqua labore aliquip fugiat laborum culpa adipisicing irure. Et ipsum deserunt incididunt pariatur ullamco fugiat deserunt eiusmod sit labore irure. Excepteur sint Lorem occaecat pariatur culpa fugiat eiusmod Lorem quis voluptate dolore eiusmod cupidatat est. Et quis aute eu et tempor culpa duis amet ea elit sunt. Culpa incididunt consectetur anim voluptate et.</p>
            <br />
            
            <p>Lorem irure esse reprehenderit tempor. Nisi enim commodo Lorem qui commodo officia ad ex ex. Voluptate deserunt sit et et. Irure eiusmod minim Lorem ex. Consectetur sint dolore in ullamco ad.</p>
            <br/>
            
            <p>Sint voluptate in amet id. Consequat sit aute nostrud qui velit elit sunt reprehenderit elit enim non tempor aliqua occaecat. Aute quis amet nostrud dolore sunt. Commodo proident sit aliqua dolor exercitation officia anim consequat culpa exercitation dolore amet laborum. Dolor est minim do do Lorem consectetur occaecat eu officia commodo nostrud. Exercitation irure dolore deserunt laborum consectetur ad duis sunt consectetur magna elit adipisicing.</p>
            <br />
            
            <p>Velit sit voluptate tempor esse magna sint duis esse tempor. Non enim cillum incididunt irure do nisi veniam ut proident in cupidatat. Minim proident occaecat ad elit. Tempor commodo excepteur amet ad anim consectetur. Eu velit exercitation ex incididunt deserunt nisi labore consequat incididunt nostrud qui elit tempor. Pariatur aute reprehenderit dolor tempor excepteur adipisicing in. Eu culpa non est voluptate duis id.</p>
            <br />
            
            <p>Commodo incididunt aliquip duis anim id et nisi consequat. Labore ipsum do non aliqua culpa culpa laboris sint sunt laborum ad est ea. Consequat dolor nisi ut est proident veniam voluptate.</p>
          </z-accordion-item>

          <z-accordion-item title="Default height" class="p-4">
            <p>Laborum qui nostrud sunt exercitation anim laboris sit eu ut irure aliquip pariatur.</p>

            <p>Consequat enim laborum eiusmod nulla culpa magna elit aliquip dolor.</p>
          </z-accordion-item>
        </z-accordion>
    </div>`
})
