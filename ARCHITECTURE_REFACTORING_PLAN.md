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

## Executive Summary

This document outlines a comprehensive plan to refactor the DeepSource CLI for improved extensibility and testability. The current architecture suffers from tight coupling, lack of dependency injection, and mixed concerns that make testing difficult and changes risky.

## Current Architecture Assessment

### Structure
```
cli/
├── cmd/deepsource/        # Entry point with hardcoded dependencies
├── command/               # Cobra command implementations
│   ├── auth/
│   ├── config/
│   ├── issues/
│   ├── repo/
│   ├── report/
│   └── version/
├── deepsource/            # SDK client for API interactions
├── utils/                 # Shared utilities
├── config/                # Configuration management
└── configvalidator/       # Config validation logic
```

### Critical Issues

#### 1. Tight Coupling & Hard Dependencies
- `main.go` directly initializes Sentry and calls `command.Execute()`
- Commands call `os.Exit()` directly in `Run()` methods
- Direct use of `os.Getenv`, `fmt.Println`, `fmt.Fprintln` throughout command logic
- HTTP client creation inline in functions
- Git commands executed directly via `exec.Command` in business logic

**Impact**: Unit testing nearly impossible without external dependencies or process isolation

#### 2. No Dependency Injection
- No interfaces for external dependencies (HTTP client, file system, git, env vars)
- Global state usage (`config.Cfg`)
- Functions create their own dependencies rather than receiving them
- Command options structs contain no injected dependencies

**Impact**: Cannot mock external systems, test isolation is impossible

#### 3. Mixed Concerns
- `command/report/report.go`: 260+ lines mixing validation, HTTP calls, git operations, compression, output formatting
- Business logic embedded in command handlers
- No separation between presentation, application, and domain layers

**Impact**: Code difficult to test in isolation, changes have wide-ranging effects

#### 4. Limited Test Coverage
- Only 16 test files for 31+ source files
- Tests mostly integration tests using compiled binary
- No unit tests for business logic
- Golden file testing requires external setup

**Impact**: Slow tests, poor feedback loop, hard to test edge cases

#### 5. Inconsistent Error Handling
- Mix of `return error` and `return int` (exit codes)
- Errors printed to stderr directly rather than returned
- Sentry calls scattered throughout code
- No structured error types

#### 6. Configuration Management Issues
- Package-level variable `config.Cfg`
- Function variables for testing (`configDirFn`, `readFileFn`) inconsistently applied
- Mixed use of config struct and environment variables

#### 7. GraphQL SDK Issues
- **Interface duplication**: `IGQLClient` interface defined in 6+ separate packages
- **Tight coupling**: Direct dependency on `github.com/deepsourcelabs/graphql` throughout
- **Exposed internals**: `GQL()` method exposes `*graphql.Client` implementation
- **Inconsistent auth**: Some queries add auth headers, some don't
- **No error wrapping**: Errors returned as-is without context
- **Manual mapping**: Each query manually transforms nested response structs
- **Hard to test**: Tests duplicate Client struct, fragile mocks

**Impact**: Cannot swap GraphQL implementation, scattered auth logic, difficult to test, error-prone response mapping

## Proposed Architecture

### High-Level Design

```
cli/
├── cmd/deepsource/              # Thin entry point
├── internal/
│   ├── interfaces/              # Core abstractions
│   │   ├── system.go           # FileSystem, Environment, GitClient
│   │   ├── http.go             # HTTPClient
│   │   └── output.go           # OutputWriter
│   ├── container/               # Dependency injection container
│   │   ├── container.go        # Production container
│   │   └── test_container.go  # Test container
│   ├── services/                # Business logic layer
│   │   ├── report/
│   │   ├── auth/
│   │   ├── config/
│   │   └── repo/
│   ├── adapters/                # Interface implementations
│   │   ├── filesystem.go
│   │   ├── git.go
│   │   ├── http.go
│   │   └── env.go
│   └── errors/                  # Structured error types
│       └── errors.go
├── command/                     # Thin command handlers
├── config/                      # Config management (refactored)
└── deepsource/                  # SDK (potentially refactor)
```

### Core Components

#### 1. Interfaces Layer (`internal/interfaces/`)

Define contracts for all external dependencies:

```go
// system.go
type FileSystem interface {
    ReadFile(path string) ([]byte, error)
    WriteFile(path string, data []byte, perm os.FileMode) error
    Stat(path string) (os.FileInfo, error)
    MkdirAll(path string, perm os.FileMode) error
    Remove(path string) error
}

type Environment interface {
    Get(key string) string
    Set(key string, value string) error
    Lookup(key string) (string, bool)
}

type GitClient interface {
    GetHead(dir string) (string, string, error) // oid, warning, error
    ListRemotes(dir string) (map[string]RemoteInfo, error)
}

// http.go
type HTTPClient interface {
    Do(req *http.Request) (*http.Response, error)
}

// output.go
type OutputWriter interface {
    Write(p []byte) (n int, err error)
    WriteError(p []byte) (n int, err error)
    Printf(format string, a ...interface{})
    Errorf(format string, a ...interface{})
}

// telemetry.go
type TelemetryClient interface {
    CaptureException(err error)
    CaptureMessage(msg string)
    ConfigureScope(f func(scope interface{}))
    Flush(timeout time.Duration)
}
```

#### 2. Dependency Container (`internal/container/`)

