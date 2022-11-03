# vuln-showcase

Project for showcasing common vulnerabilities on the web and written with
_fresh_ in _deno_.

## Clone

Clone the project onto your PC with:

```
git clone --recursive https://github.com/codefionn/vuln-showcase
```

## Usage

Start the project:

```
docker compose up
```

This will watch the project directory and restart as necessary.

This also starts up the testing suite.

## Vulnerabilities

- Search:
  - Search for private posts: `private') OR 1=1 OR ('' = '`
  - Read every post, when increasing/decreasing the number in the URL
- User:
  - Edit all posts, not just your own
