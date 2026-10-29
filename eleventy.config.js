const yaml = require("js-yaml");
const { readFileSync } = require("node:fs");
const { createHash } = require("node:crypto");

const offlineAssets = [
  "/", "/manifest.webmanifest", "/pwa.js", "/assets/css/style.css",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png", "/assets/icons/favicon.svg",
  "/assets/images/Victoria_Memorial_situated_in_Kolkata.webp",
  "/assets/images/Victoria_Memorial_situated_in_Kolkata-mobile.webp"
];

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents, { schema: yaml.JSON_SCHEMA }));
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/feed/feed.xsl");
  eleventyConfig.addPassthroughCopy("src/pwa.js");
  eleventyConfig.addFilter("isoDate", date => new Date(date).toISOString());
  eleventyConfig.addGlobalData("offlineAssets", offlineAssets);
  eleventyConfig.addGlobalData("cacheVersion", () => {
    const hash = createHash("sha256");
    const sources = ["eleventy.config.js", "src/index.njk", "src/_data/site.yaml", "src/manifest.webmanifest.njk", "src/sw.js.njk",
      ...offlineAssets.filter(path => path.startsWith("/assets/") || path === "/pwa.js").map(path => `src${path}`)];
    for (const source of sources) hash.update(readFileSync(source));
    return hash.digest("hex").slice(0, 12);
  });

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk"]
  };
};
