<p align="center">
  <img src="https://deepsource.io/images/logo-wordmark-dark.svg" />
</p>

<p align="center">
  <a href="https://deepsource.io/docs">Documentation</a> |
  <a href="https://deepsource.io/signup">Get Started</a> |
  <a href="https://discuss.deepsource.io/">Discuss</a>
</p>

<p align="center">
  DeepSource helps you ship good quality code.
</p>

</p>

---

# CLI

Command line interface to DeepSource

![GitHub release (latest by date)](https://img.shields.io/github/v/release/deepsourcelabs/cli)
[![DeepSource](https://deepsource.io/gh/deepsourcelabs/cli.svg/?label=active+issues&show_trend=true)](https://deepsource.io/gh/deepsourcelabs/cli/?ref=repository-badge)
[![Gitopia](https://img.shields.io/endpoint?style=&url=https://gitopia.org/mirror-badge.json)](https://gitopia.org/#/WU8MwK_wNu7had5xKwuD2dilKn9gzCFH6carv-QmIKs/deepsource-cli)

## Installation

### macOS

DeepSource CLI is available on macOS via [Homebrew](https://brew.sh/):

```sh
brew install deepsourcelabs/cli/deepsource
```
### Binary Installation

```sh
curl https://deepsource.io/cli | sh
```
This script will detect the operating system and architecture and puts deepsource binary in ./bin/deepsource.

### Usage

```
DeepSource Command Line Interface v0.x.x

Usage:
    deepsource <command> [<arguments>]

Available commands are:
    report      Report an artifact to an analyzer
    config      Generate and Validate DeepSource config
    help        Help about any command
    issues      Show the list of issues in a file in a repository
    repo        Operations related to the project repository
    report      Report artifacts to DeepSource
    version     Get the version of the DeepSource CLI

Help:
    Use 'deepsource <command> --help' for more information about the command.
```

### Documentation

[https://deepsource.io/docs/config/cli](https://deepsource.io/docs/config/cli.html)

### Support

[support@deepsource.io](mailto:support@deepsource.io)
