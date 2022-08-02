import { RepositoryIssueConnection, TrendDirection } from '~/types/types'
import { IssueListModuleState } from '~/store/issue/list'

/**
 * Mock for issue.
 */
export const ISSUE_LIST: RepositoryIssueConnection = <RepositoryIssueConnection>{
  totalCount: 13,
  edges: [
    {
      node: {
        id: 'UmVwb3NpdG9yeUlzc3VlOjIyMDE=',
        issueType: 'bug-risk',
        title: 'Protected member accessed from outside outside the class',
        shortcode: 'PYL-W0212',
        description:
          'Accessing a protected member (a member prefixed with `_`) of a class from outside that class is not recommended, since the creator of that class did not intend this member to be exposed. If accesing this attribute outside of the class is absolutely needed, refactor it such that it becomes part of the public interface of the class.',
        occurrenceCount: 8,
        createdAt: '2020-02-29T07:06:11.659776+00:00',
        analyzerName: 'Python',
        analyzerLogo:
          'https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg',
        seenIn: 'core/models/base.py, core/models/job.py and 2 other files',
        firstSeen: '2020-02-29T07:06:11.659776+00:00',
        lastSeen: '2020-07-09T08:55:25.934225+00:00',
        autofixAvailable: false
      }
    },
    {
      node: {
        id: 'UmVwb3NpdG9yeUlzc3VlOjIyMjI=',
        issueType: 'bug-risk',
        title: 'Parameters mismatch in overriden method',
        shortcode: 'PYL-W0221',
        description:
          'Python will allow this, but if the overridden method is intended to be executed from an external code, you may want to reconsider this.\nOverriding a method without ensuring that both methods accept the same number and type of parameters has the potential to cause an error when the overriding method is called with a number of parameters that is legal for the overridden method. This violates the Liskov substitution principle. Read more about LSP [here](https://en.wikipedia.org/wiki/Liskov_substitution_principle).',
        occurrenceCount: 2,
        createdAt: '2020-02-29T07:06:11.660661+00:00',
        analyzerName: 'Python',
        analyzerLogo:
          'https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg',
        seenIn: 'contrib/../adapters.py and dashboard/../billing.py',
        firstSeen: '2020-02-29T07:06:11.660661+00:00',
        lastSeen: '2020-07-09T08:55:25.934225+00:00',
        trend: {
          trendHint: 'Since last week',
          trendValue: 1,
          trendDirection: TrendDirection.Down,
          trendPositive: true
        },
        autofixAvailable: false
      }
    },
    {
      node: {
        id: 'UmVwb3NpdG9yeUlzc3VlOjIyMzY=',
        issueType: 'bug-risk',
        title: 'Abstract method not overridden',
        shortcode: 'PYL-W0223',
        description:
          'The abstract method which raises `NotImplementedError` is not overridden in the concrete class. This can result in unintended behavior.',
        occurrenceCount: 6,
        createdAt: '2020-03-03T09:00:43.962483+00:00',
        analyzerName: 'Python',
        analyzerLogo:
          'https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg',
        seenIn: 'contrib/../es6compiler.py, contrib/../boto3.py and 1 other file',
        firstSeen: '2020-03-03T09:00:43.962483+00:00',
        lastSeen: '2020-07-09T08:55:25.934225+00:00',
        autofixAvailable: false
      }
    },
    {
      node: {
        id: 'UmVwb3NpdG9yeUlzc3VlOjM0MDE=',
        issueType: 'bug-risk',
        title: 'Pin versions in apt get install',
        shortcode: 'DOK-DL3008',
        description:
          'Version pinning forces the build to retrieve a particular version regardless of what’s in the cache. This technique can also reduce failures due to unanticipated changes in required packages.\nYou can read more about it [here](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#apt-get)\n\nProblematic code:\n\n```dockerfile\nFROM busybox\nRUN apt-get install python\n```\n\nCorrect code:\n\n```dockerfile\nFROM busybox\nRUN apt-get install python=2.7\n```',
        occurrenceCount: 2,
        createdAt: '2020-04-09T18:39:18.395080+00:00',
        analyzerName: 'Dockerfile',
        analyzerLogo:
          'https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/docker.svg',
        seenIn: 'Dockerfile',
        firstSeen: '2020-04-09T18:39:18.395080+00:00',
        lastSeen: '2020-07-09T08:52:14.534900+00:00',
        autofixAvailable: false
      }
    },
    {
      node: {
        id: 'UmVwb3NpdG9yeUlzc3VlOjM0MDI=',
        issueType: 'bug-risk',
        title: 'Pin versions in `pip`',
        shortcode: 'DOK-DL3013',
        description:
          'Version pinning forces the build to retrieve a particular version regardless of what’s in the cache. This technique can also reduce failures due to unanticipated changes in required packages.\nYou can read more about it [here](https://docs.docker.com/engine/articles/dockerfile_best-practices/).\n\nProblematic code:\n\n```dockerfile\nFROM python:3.4\nRUN pip install django\nRUN pip install https://github.com/Banno/carbon/tarball/0.9.x-fix-events-callback\n```\n\nCorrect code:\n\n```dockerfile\nFROM python:3.4\nRUN pip install django==1.9\nRUN pip install git+https://github.com/Banno/carbon@0.9.15\n```',
        occurrenceCount: 2,
        createdAt: '2020-04-09T18:39:18.395144+00:00',
        analyzerName: 'Dockerfile',
        analyzerLogo:
          'https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/docker.svg',
        seenIn: 'Dockerfile',
        firstSeen: '2020-04-09T18:39:18.395144+00:00',
        lastSeen: '2020-07-09T08:52:14.534900+00:00',
        autofixAvailable: false
      }
    }
  ]
}

/**
 * Mock -- Issue list factory
 * @see ISSUE_LIST
 */
export const mockIssueList = (): RepositoryIssueConnection => ISSUE_LIST

/**
 * Mock factory
 */
export const mockIssueListState = (): IssueListModuleState => ({
  loading: false,
  error: {},
  issueList: mockIssueList()
})
