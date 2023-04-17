import { render } from '@testing-library/vue'

import DummyAuditLog from '~/components/AuditLog/DummyAuditLog.vue'

describe('[[ DummyAuditLog ]]', () => {
  const stubs = {
    Log: true,
    PaginationV2: true,
    TimelineV2: true,
    TimelineItemV2: true,
    ZIcon: true
  }

  it('renders a dummy list of Audit log events', () => {
    const { html } = render(DummyAuditLog, { stubs })

    expect(html()).toMatchSnapshot()
  })
})
