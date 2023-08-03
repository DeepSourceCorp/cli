import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZCode from './ZCode.vue'

export default {
  title: 'Code',
  component: ZCode,
  excludeStories: /.*Data$/
}

export const DefaultCode = () => ({
  components: { ZCode },
  data() {
    return {
      content:
        '<div class="highlight"><pre><span class="ln">2</span>\n<span class="ln">3</span>\n<span class="ln">4</span><span class="nd">@dramatiq.actor</span>\n<span class="hl"><span class="ln">5</span><span class="k">def</span> <span class="nf">example</span><span class="p">(</span><span class="p">)</span><span class="p">:</span></span><span class="ln">6</span>    <span class="k">pass</span>\n</pre></div>'
    }
  },
  template: `<div class='input-container border-2 border-slate'>
        <z-code :content="content"></z-code>           
    </div>`
})
