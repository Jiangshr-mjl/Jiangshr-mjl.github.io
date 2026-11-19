# Cloud’s Notes

A quiet, cloud-inspired personal notebook, built with Jekyll and hosted on GitHub Pages.

## Local development

Use Ruby 3.3 with Bundler. On Windows, RubyInstaller's DevKit is required for native dependencies.

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1
```

Open `http://127.0.0.1:4000`. Build and check the generated links, RSS, headings, and exclusions:

On this Windows workspace, `./scripts/preview.ps1` also finds the portable Ruby tools in the sibling `../.tools/` directory. Use `./scripts/preview.ps1 -BuildOnly` to build. This helper serves without file watching; restart it after edits. It does not change system settings.

```sh
bundle exec jekyll build
python scripts/verify_site.py
node scripts/check_interactions.cjs
node scripts/check_footprints.cjs
```

The Python check uses only the standard library. The optional interaction check uses Node's built-in test utilities; the site itself needs no Node build or external font service.

## Writing a note

Create `_posts/YYYY-MM-DD-slug.md`:

```yaml
---
layout: post
title: Your note title
date: 2026-10-18
categories: [Thinking]
description: Optional summary for the article list and RSS.
---
```

Write the body immediately below the front matter. The layout renders the title: do not repeat it as a `#` heading. Use `##` and `###` for sections. Three or more such headings automatically produce a table of contents, including when JavaScript is disabled.

- Available categories are `Recording`, `Thinking`, `Working`, `Researching`, `Learning`, and `Living`, plus historical `Others`.
- Historical `Talking` posts appear under `Thinking` without changing their category or URL.
- Optional `display_title` overrides the visible title consistently in lists, articles, and RSS, while keeping the original `title` field.
- Optional `description` supplies the summary; otherwise the first prose paragraph is used.
- Category descriptions and icons live in `_data/categories.yml`; site identity is in `_config.yml`.
- Drafts stay in `Undone/`, which is excluded from the build. Posts dated in the future and posts with `published: false` are excluded too. Do not use `--drafts`, `--future`, or `--unpublished` for production builds.

## 更新足迹地图

地图位于 `/map/`。在 `_data/footprints.yml` 中维护两份清单。第一次记录某座城市时，在 `cities` 填写唯一的英文 `id`、中文 `name` 和城市中心的 WGS84 经纬度（`lat`、`lng`）。以后再去同一座城市，沿用该城市的 `id` 即可。

**给已有城市加一段经历**　在 `entries` 下追加一项，给每段经历一个唯一的 `id`。日期用引号括起，支持单月、起止年月、「至今」或童年等文字。以下示例取自现有记录。

```yaml
- id: guangzhou-benke
  date: "2022.09–2023.07"
  text: 在广州读中山大学本科第一年。
  cities: [guangzhou]
```

**记录一次多城市行程**　用一条经历写下整次行程，把各站的城市 ID 按到访顺序填入 `cities`。地图会依次连线，所有站点共用这段文字。

```yaml
- id: henan-waichang
  date: "2026.07"
  text: 第二次出差，参加暴雨外场观测实验。
  cities: [xuchang, gongyi, luoyang, zhengzhou]
```

列表按首次出现的城市或行程分组，同组经历按填写顺序展示。保存并重新构建博客后，地图和文字列表会一起更新。

## URL compatibility

These existing public URLs are fixed explicitly in article front matter:

- `/others/2026/09/24/my-first-post.html`
- `/recording/2026/09/27/Recording1-26年9月回顾.html`

The second permalink deliberately keeps the old filename even though the Markdown source was renamed. Keep a published article's `permalink` when renaming its file or changing its category.

## Preview and publishing

The redesign is local until the intended changes are committed and pushed to the repository's existing GitHub Pages publishing source. Review existing article edits separately before publishing; do not include drafts accidentally. Keep the current Pages configuration. To roll back the visual update, revert only the redesign commit, preserving content commits.

## Visual checks

Check Home, Archive, About, a long post, and a short post at 375, 768, and 1440 pixels, in both color schemes. Verify theme persistence, keyboard focus, reduced motion, collapsed mobile contents, wide code/tables, and readable content without JavaScript.

The site follows the system color scheme until a visitor switches it. The preference is stored only in the browser as `cloud-notes-theme`. The site includes neither a comments system nor a search service.

## Pageview counters

[Busuanzi](https://busuanzi.ibruce.info/) supplies the total site pageviews in the footer and individual article pageviews beside the publication date. This is a third-party public counter, not a private analytics dashboard. The provider receives requests from readers' browsers, including the referring page URL, to identify the site and article. Counts depend on the provider's availability and counting rules, and do not recover visits from before integration.

- `_config.yml` enables the integration with `busuanzi.enabled: true`. Set it to `false` and rebuild to remove both the counters and their loader.
- Counters are included only when `JEKYLL_ENV=production`, as on GitHub Pages. The browser also checks that the current origin matches `site.url`, so locally previewed production builds do not contact the counter. Update `site.url` when moving the blog to a custom domain.
- Empty labels and their separators stay hidden until the service returns counts. With JavaScript disabled, blocked requests, or a service failure, the article remains readable without counters.
- Article counts belong to their public URLs; keep published URLs stable. Avoid putting sensitive information in page URLs, and do not set a site-wide referrer policy just for this integration: the official counter script sets the policy on its own collection request.

Validate a normal development build with `python scripts/verify_site.py --pageviews disabled`. To check the production markup locally without sending visits, build with `JEKYLL_ENV=production` and run `python scripts/verify_site.py --pageviews enabled`; the interaction checks use mocked requests and never contact Busuanzi. These checks do not verify the live service's availability.
