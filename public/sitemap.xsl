<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:rps="https://www.roadplanstudio.com/sitemap"
  exclude-result-prefixes="sitemap xhtml rps"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML Sitemap · RoadPlan Studio</title>
        <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml"/>
        <style>
          :root {
            --bg: #f7f5f2;
            --fg: #0f1a18;
            --muted: #667774;
            --primary: #2f6f6a;
            --accent: #c4a882;
            --border: #e6e1d8;
            --card: #ffffff;
            --spruce: #1a332f;
            --snow: #f7f5f2;
            --shadow: 0 24px 60px -28px rgba(26, 51, 47, 0.35);
            --font-sans: "DM Sans", "Segoe UI", system-ui, sans-serif;
            --font-display: "Fraunces", Georgia, "Times New Roman", serif;
          }

          * { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          body {
            margin: 0;
            min-height: 100vh;
            color: var(--fg);
            font-family: var(--font-sans);
            font-size: 16px;
            line-height: 1.55;
            background:
              radial-gradient(1200px 500px at 10% -10%, rgba(47, 111, 106, 0.12), transparent 60%),
              radial-gradient(900px 420px at 100% 0%, rgba(196, 168, 130, 0.18), transparent 55%),
              linear-gradient(180deg, #fbfaf7 0%, var(--bg) 40%, #efeae2 100%);
          }

          a { color: var(--primary); text-decoration: none; }
          a:hover { text-decoration: underline; text-underline-offset: 3px; }

          .shell {
            width: min(1120px, calc(100% - 2rem));
            margin: 0 auto;
            padding: 2.5rem 0 4rem;
          }

          .hero {
            position: relative;
            overflow: hidden;
            border-radius: 28px;
            padding: 2.25rem 2rem;
            color: var(--snow);
            background: linear-gradient(140deg, #1a332f 0%, #2a5550 55%, #2f6f6a 100%);
            box-shadow: var(--shadow);
          }

          .hero::after {
            content: "";
            position: absolute;
            inset: auto -10% -40% 40%;
            height: 220px;
            background: radial-gradient(circle, rgba(196,168,130,0.35), transparent 70%);
            pointer-events: none;
          }

          .eyebrow {
            margin: 0;
            font-size: 0.75rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--accent);
            font-weight: 500;
          }

          h1 {
            margin: 0.65rem 0 0;
            font-family: var(--font-display);
            font-size: clamp(2rem, 5vw, 3.25rem);
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1.05;
          }

          .lede {
            margin: 1rem 0 0;
            max-width: 40rem;
            color: rgba(247, 245, 242, 0.78);
            font-size: 1.05rem;
          }

          .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem 1.25rem;
            margin-top: 1.5rem;
            font-size: 0.92rem;
            color: rgba(247, 245, 242, 0.72);
          }

          .meta strong {
            color: var(--snow);
            font-weight: 600;
          }

          .toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin: 1.75rem 0 1rem;
          }

          .chip {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            border: 1px solid var(--border);
            background: color-mix(in srgb, var(--card) 88%, transparent);
            backdrop-filter: blur(8px);
            border-radius: 999px;
            padding: 0.45rem 0.9rem;
            color: var(--muted);
            font-size: 0.85rem;
          }

          .chip b { color: var(--fg); font-weight: 600; }

          .panel {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 2px 10px -4px rgba(26, 51, 47, 0.12);
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead th {
            position: sticky;
            top: 0;
            z-index: 1;
            text-align: left;
            font-size: 0.72rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--muted);
            background: #f3f0ea;
            border-bottom: 1px solid var(--border);
            padding: 0.95rem 1.1rem;
            font-weight: 600;
          }

          tbody td {
            padding: 1rem 1.1rem;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
          }

          tbody tr:last-child td { border-bottom: 0; }
          tbody tr:hover td { background: #faf8f5; }

          .url a {
            color: var(--fg);
            font-weight: 500;
            word-break: break-all;
          }
          .url a:hover { color: var(--primary); }

          .group {
            display: inline-block;
            border-radius: 999px;
            padding: 0.2rem 0.65rem;
            font-size: 0.75rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            font-weight: 600;
            background: rgba(47, 111, 106, 0.1);
            color: var(--primary);
          }

          .group.trips { background: rgba(196, 168, 130, 0.22); color: #7a5f3a; }
          .group.blog { background: rgba(26, 51, 47, 0.08); color: var(--spruce); }
          .group.destinations { background: rgba(47, 111, 106, 0.14); color: #1f5551; }
          .group.marketing { background: rgba(47, 111, 106, 0.1); color: var(--primary); }

          .muted { color: var(--muted); font-size: 0.92rem; white-space: nowrap; }
          .priority {
            font-family: var(--font-display);
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--spruce);
          }

          .alts {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
            margin-top: 0.55rem;
          }

          .alts a {
            display: inline-flex;
            border-radius: 999px;
            border: 1px solid var(--border);
            padding: 0.15rem 0.5rem;
            font-size: 0.72rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--muted);
          }
          .alts a:hover {
            border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
            color: var(--primary);
            text-decoration: none;
          }

          .foot {
            margin-top: 1.5rem;
            color: var(--muted);
            font-size: 0.9rem;
          }

          @media (max-width: 820px) {
            .hide-sm { display: none; }
            thead th:nth-child(3),
            tbody td:nth-child(3) { display: none; }
          }

          @media (max-width: 640px) {
            .shell { width: min(100% - 1.25rem, 1120px); padding-top: 1.25rem; }
            .hero { padding: 1.5rem 1.25rem; border-radius: 22px; }
            thead th:nth-child(4),
            tbody td:nth-child(4),
            thead th:nth-child(5),
            tbody td:nth-child(5) { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="shell">
          <header class="hero">
            <p class="eyebrow">RoadPlan Studio · SEO</p>
            <h1>XML Sitemap</h1>
            <p class="lede">
              Indexable public routes for search engines — marketing pages,
              international trip templates, destinations, and blog posts.
            </p>
            <div class="meta">
              <span><strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs</span>
              <span>Protocol: sitemaps.org 0.9 + xhtml hreflang</span>
              <span><a href="https://www.roadplanstudio.com" style="color: var(--accent);">www.roadplanstudio.com</a></span>
            </div>
          </header>

          <div class="toolbar">
            <span class="chip">Marketing <b><xsl:value-of select="count(sitemap:urlset/sitemap:url[rps:group='marketing'])"/></b></span>
            <span class="chip">Trips <b><xsl:value-of select="count(sitemap:urlset/sitemap:url[rps:group='trips'])"/></b></span>
            <span class="chip">Destinations <b><xsl:value-of select="count(sitemap:urlset/sitemap:url[rps:group='destinations'])"/></b></span>
            <span class="chip">Blog <b><xsl:value-of select="count(sitemap:urlset/sitemap:url[rps:group='blog'])"/></b></span>
          </div>

          <div class="panel">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Group</th>
                  <th class="hide-sm">Last modified</th>
                  <th>Change</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <xsl:sort select="sitemap:priority" data-type="number" order="descending"/>
                  <xsl:sort select="sitemap:loc"/>
                  <tr>
                    <td class="url">
                      <a href="{sitemap:loc}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                      <xsl:if test="xhtml:link">
                        <div class="alts">
                          <xsl:for-each select="xhtml:link">
                            <a href="{@href}" title="{@hreflang}">
                              <xsl:value-of select="@hreflang"/>
                            </a>
                          </xsl:for-each>
                        </div>
                      </xsl:if>
                    </td>
                    <td>
                      <span>
                        <xsl:attribute name="class">
                          <xsl:text>group </xsl:text>
                          <xsl:value-of select="rps:group"/>
                        </xsl:attribute>
                        <xsl:value-of select="rps:group"/>
                      </span>
                    </td>
                    <td class="muted hide-sm">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                    <td class="muted">
                      <xsl:value-of select="sitemap:changefreq"/>
                    </td>
                    <td class="priority">
                      <xsl:value-of select="sitemap:priority"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <p class="foot">
            This page is an XSL view of <code>/sitemap.xml</code>. Crawlers read the raw XML;
            browsers apply <code>/sitemap.xsl</code> for a human-friendly table.
          </p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