```go
// container.go
type Container struct {
    FileSystem  FileSystem
    Environment Environment
    GitClient   GitClient
    HTTPClient  HTTPClient
    Output      OutputWriter
    Telemetry   TelemetryClient
    Config      *config.Manager
}

func New() *Container {
    return &Container{
        FileSystem:  adapters.NewRealFileSystem(),
        Environment: adapters.NewRealEnvironment(),
        GitClient:   adapters.NewRealGitClient(),
        HTTPClient:  &http.Client{Timeout: 60 * time.Second},
        Output:      adapters.NewStdOutput(),
        Telemetry:   adapters.NewSentryClient(),
        Config:      config.NewManager(/* deps */),
    }
}

// test_container.go
func NewTest() *Container {
    return &Container{
        FileSystem:  adapters.NewMemoryFileSystem(),
        Environment: adapters.NewMockEnvironment(),
        GitClient:   adapters.NewMockGitClient(),
        HTTPClient:  adapters.NewMockHTTPClient(),
        Output:      adapters.NewBufferOutput(),
        Telemetry:   adapters.NewNoOpTelemetry(),
        Config:      config.NewManager(/* test deps */),
    }
}
```

#### 3. Service Layer (`internal/services/`)

Extract business logic from commands:

```go
// internal/services/report/service.go
type Service struct {
    git    interfaces.GitClient
    http   interfaces.HTTPClient
    fs     interfaces.FileSystem
    env    interfaces.Environment
}

func NewService(deps ServiceDeps) *Service {
    return &Service{
        git:  deps.GitClient,
        http: deps.HTTPClient,
        fs:   deps.FileSystem,
        env:  deps.Environment,
    }
}

type ReportOptions struct {
    Analyzer                    string
    AnalyzerType                string
    Key                         string
    Value                       string
    ValueFile                   string
    SkipCertificateVerification bool
    DSN                         string
    UseOIDC                     bool
    OIDCRequestToken            string
    OIDCRequestUrl              string
    DeepSourceHostEndpoint      string
    OIDCProvider                string
}

type ReportResult struct {
    Analyzer string
    Key      string
    Message  string
    Warning  string
}

func (s *Service) Report(ctx context.Context, opts ReportOptions) (*ReportResult, error) {
    // 1. Sanitize and validate options
    if err := s.validateOptions(opts); err != nil {
        return nil, err
    }

    // 2. Get DSN (from env or OIDC)
    dsn, err := s.resolveDSN(opts)
    if err != nil {
        return nil, err
    }

    // 3. Get head commit
    currentDir, _ := os.Getwd() // This should also be injected
    headCommitOID, warning, err := s.git.GetHead(currentDir)
    if err != nil {
        return nil, errors.NewCLIError(errors.ErrGitOperationFailed, "unable to get commit OID HEAD", err)
    }

    // 4. Read artifact value
    artifactValue, err := s.readArtifactValue(opts)
    if err != nil {
        return nil, err
    }

    // 5. Check compression support and compress if supported
    artifactValue, metadata, err := s.prepareArtifact(ctx, dsn, artifactValue, currentDir)
    if err != nil {
        return nil, err
    }

    // 6. Submit artifact
    result, err := s.submitArtifact(ctx, dsn, headCommitOID, opts, artifactValue, metadata)
    if err != nil {
        return nil, err
    }

    result.Warning = warning
    return result, nil
}

// Private helper methods for each step...
```

#### 4. Refactored Commands (`command/`)

Commands become thin wrappers:

```go
// command/report/report.go
type Command struct {
    service *report.Service
    output  interfaces.OutputWriter
}

func NewCmdReport(deps *container.Container) *cobra.Command {
    svc := report.NewService(report.ServiceDeps{
        GitClient:   deps.GitClient,
        HTTPClient:  deps.HTTPClient,
        FileSystem:  deps.FileSystem,
        Environment: deps.Environment,
    })
    
    cmd := &Command{
        service: svc,
        output:  deps.Output,
    }
    
    opts := report.ReportOptions{}
    
    cobraCmd := &cobra.Command{
        Use:   "report",
        Short: "Report artifacts to DeepSource",
        Long:  doc,
        RunE: func(cobraCmd *cobra.Command, args []string) error {
            return cmd.Run(cobraCmd.Context(), opts)
        },
    }
    
    // Flag bindings
    cobraCmd.Flags().StringVar(&opts.Analyzer, "analyzer", "", "...")
    // ... other flags
    
    return cobraCmd
}

func (c *Command) Run(ctx context.Context, opts report.ReportOptions) error {
    result, err := c.service.Report(ctx, opts)
    if err != nil {
        c.output.Errorf("DeepSource | Error | %v\n", err)
        return err
    }
    
    c.output.Printf("DeepSource | Artifact published successfully\n\n")
    c.output.Printf("Analyzer  %s\n", result.Analyzer)
    c.output.Printf("Key       %s\n", result.Key)
    if result.Message != "" {
        c.output.Printf("Message   %s\n", result.Message)
    }
    if result.Warning != "" {
        c.output.Printf("%s", result.Warning)
    }
    
    return nil
}
```

#### 5. Error Handling (`internal/errors/`)

```go
// errors.go
type ErrorCode int

const (
    ErrInvalidConfig ErrorCode = iota + 1
    ErrAuthRequired
    ErrAuthExpired
    ErrNetworkFailure
    ErrGitOperationFailed
    ErrInvalidDSN
    ErrInvalidArtifact
    ErrAPIError
)

type CLIError struct {
    Code    ErrorCode
    Message string
    Cause   error
}

func (e *CLIError) Error() string {
    if e.Cause != nil {
        return fmt.Sprintf("%s: %v", e.Message, e.Cause)
    }
    return e.Message
}

func (e *CLIError) ExitCode() int {
    return int(e.Code)
}

func NewCLIError(code ErrorCode, message string, cause error) *CLIError {
    return &CLIError{
        Code:    code,
        Message: message,
        Cause:   cause,
    }
}
```

