const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const { FEATURED_PROJECTS, repoUrl } = require("../lib/featured-repos");

const sourcePath = path.join(process.cwd(), "_data", "data.yml");

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function withProtocol(value) {
  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function stripProtocol(value = "") {
  return String(value).replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function cleanPhone(value = "") {
  return String(value).replace(/[^\d+]/g, "");
}

function flattenMarkdownHeadings(value = "") {
  return String(value).replace(/^\s{0,3}#{1,6}\s+(.+)$/gm, "**$1**");
}

function splitLines(value = "") {
  return String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseDateLabel(value) {
  if (!value) {
    return null;
  }

  const label = String(value).trim();
  if (!label) {
    return null;
  }

  if (/^present$/i.test(label)) {
    return {
      label: "Present",
      iso: null,
      isCurrent: true,
      sortValue: Number.MAX_SAFE_INTEGER,
    };
  }

  if (/^\d{4}$/.test(label)) {
    const year = Number.parseInt(label, 10);

    return {
      label,
      iso: `${label}-01-01`,
      isCurrent: false,
      sortValue: Date.UTC(year, 0, 1),
    };
  }

  const monthMatch = label.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthMatch) {
    const monthIndex = MONTHS.indexOf(monthMatch[1].toLowerCase());
    const year = Number.parseInt(monthMatch[2], 10);

    if (monthIndex !== -1) {
      return {
        label,
        iso: `${year.toString().padStart(4, "0")}-${String(monthIndex + 1).padStart(2, "0")}-01`,
        isCurrent: false,
        sortValue: Date.UTC(year, monthIndex, 1),
      };
    }
  }

  return {
    label,
    iso: null,
    isCurrent: false,
    sortValue: 0,
  };
}

function parsePeriod(value = "") {
  const [startRaw = "", endRaw = ""] = String(value).split(/\s*-\s*/);
  const start = parseDateLabel(startRaw);
  const end = parseDateLabel(endRaw);

  return {
    raw: String(value).trim(),
    start,
    end,
    isCurrent: Boolean(end && end.isCurrent),
    sortValue: start ? start.sortValue : 0,
  };
}

function compareByPeriodDesc(left, right) {
  if (left.period.isCurrent !== right.period.isCurrent) {
    return left.period.isCurrent ? -1 : 1;
  }

  if (left.period.sortValue !== right.period.sortValue) {
    return right.period.sortValue - left.period.sortValue;
  }

  return (right.title || "").localeCompare(left.title || "");
}

function socialHandleFromUrl(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) {
    return "";
  }

  try {
    const pathname = new URL(trimmed).pathname.split("/").filter(Boolean);
    return pathname[pathname.length - 1] || trimmed;
  } catch {
    return trimmed;
  }
}

function resolveSkillIcon(name = "") {
  const normalized = String(name).toLowerCase();

  if (
    normalized.includes("security") ||
    normalized.includes("cyber") ||
    normalized.includes("risk")
  ) {
    return "shield";
  }

  if (normalized.includes("support") || normalized.includes("helpdesk")) {
    return "headset";
  }

  if (normalized.includes("network")) {
    return "network";
  }

  if (normalized.includes("document")) {
    return "folder";
  }

  if (normalized.includes("automation") || normalized.includes("bash") || normalized.includes("python")) {
    return "terminal";
  }

  if (normalized.includes("java")) {
    return "coffee";
  }

  if (normalized.includes("php")) {
    return "server";
  }

  if (normalized.includes(".net") || normalized.includes("c#")) {
    return "chip";
  }

  if (normalized.includes("javascript") || normalized.includes("jquery")) {
    return "code";
  }

  if (normalized.includes("sql")) {
    return "database";
  }

  if (normalized.includes("git")) {
    return "branch";
  }

  if (normalized.includes("customer") || normalized.includes("team")) {
    return "people";
  }

  return "spark";
}

function parseAbilityGroups(value = "") {
  return splitLines(value).map((line) => {
    const withoutBullet = line.replace(/^-+\s*/, "");
    const separatorIndex = withoutBullet.indexOf(":");
    const title =
      separatorIndex === -1 ? withoutBullet.trim() : withoutBullet.slice(0, separatorIndex).trim();
    const body =
      separatorIndex === -1 ? "" : withoutBullet.slice(separatorIndex + 1).trim();
    const items = body
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      title,
      body,
      items,
      icon: resolveSkillIcon(title),
    };
  });
}

function splitProjectTags(value = "") {
  return String(value)
    .split(/\s*(?:,|\/|\|)\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function projectTypeLabel(value = "") {
  switch (String(value).toLowerCase()) {
    case "github":
      return "Open Source";
    case "site":
      return "Website";
    default:
      return "Project";
  }
}

function toSkill(skill = {}) {
  return {
    name: skill.name || "",
    level: skill.level || "",
    icon: resolveSkillIcon(skill.name || ""),
  };
}

function toExperience(entry = {}) {
  return {
    title: entry.role || "",
    organization: entry.company || "",
    summary: flattenMarkdownHeadings(entry.details || ""),
    time: entry.time || "",
    period: parsePeriod(entry.time || ""),
  };
}

function toEducation(entry = {}) {
  return {
    title: entry.degree || "",
    organization: entry.university || "",
    summary: flattenMarkdownHeadings(entry.details || ""),
    time: entry.time || "",
    period: parsePeriod(entry.time || ""),
  };
}

function toCertificationEntry(item = {}) {
  return {
    title: item.title || item.certification || "",
    organization: item.issuer || item.org || "",
    summary: item.note || "",
    url: item.url || item.link || "",
    time: item.year || item.time || "",
    period: {
      raw: item.year || item.time || "",
      start: item.year || item.time ? { label: item.year || item.time, iso: null } : null,
      end: null,
      isCurrent: false,
      sortValue: 0,
    },
  };
}

function buildCertifications(raw = {}, educationEntries = []) {
  const configured = Array.isArray(raw.certifications) ? raw.certifications : [];
  if (configured.length) {
    return configured.map((item) => ({
      title: item.title || item.certification || "",
      issuer: item.issuer || item.org || "",
      year: item.year || item.time || "",
      url: item.url || item.link || "",
      note: item.note || "",
    }));
  }

  const derived = [];

  for (const item of raw.education || []) {
    const details = String(item.details || "");
    const match = details.match(/\(\s*With an?\s+(.+?)\s*\)/i);
    if (!match) {
      continue;
    }

    const [, certification] = match;
    const education = educationEntries.find((entry) => entry.title === (item.degree || ""));
    const endLabel = education?.period?.end?.label || "";

    derived.push({
      title: certification.trim(),
      issuer: item.university || "",
      year: endLabel ? `Expected ${endLabel}` : "",
      url: "",
      note: "Included as part of degree coursework.",
    });
  }

  return derived;
}

module.exports = () => {
  const raw = yaml.load(fs.readFileSync(sourcePath, "utf8"));
  const sidebar = raw.sidebar || {};
  const technicalExperience = raw["technical-experiences"] || [];
  const additionalExperience = raw["other-experiences"] || [];
  const education = (raw.education || []).map(toEducation).sort(compareByPeriodDesc);
  const experience = [...technicalExperience, ...additionalExperience]
    .map(toExperience)
    .sort(compareByPeriodDesc);
  const websiteUrl = withProtocol(sidebar.website);

  const social = [
    sidebar.linkedin
      ? {
          label: "LinkedIn",
          handle: sidebar.linkedin,
          url: `https://www.linkedin.com/in/${sidebar.linkedin}/`,
          icon: "linkedin",
        }
      : null,
    sidebar.github
      ? {
          label: "GitHub",
          handle: `@${sidebar.github}`,
          url: `https://github.com/${sidebar.github}`,
          icon: "github",
        }
      : null,
    sidebar.mastodon
      ? {
          label: "Mastodon",
          handle: socialHandleFromUrl(sidebar.mastodon),
          url: sidebar.mastodon,
          icon: "mastodon",
        }
      : null,
  ].filter(Boolean);

  return {
    person: {
      name: sidebar.name || "",
      title: sidebar.tagline || "",
      location: sidebar.location || "",
      avatar: sidebar.avatar || "",
      email: sidebar.email || "",
      telephone: sidebar.phone || "",
      telephoneHref: cleanPhone(sidebar.phone || ""),
      website: websiteUrl,
      websiteDisplay: stripProtocol(websiteUrl),
      timezone: sidebar.timezone || "",
      pdf: sidebar.pdf || "",
      social,
    },
    summary: raw["career-profile"]?.summary || "",
    experience,
    education,
    skillAreas: parseAbilityGroups(raw.abilities?.details || ""),
    toolset: (raw.skills?.toolset || []).map(toSkill),
    languages: (sidebar.languages || []).map((item) => ({
      name: item.idiom || "",
      level: item.level || "",
    })),
    interests: (sidebar.interests || [])
      .map((item) => item.item || "")
      .filter(Boolean),
    projects: FEATURED_PROJECTS.map((project) => ({
      title: project.title,
      summary: project.description,
      url: repoUrl(project.repoName),
      tags: project.tags,
      type: "github",
      typeLabel: "Recent Build",
    })),
    projectsIntro:
      "These are the projects I have been actively shaping lately across Eleventy, Mastodon, theming, and small web tooling.",
    certifications: buildCertifications(raw, education),
    certificationEntries: buildCertifications(raw, education).map(toCertificationEntry),
    githubUsername: sidebar.github || "",
  };
};
