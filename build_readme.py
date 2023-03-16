import datetime
import re
from pathlib import Path
from typing import Any, Dict, List, Literal, TypedDict

import feedparser
import requests
from pyquery import PyQuery

ROOT_PATH = Path(__file__).resolve().parent
README_PATH = ROOT_PATH / "README.md"


class PostDict(TypedDict):
    url: str
    emoji: str
    content: str
    published: str


def get_blog_posts() -> List[feedparser.FeedParserDict]:
    """
    Get my blog posts.
    """
    feed = feedparser.parse('https://mylesbraithwaite.com/feed/')
    return feed.entries


def transform_blog_post(post: feedparser.FeedParserDict) -> PostDict:
    """
    Format my blog posts.
    """
    published = datetime.datetime(*post.published_parsed[:6]).strftime(
        "%-d %b %Y, %-I:%M %p"
    )

    return {
        'url': post.link,
        'emoji': '📝 ',
        'content': post.title,
        'published': published,
    }


def get_microblog_posts() -> List[Dict[str, Any]]:
    """
    Get my microblog posts.
    """
    response = requests.get("https://myles.social/feed.json", timeout=(5, 10))
    response.raise_for_status()
    return response.json()["items"]


def transform_microblog_post(post: Dict[str, Any]) -> PostDict:
    """
    Format my microblog posts.
    """
    query = PyQuery(post["content_html"])

    content = ""
    if first_paragraph_element := query("p:first"):
        first_paragraph_element = first_paragraph_element[0]
        content = first_paragraph_element.text

    emoji = ""
    if "Photography" in post.get("tags", []):
        emoji = "📷 "

    published = datetime.datetime.fromisoformat(post["date_published"]).strftime(
        "%-d %b %Y, %-I:%M %p"
    )

    return {
        "url": post["url"],
        "emoji": emoji,
        "content": content,
        "published": published,
    }


def format_post(post: PostDict) -> str:
    """
    Format a PostDict into a string.
    """
    return (
        f'-   {post["emoji"]}[{post["content"]}]({post["url"]}) — {post["published"]}'
    )


def replace_chunk(content: str, marker: Literal['MICROBLOG_POSTS', 'BLOG_POSTS'], chunk: str) -> str:
    """
    Replace the content with chunks between the markers.

    Adapted from: https://github.com/simonw/simonw/blob/04ebf2d061285f4353de8e9eeddf9f8f69641908/build_readme.py#L16
    """
    r = re.compile(
        r"<!\-\- START: {} \-\->.*<!\-\- END: {} \-\->".format(marker, marker),
        re.DOTALL,
    )

    chunk = "<!-- START: {} -->\n{}\n<!-- END: {} -->".format(marker, chunk, marker)
    return r.sub(chunk, content)


def build():
    with README_PATH.open("r") as file_obj:
        readme_content = file_obj.read()

    blog_posts = []
    remote_blog_posts = get_blog_posts()
    for post in remote_blog_posts[:5]:
        post = transform_blog_post(post)
        blog_posts.append(format_post(post))

    readme_content = replace_chunk(
        readme_content, marker='BLOG_POSTS', chunk="\n".join(blog_posts)
    )

    microblog_posts = []
    remote_microblog_posts = get_microblog_posts()
    for post in remote_microblog_posts[:5]:
        post = transform_microblog_post(post)
        microblog_posts.append(format_post(post))

    readme_content = replace_chunk(
        readme_content, marker='MICROBLOG_POSTS', chunk="\n".join(microblog_posts)
    )

    with README_PATH.open("w") as file_obj:
        file_obj.write(readme_content)
