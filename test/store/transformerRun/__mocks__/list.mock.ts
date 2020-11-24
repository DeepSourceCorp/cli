import { TransformerRunConnection } from "~/types/types";
import { TransformerRunListModuleState } from "~/store/transformerRun/list"

/**
 * Mock for transformer run list.
 */
export const TRANSFORMER_RUN_LIST: TransformerRunConnection = <TransformerRunConnection>{
  "totalCount": 7,
  "edges": [
    {
      "node": {
        "createdAt": "2020-07-09T14:53:51.614984+00:00",
        "runId": "d0a61f26-6269-408c-b188-a2b139b7f8df",
        "status": "PASS",
        "branchName": "654-rbac",
        "commitOid": "ca329d8ccb99978544745050c5fe407d2dfb40f1",
        "finishedIn": 140,
        "changedFilesCount": 8,
        "tools": [
          {
            "name": "Black",
            "shortcode": "black",
            "logo_path": "https://s3.us-east-1.amazonaws.com/local-asgard-static/transformer_logos/black.svg",
            "description": "The uncompromising Python code formatter"
          }
        ],
        "commitStatus": null,
        "gitCompareDisplay": "a8935a7..ca329d8",
        "pullRequestNumber": 1888,
        "vcsPrUrl": "https://github.com/deepsourcelabs/asgard/pull/1888",
        "__typename": "TransformerRun"
      },
      "__typename": "TransformerRunEdge"
    },
    {
      "node": {
        "createdAt": "2020-07-09T14:03:12.156109+00:00",
        "runId": "108f78b9-b332-4749-ba58-ffd7f2109a98",
        "status": "PASS",
        "branchName": "654-rbac",
        "commitOid": "9a5c2a0a98112be19d0e2c045aa0dfd466144d2d",
        "finishedIn": 163,
        "changedFilesCount": 7,
        "tools": [
          {
            "name": "Black",
            "shortcode": "black",
            "logo_path": "https://s3.us-east-1.amazonaws.com/local-asgard-static/transformer_logos/black.svg",
            "description": "The uncompromising Python code formatter"
          }
        ],
        "commitStatus": null,
        "gitCompareDisplay": "a8935a7..9a5c2a0",
        "pullRequestNumber": 1888,
        "vcsPrUrl": "https://github.com/deepsourcelabs/asgard/pull/1888",
        "__typename": "TransformerRun"
      },
      "__typename": "TransformerRunEdge"
    },
    {
      "node": {
        "createdAt": "2020-07-09T09:56:55.905885+00:00",
        "runId": "21a21732-0162-403e-bb6a-f6e399f988e5",
        "status": "PASS",
        "branchName": "rudderstack-page-trackers/1785",
        "commitOid": "19b0a4b9960ba80e1897f64adb3af4e70da38897",
        "finishedIn": 25,
        "changedFilesCount": 1,
        "tools": [
          {
            "name": "Black",
            "shortcode": "black",
            "logo_path": "https://s3.us-east-1.amazonaws.com/local-asgard-static/transformer_logos/black.svg",
            "description": "The uncompromising Python code formatter"
          }
        ],
        "commitStatus": true,
        "gitCompareDisplay": "a8935a7..19b0a4b",
        "pullRequestNumber": 1878,
        "vcsPrUrl": "https://github.com/deepsourcelabs/asgard/pull/1878",
        "__typename": "TransformerRun"
      },
      "__typename": "TransformerRunEdge"
    },
    {
      "node": {
        "createdAt": "2020-07-09T09:47:51.426349+00:00",
        "runId": "db4a20a2-c801-4d77-88c2-5d1e9e4bfde4",
        "status": "PASS",
        "branchName": "rudderstack-page-trackers/1785",
        "commitOid": "0f50733a378e220ed58b5864321a594fc0b6b90f",
        "finishedIn": 24,
        "changedFilesCount": 1,
        "tools": [
          {
            "name": "Black",
            "shortcode": "black",
            "logo_path": "https://s3.us-east-1.amazonaws.com/local-asgard-static/transformer_logos/black.svg",
            "description": "The uncompromising Python code formatter"
          }
        ],
        "commitStatus": null,
        "gitCompareDisplay": "a8935a7..0f50733",
        "pullRequestNumber": 1878,
        "vcsPrUrl": "https://github.com/deepsourcelabs/asgard/pull/1878",
        "__typename": "TransformerRun"
      },
      "__typename": "TransformerRunEdge"
    },
    {
      "node": {
        "createdAt": "2020-07-09T09:04:47.364876+00:00",
        "runId": "84dd5ba7-45cd-4e48-a24a-4ff668405c93",
        "status": "PASS",
        "branchName": "fix#1875",
        "commitOid": "267fca214d7e481f61ef29e51c87b554e14096e5",
        "finishedIn": 30,
        "changedFilesCount": 1,
        "tools": [
          {
            "name": "Black",
            "shortcode": "black",
            "logo_path": "https://s3.us-east-1.amazonaws.com/local-asgard-static/transformer_logos/black.svg",
            "description": "The uncompromising Python code formatter"
          }
        ],
        "commitStatus": null,
        "gitCompareDisplay": "ee4f8b7..267fca2",
        "pullRequestNumber": 1883,
        "vcsPrUrl": "https://github.com/deepsourcelabs/asgard/pull/1883",
        "__typename": "TransformerRun"
      },
      "__typename": "TransformerRunEdge"
    }
  ],
  "__typename": "TransformerRunConnection"
}

/**
 * Mock -- Transformer run list factory
 * @see TRANSFORMER_RUN_LIST
 */
export const mockTransformerRunList = (): TransformerRunConnection => TRANSFORMER_RUN_LIST;

/**
 * Mock factory
 */
export const mockTransformerRunListState = (): TransformerRunListModuleState => ({
  loading: false as boolean,
  error: {},
  transformerRunList: mockTransformerRunList()
});