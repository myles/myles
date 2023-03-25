.PHONY: all
all: clean setup test lint build

.PHONY: build
build: README.md
	poetry run build-readme

.PHONY: setup
setup: pyproject.toml
	poetry check
	poetry install

.PHONY: test
test:
	poetry run pytest

.PHONY: lint
lint:
	poetry run black --check .
	poetry run isort --check .
	poetry run ruff check .

.PHONY: lintfix
lintfix:
	poetry run black .
	poetry run isort .
	poetry run ruff check . --fix

.PHONY: clean
clean:
	rm -fr ./.mypy_cache
	rm -fr ./.pytest_cache
	rm -fr ./.ruff_cache
	rm -fr ./dist
	rm -f .coverage
	rm -f coverage.xml
	find . -type f -name '*.py[co]' -delete -o -type d -name __pycache__ -delete
