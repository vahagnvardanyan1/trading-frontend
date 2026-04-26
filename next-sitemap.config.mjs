const LOCALES = ["en", "hy", "ru"];

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  additionalPaths: async () =>
    LOCALES.map((locale) => ({
      loc: `/${locale}`,
      changefreq: "weekly",
      priority: 1,
      lastmod: new Date().toISOString(),
    })),
};

export default config;
