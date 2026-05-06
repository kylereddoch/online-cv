const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const { FEATURED_REPOSITORIES, repoUrl } = require("../lib/featured-repos");

const sourcePath = path.join(process.cwd(), "_data", "data.yml");
const cacheDir = path.join(process.cwd(), ".cache");
const cacheMaxAgeMs = 1000 * 60 * 60 * 12;

function readUsername() {
  const raw = yaml.load(fs.readFileSync(sourcePath, "utf8"));
  return raw.sidebar?.github || "";
}

function cachePathFor(username) {
  return path.join(cacheDir, `github-featured-repositories-${username}.json`);
}

function readCache(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  const isFresh = Date.now() - stats.mtimeMs < cacheMaxAgeMs;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return {
    data,
    isFresh,
  };
}

function writeCache(filePath, data) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function fetchRepositories(username) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "online-cv-build",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status}`);
  }

  const repositories = await response.json();
  const byName = new Map(
    repositories
      .filter((repo) => !repo.fork && !repo.archived && !repo.private)
      .map((repo) => [repo.name, repo])
  );

  return FEATURED_REPOSITORIES.map((config) => {
    const repo = byName.get(config.repoName);

    return {
      title: config.title,
      name: repo?.name || config.repoName,
      html_url: repo?.html_url || repoUrl(config.repoName),
      description: repo?.description || config.description,
      stargazers_count: repo?.stargazers_count || 0,
      forks_count: repo?.forks_count || 0,
    };
  });
}

module.exports = async () => {
  const username = readUsername();
  if (!username) {
    return [];
  }

  const filePath = cachePathFor(username);
  const cached = readCache(filePath);

  if (cached?.isFresh) {
    return cached.data;
  }

  try {
    const repositories = await fetchRepositories(username);
    writeCache(filePath, repositories);
    return repositories;
  } catch (error) {
    if (cached?.data) {
      return cached.data;
    }

    console.warn(`Unable to fetch GitHub repositories for ${username}: ${error.message}`);
    return [];
  }
};
