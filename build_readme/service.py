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


def get_garden_posts() -> List[Dict[str, Any]]:
    """
    Get myles' garden posts.
    """
    response = requests.get("https://myles.garden/feed.json", timeout=(5, 10))
    response.raise_for_status()
    return response.json()["items"]


def transform_garden_post(post: Dict[str, Any]) -> PostDict:
    """
    Format myles' garden note post.
    """
    query = PyQuery(post["content_html"])

    content = ""
    if first_paragraph_element := query("p:first"):
        content = first_paragraph_element.text().strip()

    published = datetime.datetime.fromisoformat(post["date_published"]).strftime(
        "%-d %b %Y, %-I:%M %p"
    )

    return {
        "url": post["url"],
        "emoji": "📝",
        "content": content,
        "published": published,
    }


def format_post(post: PostDict) -> str:
    """
    Format a PostDict into a string.
    """
    space_after_emoji = " " if post["emoji"] and post["content"] else ""

    return (
        f'-   [{post["emoji"]}{space_after_emoji}{post["content"]}]({post["url"]})'
        f' — {post["published"]}'
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