#### 6. Entry Point Refactor (`cmd/deepsource/main.go`)

```go
package main

import (
    "os"
    "time"

    "github.com/deepsourcelabs/cli/command"
    "github.com/deepsourcelabs/cli/internal/container"
    "github.com/deepsourcelabs/cli/internal/errors"
    v "github.com/deepsourcelabs/cli/version"
)

var (
    version   = "development"
    Date      = "YYYY-MM-DD"
    SentryDSN string
)

func main() {
    v.SetBuildInfo(version, Date, "", "")
    
    // Create dependency container
    deps := container.New()
    deps.Telemetry.Init(SentryDSN)
    defer deps.Telemetry.Flush(2 * time.Second)
    
    // Execute root command
    exitCode := command.Execute(deps)
    os.Exit(exitCode)
}
```

```go
// command/root.go
func Execute(deps *container.Container) int {
    cmd := NewCmdRoot(deps)
    
    if err := cmd.Execute(); err != nil {
        if cliErr, ok := err.(*errors.CLIError); ok {
            deps.Telemetry.CaptureException(cliErr)
            return cliErr.ExitCode()
        }
        deps.Telemetry.CaptureException(err)
        return 1
    }
    return 0
}

func NewCmdRoot(deps *container.Container) *cobra.Command {
    cmd := &cobra.Command{
        Use:           "deepsource <command> <subcommand> [flags]",
        Short:         "DeepSource CLI",
        SilenceErrors: true,
        SilenceUsage:  true,
    }
    
    // Add child commands with dependency injection
    cmd.AddCommand(version.NewCmdVersion(deps))
    cmd.AddCommand(config.NewCmdConfig(deps))
    cmd.AddCommand(auth.NewCmdAuth(deps))
    cmd.AddCommand(repo.NewCmdRepo(deps))
    cmd.AddCommand(issues.NewCmdIssues(deps))
    cmd.AddCommand(report.NewCmdReport(deps))
    
    return cmd
}
```

#### 7. Testing Strategy

```go
// command/report/report_test.go
func TestReportCommand_Success(t *testing.T) {
    // Setup
    deps := container.NewTest()
    testCoverage := []byte("<coverage>...</coverage>")
    deps.FileSystem.WriteFile("/work/coverage.xml", testCoverage, 0644)
    deps.Environment.Set("DEEPSOURCE_DSN", "http://token@localhost:8081")
    deps.GitClient.(*adapters.MockGitClient).SetHead("abc123def456", "")
    deps.HTTPClient.(*adapters.MockHTTPClient).SetResponse(200, `{"data":{"createArtifact":{"ok":true}}}`)
    
    // Execute
    cmd := NewCmdReport(deps)
    err := cmd.Execute()
    
    // Assert
    assert.NoError(t, err)
    output := deps.Output.(*adapters.BufferOutput).String()
    assert.Contains(t, output, "Artifact published successfully")
    assert.Contains(t, output, "Analyzer  test-coverage")
}

func TestReportCommand_InvalidDSN(t *testing.T) {
    deps := container.NewTest()
    deps.Environment.Set("DEEPSOURCE_DSN", "invalid-dsn")
    
    cmd := NewCmdReport(deps)
    err := cmd.Execute()
    
    assert.Error(t, err)
    var cliErr *errors.CLIError
    assert.True(t, errors.As(err, &cliErr))
    assert.Equal(t, errors.ErrInvalidDSN, cliErr.Code)
}

// internal/services/report/service_test.go
func TestService_Report_Success(t *testing.T) {
    // Pure unit test of business logic
    mockGit := adapters.NewMockGitClient()
    mockGit.SetHead("abc123", "")
    mockHTTP := adapters.NewMockHTTPClient()
    mockHTTP.SetResponse(200, `{"data":{"createArtifact":{"ok":true}}}`)
    mockFS := adapters.NewMemoryFileSystem()
    mockFS.WriteFile("/coverage.xml", []byte("<coverage>...</coverage>"), 0644)
    mockEnv := adapters.NewMockEnvironment()
    
    svc := report.NewService(report.ServiceDeps{
        GitClient:   mockGit,
        HTTPClient:  mockHTTP,
        FileSystem:  mockFS,
        Environment: mockEnv,
    })
    
    opts := report.ReportOptions{
        Analyzer:  "test-coverage",
        Key:       "python",
        ValueFile: "/coverage.xml",
        DSN:       "http://token@host",
    }
    
    result, err := svc.Report(context.Background(), opts)
    
    assert.NoError(t, err)
    assert.Equal(t, "test-coverage", result.Analyzer)
    assert.Equal(t, "python", result.Key)
}
```

## Migration Plan: Optimized Execution Order

**Total Duration**: 12 weeks
**Approach**: Iterative, value-driven, with continuous integration

### Phase 1: Foundation & Output System (Week 1-2)
**Goal**: Establish core infrastructure and improve user experience immediately
**Why First**: Creates foundation while delivering immediate UX improvements

1. Create `internal/interfaces/` package with all interface definitions
2. Create `internal/container/` package with dependency container
3. Create `internal/adapters/` with production implementations
4. Create `internal/errors/` with structured error types
5. **Implement dual output system (user-facing + diagnostic logging)**
6. **Add context.Context propagation support**
7. Add comprehensive documentation

