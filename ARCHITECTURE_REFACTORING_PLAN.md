# Architecture Refactoring Plan: DeepSource CLI

## Progress Tracker

### Phase 1: Foundation & Output System (Week 1-2)
- [x] 1. Create `internal/interfaces/` package with all interface definitions
- [x] 2. Create `internal/container/` package with dependency container
- [x] 3. Create `internal/adapters/` with production implementations
- [x] 4. Create `internal/errors/` with structured error types
- [x] 5. Implement dual output system (user-facing + diagnostic logging)
- [x] 6. Add context.Context propagation support
- [x] 7. Add comprehensive documentation

### Phase 2a: SDK Foundation (Week 2-3)
- [x] 1. Create centralized GraphQL client interface in `deepsource/graphql.go`
- [x] 2. Build GraphQL client wrapper with auth/header management
- [x] 3. Create structured error types for GraphQL operations
- [x] 4. Create mock implementations for testing
- [x] 5. Refactor auth mutations (register, request PAT, refresh)

### Phase 2b: SDK Queries (Week 3-4)
- [x] 1. Refactor analyzers queries
- [x] 2. Refactor transformers queries
- [x] 3. Refactor repository queries
- [x] 4. Refactor issues queries
- [x] 5. Remove duplicate `IGQLClient` interfaces
- [x] 6. Update Client facade to use new interface

### Phase 3: Config & Auth Services (Week 4-5)
- [x] 1. Refactor `config/` package to use interfaces (remove global state)
- [x] 2. Create `internal/services/auth/` service
- [x] 3. Refactor auth subcommands (login, logout, refresh, status) to use service
- [x] 4. Add configuration file support (.deepsource-cli.yaml)
- [x] 5. Implement secrets management (keychain integration)
- [x] 6. Add unit tests for config and auth services

### Phase 4: Report Command Service (Week 5-6)
- [x] 1. Create `internal/services/report/` package
- [x] 2. Extract business logic from `command/report/report.go`
- [x] 3. Refactor `command/report/report.go` to thin wrapper
- [x] 4. Write unit tests for service
- [x] 5. Add progress indicators for upload/compression
- [x] 6. Enhance error messages with actionable guidance
- [x] 7. Add `--output` flag support (json/yaml/table)

### Phase 5a: Issues & Repo Commands (Week 6-7)
- [x] 1. Create `internal/services/issues/` service
- [x] 2. Create `internal/services/repo/` service
- [x] 3. Refactor issues subcommands (list, list-file)
- [x] 4. Refactor repo subcommands (view, status)
- [x] 5. Add output format support to all commands
- [x] 6. Add unit tests for services

### Phase 5b: Config & Version Commands (Week 7-8)
- [x] 1. Create `internal/services/config/` service (generate, validate)
- [x] 2. Refactor config subcommands
- [x] 3. Refactor version command
- [x] 4. Update integration tests to use container
- [x] 5. Remove caching layer from scope

## Verification Tracker

### Run Results
- [ ] `go test ./...` (fails in sandbox: `utils` TestFetchOIDCTokenFromProvider cannot bind httptest listener)

### CLI Flows
- [ ] Auth: login, logout, refresh, status
- [ ] Config: generate, validate
- [ ] Report: key/value, value-file, analyzer type, OIDC
- [ ] Issues: list (table/json/csv/sarif)
- [ ] Repo: status, view (table/json/yaml)
- [ ] Version command

### OIDC Coverage
- [ ] `utils/fetch_oidc_token.go` flows (supported providers)
