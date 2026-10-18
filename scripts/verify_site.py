"""Validate a Jekyll build without third-party Python packages.

Run: python scripts/verify_site.py [path-to-built-site]
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.h1_count = 0
        self.canonical = False
        self.feed(text)

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate ID: {attrs['id']}"
            self.ids.add(attrs['id'])
        self.h1_count += tag == 'h1'
        if tag in ('a', 'link', 'use') and 'href' in attrs:
            self.references.append(attrs['href'])
        if tag in ('img', 'script') and 'src' in attrs:
            self.references.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = True


root = Path(sys.argv[1] if len(sys.argv) > 1 else '_site').resolve()
assert root.is_dir(), f'Build output not found: {root}'
pages = {}
for path in root.rglob('*.html'):
    page = Page(path.read_text(encoding='utf-8'))
    assert page.h1_count == 1, f'{path}: expected one H1, got {page.h1_count}'
    assert page.canonical, f'{path}: missing canonical URL'
    pages[path.resolve()] = page

for path, page in pages.items():
    for href in page.references:
        url = urlsplit(href)
        if url.scheme or url.netloc:
            continue
        target = (root / unquote(url.path).lstrip('/')) if url.path.startswith('/') else (path.parent / unquote(url.path)) if url.path else path
        if target.is_dir():
            target /= 'index.html'
        target = target.resolve()
        assert target.is_file(), f'{path}: broken reference {href}'
        if url.fragment and target in pages:
            assert unquote(url.fragment) in pages[target].ids, f'{path}: missing anchor {href}'

for legacy in (
    'others/2026/09/24/my-first-post.html',
    'recording/2026/09/27/Recording1-26年9月回顾.html',
):
    assert (root / legacy).is_file(), f'Legacy URL lost: {legacy}'

for excluded in ('Undone', 'Backup', 'scripts', 'Gemfile', 'Gemfile.lock'):
    assert not (root / excluded).exists(), f'Excluded content leaked: {excluded}'

feed = ET.parse(root / 'feed.xml').getroot()
items = feed.findall('./channel/item')
assert items, 'RSS contains no published articles'
for item in items:
    link = item.findtext('link')
    assert link and link.startswith('https://jiangshr-mjl.github.io/'), 'Invalid RSS URL'
    assert (root / unquote(urlsplit(link).path).lstrip('/')).is_file(), f'RSS item missing: {link}'
    assert item.findtext('title'), 'RSS title missing'

print(f'PASS: {len(pages)} HTML pages, local links and anchors, one H1 per page, legacy URLs, draft exclusion, {len(items)} RSS items.')
