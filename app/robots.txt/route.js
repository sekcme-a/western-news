import { NextResponse } from "next/server";

export function GET() {
  const content = `
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /admin-login
Disallow: /admin-login/

Sitemap: https://western-news.co.kr/sitemap.xml
  `.trim();

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
