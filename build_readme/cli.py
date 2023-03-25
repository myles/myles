from pathlib import Path

import click

from . import service

ROOT_PATH = Path(__file__).resolve().parent.parent
README_PATH = ROOT_PATH / "README.md"


@click.command
def cli():
    """Build README.md"""
    with README_PATH.open("r") as file_obj:
        readme_content = file_obj.read()

    blog_posts = []
    remote_blog_posts = service.get_blog_posts()
    for post in remote_blog_posts[:5]:
        post = service.transform_blog_post(post)
        blog_posts.append(service.format_post(post))

    readme_content = service.replace_chunk(
        readme_content, marker="BLOG_POSTS", chunk="\n".join(blog_posts)
    )

    microblog_posts = []
    remote_microblog_posts = service.get_microblog_posts()
    for post in remote_microblog_posts[:5]:
        post = service.transform_microblog_post(post)
        microblog_posts.append(service.format_post(post))

    readme_content = service.replace_chunk(
        readme_content, marker="MICROBLOG_POSTS", chunk="\n".join(microblog_posts)
    )

    with README_PATH.open("w") as file_obj:
        file_obj.write(readme_content)
