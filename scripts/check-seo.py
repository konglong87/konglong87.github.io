#!/usr/bin/env python3
"""Validate crawl, metadata, structured data and sitemap output for the public site."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlparse
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = json.loads((ROOT / "scripts/project-fixtures.json").read_text())
SITEMAP_NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class Head(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.title = ""
        self.metas = {}
        self.canonicals = []
        self.jsonld = []
        self._in_title = False
        self._in_jsonld = False
        self._jsonld_parts = []
        self.feed(text)
        if self._in_jsonld:
            self.jsonld.append("".join(self._jsonld_parts))

    def handle_starttag(self, tag, attributes):
        attrs = {key: value or "" for key, value in attributes}
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            for key in ("name", "property"):
                if attrs.get(key):
                    self.metas[attrs[key]] = attrs.get("content", "")
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        elif tag == "script" and attrs.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._jsonld_parts = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._jsonld_parts))
            self._in_jsonld = False
            self._jsonld_parts = []

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_jsonld:
            self._jsonld_parts.append(data)


def expected_url(base_url, path):
    suffix = path.as_posix().removesuffix("index.html")
    return base_url.rstrip("/") + "/" + quote(suffix, safe="/")


def page_types(page):
    types = set()

    def walk(value):
        if isinstance(value, dict):
            type_value = value.get("@type", [])
            types.update(type_value if isinstance(type_value, list) else [type_value])
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    for raw in page.jsonld:
        walk(json.loads(raw))
    types.discard("")
    return types


def check_page(output, path, base_url, required_types, indexable=True):
    file = output / path
    if not file.is_file():
        raise ValueError(f"Missing SEO page: {path}")
    page = Head(file.read_text())
    expected = expected_url(base_url, path)
    if not page.title.strip() or page.title.strip() == "🦖":
        raise ValueError(f"Missing meaningful title in {path}")
    description = page.metas.get("description", "").strip()
    if not description or len(description) > 220:
        raise ValueError(f"Missing or oversized description in {path}")
    allowed_canonicals = [expected]
    allowed_og_url = expected
    if not indexable and "/page/" in expected:
        allowed_canonicals.append(base_url.rstrip("/") + "/")
        allowed_og_url = base_url.rstrip("/") + "/"
    if page.canonicals != [allowed_canonicals[-1]]:
        raise ValueError(f"Wrong canonical in {path}: {page.canonicals}")
    if page.metas.get("og:url") != allowed_og_url:
        raise ValueError(f"Wrong og:url in {path}")
    if not page.metas.get("og:image") or not page.metas.get("twitter:image"):
        raise ValueError(f"Missing social image metadata in {path}")
    robots = page.metas.get("robots", "")
    if indexable and "noindex" in robots:
        raise ValueError(f"Indexable page marked noindex: {path}")
    if not indexable and "noindex" not in robots:
        raise ValueError(f"Duplicate page missing noindex: {path}")
    types = page_types(page)
    if not required_types.issubset(types):
        raise ValueError(f"Missing JSON-LD types in {path}: {required_types - types}")


def check_site(output, base_url):
    base_host = urlparse(base_url).netloc
    robots = output / "robots.txt"
    if not robots.is_file():
        raise ValueError("Missing robots.txt")
    robots_text = robots.read_text()
    for marker in ("User-agent: OAI-SearchBot", "User-agent: GPTBot", "Allow: /",
                   f"Sitemap: {FIXTURES['publish_base_url'].rstrip('/')}/sitemap.xml"):
        if marker not in robots_text:
            raise ValueError(f"robots.txt missing: {marker}")

    check_page(output, Path("index.html"), base_url, {"Person", "WebSite", "CollectionPage", "ItemList"})
    check_page(output, Path("projects/index.html"), base_url, {"Person", "WebSite", "CollectionPage", "ItemList"})
    for project in FIXTURES["projects"]:
        check_page(output, Path(f"projects/{project['slug']}/index.html"), base_url,
                   {"Person", "WebSite", "Article", "SoftwareSourceCode"})
    check_page(output, Path("post/陛下的规矩/index.html"), base_url, {"Person", "WebSite", "BlogPosting"})
    check_page(output, Path("tags/ai/index.html"), base_url, {"Person", "WebSite"}, indexable=False)
    check_page(output, Path("contact/index.html"), base_url, {"Person", "WebSite"}, indexable=False)
    check_page(output, Path("together/index.html"), base_url, {"Person", "WebSite"}, indexable=False)
    check_page(output, Path("homepage/index.html"), base_url, {"Person", "WebSite"}, indexable=False)

    sitemap = output / "sitemap.xml"
    if not sitemap.is_file():
        raise ValueError("Missing sitemap.xml")
    root = ElementTree.fromstring(sitemap.read_bytes())
    locations = [node.text for node in root.findall("s:url/s:loc", SITEMAP_NS)]
    if len(locations) != len(set(locations)):
        raise ValueError("Sitemap contains duplicate URLs")
    if base_url.rstrip("/") == FIXTURES["publish_base_url"].rstrip("/") and any("127.0.0.1" in url or "localhost" in url for url in locations):
        raise ValueError("Sitemap contains a preview host")
    required_urls = {expected_url(base_url, Path("index.html")), expected_url(base_url, Path("projects/index.html"))}
    required_urls.update(expected_url(base_url, Path(f"projects/{project['slug']}/index.html")) for project in FIXTURES["projects"])
    missing = required_urls - set(locations)
    if missing:
        raise ValueError(f"Sitemap missing required URLs: {sorted(missing)}")
    if any("/tags/" in url or "/page/" in url for url in locations):
        raise ValueError("Sitemap contains noindex taxonomy or pagination URL")
    if any(urlparse(url).netloc != base_host for url in locations):
        raise ValueError("Sitemap contains an unexpected host")
    print(f"SEO checks passed: {len(FIXTURES['projects'])} projects, {len(locations)} indexable URLs, JSON-LD and crawler policy valid.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("--base-url", default=FIXTURES["publish_base_url"])
    args = parser.parse_args()
    check_site(args.output.resolve(), args.base_url)


if __name__ == "__main__":
    main()
