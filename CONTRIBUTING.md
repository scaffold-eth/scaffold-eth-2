# Scaffold-ETH 2 Contributing Guide

Welcome to the Scaffold-ETH 2 contributing guide! Thank you for investing your time in contributing to our project. This guide aims to provide a comprehensive overview of the contribution workflow, ensuring an effective and efficient process for everyone involved.

### About the Project
Scaffold-ETH 2 is a minimal and forkable repository providing builders with a starter kit to develop decentralized applications (dApps) on Ethereum. For an overview of the project, please read the [README](README.md) to get an overview of the project.

### Our Vision
Our goal is to provide the primary building blocks for creating dApps. While the repository can be forked to include additional integrations and features, we aim to keep the master branch simple and minimalistic.

### Project Status
The project is under active development. You can view open issues, follow the development process, and contribute to the project.

### Getting Started
You can contribute to this repository in several ways:
- Solve open issues
- Report bugs or request new features
- Improve the documentation

### General Contribution Guidelines

**1. Understand Our Project:** Scaffold-ETH 2 is a minimal and forkable repository providing builders with a starter kit to develop decentralized applications (dApps) on Ethereum.

**2. Read Our Documentation:** https://docs.scaffoldeth.io/

**3. Search Existing Issues and  Pull-Requests (PRs):** Before creating a new issue or Pull-Request (PR), check if a similar one already exists.

**4. Communication:**
Participate in the Our communication channel - [Telegram](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA)

**5. Focused Contributions:** Contributions should either fix/add functionality or address style issues, but not both.

**6. Provide Context:** When reporting an error, explain what you were trying to do and how to reproduce the error.

**7. Consistent Formatting:** Use the same formatting as in the repository. Configure your IDE using the included prettier/linting config files.

**8. Update Documentation:** If applicable, edit the README.md file to reflect any changes you make.

**9. Respond to Feedback:** Engage with maintainers and reviewers, making necessary changes and improvements based on their feedback.

**10. Be Patient:** Understand that maintainers are often busy and it may take time for your PR to be reviewed and merged.

**10. Monitor Your Contribution:** Keep an eye on your PR and address any further comments or requested changes.
Stay Engaged: Continue to contribute, help others, and be an active member of the community. By following these guidelines, you can make meaningful contributions to Our open-source project and become a valuable member of Our open-source community

### Issues
Issues are used to report problems, request new features, or discuss potential changes before creating a Pull-Request PR.

### Solving an Issue
1. **Find an Issue:** Browse existing issues to find one that interests you. [existing issues](https://github.com/scaffold-eth/scaffold-eth-2/issues)

2. **Assign the Issue:** If you find an issue to work on, assign it to yourself.

3. **Open a PR:** Once you've addressed the issue, open a PR with your fix.

### Creating a New Issue
If a related issue doesn't exist, you can open a new one. Here are some tips for creating a new issue:

1. Provide as much context as possible.

2. Include steps to reproduce the issue or the reason for the feature request.

3. Add screenshots, videos, etc., to clarify your points.

### Pull Requests
We follow the "fork-and-pull" Git workflow: We follow the ["fork-and-pull" Git workflow](https://github.com/susam/gitpr)

1. **Fork the Repo:** Create a fork of the repository.

Example: User A visits our main-repo repository on GitHub, https://github.com/argentlabs/Starknet-Scaffold and clicks the Fork button, creating a personal copy of the repository under their own GitHub account (e.g., userA/scaffold-eth-2).

2. **Clone the Project:** Clone your fork locally.

````code
git clone https://github.com/userA/scaffold-eth-2

cd scaffold-eth-2
````

3. **Create a Branch:** Create a new branch with a descriptive name. User A creates a new branch for their feature or bug fix. This ensures the main branch (typically main or master) remains clean and unaffected by ongoing work:

```
git checkout -b new-feature
```

4. **Commit Changes:** Commit your changes to the new branch. User A makes the necessary changes to the code, adds the modified files, and commits the changes:

```
git add .

git commit -m "Add new feature to improve performance"
```

5. **Push Changes:** Push your changes to your fork. User A pushes the changes in the new-feature branch to their forked repository on GitHub.

```
git push origin new-feature

```

6. **Open a PR:** Open a PR in the main repository and tag a maintainer for review.

### Tips for a High-Quality Pull Request
Creating a high-quality pull request (PR) in open-source projects increases the likelihood of your contributions being accepted and appreciated. Here are some tips for crafting a high-quality pull request:

**1. Understand the our Contribution Guidelines:**
* Read CONTRIBUTING.md: Follow the project-specific instructions for contributing.

* Adhere to Coding Standards: Ensure your code complies with the project's coding style and standards.

**2. Clear and Descriptive Title:**
* Concise Summary: Use a clear, concise title that summarizes the purpose of the PR.

**3. Detailed Description:**
* What and Why: Explain what changes you made and why they are necessary.

* Issue References: Reference relevant issues by number (e.g., "Fixes #123").

* Impact: Describe the impact of your changes on the project.

**4. Small and Focused Changes:**
* Single Purpose: Each PR should address a single issue or feature. Avoid bundling multiple changes in one PR.

* Incremental Changes: If you have multiple related changes, consider submitting them in smaller, incremental PRs.

**5. Documentation:**
* Update Documentation: Ensure any relevant documentation is updated to reflect your changes.

* Code Comments: Add comments in your code where necessary to explain complex logic.

**6. Testing:**
* Include Tests: Add or update tests to cover your changes.

* Pass All Tests: Ensure all existing and new tests pass. Run the test suite locally before submitting the PR.

**7. Commit Quality:**
* Atomic Commits: Make small, logical commits. Each commit should be a single, self-contained change.

* Meaningful Commit Messages: Write clear, descriptive commit messages that explain the intent of each change.

**8. Code Review Readiness:**
* Clean Up: Remove any unnecessary code, comments, or debug statements.

* Consistent Formatting: Follow the project's formatting guidelines and use linting tools if available.

**9. Engage with the Community:**
* Seek Feedback Early: If unsure about your approach, seek feedback early by discussing your plan in an issue or community forum before submitting the PR.

* Respond Promptly: Be responsive to feedback and make requested changes promptly.

**10. Polish Your PR:**
* Proofread: Check for typos and grammatical errors in your description and comments.

* Visual Enhancements: If your PR affects the UI, you can include before and after screenshots or a short video.

By following these tips, you can create a high-quality pull request that is more likely to be accepted and appreciated by the maintainers and the community.

### After Submitting Your PR
1. **Review Process:** We may ask questions, request additional information, or suggest changes. These requests aim to clarify the PR for everyone and ensure a smooth interaction process.

2. **Resolve Conversations:** As you update your PR and apply changes, mark each conversation as resolved.

3. **Merging:** Once the PR is approved, we will "squash-and-merge" to keep the git commit history clean.

Thank you for your contributions to Scaffold-ETH 2! We appreciate your efforts in helping us build and improve this project.
