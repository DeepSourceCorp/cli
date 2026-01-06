<p align="center">
  <img src="https://cms.deepsource.io/logo-wordmark-dark.svg" />
</p>

<p align="center">
  <a href="https://docs.deepsource.com">Docs</a> |
  <a href="https://deepsource.com">Get Started</a> |
  <a href="https://discuss.deepsource.com/">Discuss</a>
</p>

<p align="center">
  The Code Health Platform
</p>

</p>

---

# CLI

Command line interface to DeepSource

## Installation

### macOS

DeepSource CLI is available on macOS via [Homebrew](https://brew.sh/):

```sh
brew install deepsourcelabs/cli/deepsource
```
### Binary Installation

```sh
curl https://deepsource.com/cli | sh
```
This script will detect the operating system and architecture and puts deepsource binary in `./bin/deepsource`.

## Configuring DSN

In order to report test-coverage to DeepSource using the `report` command, an environment variable named as `DEEPSOURCE_DSN` has to
be set. It's value will be available under 'Settings' tab of the repository page.

## Authentication

Log in to DeepSource using the CLI:

```sh
# Browser-based login (interactive)
deepsource auth login

# Token-based login (for CI/CD or non-interactive environments)
deepsource auth login --with-token

# For DeepSource Enterprise instances
deepsource auth login --hostname HOSTNAME
```

For GitHub Actions, the `report` command supports [OIDC authentication](https://docs.deepsource.com/docs/guides/setup-test-coverage#with-github-actions-ci-using-oidc):

```sh
deepsource report --analyzer test-coverage --key go --value-file ./cover.out --use-oidc
```

## Usage

The CLI provides access to a wide range of commands. Here is a list of the
commands along with their brief description.

```
Usage:
    deepsource <command> [<arguments>]

Available commands are:
    auth        Authenticate with DeepSource
      login       Log in to DeepSource
      logout      Logout of your account
      refresh     Refresh authentication credentials
      status      View authentication status

    config      Generate and Validate DeepSource config
      generate    Generate .deepsource.toml config
      validate    Validate existing config

    issues      Show the list of issues in a repository
      list        List issues (supports --json, --csv, --sarif export)

    repo        Operations related to the repository
      status      View activation status
      view        Open DeepSource dashboard in browser

    report      Report artifacts to DeepSource
    version     Get the version of the DeepSource CLI

Help:
    Use 'deepsource <command> --help/-h' for more information about the command.
```

## Documentation

For complete documentation, refer to the [CLI Documentation](https://docs.deepsource.com/docs/cli)

## Feedback/Support

Want to share any feedback or need any help regarding the CLI? Feel free to
open a discussion in the [community forum](https://discuss.deepsource.com)

## License

Licensed under the [BSD 2-Clause "Simplified" License](https://github.com/deepsourcelabs/cli/blob/master/LICENSE).
