#!/usr/bin/env python3
"""Read-only publication checks using the independently curated test inventory."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = json.loads((ROOT / "scripts/project-fixtures.json").read_text())


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.references = []
        self.images = []
        self.page_url = None
        self.cards = 0
        self.featured = 0
        self.h1 = []
        self._in_h1 = False
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        classes = attrs.get("class", "").split()
        self.cards += "project-card" in classes
        self.featured += "projects-featured" in classes
        if tag == "meta" and attrs.get("property") == "og:url":
            self.page_url = attrs.get("content")
        if tag == "h1":
            self._in_h1 = True
        if tag == "img":
            self.images.append(attrs)
        for key in ("href", "src"):
            if attrs.get(key):
                self.references.append(attrs[key])

    def handle_endtag(self, tag):
        if tag == "meta" and attrs.get("property") == "og:url":
            self.page_url = attrs.get("content")
        if tag == "h1":
            self._in_h1 = False

    def handle_data(self, text):
        if self._in_h1:
            self.h1.append(text)


def check_references(page, path, output, base_url):
    url = base_url.rstrip("/") + "/" + path.as_posix().removesuffix("index.html")
    for reference in page.references:
        target = urlparse(urljoin(url, reference))
        if target.scheme not in {"http", "https"}:
            continue
        if target.netloc != urlparse(base_url).netloc:
            continue
        # The knowledge site is a different GitHub Pages repository, not this blog.
        if target.path.startswith("/anything-ai/"):
            continue
        destination = output / unquote(target.path.lstrip("/"))
        if target.path.endswith("/"):
            destination /= "index.html"
        if not destination.is_file():
            raise ValueError(f"Broken local reference in {path}: {reference}")
        if target.scheme != urlparse(base_url).scheme:
            raise ValueError(f"Wrong publication scheme in {path}: {reference}")


def check_site(output, base_url):
    projects = FIXTURES["projects"]
    expected = {project["slug"] for project in projects}
    actual = {page.parent.name for page in (output / "projects").glob("*/index.html")}
    if actual != expected:
        raise ValueError(f"Unexpected public project routes: {actual ^ expected}")
    paths = [Path("index.html"), Path("projects/index.html")]
    paths += [Path(f"projects/{project['slug']}/index.html") for project in projects]
    for path in paths:
        file = output / path
        if not file.is_file():
            raise ValueError(f"Missing required page: {path}")
        page = Page(file.read_text())
        check_references(page, path, output, base_url)
        expected_url = base_url.rstrip("/") + "/" + path.as_posix().removesuffix("index.html")
        if page.page_url != expected_url:
            raise ValueError(f"Wrong page URL in {path}: {page.page_url}")
        if path in {Path("index.html"), Path("projects/index.html")} and page.cards != len(projects):
            raise ValueError(f"Wrong project card count in {path}: {page.cards}")
        if path == Path("index.html") and page.featured != 1:
            raise ValueError("Home page must have exactly one curated section")
        if path.parts[0] == "projects" and len(path.parts) == 3:
            project = next(item for item in projects if item["slug"] == path.parts[1])
            if "".join(page.h1) != project["title"]:
                raise ValueError(f"Wrong project title: {path}")
            expected_repo = f"https://github.com/konglong87/{project['repo']}"
            if expected_repo not in page.references:
                raise ValueError(f"Missing actual repository link: {path}")
            for image in page.images:
                if not urlparse(image["src"]).netloc:
                    if not all(image.get(key, "").isdigit() and int(image[key]) > 0 for key in ("width", "height")):
                        raise ValueError(f"Image has no intrinsic dimensions in {path}")
    print(f"Publication checks passed: {len(projects)} curated projects, {len(paths)} entry pages.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("--base-url", default=FIXTURES["publish_base_url"])
    args = parser.parse_args()
    check_site(args.output.resolve(), args.base_url)


if __name__ == "__main__":
    main()
