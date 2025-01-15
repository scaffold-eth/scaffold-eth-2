# Welcome to create-eth Contributing Guide

Thank you for investing your time in contributing to create-eth!

This guide aims to provide an overview of the contribution workflow to help us make the contribution process effective for everyone involved.

## About the Project

create-eth is a CLI tool to create a minimal repo to build decentralized applications on Ethereum, providing builders with a starter kit based on Scaffold-ETH 2.

Read the [README](README.md) to get an overview of the project.

### Vision

The goal of create-eth is to be a "toolkit creator", using Scaffold-ETH 2 as a base to provide the primary building blocks for a decentralized application. In the future we plan to add "curated" packages to it, and open the possibility to import 3rd party packages (that follow our standard).

The repo can be forked to include integrations and more features, but we want to keep the `main` branch simple and minimal.

### Project Status

The project is under active development.

You can view the open Issues, follow the development process, and contribute to the project.

### Rules

1. All code contributions require an Issue to be created and agreed upon by core contributors before submitting a Pull Request. This ensures proper discussion, alignment, and consensus on the proposed changes.
2. Contributors must be humans, not bots.
3. First-time contributions must not contain only spelling or grammatical fixes.

## Getting started

You can contribute to this repo in many ways:

- Solve open issues
- Report bugs or feature requests
- Improve the documentation

Contributions are made via Issues and Pull Requests (PRs). A few general guidelines for contributions:

- Search for existing Issues and PRs before creating your own.
- Contributions should only fix/add the functionality in the issue OR address style issues, not both.
- If you're running into an error, please give context. Explain what you're trying to do and how to reproduce the error.
- Please use the same formatting in the code repository. You can configure your IDE to do it by using the prettier / linting config files included in each package.
- If applicable, please edit the README.md file to reflect the changes.
- If you're adding a new template file or modifying arguments of existing templates, please create a corresponding PR to the [Example Extension branch](https://github.com/scaffold-eth/create-eth-extensions/tree/example) of the [create-eth-extensions](https://github.com/scaffold-eth/create-eth-extensions) repository

### Issues

Issues should be used to report problems, request a new feature, or discuss potential changes before a PR is created.

#### Solve an issue

Scan through our [existing issues](https://github.com/scaffold-eth/create-eth/issues) to find one that interests you.

If a contributor is working on the issue, they will be assigned to the individual. If you find an issue to work on, you are welcome to assign it to yourself and open a PR with a fix for it.

#### Create a new issue

If a related issue doesn't exist, you can open a new issue.

Some tips to follow when you are creating an issue:

- Provide as much context as possible. Over-communicate to give the most details to the reader.
- Include the steps to reproduce the issue or the reason for adding the feature.
- Screenshots, videos, etc., are highly appreciated.

### Pull Requests

#### Pull Request Process

We follow the ["fork-and-pull" Git workflow](https://github.com/susam/gitpr)

1. Fork the repo
2. Clone the project
3. Create a new branch (based in create-eth main branch) with a descriptive name
4. Commit your changes to the new branch
5. Add [changeset](#changeset) if applicable
6. Push changes to your fork
7. Open a PR in our repository and tag one of the maintainers to review your PR

> ⚠️ **Important.** Please make sure to choose **create-eth** repo when you create your branch and compare your changes.
>
> This repo is a fork of Scaffold-ETH 2, and it may appear as default repo when creating a branch or PR.

Here are some tips for a high-quality pull request:

- Create a title for the PR that accurately defines the work done.
- Structure the description neatly to make it easy to consume by the readers. For example, you can include bullet points and screenshots instead of having one large paragraph.
- Add the link to the issue if applicable.
- Have a good commit message that summarises the work done.

Once you submit your PR:

- We may ask questions, request additional information, or ask for changes to be made before a PR can be merged. Please note that these are to make the PR clear for everyone involved and aim to create a frictionless interaction process.
- As you update your PR and apply changes, mark each conversation resolved.

Once the PR is approved, we'll "squash-and-merge" to keep the git commit history clean.

### Changeset

When adding new features or fixing bugs, we'll need to bump the package versions. We use [Changesets](https://github.com/changesets/changesets) to do this.

> Note: Only changes to the codebase that affect the public API or existing behavior (e.g. bugs) need changesets.

Each changeset defines the version should be a major/minor/patch release, as well as providing release notes that will be added to the changelog upon release.

To create a new changeset, run `yarn changeset add`. This will run the Changesets CLI, prompting you for details about the change. You’ll be able to edit the file after it’s created — don’t worry about getting everything perfect up front.

Since we’re currently in beta, all changes should be marked as a minor/patch release to keep us within the `v0.x` range.

Even though you can technically use any markdown formatting you like, headings should be avoided since each changeset will ultimately be nested within a bullet list. Instead, bold text should be used as section headings.

If your PR is making changes to an area that already has a changeset (e.g. there’s an existing changeset covering theme API changes but you’re making further changes to the same API), you should update the existing changeset in your PR rather than creating a new one.

## Developer Guide

You can find a detailed guide on [`contributors/DEVELOPER-GUIDE.md`](contributors/DEVELOPER-GUIDE.md)
