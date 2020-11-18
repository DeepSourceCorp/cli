import { RepositoryConnection } from "~/types/types";
import { RepositoryListModuleState } from "~/store/repository/list"

/**
 * Mock for repository list.
 */
export const REPOSITORY_LIST: RepositoryConnection = <RepositoryConnection>{
  "totalCount": 72,
  "edges": [{
    "node": {
      "id": "UmVwb3NpdG9yeToxNjgw",
      "name": "marvin-ruby",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:48.232305+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "33f51603077ad02f3691df11c7a70866277a6ac0",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["go", "docker", "ruby"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToxNzAx",
      "name": "web",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:48.536443+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "a285d0abf52bedc140e9759fc816cc916a48e1a3",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["python", "docker", "javascript"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToxNjcw",
      "name": "marvin",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-07-01T09:13:24.425308+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "fc773cf6b1b0c2f5d3bef0ad78eaf8f3c991cdf5",
      "defaultBranchName": "master",
      "lastAnalyzedAt": "2020-10-06T18:04:49.130974+00:00",
      "config": {
        "version": 1,
        "analyzers": [{
          "meta": {
            "import_path": "github.com/deepsourcelabs/marvin"
          },
          "name": "go",
          "enabled": true
        }, {
          "name": "docker",
          "enabled": true
        }],
        "test_patterns": ["tests/**", "**/*_test.go"]
      },
      "canBeActivated": true,
      "supportedAnalyzers": ["python", "docker", "go"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToxNjc5",
      "name": "marvin-python",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:48.218796+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "defb1b450a0865d0b8d2c60aed1a8dc1808eb9f9",
      "defaultBranchName": "master",
      "lastAnalyzedAt": "2020-10-06T18:04:49.130974+00:00",
      "config": {
        "version": 1,
        "analyzers": [{
          "meta": {
            "max_line_length": 100
          },
          "name": "python",
          "enabled": true,
          "dependency_file_paths": ["requirements/requirements3.txt"]
        }, {
          "name": "test-coverage",
          "enabled": true
        }, {
          "meta": {
            "import_path": "github.com/deepsourcelabs/marvin-python"
          },
          "name": "go",
          "enabled": true
        }, {
          "name": "docker",
          "enabled": true
        }],
        "test_patterns": ["tests/**/*"],
        "exclude_patterns": ["tests/dependencies/**", "tests/run_pylint_deps/**", "tests/run_mypy_deps/**"]
      },
      "canBeActivated": true,
      "supportedAnalyzers": ["python", "docker", "go"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToyOTU4",
      "name": "bumblebee",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:47.670423+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "09eaa460cb6f0c6193db8b511a015c212b013eef",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["python", "docker"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToyNzU4",
      "name": "codereview",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:47.723579+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "deb88798943c254a2bd9e9b35e2bfc86abb03956",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["ruby", "javascript"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToyMDY5",
      "name": "marvin-sql",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:48.256375+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "b1ca465e7c66a5be89e70933d095e7c52469c643",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["go", "docker"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToxNjc2",
      "name": "marvin-javascript",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:48.188787+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "2cc3e8c5000f9adc584b59c60746292c8494798a",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["docker", "javascript"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToxNjYw",
      "name": "good-first-issue",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:47.941384+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": false,
      "latestCommitOid": "0b525c2cdcda2ee2808733a3bc87526cc1a70fe1",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["python", "javascript"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }, {
    "node": {
      "id": "UmVwb3NpdG9yeToxNjgy",
      "name": "marvin-terraform",
      "vcsProvider": "GITHUB",
      "ownerLogin": "deepsourcelabs",
      "modifiedAt": "2020-06-04T09:59:48.269986+00:00",
      "isActivated": false,
      "isFork": false,
      "isPrivate": true,
      "latestCommitOid": "c424a1e88e6f44ae4f859b071c98f53478a8a090",
      "defaultBranchName": "master",
      "lastAnalyzedAt": null,
      "config": {},
      "canBeActivated": true,
      "supportedAnalyzers": ["go", "docker"],
      "__typename": "Repository"
    },
    "__typename": "RepositoryEdge"
  }],
  "__typename": "RepositoryConnection"
}


/**
 * Mock -- Repository list factory
 * @see REPOSITORY_LIST
 */
export const mockRepositoryList = (): RepositoryConnection => REPOSITORY_LIST;

/**
 * Mock factory
 */
export const mockRepository = (): RepositoryListModuleState => ({
  repositoryList: mockRepositoryList()
});