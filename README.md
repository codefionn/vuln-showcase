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

The main webserver is started on `localhost:8000`, the mail server interface on
`localhost:1080`.

This also starts up the testing suite.

### Accounts

- Login `john.doe@mailer`: Password test
- Login `jane.doe@mailer`: Password test

## Vulnerabilities

- Posts:
  - Posts are rendered as HTML => XSS injection possible
- Search:
  - Search for private posts: `private') OR 1=1 OR ('' = '`
  - Read every post, when increasing/decreasing the number in the URL
- User:
  - Edit all posts, not just your own (increasing/decreasing number in the URL)
- Possibility to guess passwords via hash or JWT signature (though this is kinda
  hard)
- Guess if a login (E-Mail) exists (time-based attack)
