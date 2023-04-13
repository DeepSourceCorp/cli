import { render } from '@testing-library/vue'

import AuditLogPage from '~/components/AuditLog/AuditLogPage.vue'

import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import { AuditLogLevel } from '~/types/auditLog'

describe('[[ AuditLogPage ]]', () => {
  const baseProps = {
    pageNumber: 1,
    totalCount: 90,
    dateRange: '3m',
    level: AuditLogLevel.Repository,
    searchQuery: '',
    viewerEmail: 'johndoe@test.com',
    auditLogItems: [
      {
        id: 'QXVkaXRMb2c6Ymxya2xt',
        eventName: 'repo.audit_log_export',
        description: 'Exported 0 entries from the audit log from 03 April, 2023 to 10 April, 2023.',
        ipAddress: '10.132.20.3',
        location: null,
        createdAt: '2023-04-10T05:57:58.403997+00:00',
        actor: {
          fullName: 'John Doe',
          firstName: 'John',
          email: 'johndoe@test.com',
          avatar:
            'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/485fee06-4402-4356-a5e7-434d94e524be'
        }
      },
      {
        id: 'QXVkaXRMb2c6emRwb2x3',
        eventName: 'repo.audit_log_export',
        description: 'Exported 0 entries from the audit log from 03 April, 2023 to 10 April, 2023.',
        ipAddress: '10.132.7.19',
        location: null,
        createdAt: '2023-04-10T05:54:31.471602+00:00',
        actor: {
          fullName: 'John Doe',
          firstName: 'John',
          email: 'johndoe@test.com',
          avatar:
            'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/485fee06-4402-4356-a5e7-434d94e524be',
          __typename: 'User'
        }
      },
      {
        id: 'QXVkaXRMb2c6enFxd2Rt',
        eventName: 'repo.audit_log_export',
        description:
          'Exported 70 entries from the audit log from 10 January, 2023 to 10 April, 2023.',
        ipAddress: '10.132.7.19',
        location: null,
        createdAt: '2023-04-10T05:54:24.633953+00:00',
        actor: {
          fullName: 'John Doe',
          firstName: 'John',
          email: 'johndoe@test.com',
          avatar:
            'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/485fee06-4402-4356-a5e7-434d94e524be'
        }
      },
      {
        id: 'QXVkaXRMb2c6YmF5bXdu',
        eventName: 'repo.create_ignore_rule',
        description: 'An ignore rule was created.',
        ipAddress: '10.132.6.3',
        location: null,
        createdAt: '2023-01-19T07:51:28.072442+00:00',
        actor: {
          fullName: 'John Doe',
          firstName: 'John',
          email: 'johndoe@test.com',
          avatar:
            'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/485fee06-4402-4356-a5e7-434d94e524be'
        }
      },
      {
        id: 'QXVkaXRMb2c6end2a2pu',
        eventName: 'repo.create_ignore_rule',
        description: 'An ignore rule was created.',
        ipAddress: '10.132.13.6',
        location: null,
        createdAt: '2023-01-18T14:53:28.624988+00:00',
        actor: {
          fullName: 'John Doe',
          firstName: 'John',
          email: 'johndoe@test.com',
          avatar:
            'https://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/485fee06-4402-4356-a5e7-434d94e524be'
        }
      }
    ]
  }

  const stubs = {
    DateRangePicker: true,
    ExportLogsSuccessModal: true,
    LazyEmptyState: true,
    Log: true,
    PaginationV2: true,
    TimelineV2: true,
    TimelineItemV2: true,
    TimelineItemV2Loading: true,
    ZDivider: true,
    ZIcon: true,
    ZInput: true
  }

  it('renders the audit log page of different levels in various states', () => {
    const auditLogListLoadingOptions = generateBooleanProps('auditLogListLoading', false)
    const exportLogsLoadingOptions = generateBooleanProps('exportLogsLoading', false)
    const showExportLogsSuccessModalOptions = generateBooleanProps(
      'showExportLogsSuccessModal',
      false
    )

    const levelOptions = generateStringProps(
      'level',
      [AuditLogLevel.Repository, AuditLogLevel.Team],
      false
    )

    cartesian(
      auditLogListLoadingOptions,
      exportLogsLoadingOptions,
      showExportLogsSuccessModalOptions,
      levelOptions
    ).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(AuditLogPage, { propsData, stubs })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  it('renders the empty state when there are no events found', () => {
    const propsData = {
      ...baseProps,
      auditLogItems: []
    }

    const { html } = render(AuditLogPage, { propsData, stubs })

    expect(html()).toMatchSnapshot()
  })

  it('renders the corresponding empty state when there are no events found for a search query', () => {
    const propsData = {
      ...baseProps,
      searchQuery: 'test-query',
      auditLogItems: []
    }

    const { html } = render(AuditLogPage, { propsData, stubs })

    expect(html()).toMatchSnapshot()
  })
})
