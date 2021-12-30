# tridoc-cockpit

Requires independent server: creates static files only.

Build with:
```sh
deno bundle --config deno.jsonc ./src/index.ts ./docs/index.js && cp ./src/static/* ./docs
```
