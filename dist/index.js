const core = require("@actions/core");
const github = require("@actions/github");
const request = require("request-promise");

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);
    const { context } = github;

    // -------------------------------
    // CHECK: Comment must start exactly with /joke
    // -------------------------------
    const commentBody = context.payload.comment.body.trim();

    if (!commentBody.startsWith("/joke")) {
      core.info("Comment does not start with /joke — exiting action.");
      return; // Stop the action early
    }

    core.info("Valid trigger: Comment starts with /joke");

    // Extract repo & issue numbers
    const issueNumber = context.payload.issue.number;
    const repoOwner = context.repo.owner;
    const repoName = context.repo.repo;

    // -------------------------------
    // Fetch a random Dad Joke
    // -------------------------------
    const joke = await request({
      uri: "https://icanhazdadjoke.com/",
      headers: { Accept: "text/plain" }
    });

    // -------------------------------
    // Post the joke as a comment
    // -------------------------------
    await octokit.rest.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      issue_number: issueNumber,
      body: `🤣 **Here's your joke!**\n\n${joke}`
    });

    core.info("Joke posted successfully.");

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();