const GITHUB_USERNAME = "kylereddoch";

function repoUrl(repoName) {
  return `https://github.com/${GITHUB_USERNAME}/${repoName}`;
}

const FEATURED_REPOSITORIES = [
  {
    repoName: "retro-garden-eleventy-theme",
    title: "Retro Garden",
    description:
      "Retro Garden is an open source Eleventy theme for personal sites that want IndieWeb publishing habits and early-web personality without giving up modern tooling.",
    tags: ["Eleventy", "IndieWeb", "Theme", "WebC"],
    recentProject: true,
  },
  {
    repoName: "brewventy",
    title: "Brewventy",
    description:
      "A coffee-themed, fully customizable Eleventy starter project combining elegant design with powerful functionality for blogs, docs, and landing pages.",
    tags: ["Eleventy", "Starter", "Blog", "Design"],
    recentProject: true,
  },
  {
    repoName: "eleventy-plugin-mastodon-share",
    title: "Eleventy Plugin Mastodon Share",
    description:
      "A drop-in Eleventy plugin that adds a Share on Mastodon button and a small instance picker with an optional remember my instance feature.",
    tags: ["Eleventy", "Mastodon", "Plugin", "Nunjucks"],
    recentProject: true,
  },
  {
    repoName: "catpuccin-mocha-ui-mastodon",
    title: "Catppuccin Mocha UI for Mastodon",
    description:
      "A Catppuccin-powered complete UI theme for Mastodon with configurable flavors, accent colors, fixed CSS exports, and a larger left-side composer.",
    tags: ["Mastodon", "Catppuccin", "Theme", "CSS"],
    recentProject: true,
  },
  {
    repoName: "scriptable",
    title: "Scriptable",
    description:
      "A repository for Scriptable iOS app JavaScript files that provide small, useful snippets of information.",
    tags: ["JavaScript", "iOS", "Automation"],
    recentProject: false,
  },
  {
    repoName: "PasswordGenerator",
    title: "Password Generator",
    description: "An unlimited password generator created in Python.",
    tags: ["Python", "CLI", "Utility"],
    recentProject: false,
  },
];

const FEATURED_PROJECTS = [
  FEATURED_REPOSITORIES.find((repo) => repo.repoName === "catpuccin-mocha-ui-mastodon"),
  FEATURED_REPOSITORIES.find((repo) => repo.repoName === "retro-garden-eleventy-theme"),
  FEATURED_REPOSITORIES.find((repo) => repo.repoName === "brewventy"),
  FEATURED_REPOSITORIES.find((repo) => repo.repoName === "eleventy-plugin-mastodon-share"),
].filter(Boolean);

module.exports = {
  GITHUB_USERNAME,
  FEATURED_REPOSITORIES,
  FEATURED_PROJECTS,
  repoUrl,
};
