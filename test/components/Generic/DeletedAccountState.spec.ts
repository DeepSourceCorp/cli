import { render } from '@testing-library/vue'
import EmptyState from '~/components/Common/EmptyState.vue'
import DeletedAccountState from '~/components/DeletedAccountState.vue'
import { cartesian, generateStringProps } from '~/test/utils'

test('renders DeletedAccountState with all prop options', () => {
  const accountTypeOptions = generateStringProps('accountType', ['team', 'account'])
  cartesian(accountTypeOptions).forEach((propCombination) => {
    const { html } = render(DeletedAccountState, {
      props: propCombination,
      stubs: { EmptyState }
    })

    expect(html()).toMatchSnapshot('DeletedAccountState')
  })
})
