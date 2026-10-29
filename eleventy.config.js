const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents, { schema: yaml.JSON_SCHEMA }));
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/feed/feed.xsl");
  eleventyConfig.addFilter("isoDate", date => new Date(date).toISOString());

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk"]
  };
};
