# RSS Channel Formatter

## Role
Generate an RSS feed entry for the story — syndication to feed readers, podcast apps, and aggregation platforms.

## Input
- story.json (verified)
- heroImage (for enclosure)
- published date
- evidence score

## Output
- RSS `<item>` element (XML)
- Full content or excerpt + canonical link

---

## RSS Item Structure

```xml
<item>
  <title>{Headline | Evidence Score: {score}%}</title>
  <link>https://thebreakdown.in/story/{slug}</link>
  <guid isPermaLink="true">https://thebreakdown.in/story/{slug}</guid>
  <pubDate>{RFC 2822 date}</pubDate>
  <description>
    <![CDATA[
      {2-3 sentence summary. Key stat bolded.}
      <br/><br/>
      <strong>Evidence Score: {score}%</strong>
      <br/><br/>
      <a href="https://thebreakdown.in/story/{slug}">Read the full story with interactive charts</a>
    ]]>
  </description>
  <content:encoded>
    <![CDATA[
      {Full story HTML or first 5000 chars + read more link}
    ]]>
  </content:encoded>
  <enclosure url="{heroImage URL}" type="image/webp" length="{file size in bytes}"/>
  <category>{Topic}</category>
  <category>{Category}</category>
  <dc:subject>Evidence Score: {score}%</dc:subject>
  <dc:creator>{Author Name}</dc:creator>
  <media:content url="{heroImage URL}" medium="image" type="image/webp"/>
</item>
```

## Channel Feed Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Breakdown — India Explained</title>
    <link>https://thebreakdown.in</link>
    <description>Independent, data-driven journalism on Indian policy, politics, and society.</description>
    <language>en-in</language>
    <lastBuildDate>{RFC 2822 date}</lastBuildDate>
    <atom:link href="https://thebreakdown.in/feed/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://thebreakdown.in/images/logo-rss.png</url>
      <title>The Breakdown</title>
      <link>https://thebreakdown.in</link>
    </image>

    <!-- Story items -->
    <item>...</item>
    <item>...</item>
  </channel>
</rss>
```

## Rules
1. **Title**: include evidence score in title (SEO + trust signal).
2. **GUID must be the canonical URL** — never change once published.
3. **pubDate in RFC 2822 format**: `Thu, 02 Jul 2026 07:00:00 +0530`.
4. **Full content in content:encoded** or first 5,000 chars with read more link.
5. **Enclosure**: hero image in WebP format with correct mime type.
6. **Categories**: use story topic + category for filtering.
7. **Evidence score** in `<dc:subject>` tag for custom filtering.
8. **Media RSS**: enable rich embeds in feed readers (Feedly, Inoreader).
9. **Podcast RSS**: if audio exists, include `<enclosure>` with MP3.
10. **Validate**: feed must pass W3C RSS Feed Validation.
