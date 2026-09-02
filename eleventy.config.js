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

  // Current year, for the footer.
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

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
