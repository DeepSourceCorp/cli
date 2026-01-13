# Architecture Refactor Phase 1 Notes

This document summarizes the Phase 1 foundation work for the DeepSource CLI refactor.

## Interfaces
- `internal/interfaces/` defines contracts for filesystem, environment, git, HTTP, output, and telemetry.
- These interfaces enable dependency injection and isolate external dependencies.

## Container
- `internal/container` provides production (`New`) and test (`NewTest`) containers.
- The container wires adapters to the interface contracts and holds shared config state.

## Dual Output System
- `internal/adapters/dual_output.go` writes user output to stdout.
- Diagnostic output is written to stderr and optionally to a debug log file.
- Set `DEEPSOURCE_CLI_DEBUG=1` to enable logging at `~/.deepsource/cli-debug.log`.
- Set `DEEPSOURCE_CLI_DEBUG=/path/to/log` to write diagnostics to a custom file.

## Context Propagation
- `command.ExecuteContext(ctx)` sets the context on the root command.
- Existing `command.Execute()` now calls `ExecuteContext(context.Background())`.

## Next Steps
- Add services and adapters as commands are refactored.
- Move command logic into service packages and inject dependencies via the container.
