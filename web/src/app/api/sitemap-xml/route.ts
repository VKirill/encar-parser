import { NextResponse } from "next/server";
import { getSitemapEntries } from "@/app/sitemap-data";

export async function GET() {
  const entries = getSitemapEntries();
  const now = new Date().toISOString();

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastModified instanceof Date ? e.lastModified.toISOString() : now}</lastmod>
    <changefreq>${e.changeFrequency ?? "daily"}</changefreq>
    <priority>${e.priority ?? 0.5}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
