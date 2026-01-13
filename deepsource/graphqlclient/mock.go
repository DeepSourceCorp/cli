package graphqlclient

import "context"

// MockClient is a mock implementation for testing.
type MockClient struct {
	QueryFunc  func(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error
	MutateFunc func(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error
	token      string
}

func NewMockClient() *MockClient {
	return &MockClient{}
}

func (m *MockClient) Query(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
	if m.QueryFunc != nil {
		return m.QueryFunc(ctx, query, vars, result)
	}
	return nil
}

func (m *MockClient) Mutate(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error {
	if m.MutateFunc != nil {
		return m.MutateFunc(ctx, mutation, vars, result)
	}
	return nil
}

func (m *MockClient) SetAuthToken(token string) {
	m.token = token
}
