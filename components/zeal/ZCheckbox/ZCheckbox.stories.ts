import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZCheckbox from './ZCheckbox.vue'

export default {
  title: 'Checkbox',
  component: ZCheckbox,
  excludeStories: /.*Data$/
}

export const DefaultCheckbox = () => ({
  components: { ZCheckbox },
  data() {
    return {
      selectedValue: false
    }
  },
  template:
    '<z-checkbox class="text-vanilla-100" label="I love Pastries" value="pastry" v-model="selectedValue"/>'
})

export const DisabledCheckbox = () => ({
  components: { ZCheckbox },
  data() {
    return {
      selectedValue: false
    }
  },
  template:
    '<z-checkbox label="I love Pastries" value="pastry" v-model="selectedValue" :disabled="true"/>'
})

export const ReadOnlyCheckbox = () => ({
  components: { ZCheckbox },
  data() {
    return {
      selectedValue: false,
      anotherSelectedValue: true
    }
  },
  template: `<div>
    <z-checkbox label="I love Pastries" value="pastry" v-model="selectedValue" :readOnly="true"/>
    <z-checkbox label="I love Pastries" value="pastry" v-model="anotherSelectedValue" :readOnly="true"/>
  </div>`
})

export const SelectedCheckboxWithDisabledProperty = () => ({
  components: { ZCheckbox },
  data() {
    return {
      selectedValue: true
    }
  },
  template: '<z-checkbox label="I love Pastries" value="pastry" v-model="selectedValue" disabled/>'
})

export const SelectedCheckbox = () => ({
  components: { ZCheckbox },
  data() {
    return {
      selectedValue: true
    }
  },
  template:
    '<z-checkbox class="text-vanilla-100" label="I love Pastries" value="pastry" v-model="selectedValue"/>'
})

export const CheckboxGroup = () => ({
  components: { ZCheckbox },
  data() {
    return {
      selectedValues: ['pizza', 'coding']
    }
  },
  template: `<div class="container text-vanilla-100">
    <z-checkbox label="Pizza" value="pizza" v-model="selectedValues"/>
    <z-checkbox label="Coding" value="coding" v-model="selectedValues"/>
    <z-checkbox label="Walk by myself to get water" value="walk" v-model="selectedValues"/>
  </div>`
})

export const CheckboxGroupWithMultipleSizes = () => ({
  components: { ZCheckbox },
  data() {
    return {
      selectedValues: ['pizza', 'coding']
    }
  },
  template: `<div class="container text-vanilla-100 space-y-8">
    <div class="space-y-1">
      <z-checkbox size="small" label="Pizza" value="pizza" v-model="selectedValues"/>
      <z-checkbox size="small" label="Coding" value="coding" v-model="selectedValues"/>
      <z-checkbox size="small" label="Walk by myself to get water" value="walk" v-model="selectedValues"/>
    </div>
    <div class="space-y-1">
      <z-checkbox label="Pizza" value="pizza" v-model="selectedValues"/>
      <z-checkbox label="Coding" value="coding" v-model="selectedValues"/>
      <z-checkbox label="Walk by myself to get water" value="walk" v-model="selectedValues"/>
    </div>
    <div class="space-y-1">
      <z-checkbox size="large" label="Pizza" value="pizza" v-model="selectedValues"/>
      <z-checkbox size="large" label="Coding" value="coding" v-model="selectedValues"/>
      <z-checkbox size="large" label="Walk by myself to get water" value="walk" v-model="selectedValues"/>
    </div>
  </div>`
})
