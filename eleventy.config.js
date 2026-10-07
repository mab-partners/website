import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export default function (eleventyConfig) {
  // Append a content hash to asset URLs so browsers pick up changes
  // (assets are served with long/immutable cache headers).
  eleventyConfig.addFilter("bust", (assetPath) => {
    try {
      const hash = createHash("md5")
        .update(readFileSync(`src${assetPath}`))
        .digest("hex")
        .slice(0, 8);
      return `${assetPath}?v=${hash}`;
    } catch {
      return assetPath;
    }
  });
  // Copy static assets straight through to the output folder.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });

  // Podcast: "2026-07-23" -> "Jul 23, 2026"; 3116 (seconds) -> "52 min" / "1 hr 9 min".
  eleventyConfig.addFilter("podDate", (iso) => {
    const d = new Date(iso + "T12:00:00Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  });
  eleventyConfig.addFilter("podDur", (secs) => {
    const m = Math.round(secs / 60);
    return m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`;
  });

  // Current year, for the footer.
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // True when the current page URL falls under one of a nav dropdown's links
  // (so the "Insights" toggle can show the same current-page treatment as a link).
  eleventyConfig.addFilter("dropdownIsCurrent", (dropdown, pageUrl) =>
    (dropdown || []).some((sub) => pageUrl.indexOf(sub.url) === 0)
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
