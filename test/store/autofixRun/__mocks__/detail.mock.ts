import { AutofixRun } from "~/types/types";
import { AutofixRunDetailModuleState } from "~/store/autofixRun/detail"

/**
 * Mock for autofix run detail.
 */
export const AUTOFIX_RUN_DETAIL: AutofixRun = <AutofixRun>{
  "id": "QXV0b2ZpeFJ1bjoyMjc=",
  "errors": "[]",
  "finishedIn": 10,
  "issuesAffected": 0,
  "committedToBranchStatus": "NCB",
  "resolvedIssuesCount": 1,
  "pullRequestStatus": "PRM",
  "status": "PASS",
  "changeset": {
    "services/internal/schema.py": {
      "patches": [
        {
          "id": 1216,
          "action": "modified",
          "before_html": "<div class=\"highlight\"><pre><span class=\"ln\">14</span>\n<span class=\"ln\">15</span>\n<span class=\"ln\">16</span><span class=\"k\">class</span> <span class=\"nc\">InternalAuthorizationMiddleware</span><span class=\"p\">:</span>\n<span class=\"hlr\" data-code-marker=\"-\"><span class=\"ln\">17</span>    <span class=\"k\">def</span> <span class=\"nf\">resolve</span><span class=\"p\">(</span><span class=\"bp\">self</span><span class=\"p\">,</span> <span class=\"nb\">next</span><span class=\"p\">,</span> <span class=\"n\">root</span><span class=\"p\">,</span> <span class=\"n\">info</span><span class=\"p\">,</span> <span class=\"o\">*</span><span class=\"o\">*</span><span class=\"n\">args</span><span class=\"p\">)</span><span class=\"p\">:</span></span>\n<span class=\"ln\">18</span>        <span class=\"n\">auth_header</span> <span class=\"o\">=</span> <span class=\"n\">info</span><span class=\"o\">.</span><span class=\"n\">context</span><span class=\"o\">.</span><span class=\"n\">META</span><span class=\"o\">.</span><span class=\"n\">get</span><span class=\"p\">(</span><span class=\"sa\"></span><span class=\"s1\">&#39;</span><span class=\"s1\">HTTP_AUTHORIZATION</span><span class=\"s1\">&#39;</span><span class=\"p\">)</span>\n<span class=\"ln\">19</span>\n<span class=\"ln\">20</span>        <span class=\"c1\"># we allow all requests without any auth when DEBUG is True</span></pre></span>",
          "after_html": "<div class=\"highlight\"><pre><span class=\"ln\">14</span>\n<span class=\"ln\">15</span>\n<span class=\"ln\">16</span><span class=\"k\">class</span> <span class=\"nc\">InternalAuthorizationMiddleware</span><span class=\"p\">:</span>\n<span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">17</span>    <span class=\"nd\">@staticmethod</span></span><span class=\"hlg\" data-code-marker=\"+\"><span class=\"ln\">18</span>    <span class=\"k\">def</span> <span class=\"nf\">resolve</span><span class=\"p\">(</span><span class=\"nb\">next</span><span class=\"p\">,</span> <span class=\"n\">root</span><span class=\"p\">,</span> <span class=\"n\">info</span><span class=\"p\">,</span> <span class=\"o\">*</span><span class=\"o\">*</span><span class=\"n\">args</span><span class=\"p\">)</span><span class=\"p\">:</span></span><span class=\"ln\">19</span>        <span class=\"n\">auth_header</span> <span class=\"o\">=</span> <span class=\"n\">info</span><span class=\"o\">.</span><span class=\"n\">context</span><span class=\"o\">.</span><span class=\"n\">META</span><span class=\"o\">.</span><span class=\"n\">get</span><span class=\"p\">(</span><span class=\"sa\"></span><span class=\"s1\">&#39;</span><span class=\"s1\">HTTP_AUTHORIZATION</span><span class=\"s1\">&#39;</span><span class=\"p\">)</span>\n<span class=\"ln\">20</span>\n<span class=\"ln\">21</span>        <span class=\"c1\"># we allow all requests without any auth when DEBUG is True</span></pre></span>"
        }
      ],
      "issues": []
    }
  },
  "vcsPrUrl": "https://github.com/deepsourcelabs/asgard/pull/1555"
}

/**
 * Mock -- Autofix run detail factory
 * @see AUTOFIX_RUN_DETAIL
 */
export const mockAutofixRunDetail = (): AutofixRun => AUTOFIX_RUN_DETAIL;

/**
 * Mock factory
 */
export const mockAutofixRunDetailState = (): AutofixRunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  autofixRun: mockAutofixRunDetail()
});