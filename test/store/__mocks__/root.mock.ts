import { RootState } from '~/store/index'

/**
 * Mock for Root.
 */
export const ROOT = {}

/**
 * Mock -- Root factory
 * @see ROOT
 */
export const mockRoot = () => ROOT

/**
 * Mock factory
 */
export const mockRootState = (): RootState => ({
  loading: false as boolean,
  error: {},
  viewer: mockRoot()
})
