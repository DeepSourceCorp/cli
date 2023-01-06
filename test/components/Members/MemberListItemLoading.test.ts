import { render } from '@testing-library/vue'
import { MemberListItemLoading } from '~/components/Members'

test('renders MemberListItemLoading', () => {
  const { html } = render(MemberListItemLoading, {})

  expect(html()).toMatchSnapshot()
})