**Deliverables**:
- All interfaces defined
- Container implementation  
- Output system with clean UX and debug logging
- Context support for cancellation
- No existing code broken

**Value**: Foundation + immediate UX improvements users will notice

---

### Phase 2: GraphQL SDK Refactor (Week 2-4)
**Goal**: Fix the most duplicated, fragile code first
**Why Second**: SDK is used by all commands; fixing it benefits everything downstream

#### Phase 2a: SDK Foundation (Week 2-3)
1. Create centralized GraphQL client interface in `deepsource/graphql.go`
2. Build GraphQL client wrapper with auth/header management
3. Create structured error types for GraphQL operations
4. Create mock implementations for testing
5. Refactor auth mutations (register, request PAT, refresh)

**Deliverables**:
- Single GraphQL client interface
- Wrapper with centralized auth logic
- Auth mutations refactored
- Mock client for tests

#### Phase 2b: SDK Queries (Week 3-4)
1. Refactor analyzers queries
2. Refactor transformers queries  
3. Refactor repository queries
4. Refactor issues queries
5. Remove all duplicate `IGQLClient` interfaces
6. Update Client facade to use new interface

**Deliverables**:
- All queries/mutations using new interface
- Zero interface duplication
- SDK test coverage >85%
- Clean, maintainable SDK

**Value**: Eliminates 6+ duplicate interfaces, centralizes auth, enables easy testing

---

### Phase 3: Config & Auth Services (Week 4-5)
**Goal**: Refactor foundational services that other commands depend on
**Why Third**: Config and auth are dependencies for most other commands

1. Refactor `config/` package to use interfaces (remove global state)
2. Create `internal/services/auth/` service
3. Refactor auth subcommands (login, logout, refresh, status) to use service
4. Add configuration file support (.deepsource-cli.yaml)
5. Implement secrets management (keychain integration)
6. Add unit tests for config and auth services

**Deliverables**:
- Thread-safe config management
- Auth service with 80%+ test coverage
- Auth commands refactored
- Config file support
- Secure credential storage

**Value**: Core infrastructure solid before tackling commands

---

### Phase 4: Report Command Service (Week 5-6)
**Goal**: Prove the pattern with the most complex command
**Why Fourth**: Report is the most complex; success here validates the entire approach

1. [x] Create `internal/services/report/` package
2. [x] Extract business logic from `command/report/report.go` (260+ lines → service)
3. [x] Refactor `command/report/report.go` to thin wrapper
4. [x] Write comprehensive unit tests for service
5. [x] Add progress indicators for upload/compression
6. [x] Enhance error messages with actionable guidance
7. [x] Add `--output` flag support (json/yaml/table)

**Deliverables**:
- Report service with 85%+ test coverage
- Report command refactored to <50 lines
- Progress feedback during uploads
- Better error messages
- Multiple output formats

**Value**: Most-used command dramatically improved; pattern validated

---

### Phase 5: Remaining Commands (Week 6-8)
**Goal**: Apply proven pattern to all remaining commands
**Why Fifth**: Now we know the pattern works; execute systematically

#### Phase 5a: Issues & Repo Commands (Week 6-7)
1. [x] Create `internal/services/issues/` service
2. [x] Create `internal/services/repo/` service  
3. [x] Refactor issues subcommands (list, list-file)
4. [x] Refactor repo subcommands (view, status)
5. [x] Add output format support to all commands
6. [x] Add unit tests for services

**Deliverables**:
- Issues service with 80%+ coverage
- Repo service with 80%+ coverage
- Commands refactored
- Consistent output formats

#### Phase 5b: Config & Version Commands (Week 7-8)
1. [x] Create `internal/services/config/` service (generate, validate)
2. [x] Refactor config subcommands
3. [x] Refactor version command
4. [x] Update integration tests to use container
5. [x] Remove caching layer from scope

**Deliverables**:
- All commands refactored
- Service layer complete
- Test coverage >75%

**Value**: Complete architectural transformation

---

### Phase 6: Advanced UX Features (Week 8-9)
**Goal**: Make CLI best-in-class for user experience
**Why Sixth**: Architecture is solid; focus on delighting users

1. Implement `--verbose` and `--quiet` modes
2. Improve shell completions (dynamic, with descriptions)
3. Add interactive mode for complex workflows
4. Add self-update mechanism (`deepsource update`)
5. Enhance progress indicators across all operations
6. Add command aliases and shortcuts

**Deliverables**:
- Flexible verbosity controls
- Enhanced shell completions (bash/zsh/fish)
- Interactive prompts for missing info
- Self-update capability
- Improved progress UX

**Value**: Professional, polished user experience

---

### Phase 7: DevOps & Operations (Week 9-10)
**Goal**: Production-ready observability and operations support
**Why Seventh**: Everything works; add operational excellence

1. Add anonymous telemetry (opt-out, privacy-respecting)
2. Implement request tracing (trace IDs, correlation)
3. Add benchmark suite with CI integration
4. Improve CI/CD templates (GitHub Actions, GitLab CI, CircleCI)
5. Add multi-repo operations support
6. Create performance monitoring dashboards

**Deliverables**:
- Usage analytics (anonymized)
- Distributed tracing support
- Performance benchmarks in CI
- CI/CD templates for major platforms
- Bulk operations for repos
- Performance baselines established

**Value**: Production observability and operational insights

---

