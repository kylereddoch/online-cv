const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const sourcePath = path.join(process.cwd(), "_data", "data.yml");
const raw = yaml.load(fs.readFileSync(sourcePath, "utf8"));
const name = raw.sidebar?.name || "Kyle Reddoch";
const title = raw.sidebar?.tagline || "Online CV";
const summary = String(raw["career-profile"]?.summary || "").replace(/\s+/g, " ").trim();

module.exports = {
  title: `${name} | Online CV`,
  shortTitle: `${name} | ${title}`,
  description: summary,
  url: "https://cv.kylereddoch.me",
  lang: "en",
  locale: "en_US",
  analyticsHost: "cv.kylereddoch.me",
  themeColorDark: "#1e1e2e",
  themeColorLight: "#eff1f5",
  accentColor: "#89b4fa",
  tinylyticsScript: "https://tinylytics.app/embed/2J2N6oVtqriyq6urF-ym/min.js",
};
