<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" exclude-result-prefixes="atom">
  <xsl:output method="html" encoding="UTF-8"/>
  <xsl:template match="/atom:feed">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="atom:title"/> — Feed</title>
        <link rel="stylesheet" href="/assets/css/feed.css"/>
      </head>
      <body>
        <main>
          <p class="eyebrow">Research updates · Atom feed</p>
          <h1><xsl:value-of select="atom:title"/></h1>
          <p><xsl:value-of select="atom:subtitle"/></p>
          <p>Subscribe by copying this page’s URL into your feed reader.</p>
          <a href="{atom:link[@rel='alternate']/@href}">Visit the website →</a>
          <section aria-label="Updates">
            <xsl:for-each select="atom:entry">
              <article>
                <h2><a href="{atom:link/@href}"><xsl:value-of select="atom:title"/></a></h2>
                <time datetime="{atom:updated}"><xsl:value-of select="substring(atom:updated, 1, 10)"/></time>
                <p><xsl:value-of select="atom:summary"/></p>
              </article>
            </xsl:for-each>
          </section>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