### Phase 8: Documentation & Polish (Week 10-12)
**Goal**: Comprehensive documentation and final polish
**Why Last**: Code is stable; document everything properly

1. Generate man pages and markdown docs from code
2. Create architecture decision records (ADRs)
3. Write comprehensive developer guide
4. Create contribution guidelines
5. Add examples and tutorials
6. Remove all deprecated patterns
7. Final performance testing and optimization
8. Security audit and hardening

**Deliverables**:
- Auto-generated documentation
- ADRs for key decisions
- Developer guide
- Contribution guidelines  
- Example repository
- Clean codebase (no deprecated code)
- Performance benchmarks
- Security review completed

**Value**: Maintainable, well-documented, production-ready CLI

---

## Execution Principles

### Iterative Delivery
- Each phase delivers working, tested code
- No "big bang" integration
- Continuous deployment to staging
- Regular user feedback loops

### Risk Management
- Start with foundation (Phase 1)
- Fix most problematic code early (Phase 2: GraphQL SDK)
- Validate pattern with hardest command (Phase 4: Report)
- Apply pattern systematically (Phase 5)
- Polish when stable (Phases 6-8)

### Dependencies Flow
```
Phase 1 (Foundation)
    ↓
Phase 2 (GraphQL SDK) ← Used by all commands
    ↓
Phase 3 (Config/Auth) ← Dependencies for commands
    ↓
Phase 4 (Report) ← Validate pattern
    ↓
Phase 5 (Other Commands) ← Apply pattern
    ↓
Phase 6 (UX Features) ← Enhance experience
    ↓
Phase 7 (DevOps) ← Operational excellence
    ↓
Phase 8 (Documentation) ← Knowledge transfer
```

### Continuous Integration
- All tests pass after each phase
- No broken main branch
- Feature flags for new functionality
- Backward compatibility maintained
- Regular demo days to stakeholders

## Success Metrics

### Code Quality
- [ ] Test coverage >80% for services
- [ ] Test coverage >60% for commands
- [ ] All services have unit tests
- [ ] Integration tests <30s execution time
- [ ] No direct `os.Exit()` calls in business logic
- [ ] No package-level mutable state

### Architecture
- [ ] All external dependencies behind interfaces
- [ ] Dependency injection used throughout
- [ ] Clear separation of concerns
- [ ] No circular dependencies
- [ ] Services independently testable

### Developer Experience
- [ ] New commands can be added in <1 hour
- [ ] Unit tests run in <5 seconds
- [ ] Clear contribution guidelines
- [ ] Architecture documented
- [ ] Examples for common patterns

## Risks & Mitigations

### Risk: Breaking Changes During Migration
**Mitigation**: 
- Maintain backward compatibility during migration
- Extensive integration testing
- Feature flags for new implementations
- Gradual rollout

### Risk: Performance Regression
**Mitigation**:
- Benchmark before/after
- Profile critical paths
- Use efficient interface implementations
- Performance testing in CI

### Risk: Team Adoption
**Mitigation**:
- Comprehensive documentation
- Pair programming sessions
- Code review guidelines
- Example implementations

### Risk: Scope Creep
**Mitigation**:
- Strict phase boundaries
- Clear deliverables per phase
- Regular checkpoints
- MVP-first approach

## Additional Considerations

### Backward Compatibility
- Environment variables remain unchanged
- CLI flags remain unchanged
- Configuration file format unchanged
- API contracts preserved

### Performance
- Interface overhead minimal (Go compiler optimizes)
- Mock implementations fast for testing
- Dependency injection adds negligible runtime cost

### Maintenance
- Clear ownership boundaries
- Easier onboarding for new developers
- Reduced cognitive load
- Better error messages

## Appendix A: GraphQL SDK Refactoring Details

### Current GraphQL SDK Architecture

The `deepsource/` package implements a GraphQL SDK with:
- **Client**: Facade with high-level methods (auth, issues, analyzers, repo)
- **Queries/Mutations**: Individual request objects with `Do(ctx, client)` method
- **IGQLClient interface**: Defined separately in each query/mutation package

**File Structure**:
```
deepsource/
├── client.go                              # Main client facade
├── analyzers/
│   ├── analyzers.go
│   └── queries/
│       └── get_analyzers.go              # IGQLClient interface (duplicate)
├── auth/
│   ├── device.go
│   ├── token.go
│   └── mutations/
│       ├── register_device.go            # IGQLClient interface (duplicate)
│       ├── request_pat.go
│       └── refresh_pat.go
├── issues/
│   ├── issues_list.go
│   └── queries/
│       ├── list_issues.go                # IGQLClient interface (duplicate)
│       └── list_file_issues.go           # IGQLClient interface (duplicate)
├── repository/
│   ├── repository.go
│   └── queries/
│       └── repository_status.go          # IGQLClient interface (duplicate)
└── transformers/
    ├── transformers.go
    └── queries/
        └── get_transformers.go           # IGQLClient interface (duplicate)
```

### Problems Identified

#### 1. Interface Duplication
Each query/mutation package defines its own interface:

```go
// Defined in 6+ places:
type IGQLClient interface {
    GQL() *graphql.Client
    GetToken() string  // Not all have this
}
```

