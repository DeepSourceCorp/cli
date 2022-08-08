import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { AutofixCodeDiff } from '~/components/Autofix'
import { cartesian, generateBooleanProps } from '~/test/utils'

interface IAutofixCodeDiff extends Vue {
  // Methods
  selectFile: (file: string) => void
  isHunkSelected: (id: number) => boolean
  selectFileIfAllHunksSelected: (file: string, id: number) => void
}

describe('[[ AutofixCodeDiff ]]', () => {
  const mocks = {
    $emit: jest.fn()
  }

  const stubs = {
    ZCode: true,
    ZCheckbox: true
  }

  const baseProps = {
    isGroup: false,
    changeSet: {
      'index.js': {
        patches: [
          {
            id: 580653,
            action: 'modified',
            before_html:
              '<div class="highlight"><pre><span class="hlr" data-code-marker="-"><span class="ln"> 1</span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">=&gt;</span> <span class="p">{</span></span><span class="hlr" data-code-marker="-"><span class="ln"> 2</span>  <span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span></span><span class="hlr" data-code-marker="-"><span class="ln"> 3</span><span class="p">}</span><span class="p">)</span></span><span class="ln"> 4</span>\n<span class="ln"> 5</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="ln"> 6</span><span class="c1"></span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">{</span></pre></span>',
            after_html:
              '<div class="highlight"><pre><span class="hlg" data-code-marker="+"><span class="ln"> 1</span><span class="nb">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span></span>\n\n<span class="ln"> 2</span>\n<span class="ln"> 3</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="ln"> 4</span><span class="c1"></span><span class="nb">Promise</span><span class="p">.</span><span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span></pre></span>'
          },
          {
            id: 580654,
            action: 'modified',
            before_html:
              '<div class="highlight"><pre><span class="ln"> 3</span><span class="p">}</span><span class="p">)</span>\n<span class="ln"> 4</span>\n<span class="ln"> 5</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="hlr" data-code-marker="-"><span class="ln"> 6</span><span class="c1"></span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">{</span></span><span class="hlr" data-code-marker="-"><span class="ln"> 7</span>  <span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span></span><span class="hlr" data-code-marker="-"><span class="ln"> 8</span><span class="p">}</span><span class="p">)</span></span><span class="ln"> 9</span>\n<span class="ln">10</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="ln">11</span><span class="c1"></span><span class="nx">a</span> <span class="o">==</span> <span class="nx">b</span></pre></span>',
            after_html:
              '<div class="highlight"><pre><span class="ln"> 1</span><span class="nb">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span>\n<span class="ln"> 2</span>\n<span class="ln"> 3</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 4</span><span class="c1"></span><span class="nb">Promise</span><span class="p">.</span><span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span></span>\n\n<span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="ln"> 7</span><span class="c1"></span></pre></span>'
          },
          {
            id: 580655,
            action: 'modified',
            before_html:
              '<div class="highlight"><pre><span class="ln"> 8</span><span class="p">}</span><span class="p">)</span>\n<span class="ln"> 9</span>\n<span class="ln">10</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="hlr" data-code-marker="-"><span class="ln">11</span><span class="c1"></span><span class="nx">a</span> <span class="o">==</span> <span class="nx">b</span></span><span class="hlr" data-code-marker="-"><span class="ln">12</span><span class="nx">c</span> <span class="o">==</span> <span class="kc">true</span></span><span class="hlr" data-code-marker="-"><span class="ln">13</span><span class="nx">bananas</span> <span class="o">!=</span> <span class="mi">1</span></span><span class="hlr" data-code-marker="-"><span class="ln">14</span><span class="nx">value</span> <span class="o">==</span> <span class="kc">undefined</span></span><span class="hlr" data-code-marker="-"><span class="ln">15</span><span class="k">typeof</span> <span class="nx">c</span> <span class="o">==</span> <span class="s1">&#39;undefined&#39;</span></span><span class="hlr" data-code-marker="-"><span class="ln">16</span><span class="s1">&#39;hello&#39;</span> <span class="o">!=</span> <span class="s1">&#39;world&#39;</span></span><span class="hlr" data-code-marker="-"><span class="ln">17</span><span class="mi">0</span> <span class="o">==</span> <span class="mi">0</span></span><span class="hlr" data-code-marker="-"><span class="ln">18</span><span class="kc">true</span> <span class="o">==</span> <span class="kc">true</span></span><span class="hlr" data-code-marker="-"><span class="ln">19</span><span class="nx">c</span> <span class="o">==</span> <span class="kc">null</span></span><span class="ln">20</span>\n<span class="ln">21</span><span class="c1">// 5. Avoid using multiline stringsJS-C1000</span>\n<span class="ln">22</span><span class="c1"></span><span class="kr">const</span> <span class="nx">x</span> <span class="o">=</span> <span class="s2">&#34;Line 1 \\</span></pre></span>',
            after_html:
              '<div class="highlight"><pre><span class="ln"> 4</span><span class="c1"></span><span class="nb">Promise</span><span class="p">.</span><span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span>\n<span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 7</span><span class="c1"></span></span><span class="hlg" data-code-marker="+"><span class="ln"> 8</span></span><span class="hlg" data-code-marker="+"><span class="ln"> 9</span></span><span class="hlg" data-code-marker="+"><span class="ln">10</span></span><span class="hlg" data-code-marker="+"><span class="ln">11</span></span><span class="hlg" data-code-marker="+"><span class="ln">12</span></span><span class="hlg" data-code-marker="+"><span class="ln">13</span></span><span class="hlg" data-code-marker="+"><span class="ln">14</span></span><span class="hlg" data-code-marker="+"><span class="ln">15</span></span><span class="ln">16</span>\n<span class="ln">17</span><span class="c1">// 5. Avoid using multiline stringsJS-C1000</span>\n<span class="ln">18</span><span class="c1"></span><span class="kr">const</span> <span class="nx">x</span> <span class="o">=</span> <span class="s2">&#34;Line 1 \\</span></pre></span>'
          }
        ],
        issues: [
          {
            title: 'Found unused expressions',
            shortcode: 'JS-0093'
          },
          {
            title: 'Use shorthand promise methods',
            shortcode: 'JS-C1004'
          }
        ]
      }
    },
    selectedFiles: ['index.py'],
    isReadOnly: false,
    selectedHunkIds: [580653, 580655],
    isGeneratedFromPr: true
  }

  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const { vm } = shallowMount(AutofixCodeDiff, {
      mocks,
      propsData: { ...baseProps, ...props },
      stubs,
      localVue
    })

    return vm as IAutofixCodeDiff
  }

  test('renders the component with all prop options', () => {
    const isGroupOptions = generateBooleanProps('isGroup', false)
    const isReadOnlyOptions = generateBooleanProps('isReadOnly', false)
    const isGeneratedFromPrOptions = generateBooleanProps('isGeneratedFromPr', false)

    cartesian(isGroupOptions, isReadOnlyOptions, isGeneratedFromPrOptions).forEach(
      (propCombination) => {
        const propsData = {
          ...baseProps,
          ...propCombination
        }

        const { html } = render(
          AutofixCodeDiff,
          {
            mocks,
            propsData,
            stubs
          },
          (vue) => {
            vue.use(VTooltip)
          }
        )

        expect(html()).toMatchSnapshot(JSON.stringify(propsData))
      }
    )
  })

  test('shows the remaining count when the issue codes exceed a count of 3', () => {
    const propsData = {
      ...baseProps,
      changeSet: {
        'index-2.js': {
          patches: [
            {
              id: 10716,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 1</span><span class="c1">// 1. Found leading or trailing decimal points in numeric literalsJS-0065</span>\n<span class="hlr" data-code-marker="-"><span class="ln"> 2</span><span class="c1"></span><span class="kd">let</span> <span class="nx">num</span> <span class="o">=</span> <span class="p">.</span><span class="mi">5</span><span class="p">;</span></span><span class="ln"> 3</span><span class="nx">num</span> <span class="o">=</span> <span class="mf">2.</span><span class="p">;</span>\n<span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="p">.</span><span class="mi">7</span><span class="p">;</span>\n<span class="ln"> 5</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 1</span><span class="c1">// 1. Found leading or trailing decimal points in numeric literalsJS-0065</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 2</span><span class="c1"></span><span class="kd">let</span> <span class="nx">num</span> <span class="o">=</span> <span class="mf">0.5</span><span class="p">;</span></span><span class="ln"> 3</span><span class="nx">num</span> <span class="o">=</span> <span class="mf">2.0</span><span class="p">;</span>\n<span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="mf">0.7</span><span class="p">;</span>\n<span class="ln"> 5</span></pre></span>'
            },
            {
              id: 10717,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 1</span><span class="c1">// 1. Found leading or trailing decimal points in numeric literalsJS-0065</span>\n<span class="ln"> 2</span><span class="c1"></span><span class="kd">let</span> <span class="nx">num</span> <span class="o">=</span> <span class="p">.</span><span class="mi">5</span><span class="p">;</span>\n<span class="hlr" data-code-marker="-"><span class="ln"> 3</span><span class="nx">num</span> <span class="o">=</span> <span class="mf">2.</span><span class="p">;</span></span><span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="p">.</span><span class="mi">7</span><span class="p">;</span>\n<span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 1</span><span class="c1">// 1. Found leading or trailing decimal points in numeric literalsJS-0065</span>\n<span class="ln"> 2</span><span class="c1"></span><span class="kd">let</span> <span class="nx">num</span> <span class="o">=</span> <span class="mf">0.5</span><span class="p">;</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 3</span><span class="nx">num</span> <span class="o">=</span> <span class="mf">2.0</span><span class="p">;</span></span><span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="mf">0.7</span><span class="p">;</span>\n<span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span></pre></span>'
            },
            {
              id: 10718,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 1</span><span class="c1">// 1. Found leading or trailing decimal points in numeric literalsJS-0065</span>\n<span class="ln"> 2</span><span class="c1"></span><span class="kd">let</span> <span class="nx">num</span> <span class="o">=</span> <span class="p">.</span><span class="mi">5</span><span class="p">;</span>\n<span class="ln"> 3</span><span class="nx">num</span> <span class="o">=</span> <span class="mf">2.</span><span class="p">;</span>\n<span class="hlr" data-code-marker="-"><span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="p">.</span><span class="mi">7</span><span class="p">;</span></span><span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 1</span><span class="c1">// 1. Found leading or trailing decimal points in numeric literalsJS-0065</span>\n<span class="ln"> 2</span><span class="c1"></span><span class="kd">let</span> <span class="nx">num</span> <span class="o">=</span> <span class="mf">0.5</span><span class="p">;</span>\n<span class="ln"> 3</span><span class="nx">num</span> <span class="o">=</span> <span class="mf">2.0</span><span class="p">;</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="mf">0.7</span><span class="p">;</span></span><span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></pre></span>'
            },
            {
              id: 10719,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="p">.</span><span class="mi">7</span><span class="p">;</span>\n<span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="hlr" data-code-marker="-"><span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0+1,234&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 4</span><span class="nx">num</span> <span class="o">=</span> <span class="o">-</span><span class="mf">0.7</span><span class="p">;</span>\n<span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0+1,234&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="mi">0</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></pre></span>'
            },
            {
              id: 10720,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlr" data-code-marker="-"><span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0+1,234&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 5</span>\n<span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0+1,234&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="mi">0</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span></pre></span>'
            },
            {
              id: 10721,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0+1,234&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlr" data-code-marker="-"><span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">12</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 6</span><span class="c1">// 2. Found unnecessary computed property keys in object literalsJS-0236</span>\n<span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0+1,234&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlg" data-code-marker="+"><span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="mi">0</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">12</span></pre></span>'
            },
            {
              id: 10722,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0+1,234&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlr" data-code-marker="-"><span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">12</span>\n<span class="ln">13</span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">=&gt;</span> <span class="p">{</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 7</span><span class="c1"></span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0+1,234&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="mi">0</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlg" data-code-marker="+"><span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span></span><span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">12</span>\n<span class="ln">13</span><span class="nb">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span></pre></span>'
            },
            {
              id: 10723,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;0+1,234&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="mi">0</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlr" data-code-marker="-"><span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span></span><span class="ln">12</span>\n<span class="ln">13</span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">=&gt;</span> <span class="p">{</span>\n<span class="ln">14</span>  <span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln"> 8</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;0+1,234&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln"> 9</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="mi">0</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="hlg" data-code-marker="+"><span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span></span><span class="ln">12</span>\n<span class="ln">13</span><span class="nb">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span>\n<span class="ln">14</span></pre></span>'
            },
            {
              id: 10724,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="p">[</span><span class="s1">&#39;x&#39;</span><span class="p">]</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">12</span>\n<span class="hlr" data-code-marker="-"><span class="ln">13</span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">=&gt;</span> <span class="p">{</span></span><span class="hlr" data-code-marker="-"><span class="ln">14</span>  <span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span></span><span class="hlr" data-code-marker="-"><span class="ln">15</span><span class="p">}</span><span class="p">)</span></span><span class="ln">16</span>\n<span class="ln">17</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="ln">18</span><span class="c1"></span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">{</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln">10</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="o">:</span> <span class="mi">0</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">11</span><span class="kd">var</span> <span class="nx">a</span> <span class="o">=</span> <span class="p">{</span> <span class="s1">&#39;x&#39;</span><span class="p">(</span><span class="p">)</span> <span class="p">{</span><span class="p">}</span> <span class="p">}</span><span class="p">;</span>\n<span class="ln">12</span>\n<span class="hlg" data-code-marker="+"><span class="ln">13</span><span class="nb">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span></span>\n\n<span class="ln">14</span>\n<span class="ln">15</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="ln">16</span><span class="c1"></span><span class="nb">Promise</span><span class="p">.</span><span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span></pre></span>'
            },
            {
              id: 10725,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln">15</span><span class="p">}</span><span class="p">)</span>\n<span class="ln">16</span>\n<span class="ln">17</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="hlr" data-code-marker="-"><span class="ln">18</span><span class="c1"></span><span class="k">new</span> <span class="nb">Promise</span><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">resolve</span><span class="p">,</span> <span class="nx">reject</span><span class="p">)</span> <span class="p">{</span></span><span class="hlr" data-code-marker="-"><span class="ln">19</span>  <span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span></span><span class="hlr" data-code-marker="-"><span class="ln">20</span><span class="p">}</span><span class="p">)</span></span><span class="ln">21</span>\n<span class="ln">22</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="ln">23</span><span class="c1"></span><span class="nx">a</span> <span class="o">==</span> <span class="nx">b</span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln">13</span><span class="nb">Promise</span><span class="p">.</span><span class="nx">resolve</span><span class="p">(</span><span class="nx">getItem</span><span class="p">(</span><span class="p">)</span><span class="p">)</span>\n<span class="ln">14</span>\n<span class="ln">15</span><span class="c1">// 3. Use shorthand promise methodsJS-C1004</span>\n<span class="hlg" data-code-marker="+"><span class="ln">16</span><span class="c1"></span><span class="nb">Promise</span><span class="p">.</span><span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span></span>\n\n<span class="ln">17</span>\n<span class="ln">18</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="ln">19</span><span class="c1"></span></pre></span>'
            },
            {
              id: 10726,
              action: 'modified',
              before_html:
                '<div class="highlight"><pre><span class="ln">20</span><span class="p">}</span><span class="p">)</span>\n<span class="ln">21</span>\n<span class="ln">22</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="hlr" data-code-marker="-"><span class="ln">23</span><span class="c1"></span><span class="nx">a</span> <span class="o">==</span> <span class="nx">b</span></span><span class="hlr" data-code-marker="-"><span class="ln">24</span><span class="nx">c</span> <span class="o">==</span> <span class="kc">true</span></span><span class="hlr" data-code-marker="-"><span class="ln">25</span><span class="nx">bananas</span> <span class="o">!=</span> <span class="mi">1</span></span><span class="hlr" data-code-marker="-"><span class="ln">26</span><span class="nx">value</span> <span class="o">==</span> <span class="kc">undefined</span></span><span class="hlr" data-code-marker="-"><span class="ln">27</span><span class="k">typeof</span> <span class="nx">c</span> <span class="o">==</span> <span class="s1">&#39;undefined&#39;</span></span><span class="hlr" data-code-marker="-"><span class="ln">28</span><span class="s1">&#39;hello&#39;</span> <span class="o">!=</span> <span class="s1">&#39;world&#39;</span></span><span class="hlr" data-code-marker="-"><span class="ln">29</span><span class="mi">0</span> <span class="o">==</span> <span class="mi">0</span></span><span class="hlr" data-code-marker="-"><span class="ln">30</span><span class="kc">true</span> <span class="o">==</span> <span class="kc">true</span></span><span class="hlr" data-code-marker="-"><span class="ln">31</span><span class="nx">c</span> <span class="o">==</span> <span class="kc">null</span></span></pre></span>',
              after_html:
                '<div class="highlight"><pre><span class="ln">16</span><span class="c1"></span><span class="nb">Promise</span><span class="p">.</span><span class="nx">reject</span><span class="p">(</span><span class="s2">&#34;oops&#34;</span><span class="p">)</span>\n<span class="ln">17</span>\n<span class="ln">18</span><span class="c1">// 4. Prefer the use of `===` and `!==` over `==` and `!=`JS-V009</span>\n<span class="hlg" data-code-marker="+"><span class="ln">19</span><span class="c1"></span></span><span class="hlg" data-code-marker="+"><span class="ln">20</span></span><span class="hlg" data-code-marker="+"><span class="ln">21</span></span><span class="hlg" data-code-marker="+"><span class="ln">22</span></span><span class="hlg" data-code-marker="+"><span class="ln">23</span></span><span class="hlg" data-code-marker="+"><span class="ln">24</span></span><span class="hlg" data-code-marker="+"><span class="ln">25</span></span><span class="hlg" data-code-marker="+"><span class="ln">26</span></span><span class="hlg" data-code-marker="+"><span class="ln">27</span></span></pre></span>'
            }
          ],
          issues: [
            {
              title: 'Found unused expressions',
              shortcode: 'JS-0093'
            },
            {
              title: 'Found unnecessary computed property keys in object literals',
              shortcode: 'JS-0236'
            },
            {
              title: 'Use shorthand promise methods',
              shortcode: 'JS-C1004'
            },
            {
              title: 'Found leading or trailing decimal points in numeric literals',
              shortcode: 'JS-0065'
            }
          ]
        }
      }
    }

    const { html } = render(
      AutofixCodeDiff,
      {
        mocks,
        propsData,
        stubs
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('`selectFile` method emits an event of the name `selectFile` passing in the `file` name', () => {
    const instance = getInstance()

    // Invoke `selectFile` method
    instance.selectFile('index.js')

    // Assertion
    expect(mocks.$emit).toBeCalledWith('selectFile', 'index.js')
  })

  test('`isHunkSelected` method returns `true` if the hunk id is present in `selectedHunkIds`', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.isHunkSelected(580653)).toBeTruthy()
  })

  test('`isHunkSelected` method returns `false` if the hunk id is not present in `selectedHunkIds`', () => {
    const instance = getInstance()

    // Assertion
    expect(instance.isHunkSelected(580654)).toBeFalsy()
  })

  test('`selectFileIfAllHunksSelected` method emits an event of the name `selectFileIfAllHunksSelected` passing in the `file` name and `id`', () => {
    const instance = getInstance()

    // Invoke `selectFileIfAllHunksSelected` method
    instance.selectFileIfAllHunksSelected('index.js', 580653)

    // Assertion
    expect(mocks.$emit).toBeCalledWith('selectFileIfAllHunksSelected', 'index.js', 580653)
  })
})
