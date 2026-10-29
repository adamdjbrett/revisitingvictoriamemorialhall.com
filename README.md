# Revisiting Victoria Memorial Hall

An Eleventy coming-soon website for the international research project.

## Develop and build

Requires Node.js 18 or later and npm. The verification script also uses Python 3.

```sh
npm ci
npm run dev
```

Open the local URL printed by Eleventy. For production:

```sh
npm run build
npm test
```

Deploy **`_site/`**, not the repository root. Generated files are ignored by Git.
Build and development commands clear `_site/` first, removing stale output.
`npm test` rebuilds and checks generated routes, local HTML/CSS asset paths,
canonical-domain consistency, team credits, and Atom/XSL XML.

## Source layout

```text
src/
  _data/site.yaml             Site metadata, domain, research and website teams
  index.njk                   Coming-soon page
  assets/
    css/                      Template, project, and feed styles
    fonts/                    Bundled Urbanist fonts and their license
    images/                   Project photographs and WebP background
  humans.txt.njk              Generates /humans.txt
  robots.txt.njk              Generates /robots.txt
  sitemap.txt.njk             Generates /sitemap.txt
  feed/
    feed.xml.njk              Generates /feed/feed.xml (Atom 1.0)
    feed.xsl                  XSLT 1.0 stylesheet for the feed
scripts/check_build.py        Build verification
```

Set `url` in `src/_data/site.yaml` to the production origin, without a trailing
slash. It is currently `https://revisitingvictoriamemorialhall.com`.
Canonical metadata, robots, sitemap, humans, and feed URLs use this value.
This setting does not configure DNS or hosting.

The homepage uses Colorlib’s Coming Soon Page V01 template. Its original
stylesheet is preserved in `src/assets/css/style.css`; project content
and attribution styles are in `src/assets/css/project.css`.
The original template folder, ZIP, demo script, and unused styles are removed.

The background is `src/assets/images/Victoria_Memorial_situated_in_Kolkata.webp`,
resized to 2560 × 1146 from the retained original JPEG. The sculpture photograph
is `src/assets/images/Fig.1_snake_Jalais.jpg` and remains in the project section.
All five project photographs and the original background JPEG are preserved.
`humans.txt` credits Romita Ray, Tim Barringer, and Adam.

The sitemap and feed include pages tagged `pages`. The homepage is the first
feed entry. Give future pages a `title`, `date`, and optional `description` in
front matter. Update a page's `date` when publishing a substantive revision.
The feed uses an XSLT stylesheet for browsers that support XML transformations;
feed readers can consume the Atom XML directly.

## Rights and attribution

[LICENSE](LICENSE) applies MIT terms to original project code. It does not grant
rights to the photographs, fonts, or third-party template assets.
Urbanist is distributed under the SIL Open Font License, included at
`src/assets/fonts/OFL.txt`. The supplied Colorlib template attribution is
retained here: [Coming Soon Page V01 by Colorlib](https://colorlib.com/wp/template/coming-soon-page-01/).
The supplied template permits personal and commercial use. Project photographs
retain their respective owners' rights.

The Victoria Memorial background photograph is by
[Subhrajyoti07](https://commons.wikimedia.org/wiki/File:Victoria_Memorial_situated_in_Kolkata.jpg),
licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0),
via Wikimedia Commons. The WebP derivative was resized and format-converted,
and is distributed under the same license. Attribution appears on the homepage.