**Issues**:
- Violates DRY principle
- Inconsistent interfaces (some have `GetToken()`, some don't)
- Changing interface requires updating 6+ files
- No single source of truth

#### 2. Tight Coupling to GraphQL Library

```go
// client.go exposes implementation
func (c Client) GQL() *graphql.Client {
    return c.gql  // Exposes concrete type
}

// Queries directly use graphql.Client
req := graphql.NewRequest(query)
if err := client.GQL().Run(ctx, req, &respData); err != nil {
    return nil, err
}
```

**Issues**:
- Cannot swap GraphQL implementations
- Hard to mock in tests
- Leaky abstraction

#### 3. Inconsistent Authentication

```go
// Some queries add auth:
func (a AnalyzersRequest) Do(ctx context.Context, client IGQLClient) {
    req := graphql.NewRequest(query)
    tokenHeader := fmt.Sprintf("Bearer %s", client.GetToken())
    req.Header.Add("Authorization", tokenHeader)
    // ...
}

// Some don't (register_device.go):
func (r RegisterDeviceRequest) Do(ctx context.Context, client IGQLClient) {
    req := graphql.NewRequest(query)
    req.Header.Set("Cache-Control", "no-cache")
    // No auth header
}
```

**Issues**:
- Auth logic scattered across 10+ files
- Easy to forget auth header
- Inconsistent patterns

#### 4. No Error Context

```go
if err := client.GQL().Run(ctx, req, &respData); err != nil {
    return nil, err  // No context about which operation failed
}
```

**Issues**:
- Hard to debug failures
- No operation context in errors
- No structured error types

#### 5. Manual Response Mapping

```go
// Every query does this manually:
analyzersData := make([]analyzers.Analyzer, len(respData.Analyzers.Edges))
for index, edge := range respData.Analyzers.Edges {
    analyzersData[index].Name = edge.Node.Name
    analyzersData[index].Shortcode = edge.Node.Shortcode
    analyzersData[index].MetaSchema = edge.Node.MetaSchema
}
```

**Issues**:
- Repetitive boilerplate
- Error-prone manual mapping
- Hard to maintain as schema changes

### Proposed GraphQL SDK Architecture

#### 1. Centralized GraphQL Client Interface

```go
// deepsource/graphql.go
package deepsource

import "context"

// GraphQLClient defines the contract for GraphQL operations
type GraphQLClient interface {
    // Query executes a GraphQL query
    Query(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error
    
    // Mutate executes a GraphQL mutation
    Mutate(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error
    
    // SetAuthToken sets the authentication token for subsequent requests
    SetAuthToken(token string)
}

// APIClient is the high-level interface for the DeepSource API
type APIClient interface {
    // Auth operations
    RegisterDevice(ctx context.Context) (*auth.Device, error)
    Login(ctx context.Context, deviceCode, description string) (*auth.PAT, error)
    RefreshAuthCreds(ctx context.Context, token string) (*auth.PAT, error)
    
    // Analyzer operations
    GetSupportedAnalyzers(ctx context.Context) ([]analyzers.Analyzer, error)
    GetSupportedTransformers(ctx context.Context) ([]transformers.Transformer, error)
    
    // Repository operations
    GetRepoStatus(ctx context.Context, owner, repoName, provider string) (*repository.Meta, error)
    
    // Issues operations
    GetIssues(ctx context.Context, owner, repoName, provider string, limit int) ([]issues.Issue, error)
    GetIssuesForFile(ctx context.Context, owner, repoName, provider, filePath string, limit int) ([]issues.Issue, error)
}
```

#### 2. GraphQL Client Wrapper Implementation

```go
// deepsource/graphql_client.go
package deepsource

import (
    "context"
    "fmt"
    "github.com/deepsourcelabs/graphql"
)

type graphQLClientWrapper struct {
    client *graphql.Client
    token  string
}

// newGraphQLClient creates a new GraphQL client wrapper
func newGraphQLClient(url string, token string) GraphQLClient {
    return &graphQLClientWrapper{
        client: graphql.NewClient(url),
        token:  token,
    }
}

func (g *graphQLClientWrapper) Query(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
    req := graphql.NewRequest(query)
    
    // Add standard headers
    req.Header.Set("Cache-Control", "no-cache")
    
    // Add auth if token is present
    if g.token != "" {
        req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", g.token))
    }
    
    // Add variables
    for key, value := range vars {
        req.Var(key, value)
    }
    
    // Execute and wrap errors
    if err := g.client.Run(ctx, req, result); err != nil {
        return &GraphQLError{
            Operation: "query",
            Query:     truncateQuery(query),
            Cause:     err,
        }
    }
    
    return nil
}

func (g *graphQLClientWrapper) Mutate(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error {
    // Same as Query but provides semantic clarity
    req := graphql.NewRequest(mutation)
    
    req.Header.Set("Cache-Control", "no-cache")
    if g.token != "" {
        req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", g.token))
    }
    
    for key, value := range vars {
        req.Var(key, value)
    }
    
    if err := g.client.Run(ctx, req, result); err != nil {
        return &GraphQLError{
            Operation: "mutation",
            Query:     truncateQuery(mutation),
            Cause:     err,
        }
    }
    
    return nil
}

func (g *graphQLClientWrapper) SetAuthToken(token string) {
    g.token = token
}

func truncateQuery(query string) string {
    if len(query) > 100 {
        return query[:100] + "..."
    }
    return query
}
```

#### 3. Structured GraphQL Errors

```go
// deepsource/errors.go
package deepsource

import "fmt"

type GraphQLError struct {
    Operation string // "query" or "mutation"
    Query     string // Truncated query for debugging
    Cause     error  // Underlying error
}

func (e *GraphQLError) Error() string {
    return fmt.Sprintf("graphql %s failed: %v", e.Operation, e.Cause)
}

func (e *GraphQLError) Unwrap() error {
    return e.Cause
}

func (e *GraphQLError) Is(target error) bool {
    _, ok := target.(*GraphQLError)
    return ok
}
```

#### 4. Refactored Query Structure

```go
// deepsource/analyzers/queries/get_analyzers.go
package queries

import (
    "context"
    "fmt"
    "github.com/deepsourcelabs/cli/deepsource"
    "github.com/deepsourcelabs/cli/deepsource/analyzers"
)

const listAnalyzersQuery = `{
    analyzers {
        edges {
            node {
                name
                shortcode
                metaSchema
            }
        }
    }
}`

// AnalyzersRequest encapsulates the request for fetching analyzers
type AnalyzersRequest struct {
    client deepsource.GraphQLClient
}

// NewAnalyzersRequest creates a new analyzers request
func NewAnalyzersRequest(client deepsource.GraphQLClient) *AnalyzersRequest {
    return &AnalyzersRequest{client: client}
}

// Do executes the analyzers query
func (a *AnalyzersRequest) Do(ctx context.Context) ([]analyzers.Analyzer, error) {
    var respData AnalyzersResponse
    
    // Execute query - auth is handled by wrapper
    if err := a.client.Query(ctx, listAnalyzersQuery, nil, &respData); err != nil {
        return nil, fmt.Errorf("failed to fetch analyzers: %w", err)
    }
    
    // Map response
    return a.mapResponse(respData), nil
}

// mapResponse converts GraphQL response to domain model
func (a *AnalyzersRequest) mapResponse(resp AnalyzersResponse) []analyzers.Analyzer {
    result := make([]analyzers.Analyzer, 0, len(resp.Analyzers.Edges))
    for _, edge := range resp.Analyzers.Edges {
        result = append(result, analyzers.Analyzer{
            Name:       edge.Node.Name,
            Shortcode:  edge.Node.Shortcode,
            MetaSchema: edge.Node.MetaSchema,
        })
    }
    return result
}

// AnalyzersResponse is the GraphQL response structure
type AnalyzersResponse struct {
    Analyzers struct {
        Edges []struct {
            Node struct {
                Name       string `json:"name"`
                Shortcode  string `json:"shortcode"`
                MetaSchema string `json:"metaSchema"`
            } `json:"node"`
        } `json:"edges"`
    } `json:"analyzers"`
}
```

#### 5. Simplified Client Facade

```go
// deepsource/client.go
package deepsource

import (
    "context"
    "fmt"
    
    "github.com/deepsourcelabs/cli/deepsource/analyzers/queries" as analyzerQueries
    "github.com/deepsourcelabs/cli/deepsource/auth/mutations" as authMutations
    // ... other imports
)

type ClientOpts struct {
    Token    string
    HostName string
}

type Client struct {
    gql GraphQLClient
}

// New creates a new DeepSource API client
func New(opts ClientOpts) (*Client, error) {
    apiURL := getAPIClientURL(opts.HostName)
    gqlClient := newGraphQLClient(apiURL, opts.Token)
    
    return &Client{gql: gqlClient}, nil
}

// RegisterDevice registers a new device and returns device code
func (c *Client) RegisterDevice(ctx context.Context) (*auth.Device, error) {
    req := authMutations.NewRegisterDeviceRequest(c.gql)
    return req.Do(ctx)
}

// Login authenticates using device code and returns PAT
func (c *Client) Login(ctx context.Context, deviceCode, description string) (*auth.PAT, error) {
    req := authMutations.NewRequestPATRequest(c.gql, deviceCode, description)
    return req.Do(ctx)
}

// GetSupportedAnalyzers fetches the list of supported analyzers
func (c *Client) GetSupportedAnalyzers(ctx context.Context) ([]analyzers.Analyzer, error) {
    req := analyzerQueries.NewAnalyzersRequest(c.gql)
    return req.Do(ctx)
}

// No longer expose GQL() or GetToken() - encapsulation is maintained

func getAPIClientURL(hostName string) string {
    if hostName == "" || hostName == "deepsource.io" {
        return fmt.Sprintf("https://api.deepsource.io/graphql/")
    }
    return fmt.Sprintf("https://%s/api/graphql/", hostName)
}
```

#### 6. Mock Implementation for Testing

```go
// deepsource/mock_graphql_client.go
package deepsource

import "context"

// MockGraphQLClient is a mock implementation for testing
type MockGraphQLClient struct {
    QueryFunc  func(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error
    MutateFunc func(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error
    token      string
}

// NewMockGraphQLClient creates a new mock client
func NewMockGraphQLClient() *MockGraphQLClient {
    return &MockGraphQLClient{}
}

func (m *MockGraphQLClient) Query(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
    if m.QueryFunc != nil {
        return m.QueryFunc(ctx, query, vars, result)
    }
    return nil
}

func (m *MockGraphQLClient) Mutate(ctx context.Context, mutation string, vars map[string]interface{}, result interface{}) error {
    if m.MutateFunc != nil {
        return m.MutateFunc(ctx, mutation, vars, result)
    }
    return nil
}

func (m *MockGraphQLClient) SetAuthToken(token string) {
    m.token = token
}

// Helper methods for test setup
func (m *MockGraphQLClient) MockQueryResponse(response interface{}) {
    m.QueryFunc = func(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
        // Copy response into result
        // This requires reflection or type-specific helpers
        return nil
    }
}
```

#### 7. Enhanced Testing

```go
// deepsource/analyzers/queries/get_analyzers_test.go
package queries

import (
    "context"
    "testing"
    
    "github.com/deepsourcelabs/cli/deepsource"
    "github.com/deepsourcelabs/cli/deepsource/analyzers"
    "github.com/stretchr/testify/assert"
)

func TestAnalyzersRequest_Success(t *testing.T) {
    // Setup mock
    mockGQL := deepsource.NewMockGraphQLClient()
    mockGQL.QueryFunc = func(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
        // Populate result with test data
        resp := result.(*AnalyzersResponse)
        resp.Analyzers.Edges = []struct {
            Node struct {
                Name       string `json:"name"`
                Shortcode  string `json:"shortcode"`
                MetaSchema string `json:"metaSchema"`
            } `json:"node"`
        }{
            {
                Node: struct {
                    Name       string `json:"name"`
                    Shortcode  string `json:"shortcode"`
                    MetaSchema string `json:"metaSchema"`
                }{
                    Name:       "Python",
                    Shortcode:  "python",
                    MetaSchema: "{...}",
                },
            },
        }
        return nil
    }
    
    // Execute
    req := NewAnalyzersRequest(mockGQL)
    result, err := req.Do(context.Background())
    
    // Assert
    assert.NoError(t, err)
    assert.Len(t, result, 1)
    assert.Equal(t, "Python", result[0].Name)
    assert.Equal(t, "python", result[0].Shortcode)
}

func TestAnalyzersRequest_GraphQLError(t *testing.T) {
    mockGQL := deepsource.NewMockGraphQLClient()
    mockGQL.QueryFunc = func(ctx context.Context, query string, vars map[string]interface{}, result interface{}) error {
        return &deepsource.GraphQLError{
            Operation: "query",
            Query:     "analyzers query",
            Cause:     errors.New("network error"),
        }
    }
    
    req := NewAnalyzersRequest(mockGQL)
    result, err := req.Do(context.Background())
    
    assert.Error(t, err)
    assert.Nil(t, result)
    assert.Contains(t, err.Error(), "failed to fetch analyzers")
}
```

### Migration Path for GraphQL SDK

#### Phase 5a: Foundation (Days 1-3)
1. Create `deepsource/graphql.go` with `GraphQLClient` interface
2. Create `deepsource/graphql_client.go` with wrapper implementation
3. Create `deepsource/errors.go` with `GraphQLError` type
4. Create `deepsource/mock_graphql_client.go` for testing
5. Add tests for wrapper and mock

**Deliverables**: Core abstractions in place, fully tested

#### Phase 5b: Refactor Mutations (Days 4-6)
1. Refactor `auth/mutations/register_device.go`
2. Refactor `auth/mutations/request_pat.go`
3. Refactor `auth/mutations/refresh_pat.go`
4. Update tests for auth mutations
5. Remove old `IGQLClient` interfaces from auth

**Deliverables**: All mutations using new interface

#### Phase 5c: Refactor Queries (Days 7-10)
1. Refactor `analyzers/queries/get_analyzers.go`
2. Refactor `transformers/queries/get_transformers.go`
3. Refactor `repository/queries/repository_status.go`
4. Refactor `issues/queries/list_issues.go`
5. Refactor `issues/queries/list_file_issues.go`
6. Update tests for all queries
7. Remove all remaining `IGQLClient` interfaces

**Deliverables**: All queries using new interface

#### Phase 5d: Update Client Facade (Days 11-12)
1. Remove `GQL()` method from `Client`
2. Remove `GetToken()` method from `Client`
3. Update all client methods to use new request constructors
4. Update integration tests
5. Update SDK documentation

**Deliverables**: Clean client API, no exposed internals

#### Phase 5e: Cleanup & Polish (Days 13-14)
1. Remove any temporary compatibility code
2. Ensure all tests pass
3. Add SDK usage examples
4. Update README with new patterns
5. Performance testing

**Deliverables**: Production-ready GraphQL SDK

### Benefits of GraphQL SDK Refactor

✅ **Single Source of Truth**: One interface definition instead of 6+  
✅ **Consistent Auth**: Centralized authentication logic  
✅ **Better Errors**: Structured errors with operation context  
✅ **Easy Testing**: Simple, reusable mock implementation  
✅ **Loose Coupling**: Can swap GraphQL library without breaking code  
✅ **Clean API**: No exposed internals, proper encapsulation  
✅ **Maintainable**: Changes to GraphQL handling in one place  
✅ **Type Safe**: All queries use centralized interface

### Success Metrics for GraphQL SDK

- [ ] Single `GraphQLClient` interface used throughout
- [ ] Zero `IGQLClient` interface definitions
- [ ] All auth logic centralized in wrapper
- [ ] All errors wrapped with operation context
- [ ] Test coverage >85% for SDK
- [ ] All queries/mutations have unit tests
- [ ] No direct `graphql.Client` usage outside wrapper
- [ ] Mock client supports all test scenarios

## Conclusion

This refactoring will transform the DeepSource CLI into a maintainable, extensible, and thoroughly tested codebase. The phased approach ensures minimal disruption while delivering incremental value. The resulting architecture will enable rapid feature development and confident refactoring.

### Key Benefits
✅ **Extensibility**: Easy to add new commands and features  
✅ **Testability**: Fast unit tests without external dependencies  
✅ **Maintainability**: Clear separation of concerns  
✅ **Reliability**: Better error handling and test coverage  
✅ **Performance**: Faster test suite enables rapid iteration  
✅ **Developer Experience**: Clear patterns and comprehensive documentation
