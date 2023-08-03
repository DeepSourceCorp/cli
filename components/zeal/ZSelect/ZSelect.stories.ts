import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZSelect from './ZSelect.vue'
import ZOption from '../ZOption/ZOption.vue'
import ZIcon from '../ZIcon/ZIcon.vue'
import ZToggle from '../ZToggle/ZToggle.vue'

export default {
  title: 'Select',
  component: ZSelect,
  excludeStories: /.*Data$/
}

/**
 * UI state representing the default Select behavior
 *
 * @returns {ExtendedVue}
 */
export const DefaultSelect = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: 7,
      options: [
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        },
        {
          value: null,
          label: 'All Days'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
              <div class="select-container space-y-4">
                <z-select v-model="value">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </z-option>
                </z-select>
                <div class='text-sm text-vanilla-400'>Selected Value: <span class='text-juniper font-bold'>{{ value || 'null' }}</span></div>
              </div>
        </div>`
})

/**
 * UI state representing disabled Select component
 *
 * @returns {ExtendedVue}
 */
export const DisabledSelect = () => ({
  components: { ZSelect, ZOption, ZIcon, ZToggle },
  data() {
    return {
      value: 7,
      disabled: true,
      options: [
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
              <div class="select-container space-y-4">
                <z-select v-model="value" :disabled="disabled">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </z-option>
                </z-select>
                <div class='text-sm text-vanilla-400'>Selected Value: <span class='text-juniper font-bold'>{{ value }}</span></div>
                <div class='text-sm text-vanilla-400'>Disabled: <z-toggle v-model="disabled"/></div> 
              </div>
        </div>`
})

/**
 * UI state representing Select component which is read only
 *
 * @returns {ExtendedVue}
 */
