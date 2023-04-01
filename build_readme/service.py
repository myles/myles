import datetime
import re
from typing import Any, Dict, List, Literal, TypedDict
from urllib.parse import parse_qs, urlencode, urlparse

import feedparser
import pytz
import requests
from pyquery import PyQuery


class PostDict(TypedDict):
    url: str
    emoji: str
    content: str
    published: str


def get_blog_posts() -> List[feedparser.FeedParserDict]:
    """
    Get my blog posts.
    """
    feed = feedparser.parse("https://mylesbraithwaite.com/feed/")
    return feed.entries


def transform_blog_post(post: feedparser.FeedParserDict) -> PostDict:
    """
    Format my blog posts.
    """
    link = urlparse(post.link)

    link_params = parse_qs(link.query)
    link_params.pop("pk_campaign", None)  # type: ignore

    link = link._replace(query=urlencode(link_params))

    published = datetime.datetime(*post.published_parsed[:6]).strftime(
        "%-d %b %Y, %-I:%M %p"
    )

    return {
        "url": str(link.geturl()),
        "emoji": "📝 ",
        "content": post.title,
        "published": published,
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
        content = first_paragraph_element.text()

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


def format_last_updated_at() -> str:
    """
    Format the last updated at timestamp.
    """
    tz = pytz.timezone("America/Toronto")
    now_in_tz = tz.localize(datetime.datetime.utcnow())
    return f'Last updated on: {now_in_tz.strftime("%-d %B %Y")}'


def replace_chunk(
    content: str,
    marker: Literal["MICROBLOG_POSTS", "BLOG_POSTS", "LAST_UPDATED_AT"],
    chunk: str,
) -> str:
    """
    Replace the content with chunks between the markers.

    Adapted from Simon Willison's `replace_chunk` function:
    https://github.com/simonw/simonw/blob/04ebf2d061285f4353de8e9eeddf9f8f69641908/build_readme.py#L16
    """
    r = re.compile(
        r"<!\-\- START: {} \-\->.*<!\-\- END: {} \-\->".format(marker, marker),
        re.DOTALL,
    )

    chunk = "<!-- START: {} -->\n{}\n<!-- END: {} -->".format(marker, chunk, marker)
    return r.sub(chunk, content)
