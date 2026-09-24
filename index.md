---
layout: default
title: 首页
---

# 欢迎来到我的个人博客！

你好，我是 Jiangshr。

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

{% for post in site.posts limit:5 %}

### [{{ post.title }}]({{ post.url | relative_url }})

发布日期：{{ post.date | date: "%Y-%m-%d" }}

分类：{{ post.categories | join: "、" }}

[阅读全文 →]({{ post.url | relative_url }})

---

{% endfor %}

<a id="research"></a>

## 科研笔记

{% assign research_posts = site.categories["科研笔记"] %}

{% for post in research_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

<a id="programming"></a>

## 编程技术

{% assign programming_posts = site.categories["编程技术"] %}

{% for post in programming_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

<a id="life"></a>

## 生活随笔

{% assign life_posts = site.categories["生活随笔"] %}

{% for post in life_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

<a id="all-posts"></a>

## 全部文章

{% for post in site.posts %}

- {{ post.date | date: "%Y-%m-%d" }} · [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

---

## 关于我

欢迎来到我的个人博客！

这里主要分享科研学习、编程技术和生活中的思考。