export const ReadOnlySelect = () => ({
  components: { ZSelect, ZOption, ZIcon, ZToggle },
  data() {
    return {
      value: 7,
      readOnly: true,
      options: [
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
              <div class="select-container space-y-4">
                <z-select v-model="value" :read-only="readOnly">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </z-option>
                </z-select>
                <div class='text-sm text-vanilla-400'>Selected Value: <span class='text-juniper font-bold'>{{ value }}</span></div>
                <div class='text-sm text-vanilla-400'>Read only: <z-toggle v-model="readOnly"/></div> 
              </div>
        </div>`
})

/**
 * UI state representing Select component with custom placeholder
 *
 * @returns {ExtendedVue}
 */
export const SelectWithCustomPlaceholder = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: '',
      options: [
        {
          value: 'Option 1',
          label: 'Option 1'
        },
        {
          value: 'Option 2',
          label: 'Option 2'
        },
        {
          value: 'Option 3',
          label: 'Option 3'
        },
        {
          value: 'Option 4',
          label: 'Option 4'
        },
        {
          value: 'Option 5',
          label: 'Option 5'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
            <div class="select-container">
                <z-select v-model="value" placeholder="Choose a framework">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </z-option>
                </z-select>
            </div>
        </div>`
})

/**
 * UI state representing Select component with icon
 *
 * @returns {ExtendedVue}
 */
export const SelectWithIcon = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: '',
      options: [
        {
          value: 'Option 1',
          label: 'Option 1'
        },
        {
          value: 'Option 2',
          label: 'Option 2'
        },
        {
          value: 'Option 3',
          label: 'Option 3'
        },
        {
          value: 'Option 4',
          label: 'Option 4'
        },
        {
          value: 'Option 5',
          label: 'Option 5'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
            <div class="select-container">
                <z-select v-model="value" placeholder="Choose a framework">
                    <template #icon>
                      <z-icon icon="duration" />
                    </template>
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </z-select>
            </div>
        </div>`
})

/**
 * UI state representing Select component that is clearable
 *
 * @returns {ExtendedVue}
 */
export const SelectWithClearables = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: '',
      options: [
        {
          value: 'Option 1',
          label: 'Option 1'
        },
        {
          value: 'Option 2',
          label: 'Option 2'
        },
        {
          value: 'Option 3',
          label: 'Option 3'
        },
        {
          value: 'Option 4',
          label: 'Option 4'
        },
        {
          value: 'Option 5',
          label: 'Option 5'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
            <div class="select-container">
                <z-select v-model="value" placeholder="Choose a framework" :clearable="true">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </z-option>
                </z-select>
            </div>
        </div>`
})

/**
 * UI state representing Select component with custom options template
 *
 * @returns {ExtendedVue}
 */
export const SelectWithCustomOptionsTemplate = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: '',
      options: [
        {
          value: 'Option 1',
          label: 'Option 1'
        },
        {
          value: 'Option 2',
          label: 'Option 2'
        },
        {
          value: 'Option 3',
          label: 'Option 3'
        },
        {
          value: 'Option 4',
          label: 'Option 4'
        },
        {
          value: 'Option 5',
          label: 'Option 5'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
            <div class="select-container">
                <z-select v-model="value" placeholder="Choose a framework" :clearable="true">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        <div class="flex items-center">
                            <z-icon icon="github" size="small" class="mr-2" />
                            <span class="flex-1">{{item.label}}</span>
                        </div>
                    </z-option>
                </z-select>
            </div>
        </div>`
})

/**
 * UI state representing Select component with pre selected option
 *
 * @returns {ExtendedVue}
 */
export const SelectWithPreselectedOption = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: 'Option 1',
      options: [
        {
          value: 'Option 1',
          label: 'Option 1'
        },
        {
          value: 'Option 2',
          label: 'Option 2'
        },
        {
          value: 'Option 3',
          label: 'Option 3'
        },
        {
          value: 'Option 4',
          label: 'Option 4'
        },
        {
          value: 'Option 5',
          label: 'Option 5'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
            <div class="select-container">
                <z-select v-model="value" placeholder="Choose a framework" :clearable="true" selected="Option 5">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        <div class="flex items-center">
                            <z-icon icon="github" size="small" class="mr-2" />
                            <span class="flex-1">{{item.label}}</span>
                        </div>
                    </z-option>
                </z-select>
            </div>
        </div>`
})

/**
 * UI state representing Select component with custom style
 *
 * @returns {ExtendedVue}
 */
export const SelectWithCustomStyle = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: 'Option 1',
      options: [
        {
          value: 'Option 1',
          label: 'Option 1'
        },
        {
          value: 'Option 2',
          label: 'Option 2'
        },
        {
          value: 'Option 3',
          label: 'Option 3'
        },
        {
          value: 'Option 4',
          label: 'Option 4'
        },
        {
          value: 'Option 5',
          label: 'Option 5'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
            <div class="select-container">
                <z-select v-model="value" placeholder="Choose a framework" :clearable="true" selected="Option 5" borderClass="border-cherry" backgroundClass="bg-cherry">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        <div class="flex items-center">
                            <z-icon icon="github" size="small" class="-mt-1 mr-2"></z-icon>
                            <span class="flex-1">{{item.label}}</span>
                        </div>
                    </z-option>
                </z-select>
            </div>
        </div>`
})

/**
 * UI state representing Select component with custom text size
 *
 * @returns {ExtendedVue}
 */
export const SelectWithCustomTextSize = () => ({
  components: { ZSelect, ZOption, ZIcon },
  data() {
    return {
      value: 7,
      options: [
        {
          value: 7,
          label: 'Last 7 Days'
        },
        {
          value: 14,
          label: 'Last 14 Days'
        },
        {
          value: 30,
          label: 'Last 30 Days'
        },
        {
          value: 45,
          label: 'Last 45 Days'
        },
        {
          value: 60,
          label: 'Last 60 Days'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
              <div class="select-container space-y-4">
                <z-select text-size="text-xl" v-model="value">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        text-size="text-xl" >
                    </z-option>
                </z-select>
                <div class='text-sm text-vanilla-400'>Selected Value: <span class='text-juniper font-bold'>{{ value }}</span></div>
              </div>
        </div>`
})

/**
 * UI state representing truncated Select component
 *
 * @returns {ExtendedVue}
 */
export const TruncatedSelect = () => ({
  components: { ZIcon, ZOption, ZSelect },
  data() {
    return {
      value: 7,
      options: [
        {
          value: 'Option 1',
          label: 'Option 1'
        },
        {
          value: 'Option 2',
          label: 'Option 2'
        },
        {
          value: 'Adipisicing fugiat minim consectetur labore nulla quis sunt quis amet anim',
          label: 'Adipisicing fugiat minim consectetur labore nulla quis sunt quis amet anim'
        }
      ]
    }
  },
  template: `<div class='padded-container'>
              <div class="select-container">
                <z-select v-model="value" :truncate="true" spacing="px-4 py-3" class="text-sm">
                  <z-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    class="px-4"
                  />
                </z-select>
              </div>
            </div>`
})

/**
 * UI state representing Select component with custom max height
 *
 * @returns {ExtendedVue}
 */
export const SelectWithCustomMaxHeight = () => ({
  components: { ZSelect, ZOption, ZIcon, ZToggle },
  data() {
    return {
      value: '',
      disabled: true,
      options: [
        { label: 'Below 50', value: 'BLW_50' },
        { label: '50-99', value: 'BTW_50_99' },
        { label: '100-249', value: 'BTW_100_249' },
        { label: '250-499', value: 'BTW_250_499' },
        { label: '500-999', value: 'BTW_500_999' },
        { label: '1000-2499', value: 'BTW_1000_2499' },
        { label: '2500-4999', value: 'BTW_2500_4999' },
        { label: '5000+', value: 'ABV_5000' }
      ]
    }
  },
  template: `<div class='padded-container'>
              <div class="select-container space-y-4">
                <z-select v-model="value" max-height="max-h-72" placeholder="Select no. of developers">
                    <z-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </z-option>
                </z-select>
</div>
        </div>`,
  StyleSheet: {}
})
