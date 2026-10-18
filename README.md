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

- Categories: `Recording`, `Thinking`, `Working`, `Researching`, plus historical `Others`.
- Historical `Talking` posts appear under `Thinking` without changing their category or URL.
- Optional `display_title` overrides the visible title consistently in lists, articles, and RSS, while keeping the original `title` field.
- Optional `description` supplies the summary; otherwise the first prose paragraph is used.
- Category descriptions and icons live in `_data/categories.yml`; site identity is in `_config.yml`.
- Drafts stay in `Undone/`, which is excluded from the build. Posts dated in the future and posts with `published: false` are excluded too. Do not use `--drafts`, `--future`, or `--unpublished` for production builds.

## URL compatibility

These existing public URLs are fixed explicitly in article front matter:

- `/others/2026/09/24/my-first-post.html`
- `/recording/2026/09/27/Recording1-26年9月回顾.html`

The second permalink deliberately keeps the old filename even though the Markdown source was renamed. Keep a published article's `permalink` when renaming its file or changing its category.

## Preview and publishing

The redesign is local until the intended changes are committed and pushed to the repository's existing GitHub Pages publishing source. Review existing article edits separately before publishing; do not include drafts accidentally. Keep the current Pages configuration. To roll back the visual update, revert only the redesign commit, preserving content commits.

## Visual checks

Check Home, Archive, About, a long post, and a short post at 375, 768, and 1440 pixels, in both color schemes. Verify theme persistence, keyboard focus, reduced motion, collapsed mobile contents, wide code/tables, and readable content without JavaScript.

The site follows the system color scheme until a visitor switches it. The preference is stored only in the browser as `cloud-notes-theme`. No analytics, cookies, comments, search service, or third-party runtime is included.
