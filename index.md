---
layout: default
title: WELCOME
---

# Welcome ！

Helloooo，I'm Jiangshr。Welcome to my world.

Let's become a cloud together !

---

## Categories

- [Recording](#recording)
- [Working](#working)
- [Researching](#researching)
- [Thinking](#thinking)
- [All Articles](#all-posts)

---

## Most Recent

{% for post in site.posts limit:5 %}

### [{{ post.title }}]({{ post.url | relative_url }})

发布日期：{{ post.date | date: "%Y-%m-%d" }}

分类：{{ post.categories | join: "、" }}

[阅读全文 →]({{ post.url | relative_url }})

---

{% endfor %}

<a id="recording"></a>

## Recording

{% assign research_posts = site.categories["科研笔记"] %}

{% for post in research_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

<a id="working"></a>

## Working

{% assign programming_posts = site.categories["Working"] %}

{% for post in programming_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

<a id="researching"></a>

## Researching

{% assign programming_posts = site.categories["Researching"] %}

{% for post in programming_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

<a id="thinking"></a>

## Thinking

{% assign life_posts = site.categories["Thinking"] %}

{% for post in life_posts %}

- [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

<a id="all-posts"></a>

## All Articles

{% for post in site.posts %}

- {{ post.date | date: "%Y-%m-%d" }} · [{{ post.title }}]({{ post.url | relative_url }})

{% endfor %}

---

## About Me

Let's to be a cloud.

Casual~ Moving~ Variable~

It's all my clouds. I'm happy if one of them can bring you something.
