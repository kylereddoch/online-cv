const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  const markdown = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  });

  eleventyConfig.setLibrary("md", markdown);

  eleventyConfig.addFilter("markdown", (value = "") => markdown.render(value));
  eleventyConfig.addFilter("markdownInline", (value = "") => markdown.renderInline(value));
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("stripHtml", (value = "") =>
    String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  );
  eleventyConfig.addFilter("slugify", (value = "") =>
    String(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "assets/images": "assets/images" });
  eleventyConfig.addPassthroughCopy({ "assets/pdf": "assets/pdf" });
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("CNAME");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
