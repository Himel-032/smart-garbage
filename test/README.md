# Test Folder

This folder is reserved for tests only.

- `unit/` for isolated unit tests
- `integration/` for API / end-to-end style integration tests

You can place your test files here without touching the app source folders.

## Run

Unit tests:

```bash
node --test test/unit/*.test.mjs
```

Integration tests:

```bash
node --test test/integration/*.test.mjs
```

Run everything in `test/`:

```bash
node --test test/**/*.test.mjs
```
