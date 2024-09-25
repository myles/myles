import pytest
from feedparser import FeedParserDict

from .. import service


@pytest.mark.parametrize(
    "post_link, expected_url",
    (
        ("https://example.com/blog-post/", "https://example.com/blog-post/"),
        (
            "https://example.com/blog-post/?pk_campaign=rss-feed",
            "https://example.com/blog-post/",
        ),
    ),
)
def test_transform_blog_post(post_link, expected_url):
    post = FeedParserDict(
        {
            "title": "I Am A Blog Post Title",
            "link": post_link,
            "published_parsed": (2023, 1, 1, 1, 1, 1),
        }
    )

    result = service.transform_blog_post(post)
    assert result == {
        "url": expected_url,
        "emoji": "📝",
        "content": post["title"],
        "published": "1 Jan 2023, 1:01 AM",
    }


@pytest.mark.parametrize(
    "post_content_html, expected_content",
    (
        (
            '<p><a href="https://example.com/">Example Content HTML</a></p>',
            "Example Content HTML",
        ),
        ("<p>Example Content HTML</p>", "Example Content HTML"),
    ),
)
@pytest.mark.parametrize(
    "post_tags, expected_emoji",
    (
        (["Photography"], "📷"),
        ([], ""),
    ),
)
def test_transform_microblog_post(
    post_content_html, expected_content, post_tags, expected_emoji
):
    post = {
        "content_html": post_content_html,
        "tags": post_tags,
        "url": "https://exmaple.com/pizza/",
        "date_published": "2021-10-03T14:39:37-04:00",
    }
    expected_published = "3 Oct 2021, 2:39 PM"

    result = service.transform_microblog_post(post)
    assert result == {
        "url": post["url"],
        "emoji": expected_emoji,
        "content": expected_content,
        "published": expected_published,
    }


@pytest.mark.parametrize(
    "post, expected_result",
    (
        (
            {
                "url": "https://example.com/blog-post/",
                "emoji": "📝",
                "content": "I Am A Blog Post Title",
                "published": "1 Jan 2023, 1:01 AM",
            },
            (
                "-   [📝 I Am A Blog Post Title](https://example.com/blog-post/)"
                " — 1 Jan 2023, 1:01 AM"
            ),
        ),
        (
            {
                "url": "https://example.com/photograph-without-title/",
                "emoji": "📸",
                "content": "",
                "published": "1 Jan 2023, 1:01 AM",
            },
            (
                "-   [📸](https://example.com/photograph-without-title/)"
                " — 1 Jan 2023, 1:01 AM"
            ),
        ),
    ),
)
def test_format_post(post, expected_result):
    result = service.format_post(post)
    assert result == expected_result


@pytest.mark.parametrize(
    "content, marker, chunk, expected_result",
    (
        (
            "# Test\n<!-- START: BLOG_POSTS -->\n<!-- END: BLOG_POSTS -->",
            "BLOG_POSTS",
            "Hello, World!",
            "\n".join(
                [
                    "# Test",
                    "<!-- START: BLOG_POSTS -->",
                    "Hello, World!",
                    "<!-- END: BLOG_POSTS -->",
                ]
            ),
        ),
        (
            "# Test\n<!-- START: MICROBLOG_POSTS -->\n<!-- END: MICROBLOG_POSTS -->",
            "MICROBLOG_POSTS",
            "Hello, World!",
            "\n".join(
                [
                    "# Test",
                    "<!-- START: MICROBLOG_POSTS -->",
                    "Hello, World!",
                    "<!-- END: MICROBLOG_POSTS -->",
                ]
            ),
        ),
        (
            "\n".join(
                [
                    "# Test",
                    "<!-- START: MICROBLOG_POSTS -->",
                    "I'm the old contents.",
                    "<!-- END: MICROBLOG_POSTS -->",
                ]
            ),
            "MICROBLOG_POSTS",
            "I'm the new contents.",
            "\n".join(
                [
                    "# Test",
                    "<!-- START: MICROBLOG_POSTS -->",
                    "I'm the new contents.",
                    "<!-- END: MICROBLOG_POSTS -->",
                ],
            ),
        ),
    ),
)
def test_replace_chunk(content, marker, chunk, expected_result):
    result = service.replace_chunk(content=content, marker=marker, chunk=chunk)
    assert result == expected_result
