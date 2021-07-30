import { TransformerRun } from "~/types/types";
import { TransformerRunDetailModuleState } from "~/store/transformerRun/detail"

/**
 * Mock for transformer run detail.
 */
export const TRANSFORMER_RUN_DETAIL: TransformerRun = <TransformerRun>{"errors": "[]",
"pullRequestStatus": "PRC",
"status": "PASS",
"tools": [
  {
    "name": "Black",
    "shortcode": "black",
    "logo_path": "https://s3.us-east-1.amazonaws.com/local-asgard-static/transformer_logos/black.svg",
    "description": "The uncompromising Python code formatter"
  }
],
"changedFilesCount": 1,
"committedToBranchStatus": "NCB",
"id": "VHJhbnNmb3JtZXJSdW46a2JlcHF6",
"changeset": {
  "pack.py": [
    {
      "id": 5369,
      "action": "modified",
      "before_html": "<div class=\"highlight\"><pre><span class=\"ln\">13</span>\n<span class=\"ln\">14</span>\n<span class=\"ln\">15</span><span class=\"k\">def</span> <span class=\"nf\">main</span><span class=\"p\">(</span><span class=\"p\">)</span><span class=\"p\">:</span>\n<span class=\"hlr\" data-code-marker=\"-\"><span class=\"ln\">16</span>  <span class=\"k\">print</span><span class=\"p\">(</span><span class=\"sa\"></span><span class=\"s1\">&#39;</span><span class=\"s1\">I</span><span class=\"se\">\\&#39;</span><span class=\"s1\">m trying to write a really really long line, so that black would reformat my code. Let</span><span class=\"se\">\\&#39;</span><span class=\"s1\">s see how this goes.</span><span class=\"s1\">&#39;</span><span class=\"p\">)</span></span><span class=\"hlr\" data-code-marker=\"-\"><span class=\"ln\">17</span>  <span class=\"k\">print</span><span class=\"p\">(</span><span class=\"sa\"></span><span class=\"s1\">&#39;</span><span class=\"s1\">Also, if you didn</span><span class=\"se\">\\&#39;</span><span class=\"s1\">t notice, I used single quotes, so that black will change that too</span><span class=\"s1\">&#39;</span><span class=\"p\">)</span></span><span class=\"hlr\" data-code-marker=\"-\"><span class=\"ln\">18</span>  <span class=\"kn\">from</span> <span class=\"nn\">vulture</span> <span class=\"kn\">import</span> <span class=\"n\">core</span> <span class=\"c1\"># \\__(-_-)__/</span></span>\n\n\n\n<span class=\"ln\">19</span>\n<span class=\"ln\">20</span>\n<span class=\"ln\">21</span><span class=\"k\">if</span> <span class=\"vm\">__name__</span> <span class=\"o\">==</span> <span class=\"sa\"></span><span class=\"s1\">&#39;</span><span class=\"s1\">__main__</span><span class=\"s1\">&#39;</span><span class=\"p\">:</span></pre></span>",
      "after_html": "<div class=\"highlight\"><pre><span class=\"ln\">13</span>\n<span class=\"ln\">14</span>\n<span class=\"ln\">15</span><span class=\"k\">def</span> <span class=\"nf\">main</span><span class=\"p\">(</span><span class=\"p\">)</span><span class=\"p\">:</span>\n<span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">16</span>    <span class=\"k\">print</span><span class=\"p\">(</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">17</span>        <span class=\"sa\"></span><span class=\"s2\">&#34;</span><span class=\"s2\">I</span><span class=\"s2\">&#39;</span><span class=\"s2\">m trying to write a really really long line, so that black would reformat my code. Let</span><span class=\"s2\">&#39;</span><span class=\"s2\">s see how this goes.</span><span class=\"s2\">&#34;</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">18</span>    <span class=\"p\">)</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">19</span>    <span class=\"k\">print</span><span class=\"p\">(</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">20</span>        <span class=\"sa\"></span><span class=\"s2\">&#34;</span><span class=\"s2\">Also, if you didn</span><span class=\"s2\">&#39;</span><span class=\"s2\">t notice, I used single quotes, so that black will change that too</span><span class=\"s2\">&#34;</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">21</span>    <span class=\"p\">)</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">22</span>    <span class=\"kn\">from</span> <span class=\"nn\">vulture</span> <span class=\"kn\">import</span> <span class=\"n\">core</span>  <span class=\"c1\"># \\__(-_-)__/</span></span><span class=\"ln\">23</span>\n<span class=\"ln\">24</span>\n<span class=\"ln\">25</span><span class=\"k\">if</span> <span class=\"vm\">__name__</span> <span class=\"o\">==</span> <span class=\"sa\"></span><span class=\"s2\">&#34;</span><span class=\"s2\">__main__</span><span class=\"s2\">&#34;</span><span class=\"p\">:</span></pre></span>"
    },
    {
      "id": 5370,
      "action": "modified",
      "before_html": "<div class=\"highlight\"><pre><span class=\"ln\">18</span>  <span class=\"kn\">from</span> <span class=\"nn\">vulture</span> <span class=\"kn\">import</span> <span class=\"n\">core</span> <span class=\"c1\"># \\__(-_-)__/</span>\n<span class=\"ln\">19</span>\n<span class=\"ln\">20</span>\n<span class=\"hlr\" data-code-marker=\"-\"><span class=\"ln\">21</span><span class=\"k\">if</span> <span class=\"vm\">__name__</span> <span class=\"o\">==</span> <span class=\"sa\"></span><span class=\"s1\">&#39;</span><span class=\"s1\">__main__</span><span class=\"s1\">&#39;</span><span class=\"p\">:</span></span><span class=\"hlr\" data-code-marker=\"-\"><span class=\"ln\">22</span>  <span class=\"n\">main</span><span class=\"p\">(</span><span class=\"p\">)</span></span></pre></span>",
      "after_html": "<div class=\"highlight\"><pre><span class=\"ln\">22</span>    <span class=\"kn\">from</span> <span class=\"nn\">vulture</span> <span class=\"kn\">import</span> <span class=\"n\">core</span>  <span class=\"c1\"># \\__(-_-)__/</span>\n<span class=\"ln\">23</span>\n<span class=\"ln\">24</span>\n<span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">25</span><span class=\"k\">if</span> <span class=\"vm\">__name__</span> <span class=\"o\">==</span> <span class=\"sa\"></span><span class=\"s2\">&#34;</span><span class=\"s2\">__main__</span><span class=\"s2\">&#34;</span><span class=\"p\">:</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">26</span>    <span class=\"n\">main</span><span class=\"p\">(</span><span class=\"p\">)</span></span></pre></span>"
    }
  ]
},
"vcsPrUrl": "https://github.com/RJ722/dst/pull/13",
"vcsCommitUrl": null
}

/**
 * Mock -- Transformer run detail factory
 * @see TRANSFORMER_RUN_DETAIL
 */
export const mockTransformerRunDetail = (): TransformerRun => TRANSFORMER_RUN_DETAIL;

/**
 * Mock factory
 */
export const mockTransformerRunDetailState = (): TransformerRunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  transformerRun: mockTransformerRunDetail()
});
