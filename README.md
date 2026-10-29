# Revisiting Victoria Memorial Hall

An Eleventy coming-soon website for the international research project.

## Develop and build

Requires Node.js 18 or later and npm. The verification script also uses Python 3.11 or later.

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
canonical-domain consistency, team credits, Atom/XSL XML, and PWA caching behavior.

## Source layout

```text
src/
  _data/site.yaml             Site metadata, domain, research and website teams
  index.njk                   Coming-soon page
  manifest.webmanifest.njk     Installable PWA metadata
  pwa.js                      Service-worker registration only
  sw.js.njk                   Offline cache and update handling
  assets/
    css/                      Trimmed template and feed styles
    icons/                    PWA icons and favicon
    images/                   Responsive WebP photographs
  humans.txt.njk              Generates /humans.txt
  robots.txt.njk              Generates /robots.txt
  sitemap.txt.njk             Generates /sitemap.txt
  feed/
    feed.xml.njk              Generates /feed/feed.xml (Atom 1.0)
    feed.xsl                  XSLT 1.0 stylesheet for the feed
originals/images/             Preserved source JPEGs; excluded from deployment
scripts/check_build.py        Build verification
scripts/check_pwa.cjs         Service-worker tests
```

Set `url` in `src/_data/site.yaml` to the production origin, without a trailing
slash. It is currently `https://revisitingvictoriamemorialhall.com`.
Canonical metadata, robots, sitemap, humans, and feed URLs use this value.
This setting does not configure DNS or hosting.

The homepage retains the appearance of Colorlib’s Coming Soon Page V01.
Unused controls, framework resets, and duplicate styles were removed; active
styles and project attribution live in `src/assets/css/style.css`.
The font stack is Didot, Bodoni MT, Noto Serif Display, URW Palladio L, P052,
Sylfaen, serif, with normal weight throughout. These are local system fonts;
no font files or third-party resources are downloaded.

The background uses desktop (1920 × 859) and phone (720 × 1440) WebP versions
of the Victoria Memorial photograph. The homepage contains only the coming-soon
screen; the former research section and sculpture image have been removed.
All source JPEGs are preserved in `originals/images/`, outside the published
site. `humans.txt` credits Romita Ray, Tim Barringer, and Adam.

## PWA and JavaScript

The page, research links, images, and CSS work with JavaScript disabled.
The only client JavaScript is `pwa.js`, which registers the service worker
once the page has loaded. There are no analytics, UI frameworks, countdowns,
or signup scripts.

The manifest provides install metadata and app icons. After a successful online
visit, the service worker caches the homepage and its assets for offline use.
Online requests prefer the network. Cache versions are derived from published
content; activating a new version removes only this site's older caches.
HTTPS is required in production; localhost works for development.
With JavaScript disabled, installation and offline caching are unavailable.

## Lighthouse verification

Local audits use Lighthouse 13.6.0 with the default mobile configuration and
its desktop preset. HTML and JSON reports are saved in `.reports/` (Git-ignored).
Performance scores depend on the tested environment; production hosting and
network conditions need a separate check after deployment.

The sitemap and feed include pages tagged `pages`. The homepage is the first
feed entry. Give future pages a `title`, `date`, and optional `description` in
front matter. Update a page's `date` when publishing a substantive revision.
The feed uses an XSLT stylesheet for browsers that support XML transformations;
feed readers can consume the Atom XML directly.

## Rights and attribution

[LICENSE](LICENSE) applies MIT terms to original project code. It does not grant
rights to the photographs, fonts, or third-party template assets.
The Colorlib template attribution is retained here: [Coming Soon Page V01 by Colorlib](https://colorlib.com/wp/template/coming-soon-page-01/).
The supplied template permits personal and commercial use. Project photographs
retain their respective owners' rights.

The Victoria Memorial background photograph is by
[Subhrajyoti07](https://commons.wikimedia.org/wiki/File:Victoria_Memorial_situated_in_Kolkata.jpg),
licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0),
via Wikimedia Commons. The WebP derivatives were resized and format-converted;
the phone version was also cropped. Each derivative
and is distributed under the same license. Attribution appears on the homepage.
