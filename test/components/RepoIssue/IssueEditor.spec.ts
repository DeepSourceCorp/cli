import '@testing-library/jest-dom'
import { render, RenderResult } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'

import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import IssueEditor from '~/components/RepoIssues/IssueEditor.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ IssueEditor ]]', () => {
  let localVue: VueConstructor<Vue>
  let storeMock: Record<string, unknown>

  const baseProps = {
    beginLine: 17,
    blobUrlRoot:
      'https://github.com/deepsourcelabs/asgard/blob/a8935a7125356db4cff400415f7061b2e5491591/',
    checkId: 'Q2hlY2s6YmFsdmpx',
    checkIssueIds: [],
    createdAt: '2020-07-09T08:52:13.924241+00:00',
    endLine: 17,
    id: 'Q2hlY2tJc3N1ZTp3eHBka3g=',
    modifiedAt: '2020-07-09T08:52:13.924250+00:00',
    path: 'Dockerfile',
    shortcode: 'DOK-DL3008',
    sourceCodeMarkup: `<div class="highlight"><pre><span class="ln">14</span><span class="err"></span><span class="c"># Disable virtualenv creation</span><span class="err"></span>\n<span class="ln">15</span><span class="err"></span><span class="k">RUN</span> poetry config virtualenvs.create false<span class="err"></span>\n<span class="ln">16</span><span class="err"></span><span class="err"></span>\n<span class="hl"><span class="ln">17</span><span class="err"></span><span class="k">RUN</span> apt-get update <span class="o">&amp;&amp;</span> apt-get install -qq -y <span class="se">\</span></span><span class="ln">18</span><span class="se"></span>  build-essential git libpq-dev curl cron --no-install-recommends <span class="se">\</span>\n<span class="ln">19</span><span class="se"></span>  <span class="o">&amp;&amp;</span> rm -rf /var/lib/apt/lists/*<span class="err"></span>\n<span class="ln">20</span><span class="err"></span><span class="err"></span></pre></div>`,
    text: 'Pin versions in apt get install. Instead of `apt-get install <package>` use `apt-get install <package>=<version>`'
  }

  const canIgnoreIssues = generateBooleanProps('canIgnoreIssues', false)
  const openAccordion = generateBooleanProps('openAccordion', false)
  const ignored = generateBooleanProps('ignored', false)

  test('[[ Renders IssueEditor ]]', () => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)

    storeMock = {
      modules: storeModulesGenerator()
    }

    cartesian(canIgnoreIssues, openAccordion, ignored).forEach((propCombination) => {
      const { html } = render(IssueEditor, {
        props: {
          ...baseProps,
          ...propCombination
        },
        mocks: mocksGenerator(),
        stubs: {
          ZIcon: true,
          ZButton: true,
          ZMenuSection: true,
          ZMenuItem: true
        },
        store: new Vuex.Store(storeMock),
        localVue
      })
      expect(html()).toMatchSnapshot()
    })
  })
})
