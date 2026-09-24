---
layout: default
title: 首页
---

# 欢迎来到我的个人博客！

你好，我是 Jiangshr。

这里是我的个人知识空间。我希望通过这个网站，记录自己的学习经历、科研心得、编程技术以及生活中的思考。

---

## 最新文章

{% for post in site.posts limit:5 %}

### [{{ post.title }}]({{ post.url | relative_url }})

发布日期：{{ post.date | date: "%Y-%m-%d" }}

[阅读全文 →]({{ post.url | relative_url }})

{% endfor %}

---

## 全部文章

{% for post in site.posts %}

- {{ post.date | date: "%Y-%m-%d" }} · [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

---

## 关于我

欢迎来到我的个人博客！

这里主要分享科研学习、编程技术和生活中的思考。
