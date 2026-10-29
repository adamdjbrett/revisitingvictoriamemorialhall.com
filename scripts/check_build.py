"""Check generated routes, local assets, domain consistency, and Atom/XSL XML."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from datetime import datetime
import re
import json
import xml.etree.ElementTree as ET

output = Path(__file__).resolve().parents[1] / "_site"


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("rel") == "canonical":
            self.canonical = attrs["href"]
        for key in ("href", "src"):
            if attrs.get(key):
                self.links.append(attrs[key])
        if attrs.get("srcset"):
            self.links.extend(candidate.strip().split()[0] for candidate in attrs["srcset"].split(","))


for route in ("index.html", "humans.txt", "robots.txt", "sitemap.txt", "feed/feed.xml", "feed/feed.xsl", "manifest.webmanifest", "sw.js", "pwa.js"):
    assert (output / route).is_file(), f"Missing route: {route}"
for removed in ("coming-soon-page-01", "assets/js", "assets/css/styles.css"):
    assert not (output / removed).exists(), f"Stale output: {removed}"

home = Page()
home.feed((output / "index.html").read_text())
homepage = (output / "index.html").read_text()
assert 'class="cl-soon01__title"' in homepage
assert '/assets/css/style.css' in home.links
assert '/assets/images/Victoria_Memorial_situated_in_Kolkata.webp' in home.links
webp = (output / "assets/images/Victoria_Memorial_situated_in_Kolkata.webp").read_bytes()
assert webp[:4] == b"RIFF" and webp[8:12] == b"WEBP"
assert 'https://commons.wikimedia.org/wiki/File:Victoria_Memorial_situated_in_Kolkata.jpg' in home.links
assert 'https://creativecommons.org/licenses/by-sa/4.0' in home.links
assert 'Subhrajyoti07' in homepage and 'Resized and converted to WebP.' in homepage
assert 'project-detail' not in homepage and 'Fig.1_snake_Jalais' not in homepage
assert homepage.count('<script ') == 1 and 'src="/pwa.js" defer' in homepage
manifest = json.loads((output / 'manifest.webmanifest').read_text())
assert manifest['start_url'] == '/' and manifest['display'] == 'standalone'
for icon in manifest['icons']:
    assert (output / icon['src'].lstrip('/')).is_file()
assert {icon['sizes'] for icon in manifest['icons']} >= {'192x192', '512x512'}
assert not list(output.rglob('*.jpg')) and not list(output.rglob('*.JPG'))
assert not (output / 'assets/fonts').exists()
css = (output / 'assets/css/style.css').read_text()
assert "font-family:Didot,'Bodoni MT','Noto Serif Display','URW Palladio L',P052,Sylfaen,serif" in css
assert set(re.findall(r'font-weight:([^;}]+)', css)) == {'normal'}
assert home.canonical and home.canonical.startswith("https://")
base = home.canonical.rstrip("/")
sitemap_urls = set((output / "sitemap.txt").read_text().splitlines()) - {""}
assert base + "/" in sitemap_urls
assert f"Sitemap: {base}/sitemap.txt" in (output / "robots.txt").read_text()
assert base + "/" in (output / "humans.txt").read_text()
assert "Tim Barringer" in (output / "humans.txt").read_text()
assert "Romita Ray" in (output / "humans.txt").read_text()
assert "Name: Adam" in (output / "humans.txt").read_text()

for file in output.rglob("*.html"):
    page = Page()
    page.feed(file.read_text())
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc or not url.path:
            continue
        target = output / url.path.lstrip("/") if url.path.startswith("/") else file.parent / url.path
        if target.is_dir():
            target /= "index.html"
        assert target.is_file(), f"Broken link in {file}: {link}"

for file in output.rglob("*.css"):
    for asset in re.findall(r"url\(['\"]?([^)'\"]+)", file.read_text()):
        assert (file.parent / asset).is_file(), f"Broken CSS asset: {asset}"

ns = {"a": "http://www.w3.org/2005/Atom"}
feed_path = output / "feed/feed.xml"
feed = ET.parse(feed_path).getroot()
assert feed.tag == "{" + ns["a"] + "}feed"
assert feed.findtext("a:id", namespaces=ns) == base + "/feed/feed.xml"
assert feed.find("a:link[@rel='self']", ns).get("href") == base + "/feed/feed.xml"
assert feed.findtext("a:author/a:name", namespaces=ns)
datetime.fromisoformat(feed.findtext("a:updated", namespaces=ns))
entries = feed.findall("a:entry", ns)
assert {entry.findtext("a:id", namespaces=ns) for entry in entries} == sitemap_urls
for entry in entries:
    assert entry.findtext("a:title", namespaces=ns)
    assert entry.findtext("a:summary", namespaces=ns)
    datetime.fromisoformat(entry.findtext("a:updated", namespaces=ns))
assert 'href="/feed/feed.xsl"' in feed_path.read_text()
ET.parse(output / "feed/feed.xsl")

for file in output.rglob("*"):
    if file.is_file() and file.suffix in (".html", ".txt", ".xml"):
        assert "{{" not in file.read_text(), f"Unrendered template: {file}"

print("PASS: generated routes, domain, HTML/CSS assets, team credits, Atom feed, and XSL XML.")
