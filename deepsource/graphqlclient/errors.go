package graphqlclient

import "fmt"

// GraphQLError wraps errors from GraphQL operations.
type GraphQLError struct {
	Operation string
	Query     string
	Cause     error
}

func (e *GraphQLError) Error() string {
	return fmt.Sprintf("GraphQL %s failed: %v", e.Operation, e.Cause)
}

func (e *GraphQLError) Unwrap() error {
	return e.Cause
}

// TruncateQuery trims long queries for error messages.
func TruncateQuery(query string) string {
	if len(query) > 100 {
		return query[:100] + "..."
	}
	return query
}
