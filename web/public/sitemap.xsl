<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sitemap xhtml">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="ru">
      <head>
        <title>Карта сайта XML &#8212; EncarKorea</title>
        <meta name="robots" content="noindex, nofollow"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #FAFBFC;
            color: #111827;
            line-height: 1.6;
          }

          .header {
            background: #1D4ED8;
            color: white;
            padding: 32px 24px;
          }
          .header h1 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.85;
          }
          .header a {
            color: white;
            text-decoration: underline;
            opacity: 0.85;
          }
          .header a:hover { opacity: 1; }

          .container {
            max-width: 1320px;
            margin: 0 auto;
            padding: 24px;
          }

          .meta {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
            margin-bottom: 20px;
            font-size: 13px;
            color: #4B5563;
          }
          .meta strong { color: #111827; }

          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            border: 1px solid #E5E7EB;
          }

          thead th {
            background: #F3F4F6;
            padding: 12px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #4B5563;
            border-bottom: 1px solid #E5E7EB;
          }

          tbody td {
            padding: 10px 16px;
            font-size: 13px;
            border-bottom: 1px solid #F3F4F6;
          }

          tbody tr:hover td {
            background: #F8FAFC;
          }

          tbody tr:nth-child(even) td {
            background: #FAFBFC;
          }
          tbody tr:nth-child(even):hover td {
            background: #F3F4F6;
          }

          td a {
            color: #1D4ED8;
            text-decoration: none;
            word-break: break-all;
          }
          td a:hover {
            text-decoration: underline;
          }

          .priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          }
          .priority-high { background: #DBEAFE; color: #1D4ED8; }
          .priority-mid { background: #D1FAE5; color: #059669; }
          .priority-low { background: #F3F4F6; color: #6B7280; }

          .freq {
            font-size: 12px;
            color: #9CA3AF;
          }

          .footer {
            text-align: center;
            padding: 32px 24px;
            font-size: 12px;
            color: #9CA3AF;
          }
          .footer a { color: #1D4ED8; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="max-width:1320px;margin:0 auto">
            <h1>&#x1F30F; Карта сайта XML</h1>
            <p>
              Этот файл содержит <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URL для индексации поисковыми системами.
              <a href="/sitemap">Карта сайта для пользователей</a>
            </p>
          </div>
        </div>

        <div class="container">
          <div class="meta">
            <span>Всего страниц: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></span>
            <span>Сайт: <strong><a href="https://encar.vechkasov.pro">encar.vechkasov.pro</a></strong></span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:5%">#</th>
                <th style="width:55%">URL</th>
                <th style="width:15%">Приоритет</th>
                <th style="width:12%">Частота</th>
                <th style="width:13%">Обновлено</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:sort select="sitemap:priority" order="descending" data-type="number"/>
                <tr>
                  <td style="color:#9CA3AF;font-size:12px">
                    <xsl:value-of select="position()"/>
                  </td>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="sitemap:priority &gt;= 0.8">
                        <span class="priority priority-high">
                          <xsl:value-of select="sitemap:priority"/>
                        </span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority &gt;= 0.5">
                        <span class="priority priority-mid">
                          <xsl:value-of select="sitemap:priority"/>
                        </span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority priority-low">
                          <xsl:value-of select="sitemap:priority"/>
                        </span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="freq">
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td style="font-size:12px;color:#6B7280">
                    <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Сгенерировано <a href="https://encar.vechkasov.pro">EncarKorea</a> &#183; Next.js Sitemap</p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
