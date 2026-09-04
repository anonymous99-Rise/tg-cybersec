#!/usr/bin/env python3
"""Generate RSS feed from channels.json"""
import json
from datetime import datetime

with open('src/data/channels.json', 'r', encoding='utf-8') as f:
    channels = json.load(f)

pub_date = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')

rss = f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Telegram Cybersecurity Channels</title>
    <link>https://anonymous99-Rise.github.io/tg-cybersec/</link>
    <description>List of Telegram channels related to cybersecurity</description>
    <language>en</language>
    <lastBuildDate>{pub_date}</lastBuildDate>
    <atom:link href="https://anonymous99-Rise.github.io/tg-cybersec/feed.xml" rel="self" type="application/rss+xml"/>
'''

for ch in channels[:50]:  # Limit to 50 most recent
    tags = ', '.join(ch.get('tags', []))
    rss += f'''    <item>
      <title>{ch['name']}</title>
      <link>{ch['link']}</link>
      <description>{ch.get('description', '')} | Tags: {tags}</description>
      <status>{ch['status']}</status>
    </item>
'''

rss += '  </channel>\n</rss>'

with open('feed.xml', 'w', encoding='utf-8') as f:
    f.write(rss)

print(f'Generated feed.xml with {len(channels)} channels')
