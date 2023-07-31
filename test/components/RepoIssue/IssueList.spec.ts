import { render } from '@testing-library/vue'
import { IssueList } from '~/components/RepoIssues'

describe('[[ IssueList ]]', () => {
  const baseProps = {
    totalCount: 3,
    pageSize: 25,
    description:
      '<p>Do not use a mutable like <code>list</code> or <code>dictionary</code> as a default value to an argument. Python’s default arguments are evaluated once when the function is defined. Using a mutable default argument and mutating it will mutate that object for all future calls to the function as well.</p>\n\n<!--more-->\n\n<h3>Bad practice</h3>\n\n<div class="highlight markdown-rendered">\n<pre><span></span><code><span class="k">def</span> <span class="nf">my_function</span><span class="p">(</span><span class="n">elem</span><span class="p">,</span> <span class="n">l</span><span class="o">=</span><span class="p">[]):</span>\n    <span class="n">l</span><span class="o">.</span><span class="n">append</span><span class="p">(</span><span class="n">elem</span><span class="p">)</span>\n    <span class="k">return</span> <span class="n">l</span>\n\n<span class="nb">print</span><span class="p">(</span><span class="n">my_function</span><span class="p">(</span><span class="mi">2</span><span class="p">))</span> <span class="c1"># [2]</span>\n<span class="nb">print</span><span class="p">(</span><span class="n">my_function</span><span class="p">(</span><span class="mi">5</span><span class="p">))</span> <span class="c1"># [2, 5]</span>\n</code></pre>\n</div>\n\n<h2>Recommended:</h2>\n\n<div class="highlight markdown-rendered">\n<pre><span></span><code><span class="k">def</span> <span class="nf">my_function</span><span class="p">(</span><span class="n">elem</span><span class="p">,</span> <span class="n">l</span><span class="o">=</span><span class="kc">None</span><span class="p">):</span>\n    <span class="k">if</span> <span class="n">l</span> <span class="ow">is</span> <span class="kc">None</span><span class="p">:</span>\n        <span class="n">l</span> <span class="o">=</span> <span class="p">[]</span>\n    <span class="n">l</span><span class="o">.</span><span class="n">append</span><span class="p">(</span><span class="n">elem</span><span class="p">)</span>\n    <span class="k">return</span> <span class="n">l</span>\n\n<span class="nb">print</span><span class="p">(</span><span class="n">my_function</span><span class="p">(</span><span class="mi">2</span><span class="p">))</span> <span class="c1"># [2]</span>\n<span class="nb">print</span><span class="p">(</span><span class="n">my_function</span><span class="p">(</span><span class="mi">5</span><span class="p">))</span> <span class="c1"># [5]</span>\n</code></pre>\n</div>\n',
    blobUrlRoot:
      'https://github.com/deepsourcelabs/demo-python/blob/2316e689facc8b4ea67258230b5cbce5c7d6c8d4/',
    checkId: 'Q2hlY2s6enFkbmpv',
    canIgnoreIssues: true,
    issueOccurrences: [
      {
        id: 'Q2hlY2tJc3N1ZTpsZWx4bWE=',
        path: 'code.py',
        text: 'Dangerous default value [] as argument',
        modifiedAt: '2020-07-06T10:14:07.226091+00:00',
        createdAt: '2020-07-06T10:14:07.226084+00:00',
        beginLine: 48,
        beginColumn: 17,
        endLine: 48,
        endColumn: 17,
        sourceCodeMarkup: '<div class="highlight"></div>',
        shortcode: 'PYL-W0102'
      },
      {
        id: 'Q2hlY2tJc3N1ZTp5dmxqZ2Q=',
        path: 'code.py',
        text: 'Dangerous default value {} as argument',
        modifiedAt: '2020-07-06T10:14:07.225798+00:00',
        createdAt: '2020-07-06T10:14:07.225791+00:00',
        beginLine: 29,
        beginColumn: 9,
        endLine: 29,
        endColumn: 9,
        sourceCodeMarkup: '<div class="highlight"></div>',
        shortcode: 'PYL-W0102'
      },
      {
        id: 'Q2hlY2tJc3N1ZTpta2xvcmc=',
        path: 'code.py',
        text: 'Dangerous default value [] as argument',
        modifiedAt: '2020-07-06T10:14:07.225495+00:00',
        createdAt: '2020-07-06T10:14:07.225488+00:00',
        beginLine: 23,
        beginColumn: 25,
        endLine: 23,
        endColumn: 25,
        sourceCodeMarkup: '<div class="highlight"></div>',
        shortcode: 'PYL-W0102'
      }
    ],
    issueIndex: 1,
    snippetsLoading: false,
    snippetsFetchErrored: false
  }

  const mocks = {
    $localStore: {
      get: () => ['']
    },
    $route: {
      params: {
        issueId: 'PYL-W0102'
      }
    }
  }

  const stubs = {
    IssueEditor: true,
    LazyEmptyState: true,
    ZButton: true,
    ZIcon: true,
    ZInput: true,
    ZMenu: true,
    ZMenuItem: true,
    ZPagination: true
  }

  test('renders a sample list of issue occurrences', () => {
    const { html } = render(IssueList, {
      mocks,
      propsData: baseProps,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
})
