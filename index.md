
---
layout: default
title: 首页
---

# 你好，欢迎来到我的个人博客！

我是 Jiangshr。

这里是我的个人知识空间。

我希望通过这个网站，记录自己的学习经历、科研心得、编程技术以及生活中的思考。

---

## 文章分类

- [科研笔记](#research)
- [编程技术](#programming)
- [生活随笔](#life)
- [全部文章](#all-posts)

---

## 最新文章

{% assign latest_posts = site.posts | limit: 5 %}

{% for post in latest_posts %}

### [{{ post.title }}]({{ post.url | relative_url }})

发布日期：{{ post.date | date: "%Y-%m-%d" }}

{{ post.excerpt | strip_html | truncate: 120 }}

[阅读全文 →]({{ post.url | relative_url }})

---

{% endfor %}

## 科研笔记 {#research}

{% assign research_posts = site.categories["科研笔记"] %}

{% for post in research_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

## 编程技术 {#programming}

{% assign programming_posts = site.categories["编程技术"] %}

{% for post in programming_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

## 生活随笔 {#life}

{% assign life_posts = site.categories["生活随笔"] %}

{% for post in life_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

## 全部文章 {#all-posts}

{% for post in site.posts %}

- {{ post.date | date: "%Y-%m-%d" }} · [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

---

## 关于我


[首页]({{ '/' | relative_url }}) · [关于我]({{ '/about/' | relative_url }})

欢迎来到我的个人博客！

这里主要分享科研学习、编程技术和生活中的思考。
