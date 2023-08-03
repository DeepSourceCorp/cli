import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZFileInput from './ZFileInput.vue'
import ZButton from '../ZButton'

export default {
  title: 'File Input',
  component: ZFileInput,
  excludeStories: /.*Data$/
}

export const DefaultFileInput = () => ({
  components: { ZFileInput },
  data() {
    return {}
  },
  template: '<div><z-file-input class="max-w-lg"/></div>'
})

export const DefaultFileInputProcessing = () => ({
  components: { ZFileInput },
  data() {
    return {}
  },
  template: '<div><z-file-input :processing="true" class="max-w-lg"/></div>'
})

export const DefaultFileInputDisabled = () => ({
  components: { ZFileInput },
  data() {
    return {}
  },
  template: '<div><z-file-input :disabled="true" class="max-w-lg"/></div>'
})

export const FileInputWithCustomActivator = () => ({
  components: { ZFileInput, ZButton },
  data() {
    return {}
  },
  template:
    '<div><z-file-input class="max-w-lg"><template v-slot:activator="{open}"><z-button type="button" icon="paperclip" label="Add files"/></template></z-file-input></div>'
})
