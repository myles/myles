from pathlib import Path

import click

from . import service

ROOT_PATH = Path(__file__).resolve().parent.parent
README_PATH = ROOT_PATH / "README.md"


@click.command
@click.option("--force", "-f", is_flag=True)
def cli(force: bool = False):
    """Build README.md"""
    with README_PATH.open("r") as file_obj:
        readme_content = file_obj.read()

    org_readme_content = readme_content

    garden_posts = []
    remote_article_posts = service.get_garden_posts()
    for post in remote_article_posts[:5]:
        post = service.transform_garden_post(post)
        garden_posts.append(service.format_post(post))

    readme_content = service.replace_chunk(
        readme_content, marker="GARDEN_POSTS", chunk="\n".join(garden_posts)
    )

    if org_readme_content == readme_content and force is False:
        click.echo("No new changes to the README file.")
        return

    readme_content = service.replace_chunk(
        readme_content, marker="LAST_UPDATED_AT", chunk=service.format_last_updated_at()
    )

    with README_PATH.open("w") as file_obj:
        file_obj.write(readme_content)

    click.echo("Updated the README file.")
