const yaml = require("js-yaml");
const { readFileSync, readdirSync, cpSync, copyFileSync } = require("node:fs");
const { join, dirname } = require("node:path");
const { createHash } = require("node:crypto");

const { version: buildAwesomeVersion } = JSON.parse(readFileSync(
  join(dirname(require.resolve("@awesome.me/buildawesome")), "../package.json"), "utf8"
));
const generator = `Build Awesome v${buildAwesomeVersion}`;

const offlineAssets = [
  "/", "/manifest.webmanifest", "/pwa.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png", "/assets/icons/favicon.svg"
];

function hashDirectory(directory, hash) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) hashDirectory(path, hash);
    else hash.update(path).update(readFileSync(path));
  }
}

module.exports = function (buildAwesomeConfig) {
  let version;
  let background;
  buildAwesomeConfig.on("buildawesome.before", () => {
    background = yaml.load(readFileSync("src/_data/site.yaml", "utf8"), { schema: yaml.JSON_SCHEMA }).background;
    const hash = createHash("sha256").update(generator);
    const sources = ["buildawesome.config.cjs", "src/index.njk", "src/_data/site.yaml", "src/manifest.webmanifest.njk", "src/sw.js.njk", "src/pwa.js"];
    for (const source of sources) hash.update(readFileSync(source));
    hashDirectory("src/assets", hash);
    version = hash.digest("hex").slice(0, 12);
  });
  buildAwesomeConfig.on("buildawesome.after", ({ dir }) => {
    const target = join(dir.output, "assets", version);
    cpSync("src/assets", target, { recursive: true });
    copyFileSync("src/pwa.js", join(target, "pwa.js"));
  });
  // Keep compression and static responses on the same thread.
  buildAwesomeConfig.setServerOptions({ serverThread: false, liveReload: false, domDiff: false, middleware: [require("./scripts/http.cjs")] });
  buildAwesomeConfig.addDataExtension("yaml", contents => yaml.load(contents, { schema: yaml.JSON_SCHEMA }));
  buildAwesomeConfig.addWatchTarget("src/assets/**/*");
  buildAwesomeConfig.addWatchTarget("src/pwa.js");
  buildAwesomeConfig.addPassthroughCopy("src/_headers");
  buildAwesomeConfig.addFilter("isoDate", date => new Date(date).toISOString());
  buildAwesomeConfig.addGlobalData("generator", generator);
  buildAwesomeConfig.addGlobalData("cacheVersion", () => version);
  buildAwesomeConfig.addGlobalData("assetPrefix", () => `/assets/${version}`);
  buildAwesomeConfig.addGlobalData("criticalCss", () => readFileSync("src/assets/css/style.css", "utf8"));
  buildAwesomeConfig.addGlobalData("offlineAssets", () => [
    ...offlineAssets, `/assets/images/${background.desktop.file}`, `/assets/images/${background.mobile.file}`
  ].map(path => path.startsWith("/assets/")
    ? path.replace("/assets/", `/assets/${version}/`)
    : path === "/pwa.js" ? `/assets/${version}/pwa.js` : path));

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk"]
  };
};
